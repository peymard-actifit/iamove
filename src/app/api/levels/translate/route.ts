import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

import { TARGET_LANGUAGES, translateText } from "@/lib/deepl";

// GET : Récupérer les stats des traductions
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  
  // Vérification MAINTENANCE_KEY
  const MAINTENANCE_KEY = process.env.MAINTENANCE_KEY || "iamove-maint-2024";
  if (key !== MAINTENANCE_KEY) {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
  }

  try {
    const levels = await prisma.level.findMany({
      include: { translations: true },
      orderBy: { number: "asc" },
    });

    const stats = levels.map(level => ({
      number: level.number,
      name: level.name,
      translationsCount: level.translations.length,
      languages: level.translations.map(t => t.language),
    }));

    return NextResponse.json({
      totalLevels: levels.length,
      targetLanguages: TARGET_LANGUAGES.length,
      stats,
    });
  } catch (error) {
    console.error("Error fetching translation stats:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST : Traduire tous les niveaux dans toutes les langues
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  
  // Vérification MAINTENANCE_KEY
  const MAINTENANCE_KEY = process.env.MAINTENANCE_KEY || "iamove-maint-2024";
  if (key !== MAINTENANCE_KEY) {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
  }

  try {
    // Récupérer tous les niveaux
    const levels = await prisma.level.findMany({
      orderBy: { number: "asc" },
    });

    let created = 0;
    let skipped = 0;

    // Pour chaque niveau, créer les traductions
    for (const level of levels) {
      for (const lang of TARGET_LANGUAGES) {
        // Vérifier si la traduction existe déjà
        const existing = await prisma.levelTranslation.findUnique({
          where: {
            levelId_language: {
              levelId: level.id,
              language: lang,
            },
          },
        });

        if (existing) {
          skipped++;
          continue;
        }

        // Traduire les champs
        console.log(`Translating level ${level.number} to ${lang}...`);
        
        const [name, category, seriousGaming, description] = await Promise.all([
          translateText(level.name, lang),
          translateText(level.category, lang),
          translateText(level.seriousGaming, lang),
          translateText(level.description, lang),
        ]);

        // Créer la traduction
        await prisma.levelTranslation.create({
          data: {
            levelId: level.id,
            language: lang,
            name,
            category,
            seriousGaming,
            description,
          },
        });

        created++;
        
        // Petite pause pour éviter le rate limiting DeepL
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return NextResponse.json({
      success: true,
      created,
      skipped,
      message: `${created} traductions créées, ${skipped} existantes ignorées`,
    });
  } catch (error) {
    console.error("Error translating levels:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
