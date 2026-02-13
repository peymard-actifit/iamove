import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Vérifier si la session a les droits d'admin sur le site (studio user ou person admin)
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

// DELETE - Supprimer une personne
export async function DELETE(
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

    // Vérifier que la personne n'a pas de subordonnés
    const person = await prisma.person.findUnique({
      where: { id: personId },
      include: { subordinates: true },
    });

    if (!person) {
      return NextResponse.json({ error: "Personne non trouvée" }, { status: 404 });
    }

    if (person.subordinates.length > 0) {
      return NextResponse.json(
        { error: "Impossible de supprimer une personne avec des subordonnés" },
        { status: 400 }
      );
    }

    await prisma.person.delete({
      where: { id: personId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting person:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PATCH - Mettre à jour une personne
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ siteId: string; personId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { siteId, personId } = await params;
    const body = await request.json();

    // Vérifier les droits (studio user ou person admin)
    const access = await checkAdminAccess(session, siteId);
    if ("error" in access) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    // Les persons admin ne peuvent pas changer le personRole (réservé au studio)
    if (session.userType === "PERSON" && body.personRole !== undefined) {
      return NextResponse.json({ error: "Seul le studio peut modifier le rôle" }, { status: 403 });
    }

    // Construire les données de mise à jour dynamiquement (pour le mode inline)
    const updateData: Record<string, unknown> = {};
    
    if (body.name !== undefined) updateData.name = body.name;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.firstName !== undefined) updateData.firstName = body.firstName;
    if (body.lastName !== undefined) updateData.lastName = body.lastName;
    if (body.jobTitle !== undefined) updateData.jobTitle = body.jobTitle || null;
    if (body.department !== undefined) updateData.department = body.department || null;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.canViewAll !== undefined) updateData.canViewAll = body.canViewAll;
    if (body.personRole !== undefined) updateData.personRole = body.personRole;
    if (body.managerId !== undefined) updateData.managerId = body.managerId || null;
    if (body.currentLevel !== undefined) updateData.currentLevel = body.currentLevel;

    const person = await prisma.person.update({
      where: { id: personId },
      data: updateData,
    });

    return NextResponse.json(person);
  } catch (error) {
    console.error("Error updating person:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
