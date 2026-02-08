import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { LevelsPageContent } from "@/components/studio/levels-page-content";

export default async function LevelsPage() {
  const session = await getSession();

  if (!session || session.userType !== "STUDIO_USER" || session.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const levels = await prisma.level.findMany({
    orderBy: { number: "asc" },
    include: {
      translations: true,
    },
  });

  return (
    <LevelsPageContent initialLevels={levels} />
  );
}
