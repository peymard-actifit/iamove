import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

// PATCH - Permettre à un utilisateur publié de définir son niveau via auto-évaluation
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
    const { currentLevel } = body;

    // Valider le niveau (0-20)
    if (typeof currentLevel !== "number" || currentLevel < 0 || currentLevel > 20) {
      return NextResponse.json(
        { error: "Niveau invalide (doit être entre 0 et 20)" },
        { status: 400 }
      );
    }

    // Utilisateur PERSON (site publié)
    if (session.userType === "PERSON") {
      // Vérifier que l'utilisateur appartient bien à ce site
      if (session.siteId !== siteId) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
      }

      // Récupérer la personne
      const person = await prisma.person.findUnique({
        where: { id: session.userId },
      });

      if (!person) {
        return NextResponse.json({ error: "Personne non trouvée" }, { status: 404 });
      }

      // Autoriser l'auto-évaluation uniquement si le niveau actuel est 0
      // Note: Si l'utilisateur choisit 0, l'auto-évaluation se redéclenchera au prochain login
      if (person.currentLevel !== 0) {
        return NextResponse.json(
          { error: "L'auto-évaluation n'est disponible que pour les utilisateurs de niveau 0" },
          { status: 400 }
        );
      }

      // Mettre à jour le niveau
      const updatedPerson = await prisma.person.update({
        where: { id: session.userId },
        data: { currentLevel },
      });

      return NextResponse.json({
        success: true,
        newLevel: updatedPerson.currentLevel,
        // Indiquer si l'auto-évaluation se redéclenchera (niveau 0 choisi)
        willRetrigger: currentLevel === 0,
      });
    }

    // Utilisateur STUDIO_USER (peut modifier via le studio)
    if (session.userType === "STUDIO_USER") {
      // Le studio utilise l'API standard /api/sites/[siteId]/persons/[personId]
      return NextResponse.json(
        { error: "Utilisez l'API standard pour le studio" },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Type d'utilisateur non supporté" }, { status: 400 });
  } catch (error) {
    console.error("Self-assessment error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
