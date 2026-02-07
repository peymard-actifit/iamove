import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Les 25 langues cibles (sans FR qui est la source)
const TARGET_LANGUAGES = [
  "EN", "DE", "ES", "IT", "PT", "NL", "PL", "RU", "JA", "ZH",
  "KO", "AR", "TR", "SV", "DA", "FI", "NO", "CS", "EL", "HU",
  "RO", "SK", "UK", "BG", "HR"
];

// Traduction via DeepL
async function translateText(text: string, targetLang: string): Promise<string> {
  if (!process.env.DEEPL_API_KEY || !text || text.trim() === "") return text;

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
    console.error(`[ensure-translations] Erreur ${targetLang}:`, error);
  }
  return text;
}

// POST - Traduit automatiquement toutes les questions sans traduction
// Cette API est appelée automatiquement et tourne en arrière-plan
export async function POST() {
  const startTime = Date.now();
  
  try {
    // Trouver TOUTES les questions sans traduction complète
    const allQuizzes = await prisma.quiz.findMany({
      include: {
        translations: {
          select: { language: true, question: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    let translationsCreated = 0;
    let quizzesProcessed = 0;

    for (const quiz of allQuizzes) {
      const existingLangs = quiz.translations.map(t => t.language);
      const missingLangs = TARGET_LANGUAGES.filter(lang => !existingLangs.includes(lang));

      // Vérifier aussi les traductions qui sont identiques au français (non traduites)
      const untranslatedLangs = quiz.translations
        .filter(t => t.language !== "FR" && t.question === quiz.question)
        .map(t => t.language);

      const langsToTranslate = [...new Set([...missingLangs, ...untranslatedLangs])];

      if (langsToTranslate.length === 0) continue;

      quizzesProcessed++;

      for (const lang of langsToTranslate) {
        const translatedQuestion = await translateText(quiz.question, lang);
        
        // Ne pas sauvegarder si la traduction est identique (échec DeepL)
        if (translatedQuestion === quiz.question) continue;

        const originalAnswers = quiz.answers as Array<{ text: string; isCorrect: boolean }>;
        const translatedAnswers = [];

        for (const ans of originalAnswers) {
          const translatedText = await translateText(ans.text, lang);
          translatedAnswers.push({ text: translatedText, isCorrect: ans.isCorrect });
        }

        await prisma.quizTranslation.upsert({
          where: {
            quizId_language: { quizId: quiz.id, language: lang },
          },
          update: {
            question: translatedQuestion,
            answers: translatedAnswers,
          },
          create: {
            quizId: quiz.id,
            language: lang,
            question: translatedQuestion,
            answers: translatedAnswers,
          },
        });

        translationsCreated++;
      }
    }

    return NextResponse.json({
      success: true,
      quizzesProcessed,
      translationsCreated,
      duration: Date.now() - startTime,
    });
  } catch (error) {
    console.error("[ensure-translations] Erreur:", error);
    return NextResponse.json(
      { error: String(error), duration: Date.now() - startTime },
      { status: 500 }
    );
  }
}

// GET - Vérifie s'il y a des traductions manquantes
export async function GET() {
  try {
    const totalQuizzes = await prisma.quiz.count();
    const totalTranslations = await prisma.quizTranslation.count();
    const expectedTranslations = totalQuizzes * TARGET_LANGUAGES.length;
    const missingCount = expectedTranslations - totalTranslations;

    return NextResponse.json({
      totalQuizzes,
      totalTranslations,
      expectedTranslations,
      missingCount,
      isComplete: missingCount <= 0,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
