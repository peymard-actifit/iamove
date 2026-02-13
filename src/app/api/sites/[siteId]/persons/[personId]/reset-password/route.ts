import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateToken } from "@/lib/utils";

// Vérifier si la session a les droits d'admin sur le site
async function checkAdminAccess(session: { userId: string; userType: string; role?: string; siteId?: string }, siteId: string) {
  if (session.userType === "STUDIO_USER") {
    const site = await prisma.site.findUnique({ where: { id: siteId } });
    if (!site) return { error: "Site non trouvé", status: 404 };
    if (session.role !== "ADMIN" && site.ownerId !== session.userId) {
      return { error: "Non autorisé", status: 403 };
    }
    return { ok: true };
  }
  if (session.userType === "PERSON") {
    const person = await prisma.person.findUnique({ where: { id: session.userId } });
    if (!person || person.siteId !== siteId || person.personRole !== "ADMIN") {
      return { error: "Non autorisé", status: 403 };
    }
    return { ok: true };
  }
  return { error: "Non autorisé", status: 401 };
}

// POST - Réinitialiser le mot de passe d'une personne (génère un nouveau token d'invitation)
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ siteId: string; personId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { siteId, personId } = await params;

    // Vérifier les droits (studio user ou person admin)
    const access = await checkAdminAccess(session, siteId);
    if ("error" in access) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    // Vérifier que la personne existe
    const person = await prisma.person.findUnique({
      where: { id: personId },
    });

    if (!person || person.siteId !== siteId) {
      return NextResponse.json({ error: "Personne non trouvée" }, { status: 404 });
    }

    // Générer un nouveau token d'invitation
    const inviteToken = generateToken(32);
    const inviteExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours

    // Réinitialiser le mot de passe et définir le nouveau token
    const updatedPerson = await prisma.person.update({
      where: { id: personId },
      data: {
        password: null,
        inviteToken,
        inviteExpiresAt,
      },
      select: {
        id: true,
        email: true,
        name: true,
        inviteToken: true,
      },
    });

    return NextResponse.json({
      success: true,
      inviteToken: updatedPerson.inviteToken,
      message: "Mot de passe réinitialisé. Un nouveau lien d'invitation a été généré.",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
