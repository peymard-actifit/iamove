import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LEVELS } from "@/lib/levels";

// Les 26 langues supportées
const SUPPORTED_LANGUAGES = [
  "FR", "EN", "DE", "ES", "IT", "PT", "NL", "PL", "RU", "JA", "ZH", "KO",
  "AR", "TR", "SV", "DA", "FI", "NO", "CS", "EL", "HU", "RO", "SK", "BG", "UK", "ID"
];

// Traduction via DeepL
async function translateText(text: string, targetLang: string): Promise<string> {
  if (!process.env.DEEPL_API_KEY || targetLang === "FR") return text;
  
  try {
    const response = await fetch("https://api-free.deepl.com/v2/translate", {
      method: "POST",
      headers: {
        "Authorization": `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: [text],
        source_lang: "FR",
        target_lang: targetLang === "EN" ? "EN-US" : targetLang,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.translations[0]?.text || text;
    }
  } catch (error) {
    console.error(`Erreur traduction ${targetLang}:`, error);
  }
  return text;
}

// Générer des questions avec OpenAI
async function generateQuestionsWithAI(levelNumber: number, count: number): Promise<Array<{
  question: string;
  answers: Array<{ text: string; isCorrect: boolean }>;
}>> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY non configurée");
  }

  const levelInfo = LEVELS.find(l => l.number === levelNumber);
  if (!levelInfo) {
    throw new Error(`Niveau ${levelNumber} non trouvé`);
  }

  const prompt = `Tu es un expert en Intelligence Artificielle et tu dois créer des questions de quiz pour évaluer les connaissances en IA.

Niveau cible: ${levelNumber} - ${levelInfo.name}
Catégorie: ${levelInfo.category}
Description du niveau: ${levelInfo.description}
Compétence gaming: ${levelInfo.seriousGaming}

Génère exactement ${count} question(s) de quiz en français adaptée(s) à ce niveau.

Chaque question doit:
- Être pertinente pour le niveau (${levelInfo.category})
- Avoir entre 2 et 4 réponses possibles
- Avoir au moins une bonne réponse (marquée avec isCorrect: true)
- Être formulée clairement
- Tester les connaissances correspondant au niveau

Réponds UNIQUEMENT avec un tableau JSON valide, sans markdown, sans explication, juste le JSON:
[
  {
    "question": "La question ici ?",
    "answers": [
      {"text": "Réponse 1", "isCorrect": true},
      {"text": "Réponse 2", "isCorrect": false},
      {"text": "Réponse 3", "isCorrect": false}
    ]
  }
]`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Tu génères des questions de quiz sur l'IA en JSON. Réponds uniquement avec du JSON valide, sans markdown." },
        { role: "user", content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur OpenAI: ${error}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("Réponse OpenAI vide");
  }

  // Parser le JSON (enlever les backticks markdown si présents)
  let jsonContent = content;
  if (jsonContent.startsWith("```")) {
    jsonContent = jsonContent.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
  }

  try {
    const questions = JSON.parse(jsonContent);
    return questions;
  } catch (e) {
    console.error("Erreur parsing JSON OpenAI:", content);
    throw new Error(`Erreur parsing JSON: ${e}`);
  }
}

export async function POST(request: Request) {
  console.log("[generate] Début de la requête");
  
  try {
    const session = await getSession();
    console.log("[generate] Session:", session ? "OK" : "null", session?.role);
    
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { levelNumber, count = 1 } = body;
    console.log("[generate] Params:", { levelNumber, count });

    if (!levelNumber || levelNumber < 1 || levelNumber > 20) {
      return NextResponse.json({ error: "Niveau invalide (1-20)" }, { status: 400 });
    }

    if (count < 1 || count > 10) {
      return NextResponse.json({ error: "Nombre de questions invalide (1-10)" }, { status: 400 });
    }

    // Trouver le niveau dans la base
    const level = await prisma.level.findFirst({
      where: { number: levelNumber },
    });

    if (!level) {
      return NextResponse.json({ error: "Niveau non trouvé en base" }, { status: 404 });
    }

    // Générer les questions avec l'IA
    console.log(`[generate] Génération de ${count} question(s) pour le niveau ${levelNumber}...`);
    
    let generatedQuestions;
    try {
      generatedQuestions = await generateQuestionsWithAI(levelNumber, count);
      console.log(`[generate] Questions générées:`, generatedQuestions.length);
    } catch (aiError) {
      console.error("[generate] Erreur IA:", aiError);
      return NextResponse.json({ error: `Erreur IA: ${aiError}` }, { status: 500 });
    }

    const createdQuizzes = [];

    // Créer chaque question et ses traductions
    for (const q of generatedQuestions) {
      // Créer le quiz
      const quiz = await prisma.quiz.create({
        data: {
          question: q.question,
          answers: q.answers,
          levelId: level.id,
          isActive: true,
          createdById: session.userId,
        },
      });

      // Créer d'abord la traduction FR (obligatoire)
      await prisma.quizTranslation.create({
        data: {
          quizId: quiz.id,
          language: "FR",
          question: q.question,
          answers: q.answers,
        },
      });

      // Créer les traductions dans les autres langues (en arrière-plan, sans bloquer)
      // On fait cela en async pour ne pas timeout
      const translateInBackground = async () => {
        for (const lang of SUPPORTED_LANGUAGES) {
          if (lang === "FR") continue;
          try {
            const translatedQuestion = await translateText(q.question, lang);
            const translatedAnswers = [];
            
            for (const ans of q.answers) {
              const translatedText = await translateText(ans.text, lang);
              translatedAnswers.push({
                text: translatedText,
                isCorrect: ans.isCorrect,
              });
            }

            await prisma.quizTranslation.create({
              data: {
                quizId: quiz.id,
                language: lang,
                question: translatedQuestion,
                answers: translatedAnswers,
              },
            });
          } catch (error) {
            console.error(`Erreur traduction ${lang}:`, error);
            // Créer avec texte original si erreur
            await prisma.quizTranslation.create({
              data: {
                quizId: quiz.id,
                language: lang,
                question: q.question,
                answers: q.answers,
              },
            });
          }
        }
      };
      
      // Lancer la traduction en arrière-plan (ne pas attendre)
      translateInBackground().catch(e => console.error("[generate] Erreur traduction bg:", e));

      createdQuizzes.push({
        id: quiz.id,
        question: quiz.question,
      });
    }

    console.log(`[generate] ${createdQuizzes.length} question(s) créée(s)`);

    return NextResponse.json({
      success: true,
      created: createdQuizzes.length,
      questions: createdQuizzes,
    });
  } catch (error) {
    console.error("Erreur génération questions:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: "/api/quizzes/generate",
    method: "POST",
    params: {
      levelNumber: "number (1-20)",
      count: "number (1-10, default: 1)",
    },
    description: "Génère des questions de quiz avec l'IA et les traduit en 26 langues",
  });
}
