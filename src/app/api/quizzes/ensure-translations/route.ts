import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TARGET_LANGUAGES, getDeepLLanguageCode } from "@/lib/deepl";

// Traduction via DeepL avec retry
// Retourne le texte traduit (même si identique à l'original - c'est la traduction correcte)
// Retourne null uniquement en cas d'erreur
async function translateTextWithRetry(text: string, targetLang: string, retries = 3): Promise<string | null> {
  if (!process.env.DEEPL_API_KEY || !text || text.trim() === "") return text || null;

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
        // Retourner le texte traduit, même s'il est identique à l'original
        // (certains mots sont identiques dans plusieurs langues)
        return translated || text;
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

// Traduction batch via DeepL (plusieurs textes en un seul appel)
async function translateBatch(texts: string[], targetLang: string): Promise<(string | null)[]> {
  if (!process.env.DEEPL_API_KEY || texts.length === 0) return texts;

  try {
    const response = await fetch("https://api.deepl.com/v2/translate", {
      method: "POST",
      headers: {
        "Authorization": `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: texts,
        source_lang: "FR",
        target_lang: getDeepLLanguageCode(targetLang),
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.translations.map((t: { text: string }, i: number) => t.text || texts[i]);
    }
    
    if (response.status === 429) {
      // Rate limit - attendre et réessayer
      await new Promise(resolve => setTimeout(resolve, 2000));
      return translateBatch(texts, targetLang);
    }
    
    return texts; // Retourner originaux en cas d'erreur
  } catch {
    return texts;
  }
}

// POST - Traduit un batch de questions sans traduction (version parallélisée)
export async function POST() {
  const startTime = Date.now();
  const maxDuration = 55000; // 55 secondes max (Vercel timeout à 60s)
  
  try {
    const quizzesWithTranslations = await prisma.quiz.findMany({
      include: {
        translations: {
          select: { language: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Filtrer celles qui ont besoin de traduction
    const allQuizzesToTranslate = quizzesWithTranslations.filter(quiz => {
      const existingLangs = quiz.translations.map(t => t.language);
      const missingLangs = TARGET_LANGUAGES.filter(lang => !existingLangs.includes(lang));
      return missingLangs.length > 0;
    });
    
    // Traiter 50 questions par appel (augmenté de 10)
    const quizzesToTranslate = allQuizzesToTranslate.slice(0, 50);

    let translationsCreated = 0;
    let quizzesProcessed = 0;

    // Traiter les quizzes par groupes de 5 en parallèle
    const chunkSize = 5;
    for (let i = 0; i < quizzesToTranslate.length; i += chunkSize) {
      if (Date.now() - startTime > maxDuration) break;
      
      const chunk = quizzesToTranslate.slice(i, i + chunkSize);
      
      await Promise.all(chunk.map(async (quiz) => {
        const existingLangs = quiz.translations.map(t => t.language);
        const langsToTranslate = TARGET_LANGUAGES.filter(lang => !existingLangs.includes(lang));

        if (langsToTranslate.length === 0) return;

        quizzesProcessed++;
        const originalAnswers = quiz.answers as Array<{ text: string; isCorrect: boolean }>;

        // Traiter 5 langues en parallèle par quiz
        const langChunks = [];
        for (let j = 0; j < langsToTranslate.length; j += 5) {
          langChunks.push(langsToTranslate.slice(j, j + 5));
        }

        for (const langChunk of langChunks) {
          if (Date.now() - startTime > maxDuration) break;

          await Promise.all(langChunk.map(async (lang) => {
            try {
              // Batch: traduire question + toutes les réponses en un seul appel
              const textsToTranslate = [quiz.question, ...originalAnswers.map(a => a.text)];
              const translated = await translateBatch(textsToTranslate, lang);
              
              const translatedQuestion = translated[0] || quiz.question;
              const translatedAnswers = originalAnswers.map((ans, idx) => ({
                text: translated[idx + 1] || ans.text,
                isCorrect: ans.isCorrect,
              }));

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
            } catch (e) {
              console.error(`[ensure-translations] Erreur quiz ${quiz.id} lang ${lang}:`, e);
            }
          }));
        }
      }));
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
