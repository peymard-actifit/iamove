import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { TrainingPageContent } from "@/components/studio/training-page-content";

export default async function TrainingPage() {
  const session = await getSession();
  
  if (!session || session.userType !== "STUDIO_USER" || session.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Récupérer les méthodes de formation
  const methods = await prisma.trainingMethod.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    include: {
      translations: true,
      modules: {
        include: {
          level: true,
          translations: true,
        },
        orderBy: [
          { level: { number: "asc" } },
          { order: "asc" },
        ],
      },
      _count: {
        select: { modules: true },
      },
    },
  });

  // Récupérer les niveaux pour la création de modules
  const levels = await prisma.level.findMany({
    where: { number: { gte: 1, lte: 20 } },
    orderBy: { number: "asc" },
  });

  return (
    <TrainingPageContent
      methods={methods}
      levels={levels}
    />
  );
}
