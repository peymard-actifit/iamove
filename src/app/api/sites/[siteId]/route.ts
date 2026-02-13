import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - Récupérer un site
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.userType !== "STUDIO_USER") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { siteId } = await params;

    const site = await prisma.site.findUnique({
      where: { id: siteId },
      include: {
        settings: true,
        owner: { select: { id: true, name: true, email: true } },
        persons: {
          orderBy: { name: "asc" },
        },
      },
    });

    if (!site) {
      return NextResponse.json({ error: "Site non trouvé" }, { status: 404 });
    }

    // Vérifier les droits
    if (session.role !== "ADMIN" && site.ownerId !== session.userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    return NextResponse.json(site);
  } catch (error) {
    console.error("Error fetching site:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PATCH - Mettre à jour un site
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.userType !== "STUDIO_USER") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { siteId } = await params;
    const body = await request.json();

    const site = await prisma.site.findUnique({
      where: { id: siteId },
    });

    if (!site) {
      return NextResponse.json({ error: "Site non trouvé" }, { status: 404 });
    }

    // Vérifier droits : admin, propriétaire, ou utilisateur avec accès partagé
    if (session.role !== "ADMIN" && site.ownerId !== session.userId) {
      const isShared = await prisma.site.findFirst({
        where: { id: siteId, sharedWith: { some: { id: session.userId } } },
        select: { id: true },
      });
      if (!isShared) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
      }
    }

    // Préparer les données du site
    const siteData: Record<string, unknown> = {};
    if (body.name !== undefined) siteData.name = body.name;
    if (body.description !== undefined) siteData.description = body.description;
    if (body.logo !== undefined) siteData.logo = body.logo;
    if (body.primaryColor !== undefined) siteData.primaryColor = body.primaryColor;
    if (body.secondaryColor !== undefined) siteData.secondaryColor = body.secondaryColor;

    // Si des paramètres de settings sont fournis, les mettre à jour
    if (body.allowPublicRegistration !== undefined) {
      await prisma.siteSettings.upsert({
        where: { siteId },
        update: { allowPublicRegistration: body.allowPublicRegistration },
        create: {
          siteId,
          allowPublicRegistration: body.allowPublicRegistration,
        },
      });
    }

    // Gestion du partage avec d'autres utilisateurs Studio
    if (body.action === "share" && body.userId) {
      await prisma.site.update({
        where: { id: siteId },
        data: { sharedWith: { connect: { id: body.userId } } },
      });
      const updated = await prisma.site.findUnique({
        where: { id: siteId },
        include: { sharedWith: { select: { id: true, name: true, email: true } } },
      });
      return NextResponse.json(updated);
    }

    if (body.action === "unshare" && body.userId) {
      await prisma.site.update({
        where: { id: siteId },
        data: { sharedWith: { disconnect: { id: body.userId } } },
      });
      const updated = await prisma.site.findUnique({
        where: { id: siteId },
        include: { sharedWith: { select: { id: true, name: true, email: true } } },
      });
      return NextResponse.json(updated);
    }

    if (body.action === "get-sharing") {
      const siteWithSharing = await prisma.site.findUnique({
        where: { id: siteId },
        include: { sharedWith: { select: { id: true, name: true, email: true } } },
      });
      return NextResponse.json(siteWithSharing);
    }

    const updatedSite = await prisma.site.update({
      where: { id: siteId },
      data: siteData,
      include: { settings: true },
    });

    return NextResponse.json(updatedSite);
  } catch (error) {
    console.error("Error updating site:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE - Supprimer un site
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.userType !== "STUDIO_USER") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { siteId } = await params;

    const site = await prisma.site.findUnique({
      where: { id: siteId },
    });

    if (!site) {
      return NextResponse.json({ error: "Site non trouvé" }, { status: 404 });
    }

    if (session.role !== "ADMIN" && site.ownerId !== session.userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    await prisma.site.delete({
      where: { id: siteId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting site:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
