import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Les 25 langues cibles (sans FR)
const TARGET_LANGUAGES = [
  "EN", "DE", "ES", "IT", "PT", "NL", "PL", "RU", "JA", "ZH",
  "KO", "AR", "TR", "SV", "DA", "FI", "NO", "CS", "EL", "HU",
  "RO", "SK", "UK", "BG", "HR"
];

// Traduction via DeepL
async function translateText(text: string, targetLang: string): Promise<string> {
  if (!process.env.DEEPL_API_KEY || !text || text.trim() === "") return text;

  try {
    const response = await fetch("https://api.deepl.com/v2/translate", {
      method: "POST",
      headers: {
        "Authorization": `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: [text],
        source_lang: "FR",
        target_lang: targetLang === "EN" ? "EN-US" : targetLang,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.translations[0]?.text || text;
    }
  } catch (error) {
    console.error(`[cron-levels] Erreur traduction ${targetLang}:`, error);
  }
  return text;
}

// GET handler pour le cron job Vercel
export async function GET(request: Request) {
  // Vérifier l'authentification
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    if (key !== process.env.MAINTENANCE_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const startTime = Date.now();

  try {
    // Récupérer tous les niveaux avec leurs traductions
    const levels = await prisma.level.findMany({
      include: { translations: true },
      orderBy: { number: "asc" },
    });

    let translationsCreated = 0;

    for (const level of levels) {
      const existingLangs = level.translations.map(t => t.language);
      const missingLangs = TARGET_LANGUAGES.filter(lang => !existingLangs.includes(lang));

      if (missingLangs.length === 0) continue;

      for (const lang of missingLangs) {
        const [transName, transCategory, transSeriousGaming, transDescription] = await Promise.all([
          translateText(level.name, lang),
          translateText(level.category, lang),
          translateText(level.seriousGaming, lang),
          translateText(level.description, lang),
        ]);

        await prisma.levelTranslation.create({
          data: {
            levelId: level.id,
            language: lang,
            name: transName,
            category: transCategory,
            seriousGaming: transSeriousGaming,
            description: transDescription,
          },
        });

        translationsCreated++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `${translationsCreated} traductions de niveaux créées`,
      processed: translationsCreated,
      duration: Date.now() - startTime,
    });
  } catch (error) {
    console.error("[cron-levels] Erreur:", error);
    return NextResponse.json(
      { error: String(error), duration: Date.now() - startTime },
      { status: 500 }
    );
  }
}
