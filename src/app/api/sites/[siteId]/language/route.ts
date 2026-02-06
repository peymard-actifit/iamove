import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await getSession();
    
    if (!session || session.userType !== "STUDIO_USER") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { siteId } = await params;
    const { language } = await request.json();

    if (!language || typeof language !== "string") {
      return NextResponse.json({ error: "Langue invalide" }, { status: 400 });
    }

    // Vérifier que l'utilisateur a accès au site
    const site = await prisma.site.findUnique({
      where: { id: siteId },
      select: { ownerId: true },
    });

    if (!site) {
      return NextResponse.json({ error: "Site non trouvé" }, { status: 404 });
    }

    // Vérifier les droits (propriétaire ou admin)
    if (site.ownerId !== session.userId && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    await prisma.site.update({
      where: { id: siteId },
      data: { language },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating site language:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;

    const site = await prisma.site.findUnique({
      where: { id: siteId },
      select: { language: true },
    });

    return NextResponse.json({ language: site?.language || "FR" });
  } catch {
    return NextResponse.json({ language: "FR" });
  }
}
