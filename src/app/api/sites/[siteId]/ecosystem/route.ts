import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

/** GET : lire le contenu écosystème */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const { siteId } = await params;

    const settings = await prisma.siteSettings.findUnique({
      where: { siteId },
      select: { ecosystemContent: true },
    });

    return NextResponse.json({ content: settings?.ecosystemContent || "" });
  } catch (error) {
    console.error("Ecosystem GET error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/** PATCH : mettre à jour le contenu écosystème (admin uniquement) */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const { siteId } = await params;
    const body = await request.json();

    // Vérifier que c'est un admin
    let isAdmin = false;
    if (session.userType === "STUDIO_USER") {
      isAdmin = true;
    } else {
      const person = await prisma.person.findUnique({
        where: { id: session.userId },
        select: { personRole: true },
      });
      isAdmin = person?.personRole === "ADMIN";
    }

    if (!isAdmin) {
      return NextResponse.json({ error: "Réservé aux administrateurs" }, { status: 403 });
    }

    await prisma.siteSettings.update({
      where: { siteId },
      data: { ecosystemContent: body.content || "" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ecosystem PATCH error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
