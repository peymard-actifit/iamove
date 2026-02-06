import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { QuizzesManager } from "@/components/studio/quizzes-manager";

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestion des Quizz</h1>
        <p className="text-gray-500 mt-1">
          {quizCount} question(s) au total
        </p>
      </div>

      <QuizzesManager 
        levels={levels} 
        initialQuizzes={quizzes}
        userId={session.userId}
      />
    </div>
  );
}
