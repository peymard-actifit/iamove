import prisma from "@/lib/prisma";

/**
 * Vérifie et attribue automatiquement les badges éligibles pour une personne.
 * Appelée après chaque mise à jour de PP ou activité significative.
 * 
 * Critères supportés (dans le champ JSON `criteria` du badge) :
 *   { "type": "pp_threshold", "value": 10000 }      → PP >= 10000
 *   { "type": "usecase_count", "value": 5 }          → 5+ Use Cases créés
 *   { "type": "forum_count", "value": 10 }            → 10+ posts forum
 *   { "type": "tech_count", "value": 3 }              → 3+ tech tips
 *   { "type": "quiz_count", "value": 50 }             → 50+ questions répondues
 * 
 * Les badges déjà attribués ne sont pas re-attribués.
 * Les badges sans criteria ne sont pas auto-attribués (attribution manuelle uniquement).
 */
export async function checkAndAwardBadges(personId: string, siteId: string) {
  try {
    // Récupérer les badges du site (et globaux) qui ont des critères
    const badges = await prisma.badge.findMany({
      where: {
        OR: [{ siteId }, { siteId: null }],
        criteria: { not: null },
      },
      include: {
        earnedBy: {
          where: { personId },
          select: { id: true },
        },
      },
    });

    // Filtrer les badges non encore attribués
    const unearnedBadges = badges.filter((b) => b.earnedBy.length === 0);
    if (unearnedBadges.length === 0) return;

    // Récupérer les stats de la personne en une seule requête
    const person = await prisma.person.findUnique({
      where: { id: personId },
      select: {
        participationPoints: true,
        _count: {
          select: {
            useCases: true,
            forumPosts: true,
            techTips: true,
            quizAttempts: true,
          },
        },
      },
    });

    if (!person) return;

    const stats = {
      pp: person.participationPoints,
      usecases: person._count.useCases,
      forum: person._count.forumPosts,
      tech: person._count.techTips,
      quiz: person._count.quizAttempts,
    };

    // Vérifier chaque badge
    for (const badge of unearnedBadges) {
      let criteria: { type: string; value: number };
      try {
        criteria = JSON.parse(badge.criteria!);
      } catch {
        continue; // Critère invalide, ignorer
      }

      if (!criteria?.type || !criteria?.value) continue;

      let eligible = false;

      switch (criteria.type) {
        case "pp_threshold":
          eligible = stats.pp >= criteria.value;
          break;
        case "usecase_count":
          eligible = stats.usecases >= criteria.value;
          break;
        case "forum_count":
          eligible = stats.forum >= criteria.value;
          break;
        case "tech_count":
          eligible = stats.tech >= criteria.value;
          break;
        case "quiz_count":
          eligible = stats.quiz >= criteria.value;
          break;
      }

      if (eligible) {
        // Attribuer le badge
        await prisma.personBadge.create({
          data: { personId, badgeId: badge.id },
        }).catch(() => {}); // Ignorer si déjà attribué (contrainte unique)

        // PP récompense
        if (badge.ppReward > 0) {
          await prisma.person.update({
            where: { id: personId },
            data: { participationPoints: { increment: badge.ppReward } },
          }).catch(() => {});
        }
      }
    }
  } catch (error) {
    console.error("checkAndAwardBadges error:", error);
    // Ne pas bloquer le flux principal en cas d'erreur
  }
}
