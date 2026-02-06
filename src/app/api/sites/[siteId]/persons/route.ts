import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateToken } from "@/lib/utils";

// POST - Créer une personne
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
    const body = await request.json();
    const { name, email, jobTitle, department, managerId } = body;

    // Vérifier que le site existe et appartient à l'utilisateur
    const site = await prisma.site.findUnique({
      where: { id: siteId },
      include: { _count: { select: { persons: true } } },
    });

    if (!site) {
      return NextResponse.json({ error: "Site non trouvé" }, { status: 404 });
    }

    if (session.role !== "ADMIN" && site.ownerId !== session.userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // Vérifier que l'email n'existe pas déjà dans ce site
    const existingPerson = await prisma.person.findUnique({
      where: {
        siteId_email: { siteId, email: email.toLowerCase() },
      },
    });

    if (existingPerson) {
      return NextResponse.json(
        { error: "Une personne avec cet email existe déjà" },
        { status: 400 }
      );
    }

    // Générer un token d'invitation
    const inviteToken = generateToken(32);
    const inviteExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours

    const person = await prisma.person.create({
      data: {
        name,
        email: email.toLowerCase(),
        jobTitle,
        department,
        managerId: managerId || null,
        siteId,
        inviteToken,
        inviteExpiresAt,
      },
    });

    return NextResponse.json(person, { status: 201 });
  } catch (error) {
    console.error("Error creating person:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// GET - Liste des personnes
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

    const persons = await prisma.person.findMany({
      where: { siteId },
      include: {
        manager: { select: { id: true, name: true } },
        subordinates: { select: { id: true, name: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(persons);
  } catch (error) {
    console.error("Error fetching persons:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
