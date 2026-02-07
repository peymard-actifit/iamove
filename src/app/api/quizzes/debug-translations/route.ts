import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const TARGET_LANGUAGES = [
  "EN", "DE", "ES", "IT", "PT", "NL", "PL", "RU", "JA", "ZH",
  "KO", "AR", "TR", "SV", "DA", "FI", "NO", "CS", "EL", "HU",
  "RO", "SK", "UK", "BG", "HR"
];

export async function GET() {
  try {
    // Vérifier la clé DeepL
    const hasDeeplKey = !!process.env.DEEPL_API_KEY;
    
    // Tester une traduction simple
    let deeplWorks = false;
    let deeplError = null;
    
    if (hasDeeplKey) {
      try {
        const response = await fetch("https://api.deepl.com/v2/translate", {
          method: "POST",
          headers: {
            "Authorization": `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: ["Bonjour le monde"],
            source_lang: "FR",
            target_lang: "EN-US",
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          deeplWorks = data.translations?.[0]?.text !== "Bonjour le monde";
        } else {
          deeplError = `HTTP ${response.status}: ${await response.text()}`;
        }
      } catch (e) {
        deeplError = String(e);
      }
    }
    
    // Statistiques des traductions
    const totalQuizzes = await prisma.quiz.count();
    const totalTranslations = await prisma.quizTranslation.count();
    
    // Trouver les questions avec traductions manquantes
    const quizzesWithTranslations = await prisma.quiz.findMany({
      include: {
        translations: {
          select: { language: true, question: true },
        },
      },
      take: 50,
    });
    
    // Analyser les 10 premières questions
    const analysis = quizzesWithTranslations.slice(0, 10).map(quiz => {
      const existingLangs = quiz.translations.map(t => t.language);
      const missingLangs = TARGET_LANGUAGES.filter(lang => !existingLangs.includes(lang));
      const identicalLangs = quiz.translations
        .filter(t => t.language !== "FR" && t.question === quiz.question)
        .map(t => t.language);
      
      return {
        id: quiz.id,
        questionPreview: quiz.question.substring(0, 50) + "...",
        translationsCount: quiz.translations.length,
        missingLangs,
        identicalToFrench: identicalLangs,
      };
    });
    
    // Trouver une question avec vraiment des langues manquantes
    const quizWithMissing = quizzesWithTranslations.find(quiz => {
      const existingLangs = quiz.translations.map(t => t.language);
      return TARGET_LANGUAGES.some(lang => !existingLangs.includes(lang));
    });
    
    return NextResponse.json({
      deepl: {
        hasKey: hasDeeplKey,
        works: deeplWorks,
        error: deeplError,
      },
      stats: {
        totalQuizzes,
        totalTranslations,
        expected: totalQuizzes * TARGET_LANGUAGES.length,
        missing: totalQuizzes * TARGET_LANGUAGES.length - totalTranslations,
      },
      sampleAnalysis: analysis,
      quizWithMissingLangs: quizWithMissing ? {
        id: quizWithMissing.id,
        existingLangs: quizWithMissing.translations.map(t => t.language),
        missingLangs: TARGET_LANGUAGES.filter(lang => 
          !quizWithMissing.translations.map(t => t.language).includes(lang)
        ),
      } : null,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
