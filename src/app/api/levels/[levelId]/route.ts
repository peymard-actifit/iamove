import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// Les 26 langues cibles (sans FR)
const TARGET_LANGUAGES = [
  "EN", "DE", "ES", "IT", "PT", "NL", "PL", "RU", "JA", "ZH",
  "KO", "AR", "TR", "SV", "DA", "FI", "NO", "CS", "EL", "HU",
  "RO", "SK", "UK", "BG", "HR"
];

// Fonction pour traduire via DeepL
async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text || text.trim() === "") return "";
  
  const DEEPL_API_KEY = process.env.DEEPL_API_KEY;
  if (!DEEPL_API_KEY) return text;

  try {
    const response = await fetch("https://api.deepl.com/v2/translate", {
      method: "POST",
      headers: {
        "Authorization": `DeepL-Auth-Key ${DEEPL_API_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        text,
        source_lang: "FR",
        target_lang: targetLang,
      }),
    });

    if (!response.ok) return text;
    const data = await response.json();
    return data.translations?.[0]?.text || text;
  } catch {
    return text;
  }
}

interface RouteParams {
  params: Promise<{ levelId: string }>;
}

// PATCH - Modifier un niveau ou sa traduction
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès réservé aux administrateurs" },
        { status: 403 }
      );
    }

    const { levelId } = await params;
    const body = await request.json();
    const { name, category, seriousGaming, description, language } = body;

    // Si la langue est spécifiée et n'est pas FR, on modifie la traduction
    if (language && language !== "FR") {
      // Mettre à jour ou créer la traduction pour cette langue
      const translation = await prisma.levelTranslation.upsert({
        where: {
          levelId_language: { levelId, language },
        },
        update: {
          ...(name && { name }),
          ...(category !== undefined && { category }),
          ...(seriousGaming !== undefined && { seriousGaming }),
          ...(description !== undefined && { description }),
        },
        create: {
          levelId,
          language,
          name: name || "",
          category: category || "",
          seriousGaming: seriousGaming || "",
          description: description || "",
        },
      });

      return NextResponse.json(translation);
    }

    // Sinon, on modifie le niveau principal (FR) et on retraduit
    // Récupérer l'ancien niveau pour comparer
    const oldLevel = await prisma.level.findUnique({
      where: { id: levelId },
      select: { name: true, category: true, seriousGaming: true, description: true },
    });

    // Mettre à jour le niveau
    const level = await prisma.level.update({
      where: { id: levelId },
      data: {
        ...(name && { name }),
        ...(category !== undefined && { category }),
        ...(seriousGaming !== undefined && { seriousGaming }),
        ...(description !== undefined && { description }),
      },
    });

    // Vérifier si le contenu a changé
    const contentChanged = 
      (name && oldLevel?.name !== name) ||
      (category !== undefined && oldLevel?.category !== category) ||
      (seriousGaming !== undefined && oldLevel?.seriousGaming !== seriousGaming) ||
      (description !== undefined && oldLevel?.description !== description);

    // Si le contenu FR a changé, retraduire toutes les langues en arrière-plan
    if (contentChanged) {
      const finalName = name || oldLevel?.name || "";
      const finalCategory = category !== undefined ? category : (oldLevel?.category || "");
      const finalSeriousGaming = seriousGaming !== undefined ? seriousGaming : (oldLevel?.seriousGaming || "");
      const finalDescription = description !== undefined ? description : (oldLevel?.description || "");

      // Lancer la retraduction en arrière-plan (ne pas attendre)
      (async () => {
        try {
          for (const lang of TARGET_LANGUAGES) {
            const [transName, transCategory, transSeriousGaming, transDescription] = await Promise.all([
              translateText(finalName, lang),
              translateText(finalCategory, lang),
              translateText(finalSeriousGaming, lang),
              translateText(finalDescription, lang),
            ]);

            await prisma.levelTranslation.upsert({
              where: {
                levelId_language: { levelId, language: lang },
              },
              update: {
                name: transName,
                category: transCategory,
                seriousGaming: transSeriousGaming,
                description: transDescription,
              },
              create: {
                levelId,
                language: lang,
                name: transName,
                category: transCategory,
                seriousGaming: transSeriousGaming,
                description: transDescription,
              },
            });
          }
          console.log(`Level ${levelId} retranslated to all languages`);
        } catch (error) {
          console.error(`Error retranslating level ${levelId}:`, error);
        }
      })();
    }

    return NextResponse.json(level);
  } catch (error) {
    console.error("Error updating level:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
