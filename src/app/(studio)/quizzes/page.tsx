import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { QuizzesPageContent } from "@/components/studio/quizzes-page-content";

export default async function QuizzesPage() {
  const session = await getSession();
  
  if (!session || session.userType !== "STUDIO_USER" || session.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const levels = await prisma.level.findMany({
    orderBy: { number: "asc" },
  });

  const quizzes = await prisma.quiz.findMany({
    include: {
      level: true,
      createdBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const quizCount = await prisma.quiz.count();

  return (
    <QuizzesPageContent
      levels={levels}
      initialQuizzes={quizzes}
      quizCount={quizCount}
      userId={session.userId}
    />
  );
}
