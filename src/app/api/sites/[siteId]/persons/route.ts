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

// POST - Créer une personne
export async function POST(
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
    const { name, email, jobTitle, department, managerId } = body;

    // Vérifier les droits (studio user ou person admin)
    const access = await checkAdminAccess(session, siteId);
    if ("error" in access) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    // Vérifier que le site existe
    const site = await prisma.site.findUnique({
      where: { id: siteId },
      include: { _count: { select: { persons: true } } },
    });

    if (!site) {
      return NextResponse.json({ error: "Site non trouvé" }, { status: 404 });
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

    // Transformer les données pour ne pas exposer le hash du password
    // mais indiquer si un password existe (pour l'UI)
    const safePersons = persons.map((person) => ({
      ...person,
      password: person.password ? "[SET]" : null, // Indique si un password existe sans exposer le hash
    }));

    return NextResponse.json(safePersons);
  } catch (error) {
    console.error("Error fetching persons:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
