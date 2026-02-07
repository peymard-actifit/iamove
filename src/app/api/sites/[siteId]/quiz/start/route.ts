import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { siteId: _siteId } = await params;
    const body = await request.json();
    const { personId, targetLevel, language = "FR" } = body;

    if (!targetLevel) {
      return NextResponse.json({ error: "Niveau cible requis" }, { status: 400 });
    }

    // Récupérer le niveau
    const level = await prisma.level.findUnique({
      where: { number: targetLevel },
    });

    if (!level) {
      return NextResponse.json({ error: "Niveau non trouvé" }, { status: 404 });
    }

    // Récupérer les questions déjà répondues par cette personne
    const answeredQuizIds = personId
      ? (
          await prisma.quizAttempt.findMany({
            where: { personId },
            select: { quizId: true },
          })
        ).map((a) => a.quizId)
      : [];

    // Récupérer 20 questions non répondues pour ce niveau avec leurs traductions
    const questions = await prisma.quiz.findMany({
      where: {
        levelId: level.id,
        isActive: true,
        id: { notIn: answeredQuizIds },
      },
      include: {
        translations: {
          where: { language: language.toUpperCase() },
        },
      },
      take: 20,
      orderBy: { createdAt: "asc" },
    });

    if (questions.length < 10) {
      return NextResponse.json(
        { error: "Pas assez de questions disponibles pour ce niveau" },
        { status: 400 }
      );
    }

    // Formater les questions pour le frontend avec les traductions
    const formattedQuestions = questions.map((q) => {
      // Utiliser la traduction si disponible, sinon le texte original
      const translation = q.translations[0];
      const questionText = translation?.question || q.question;
      const answers = translation?.answers || q.answers;
      
      return {
        id: q.id,
        question: questionText,
        answers: (answers as { text: string; isCorrect: boolean }[]).map((a) => ({
          text: a.text,
          isCorrect: a.isCorrect,
        })),
      };
    });

    return NextResponse.json({ questions: formattedQuestions });
  } catch (error) {
    console.error("Quiz start error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
