import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * GET - Récupère la liste des moduleIds masqués pour ce site.
 */
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
    const settings = await prisma.siteSettings.findUnique({
      where: { siteId },
      select: { tab4HiddenModuleIds: true },
    });

    return NextResponse.json({
      hiddenModuleIds: settings?.tab4HiddenModuleIds ?? [],
    });
  } catch (error) {
    console.error("[training-visibility] GET:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

/**
 * PATCH - Ajoute ou retire un moduleId de la liste des modules masqués.
 * Body: { moduleId: string, visible: boolean }
 */
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
    const { moduleId, visible } = body as { moduleId: string; visible: boolean };

    if (!moduleId || typeof visible !== "boolean") {
      return NextResponse.json({ error: "moduleId (string) et visible (boolean) requis" }, { status: 400 });
    }

    // Récupérer ou créer les settings
    let settings = await prisma.siteSettings.findUnique({
      where: { siteId },
      select: { id: true, tab4HiddenModuleIds: true },
    });

    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: { siteId },
        select: { id: true, tab4HiddenModuleIds: true },
      });
    }

    let hiddenIds = settings.tab4HiddenModuleIds ?? [];

    if (visible) {
      // Rendre visible = retirer de la liste
      hiddenIds = hiddenIds.filter((id) => id !== moduleId);
    } else {
      // Masquer = ajouter à la liste (si pas déjà présent)
      if (!hiddenIds.includes(moduleId)) {
        hiddenIds = [...hiddenIds, moduleId];
      }
    }

    await prisma.siteSettings.update({
      where: { siteId },
      data: { tab4HiddenModuleIds: hiddenIds },
    });

    return NextResponse.json({ success: true, hiddenModuleIds: hiddenIds });
  } catch (error) {
    console.error("[training-visibility] PATCH:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
