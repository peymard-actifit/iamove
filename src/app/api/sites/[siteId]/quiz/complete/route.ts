import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

/** POST : fin de session quiz – attribue les PP (completion, victoire, bonus niveaux) */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    if (session.userType !== "PERSON") {
      return NextResponse.json({ error: "Réservé aux personnes du site publié" }, { status: 403 });
    }

    const { siteId } = await params;
    const body = await request.json();
    const { targetLevel, passed } = body as { targetLevel: number; passed: boolean };

    if (typeof targetLevel !== "number" || targetLevel < 1 || targetLevel > 20) {
      return NextResponse.json({ error: "targetLevel requis (1-20)" }, { status: 400 });
    }

    const person = await prisma.person.findFirst({
      where: { id: session.userId, siteId },
      select: { id: true, currentLevel: true, participationPoints: true },
    });
    if (!person) {
      return NextResponse.json({ error: "Personne non trouvée" }, { status: 404 });
    }

    let toAdd = 100; // Passer un quiz = 100 PP
    if (passed) {
      if (targetLevel > person.currentLevel) toAdd += 200;
      else if (targetLevel < person.currentLevel) toAdd += 50;
    }

    // Bonus : avoir vu toutes les questions de ce niveau
    const level = await prisma.level.findUnique({ where: { number: targetLevel } });
    if (level) {
      const totalQuizzesForLevel = await prisma.quiz.count({
        where: { levelId: level.id, isActive: true },
      });
      const distinctAttemptedForLevel = await prisma.quizAttempt.findMany({
        where: { personId: person.id, quiz: { levelId: level.id } },
        select: { quizId: true },
        distinct: ["quizId"],
      });
      if (totalQuizzesForLevel > 0 && distinctAttemptedForLevel.length >= totalQuizzesForLevel) {
        toAdd += 1000;
      }
    }

    // Bonus : avoir vu toutes les questions de tous les niveaux (1-20)
    const levels = await prisma.level.findMany({
      where: { number: { gte: 1, lte: 20 } },
      select: { id: true, number: true },
    });
    let allLevelsComplete = true;
    for (const lvl of levels) {
      const total = await prisma.quiz.count({
        where: { levelId: lvl.id, isActive: true },
      });
      if (total === 0) continue;
      const attempted = await prisma.quizAttempt.findMany({
        where: { personId: person.id, quiz: { levelId: lvl.id } },
        select: { quizId: true },
        distinct: ["quizId"],
      });
      if (attempted.length < total) {
        allLevelsComplete = false;
        break;
      }
    }
    if (allLevelsComplete) {
      toAdd += 100000;
    }

    const newTotal = person.participationPoints + toAdd;
    await prisma.person.update({
      where: { id: person.id },
      data: { participationPoints: newTotal, lastSeenAt: new Date() },
    });

    const rank = await prisma.person.count({
      where: { siteId, participationPoints: { gt: newTotal } },
    });

    return NextResponse.json({
      added: toAdd,
      newTotal,
      rank: rank + 1,
    });
  } catch (error) {
    console.error("Quiz complete error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
