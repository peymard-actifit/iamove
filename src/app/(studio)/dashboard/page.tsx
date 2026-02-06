import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { SitesList } from "@/components/studio/sites-list";

export default async function DashboardPage() {
  const session = await getSession();
  
  if (!session) return null;

  // Récupérer les sites de l'utilisateur (ou tous si admin)
  const sites = await prisma.site.findMany({
    where: session.role === "ADMIN" 
      ? {} 
      : { ownerId: session.userId },
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mes sites</h1>
          <p className="text-gray-500 mt-1">
            Gérez vos sites d&apos;accompagnement IA
          </p>
        </div>
      </div>

      <SitesList 
        sites={sites} 
        folders={folders} 
        isAdmin={session.role === "ADMIN"} 
      />
    </div>
  );
}
