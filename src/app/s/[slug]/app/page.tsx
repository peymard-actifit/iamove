import { redirect, notFound } from "next/navigation";
import { Metadata } from "next";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { PublishedSiteApp } from "@/components/published/site-app";

export const maxDuration = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const site = await prisma.site.findUnique({
    where: { slug },
    select: { name: true },
  });

  return {
    title: site ? `${site.name} - Publié` : "Site - Publié",
  };
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
  let isPersonAdmin = false;

  if (session.userType === "PERSON") {
    currentPerson = site.persons.find((p) => p.id === session.userId);
    
    if (!currentPerson) {
      redirect(`/s/${slug}`);
    }

    isPersonAdmin = currentPerson.personRole === "ADMIN";

    // Les admins voient toutes les personnes (organigramme complet + gestion)
    if (isPersonAdmin || currentPerson.canViewAll) {
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
    isPersonAdmin = true; // studio users have admin-like access
    // Chercher si l'utilisateur studio correspond à une personne du site (par email)
    currentPerson = site.persons.find((p) => p.email === session.email) || null;
  }

  const levels = await prisma.level.findMany({
    orderBy: { number: "asc" },
    include: { translations: true },
  });

  // Sérialiser inviteClickedAt (Date -> string) pour les composants client
  const serializePersons = (persons: typeof site.persons) =>
    persons.map((p) => ({
      ...p,
      inviteClickedAt: p.inviteClickedAt?.toISOString() ?? null,
      lastSeenAt: p.lastSeenAt?.toISOString() ?? null,
      password: p.password ? "[SET]" : null, // Ne pas exposer le hash
    }));

  const safeVisiblePersons = serializePersons(visiblePersons);
  const safeAllPersons = serializePersons(site.persons);
  const safeCurrentPerson = currentPerson ? {
    ...currentPerson,
    inviteClickedAt: currentPerson.inviteClickedAt?.toISOString() ?? null,
    lastSeenAt: currentPerson.lastSeenAt?.toISOString() ?? null,
    password: currentPerson.password ? "[SET]" : null,
  } : null;

  const pp = currentPerson?.participationPoints ?? 0;
  const rank =
    currentPerson != null
      ? (await prisma.person.count({
          where: {
            siteId: site.id,
            participationPoints: { gt: currentPerson.participationPoints },
          },
        })) + 1
      : 0;

  return (
    <PublishedSiteApp
      site={site}
      currentPerson={safeCurrentPerson}
      visiblePersons={safeVisiblePersons}
      allPersons={safeAllPersons}
      levels={levels}
      isStudioUser={session.userType === "STUDIO_USER"}
      isPersonAdmin={isPersonAdmin}
      initialPP={pp}
      initialRank={rank}
    />
  );
}
