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
    const { personId, questionId, selectedAnswers, isCorrect } = body;

    if (!personId || !questionId) {
      return NextResponse.json(
        { error: "personId et questionId requis" },
        { status: 400 }
      );
    }

    // Sauvegarder la tentative
    await prisma.quizAttempt.create({
      data: {
        personId,
        quizId: questionId,
        selectedAnswers,
        isCorrect,
      },
    });

    // Si correct, vérifier si le niveau est atteint
    if (isCorrect) {
      const person = await prisma.person.findUnique({
        where: { id: personId },
      });

      if (person) {
        const targetLevel = person.currentLevel + 1;
        const level = await prisma.level.findUnique({
          where: { number: targetLevel },
        });

        if (level) {
          // Compter les bonnes réponses pour ce niveau
          const correctAnswers = await prisma.quizAttempt.count({
            where: {
              personId,
              isCorrect: true,
              quiz: { levelId: level.id },
            },
          });

          // Si 15 bonnes réponses, passer au niveau suivant
          if (correctAnswers >= 15) {
            await prisma.person.update({
              where: { id: personId },
              data: { currentLevel: targetLevel },
            });

            return NextResponse.json({
              success: true,
              levelUp: true,
              newLevel: targetLevel,
            });
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Quiz answer error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
