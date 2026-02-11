import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 50 parcours thématiques inspirants sur l'IA
const PARCOURS_THEMATIQUES = [
  // 🎯 Productivité & Efficacité
  { name: "Boostez votre productivité avec l'IA", description: "Découvrez comment l'IA peut transformer votre quotidien professionnel et vous faire gagner des heures chaque semaine.", category: "Productivité" },
  { name: "L'IA, votre assistant personnel ultime", description: "Apprenez à déléguer intelligemment à l'IA pour vous concentrer sur ce qui compte vraiment.", category: "Productivité" },
  { name: "Automatiser sans coder : la magie du no-code IA", description: "Créez des automatisations puissantes sans écrire une seule ligne de code grâce aux outils IA.", category: "Productivité" },
  { name: "Maîtriser l'art du prompt engineering", description: "Les secrets pour obtenir exactement ce que vous voulez des IA génératives.", category: "Productivité" },
  { name: "De débutant à expert ChatGPT en 7 jours", description: "Un parcours intensif pour maîtriser l'outil qui révolutionne le travail.", category: "Productivité" },

  // 🎨 Créativité & Design
  { name: "L'IA au service de votre créativité", description: "Libérez votre potentiel créatif en collaborant avec l'intelligence artificielle.", category: "Créativité" },
  { name: "Créer des visuels époustouflants avec Midjourney", description: "De l'idée à l'image parfaite : maîtrisez l'art de la génération d'images.", category: "Créativité" },
  { name: "Écriture créative augmentée par l'IA", description: "Comment l'IA peut devenir votre meilleur partenaire d'écriture.", category: "Créativité" },
  { name: "Design thinking à l'ère de l'IA", description: "Réinventez votre processus créatif avec les nouveaux outils intelligents.", category: "Créativité" },
  { name: "L'IA et l'art : une révolution en marche", description: "Explorez les frontières entre création humaine et intelligence artificielle.", category: "Créativité" },

  // 💼 Business & Stratégie
  { name: "L'IA, levier de croissance pour votre entreprise", description: "Identifiez les opportunités IA qui transformeront votre business.", category: "Business" },
  { name: "Prendre des décisions éclairées grâce à l'IA", description: "Comment l'analyse prédictive peut guider vos choix stratégiques.", category: "Business" },
  { name: "Transformer l'expérience client avec l'IA", description: "Créez des expériences personnalisées qui fidélisent vos clients.", category: "Business" },
  { name: "L'IA pour les entrepreneurs ambitieux", description: "Les outils IA essentiels pour lancer et développer votre startup.", category: "Business" },
  { name: "ROI de l'IA : mesurer pour mieux investir", description: "Apprenez à quantifier l'impact réel de vos initiatives IA.", category: "Business" },

  // 🔬 Science & Recherche
  { name: "Les mystères du cerveau artificiel", description: "Plongez dans les secrets des réseaux de neurones et leur fonctionnement fascinant.", category: "Science" },
  { name: "L'IA qui apprend comme un enfant", description: "Découvrez comment les machines acquièrent des connaissances de manière autonome.", category: "Science" },
  { name: "Quand l'IA dépasse l'humain : mythes et réalités", description: "Une exploration scientifique des capacités et limites de l'IA.", category: "Science" },
  { name: "L'IA quantique : la prochaine révolution", description: "Anticipez les bouleversements que l'informatique quantique apportera à l'IA.", category: "Science" },
  { name: "Comprendre GPT : du papier fondateur à ChatGPT", description: "L'histoire fascinante des modèles de langage qui ont changé le monde.", category: "Science" },

  // 🛡️ Éthique & Responsabilité
  { name: "IA éthique : construire un futur responsable", description: "Les principes fondamentaux pour une IA au service de l'humanité.", category: "Éthique" },
  { name: "Biais algorithmiques : les comprendre pour les combattre", description: "Identifiez et corrigez les préjugés cachés dans les systèmes d'IA.", category: "Éthique" },
  { name: "Vie privée à l'ère de l'IA : protégez vos données", description: "Les enjeux de la protection des données face aux systèmes intelligents.", category: "Éthique" },
  { name: "L'IA et l'emploi : menace ou opportunité ?", description: "Préparez-vous aux transformations du marché du travail.", category: "Éthique" },
  { name: "Gouverner l'IA : enjeux démocratiques", description: "Comment nos sociétés peuvent encadrer cette technologie transformatrice.", category: "Éthique" },

  // 🏥 Santé & Bien-être
  { name: "L'IA au chevet des patients", description: "Comment l'intelligence artificielle révolutionne le diagnostic et le traitement.", category: "Santé" },
  { name: "Santé mentale et IA : nouvelles perspectives", description: "Les applications prometteuses de l'IA pour le bien-être psychologique.", category: "Santé" },
  { name: "Médecine personnalisée grâce à l'IA", description: "Vers des traitements sur mesure guidés par l'intelligence artificielle.", category: "Santé" },
  { name: "L'IA pour vivre plus longtemps et en meilleure santé", description: "Les avancées de l'IA dans la recherche sur la longévité.", category: "Santé" },
  { name: "Sport et performance : l'IA comme coach", description: "Optimisez vos entraînements avec l'intelligence artificielle.", category: "Santé" },

  // 🌍 Environnement & Développement durable
  { name: "L'IA pour sauver la planète", description: "Comment l'intelligence artificielle combat le changement climatique.", category: "Environnement" },
  { name: "Agriculture intelligente : nourrir le monde demain", description: "L'IA au service d'une agriculture durable et efficace.", category: "Environnement" },
  { name: "Villes intelligentes : l'IA au cœur de l'urbanisme", description: "Construire des métropoles durables grâce aux données et à l'IA.", category: "Environnement" },
  { name: "Énergie et IA : vers un futur décarboné", description: "Optimiser la production et la consommation énergétique avec l'IA.", category: "Environnement" },
  { name: "Biodiversité : l'IA gardienne de la nature", description: "Comment l'IA aide à protéger les espèces menacées.", category: "Environnement" },

  // 🎓 Éducation & Formation
  { name: "Apprendre à apprendre avec l'IA", description: "Transformez votre façon d'acquérir de nouvelles compétences.", category: "Éducation" },
  { name: "L'enseignant augmenté par l'IA", description: "Comment l'IA peut enrichir la pédagogie et personnaliser l'apprentissage.", category: "Éducation" },
  { name: "Formation continue à l'ère de l'IA", description: "Restez compétitif en développant vos compétences avec l'aide de l'IA.", category: "Éducation" },
  { name: "L'IA pour les enfants : éduquer les citoyens de demain", description: "Préparer la nouvelle génération à vivre avec l'intelligence artificielle.", category: "Éducation" },
  { name: "Langues et IA : parlez le monde entier", description: "Comment l'IA révolutionne l'apprentissage des langues.", category: "Éducation" },

  // 🎮 Divertissement & Médias
  { name: "L'IA réinvente le divertissement", description: "Jeux vidéo, cinéma, musique : l'IA transforme nos loisirs.", category: "Divertissement" },
  { name: "Créer de la musique avec l'IA", description: "Composez comme un pro grâce aux outils de génération musicale.", category: "Divertissement" },
  { name: "Journalisme et IA : informer autrement", description: "Comment l'IA transforme la production et la diffusion de l'information.", category: "Divertissement" },
  { name: "L'IA dans votre salon : objets connectés intelligents", description: "Découvrez comment l'IA améliore votre quotidien à la maison.", category: "Divertissement" },
  { name: "Réalité virtuelle et IA : immersion totale", description: "Quand l'intelligence artificielle crée des mondes virtuels.", category: "Divertissement" },

  // 🚀 Innovation & Futur
  { name: "Les métiers de demain créés par l'IA", description: "Anticipez les nouvelles opportunités professionnelles.", category: "Innovation" },
  { name: "IA et robotique : la révolution en marche", description: "Des usines aux foyers, les robots intelligents arrivent.", category: "Innovation" },
  { name: "Véhicules autonomes : conduire sans les mains", description: "L'IA au volant : état des lieux et perspectives.", category: "Innovation" },
  { name: "L'IA qui comprend vos émotions", description: "L'affective computing et ses applications fascinantes.", category: "Innovation" },
  { name: "Vers l'intelligence artificielle générale", description: "Le grand défi scientifique : créer une IA véritablement intelligente.", category: "Innovation" },
];

/**
 * GET - Crée 50 parcours thématiques inspirants
 */
export async function GET() {
  try {
    const results: { name: string; created: boolean; category: string }[] = [];

    // Récupérer le dernier ordre utilisé
    const lastPath = await prisma.trainingPath.findFirst({
      orderBy: { order: "desc" },
    });
    let currentOrder = (lastPath?.order ?? 19) + 1;

    for (const parcours of PARCOURS_THEMATIQUES) {
      // Vérifier si un parcours avec ce nom existe déjà
      const existing = await prisma.trainingPath.findFirst({
        where: { name: parcours.name },
      });

      if (existing) {
        results.push({ name: parcours.name, created: false, category: parcours.category });
        continue;
      }

      // Créer le parcours
      await prisma.trainingPath.create({
        data: {
          name: parcours.name,
          description: `**${parcours.category}**\n\n${parcours.description}`,
          order: currentOrder++,
          isActive: true,
        },
      });

      results.push({ name: parcours.name, created: true, category: parcours.category });
    }

    const created = results.filter(r => r.created).length;
    const existing = results.filter(r => !r.created).length;

    // Grouper par catégorie pour le résumé
    const byCategory = results.reduce((acc, r) => {
      if (!acc[r.category]) acc[r.category] = { created: 0, existing: 0 };
      if (r.created) acc[r.category].created++;
      else acc[r.category].existing++;
      return acc;
    }, {} as Record<string, { created: number; existing: number }>);

    return NextResponse.json({
      success: true,
      message: `${created} parcours thématiques créés, ${existing} existants`,
      created,
      existing,
      byCategory,
      parcours: results,
    });
  } catch (error) {
    console.error("[training/seed-paths-extra] GET:", error);
    return NextResponse.json({ error: String(error), success: false }, { status: 500 });
  }
}
