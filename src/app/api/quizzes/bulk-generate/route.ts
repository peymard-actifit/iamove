import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import levelsData from "@/data/levels.json";

// Structure des niveaux pour l'API
interface LevelInfo {
  number: number;
  name: string;
  category: string;
  seriousGaming: string;
  description: string;
}
const LEVELS: LevelInfo[] = levelsData.levels;

// Les 26 langues supportées
const SUPPORTED_LANGUAGES = [
  "FR", "EN", "DE", "ES", "IT", "PT", "NL", "PL", "RU", "JA", "ZH", "KO",
  "AR", "TR", "SV", "DA", "FI", "NO", "CS", "EL", "HU", "RO", "SK", "BG", "UK", "ID"
];

// Traduction via DeepL
async function translateText(text: string, targetLang: string): Promise<string> {
  if (!process.env.DEEPL_API_KEY || targetLang === "FR") return text;
  
  try {
    const response = await fetch("https://api.deepl.com/v2/translate", {
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

// Générer des questions avec OpenAI - version optimisée pour lots
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

Génère exactement ${count} question(s) de quiz VARIÉES et UNIQUES en français adaptée(s) à ce niveau.
Les questions doivent couvrir différents aspects de la catégorie "${levelInfo.category}".

Chaque question doit:
- Être pertinente pour le niveau (${levelInfo.category})
- Avoir entre 2 et 4 réponses possibles
- Avoir au moins une bonne réponse (marquée avec isCorrect: true)
- Être formulée clairement
- Tester des connaissances DIFFÉRENTES des autres questions

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
      temperature: 0.9, // Plus de variété
      max_tokens: 4000,
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

// GET - Obtenir les statistiques par niveau
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get("key");
    
    // Vérifier la clé API de maintenance
    if (apiKey !== process.env.MAINTENANCE_KEY) {
      return NextResponse.json({ error: "Clé API invalide" }, { status: 401 });
    }

    // Récupérer tous les niveaux avec leur nombre de questions
    const levels = await prisma.level.findMany({
      where: { number: { gte: 1, lte: 20 } },
      orderBy: { number: "asc" },
      include: {
        _count: {
          select: { quizzes: true }
        }
      }
    });

    const stats = levels.map(level => ({
      number: level.number,
      name: level.name,
      currentCount: level._count.quizzes,
      target: 120,
      missing: Math.max(0, 120 - level._count.quizzes),
    }));

    const totalCurrent = stats.reduce((sum, s) => sum + s.currentCount, 0);
    const totalMissing = stats.reduce((sum, s) => sum + s.missing, 0);

    return NextResponse.json({
      stats,
      summary: {
        totalCurrent,
        totalTarget: 2400,
        totalMissing,
        percentComplete: Math.round((totalCurrent / 2400) * 100),
      }
    });
  } catch (error) {
    console.error("[bulk-generate] Erreur GET:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// POST - Générer des questions en lot pour un niveau spécifique
export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get("key");
    
    // Vérifier soit la clé API de maintenance, soit la session admin
    let session = null;
    if (apiKey === process.env.MAINTENANCE_KEY) {
      console.log("[bulk-generate] Authentification par clé API");
    } else {
      session = await getSession();
      if (!session || session.role !== "ADMIN") {
        return NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 });
      }
    }

    const body = await request.json();
    const { levelNumber, count = 10, withTranslations = true } = body;

    if (!levelNumber || levelNumber < 1 || levelNumber > 20) {
      return NextResponse.json({ error: "Niveau invalide (1-20)" }, { status: 400 });
    }

    if (count < 1 || count > 20) {
      return NextResponse.json({ error: "Nombre de questions invalide (1-20)" }, { status: 400 });
    }

    // Trouver le niveau en base
    const level = await prisma.level.findFirst({
      where: { number: levelNumber },
    });

    if (!level) {
      return NextResponse.json({ error: `Niveau ${levelNumber} non trouvé` }, { status: 404 });
    }

    // Trouver un admin pour createdById
    const admin = await prisma.studioUser.findFirst({ where: { role: "ADMIN" } });
    if (!admin) {
      return NextResponse.json({ error: "Aucun admin trouvé" }, { status: 500 });
    }

    console.log(`[bulk-generate] Génération de ${count} questions pour niveau ${levelNumber}...`);

    // Générer les questions avec l'IA
    const generatedQuestions = await generateQuestionsWithAI(levelNumber, count);
    console.log(`[bulk-generate] ${generatedQuestions.length} questions générées`);

    const createdQuizzes = [];

    // Créer chaque question
    for (const q of generatedQuestions) {
      const quiz = await prisma.quiz.create({
        data: {
          question: q.question,
          answers: q.answers,
          levelId: level.id,
          isActive: true,
          createdById: admin.id,
        },
      });

      // Créer la traduction FR
      await prisma.quizTranslation.create({
        data: {
          quizId: quiz.id,
          language: "FR",
          question: q.question,
          answers: q.answers,
        },
      });

      // Lancer les traductions en arrière-plan (ne pas bloquer)
      if (withTranslations) {
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
              console.error(`Erreur traduction ${lang} pour quiz ${quiz.id}:`, error);
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
        translateInBackground().catch(e => console.error("[bulk-generate] Erreur traduction bg:", e));
      }

      createdQuizzes.push({
        id: quiz.id,
        question: quiz.question.substring(0, 50) + "...",
      });
    }

    // Compter le nouveau total
    const newCount = await prisma.quiz.count({
      where: { levelId: level.id }
    });

    return NextResponse.json({
      success: true,
      levelNumber,
      created: createdQuizzes.length,
      newTotal: newCount,
      target: 120,
      remaining: Math.max(0, 120 - newCount),
    });
  } catch (error) {
    console.error("[bulk-generate] Erreur POST:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
