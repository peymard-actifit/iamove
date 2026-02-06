import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - Liste des quizz
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.userType !== "STUDIO_USER" || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const quizzes = await prisma.quiz.findMany({
      include: {
        level: true,
        createdBy: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(quizzes);
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST - Créer un quiz
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.userType !== "STUDIO_USER" || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { question, levelId, category, answers } = body;

    if (!question || !levelId || !answers || answers.length < 2) {
      return NextResponse.json(
        { error: "Question, niveau et au moins 2 réponses requis" },
        { status: 400 }
      );
    }

    const quiz = await prisma.quiz.create({
      data: {
        question,
        levelId,
        category: category || null,
        answers,
        createdById: session.userId,
      },
      include: {
        level: true,
      },
    });

    return NextResponse.json(quiz, { status: 201 });
  } catch (error) {
    console.error("Error creating quiz:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
