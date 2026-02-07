import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TARGET_LANGUAGES, getDeepLLanguageCode } from "@/lib/deepl";

// Traduction via DeepL avec retry
async function translateTextWithRetry(text: string, targetLang: string, retries = 3): Promise<string | null> {
  if (!process.env.DEEPL_API_KEY || !text || text.trim() === "") return null;

  for (let attempt = 0; attempt < retries; attempt++) {
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
          target_lang: getDeepLLanguageCode(targetLang),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const translated = data.translations[0]?.text;
        if (translated && translated !== text) {
          return translated;
        }
        return null; // Traduction identique = pas traduit
      }

      // Rate limit - attendre avant de réessayer
      if (response.status === 429) {
        await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
        continue;
      }

      // Autre erreur - log et continuer
      console.error(`[ensure-translations] DeepL ${response.status} pour ${targetLang}`);
    } catch (error) {
      console.error(`[ensure-translations] Erreur ${targetLang}:`, error);
      if (attempt < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }
  return null;
}

// POST - Traduit un batch de questions sans traduction
// Appelée automatiquement et progressivement
export async function POST() {
  const startTime = Date.now();
  const maxDuration = 50000; // 50 secondes max (Vercel timeout à 60s)
  
  try {
    // Trouver directement les questions avec moins de 25 traductions
    // Utilise une sous-requête pour compter les traductions
    const quizzesWithTranslations = await prisma.quiz.findMany({
      include: {
        translations: {
          select: { language: true, question: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Filtrer celles qui ont besoin de traduction (moins de 25 traductions ou traductions identiques au français)
    const allQuizzesToTranslate = quizzesWithTranslations.filter(quiz => {
      const existingLangs = quiz.translations.map(t => t.language);
      const missingLangs = TARGET_LANGUAGES.filter(lang => !existingLangs.includes(lang));
      const untranslatedLangs = quiz.translations
        .filter(t => t.language !== "FR" && t.question === quiz.question)
        .map(t => t.language);
      return missingLangs.length > 0 || untranslatedLangs.length > 0;
    });
    
    const quizzesToTranslate = allQuizzesToTranslate.slice(0, 10); // Traiter 10 questions par appel

    let translationsCreated = 0;
    let quizzesProcessed = 0;

    for (const quiz of quizzesToTranslate) {
      if (Date.now() - startTime > maxDuration) break;

      const existingLangs = quiz.translations.map(t => t.language);
      const missingLangs = TARGET_LANGUAGES.filter(lang => !existingLangs.includes(lang));
      const untranslatedLangs = quiz.translations
        .filter(t => t.language !== "FR" && t.question === quiz.question)
        .map(t => t.language);
      const langsToTranslate = [...new Set([...missingLangs, ...untranslatedLangs])];

      if (langsToTranslate.length === 0) continue;

      quizzesProcessed++;

      for (const lang of langsToTranslate) {
        if (Date.now() - startTime > maxDuration) break;

        const translatedQuestion = await translateTextWithRetry(quiz.question, lang);
        
        // Passer à la langue suivante si la traduction a échoué
        if (!translatedQuestion) continue;

        const originalAnswers = quiz.answers as Array<{ text: string; isCorrect: boolean }>;
        const translatedAnswers = [];

        for (const ans of originalAnswers) {
          const translatedText = await translateTextWithRetry(ans.text, lang);
          // Si une réponse échoue, utiliser l'original pour cette réponse
          translatedAnswers.push({ 
            text: translatedText || ans.text, 
            isCorrect: ans.isCorrect 
          });
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
      hasMore: allQuizzesToTranslate.length > quizzesToTranslate.length || (quizzesToTranslate.length > 0 && translationsCreated > 0),
      remaining: allQuizzesToTranslate.length,
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
