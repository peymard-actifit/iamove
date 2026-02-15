import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { TrainingMethodType } from "@prisma/client";

/**
 * Parcours transversaux motivants avec diversité de formats.
 * Chaque parcours mélange VIDEO, TUTORIAL, EXERCISE, SERIOUS_GAME, INTERACTIVE
 * pour une progression ludique et concrète.
 */

interface PathDefinition {
  name: string;
  description: string;
  levelNumber: number; // niveau recommandé (début du parcours)
  items: { title: string; type: TrainingMethodType }[]; // titre exact du module existant + type pour lookup
}

const DIVERSE_PATHS: PathDefinition[] = [
  // ─── PARCOURS 1 : Explorer IA (Niveaux 5→9) ────────────────────────────────
  {
    name: "Explorer IA : De la Théorie à la Pratique",
    description: `Un parcours progressif et ludique pour passer de la compréhension du Machine Learning à l'IA responsable. Chaque étape alterne entre découverte visuelle, expérimentation pratique et défis engageants.

**Objectifs :**
• Comprendre comment une IA apprend à partir des données
• Expérimenter la création de modèles et le prompt engineering
• Développer un regard critique sur les biais et l'éthique de l'IA
• Savoir prendre des décisions responsables face aux dilemmes de l'IA

**Public :** Niveaux 5 à 9 — Vous maîtrisez les bases de l'IA et voulez passer à la pratique.
**Durée estimée :** ~3h30 réparties en 7 étapes`,
    levelNumber: 5,
    items: [
      // Étape 1 : Hook visuel — comprendre l'apprentissage
      { title: "Comment une IA apprend-elle ?", type: "VIDEO" },
      // Étape 2 : Mise en pratique immédiate — entraîner un modèle
      { title: "Playground : Entraîner un classificateur", type: "INTERACTIVE" },
      // Étape 3 : Montée en compétence — analyser des données
      { title: "Analyser des données avec l'IA", type: "TUTORIAL" },
      // Étape 4 : Challenge ludique — maîtriser les prompts
      { title: "Prompt Master", type: "SERIOUS_GAME" },
      // Étape 5 : Travail analytique — détecter les biais
      { title: "Audit : Trouver les biais dans un dataset", type: "EXERCISE" },
      // Étape 6 : Réflexion guidée — naviguer les dilemmes éthiques
      { title: "Simulateur de décision éthique", type: "INTERACTIVE" },
      // Étape 7 : Conclusion mémorable — jugement et responsabilité
      { title: "Le tribunal de l'IA", type: "SERIOUS_GAME" },
    ],
  },

  // ─── PARCOURS 2 : Builder IA (Niveaux 10→14) ───────────────────────────────
  {
    name: "Builder IA : Du Code au Déploiement",
    description: `Un parcours technique et stimulant pour passer de la gouvernance IA à la mise en production de modèles. Alternance de cadrage réglementaire, coding hands-on, simulations réalistes et défis gamifiés.

**Objectifs :**
• Maîtriser le cadre réglementaire européen (AI Act, RGPD)
• Intégrer des API d'IA (OpenAI, Anthropic) dans une application
• Simuler un déploiement en production de bout en bout
• Mettre en place un pipeline MLOps complet avec monitoring

**Public :** Niveaux 10 à 14 — Vous comprenez l'IA et voulez la construire et la déployer.
**Durée estimée :** ~5h réparties en 8 étapes`,
    levelNumber: 10,
    items: [
      // Étape 1 : Contexte réglementaire — savoir avant de faire
      { title: "AI Act européen : ce que vous devez savoir", type: "VIDEO" },
      // Étape 2 : Gamification du cadrage — rendre le réglementaire engageant
      { title: "AI Compliance Challenge", type: "SERIOUS_GAME" },
      // Étape 3 : Hands-on technique — première intégration d'API
      { title: "Intégrer l'API Claude dans une app", type: "TUTORIAL" },
      // Étape 4 : Pratique de code — consolider par l'exercice
      { title: "Coding : Premier appel API OpenAI", type: "EXERCISE" },
      // Étape 5 : Simulation réaliste — préparer le déploiement
      { title: "Deployment Simulator", type: "INTERACTIVE" },
      // Étape 6 : Workflow data science — structurer le travail
      { title: "Créer un notebook Jupyter pour le ML", type: "TUTORIAL" },
      // Étape 7 : Challenge final immersif — gérer la production
      { title: "MLOps Simulator", type: "SERIOUS_GAME" },
      // Étape 8 : Compétence technique finale — outillage MLOps
      { title: "MLOps : Configurer MLflow", type: "EXERCISE" },
    ],
  },
];

/**
 * GET — Seed les parcours diversifiés transversaux
 */
export async function GET() {
  try {
    // Récupérer les méthodes (pour lookup par type)
    const methods = await prisma.trainingMethod.findMany({ where: { isActive: true } });
    const methodMap = new Map(methods.map((m) => [m.type, m.id]));

    // Récupérer les niveaux
    const levels = await prisma.level.findMany({ orderBy: { number: "asc" } });
    const levelMap = new Map(levels.map((l) => [l.number, l.id]));

    const results: {
      path: string;
      created: boolean;
      itemsLinked: number;
      itemsMissing: string[];
    }[] = [];

    for (const pathDef of DIVERSE_PATHS) {
      // Vérifier si ce parcours existe déjà
      const existing = await prisma.trainingPath.findFirst({
        where: { name: pathDef.name },
        include: { items: true },
      });

      if (existing) {
        results.push({
          path: pathDef.name,
          created: false,
          itemsLinked: existing.items.length,
          itemsMissing: [],
        });
        continue;
      }

      // Créer le parcours
      const levelId = levelMap.get(pathDef.levelNumber);
      const path = await prisma.trainingPath.create({
        data: {
          name: pathDef.name,
          description: pathDef.description,
          order: 100 + DIVERSE_PATHS.indexOf(pathDef), // Après les parcours par niveau
          isActive: true,
          ...(levelId && { levelId }),
        },
      });

      // Lier les modules existants au parcours
      let itemsLinked = 0;
      const itemsMissing: string[] = [];

      for (let i = 0; i < pathDef.items.length; i++) {
        const item = pathDef.items[i];
        const methodId = methodMap.get(item.type);

        if (!methodId) {
          itemsMissing.push(`${item.title} (méthode ${item.type} introuvable)`);
          continue;
        }

        // Chercher le module par titre exact et type de méthode
        const module = await prisma.trainingModule.findFirst({
          where: {
            title: item.title,
            methodId,
            isActive: true,
          },
        });

        if (!module) {
          itemsMissing.push(`${item.title} (${item.type})`);
          continue;
        }

        // Vérifier que l'item n'existe pas déjà
        const existingItem = await prisma.trainingPathItem.findFirst({
          where: { pathId: path.id, moduleId: module.id },
        });

        if (!existingItem) {
          await prisma.trainingPathItem.create({
            data: {
              pathId: path.id,
              moduleId: module.id,
              order: i,
            },
          });
          itemsLinked++;
        }
      }

      results.push({
        path: pathDef.name,
        created: true,
        itemsLinked,
        itemsMissing,
      });
    }

    return NextResponse.json({
      success: true,
      message: `${results.filter((r) => r.created).length} parcours créés`,
      results,
    });
  } catch (error) {
    console.error("[training/seed-paths-diverse] GET:", error);
    return NextResponse.json({ error: String(error), success: false }, { status: 500 });
  }
}
