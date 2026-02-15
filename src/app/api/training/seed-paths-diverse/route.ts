import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { TrainingMethodType } from "@prisma/client";

/**
 * Parcours mono-niveau ludiques et diversifiés.
 * Chaque parcours utilise les 6 types de méthodes disponibles au sein
 * d'un SEUL niveau, avec une progression pédagogique claire.
 */

interface PathDefinition {
  name: string;
  description: string;
  levelNumber: number;
  items: { title: string; type: TrainingMethodType }[];
}

const DIVERSE_PATHS: PathDefinition[] = [
  // ─── PARCOURS NIVEAU 7 : Maîtriser l'IA Générative ──────────────────────
  // Progression : Regarder → Lire → Explorer → Apprendre → Pratiquer → Jouer
  {
    name: "Niveau 7 : Maîtriser l'IA Générative — Parcours Complet",
    description: `Parcours immersif pour maîtriser les grands modèles de langage et l'IA générative. Six étapes qui alternent vidéo, lecture, expérimentation, tutoriel guidé, exercice pratique et défi ludique.

**Progression pédagogique :**
🎬 Découvrir → 📖 Comprendre → 🔬 Explorer → 📘 Apprendre → 🔧 Pratiquer → 🎮 Se dépasser

**Objectifs concrets :**
• Comprendre le fonctionnement interne de ChatGPT et des LLM
• Savoir formuler des prompts efficaces et créatifs
• Être capable de construire un chatbot personnalisé
• Maîtriser les techniques avancées du prompt engineering

**Durée estimée :** ~2h50`,
    levelNumber: 7,
    items: [
      // 1. Hook visuel — comprendre comment ChatGPT fonctionne
      { title: "ChatGPT : comment ça marche vraiment ?", type: "VIDEO" },
      // 2. Lecture approfondie — bases théoriques des LLM
      { title: "IA générative et grands modèles de langage (LLM)", type: "ARTICLE" },
      // 3. Expérimentation libre — tester et comparer ses prompts
      { title: "Laboratoire de prompts", type: "INTERACTIVE" },
      // 4. Apprentissage guidé — construire un chatbot pas-à-pas
      { title: "Créer un chatbot personnalisé", type: "TUTORIAL" },
      // 5. Mise en pratique — créer 10 prompts créatifs
      { title: "Challenge : Créer 10 prompts créatifs", type: "EXERCISE" },
      // 6. Défi final — compétition de prompt engineering
      { title: "Prompt Master", type: "SERIOUS_GAME" },
    ],
  },

  // ─── PARCOURS NIVEAU 12 : Déployer l'IA en Production ───────────────────
  // Progression : Comprendre → Voir → Apprendre → Simuler → Pratiquer → Défier
  {
    name: "Niveau 12 : Déployer l'IA en Production — Parcours Complet",
    description: `Parcours technique et stimulant pour passer de la théorie au déploiement réel d'un modèle IA. Six étapes qui mêlent lecture de cadrage, démonstration vidéo, tutoriel Docker, simulation de déploiement, exercice pratique et défi contre-la-montre.

**Progression pédagogique :**
📖 Comprendre → 🎬 Voir → 📘 Apprendre → 🔬 Simuler → 🔧 Pratiquer → 🎮 Se dépasser

**Objectifs concrets :**
• Comprendre le cycle de déploiement d'un modèle IA (API, conteneur, monitoring)
• Savoir conteneuriser un modèle avec Docker
• Simuler un déploiement en production de bout en bout
• Publier un modèle sur Hugging Face

**Durée estimée :** ~4h20`,
    levelNumber: 12,
    items: [
      // 1. Cadrage théorique — comprendre l'intégration applicative
      { title: "Intégrer un modèle IA dans une application", type: "ARTICLE" },
      // 2. Démonstration visuelle — voir les étapes clés du déploiement
      { title: "Déployer un modèle ML en production", type: "VIDEO" },
      // 3. Apprentissage guidé — packager avec Docker
      { title: "Conteneuriser un modèle avec Docker", type: "TUTORIAL" },
      // 4. Simulation réaliste — déployer dans un environnement virtuel
      { title: "Deployment Simulator", type: "INTERACTIVE" },
      // 5. Mise en pratique — publier un vrai modèle
      { title: "DevOps : Déployer un modèle sur Hugging Face", type: "EXERCISE" },
      // 6. Défi final contre-la-montre — mettre en production avant le deadline
      { title: "Deploy or Die", type: "SERIOUS_GAME" },
    ],
  },
];

/**
 * GET — Seed les parcours diversifiés mono-niveau
 *
 * L'endpoint commence par supprimer les anciens parcours multi-niveaux
 * (créés par erreur dans une version précédente), puis crée les nouveaux.
 */
export async function GET() {
  try {
    // ── Nettoyage des anciens parcours multi-niveaux ────────────────────
    const oldPaths = await prisma.trainingPath.findMany({
      where: {
        OR: [
          { name: "Explorer IA : De la Théorie à la Pratique" },
          { name: "Builder IA : Du Code au Déploiement" },
        ],
      },
      select: { id: true, name: true },
    });

    let cleaned = 0;
    for (const old of oldPaths) {
      await prisma.trainingPathItem.deleteMany({ where: { pathId: old.id } });
      await prisma.trainingPath.delete({ where: { id: old.id } });
      cleaned++;
    }

    // ── Récupérer les méthodes et niveaux ───────────────────────────────
    const methods = await prisma.trainingMethod.findMany({ where: { isActive: true } });
    const methodMap = new Map(methods.map((m) => [m.type, m.id]));

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

      // Créer le parcours — rattaché au bon niveau
      const levelId = levelMap.get(pathDef.levelNumber);
      const path = await prisma.trainingPath.create({
        data: {
          name: pathDef.name,
          description: pathDef.description,
          order: 100 + DIVERSE_PATHS.indexOf(pathDef),
          isActive: true,
          ...(levelId && { levelId }),
        },
      });

      // Lier les modules existants (lookup par titre + type de méthode)
      let itemsLinked = 0;
      const itemsMissing: string[] = [];

      for (let i = 0; i < pathDef.items.length; i++) {
        const item = pathDef.items[i];
        const methodId = methodMap.get(item.type);

        if (!methodId) {
          itemsMissing.push(`${item.title} (méthode ${item.type} introuvable)`);
          continue;
        }

        // Pour ARTICLE, chercher par titre dans les modules du bon niveau
        const whereClause = item.type === "ARTICLE"
          ? { title: item.title, methodId, isActive: true, ...(levelId && { levelId }) }
          : { title: item.title, methodId, isActive: true };

        const module = await prisma.trainingModule.findFirst({ where: whereClause });

        if (!module) {
          itemsMissing.push(`${item.title} (${item.type})`);
          continue;
        }

        await prisma.trainingPathItem.create({
          data: {
            pathId: path.id,
            moduleId: module.id,
            order: i,
          },
        });
        itemsLinked++;
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
      message: `${cleaned} ancien(s) parcours supprimé(s), ${results.filter((r) => r.created).length} nouveau(x) créé(s)`,
      cleaned,
      results,
    });
  } catch (error) {
    console.error("[training/seed-paths-diverse] GET:", error);
    return NextResponse.json({ error: String(error), success: false }, { status: 500 });
  }
}
