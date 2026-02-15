import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { SiteEditor } from "@/components/studio/site-editor";

interface PageProps {
  params: Promise<{ siteId: string }>;
}

export const maxDuration = 60;

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

  // Vérifier les droits : propriétaire, admin, ou site partagé avec l'utilisateur
  if (session.role !== "ADMIN" && site.ownerId !== session.userId) {
    const isShared = await prisma.site.findFirst({
      where: { id: siteId, sharedWith: { some: { id: session.userId } } },
      select: { id: true },
    });
    if (!isShared) redirect("/dashboard");
  }

  // Récupérer les niveaux disponibles
  const levels = await prisma.level.findMany({
    orderBy: { number: "asc" },
  });

  // Transformer les données du site pour ne pas exposer le hash du password
  const safeSite = {
    ...site,
    persons: site.persons.map((person) => ({
      ...person,
      password: person.password ? "[SET]" : null, // Indique si un password existe sans exposer le hash
      inviteClickedAt: person.inviteClickedAt?.toISOString() ?? null,
      lastSeenAt: person.lastSeenAt?.toISOString() ?? null,
    })),
  };

  return <SiteEditor site={safeSite} levels={levels} currentUserEmail={session.email} />;
}
