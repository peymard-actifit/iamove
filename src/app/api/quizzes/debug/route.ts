import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// API de diagnostic pour vérifier les traductions
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get("lang") || "IT";
  
  try {
    // Récupérer un quiz avec ses traductions
    const quiz = await prisma.quiz.findFirst({
      include: {
        translations: true,
        level: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!quiz) {
      return NextResponse.json({ error: "No quiz found" }, { status: 404 });
    }

    // Chercher la traduction pour la langue demandée
    const translation = quiz.translations.find(t => t.language === lang);
    
    // Compter les traductions par langue pour ce quiz
    const translationsByLang = quiz.translations.map(t => ({
      language: t.language,
      hasQuestion: !!t.question,
    }));

    return NextResponse.json({
      quizId: quiz.id,
      originalQuestion: quiz.question,
      level: quiz.level.number,
      requestedLang: lang,
      translationFound: !!translation,
      translatedQuestion: translation?.question || null,
      totalTranslations: quiz.translations.length,
      translationsByLang,
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
