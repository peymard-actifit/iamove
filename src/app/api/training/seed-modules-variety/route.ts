import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Modules variés par type et niveau
const MODULES_VARIETY = {
  VIDEO: [
    // Niveaux 1-5 : Découverte
    { level: 1, title: "C'est quoi l'IA ? Explication simple en 5 minutes", description: "Une introduction visuelle et accessible à l'intelligence artificielle.", duration: 5, difficulty: 1 },
    { level: 2, title: "L'IA dans votre smartphone : démonstration", description: "Découvrez comment l'IA est déjà présente dans votre téléphone.", duration: 8, difficulty: 1 },
    { level: 3, title: "Machine Learning vs Deep Learning : la différence", description: "Comprendre visuellement ce qui distingue ces deux approches.", duration: 10, difficulty: 2 },
    { level: 4, title: "Les assistants vocaux décryptés", description: "Comment Siri, Alexa et Google Assistant comprennent-ils ce que vous dites ?", duration: 12, difficulty: 2 },
    { level: 5, title: "Comment une IA apprend-elle ?", description: "Animation explicative du processus d'apprentissage machine.", duration: 15, difficulty: 2 },
    // Niveaux 6-10 : Intermédiaire
    { level: 6, title: "Les réseaux de neurones expliqués visuellement", description: "Architecture et fonctionnement d'un réseau de neurones.", duration: 20, difficulty: 3 },
    { level: 7, title: "ChatGPT : comment ça marche vraiment ?", description: "Plongée dans les mécanismes des grands modèles de langage.", duration: 18, difficulty: 3 },
    { level: 8, title: "Biais algorithmiques : exemples concrets", description: "Cas réels de biais et leurs conséquences.", duration: 15, difficulty: 3 },
    { level: 9, title: "L'IA éthique en pratique", description: "Exemples d'entreprises qui mettent en œuvre une IA responsable.", duration: 20, difficulty: 3 },
    { level: 10, title: "AI Act européen : ce que vous devez savoir", description: "Présentation de la nouvelle réglementation européenne.", duration: 25, difficulty: 3 },
    // Niveaux 11-15 : Avancé
    { level: 11, title: "Appeler l'API OpenAI : tutoriel vidéo", description: "Guide pas à pas pour intégrer GPT dans vos applications.", duration: 30, difficulty: 4 },
    { level: 12, title: "Déployer un modèle ML en production", description: "Les étapes clés du déploiement avec démonstration.", duration: 35, difficulty: 4 },
    { level: 13, title: "Pipeline Data Science de A à Z", description: "Workflow complet d'un projet de data science.", duration: 40, difficulty: 4 },
    { level: 14, title: "Introduction au MLOps", description: "DevOps appliqué au Machine Learning.", duration: 35, difficulty: 4 },
    { level: 15, title: "L'architecture Transformer décodée", description: "Explication technique du mécanisme d'attention.", duration: 45, difficulty: 5 },
    // Niveaux 16-20 : Expert
    { level: 16, title: "Fine-tuning avec LoRA : démonstration", description: "Adapter un LLM à vos besoins spécifiques.", duration: 40, difficulty: 5 },
    { level: 17, title: "État de l'art en recherche IA 2026", description: "Panorama des dernières avancées scientifiques.", duration: 50, difficulty: 5 },
    { level: 18, title: "Gérer une équipe de recherche IA", description: "Retours d'expérience de leaders du domaine.", duration: 45, difficulty: 5 },
    { level: 19, title: "Histoire de l'IA : de Turing à GPT-4", description: "Rétrospective des moments clés de l'IA.", duration: 55, difficulty: 5 },
    { level: 20, title: "Vers l'AGI : défis et perspectives", description: "Le point sur la recherche vers l'intelligence artificielle générale.", duration: 60, difficulty: 5 },
  ],
  TUTORIAL: [
    { level: 1, title: "Premier pas avec ChatGPT", description: "Guide pas à pas pour votre première conversation avec l'IA.", duration: 10, difficulty: 1 },
    { level: 2, title: "Utiliser l'IA pour résumer un texte", description: "Apprenez à faire synthétiser vos documents par l'IA.", duration: 15, difficulty: 1 },
    { level: 3, title: "Créer votre premier prompt efficace", description: "Les bases du prompt engineering.", duration: 20, difficulty: 2 },
    { level: 4, title: "Générer des images avec DALL-E", description: "Guide complet pour créer des visuels avec l'IA.", duration: 25, difficulty: 2 },
    { level: 5, title: "Automatiser des tâches avec Zapier et l'IA", description: "Créer des workflows automatisés sans coder.", duration: 30, difficulty: 2 },
    { level: 6, title: "Analyser des données avec l'IA", description: "Utiliser l'IA pour extraire des insights de vos données.", duration: 35, difficulty: 3 },
    { level: 7, title: "Créer un chatbot personnalisé", description: "Construire votre propre assistant conversationnel.", duration: 40, difficulty: 3 },
    { level: 8, title: "Auditer les biais d'un modèle", description: "Méthodologie pour détecter les biais algorithmiques.", duration: 35, difficulty: 3 },
    { level: 9, title: "Rédiger une charte IA éthique", description: "Guide pour créer votre politique d'IA responsable.", duration: 30, difficulty: 3 },
    { level: 10, title: "Se conformer au RGPD avec l'IA", description: "Checklist de conformité pour vos projets IA.", duration: 40, difficulty: 3 },
    { level: 11, title: "Intégrer l'API Claude dans une app", description: "Tutoriel technique d'intégration.", duration: 45, difficulty: 4 },
    { level: 12, title: "Conteneuriser un modèle avec Docker", description: "Packager votre modèle pour le déploiement.", duration: 50, difficulty: 4 },
    { level: 13, title: "Créer un notebook Jupyter pour le ML", description: "Workflow reproductible pour vos analyses.", duration: 45, difficulty: 4 },
    { level: 14, title: "Mettre en place un pipeline CI/CD ML", description: "Automatiser le déploiement de vos modèles.", duration: 55, difficulty: 4 },
    { level: 15, title: "Implémenter l'attention multi-têtes", description: "Coder le mécanisme Transformer from scratch.", duration: 60, difficulty: 5 },
    { level: 16, title: "Fine-tuner Llama avec QLoRA", description: "Guide avancé d'adaptation de LLM.", duration: 65, difficulty: 5 },
    { level: 17, title: "Lire et comprendre un papier de recherche", description: "Méthodologie pour analyser les publications.", duration: 50, difficulty: 5 },
    { level: 18, title: "Rédiger une proposition de recherche", description: "Structure et bonnes pratiques.", duration: 55, difficulty: 5 },
    { level: 19, title: "Contribuer à un projet IA open source", description: "Guide pour participer à la communauté.", duration: 45, difficulty: 5 },
    { level: 20, title: "Évaluer les risques d'un système AGI", description: "Framework d'analyse des risques existentiels.", duration: 60, difficulty: 5 },
  ],
  EXERCISE: [
    { level: 1, title: "Quiz : Reconnaître l'IA au quotidien", description: "Testez votre capacité à identifier l'IA autour de vous.", duration: 10, difficulty: 1 },
    { level: 2, title: "Défi : Obtenir 3 réponses utiles de ChatGPT", description: "Pratiquez vos premières interactions.", duration: 15, difficulty: 1 },
    { level: 3, title: "Exercice : Comparer ML classique et deep learning", description: "Classez des exemples dans la bonne catégorie.", duration: 20, difficulty: 2 },
    { level: 4, title: "Cas pratique : Identifier un usage IA pour votre métier", description: "Trouvez une application concrète pour votre travail.", duration: 30, difficulty: 2 },
    { level: 5, title: "Atelier : Entraîner un modèle simple", description: "Utilisez un outil no-code pour créer votre premier modèle.", duration: 45, difficulty: 2 },
    { level: 6, title: "Lab : Visualiser un réseau de neurones", description: "Expérimentez avec TensorFlow Playground.", duration: 30, difficulty: 3 },
    { level: 7, title: "Challenge : Créer 10 prompts créatifs", description: "Développez vos compétences en prompt engineering.", duration: 40, difficulty: 3 },
    { level: 8, title: "Audit : Trouver les biais dans un dataset", description: "Analysez un jeu de données et identifiez les problèmes.", duration: 45, difficulty: 3 },
    { level: 9, title: "Éthique : Résoudre un dilemme IA", description: "Cas pratique de prise de décision éthique.", duration: 35, difficulty: 3 },
    { level: 10, title: "Conformité : Évaluer un projet selon l'AI Act", description: "Appliquez la classification de risque européenne.", duration: 50, difficulty: 3 },
    { level: 11, title: "Coding : Premier appel API OpenAI", description: "Écrivez votre premier script d'intégration.", duration: 60, difficulty: 4 },
    { level: 12, title: "DevOps : Déployer un modèle sur Hugging Face", description: "Publiez votre premier modèle en ligne.", duration: 50, difficulty: 4 },
    { level: 13, title: "Data : Nettoyer et préparer un dataset", description: "Pipeline de préparation de données.", duration: 55, difficulty: 4 },
    { level: 14, title: "MLOps : Configurer MLflow", description: "Mettre en place le tracking d'expériences.", duration: 60, difficulty: 4 },
    { level: 15, title: "Deep : Implémenter l'attention from scratch", description: "Coder le mécanisme clé des Transformers.", duration: 90, difficulty: 5 },
    { level: 16, title: "Advanced : Fine-tuner un modèle de 7B params", description: "Adapter un grand modèle à votre cas d'usage.", duration: 120, difficulty: 5 },
    { level: 17, title: "Research : Reproduire un papier", description: "Implémenter les résultats d'une publication.", duration: 180, difficulty: 5 },
    { level: 18, title: "Leadership : Planifier un projet de recherche", description: "Créer une feuille de route sur 6 mois.", duration: 90, difficulty: 5 },
    { level: 19, title: "Vision : Analyser une tendance émergente", description: "Rédiger une note prospective.", duration: 60, difficulty: 5 },
    { level: 20, title: "Frontières : Débattre sur l'alignement IA", description: "Argumenter sur les approches d'alignement.", duration: 75, difficulty: 5 },
  ],
  SERIOUS_GAME: [
    { level: 1, title: "IA ou pas IA ? Le jeu", description: "Devinez si c'est de l'IA ou non !", duration: 10, difficulty: 1 },
    { level: 2, title: "Le détective numérique", description: "Retrouvez l'IA cachée dans ces services.", duration: 15, difficulty: 1 },
    { level: 3, title: "Quiz Battle : IA Basics", description: "Testez vos connaissances de base sur l'IA.", duration: 15, difficulty: 2 },
    { level: 4, title: "Mission : Trouver l'IA pour votre entreprise", description: "Simulation de conseil en IA.", duration: 25, difficulty: 2 },
    { level: 5, title: "L'apprenti Data Scientist", description: "Entraînez votre premier modèle virtuel.", duration: 30, difficulty: 2 },
    { level: 6, title: "Neurone Quest", description: "Construisez un réseau de neurones virtuel.", duration: 25, difficulty: 3 },
    { level: 7, title: "Prompt Master", description: "Compétition de prompt engineering.", duration: 20, difficulty: 3 },
    { level: 8, title: "Bias Hunter", description: "Traquez les biais dans les algorithmes.", duration: 30, difficulty: 3 },
    { level: 9, title: "Le tribunal de l'IA", description: "Jugez des cas éthiques complexes.", duration: 35, difficulty: 3 },
    { level: 10, title: "AI Compliance Challenge", description: "Naviguer dans la réglementation européenne.", duration: 40, difficulty: 3 },
    { level: 11, title: "API Quest", description: "Défi d'intégration d'API en temps limité.", duration: 45, difficulty: 4 },
    { level: 12, title: "Deploy or Die", description: "Mettez en production avant la deadline !", duration: 50, difficulty: 4 },
    { level: 13, title: "Data Cleaner Extreme", description: "Nettoyez le dataset le plus vite possible.", duration: 35, difficulty: 4 },
    { level: 14, title: "MLOps Simulator", description: "Gérez un pipeline ML en production.", duration: 55, difficulty: 4 },
    { level: 15, title: "Transformer Architect", description: "Concevez l'architecture optimale.", duration: 60, difficulty: 5 },
    { level: 16, title: "Fine-Tune Master", description: "Optimisez un modèle pour le meilleur score.", duration: 70, difficulty: 5 },
    { level: 17, title: "Paper Chase", description: "Course aux citations scientifiques.", duration: 45, difficulty: 5 },
    { level: 18, title: "AI Lab Tycoon", description: "Gérez votre laboratoire de recherche IA.", duration: 60, difficulty: 5 },
    { level: 19, title: "Time Machine : Histoire de l'IA", description: "Voyage dans le temps de l'intelligence artificielle.", duration: 40, difficulty: 5 },
    { level: 20, title: "AGI Simulator", description: "Simulez les défis de l'intelligence générale.", duration: 90, difficulty: 5 },
  ],
  INTERACTIVE: [
    { level: 1, title: "Dialogue avec une IA : simulation", description: "Pratiquez vos premières conversations.", duration: 15, difficulty: 1 },
    { level: 2, title: "Explorer les recommandations Netflix", description: "Comprenez comment l'IA vous suggère des films.", duration: 20, difficulty: 1 },
    { level: 3, title: "Visualiser le Machine Learning", description: "Manipulez des modèles interactivement.", duration: 25, difficulty: 2 },
    { level: 4, title: "Cartographie des usages IA", description: "Explorez les applications par secteur.", duration: 30, difficulty: 2 },
    { level: 5, title: "Playground : Entraîner un classificateur", description: "Créez et testez un modèle en direct.", duration: 35, difficulty: 2 },
    { level: 6, title: "Réseau de neurones interactif", description: "Construisez et observez un NN en action.", duration: 40, difficulty: 3 },
    { level: 7, title: "Laboratoire de prompts", description: "Testez et comparez vos prompts.", duration: 35, difficulty: 3 },
    { level: 8, title: "Détecteur de biais interactif", description: "Analysez des datasets en temps réel.", duration: 40, difficulty: 3 },
    { level: 9, title: "Simulateur de décision éthique", description: "Naviguez dans des dilemmes complexes.", duration: 45, difficulty: 3 },
    { level: 10, title: "Compliance Navigator", description: "Parcourez interactivement l'AI Act.", duration: 50, difficulty: 3 },
    { level: 11, title: "API Sandbox", description: "Testez les API d'IA en environnement sécurisé.", duration: 45, difficulty: 4 },
    { level: 12, title: "Deployment Simulator", description: "Simulez un déploiement en production.", duration: 55, difficulty: 4 },
    { level: 13, title: "Data Lab interactif", description: "Analysez et transformez des données.", duration: 50, difficulty: 4 },
    { level: 14, title: "MLOps Dashboard", description: "Surveillez des modèles en production.", duration: 60, difficulty: 4 },
    { level: 15, title: "Attention Visualizer", description: "Observez le mécanisme d'attention en action.", duration: 55, difficulty: 5 },
    { level: 16, title: "Fine-Tuning Lab", description: "Expérimentez le fine-tuning en direct.", duration: 70, difficulty: 5 },
    { level: 17, title: "Research Explorer", description: "Naviguez dans la littérature scientifique.", duration: 45, difficulty: 5 },
    { level: 18, title: "Team Builder IA", description: "Simulez la gestion d'équipe de recherche.", duration: 60, difficulty: 5 },
    { level: 19, title: "Timeline IA interactive", description: "Explorez l'histoire de l'IA.", duration: 40, difficulty: 5 },
    { level: 20, title: "AGI Scenario Planner", description: "Simulez différents futurs de l'IA.", duration: 75, difficulty: 5 },
  ],
};

/**
 * GET - Crée des modules variés pour chaque niveau et type
 */
export async function GET() {
  try {
    // Récupérer les méthodes et niveaux
    const methods = await prisma.trainingMethod.findMany({ where: { isActive: true } });
    const levels = await prisma.level.findMany({ orderBy: { number: "asc" } });
    
    const methodMap = new Map(methods.map(m => [m.type, m.id]));
    const levelMap = new Map(levels.map(l => [l.number, l.id]));

    const results: { type: string; created: number; existing: number }[] = [];

    for (const [type, modules] of Object.entries(MODULES_VARIETY)) {
      const methodId = methodMap.get(type);
      if (!methodId) {
        results.push({ type, created: 0, existing: 0 });
        continue;
      }

      let created = 0;
      let existing = 0;

      for (const mod of modules) {
        const levelId = levelMap.get(mod.level);
        if (!levelId) continue;

        // Vérifier si le module existe déjà
        const exists = await prisma.trainingModule.findFirst({
          where: {
            title: mod.title,
            methodId,
          },
        });

        if (exists) {
          existing++;
          continue;
        }

        // Créer le module
        await prisma.trainingModule.create({
          data: {
            title: mod.title,
            description: mod.description,
            duration: mod.duration,
            difficulty: mod.difficulty,
            methodId,
            levelId,
            isActive: true,
            order: mod.level * 10,
          },
        });
        created++;
      }

      results.push({ type, created, existing });
    }

    const totalCreated = results.reduce((sum, r) => sum + r.created, 0);
    const totalExisting = results.reduce((sum, r) => sum + r.existing, 0);

    return NextResponse.json({
      success: true,
      message: `${totalCreated} modules créés, ${totalExisting} existants`,
      totalCreated,
      totalExisting,
      results,
    });
  } catch (error) {
    console.error("[training/seed-modules-variety] GET:", error);
    return NextResponse.json({ error: String(error), success: false }, { status: 500 });
  }
}
