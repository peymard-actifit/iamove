import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

// PATCH - Modifier un quiz
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.userType !== "STUDIO_USER" || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { quizId } = await params;
    const body = await request.json();
    const { question, levelId, category, answers, isActive } = body;

    const quiz = await prisma.quiz.update({
      where: { id: quizId },
      data: {
        question,
        levelId,
        category,
        answers,
        isActive,
      },
      include: {
        level: true,
      },
    });

    return NextResponse.json(quiz);
  } catch (error) {
    console.error("Error updating quiz:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE - Supprimer un quiz
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.userType !== "STUDIO_USER" || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { quizId } = await params;

    await prisma.quiz.delete({
      where: { id: quizId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting quiz:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
