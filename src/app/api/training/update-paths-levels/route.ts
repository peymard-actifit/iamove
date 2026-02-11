import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Association des parcours thématiques avec leurs niveaux recommandés
const PARCOURS_LEVELS: Record<string, number> = {
  // 🎯 Productivité - Niveaux 1-4 (accessibles à tous)
  "Boostez votre productivité avec l'IA": 1,
  "L'IA, votre assistant personnel ultime": 2,
  "Automatiser sans coder : la magie du no-code IA": 3,
  "Maîtriser l'art du prompt engineering": 4,
  "De débutant à expert ChatGPT en 7 jours": 2,

  // 🎨 Créativité - Niveaux 3-7
  "L'IA au service de votre créativité": 3,
  "Créer des visuels époustouflants avec Midjourney": 4,
  "Écriture créative augmentée par l'IA": 5,
  "Design thinking à l'ère de l'IA": 6,
  "L'IA et l'art : une révolution en marche": 7,

  // 💼 Business - Niveaux 4-8
  "L'IA, levier de croissance pour votre entreprise": 4,
  "Prendre des décisions éclairées grâce à l'IA": 5,
  "Transformer l'expérience client avec l'IA": 6,
  "L'IA pour les entrepreneurs ambitieux": 7,
  "ROI de l'IA : mesurer pour mieux investir": 8,

  // 🔬 Science - Niveaux 5-15
  "Les mystères du cerveau artificiel": 6,
  "L'IA qui apprend comme un enfant": 5,
  "Quand l'IA dépasse l'humain : mythes et réalités": 8,
  "L'IA quantique : la prochaine révolution": 15,
  "Comprendre GPT : du papier fondateur à ChatGPT": 10,

  // 🛡️ Éthique - Niveaux 5-10
  "IA éthique : construire un futur responsable": 8,
  "Biais algorithmiques : les comprendre pour les combattre": 9,
  "Vie privée à l'ère de l'IA : protégez vos données": 5,
  "L'IA et l'emploi : menace ou opportunité ?": 6,
  "Gouverner l'IA : enjeux démocratiques": 10,

  // 🏥 Santé - Niveaux 4-12
  "L'IA au chevet des patients": 6,
  "Santé mentale et IA : nouvelles perspectives": 7,
  "Médecine personnalisée grâce à l'IA": 10,
  "L'IA pour vivre plus longtemps et en meilleure santé": 4,
  "Sport et performance : l'IA comme coach": 5,

  // 🌍 Environnement - Niveaux 5-12
  "L'IA pour sauver la planète": 5,
  "Agriculture intelligente : nourrir le monde demain": 8,
  "Villes intelligentes : l'IA au cœur de l'urbanisme": 10,
  "Énergie et IA : vers un futur décarboné": 9,
  "Biodiversité : l'IA gardienne de la nature": 7,

  // 🎓 Éducation - Niveaux 1-6
  "Apprendre à apprendre avec l'IA": 1,
  "L'enseignant augmenté par l'IA": 4,
  "Formation continue à l'ère de l'IA": 3,
  "L'IA pour les enfants : éduquer les citoyens de demain": 2,
  "Langues et IA : parlez le monde entier": 2,

  // 🎮 Divertissement - Niveaux 2-8
  "L'IA réinvente le divertissement": 3,
  "Créer de la musique avec l'IA": 5,
  "Journalisme et IA : informer autrement": 6,
  "L'IA dans votre salon : objets connectés intelligents": 2,
  "Réalité virtuelle et IA : immersion totale": 8,

  // 🚀 Innovation - Niveaux 10-20
  "Les métiers de demain créés par l'IA": 6,
  "IA et robotique : la révolution en marche": 12,
  "Véhicules autonomes : conduire sans les mains": 11,
  "L'IA qui comprend vos émotions": 14,
  "Vers l'intelligence artificielle générale": 18,
};

/**
 * GET - Met à jour les parcours thématiques avec leur niveau recommandé
 */
export async function GET() {
  try {
    const results: { name: string; level: number; updated: boolean }[] = [];

    // Récupérer tous les niveaux
    const levels = await prisma.level.findMany({
      where: { number: { gte: 1, lte: 20 } },
    });
    const levelMap = new Map(levels.map(l => [l.number, l.id]));

    for (const [name, levelNumber] of Object.entries(PARCOURS_LEVELS)) {
      const levelId = levelMap.get(levelNumber);
      if (!levelId) {
        results.push({ name, level: levelNumber, updated: false });
        continue;
      }

      // Trouver le parcours par nom
      const path = await prisma.trainingPath.findFirst({
        where: { name: { contains: name.substring(0, 30) } }, // Recherche partielle pour gérer l'encodage
      });

      if (!path) {
        results.push({ name, level: levelNumber, updated: false });
        continue;
      }

      // Mettre à jour avec le levelId
      await prisma.trainingPath.update({
        where: { id: path.id },
        data: { levelId },
      });

      results.push({ name, level: levelNumber, updated: true });
    }

    const updated = results.filter(r => r.updated).length;
    const notFound = results.filter(r => !r.updated).length;

    return NextResponse.json({
      success: true,
      message: `${updated} parcours mis à jour, ${notFound} non trouvés`,
      updated,
      notFound,
      results,
    });
  } catch (error) {
    console.error("[training/update-paths-levels] GET:", error);
    return NextResponse.json({ error: String(error), success: false }, { status: 500 });
  }
}
