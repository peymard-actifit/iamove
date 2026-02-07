import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import levelsData from "@/data/levels.json";

export async function POST() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès réservé aux administrateurs" },
        { status: 403 }
      );
    }

    // Créer ou mettre à jour les 21 niveaux
    const results = [];
    for (const level of levelsData.levels) {
      const result = await prisma.level.upsert({
        where: { number: level.number },
        update: {
          name: level.name,
          category: level.category || "",
          seriousGaming: level.seriousGaming,
          description: level.description,
        },
        create: {
          number: level.number,
          name: level.name,
          category: level.category || "",
          seriousGaming: level.seriousGaming,
          description: level.description,
        },
      });
      results.push(result);
    }

    return NextResponse.json({
      success: true,
      message: `${results.length} niveaux créés/mis à jour`,
      levels: results,
    });
  } catch (error) {
    console.error("Error seeding levels:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
