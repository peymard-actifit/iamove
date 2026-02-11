import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Données des parcours par niveau
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

async function main() {
  console.log("🚀 Génération des parcours de formation...\n");

  // Récupérer les niveaux
  const levels = await prisma.level.findMany({
    where: { number: { gte: 1, lte: 20 } },
    orderBy: { number: "asc" },
  });

  if (levels.length === 0) {
    console.log("❌ Aucun niveau trouvé. Exécutez d'abord le seed des niveaux.");
    return;
  }

  // Récupérer la méthode ARTICLE pour associer les modules
  const articleMethod = await prisma.trainingMethod.findFirst({
    where: { type: "ARTICLE", isActive: true },
  });

  let created = 0;
  let existing = 0;

  for (const level of levels) {
    const parcoursInfo = PARCOURS_DATA[level.number];
    if (!parcoursInfo) continue;

    // Vérifier si un parcours existe déjà pour ce niveau
    const existingPath = await prisma.trainingPath.findFirst({
      where: { name: { contains: `Niveau ${level.number}` } },
    });

    if (existingPath) {
      console.log(`⏭️  Niveau ${level.number} : parcours existant`);
      existing++;
      continue;
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
    for (let i = 0; i < modules.length; i++) {
      await prisma.trainingPathItem.create({
        data: {
          pathId: path.id,
          moduleId: modules[i].id,
          order: i,
        },
      });
    }

    console.log(`✅ Niveau ${level.number} : "${parcoursInfo.title}" créé (${modules.length} modules)`);
    created++;
  }

  console.log(`\n📊 Résumé : ${created} parcours créés, ${existing} existants`);
}

main()
  .catch((e) => {
    console.error("Erreur:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
