import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

// DELETE - Supprimer une personne
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ siteId: string; personId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.userType !== "STUDIO_USER") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { siteId, personId } = await params;

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
    if (!session || session.userType !== "STUDIO_USER") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { siteId, personId } = await params;
    const body = await request.json();

    const site = await prisma.site.findUnique({
      where: { id: siteId },
    });

    if (!site) {
      return NextResponse.json({ error: "Site non trouvé" }, { status: 404 });
    }

    if (session.role !== "ADMIN" && site.ownerId !== session.userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const person = await prisma.person.update({
      where: { id: personId },
      data: {
        name: body.name,
        firstName: body.firstName,
        lastName: body.lastName,
        jobTitle: body.jobTitle,
        department: body.department,
        phone: body.phone,
        canViewAll: body.canViewAll,
        managerId: body.managerId,
      },
    });

    return NextResponse.json(person);
  } catch (error) {
    console.error("Error updating person:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
