import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { SitesList } from "@/components/studio/sites-list";
import { DashboardHeaderContent } from "@/components/studio/dashboard-header-content";

export const maxDuration = 60;

export default async function DashboardPage() {
  const session = await getSession();
  
  if (!session) return null;

  // Récupérer les sites de l'utilisateur :
  // - Admin : tous les sites
  // - Standard : ses propres sites + ceux partagés avec lui
  const sites = await prisma.site.findMany({
    where: session.role === "ADMIN" 
      ? {} 
      : {
          OR: [
            { ownerId: session.userId },
            { sharedWith: { some: { id: session.userId } } },
          ],
        },
    include: {
      owner: {
        select: { name: true, email: true },
      },
      _count: {
        select: { persons: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Récupérer les dossiers
  const folders = await prisma.siteFolder.findMany({
    where: { ownerId: session.userId },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <DashboardHeaderContent />
      <SitesList 
        sites={sites} 
        folders={folders} 
        isAdmin={session.role === "ADMIN"}
        currentUserEmail={session.email}
      />
    </>
  );
}
