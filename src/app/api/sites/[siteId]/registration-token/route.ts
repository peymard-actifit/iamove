import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateToken } from "@/lib/utils";

// POST - Générer un nouveau token d'inscription à usage unique
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.userType !== "STUDIO_USER") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { siteId } = await params;

    // Vérifier les droits
    const site = await prisma.site.findUnique({
      where: { id: siteId },
      include: { settings: true },
    });

    if (!site) {
      return NextResponse.json({ error: "Site non trouvé" }, { status: 404 });
    }

    if (session.role !== "ADMIN" && site.ownerId !== session.userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // Générer un token unique
    const token = generateToken(32);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours

    // Créer le token
    const registrationToken = await prisma.registrationToken.create({
      data: {
        token,
        siteId,
        expiresAt,
      },
    });

    return NextResponse.json({
      success: true,
      token: registrationToken.token,
      expiresAt: registrationToken.expiresAt,
    });
  } catch (error) {
    console.error("Error generating registration token:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// GET - Obtenir le dernier token non utilisé ou en créer un nouveau
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

    // Vérifier les droits
    const site = await prisma.site.findUnique({
      where: { id: siteId },
    });

    if (!site) {
      return NextResponse.json({ error: "Site non trouvé" }, { status: 404 });
    }

    if (session.role !== "ADMIN" && site.ownerId !== session.userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // Chercher un token non utilisé et non expiré
    const existingToken = await prisma.registrationToken.findFirst({
      where: {
        siteId,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (existingToken) {
      return NextResponse.json({
        token: existingToken.token,
        expiresAt: existingToken.expiresAt,
      });
    }

    // Sinon, créer un nouveau token
    const token = generateToken(32);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const newToken = await prisma.registrationToken.create({
      data: {
        token,
        siteId,
        expiresAt,
      },
    });

    return NextResponse.json({
      token: newToken.token,
      expiresAt: newToken.expiresAt,
    });
  } catch (error) {
    console.error("Error getting registration token:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
