import type { PrismaClient } from "@prisma/client";
import { urlToPdf } from "@/lib/url-to-pdf";

/**
 * Articles IA réels, catégorisés par niveau de l’échelle (1–20).
 * Utilisés pour le seed automatique des modules « Articles & Lectures ».
 */
export const ARTICLES_IA: Array<{
  levelNumber: number;
  title: string;
  description: string;
  content: string;
  duration: number;
  difficulty: number;
  url: string;
  source: string;
}> = [
  { levelNumber: 1, title: "Qu'est-ce que l'intelligence artificielle ?", description: "Définition simple et premiers repères pour comprendre ce qu'est l'IA.", content: "L'intelligence artificielle (IA) désigne des systèmes informatiques capables d'accomplir des tâches qui, chez l'humain, demandent de l'intelligence : comprendre un texte, reconnaître des images, prendre des décisions à partir de données. Cet article introduit les concepts de base et la place de l'IA dans le paysage technologique actuel.", duration: 10, difficulty: 1, url: "https://www.techniques-ingenieur.fr/base-documentaire/technologies-de-l-information-th9/intelligence-artificielle-concepts-et-methodes-d-apprentissage-42679210/introduction-a-l-intelligence-artificielle-h3720/", source: "Techniques de l'Ingénieur" },
  { levelNumber: 2, title: "L'IA dans la vie quotidienne", description: "Où et comment l'IA est déjà présente autour de nous.", content: "Moteurs de recherche, recommandations (Netflix, Spotify), assistants vocaux, correcteurs automatiques, filtres anti-spam : l'IA est déjà intégrée dans de nombreux services du quotidien. Cet article donne des exemples concrets pour identifier l'IA sans entrer encore dans le détail technique.", duration: 10, difficulty: 1, url: "https://schoolofdata.artefact.com/non-classe/introduction-a-lintelligence-artificielle-ia-historique-et-enjeux/", source: "Artefact School of Data" },
  { levelNumber: 3, title: "Programmation classique vs intelligence artificielle", description: "Ce qui distingue l'IA de l'informatique « traditionnelle ».", content: "En programmation classique, on code des règles explicites (si X alors Y). En IA et en machine learning, on laisse le système apprendre à partir de données pour en déduire des patterns. Cet article explique ce changement de paradigme et pourquoi il ouvre de nouveaux usages.", duration: 12, difficulty: 2, url: "https://mitsloan.mit.edu/ideas-made-to-matter/machine-learning-explained", source: "MIT Sloan" },
  { levelNumber: 4, title: "Les types d'IA : faible, forte et domaines d'application", description: "Comprendre les différentes familles et niveaux d'ambition de l'IA.", content: "On distingue souvent l'IA « faible » (spécialisée dans une tâche : reconnaissance d'images, traduction) de l'IA « forte » (hypothétique, polyvalente). En pratique, les systèmes actuels sont des IA spécialisées. Cet article aide à catégoriser les usages et à fixer des attentes réalistes.", duration: 12, difficulty: 2, url: "https://www.ibm.com/think/topics/machine-learning", source: "IBM Think" },
  { levelNumber: 5, title: "Introduction au machine learning", description: "Comment les machines « apprennent » à partir des données.", content: "Le machine learning (apprentissage automatique) est un sous-ensemble de l'IA : des algorithmes qui améliorent leurs performances grâce aux données, sans être reprogrammés à la main. On présente ici les idées clés : données d'entraînement, prédiction, généralisation, et les grands types (supervisé, non supervisé, par renforcement).", duration: 15, difficulty: 2, url: "https://www.coursera.org/articles/what-is-machine-learning", source: "Coursera" },
  { levelNumber: 6, title: "Réseaux de neurones et deep learning", description: "Les bases des modèles qui imitent le cerveau.", content: "Les réseaux de neurones sont des modèles mathématiques inspirés des neurones biologiques. Le deep learning utilise des réseaux avec de nombreuses couches pour apprendre des représentations complexes (images, texte, son). Cet article en explique les principes sans entrer dans les formules.", duration: 15, difficulty: 3, url: "https://www.coursera.org/articles/what-is-deep-learning", source: "Coursera" },
  { levelNumber: 7, title: "IA générative et grands modèles de langage (LLM)", description: "Comprendre ChatGPT et les modèles qui génèrent du texte.", content: "L'IA générative produit du contenu nouveau (texte, image, code) à partir d'un prompt. Les grands modèles de langage (LLM) sont entraînés sur d'énormes corpus pour prédire et générer du texte. Cet article décrit comment ils fonctionnent, leurs usages et leurs limites.", duration: 15, difficulty: 3, url: "https://www.ibm.com/think/topics/generative-ai", source: "IBM Think" },
  { levelNumber: 8, title: "Données, biais et limites des systèmes d'IA", description: "Pourquoi les données et leur qualité sont décisives.", content: "Les modèles d'IA reflètent les données sur lesquelles ils sont entraînés. Biais, données manquantes ou bruitées conduisent à des erreurs ou des discriminations. Cet article aborde la notion de biais algorithmique et les bonnes pratiques (données représentatives, évaluation, surveillance).", duration: 15, difficulty: 3, url: "https://www.techtarget.com/whatis/definition/large-language-model-LLM", source: "TechTarget" },
  { levelNumber: 9, title: "Éthique et IA responsable", description: "Principes et enjeux pour une IA alignée avec les valeurs.", content: "L'IA responsable vise à concevoir et déployer des systèmes transparents, équitables, respectueux de la vie privée et maîtrisables. Cet article présente les principes (équité, explicabilité, responsabilité) et les démarches concrètes en entreprise.", duration: 15, difficulty: 4, url: "https://professional.dce.harvard.edu/blog/building-a-responsible-ai-framework-5-key-principles-for-organizations/", source: "Harvard DCE" },
  { levelNumber: 10, title: "Gouvernance et régulation de l'IA", description: "Cadres juridiques et normes émergentes autour de l'IA.", content: "Règlements (ex. AI Act en Europe), normes sectorielles et bonnes pratiques structurent de plus en plus le déploiement de l'IA. Cet article donne une vue d'ensemble des tendances réglementaires et des implications pour les organisations.", duration: 15, difficulty: 4, url: "https://www.nature.com/articles/s41598-023-34622-w", source: "Nature Scientific Reports" },
  { levelNumber: 11, title: "Types de modèles et inférence : comprendre l'API", description: "Bases techniques pour consommer des modèles via API.", content: "Les modèles IA sont souvent exposés via des API REST : envoi de données, réception des prédictions. Cet article présente les concepts d'entraînement, de sérialisation du modèle, d'endpoint d'inférence et les bonnes pratiques (validation des entrées, gestion de la latence).", duration: 15, difficulty: 4, url: "https://machinelearningmastery.com/the-machine-learning-practitioners-guide-to-model-deployment-with-fastapi/", source: "Machine Learning Mastery" },
  { levelNumber: 12, title: "Intégrer un modèle IA dans une application", description: "Déployer un modèle ML comme API et l'appeler depuis un service.", content: "Intégration des modèles IA dans des applications métier : déploiement en API (FastAPI, Flask), consommation côté client, gestion des erreurs et du versioning. Cet article couvre le cycle du développement à la mise en production d'un premier service d'inférence.", duration: 20, difficulty: 4, url: "https://aws.amazon.com/getting-started/hands-on/deploy-a-machine-learning-model-to-a-rest-api/", source: "AWS Getting Started" },
  { levelNumber: 13, title: "Données et évaluation des modèles en data science", description: "Maîtriser les données, les métriques et le choix d'algorithmes.", content: "En data science IA, la qualité des données et l'évaluation des modèles sont centrales. Cet article aborde le pipeline de données (nettoyage, features), les métriques (précision, rappel, F1, AUC), le choix d'algorithmes et les pièges (surapprentissage, fuite de données).", duration: 20, difficulty: 4, url: "https://towardsdatascience.com/fine-tuning-large-language-models-llms-23473d763b91", source: "Towards Data Science" },
  { levelNumber: 14, title: "MLOps : déploiement et monitoring en production", description: "Concevoir, déployer et surveiller des modèles en production.", content: "MLOps vise à déployer et maintenir des modèles en production de façon fiable. Cet article présente le monitoring (dérive des données, dégradation des performances), les alertes, le versioning des modèles et les bonnes pratiques pour la scalabilité et la sécurité.", duration: 20, difficulty: 5, url: "https://www.evidentlyai.com/ml-in-production/model-monitoring", source: "Evidently AI" },
  { levelNumber: 15, title: "Architectures de modèles : transformers et attention", description: "Comprendre les architectures à la base des LLM et du NLP moderne.", content: "Les transformers, introduits dans « Attention is All You Need », reposent sur le mécanisme d'attention et ont révolutionné le traitement du langage. Cet article explique l'architecture (couches, attention multi-têtes), son intérêt pour le parallélisme et le contexte long.", duration: 20, difficulty: 5, url: "https://jalammar.github.io/illustrated-transformer/", source: "The Illustrated Transformer" },
  { levelNumber: 16, title: "Fine-tuning des grands modèles de langage (LLM)", description: "Adapter un modèle pré-entraîné à une tâche ou un domaine.", content: "Le fine-tuning consiste à ré-entraîner tout ou partie des paramètres d'un LLM sur un jeu de données ciblé. Cet article présente les méthodes (supervisé, instruction tuning, LoRA), les pipelines (données, entraînement, évaluation) et les compromis coût / performance.", duration: 20, difficulty: 5, url: "https://huggingface.co/learn/llm-course/en/chapter3/3", source: "Hugging Face LLM Course" },
  { levelNumber: 17, title: "Recherche en IA : algorithmes et théories", description: "Panorama des axes de recherche fondamentale en IA.", content: "La recherche en IA fondamentale porte sur de nouveaux algorithmes, architectures et cadres théoriques (apprentissage, généralisation, robustesse). Cet article donne une vue d'ensemble des thèmes actuels et des liens entre théorie et pratique.", duration: 25, difficulty: 5, url: "https://research.google/pubs/attention-is-all-you-need/", source: "Google Research" },
  { levelNumber: 18, title: "Diriger la recherche IA : enjeux et stratégie", description: "Piloter des équipes et des programmes de recherche IA.", content: "Le leadership scientifique en IA implique la définition de feuilles de route, la gestion d'équipes pluridisciplinaires, les partenariats et la veille internationale. Cet article aborde les enjeux organisationnels, éthiques et de positionnement dans le paysage de la recherche.", duration: 20, difficulty: 5, url: "https://ui.adsabs.harvard.edu/abs/2024arXiv240813296B/abstract", source: "ADS (Fine-Tuning LLMs Review)" },
  { levelNumber: 19, title: "Influence et références dans l'évolution de l'IA", description: "Travaux et penseurs qui ont marqué l'IA moderne.", content: "L'IA moderne s'appuie sur des travaux fondateurs (réseaux de neurones, apprentissage profond, transformers, renforcement). Cet article retrace les concepts et les contributions qui ont structuré le domaine et continuent d'influencer la recherche et l'industrie.", duration: 25, difficulty: 5, url: "https://papers.nips.cc/paper/7181-attention-is-all-you-need", source: "NeurIPS (Attention is All You Need)" },
  { levelNumber: 20, title: "Frontières de la recherche et ruptures en IA", description: "Limites actuelles et pistes de rupture en intelligence artificielle.", content: "Les frontières de l'IA concernent l'agence, la raisonnement, l'alignement avec les valeurs humaines et les limites des paradigmes actuels. Cet article discute des défis scientifiques et philosophiques et des directions de recherche qui pourraient marquer les prochaines ruptures.", duration: 25, difficulty: 5, url: "https://www.nature.com/articles/s41598-023-34622-w", source: "Nature Scientific Reports" },
];

/**
 * Crée les 20 articles IA (niveaux 1–20) dans la méthode « Articles & Lectures » si besoin.
 * Idempotent : ne crée pas de doublon (même titre pour cette méthode).
 * À appeler sans contrôle d’auth (ex. au premier accès à l’API articles).
 */
export async function ensureTrainingArticlesSeeded(prisma: PrismaClient): Promise<void> {
  const method = await prisma.trainingMethod.findFirst({
    where: { type: "ARTICLE", isActive: true },
  });
  if (!method) return;

  const levels = await prisma.level.findMany({
    where: { number: { gte: 1, lte: 20 } },
    orderBy: { number: "asc" },
  });
  const levelByNumber = Object.fromEntries(levels.map((l) => [l.number, l]));

  for (const article of ARTICLES_IA) {
    const level = levelByNumber[article.levelNumber];
    if (!level) continue;

    const existing = await prisma.trainingModule.findFirst({
      where: { methodId: method.id, title: article.title },
    });
    if (existing) continue;

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
  }

  // Lancer la génération des PDF manquants en arrière-plan (fire-and-forget)
  triggerPdfGenerationInBackground(prisma);
}

/** Variable pour éviter de lancer plusieurs générations en parallèle */
let pdfGenerationRunning = false;

/**
 * Lance la génération des PDF manquants en arrière-plan.
 * Ne bloque pas l'appelant. S'exécute une seule fois à la fois.
 */
function triggerPdfGenerationInBackground(prisma: PrismaClient): void {
  if (pdfGenerationRunning) return;
  pdfGenerationRunning = true;
  generateMissingArticlePdfs(prisma)
    .then((result) => {
      if (result.generated > 0 || result.errors > 0) {
        console.log(`[PDF background] ${result.generated} PDF généré(s), ${result.errors} erreur(s).`);
      }
    })
    .catch((err) => console.error("[PDF background] Erreur:", err))
    .finally(() => { pdfGenerationRunning = false; });
}

/**
 * Génère les PDF manquants pour les articles existants.
 * Pour chaque module ARTICLE qui n'a pas encore de pdfData,
 * on fetch l'URL source et on génère un PDF via Puppeteer.
 * Appelé en arrière-plan (ne bloque pas le seed).
 */
export async function generateMissingArticlePdfs(prisma: PrismaClient): Promise<{ generated: number; errors: number }> {
  const method = await prisma.trainingMethod.findFirst({
    where: { type: "ARTICLE", isActive: true },
  });
  if (!method) return { generated: 0, errors: 0 };

  const modulesWithoutPdf = await prisma.trainingModule.findMany({
    where: {
      methodId: method.id,
      isActive: true,
      pdfData: null,
    },
    include: { level: true },
    orderBy: { level: { number: "asc" } },
  });

  let generated = 0;
  let errors = 0;

  for (const mod of modulesWithoutPdf) {
    // Extraire l'URL depuis resources JSON
    const resources = mod.resources as Array<{ url?: string }> | null;
    const url = resources?.[0]?.url;
    if (!url) {
      errors++;
      continue;
    }

    try {
      console.log(`[PDF] Génération PDF pour "${mod.title}" (niveau ${mod.level.number}) depuis ${url}`);
      const pdfBuffer = await urlToPdf(url);
      await prisma.trainingModule.update({
        where: { id: mod.id },
        data: { pdfData: pdfBuffer },
      });
      generated++;
      console.log(`[PDF] OK – ${mod.title} (${(pdfBuffer.length / 1024).toFixed(0)} Ko)`);
    } catch (err) {
      errors++;
      console.error(`[PDF] Erreur pour "${mod.title}":`, err);
    }
  }

  return { generated, errors };
}
