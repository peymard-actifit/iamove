import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    } else {
      console.error(`DeepL error for ${targetLang}:`, await response.text());
    }
  } catch (error) {
    console.error(`Erreur traduction ${targetLang}:`, error);
  }
  return text;
}

// GET: Vérifier le statut des traductions
export async function GET() {
  try {
    // Compter les traductions qui sont identiques à la question originale
    const quizzes = await prisma.quiz.findMany({
      include: { translations: true },
      take: 10,
    });

    const stats = {
      quizzesChecked: quizzes.length,
      translationsNotDone: 0,
      translationsDone: 0,
      examples: [] as Array<{ lang: string; original: string; translated: string }>,
    };

    for (const quiz of quizzes) {
      for (const trans of quiz.translations) {
        if (trans.language !== "FR") {
          if (trans.question === quiz.question) {
            stats.translationsNotDone++;
            if (stats.examples.length < 3) {
              stats.examples.push({
                lang: trans.language,
                original: quiz.question.substring(0, 50),
                translated: trans.question.substring(0, 50),
              });
            }
          } else {
            stats.translationsDone++;
          }
        }
      }
    }

    return NextResponse.json({
      status: "ok",
      stats,
      message: stats.translationsNotDone > 0 
        ? "Certaines traductions n'ont pas été faites. Utilisez POST pour les relancer."
        : "Toutes les traductions sont OK",
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// POST: Relancer les traductions pour un batch de questions
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const batch = parseInt(searchParams.get("batch") || "0");
    const batchSize = 5; // 5 questions à la fois pour éviter timeout
    const lang = searchParams.get("lang"); // Langue spécifique ou toutes

    // Récupérer les questions à retraduire
    const quizzes = await prisma.quiz.findMany({
      skip: batch * batchSize,
      take: batchSize,
      orderBy: { createdAt: "asc" },
    });

    if (quizzes.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Toutes les questions ont été traitées",
        batch,
        processed: 0,
      });
    }

    const results = [];
    const langsToProcess = lang ? [lang] : SUPPORTED_LANGUAGES.filter(l => l !== "FR");

    for (const quiz of quizzes) {
      for (const targetLang of langsToProcess) {
        // Traduire la question
        const translatedQuestion = await translateText(quiz.question, targetLang);
        
        // Traduire les réponses
        const originalAnswers = quiz.answers as Array<{ text: string; isCorrect: boolean }>;
        const translatedAnswers = [];
        
        for (const ans of originalAnswers) {
          const translatedText = await translateText(ans.text, targetLang);
          translatedAnswers.push({
            text: translatedText,
            isCorrect: ans.isCorrect,
          });
        }

        // Mettre à jour ou créer la traduction
        await prisma.quizTranslation.upsert({
          where: {
            quizId_language: {
              quizId: quiz.id,
              language: targetLang,
            },
          },
          update: {
            question: translatedQuestion,
            answers: translatedAnswers,
          },
          create: {
            quizId: quiz.id,
            language: targetLang,
            question: translatedQuestion,
            answers: translatedAnswers,
          },
        });

        results.push({
          quizId: quiz.id,
          lang: targetLang,
          translated: translatedQuestion !== quiz.question,
        });
      }
    }

    return NextResponse.json({
      success: true,
      batch,
      processed: quizzes.length,
      translations: results.length,
      nextBatch: batch + 1,
      message: `${quizzes.length} questions traduites. Appelez POST?batch=${batch + 1} pour continuer.`,
    });
  } catch (error) {
    console.error("Erreur retraduction:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
