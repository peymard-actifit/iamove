import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Fonction pour mélanger un tableau (Fisher-Yates shuffle)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

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

    // Récupérer les questions déjà répondues par cette personne pour ce niveau (IDs uniques)
    const answeredQuizIds = personId
      ? (
          await prisma.quizAttempt.findMany({
            where: { 
              personId,
              quiz: { levelId: level.id }
            },
            select: { quizId: true },
            distinct: ['quizId'], // Éviter les doublons si la personne a répondu plusieurs fois
          })
        ).map((a) => a.quizId)
      : [];

    // Compter le nombre total de questions pour ce niveau
    const totalQuestionsForLevel = await prisma.quiz.count({
      where: {
        levelId: level.id,
        isActive: true,
      },
    });

    // Si l'utilisateur a répondu à toutes les questions, réinitialiser ses tentatives pour ce niveau
    if (personId && answeredQuizIds.length >= totalQuestionsForLevel && totalQuestionsForLevel > 0) {
      // Supprimer les anciennes tentatives pour ce niveau uniquement
      await prisma.quizAttempt.deleteMany({
        where: {
          personId,
          quiz: { levelId: level.id }
        },
      });
      // Vider la liste des questions répondues
      answeredQuizIds.length = 0;
    }

    // Récupérer toutes les questions non répondues pour ce niveau
    const availableQuestions = await prisma.quiz.findMany({
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
    });

    // S'il n'y a pas assez de questions non répondues, on prend ce qu'on peut
    if (availableQuestions.length === 0) {
      return NextResponse.json(
        { error: "Aucune question disponible pour ce niveau" },
        { status: 400 }
      );
    }

    // Mélanger les questions aléatoirement et prendre les 20 premières
    const shuffledQuestions = shuffleArray(availableQuestions);
    const selectedQuestions = shuffledQuestions.slice(0, 20);

    // Formater les questions pour le frontend avec les traductions
    const formattedQuestions = selectedQuestions.map((q) => {
      // Utiliser la traduction si disponible, sinon le texte original
      const translation = q.translations[0];
      const questionText = translation?.question || q.question;
      const answers = translation?.answers || q.answers;
      
      // Mélanger aussi l'ordre des réponses
      const formattedAnswers = (answers as { text: string; isCorrect: boolean }[]).map((a) => ({
        text: a.text,
        isCorrect: a.isCorrect,
      }));
      
      return {
        id: q.id,
        question: questionText,
        answers: shuffleArray(formattedAnswers),
      };
    });

    return NextResponse.json({ 
      questions: formattedQuestions,
      totalAvailable: availableQuestions.length,
      totalForLevel: totalQuestionsForLevel,
    });
  } catch (error) {
    console.error("Quiz start error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
