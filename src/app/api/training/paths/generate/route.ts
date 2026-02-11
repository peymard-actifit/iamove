import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Données des parcours par niveau (générés avec l'IA, stockés ici pour rapidité)
const PARCOURS_DATA: Record<number, { title: string; description: string; objectives: string[] }> = {
  1: {
    title: "Découverte de l'IA",
    description: "Premier contact avec l'intelligence artificielle : comprendre ce qu'elle est, où elle se trouve, et pourquoi elle change notre quotidien.",
    objectives: ["Définir l'IA en termes simples", "Identifier l'IA dans la vie quotidienne", "Distinguer mythe et réalité"]
  },
  2: {
    title: "L'IA autour de nous",
    description: "Exploration des applications concrètes de l'IA dans les services numériques que nous utilisons chaque jour.",
    objectives: ["Reconnaître les applications IA courantes", "Comprendre les recommandations automatiques", "Utiliser les assistants vocaux"]
  },
  3: {
    title: "Comprendre les fondamentaux",
    description: "Acquisition des bases conceptuelles pour différencier l'IA de l'informatique classique et comprendre son fonctionnement général.",
    objectives: ["Différencier programmation classique et IA", "Comprendre le concept d'apprentissage", "Connaître les grandes familles d'IA"]
  },
  4: {
    title: "Types et applications de l'IA",
    description: "Panorama des différentes formes d'IA et de leurs domaines d'application dans le monde professionnel.",
    objectives: ["Classifier les types d'IA", "Identifier les cas d'usage par secteur", "Évaluer le potentiel pour son métier"]
  },
  5: {
    title: "Introduction au Machine Learning",
    description: "Plongée dans les concepts du machine learning : comment les machines apprennent à partir des données.",
    objectives: ["Comprendre l'apprentissage supervisé et non supervisé", "Connaître le cycle de vie d'un modèle ML", "Identifier les données d'entraînement"]
  },
  6: {
    title: "Deep Learning et réseaux de neurones",
    description: "Découverte des réseaux de neurones artificiels et du deep learning qui alimentent les IA les plus avancées.",
    objectives: ["Comprendre l'architecture des réseaux de neurones", "Différencier ML classique et deep learning", "Connaître les applications du DL"]
  },
  7: {
    title: "IA Générative et LLM",
    description: "Maîtrise des grands modèles de langage (ChatGPT, Claude, Mistral) et de l'IA générative pour texte et image.",
    objectives: ["Utiliser efficacement les LLM", "Comprendre le fonctionnement des prompts", "Évaluer les résultats générés"]
  },
  8: {
    title: "Données, biais et qualité",
    description: "Sensibilisation aux enjeux de qualité des données et aux biais algorithmiques qui impactent les systèmes d'IA.",
    objectives: ["Identifier les biais dans les données", "Évaluer la qualité d'un jeu de données", "Mettre en place des garde-fous"]
  },
  9: {
    title: "Éthique et IA responsable",
    description: "Principes et pratiques pour concevoir et déployer une IA éthique, transparente et respectueuse des valeurs.",
    objectives: ["Appliquer les principes d'IA responsable", "Évaluer l'impact sociétal", "Mettre en œuvre la transparence"]
  },
  10: {
    title: "Réglementation et gouvernance",
    description: "Maîtrise du cadre juridique (AI Act, RGPD) et des bonnes pratiques de gouvernance de l'IA en entreprise.",
    objectives: ["Connaître l'AI Act européen", "Appliquer le RGPD aux systèmes d'IA", "Mettre en place une gouvernance IA"]
  },
  11: {
    title: "Consommer des API d'IA",
    description: "Compétences techniques pour intégrer des modèles d'IA via API dans des applications métier.",
    objectives: ["Appeler une API OpenAI/Anthropic", "Gérer les erreurs et timeouts", "Optimiser les coûts d'utilisation"]
  },
  12: {
    title: "Intégration applicative",
    description: "Déploiement de modèles IA dans des applications réelles : architecture, bonnes pratiques et monitoring.",
    objectives: ["Déployer un modèle en production", "Mettre en place le monitoring", "Gérer le versioning des modèles"]
  },
  13: {
    title: "Data Science appliquée",
    description: "Maîtrise du pipeline data science : préparation des données, entraînement et évaluation des modèles.",
    objectives: ["Construire un pipeline de données", "Choisir les bonnes métriques", "Éviter le surapprentissage"]
  },
  14: {
    title: "MLOps et production",
    description: "Pratiques DevOps appliquées au Machine Learning : CI/CD, monitoring, et maintenance des modèles en production.",
    objectives: ["Implémenter un pipeline MLOps", "Surveiller la dérive des modèles", "Automatiser le réentraînement"]
  },
  15: {
    title: "Architectures Transformer",
    description: "Compréhension approfondie de l'architecture Transformer et du mécanisme d'attention à la base des LLM.",
    objectives: ["Comprendre l'attention multi-têtes", "Analyser l'architecture d'un LLM", "Optimiser pour le contexte long"]
  },
  16: {
    title: "Fine-tuning des LLM",
    description: "Techniques avancées pour adapter les grands modèles de langage à des tâches et domaines spécifiques.",
    objectives: ["Maîtriser LoRA et QLoRA", "Préparer des données de fine-tuning", "Évaluer un modèle fine-tuné"]
  },
  17: {
    title: "Recherche IA fondamentale",
    description: "Panorama de la recherche en IA : algorithmes émergents, théories et axes de recherche actuels.",
    objectives: ["Suivre la recherche en IA", "Comprendre les papiers de recherche", "Identifier les tendances émergentes"]
  },
  18: {
    title: "Leadership en recherche IA",
    description: "Compétences de direction pour piloter des équipes et programmes de recherche en intelligence artificielle.",
    objectives: ["Définir une feuille de route recherche", "Gérer des équipes pluridisciplinaires", "Établir des partenariats stratégiques"]
  },
  19: {
    title: "Influence et vision long-terme",
    description: "Contributions fondatrices et penseurs qui ont façonné l'IA moderne, pour développer une vision éclairée.",
    objectives: ["Connaître l'histoire de l'IA", "Analyser les travaux fondateurs", "Anticiper les évolutions futures"]
  },
  20: {
    title: "Frontières de l'IA",
    description: "Exploration des limites actuelles de l'IA et des pistes de rupture : AGI, alignement, et défis scientifiques.",
    objectives: ["Comprendre les enjeux de l'AGI", "Analyser le problème de l'alignement", "Évaluer les risques existentiels"]
  }
};

/**
 * POST - Génère automatiquement les parcours de formation pour tous les niveaux
 * Réservé aux admins
 */
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const { levelNumber, regenerate = false } = body as { levelNumber?: number; regenerate?: boolean };

    // Récupérer les niveaux et modules existants
    const levels = await prisma.level.findMany({
      where: levelNumber ? { number: levelNumber } : { number: { gte: 1, lte: 20 } },
      orderBy: { number: "asc" },
    });

    const articleMethod = await prisma.trainingMethod.findFirst({
      where: { type: "ARTICLE", isActive: true },
    });

    const results: { level: number; pathId: string; created: boolean; itemsCount: number }[] = [];

    for (const level of levels) {
      const parcoursInfo = PARCOURS_DATA[level.number];
      if (!parcoursInfo) continue;

      // Vérifier si un parcours existe déjà pour ce niveau
      const existingPath = await prisma.trainingPath.findFirst({
        where: { name: { contains: `Niveau ${level.number}` } },
      });

      if (existingPath && !regenerate) {
        results.push({
          level: level.number,
          pathId: existingPath.id,
          created: false,
          itemsCount: await prisma.trainingPathItem.count({ where: { pathId: existingPath.id } }),
        });
        continue;
      }

      // Supprimer l'ancien parcours si regenerate
      if (existingPath && regenerate) {
        await prisma.trainingPathItem.deleteMany({ where: { pathId: existingPath.id } });
        await prisma.trainingPath.delete({ where: { id: existingPath.id } });
      }

      // Créer le nouveau parcours
      const path = await prisma.trainingPath.create({
        data: {
          name: `Niveau ${level.number} : ${parcoursInfo.title}`,
          description: `${parcoursInfo.description}\n\n**Objectifs :**\n${parcoursInfo.objectives.map(o => `• ${o}`).join("\n")}`,
          order: level.number - 1,
          isActive: true,
        },
      });

      // Récupérer les modules (articles) pour ce niveau
      const modules = articleMethod
        ? await prisma.trainingModule.findMany({
            where: { methodId: articleMethod.id, levelId: level.id, isActive: true },
            orderBy: { order: "asc" },
          })
        : [];

      // Ajouter les modules au parcours
      let itemOrder = 0;
      for (const mod of modules) {
        await prisma.trainingPathItem.create({
          data: {
            pathId: path.id,
            moduleId: mod.id,
            order: itemOrder++,
          },
        });
      }

      results.push({
        level: level.number,
        pathId: path.id,
        created: true,
        itemsCount: itemOrder,
      });
    }

    return NextResponse.json({
      success: true,
      message: `${results.filter(r => r.created).length} parcours créés, ${results.filter(r => !r.created).length} existants`,
      results,
    });
  } catch (error) {
    console.error("[training/paths/generate] POST:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

/**
 * GET - Génère une description de parcours avec l'IA pour un niveau donné
 */
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const levelNumber = parseInt(searchParams.get("levelNumber") || "0", 10);

    if (levelNumber < 1 || levelNumber > 20) {
      return NextResponse.json({ error: "levelNumber doit être entre 1 et 20" }, { status: 400 });
    }

    // Récupérer les infos du niveau
    const level = await prisma.level.findFirst({
      where: { number: levelNumber },
    });

    if (!level) {
      return NextResponse.json({ error: "Niveau non trouvé" }, { status: 404 });
    }

    // Récupérer les modules existants pour ce niveau
    const modules = await prisma.trainingModule.findMany({
      where: { levelId: level.id, isActive: true },
      include: { method: { select: { name: true, type: true } } },
      orderBy: { order: "asc" },
    });

    // Utiliser les données prédéfinies ou générer avec l'IA
    const parcoursInfo = PARCOURS_DATA[levelNumber];

    if (parcoursInfo) {
      return NextResponse.json({
        levelNumber,
        levelName: level.name,
        title: parcoursInfo.title,
        description: parcoursInfo.description,
        objectives: parcoursInfo.objectives,
        availableModules: modules.map(m => ({
          id: m.id,
          title: m.title,
          type: m.method?.type,
          duration: m.duration,
        })),
      });
    }

    // Fallback: générer avec l'IA si pas de données prédéfinies
    const prompt = `Tu es un expert en formation IA. Génère un parcours de formation inspirant pour le niveau ${levelNumber} (${level.name}) de l'échelle de compétences IA.

Contexte du niveau :
- Nom : ${level.name}
- Catégorie : ${level.category || "Non définie"}
- Description : ${level.description || "Non définie"}

Modules disponibles :
${modules.map(m => `- ${m.title} (${m.method?.name || "Article"})`).join("\n")}

Réponds en JSON avec ce format exact :
{
  "title": "Titre court et inspirant du parcours",
  "description": "Description engageante de 2-3 phrases",
  "objectives": ["Objectif 1", "Objectif 2", "Objectif 3"]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content || "{}";
    const generated = JSON.parse(content.replace(/```json\n?|\n?```/g, ""));

    return NextResponse.json({
      levelNumber,
      levelName: level.name,
      ...generated,
      availableModules: modules.map(m => ({
        id: m.id,
        title: m.title,
        type: m.method?.type,
        duration: m.duration,
      })),
      generatedByAI: true,
    });
  } catch (error) {
    console.error("[training/paths/generate] GET:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
