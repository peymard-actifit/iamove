import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET - Enrichit les modules variés avec du contenu détaillé
 * Ajoute du content, des exercises et des resources selon le type
 */
export async function GET() {
  try {
    // Récupérer tous les modules sans contenu (ou avec contenu vide)
    const modules = await prisma.trainingModule.findMany({
      where: {
        OR: [
          { content: null },
          { content: "" },
        ],
      },
      include: {
        method: true,
        level: true,
      },
    });

    let updated = 0;
    let skipped = 0;

    for (const mod of modules) {
      const methodType = mod.method?.type;
      if (!methodType || methodType === "ARTICLE") {
        skipped++;
        continue;
      }

      // Générer le contenu selon le type
      const content = generateContent(methodType, mod.title, mod.description || "", mod.level?.number || 1);
      const exercises = generateExercises(methodType, mod.title, mod.level?.number || 1);
      const resources = generateResources(methodType, mod.title, mod.level?.number || 1);

      await prisma.trainingModule.update({
        where: { id: mod.id },
        data: {
          content,
          practicalExercises: exercises,
          resources,
        },
      });

      updated++;
    }

    return NextResponse.json({
      success: true,
      message: `${updated} modules enrichis, ${skipped} ignorés (articles ou déjà avec contenu)`,
      updated,
      skipped,
    });
  } catch (error) {
    console.error("[training/seed-modules-content] GET:", error);
    return NextResponse.json({ error: String(error), success: false }, { status: 500 });
  }
}

function generateContent(type: string, title: string, description: string, level: number): string {
  const intro = description || `Bienvenue dans ce module de formation sur "${title}".`;
  
  switch (type) {
    case "VIDEO":
      return `## À propos de cette vidéo

${intro}

### Ce que vous allez apprendre

Cette vidéo de formation vous permettra de :
- Comprendre les concepts clés présentés de manière visuelle
- Voir des exemples concrets et des démonstrations pratiques
- Acquérir des connaissances applicables immédiatement

### Points clés abordés

**1. Introduction et contexte**
Nous commençons par poser les bases et expliquer pourquoi ce sujet est important dans le domaine de l'IA.

**2. Concepts fondamentaux**
Les notions essentielles sont expliquées avec des animations et des schémas pour faciliter la compréhension.

**3. Applications pratiques**
Des exemples concrets montrent comment ces concepts s'appliquent dans des situations réelles.

**4. Bonnes pratiques**
Les recommandations des experts pour tirer le meilleur parti de ces connaissances.

### Conseils pour bien profiter de cette vidéo

- Prenez des notes pendant le visionnage
- N'hésitez pas à mettre en pause pour assimiler les concepts
- Revisionnez les passages complexes si nécessaire
- Appliquez immédiatement ce que vous apprenez

> 💡 **Astuce** : Cette vidéo fait partie d'un parcours de formation complet. Continuez avec les exercices pratiques pour consolider vos acquis.`;

    case "TUTORIAL":
      return `## Guide pas à pas

${intro}

### Prérequis

Avant de commencer ce tutoriel, assurez-vous d'avoir :
- Une compréhension de base des concepts de niveau ${Math.max(1, level - 1)}
- Un environnement de travail prêt (navigateur web, compte sur les outils mentionnés)
- Environ ${level * 5 + 10} minutes devant vous

### Étape 1 : Préparation

Commencez par vous familiariser avec l'interface et les outils que nous allons utiliser. Prenez le temps de bien comprendre les différentes fonctionnalités disponibles.

### Étape 2 : Configuration initiale

Suivez ces instructions pour configurer votre environnement :

1. Accédez à l'outil ou à la plateforme concernée
2. Créez un compte si ce n'est pas déjà fait
3. Familiarisez-vous avec les paramètres de base
4. Effectuez un premier test simple

### Étape 3 : Mise en pratique

Maintenant que tout est prêt, passons à la pratique :

\`\`\`
// Exemple de configuration ou de code
// Adaptez selon votre contexte
\`\`\`

### Étape 4 : Vérification et ajustements

Vérifiez que tout fonctionne correctement :
- Testez les différentes fonctionnalités
- Identifiez les points à améliorer
- Ajustez les paramètres si nécessaire

### Étape 5 : Consolidation

Pour ancrer vos apprentissages :
- Répétez les étapes clés plusieurs fois
- Essayez des variations sur le même thème
- Documentez vos découvertes

### Résumé

Vous avez maintenant les bases pour ${title.toLowerCase()}. Continuez à pratiquer régulièrement pour maîtriser parfaitement ces compétences.

> 🎯 **Prochain défi** : Essayez d'appliquer ce que vous avez appris dans un contexte différent.`;

    case "EXERCISE":
      return `## Exercice pratique

${intro}

### Objectifs de l'exercice

Cet exercice vous permettra de :
- Mettre en pratique les concepts appris
- Développer vos compétences par l'action
- Identifier vos points forts et axes d'amélioration
- Gagner en confiance dans l'utilisation de l'IA

### Contexte

Imaginez-vous dans une situation professionnelle où vous devez ${title.toLowerCase()}. Cet exercice simule ce contexte pour vous préparer à des cas réels.

### Instructions

**Partie 1 : Analyse** (${Math.floor(level * 2 + 5)} min)
- Lisez attentivement le scénario présenté
- Identifiez les éléments clés du problème
- Réfléchissez aux différentes approches possibles

**Partie 2 : Action** (${Math.floor(level * 3 + 10)} min)
- Appliquez la méthode que vous jugez la plus adaptée
- Documentez votre démarche
- Notez les difficultés rencontrées

**Partie 3 : Évaluation** (${Math.floor(level + 5)} min)
- Comparez votre résultat avec les critères de succès
- Identifiez ce qui a bien fonctionné
- Listez les points à améliorer

### Critères de succès

Votre exercice sera réussi si :
- ✅ Vous avez compris le problème posé
- ✅ Vous avez appliqué une méthode structurée
- ✅ Votre solution répond aux objectifs
- ✅ Vous pouvez expliquer votre démarche

### Conseils

- Ne vous précipitez pas : la réflexion est aussi importante que l'action
- N'hésitez pas à recommencer si vous n'êtes pas satisfait
- Documentez vos apprentissages pour progresser

> 💪 **Encouragement** : Chaque exercice vous rapproche de la maîtrise. Persévérez !`;

    case "SERIOUS_GAME":
      return `## Bienvenue dans ce Serious Game !

${intro}

### Règles du jeu

**Objectif principal**
Votre mission : ${title.toLowerCase()}. Relevez les défis proposés pour progresser et débloquer de nouvelles étapes.

**Comment jouer**

1. **Lisez le scénario** : Chaque niveau présente une situation à résoudre
2. **Faites vos choix** : Sélectionnez l'option qui vous semble la meilleure
3. **Observez les conséquences** : Découvrez l'impact de vos décisions
4. **Apprenez et progressez** : Tirez les leçons de chaque situation

### Niveaux de difficulté

🌱 **Niveau Découverte** (1-5)
Introduction aux concepts de base. Les erreurs sont pardonnées, l'objectif est d'apprendre.

🌿 **Niveau Intermédiaire** (6-10)
Les défis se complexifient. Vous devez combiner plusieurs compétences.

🌳 **Niveau Avancé** (11-15)
Situations réalistes nécessitant une analyse approfondie.

🎓 **Niveau Expert** (16-20)
Cas complexes proches de la réalité professionnelle.

### Votre progression

Votre niveau actuel : **${level}**

Points à gagner dans ce module :
- 🏆 Complétion : 100 points
- ⭐ Excellence : 50 points bonus
- ⚡ Rapidité : jusqu'à 25 points bonus

### Conseils pour réussir

- Prenez le temps de lire chaque situation attentivement
- Réfléchissez avant de faire vos choix
- Apprenez de vos erreurs : elles font partie du jeu !
- Rejouez pour explorer d'autres stratégies

> 🎮 **Prêt à jouer ?** Lancez-vous dans l'aventure et devenez expert en IA !`;

    case "INTERACTIVE":
      return `## Module Interactif

${intro}

### Comment utiliser ce module

Ce module interactif vous permet d'explorer et d'expérimenter directement avec les concepts de l'IA. Manipulez les paramètres, observez les résultats, et apprenez par l'expérimentation.

### Fonctionnalités disponibles

**🔧 Zone d'expérimentation**
Testez différentes configurations et observez immédiatement les résultats. Modifiez les paramètres et voyez comment cela impacte les sorties.

**📊 Visualisations**
Des graphiques et schémas dynamiques vous aident à comprendre les mécanismes sous-jacents.

**💬 Feedback en temps réel**
Le système vous guide et vous donne des retours sur vos actions.

### Parcours suggéré

**Étape 1 : Exploration libre** (5-10 min)
Familiarisez-vous avec l'interface. Cliquez partout, testez les différents contrôles.

**Étape 2 : Expérimentation guidée** (10-15 min)
Suivez les suggestions du module pour découvrir les fonctionnalités avancées.

**Étape 3 : Défis** (15-20 min)
Relevez les défis proposés pour valider votre compréhension.

### Indicateurs de progression

📈 **Votre progression** : Le module suit votre avancement et adapte les défis à votre niveau.

🎯 **Objectifs** : Atteignez les objectifs pour débloquer du contenu supplémentaire.

🏅 **Badges** : Collectez des badges en maîtrisant différentes compétences.

### Ressources complémentaires

Si vous souhaitez approfondir :
- Consultez la documentation technique
- Regardez les tutoriels vidéo associés
- Échangez avec la communauté

> 🔬 **Expérimentez sans crainte** : Ce module est un espace d'apprentissage sécurisé. Testez, échouez, apprenez !`;

    default:
      return intro;
  }
}

function generateExercises(type: string, title: string, level: number): Array<{ title: string; description: string; instructions: string }> {
  if (type === "ARTICLE" || type === "VIDEO") {
    return [];
  }

  const baseExercises = [
    {
      title: "Mise en pratique",
      description: `Appliquez les concepts de "${title}" dans un contexte pratique.`,
      instructions: "1. Identifiez un cas d'usage pertinent\n2. Appliquez la méthode apprise\n3. Documentez vos résultats\n4. Analysez ce qui a fonctionné ou non",
    },
    {
      title: "Analyse critique",
      description: "Évaluez les avantages et inconvénients de l'approche présentée.",
      instructions: "1. Listez 3 avantages de cette méthode\n2. Identifiez 2 limitations potentielles\n3. Proposez une amélioration\n4. Comparez avec d'autres approches",
    },
  ];

  if (level >= 10) {
    baseExercises.push({
      title: "Cas avancé",
      description: "Résolvez un problème complexe combinant plusieurs compétences.",
      instructions: "1. Analysez le problème dans sa globalité\n2. Décomposez-le en sous-problèmes\n3. Appliquez les méthodes appropriées\n4. Synthétisez et présentez votre solution",
    });
  }

  return baseExercises;
}

function generateResources(type: string, title: string, level: number): Array<{ type: string; title: string; url: string; description: string }> {
  const resources: Array<{ type: string; title: string; url: string; description: string }> = [];

  // Ajouter des ressources selon le type et le niveau
  if (type === "VIDEO" || type === "TUTORIAL") {
    resources.push({
      type: "documentation",
      title: "Documentation officielle",
      url: "https://docs.example.com",
      description: "Référence technique complète",
    });
  }

  if (type === "EXERCISE" || type === "SERIOUS_GAME") {
    resources.push({
      type: "tool",
      title: "Outil de pratique",
      url: "https://tools.example.com",
      description: "Plateforme pour s'exercer",
    });
  }

  if (type === "INTERACTIVE") {
    resources.push({
      type: "interactive",
      title: "Playground IA",
      url: "https://playground.example.com",
      description: "Environnement d'expérimentation",
    });
  }

  if (level >= 10) {
    resources.push({
      type: "article",
      title: "Article de référence",
      url: "https://research.example.com",
      description: "Approfondissement théorique",
    });
  }

  return resources;
}
