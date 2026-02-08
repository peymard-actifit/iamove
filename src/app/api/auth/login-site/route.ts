import { NextResponse } from "next/server";
import { loginPerson, loginStudioUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { siteSlug, email, password } = body;

    if (!siteSlug || !email || !password) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    // Vérifier que le site existe et est publié
    const site = await prisma.site.findUnique({
      where: { slug: siteSlug },
    });

    if (!site) {
      return NextResponse.json({ error: "Site non trouvé" }, { status: 404 });
    }

    if (!site.isPublished) {
      return NextResponse.json(
        { error: "Ce site n'est pas publié" },
        { status: 403 }
      );
    }

    // Essayer de connecter en tant que personne du site
    const personResult = await loginPerson(siteSlug, email, password);

    if (personResult.success) {
      const personId = personResult.person!.id;
      // Mettre à jour le status en ligne + 10 PP (connexion site publié)
      await prisma.person.update({
        where: { id: personId },
        data: {
          isOnline: true,
          participationPoints: { increment: 10 },
        },
      });

      return NextResponse.json({
        success: true,
        userType: "PERSON",
        person: {
          id: personResult.person!.id,
          name: personResult.person!.name,
          email: personResult.person!.email,
        },
      });
    }

    // Si pas trouvé en tant que personne, essayer en tant qu'utilisateur studio
    const studioResult = await loginStudioUser(email, password);

    if (studioResult.success) {
      return NextResponse.json({
        success: true,
        userType: "STUDIO_USER",
        user: {
          id: studioResult.user!.id,
          name: studioResult.user!.name,
          email: studioResult.user!.email,
          role: studioResult.user!.role,
        },
      });
    }

    return NextResponse.json(
      { error: "Email ou mot de passe incorrect" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Login site error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
