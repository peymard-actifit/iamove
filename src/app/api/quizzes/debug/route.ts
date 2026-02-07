import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// API de diagnostic pour vérifier les traductions
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get("lang") || "IT";
  const skip = parseInt(searchParams.get("skip") || "0");
  const levelNum = searchParams.get("level");
  
  try {
    // Récupérer un quiz avec ses traductions
    const quiz = await prisma.quiz.findFirst({
      where: levelNum ? { level: { number: parseInt(levelNum) } } : undefined,
      include: {
        translations: true,
        level: true,
      },
      orderBy: { createdAt: "asc" },
      skip,
    });

    if (!quiz) {
      return NextResponse.json({ error: "No quiz found" }, { status: 404 });
    }

    // Chercher la traduction pour la langue demandée
    const translation = quiz.translations.find(t => t.language === lang);
    const frTranslation = quiz.translations.find(t => t.language === "FR");
    
    // Vérifier si les traductions sont différentes du français
    const translationComparison = quiz.translations
      .filter(t => t.language !== "FR")
      .map(t => ({
        language: t.language,
        isDifferent: t.question !== quiz.question,
        questionStart: t.question?.substring(0, 30) || "",
      }));

    return NextResponse.json({
      quizId: quiz.id,
      level: quiz.level.number,
      originalQuestion: quiz.question,
      frQuestion: frTranslation?.question || "N/A",
      requestedLang: lang,
      translatedQuestion: translation?.question || null,
      isTranslated: translation?.question !== quiz.question,
      totalTranslations: quiz.translations.length,
      translationComparison,
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
