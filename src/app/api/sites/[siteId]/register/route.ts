import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, createSession } from "@/lib/auth";

// POST - Auto-inscription sur un site publié
export async function POST(
  request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    const body = await request.json();
    const { email, password, firstName, lastName, jobTitle, department } = body;

    // Validation des champs requis
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Email, mot de passe, prénom et nom sont requis" },
        { status: 400 }
      );
    }

    // Validation du mot de passe
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 6 caractères" },
        { status: 400 }
      );
    }

    // Récupérer le site avec ses paramètres
    const site = await prisma.site.findUnique({
      where: { id: siteId },
      include: { settings: true },
    });

    if (!site) {
      return NextResponse.json({ error: "Site non trouvé" }, { status: 404 });
    }

    // Vérifier que le site est publié
    if (!site.isPublished) {
      return NextResponse.json(
        { error: "Ce site n'est pas encore publié" },
        { status: 400 }
      );
    }

    // Vérifier que l'inscription publique est activée
    if (!site.settings?.allowPublicRegistration) {
      return NextResponse.json(
        { error: "L'inscription publique n'est pas activée pour ce site" },
        { status: 403 }
      );
    }

    // Vérifier que l'email n'existe pas déjà dans ce site
    const existingPerson = await prisma.person.findUnique({
      where: {
        siteId_email: { siteId, email: email.toLowerCase() },
      },
    });

    if (existingPerson) {
      return NextResponse.json(
        { error: "Un compte avec cet email existe déjà" },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await hashPassword(password);

    // Créer le nom complet
    const name = `${firstName} ${lastName}`;

    // Créer la personne avec le mot de passe déjà défini
    const person = await prisma.person.create({
      data: {
        name,
        firstName,
        lastName,
        email: email.toLowerCase(),
        password: hashedPassword,
        jobTitle: jobTitle || null,
        department: department || null,
        siteId,
        currentLevel: 0, // Niveau 0 par défaut pour déclencher l'auto-évaluation
        lastLoginAt: new Date(),
        isOnline: true,
        lastSeenAt: new Date(),
      },
    });

    // Créer automatiquement une session pour l'utilisateur
    await createSession({
      userId: person.id,
      userType: "PERSON",
      email: person.email,
      name: person.name,
      siteId: site.id,
    });

    return NextResponse.json({
      success: true,
      person: {
        id: person.id,
        name: person.name,
        email: person.email,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Error registering person:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
