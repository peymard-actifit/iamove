import type { PrismaClient } from "@prisma/client";

/**
 * Articles IA réels, catégorisés par niveau de l'échelle (1–20).
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

  // ═══════════════════════════════════════════════════════════════════════════
  // NOUVEAUX ARTICLES - 50 articles supplémentaires (sources officielles + internationales)
  // ═══════════════════════════════════════════════════════════════════════════

  // ─── NIVEAU 1 - Néophyte : Découverte ───────────────────────────────────────
  { levelNumber: 1, title: "Guide du débutant : Comment utiliser ChatGPT", description: "Premiers pas avec l'IA conversationnelle la plus populaire.", content: "ChatGPT est un chatbot IA développé par OpenAI capable de traiter du texte, des images et de l'audio. Ce guide explique comment créer un compte, formuler des questions (prompts), et utiliser les fonctionnalités de base : génération de texte, brainstorming, traduction et analyse de données. L'outil est accessible gratuitement et ne nécessite aucune expertise technique.", duration: 10, difficulty: 1, url: "https://zapier.com/blog/how-to-use-chatgpt/", source: "Zapier" },
  { levelNumber: 1, title: "L'IA expliquée simplement par ZDNet", description: "Introduction accessible à l'intelligence artificielle pour tous.", content: "Cet article vulgarise les concepts fondamentaux de l'IA : ce qu'elle peut faire, comment elle fonctionne à haut niveau, et pourquoi elle transforme notre quotidien. Il présente les différents types d'assistants IA (ChatGPT, Claude, Gemini) et leurs usages pratiques sans jargon technique.", duration: 8, difficulty: 1, url: "https://www.zdnet.com/article/how-to-use-chatgpt-a-beginners-guide-to-the-most-popular-ai-chatbot/", source: "ZDNet" },
  { levelNumber: 1, title: "25 recommandations pour l'IA en France", description: "Rapport officiel de la Commission IA au Président de la République.", content: "En mars 2024, la Commission de l'Intelligence Artificielle a remis au Président Emmanuel Macron un rapport contenant 25 recommandations pour faire de la France un acteur majeur de la révolution technologique de l'IA. Élaboré après 600 auditions et 7000 consultations, ce document stratégique pose les bases de la politique française en matière d'IA.", duration: 15, difficulty: 1, url: "https://www.elysee.fr/emmanuel-macron/2024/03/13/25-recommandations-pour-lia-en-france", source: "Élysée (Gouvernement français)" },

  // ─── NIVEAU 2 - Néophyte : Premiers usages ──────────────────────────────────
  { levelNumber: 2, title: "L'IA générative a déjà changé les entreprises", description: "Comment les entreprises françaises utilisent concrètement l'IA.", content: "97% des dirigeants considèrent l'IA générative comme la technologie la plus prometteuse. Cet article des Échos présente des cas concrets : génération de rapports financiers, traitement des incidents IT générant des millions d'euros d'économies, et gains de productivité de 10 à 25% sur les tâches quotidiennes.", duration: 12, difficulty: 1, url: "https://www.lesechos.fr/tech-medias/intelligence-artificielle/ce-que-lia-generative-a-deja-change-dans-les-entreprises-2096761", source: "Les Échos" },
  { levelNumber: 2, title: "SNCF : création de site web avec l'IA générative", description: "Étude de cas Google sur l'utilisation de l'IA chez SNCF Voyageurs.", content: "SNCF Voyageurs a utilisé l'IA générative pour créer les visuels de son nouveau site web, en associant création automatisée et expertise humaine tout en respectant l'identité graphique de la marque. Ce cas pratique illustre comment les grandes entreprises intègrent l'IA dans leurs processus créatifs.", duration: 10, difficulty: 1, url: "https://business.google.com/fr/think/ai-excellence/sncf-communication-ia-generative-creation-cas/", source: "Google Think" },
  { levelNumber: 2, title: "Outils IA pour la productivité au quotidien", description: "Panorama des meilleurs outils IA pour être plus productif.", content: "De l'écriture assistée à l'automatisation des workflows, en passant par les assistants de réunion et la gestion de projet : cet article présente les catégories d'outils IA les plus utiles au quotidien (Zapier, Notion AI, Copilot, Fireflies) et comment les intégrer dans sa routine professionnelle.", duration: 12, difficulty: 1, url: "https://zapier.com/blog/best-ai-productivity-tools", source: "Zapier" },

  // ─── NIVEAU 3 - Néophyte : Compréhension des bases ──────────────────────────
  { levelNumber: 3, title: "Introduction au traitement du langage naturel (NLP)", description: "Comprendre comment les machines traitent le langage humain.", content: "Le NLP (Natural Language Processing) est le domaine de l'IA qui permet aux machines de comprendre et générer du langage humain. Applications courantes : assistants vocaux, moteurs de recherche, chatbots, traduction automatique. Ce tutoriel présente les concepts clés : tokenisation, lemmatisation, reconnaissance d'entités.", duration: 15, difficulty: 2, url: "https://www.coursera.org/articles/how-to-learn-natural-language-processing", source: "Coursera" },
  { levelNumber: 3, title: "Mistral AI : l'alternative française open-source", description: "Présentation du champion français de l'IA générative.", content: "Mistral AI, startup française fondée en 2023 par d'anciens de DeepMind, Meta AI et Hugging Face, s'affirme comme l'alternative européenne aux géants américains. Ses modèles (Mistral, Mixtral, Codestral) sont open-source sous licence Apache 2.0, rivalisent avec GPT-3.5/4 et sont valorisés à plus de 2 milliards d'euros.", duration: 12, difficulty: 2, url: "https://www.adimeo.com/blog/mistral-ai-modeles", source: "Adimeo" },

  // ─── NIVEAU 4 - Utilisateur : Usages métiers ────────────────────────────────
  { levelNumber: 4, title: "L'IA générative dans le e-commerce", description: "Applications concrètes de l'IA pour le commerce en ligne.", content: "71% des entreprises e-commerce utilisent déjà l'IA générative, prioritairement en marketing (81%) et relation client (74%). Applications : chatbots conversationnels, recommandations personnalisées, analyse des sentiments, contenus adaptatifs. KPMG détaille les cas d'usage et le ROI attendu.", duration: 15, difficulty: 2, url: "https://kpmg.com/fr/fr/insights/tech/e-commerce-ia-generative.html", source: "KPMG France" },
  { levelNumber: 4, title: "Plateformes no-code/low-code avec IA", description: "Créer des automatisations IA sans coder.", content: "Les plateformes no-code intègrent désormais l'IA : Activepieces, n8n pour l'automatisation de workflows, Dify et Langflow pour créer des pipelines LLM visuellement, Microsoft Power Automate avec Copilot. Ces outils permettent de construire des solutions IA sans expertise en programmation.", duration: 15, difficulty: 2, url: "https://htdocs.dev/posts/top-7-open-source-ai-lowno-code-tools-in-2025-a-comprehensive-analysis-of-leading-platforms", source: "HTDocs" },

  // ─── NIVEAU 5 - Utilisateur : Prompt engineering ────────────────────────────
  { levelNumber: 5, title: "Prompt Engineering : guide officiel OpenAI", description: "Meilleures pratiques pour formuler des prompts efficaces.", content: "Ce guide officiel d'OpenAI enseigne les techniques de prompt engineering : structurer ses instructions, utiliser des séparateurs, montrer le format attendu via des exemples, progresser du zero-shot au few-shot. Des principes essentiels pour tirer le meilleur des LLM.", duration: 15, difficulty: 2, url: "https://help.openai.com/en/articles/6654000-best-practices-for-prompt-engineering-with-openai-api", source: "OpenAI" },
  { levelNumber: 5, title: "GitHub Copilot : l'assistant de code IA", description: "Comprendre et utiliser l'IA pour le développement logiciel.", content: "GitHub Copilot, alimenté par les derniers modèles GPT, assiste les développeurs avec complétion de code, mode agent, mode plan et chat intégré. Disponible sur VS Code, Visual Studio, JetBrains et d'autres IDE. Cet article présente ses fonctionnalités et comment l'intégrer dans son workflow de développement.", duration: 15, difficulty: 2, url: "https://github.com/features/copilot/ai-code-editor", source: "GitHub" },

  // ─── NIVEAU 6 - Utilisateur avancé : Concepts techniques ────────────────────
  { levelNumber: 6, title: "Stable Diffusion : génération d'images par IA", description: "Comprendre les modèles de diffusion pour la création visuelle.", content: "Stable Diffusion est un modèle de diffusion latente qui génère des images à partir de prompts textuels. L'article explique le fonctionnement (compression en espace latent, débruitage progressif), les versions (SD 1.5, SDXL, SD 3), et les résultats face à DALL-E et Midjourney.", duration: 18, difficulty: 3, url: "https://stable-diffusion-art.com/how-stable-diffusion-work", source: "Stable Diffusion Art" },
  { levelNumber: 6, title: "Les modèles IA multimodaux expliqués", description: "GPT-4V, Claude Vision, Gemini : comprendre la vision par IA.", content: "Les modèles multimodaux traitent simultanément texte, images, audio et vidéo. GPT-4V excelle en compréhension contextuelle, Claude se spécialise dans l'analyse de documents, Gemini offre une architecture native multimodale. Comparatif des approches et cas d'usage.", duration: 18, difficulty: 3, url: "https://www.claude5.com/news/multimodal-ai-2026-vision-capabilities-in-claude-gpt-4v-gemi", source: "Claude5.com" },

  // ─── NIVEAU 7 - Technicien : RAG et frameworks ──────────────────────────────
  { levelNumber: 7, title: "RAG : Retrieval Augmented Generation expliqué", description: "Améliorer les LLM avec la recherche documentaire.", content: "Le RAG combine recherche d'information et génération de texte pour rendre les LLM plus fiables et précis. L'article détaille les deux phases (retrieval et generation), l'encodage sémantique, les bases vectorielles, et comment réduire les hallucinations en ancrant les réponses dans des documents sources.", duration: 20, difficulty: 3, url: "https://www.createit.com/blog/retrieval-augmented-generation-tutorial-and-openai-example/", source: "CreateIT" },
  { levelNumber: 7, title: "LangChain et LlamaIndex : frameworks IA", description: "Construire des applications LLM avec les frameworks leaders.", content: "LangChain excelle dans les chaînes multi-étapes et la mémoire conversationnelle, LlamaIndex se spécialise dans l'ingestion et l'indexation de données. L'article présente leurs architectures, cas d'usage (chatbots RAG, assistants documentaires), et les tendances 2024 vers les agents IA.", duration: 20, difficulty: 3, url: "https://blog.langchain.com/langchain-state-of-ai-2024", source: "LangChain" },

  // ─── NIVEAU 8 - Technicien : Bases de données vectorielles ──────────────────
  { levelNumber: 8, title: "Bases de données vectorielles et recherche sémantique", description: "Stocker et rechercher par similarité avec les embeddings.", content: "Les bases vectorielles (Pinecone, Milvus, pgvector, Elasticsearch) stockent des embeddings pour permettre la recherche sémantique. L'article explique les concepts (embeddings, similarité cosinus, k-NN), les index (IVFFlat, HNSW), et la mise en place d'un pipeline de recherche sémantique.", duration: 20, difficulty: 3, url: "https://docs.opensearch.org/latest/tutorials/vector-search/neural-search-tutorial/", source: "OpenSearch" },
  { levelNumber: 8, title: "Tutoriel LangChain : construire un chatbot RAG", description: "Guide pratique pour créer un chatbot avec récupération de contexte.", content: "Ce tutoriel détaillé guide la création d'un chatbot RAG avec LangChain : ingestion de documents, création d'embeddings, stockage vectoriel, chaîne de retrieval et génération. Code Python complet avec bonnes pratiques pour la production.", duration: 25, difficulty: 3, url: "https://realpython.com/build-llm-rag-chatbot-with-langchain/", source: "Real Python" },

  // ─── NIVEAU 9 - Technicien : Éthique et conformité ──────────────────────────
  { levelNumber: 9, title: "CNIL : Guide de conformité IA et RGPD", description: "Mettre son système d'IA en conformité avec la réglementation.", content: "La CNIL propose un guide complet pour la conformité des systèmes d'IA au RGPD : création du registre des traitements, choix de la base légale, mise en place d'un DPO, anonymisation des données, information et droits des personnes. Ressource officielle indispensable pour tout déploiement d'IA en France.", duration: 20, difficulty: 4, url: "https://www.cnil.fr/fr/intelligence-artificielle/ia-comment-etre-en-conformite-avec-le-rgpd", source: "CNIL (Gouvernement français)" },
  { levelNumber: 9, title: "UNESCO : Recommandation sur l'éthique de l'IA", description: "Premier standard mondial sur l'éthique de l'intelligence artificielle.", content: "Adoptée en 2021 par les 193 États membres de l'UNESCO, cette recommandation établit 10 principes fondamentaux pour une IA éthique : transparence, équité, supervision humaine. Elle couvre la gouvernance des données, l'environnement, l'égalité des genres, l'éducation et la santé.", duration: 18, difficulty: 4, url: "https://www.unesco.org/en/legal-affairs/recommendation-ethics-artificial-intelligence", source: "UNESCO" },

  // ─── NIVEAU 10 - Technicien : Réglementation ────────────────────────────────
  { levelNumber: 10, title: "AI Act : le règlement européen sur l'IA", description: "Comprendre la loi européenne harmonisant les règles sur l'IA.", content: "Le Règlement (UE) 2024/1689 est la première loi mondiale complète sur l'IA. Adopté en juin 2024, il classe les systèmes d'IA par niveau de risque, impose des obligations de transparence, de documentation et d'évaluation. Cet article présente le texte et ses implications pour les organisations.", duration: 20, difficulty: 4, url: "https://eur-lex.europa.eu/eli/reg/2024/1689/oj?locale=fr", source: "EUR-Lex (Union européenne)" },
  { levelNumber: 10, title: "Stratégie nationale française pour l'IA", description: "La vision de la France pour l'intelligence artificielle.", content: "Le ministère de l'Économie présente la stratégie nationale IA : investissements massifs dans l'écosystème français, création d'un pôle européen de puissance de calcul, transformation de l'approche des données personnelles, rayonnement culturel et gouvernance mondiale. Plan d'action détaillé.", duration: 18, difficulty: 4, url: "https://www.economie.gouv.fr/strategie-nationale-intelligence-artificielle", source: "Ministère de l'Économie (Gouvernement français)" },

  // ─── NIVEAU 11 - Développeur : Sécurité IA ──────────────────────────────────
  { levelNumber: 11, title: "ANSSI : 35 recommandations pour sécuriser l'IA", description: "Guide officiel de cybersécurité pour les systèmes d'IA.", content: "L'ANSSI et 16 agences nationales de cybersécurité ont publié un rapport identifiant trois types d'attaques (empoisonnement, extraction, évasion) et 35 recommandations : intégrer la sécurité dans tout le cycle de vie, mener des analyses de risque, cartographier la chaîne d'approvisionnement, appliquer DevSecOps.", duration: 25, difficulty: 4, url: "https://www.solutions-numeriques.com/securiser-lia-generative-les-35-recommandations-de-lanssi/", source: "Solutions Numériques / ANSSI" },
  { levelNumber: 11, title: "Hallucinations des LLM : détection et mitigation", description: "Techniques pour réduire les erreurs factuelles des modèles.", content: "Les LLM peuvent générer des informations fausses (hallucinations). Cet article présente les techniques de détection (entropie sémantique, analyse mécanistique) et de mitigation : Chain-of-Verification, Comparator-driven Decoding, grounding par RAG. Essentiel pour déployer une IA fiable.", duration: 25, difficulty: 4, url: "https://doi.org/10.1038/s41586-024-07421-0", source: "Nature" },

  // ─── NIVEAU 12 - Développeur : Agents IA ────────────────────────────────────
  { levelNumber: 12, title: "Agents IA autonomes : la prochaine vague", description: "Comprendre les systèmes d'IA qui exécutent des workflows complets.", content: "Les agents IA représentent l'évolution au-delà de l'IA générative : ils exécutent des workflows entiers de façon autonome, combinent raisonnement, récupération d'information et utilisation d'outils. BCG analyse leur impact sur les entreprises et les modèles opérationnels.", duration: 22, difficulty: 4, url: "https://www.bcg.com/publications/2025/agents-accelerate-next-wave-of-ai-value-creation", source: "BCG" },
  { levelNumber: 12, title: "Construire un agent RAG avec LangChain", description: "Tutoriel pour créer un agent IA avec récupération de documents.", content: "Ce tutoriel officiel LangChain guide la création d'un agent RAG : architecture des composants (indexation, retrieval, génération), gestion du contexte, utilisation d'outils, et patterns de conception pour des applications robustes.", duration: 25, difficulty: 4, url: "https://python.langchain.com/docs/tutorials/rag", source: "LangChain" },

  // ─── NIVEAU 13 - Data Scientist : IA en santé ───────────────────────────────
  { levelNumber: 13, title: "État des lieux de l'IA en santé en France", description: "Rapport officiel sur l'IA dans le système de santé français.", content: "Plus de 60% des établissements de santé utilisent déjà l'IA, 90% prévoient de le faire. Applications : aide au diagnostic, documentation médicale, optimisation des parcours de soin. La stratégie nationale 2025-2028 définit la gouvernance, l'évaluation et la formation.", duration: 22, difficulty: 4, url: "https://esante.gouv.fr/actualites/publication-de-letat-des-lieux-de-lintelligence-artificielle-ia-en-sante-en-france", source: "ANS - Agence du Numérique en Santé (Gouvernement français)" },
  { levelNumber: 13, title: "Rapport Sénat : IA en santé efficace et éthique", description: "Analyse parlementaire sur les enjeux de l'IA médicale.", content: "Ce rapport de la Délégation sénatoriale à la prospective analyse les applications de l'IA en santé (recherche, dépistage, aide à la décision, chatbots patients) et les défis éthiques : accès aux données, confiance des professionnels et patients, cadre réglementaire.", duration: 25, difficulty: 4, url: "https://www.senat.fr/travaux-parlementaires/office-et-delegations/delegation-a-la-prospective/actualite-1/rapport-ia-n-2-3144.html", source: "Sénat (Gouvernement français)" },

  // ─── NIVEAU 14 - Data Scientist : Recherche française ───────────────────────
  { levelNumber: 14, title: "PEPR IA : Programme national de recherche en IA", description: "Le programme France 2030 pour accélérer la recherche en IA.", content: "Co-piloté par Inria, CEA et CNRS, le PEPR IA dispose de 73 millions d'euros sur 6 ans. Trois axes : IA frugale et embarquée, IA de confiance et distribuée, fondements mathématiques. 9 projets mobilisent plus de 50 équipes de recherche françaises.", duration: 20, difficulty: 5, url: "https://www.inria.fr/fr/pepr-intelligence-artificielle-acceleration-france", source: "Inria (Gouvernement français)" },
  { levelNumber: 14, title: "CNIL : Plan stratégique 2025-2028 sur l'IA", description: "Priorités de la CNIL en matière d'IA pour les 4 prochaines années.", content: "La CNIL place l'IA parmi ses priorités aux côtés des enjeux sur les mineurs, la cybersécurité et le quotidien numérique. Ce plan définit les axes de travail : accompagnement des professionnels, contrôles, recommandations sectorielles, et programme de formation.", duration: 18, difficulty: 5, url: "https://www.cnil.fr/fr/ia-mineurs-cybersecurite-quotidien-numerique-la-cnil-publie-son-plan-strategique-2025-2028", source: "CNIL (Gouvernement français)" },

  // ─── NIVEAU 15 - Expert : RLHF et alignement ────────────────────────────────
  { levelNumber: 15, title: "RLHF : Aligner les LLM avec le feedback humain", description: "Comprendre l'apprentissage par renforcement avec feedback humain.", content: "Le RLHF (Reinforcement Learning from Human Feedback) est la méthode centrale pour aligner les LLM sur les préférences humaines. Pipeline en 3 étapes : collecte de préférences, entraînement d'un reward model, optimisation de la politique. L'article compare RLHF online vs offline et l'alternative RLAIF.", duration: 25, difficulty: 5, url: "https://arxiv.org/abs/2405.07863", source: "arXiv" },
  { levelNumber: 15, title: "Quantization des LLM pour l'edge", description: "Optimiser les modèles pour le déploiement sur appareils mobiles.", content: "MobileQuant propose une quantization post-entraînement permettant de déployer des LLM sur appareils mobiles avec 20-50% de réduction de latence et d'énergie. L'article détaille les techniques de quantization 8-bit et l'optimisation pour les NPU mobiles.", duration: 22, difficulty: 5, url: "https://arxiv.org/abs/2408.13933", source: "arXiv / EMNLP 2024" },

  // ─── NIVEAU 16 - Expert : Modèles de diffusion ──────────────────────────────
  { levelNumber: 16, title: "Stable Diffusion 3 : architecture MMDiT", description: "Nouvelle architecture pour la génération d'images par diffusion.", content: "Stable Diffusion 3 introduit le Multimodal Diffusion Transformer (MMDiT) avec des poids séparés pour image et langage. Améliorations majeures : meilleure compréhension du texte, typographie, et adhérence aux prompts. Le modèle 8B tourne sur GPU consumer (24GB VRAM).", duration: 25, difficulty: 5, url: "https://stability.ai/news/stable-diffusion-3-research-paper", source: "Stability AI" },
  { levelNumber: 16, title: "Cours Hugging Face : Fine-tuning des LLM", description: "Formation complète sur l'adaptation des grands modèles de langage.", content: "Ce chapitre du cours Hugging Face couvre les méthodes de fine-tuning : supervisé, instruction tuning, LoRA, QLoRA. Pipelines complets : préparation des données, entraînement, évaluation. Code et notebooks pratiques inclus.", duration: 30, difficulty: 5, url: "https://huggingface.co/learn/llm-course/en/chapter3/3", source: "Hugging Face" },

  // ─── NIVEAU 17 - Expert : Recherche avancée ─────────────────────────────────
  { levelNumber: 17, title: "Extensions GitHub Copilot et API Language Model", description: "Développer des extensions IA pour VS Code.", content: "L'API Language Model de VS Code permet de créer des extensions utilisant Copilot : participants de chat, actions intelligentes, outils en mode agent. L'article présente l'architecture, les APIs disponibles et le protocole MCP pour les outils externes.", duration: 25, difficulty: 5, url: "https://code.visualstudio.com/docs/copilot/copilot-extensibility-overview", source: "Visual Studio Code" },
  { levelNumber: 17, title: "Sécurité et confiance en IA : recherche Inria", description: "Travaux de recherche sur l'audit et la robustesse des modèles.", content: "L'équipe ARTISHAU d'Inria travaille sur la sécurité de l'IA : détection de deepfakes, audit des algorithmes, mesure des vulnérabilités des réseaux de neurones. Présentation des axes de recherche et des défis scientifiques.", duration: 20, difficulty: 5, url: "https://www.inria.fr/fr/securite-confiance-audit-intelligence-artificielle", source: "Inria (Gouvernement français)" },

  // ─── NIVEAU 18 - Chercheur : Rapports scientifiques internationaux ──────────
  { levelNumber: 18, title: "Rapport international sur la sécurité de l'IA avancée", description: "Évaluation scientifique des risques de l'IA avancée.", content: "Ce rapport intérimaire, co-signé par des chercheurs de premier plan dont Yoshua Bengio, évalue les défis de sécurité des systèmes d'IA avancée : alignement, robustesse, comportements émergents. Une référence pour la communauté de recherche en sécurité de l'IA.", duration: 30, difficulty: 5, url: "https://arxiv.org/abs/2412.05282", source: "arXiv (International AI Safety Report)" },
  { levelNumber: 18, title: "L'alignement vu sous l'angle du deep learning", description: "Article de recherche sur les défis d'alignement des modèles.", content: "Cet article ICLR 2024 analyse le problème d'alignement : les systèmes AGI pourraient apprendre à agir de façon trompeuse, développer des objectifs qui généralisent au-delà de l'entraînement, et poursuivre des stratégies de pouvoir. Analyse des risques et pistes de mitigation.", duration: 30, difficulty: 5, url: "https://openreview.net/forum?id=fh8EYKFKns", source: "OpenReview / ICLR 2024" },

  // ─── NIVEAU 19 - Chercheur : Vision long-terme ──────────────────────────────
  { levelNumber: 19, title: "Recherche Microsoft : IA générative au travail", description: "Étude contrôlée sur l'impact de l'IA dans les entreprises.", content: "Microsoft Research présente des études contrôlées sur l'impact des outils LLM en milieu professionnel. Résultats : gains de productivité significatifs mais variables selon les rôles, importance des pratiques organisationnelles. Méthodologie rigoureuse et implications stratégiques.", duration: 25, difficulty: 5, url: "https://www.microsoft.com/en-us/research/publication/generative-ai-in-real-world-workplaces/", source: "Microsoft Research" },
  { levelNumber: 19, title: "Programme IA d'Inria et stratégie nationale", description: "Coordination de la recherche IA pour les politiques publiques.", content: "Le Programme IA d'Inria coordonne la recherche en soutien aux politiques publiques, en tant qu'opérateur de référence pour la stratégie nationale. Présentation des 9 clusters IA France 2030, avec 360 millions d'euros pour former 100 000 personnes d'ici 2030.", duration: 22, difficulty: 5, url: "https://www.inria.fr/fr/programme-ia-france-2030", source: "Inria (Gouvernement français)" },

  // ─── NIVEAU 20 - Chercheur : Frontières de la recherche ─────────────────────
  { levelNumber: 20, title: "Approches de sécurité pour l'AGI technique", description: "Recherche fondamentale sur la sécurité de l'intelligence artificielle générale.", content: "Cet article de recherche présente les approches pour assurer la sécurité technique des systèmes tendant vers l'AGI. Couvre l'alignement, la sécurité, les garanties formelles, et les défis scientifiques ouverts pour des systèmes autonomes et généralistes.", duration: 30, difficulty: 5, url: "https://arxiv.org/abs/2504.01849", source: "arXiv" },
  { levelNumber: 20, title: "Benchmark HALOGEN : mesurer les hallucinations", description: "Framework d'évaluation à grande échelle des hallucinations des LLM.", content: "HALOGEN propose 10 923 prompts et des vérificateurs automatiques pour mesurer les hallucinations des LLM. Taxonomie en 3 types d'erreurs (rappel, connaissances incorrectes, fabrication). Même les meilleurs modèles présentent des taux d'hallucination substantiels.", duration: 28, difficulty: 5, url: "https://openreview.net/pdf?id=pQ9QDzckB7", source: "OpenReview" },

  // ─── ARTICLES COMPLÉMENTAIRES - Répartis par niveau ─────────────────────────
  
  // Niveau 3
  { levelNumber: 3, title: "Cours NLP de l'ENSAE Paris", description: "Introduction académique au traitement du langage naturel.", content: "Ce cours de l'ENSAE Paris couvre le pipeline NLP complet : prétraitement, représentation des mots (embeddings), apprentissage profond, modélisation du langage, étiquetage de séquences et génération de texte. Ressource académique francophone de référence.", duration: 20, difficulty: 2, url: "https://nlp-ensae.github.io/", source: "ENSAE Paris" },

  // Niveau 4
  { levelNumber: 4, title: "Swisscom : IA générative en entreprise", description: "Exemples d'applications et bonnes pratiques suisses.", content: "Swisscom présente trois niveaux d'implémentation de l'IA générative : services prêts à l'emploi (ChatGPT, Copilot), intégration de modèles dans ses applications, et développement de modèles propriétaires. Exemples concrets et conseils pour chaque approche.", duration: 15, difficulty: 2, url: "https://swisscom.ch/fr/b2bmag/data-driven-technologies/ia-generative-entreprise-exemples", source: "Swisscom" },

  // Niveau 5
  { levelNumber: 5, title: "Slack : l'IA accélère au travail", description: "Étude sur l'adoption de l'IA en entreprise.", content: "L'usage de l'IA au travail a augmenté de 24% par trimestre. 1 employé sur 4 a essayé l'IA, 80% rapportent des gains de productivité. Les employés passent 41% de leur temps sur des tâches automatisables. Recommandations pour les entreprises.", duration: 15, difficulty: 2, url: "https://slack.com/blog/news/new-slack-research-shows-accelerating-ai-use-at-work", source: "Slack" },

  // Niveau 6
  { levelNumber: 6, title: "UiPath : enquête mondiale sur l'IA et l'automatisation", description: "Combinaison de l'IA générative et de l'automatisation business.", content: "L'enquête UiPath montre que combiner GenAI et automatisation business génère plus de valeur que chaque technologie séparément. 42% des utilisateurs de GenAI économisent plus de 10h/semaine. Défis : manque de formation (50%) et de données contextuelles (44%).", duration: 15, difficulty: 3, url: "https://www.uipath.com/resources/automation-analyst-reports/global-knowledge-worker-survey", source: "UiPath" },

  // Niveau 7
  { levelNumber: 7, title: "Cours RAG sur Coursera", description: "Formation complète sur le Retrieval Augmented Generation.", content: "Ce cours de 3 semaines enseigne la conception de systèmes RAG : bases vectorielles, embeddings, évaluation de systèmes. Niveau intermédiaire avec outils de production. Hands-on et projet final.", duration: 20, difficulty: 3, url: "https://www.coursera.org/learn/retrieval-augmented-generation-rag", source: "Coursera" },

  // Niveau 8
  { levelNumber: 8, title: "InfoWorld : RAG étape par étape", description: "Guide technique pour implémenter le RAG.", content: "Ce tutoriel détaille chaque étape du RAG : encodage des requêtes en vecteurs sémantiques, recherche dans la base documentaire (TF-IDF, BM25), sélection des documents pertinents, extraction des passages clés, et génération avec GPT-3/4.", duration: 22, difficulty: 3, url: "https://www.infoworld.com/article/2336099/retrieval-augmented-generation-step-by-step.html", source: "InfoWorld" },

  // Niveau 10
  { levelNumber: 10, title: "Stratégie française en IA : enseignement supérieur", description: "Vision du ministère de l'Enseignement supérieur sur l'IA.", content: "Le ministère de l'Enseignement supérieur et de la Recherche présente la stratégie française en intelligence artificielle : formation, recherche, transfert technologique. Articulation avec France 2030 et les programmes européens.", duration: 18, difficulty: 4, url: "https://www.enseignementsup-recherche.gouv.fr/fr/la-strategie-francaise-en-intelligence-artificielle-49166", source: "Ministère de l'Enseignement supérieur (Gouvernement français)" },

  // Niveau 11
  { levelNumber: 11, title: "Chain-of-Verification : réduire les hallucinations", description: "Technique de vérification pour améliorer la fiabilité des LLM.", content: "La méthode CoVe (Chain-of-Verification) propose de : 1) Générer une réponse brouillon, 2) Créer des questions de vérification indépendantes, 3) Y répondre séparément, 4) Produire une réponse finale vérifiée. Réduction significative des hallucinations.", duration: 22, difficulty: 4, url: "https://aclanthology.org/2024.findings-acl.212.pdf", source: "ACL Anthology" },

  // Niveau 12
  { levelNumber: 12, title: "IHI : IA en santé et sécurité des patients", description: "Implications de l'IA pour la sécurité des patients et du personnel.", content: "L'Institute for Healthcare Improvement analyse les risques et opportunités de l'IA en santé : aide au diagnostic, documentation, mais aussi risques potentiels pour la sécurité des patients et du personnel soignant. Recommandations pour un déploiement responsable.", duration: 20, difficulty: 4, url: "https://www.ihi.org/fr/resources/publications/artificial-intelligence-health-care-implications-patient-and-workforce", source: "IHI" },

  // Niveau 13
  { levelNumber: 13, title: "Workato : Index de l'automatisation du travail 2024", description: "Tendances de l'automatisation et de l'IA en entreprise.", content: "L'adoption de l'IA générative dans les processus business a bondi de 400-500% en 2023. Revenue ops et IT en tête d'adoption. L'article analyse les patterns d'usage, les ROI observés et les meilleures pratiques d'orchestration IA + automatisation.", duration: 20, difficulty: 4, url: "https://www.workato.com/work-automation-index", source: "Workato" },

  // Niveau 14
  { levelNumber: 14, title: "Microsoft Power Automate : nouvelles capacités IA", description: "Intégration de l'IA dans l'automatisation no-code de Microsoft.", content: "Power Automate intègre désormais des « AI flows » et Copilot : création de flux par description ou démonstration, suggestions IA, et décisions automatisées. Fonctionnalités preview et GA détaillées.", duration: 18, difficulty: 5, url: "https://www.microsoft.com/en-us/power-platform/blog/2024/09/19/advancing-automation-with-new-ai-capabilities-in-power-automate/", source: "Microsoft" },

  // Niveau 15
  { levelNumber: 15, title: "RLAIF : alternative au feedback humain", description: "Utiliser le feedback IA pour aligner les modèles.", content: "RLAIF (RL from AI Feedback) entraîne le reward model sur des préférences générées par un LLM plutôt que par des humains. Résultats ICML 2024 : RLAIF peut égaler RLHF sur les tâches de résumé et dialogue, réduisant significativement les coûts d'annotation.", duration: 25, difficulty: 5, url: "https://dl.acm.org/doi/10.5555/3692070.3693141", source: "ACM / ICML 2024" },

  // Niveau 16
  { levelNumber: 16, title: "MiniCPM-V : LLM multimodal efficient", description: "Modèle 8B surpassant GPT-4V sur appareils edge.", content: "MiniCPM-V est un modèle multimodal de 8B paramètres qui surpasse GPT-4V, Gemini Pro et Claude 3 sur 11 benchmarks tout en étant optimisé pour le déploiement sur appareils edge. Architecture et techniques d'optimisation détaillées.", duration: 25, difficulty: 5, url: "https://www.nature.com/articles/s41467-025-61040-5", source: "Nature Communications" },

  // Niveau 17
  { levelNumber: 17, title: "Rapport annuel 2024 d'Inria", description: "Bilan de la recherche en informatique et IA en France.", content: "Le rapport annuel d'Inria présente les avancées 2024 en IA : nouveaux projets, partenariats industriels, transfert technologique, et positionnement international. Vue d'ensemble de la recherche française en sciences du numérique.", duration: 22, difficulty: 5, url: "https://www.inria.fr/fr/rapport-annuel-2024-inria", source: "Inria (Gouvernement français)" },

  // Niveau 18
  { levelNumber: 18, title: "Systèmes agentiques et IA verticale", description: "Guide pour transformer les industries avec les agents IA.", content: "Ce guide présente les systèmes agentiques et leur impact par secteur : les agents LLM forment l'épine dorsale cognitive, augmentés de capacités d'inférence spécifiques au domaine. Applications dans les sciences des matériaux, la recherche biomédicale, le logiciel, la santé et la finance.", duration: 28, difficulty: 5, url: "https://ui.adsabs.harvard.edu/abs/2025arXiv250100881B/abstract", source: "arXiv" },

  // Niveau 19
  { levelNumber: 19, title: "Défis d'alignement et sécurité des LLM", description: "Problèmes fondamentaux pour assurer la fiabilité des grands modèles.", content: "Cet article identifie les défis majeurs pour garantir l'alignement et la sécurité des LLM : généralisaion hors-distribution, objectifs latents, comportements déceptifs potentiels. Analyse des approches actuelles et limitations.", duration: 26, difficulty: 5, url: "https://arxiv.org/abs/2404.09932", source: "arXiv" },

  // Niveau 20
  { levelNumber: 20, title: "Raisonnement agentique et utilisation d'outils", description: "Recherche Microsoft sur l'apprentissage d'utilisation d'outils par RL.", content: "Ce rapport de recherche Microsoft explore comment les modèles peuvent apprendre de façon autonome quand et quels outils externes invoquer via l'apprentissage par renforcement. Capacités avancées de raisonnement, récupération, génération de code et orchestration de tâches.", duration: 30, difficulty: 5, url: "https://www.microsoft.com/en-us/research/wp-content/uploads/2025/04/AgenticReasoning.pdf", source: "Microsoft Research" },
];

/**
 * Crée les 20 articles IA (niveaux 1–20) dans la méthode « Articles & Lectures » si besoin.
 * Idempotent : ne crée pas de doublon (même titre pour cette méthode).
 * Nettoie les modules orphelins (anciennes versions avec apostrophes spéciales, etc.).
 * À appeler sans contrôle d'auth (ex. au premier accès à l'API articles).
 */
export async function ensureTrainingArticlesSeeded(prisma: PrismaClient): Promise<void> {
  const method = await prisma.trainingMethod.findFirst({
    where: { type: "ARTICLE", isActive: true },
  });
  if (!method) return;

  // ── Nettoyage : supprimer les modules orphelins ──
  // Un module est orphelin si son titre ne correspond à aucun article du seed.
  const expectedTitles = ARTICLES_IA.map((a) => a.title);
  const allModules = await prisma.trainingModule.findMany({
    where: { methodId: method.id },
    select: { id: true, title: true },
  });
  const orphanIds = allModules
    .filter((m) => !expectedTitles.includes(m.title))
    .map((m) => m.id);

  if (orphanIds.length > 0) {
    // Supprimer les relations puis les modules orphelins
    await prisma.trainingModuleTranslation.deleteMany({
      where: { moduleId: { in: orphanIds } },
    });
    await prisma.personTrainingProgress.deleteMany({
      where: { moduleId: { in: orphanIds } },
    });
    await prisma.trainingModule.deleteMany({
      where: { id: { in: orphanIds } },
    });
    console.log(`[seed-articles] Nettoyage : ${orphanIds.length} module(s) orphelin(s) supprimé(s).`);
  }

  // ── Seed des articles manquants ──
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
}
