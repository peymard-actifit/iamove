import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET : Récupérer les préférences de la personne connectée
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.userType !== "PERSON") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const person = await prisma.person.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        language: true,
        name: true,
        email: true,
      },
    });

    if (!person) {
      return NextResponse.json({ error: "Personne non trouvée" }, { status: 404 });
    }

    return NextResponse.json(person);
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PATCH : Mettre à jour les préférences (notamment la langue)
export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.userType !== "PERSON") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { language } = body;

    // Valider la langue
    const validLanguages = [
      "FR", "EN", "DE", "ES", "IT", "PT", "NL", "PL", "RU", "JA", "ZH",
      "KO", "AR", "TR", "SV", "DA", "FI", "NO", "CS", "EL", "HU",
      "RO", "SK", "UK", "BG", "HR"
    ];

    if (language && !validLanguages.includes(language.toUpperCase())) {
      return NextResponse.json({ error: "Langue non supportée" }, { status: 400 });
    }

    const updatedPerson = await prisma.person.update({
      where: { id: session.userId },
      data: {
        ...(language && { language: language.toUpperCase() }),
      },
      select: {
        id: true,
        language: true,
      },
    });

    return NextResponse.json(updatedPerson);
  } catch (error) {
    console.error("Error updating preferences:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
