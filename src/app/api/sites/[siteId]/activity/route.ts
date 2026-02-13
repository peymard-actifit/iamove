import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

/** GET : résumé d'activité d'une personne */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const { siteId } = await params;
    const { searchParams } = new URL(request.url);
    const personId = searchParams.get("personId") || session.userId;

    // Formations suivies
    const trainingProgress = await prisma.personTrainingProgress.findMany({
      where: { personId, status: { in: ["IN_PROGRESS", "COMPLETED"] } },
      include: { module: { select: { id: true, title: true } } },
      orderBy: { updatedAt: "desc" },
    });

    // Quiz passés
    const quizAttempts = await prisma.quizAttempt.count({
      where: { personId },
    });
    const quizCorrect = await prisma.quizAttempt.count({
      where: { personId, isCorrect: true },
    });

    // Messages chat IA
    const chatCount = await prisma.chatMessage.count({
      where: { personId, role: "USER" },
    });

    // Use cases partagés
    const useCaseCount = await prisma.useCase.count({
      where: { personId, siteId },
    });

    // Posts forum
    const forumPostCount = await prisma.forumPost.count({
      where: { personId, siteId },
    });
    const forumReplyCount = await prisma.forumReply.count({
      where: { personId },
    });

    // Tech tips
    const techTipCount = await prisma.techTip.count({
      where: { personId, siteId },
    });

    // Badges obtenus
    const badges = await prisma.personBadge.findMany({
      where: { personId },
      include: { badge: true },
      orderBy: { earnedAt: "desc" },
    });

    // Personne info
    const person = await prisma.person.findUnique({
      where: { id: personId },
      select: { participationPoints: true, currentLevel: true, createdAt: true },
    });

    return NextResponse.json({
      training: {
        modulesStarted: trainingProgress.filter((p) => p.status === "IN_PROGRESS").length,
        modulesCompleted: trainingProgress.filter((p) => p.status === "COMPLETED").length,
        recentModules: trainingProgress.slice(0, 5).map((p) => ({
          title: p.module.title,
          status: p.status,
          completedAt: p.completedAt,
        })),
      },
      quizzes: {
        total: quizAttempts,
        correct: quizCorrect,
        accuracy: quizAttempts > 0 ? Math.round((quizCorrect / quizAttempts) * 100) : 0,
      },
      chat: { messagesCount: chatCount },
      useCases: { count: useCaseCount },
      forum: { posts: forumPostCount, replies: forumReplyCount },
      techTips: { count: techTipCount },
      badges: badges.map((pb) => ({
        name: pb.badge.name,
        icon: pb.badge.icon,
        description: pb.badge.description,
        earnedAt: pb.earnedAt,
      })),
      pp: person?.participationPoints ?? 0,
      level: person?.currentLevel ?? 0,
      memberSince: person?.createdAt,
    });
  } catch (error) {
    console.error("Activity GET error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
