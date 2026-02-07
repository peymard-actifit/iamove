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
    console.error(`[cron] Erreur traduction ${targetLang}:`, error);
  }
  return text;
}

// GET handler pour le cron job Vercel
export async function GET(request: Request) {
  // Vérifier que c'est bien Vercel qui appelle
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // En développement ou si pas de secret, vérifier la clé de maintenance
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    if (key !== process.env.MAINTENANCE_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const startTime = Date.now();
  const maxDuration = 55000; // 55 secondes max (Vercel timeout à 60s)

  try {
    // Trouver les questions qui n'ont pas toutes leurs traductions
    const quizzesWithMissingTranslations = await prisma.quiz.findMany({
      where: {
        translations: {
          none: {
            language: {
              in: TARGET_LANGUAGES,
            },
          },
        },
      },
      take: 10, // 10 questions par exécution (avec 25 langues = 250 traductions max)
      orderBy: { createdAt: "asc" },
    });

    if (quizzesWithMissingTranslations.length === 0) {
      // Chercher les questions avec traductions partielles
      const quizzesWithPartialTranslations = await prisma.quiz.findMany({
        include: {
          translations: {
            select: { language: true },
          },
        },
        take: 100,
        orderBy: { createdAt: "asc" },
      });

      // Filtrer ceux qui n'ont pas toutes les langues
      const needsMore = quizzesWithPartialTranslations.filter(q => {
        const existingLangs = q.translations.map(t => t.language);
        return TARGET_LANGUAGES.some(lang => !existingLangs.includes(lang));
      });

      if (needsMore.length === 0) {
        return NextResponse.json({
          success: true,
          message: "Toutes les questions sont traduites",
          processed: 0,
        });
      }

      // Traiter les questions avec traductions partielles
      let translationsCreated = 0;

      for (const quiz of needsMore.slice(0, 5)) {
        if (Date.now() - startTime > maxDuration) break;

        const existingLangs = quiz.translations.map(t => t.language);
        const missingLangs = TARGET_LANGUAGES.filter(lang => !existingLangs.includes(lang));

        for (const lang of missingLangs) {
          if (Date.now() - startTime > maxDuration) break;

          const translatedQuestion = await translateText(quiz.question, lang);
          const originalAnswers = quiz.answers as Array<{ text: string; isCorrect: boolean }>;
          const translatedAnswers = [];

          for (const ans of originalAnswers) {
            const translatedText = await translateText(ans.text, lang);
            translatedAnswers.push({ text: translatedText, isCorrect: ans.isCorrect });
          }

          await prisma.quizTranslation.create({
            data: {
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
        message: `Traductions partielles complétées`,
        processed: translationsCreated,
        duration: Date.now() - startTime,
      });
    }

    // Traiter les questions sans traduction
    let translationsCreated = 0;

    for (const quiz of quizzesWithMissingTranslations) {
      if (Date.now() - startTime > maxDuration) break;

      for (const lang of TARGET_LANGUAGES) {
        if (Date.now() - startTime > maxDuration) break;

        const translatedQuestion = await translateText(quiz.question, lang);
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
      message: `${quizzesWithMissingTranslations.length} questions traduites`,
      processed: translationsCreated,
      duration: Date.now() - startTime,
    });
  } catch (error) {
    console.error("[cron] Erreur:", error);
    return NextResponse.json(
      { error: String(error), duration: Date.now() - startTime },
      { status: 500 }
    );
  }
}
