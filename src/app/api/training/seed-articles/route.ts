import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * Articles IA réels, catégorisés par niveau de l’échelle (1–10).
 * Chaque entrée contient titre, description, résumé, URL et levelNumber.
 */
const ARTICLES_IA: Array<{
  levelNumber: number;
  title: string;
  description: string;
  content: string;
  duration: number;
  difficulty: number;
  url: string;
  source: string;
}> = [
  {
    levelNumber: 1,
    title: "Qu’est-ce que l’intelligence artificielle ?",
    description: "Définition simple et premiers repères pour comprendre ce qu’est l’IA.",
    content: "L’intelligence artificielle (IA) désigne des systèmes informatiques capables d’accomplir des tâches qui, chez l’humain, demandent de l’intelligence : comprendre un texte, reconnaître des images, prendre des décisions à partir de données. Cet article introduit les concepts de base et la place de l’IA dans le paysage technologique actuel.",
    duration: 10,
    difficulty: 1,
    url: "https://www.techniques-ingenieur.fr/base-documentaire/technologies-de-l-information-th9/intelligence-artificielle-concepts-et-methodes-d-apprentissage-42679210/introduction-a-l-intelligence-artificielle-h3720/",
    source: "Techniques de l’Ingénieur",
  },
  {
    levelNumber: 2,
    title: "L’IA dans la vie quotidienne",
    description: "Où et comment l’IA est déjà présente autour de nous.",
    content: "Moteurs de recherche, recommandations (Netflix, Spotify), assistants vocaux, correcteurs automatiques, filtres anti-spam : l’IA est déjà intégrée dans de nombreux services du quotidien. Cet article donne des exemples concrets pour identifier l’IA sans entrer encore dans le détail technique.",
    duration: 10,
    difficulty: 1,
    url: "https://schoolofdata.artefact.com/non-classe/introduction-a-lintelligence-artificielle-ia-historique-et-enjeux/",
    source: "Artefact School of Data",
  },
  {
    levelNumber: 3,
    title: "Programmation classique vs intelligence artificielle",
    description: "Ce qui distingue l’IA de l’informatique « traditionnelle ».",
    content: "En programmation classique, on code des règles explicites (si X alors Y). En IA et en machine learning, on laisse le système apprendre à partir de données pour en déduire des patterns. Cet article explique ce changement de paradigme et pourquoi il ouvre de nouveaux usages.",
    duration: 12,
    difficulty: 2,
    url: "https://mitsloan.mit.edu/ideas-made-to-matter/machine-learning-explained",
    source: "MIT Sloan",
  },
  {
    levelNumber: 4,
    title: "Les types d’IA : faible, forte et domaines d’application",
    description: "Comprendre les différentes familles et niveaux d’ambition de l’IA.",
    content: "On distingue souvent l’IA « faible » (spécialisée dans une tâche : reconnaissance d’images, traduction) de l’IA « forte » (hypothétique, polyvalente). En pratique, les systèmes actuels sont des IA spécialisées. Cet article aide à catégoriser les usages et à fixer des attentes réalistes.",
    duration: 12,
    difficulty: 2,
    url: "https://www.ibm.com/think/topics/machine-learning",
    source: "IBM Think",
  },
  {
    levelNumber: 5,
    title: "Introduction au machine learning",
    description: "Comment les machines « apprennent » à partir des données.",
    content: "Le machine learning (apprentissage automatique) est un sous-ensemble de l’IA : des algorithmes qui améliorent leurs performances grâce aux données, sans être reprogrammés à la main. On présente ici les idées clés : données d’entraînement, prédiction, généralisation, et les grands types (supervisé, non supervisé, par renforcement).",
    duration: 15,
    difficulty: 2,
    url: "https://www.coursera.org/articles/what-is-machine-learning",
    source: "Coursera",
  },
  {
    levelNumber: 6,
    title: "Réseaux de neurones et deep learning",
    description: "Les bases des modèles qui imitent le cerveau.",
    content: "Les réseaux de neurones sont des modèles mathématiques inspirés des neurones biologiques. Le deep learning utilise des réseaux avec de nombreuses couches pour apprendre des représentations complexes (images, texte, son). Cet article en explique les principes sans entrer dans les formules.",
    duration: 15,
    difficulty: 3,
    url: "https://www.coursera.org/articles/what-is-deep-learning",
    source: "Coursera",
  },
  {
    levelNumber: 7,
    title: "IA générative et grands modèles de langage (LLM)",
    description: "Comprendre ChatGPT et les modèles qui génèrent du texte.",
    content: "L’IA générative produit du contenu nouveau (texte, image, code) à partir d’un prompt. Les grands modèles de langage (LLM) sont entraînés sur d’énormes corpus pour prédire et générer du texte. Cet article décrit comment ils fonctionnent, leurs usages et leurs limites.",
    duration: 15,
    difficulty: 3,
    url: "https://www.ibm.com/think/topics/generative-ai",
    source: "IBM Think",
  },
  {
    levelNumber: 8,
    title: "Données, biais et limites des systèmes d’IA",
    description: "Pourquoi les données et leur qualité sont décisives.",
    content: "Les modèles d’IA reflètent les données sur lesquelles ils sont entraînés. Biais, données manquantes ou bruitées conduisent à des erreurs ou des discriminations. Cet article aborde la notion de biais algorithmique et les bonnes pratiques (données représentatives, évaluation, surveillance).",
    duration: 15,
    difficulty: 3,
    url: "https://www.techtarget.com/whatis/definition/large-language-model-LLM",
    source: "TechTarget",
  },
  {
    levelNumber: 9,
    title: "Éthique et IA responsable",
    description: "Principes et enjeux pour une IA alignée avec les valeurs.",
    content: "L’IA responsable vise à concevoir et déployer des systèmes transparents, équitables, respectueux de la vie privée et maîtrisables. Cet article présente les principes (équité, explicabilité, responsabilité) et les démarches concrètes en entreprise.",
    duration: 15,
    difficulty: 4,
    url: "https://professional.dce.harvard.edu/blog/building-a-responsible-ai-framework-5-key-principles-for-organizations/",
    source: "Harvard DCE",
  },
  {
    levelNumber: 10,
    title: "Gouvernance et régulation de l’IA",
    description: "Cadres juridiques et normes émergentes autour de l’IA.",
    content: "Règlements (ex. AI Act en Europe), normes sectorielles et bonnes pratiques structurent de plus en plus le déploiement de l’IA. Cet article donne une vue d’ensemble des tendances réglementaires et des implications pour les organisations.",
    duration: 15,
    difficulty: 4,
    url: "https://www.nature.com/articles/s41598-023-34622-w",
    source: "Nature Scientific Reports",
  },
];

/**
 * POST – Crée les articles IA dans la méthode « Articles & Lectures »,
 * répartis selon l’échelle de niveau (1–10). Idempotent : ne crée pas en double si le titre existe déjà pour cette méthode.
 */
export async function POST() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 });
    }

    const method = await prisma.trainingMethod.findFirst({
      where: { type: "ARTICLE", isActive: true },
    });
    if (!method) {
      return NextResponse.json(
        { error: "Méthode « Articles & Lectures » introuvable. Exécutez d’abord l’initialisation des méthodes de formation." },
        { status: 400 }
      );
    }

    const levels = await prisma.level.findMany({
      where: { number: { gte: 1, lte: 20 } },
      orderBy: { number: "asc" },
    });
    const levelByNumber = Object.fromEntries(levels.map((l) => [l.number, l]));

    let created = 0;
    let skipped = 0;

    for (const article of ARTICLES_IA) {
      const level = levelByNumber[article.levelNumber];
      if (!level) continue;

      const existing = await prisma.trainingModule.findFirst({
        where: { methodId: method.id, title: article.title },
      });
      if (existing) {
        skipped++;
        continue;
      }

      const lastOrder = await prisma.trainingModule
        .findFirst({
          where: { methodId: method.id },
          orderBy: { order: "desc" },
          select: { order: true },
        })
        .then((r) => r?.order ?? -1);

      const contentWithLink = `${article.content}\n\n**Source :** [${article.source}](${article.url})`;
      const resources = [
        { type: "article" as const, title: article.source, url: article.url, description: "Article complet en ligne" },
      ];

      const mod = await prisma.trainingModule.create({
        data: {
          methodId: method.id,
          levelId: level.id,
          title: article.title,
          description: article.description,
          content: contentWithLink,
          duration: article.duration,
          difficulty: article.difficulty,
          order: lastOrder + 1,
          isActive: true,
          resources,
        },
      });

      await prisma.trainingModuleTranslation.create({
        data: {
          moduleId: mod.id,
          language: "FR",
          title: article.title,
          description: article.description,
          content: contentWithLink,
        },
      });
      created++;
    }

    return NextResponse.json({
      success: true,
      created,
      skipped,
      total: ARTICLES_IA.length,
    });
  } catch (e) {
    console.error("[training/seed-articles] Erreur:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
