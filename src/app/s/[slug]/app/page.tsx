import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { PublishedSiteApp } from "@/components/published/site-app";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PublishedSiteAppPage({ params }: PageProps) {
  const session = await getSession();
  const { slug } = await params;

  if (!session) {
    redirect(`/s/${slug}`);
  }

  const site = await prisma.site.findUnique({
    where: { slug },
    include: {
      settings: true,
      persons: {
        include: {
          manager: { select: { id: true, name: true } },
          subordinates: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!site || !site.isPublished) {
    notFound();
  }

  // Récupérer la personne connectée
  let currentPerson = null;
  let visiblePersons: typeof site.persons = [];

  if (session.userType === "PERSON") {
    currentPerson = site.persons.find((p) => p.id === session.userId);
    
    if (!currentPerson) {
      redirect(`/s/${slug}`);
    }

    // Calculer les personnes visibles selon l'organigramme
    if (currentPerson.canViewAll) {
      visiblePersons = site.persons;
    } else {
      // Récupérer tous les subordonnés récursivement
      const getSubordinates = (personId: string): string[] => {
        const subs = site.persons.filter((p) => p.managerId === personId);
        return [personId, ...subs.flatMap((s) => getSubordinates(s.id))];
      };
      const visibleIds = getSubordinates(currentPerson.id);
      visiblePersons = site.persons.filter((p) => visibleIds.includes(p.id));
    }
  } else if (session.userType === "STUDIO_USER") {
    // L'utilisateur studio voit tout
    visiblePersons = site.persons;
  }

  const levels = await prisma.level.findMany({
    orderBy: { number: "asc" },
  });

  return (
    <PublishedSiteApp
      site={site}
      currentPerson={currentPerson}
      visiblePersons={visiblePersons}
      levels={levels}
      isStudioUser={session.userType === "STUDIO_USER"}
    />
  );
}
