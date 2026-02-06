import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { SiteEditor } from "@/components/studio/site-editor";

interface PageProps {
  params: Promise<{ siteId: string }>;
}

export default async function SiteEditorPage({ params }: PageProps) {
  const session = await getSession();
  
  if (!session || session.userType !== "STUDIO_USER") {
    redirect("/login");
  }

  const { siteId } = await params;

  const site = await prisma.site.findUnique({
    where: { id: siteId },
    include: {
      settings: true,
      persons: {
        orderBy: { name: "asc" },
        include: {
          manager: { select: { id: true, name: true } },
          subordinates: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!site) {
    notFound();
  }

  // Vérifier les droits
  if (session.role !== "ADMIN" && site.ownerId !== session.userId) {
    redirect("/dashboard");
  }

  // Récupérer les niveaux disponibles
  const levels = await prisma.level.findMany({
    orderBy: { number: "asc" },
  });

  return <SiteEditor site={site} levels={levels} />;
}
