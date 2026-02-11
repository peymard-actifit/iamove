import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET - Enrichit les parcours thématiques avec des modules de types variés
 * Ajoute au moins 2 types différents de modules par parcours
 */
export async function GET() {
  try {
    // Récupérer tous les parcours thématiques (ceux avec un levelId)
    const paths = await prisma.trainingPath.findMany({
      where: { 
        levelId: { not: null },
        isActive: true,
      },
      include: {
        level: true,
        items: {
          include: {
            module: {
              include: { method: true },
            },
          },
        },
      },
    });

    // Récupérer toutes les méthodes de formation
    const methods = await prisma.trainingMethod.findMany({
      where: { isActive: true },
    });
    const methodsByType = new Map(methods.map(m => [m.type, m]));

    const results: { 
      pathName: string; 
      level: number; 
      addedModules: { title: string; type: string }[];
      existingTypes: string[];
    }[] = [];

    for (const path of paths) {
      if (!path.level) continue;
      const levelNumber = path.level.number;
      
      // Types de modules déjà présents dans le parcours
      const existingTypes = new Set(
        path.items
          .map(item => item.module?.method?.type)
          .filter(Boolean) as string[]
      );

      // Types à ajouter pour avoir de la variété
      const allTypes = ["ARTICLE", "VIDEO", "TUTORIAL", "EXERCISE", "SERIOUS_GAME", "INTERACTIVE"];
      const typesToAdd = allTypes.filter(t => !existingTypes.has(t));

      const addedModules: { title: string; type: string }[] = [];
      let currentOrder = path.items.length;

      // Pour chaque type manquant, essayer d'ajouter un module du niveau approprié
      for (const type of typesToAdd) {
        const method = methodsByType.get(type);
        if (!method) continue;

        // Chercher un module de ce type au niveau du parcours (ou proche)
        const module = await prisma.trainingModule.findFirst({
          where: {
            methodId: method.id,
            isActive: true,
            level: {
              number: {
                gte: Math.max(1, levelNumber - 2),
                lte: Math.min(20, levelNumber + 2),
              },
            },
          },
          include: { level: true },
          orderBy: [
            { level: { number: "asc" } },
            { order: "asc" },
          ],
        });

        if (module) {
          // Vérifier que ce module n'est pas déjà dans le parcours
          const alreadyInPath = path.items.some(item => item.moduleId === module.id);
          if (!alreadyInPath) {
            await prisma.trainingPathItem.create({
              data: {
                pathId: path.id,
                moduleId: module.id,
                order: currentOrder++,
              },
            });
            addedModules.push({ title: module.title, type });
          }
        }

        // S'arrêter si on a ajouté au moins 2 types différents
        if (addedModules.length >= 2) break;
      }

      results.push({
        pathName: path.name,
        level: levelNumber,
        addedModules,
        existingTypes: Array.from(existingTypes),
      });
    }

    const enriched = results.filter(r => r.addedModules.length > 0).length;
    const totalModulesAdded = results.reduce((sum, r) => sum + r.addedModules.length, 0);

    return NextResponse.json({
      success: true,
      message: `${enriched} parcours enrichis, ${totalModulesAdded} modules ajoutés`,
      enriched,
      totalModulesAdded,
      results,
    });
  } catch (error) {
    console.error("[training/enrich-paths] GET:", error);
    return NextResponse.json({ error: String(error), success: false }, { status: 500 });
  }
}
