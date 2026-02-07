import { PrismaClient } from "@prisma/client";

// Les 26 langues supportées
const SUPPORTED_LANGUAGES = [
  "FR", "EN", "DE", "ES", "IT", "PT", "NL", "PL", "RU", "JA", "ZH", "KO",
  "AR", "TR", "SV", "DA", "FI", "NO", "CS", "EL", "HU", "RO", "SK", "BG", "UK", "ID"
];

// Questions du niveau 2 extraites du PDF
const LEVEL2_QUESTIONS = [
  // Q1-Q12: Questions Vrai (1 bonne réponse)
  { question: "L'IA est utilisée dans les moteurs de recherche modernes.", answers: [{ text: "Vrai", isCorrect: true }, { text: "Faux", isCorrect: false }] },
  { question: "Un assistant vocal grand public repose sur de l'IA.", answers: [{ text: "Vrai", isCorrect: true }, { text: "Faux", isCorrect: false }] },
  { question: "La reconnaissance faciale est un exemple d'IA.", answers: [{ text: "Vrai", isCorrect: true }, { text: "Faux", isCorrect: false }] },
  { question: "Un correcteur automatique avancé peut utiliser de l'IA.", answers: [{ text: "Vrai", isCorrect: true }, { text: "Faux", isCorrect: false }] },
  { question: "Les recommandations de vidéos en ligne utilisent souvent l'IA.", answers: [{ text: "Vrai", isCorrect: true }, { text: "Faux", isCorrect: false }] },
  { question: "Un chatbot conversationnel est un usage typique de l'IA.", answers: [{ text: "Vrai", isCorrect: true }, { text: "Faux", isCorrect: false }] },
  { question: "La traduction automatique moderne repose sur l'IA.", answers: [{ text: "Vrai", isCorrect: true }, { text: "Faux", isCorrect: false }] },
  { question: "Les filtres anti-spam utilisent parfois l'IA.", answers: [{ text: "Vrai", isCorrect: true }, { text: "Faux", isCorrect: false }] },
  { question: "Les systèmes de recommandation musicale utilisent l'IA.", answers: [{ text: "Vrai", isCorrect: true }, { text: "Faux", isCorrect: false }] },
  { question: "La détection de fraude bancaire peut utiliser l'IA.", answers: [{ text: "Vrai", isCorrect: true }, { text: "Faux", isCorrect: false }] },
  { question: "La reconnaissance vocale est un cas d'usage de l'IA.", answers: [{ text: "Vrai", isCorrect: true }, { text: "Faux", isCorrect: false }] },
  { question: "L'IA est déjà présente dans de nombreux outils du quotidien.", answers: [{ text: "Vrai", isCorrect: true }, { text: "Faux", isCorrect: false }] },
  
  // Q13-Q36: Questions à 2 réponses
  { question: "Parmi ces usages, lesquels reposent souvent sur de l'IA ?", answers: [{ text: "Recommandations Netflix", isCorrect: true }, { text: "Tableur vide", isCorrect: false }] },
  { question: "L'IA est utilisée :", answers: [{ text: "Dans la publicité ciblée", isCorrect: true }, { text: "Uniquement dans les laboratoires", isCorrect: false }] },
  { question: "Des exemples courants d'IA sont :", answers: [{ text: "Assistants vocaux", isCorrect: true }, { text: "Calculatrice simple", isCorrect: false }] },
  { question: "L'IA peut servir à :", answers: [{ text: "Reconnaître des images", isCorrect: true }, { text: "Remplacer toute décision humaine", isCorrect: false }] },
  { question: "Les réseaux sociaux utilisent l'IA pour :", answers: [{ text: "Trier les contenus", isCorrect: true }, { text: "Afficher les messages par hasard", isCorrect: false }] },
  { question: "L'IA est présente dans :", answers: [{ text: "Les filtres anti-spam", isCorrect: true }, { text: "Les fichiers texte bruts", isCorrect: false }] },
  { question: "La reconnaissance d'images est :", answers: [{ text: "Un cas d'usage de l'IA", isCorrect: true }, { text: "Un simple stockage de données", isCorrect: false }] },
  { question: "Les recommandations d'achat utilisent souvent :", answers: [{ text: "Des algorithmes d'IA", isCorrect: true }, { text: "Des décisions humaines directes", isCorrect: false }] },
  { question: "L'IA peut être utilisée pour :", answers: [{ text: "Traduire automatiquement un texte", isCorrect: true }, { text: "Écrire à la place de l'utilisateur sans contrôle", isCorrect: false }] },
  { question: "Les systèmes de navigation utilisent l'IA pour :", answers: [{ text: "Optimiser les trajets", isCorrect: true }, { text: "Deviner la destination sans données", isCorrect: false }] },
  { question: "Les moteurs de recherche modernes :", answers: [{ text: "Utilisent parfois l'IA pour classer les résultats", isCorrect: true }, { text: "Fonctionnent uniquement par ordre alphabétique", isCorrect: false }] },
  { question: "Les outils de reconnaissance vocale :", answers: [{ text: "Utilisent l'IA", isCorrect: true }, { text: "Sont purement mécaniques", isCorrect: false }] },
  { question: "L'IA est souvent utilisée pour :", answers: [{ text: "Classer de grandes quantités de données", isCorrect: true }, { text: "Supprimer tout besoin de vérification", isCorrect: false }] },
  { question: "Les recommandations musicales reposent souvent sur :", answers: [{ text: "L'IA", isCorrect: true }, { text: "Le hasard total", isCorrect: false }] },
  { question: "L'IA est visible pour l'utilisateur :", answers: [{ text: "Parfois seulement", isCorrect: true }, { text: "Toujours clairement", isCorrect: false }] },
  { question: "Les publicités ciblées utilisent :", answers: [{ text: "Des modèles d'IA", isCorrect: true }, { text: "Uniquement des règles fixes", isCorrect: false }] },
  { question: "Les chatbots peuvent :", answers: [{ text: "Répondre automatiquement à des questions simples", isCorrect: true }, { text: "Comprendre parfaitement les intentions humaines", isCorrect: false }] },
  { question: "La reconnaissance faciale est utilisée :", answers: [{ text: "Dans certains smartphones", isCorrect: true }, { text: "Dans tous les logiciels", isCorrect: false }] },
  { question: "Les plateformes vidéo utilisent l'IA pour :", answers: [{ text: "Recommander des contenus", isCorrect: true }, { text: "Ignorer les préférences utilisateurs", isCorrect: false }] },
  { question: "L'IA peut être utilisée pour :", answers: [{ text: "Détecter des anomalies", isCorrect: true }, { text: "Garantir l'absence d'erreurs", isCorrect: false }] },
  { question: "Les outils de traduction automatique :", answers: [{ text: "Utilisent l'IA moderne", isCorrect: true }, { text: "Traduisent toujours parfaitement", isCorrect: false }] },
  { question: "L'IA est souvent intégrée :", answers: [{ text: "Sans que l'utilisateur s'en rende compte", isCorrect: true }, { text: "Avec une explication technique détaillée", isCorrect: false }] },
  { question: "Les systèmes de recommandation :", answers: [{ text: "Analysent des comportements utilisateurs", isCorrect: true }, { text: "Fonctionnent sans données", isCorrect: false }] },
  { question: "L'IA est aujourd'hui :", answers: [{ text: "Déployée à grande échelle", isCorrect: true }, { text: "Réservée à la recherche fondamentale", isCorrect: false }] },
  
  // Q37-Q72: Questions à 3 réponses
  { question: "Quels usages courants reposent sur l'IA ?", answers: [{ text: "Recommandations de contenus", isCorrect: true }, { text: "Reconnaissance vocale", isCorrect: true }, { text: "Horloge analogique", isCorrect: false }] },
  { question: "L'IA est utilisée pour :", answers: [{ text: "Analyser des images", isCorrect: true }, { text: "Trier des données", isCorrect: true }, { text: "Garantir la vérité absolue", isCorrect: false }] },
  { question: "Exemples d'IA grand public :", answers: [{ text: "Assistants vocaux", isCorrect: true }, { text: "Traduction automatique", isCorrect: true }, { text: "Calculatrice basique", isCorrect: false }] },
  { question: "Les plateformes numériques utilisent l'IA pour :", answers: [{ text: "Personnaliser l'expérience utilisateur", isCorrect: true }, { text: "Classer les contenus", isCorrect: true }, { text: "Supprimer toute modération humaine", isCorrect: false }] },
  { question: "L'IA est présente dans :", answers: [{ text: "Les smartphones modernes", isCorrect: true }, { text: "Les moteurs de recherche", isCorrect: true }, { text: "Les feuilles blanches", isCorrect: false }] },
  { question: "Les systèmes IA peuvent :", answers: [{ text: "Recommander des produits", isCorrect: true }, { text: "Détecter des fraudes", isCorrect: true }, { text: "Prendre des décisions morales", isCorrect: false }] },
  { question: "L'IA est souvent utilisée pour :", answers: [{ text: "Reconnaître des motifs", isCorrect: true }, { text: "Traiter de grandes quantités de données", isCorrect: true }, { text: "Comprendre le sens humain profond", isCorrect: false }] },
  { question: "Les chatbots peuvent :", answers: [{ text: "Répondre automatiquement", isCorrect: true }, { text: "Fournir une assistance de premier niveau", isCorrect: true }, { text: "Remplacer un expert humain", isCorrect: false }] },
  { question: "L'IA intervient dans :", answers: [{ text: "Les filtres anti-spam", isCorrect: true }, { text: "Les recommandations vidéo", isCorrect: true }, { text: "Les interrupteurs mécaniques", isCorrect: false }] },
  { question: "Les usages médiatiques de l'IA incluent :", answers: [{ text: "Recommandation de contenus", isCorrect: true }, { text: "Publicité ciblée", isCorrect: true }, { text: "Impression papier", isCorrect: false }] },
  { question: "L'IA est utilisée pour :", answers: [{ text: "Reconnaissance vocale", isCorrect: true }, { text: "Reconnaissance faciale", isCorrect: true }, { text: "Décisions juridiques finales", isCorrect: false }] },
  { question: "Les systèmes IA :", answers: [{ text: "Analysent des données passées", isCorrect: true }, { text: "Font des prédictions statistiques", isCorrect: true }, { text: "Ont une conscience propre", isCorrect: false }] },
  { question: "L'IA peut améliorer :", answers: [{ text: "La recherche d'information", isCorrect: true }, { text: "La personnalisation des services", isCorrect: true }, { text: "La certitude absolue des résultats", isCorrect: false }] },
  { question: "Les plateformes e-commerce utilisent l'IA pour :", answers: [{ text: "Recommandations produits", isCorrect: true }, { text: "Détection de fraude", isCorrect: true }, { text: "Garantir la satisfaction client", isCorrect: false }] },
  { question: "L'IA est souvent :", answers: [{ text: "Invisible pour l'utilisateur final", isCorrect: true }, { text: "Présente dans les services numériques", isCorrect: true }, { text: "Limitée aux robots physiques", isCorrect: false }] },
  { question: "Les moteurs de recommandation :", answers: [{ text: "Analysent des comportements", isCorrect: true }, { text: "Utilisent des modèles d'IA", isCorrect: true }, { text: "Fonctionnent sans données", isCorrect: false }] },
  { question: "L'IA est employée pour :", answers: [{ text: "Traduction automatique", isCorrect: true }, { text: "Analyse d'images", isCorrect: true }, { text: "Création de lois", isCorrect: false }] },
  { question: "Les outils IA grand public :", answers: [{ text: "Facilitent certaines tâches", isCorrect: true }, { text: "Automatisent certains choix simples", isCorrect: true }, { text: "Suppriment tout contrôle humain", isCorrect: false }] },
  { question: "L'IA est utilisée dans :", answers: [{ text: "La musique en ligne", isCorrect: true }, { text: "La vidéo à la demande", isCorrect: true }, { text: "Les livres papier", isCorrect: false }] },
  { question: "Les systèmes de navigation utilisent l'IA pour :", answers: [{ text: "Optimiser les trajets", isCorrect: true }, { text: "Prédire le trafic", isCorrect: true }, { text: "Lire les pensées", isCorrect: false }] },
  { question: "L'IA permet de :", answers: [{ text: "Reconnaître des visages", isCorrect: true }, { text: "Classer des images", isCorrect: true }, { text: "Comprendre les émotions humaines", isCorrect: false }] },
  { question: "Les plateformes sociales utilisent l'IA pour :", answers: [{ text: "Trier les contenus", isCorrect: true }, { text: "Détecter des abus", isCorrect: true }, { text: "Garantir l'objectivité totale", isCorrect: false }] },
  { question: "L'IA est aujourd'hui :", answers: [{ text: "Largement diffusée", isCorrect: true }, { text: "Présente dans de nombreux secteurs", isCorrect: true }, { text: "Parfaitement comprise", isCorrect: false }] },
  { question: "Les usages quotidiens de l'IA incluent :", answers: [{ text: "Recommandations musicales", isCorrect: true }, { text: "Filtres anti-spam", isCorrect: true }, { text: "Claviers mécaniques", isCorrect: false }] },
  { question: "L'IA peut aider à :", answers: [{ text: "Automatiser certaines tâches", isCorrect: true }, { text: "Améliorer l'expérience utilisateur", isCorrect: true }, { text: "Éliminer toute erreur", isCorrect: false }] },
  { question: "Les services numériques utilisent l'IA pour :", answers: [{ text: "Personnalisation", isCorrect: true }, { text: "Analyse de données", isCorrect: true }, { text: "Décisions éthiques finales", isCorrect: false }] },
  { question: "L'IA est présente dans :", answers: [{ text: "Les smartphones", isCorrect: true }, { text: "Les plateformes web", isCorrect: true }, { text: "Les objets purement mécaniques", isCorrect: false }] },
  { question: "Les systèmes IA peuvent :", answers: [{ text: "Recommander des contenus", isCorrect: true }, { text: "Filtrer des informations", isCorrect: true }, { text: "Garantir la vérité", isCorrect: false }] },
  { question: "L'IA est souvent associée à :", answers: [{ text: "Des algorithmes statistiques", isCorrect: true }, { text: "Des données massives", isCorrect: true }, { text: "Une intelligence consciente", isCorrect: false }] },
  { question: "Les usages médiatiques de l'IA comprennent :", answers: [{ text: "La recommandation de vidéos", isCorrect: true }, { text: "La publicité ciblée", isCorrect: true }, { text: "La création artistique humaine", isCorrect: false }] },
  { question: "L'IA est utilisée pour :", answers: [{ text: "Reconnaissance vocale", isCorrect: true }, { text: "Analyse d'images", isCorrect: true }, { text: "Décisions politiques", isCorrect: false }] },
  { question: "Les systèmes de recommandation :", answers: [{ text: "Analysent des données utilisateurs", isCorrect: true }, { text: "S'appuient sur l'IA", isCorrect: true }, { text: "Fonctionnent sans algorithmes", isCorrect: false }] },
  { question: "L'IA permet de :", answers: [{ text: "Classer des informations", isCorrect: true }, { text: "Automatiser des réponses simples", isCorrect: true }, { text: "Comprendre l'intention humaine profonde", isCorrect: false }] },
  { question: "Les outils IA grand public :", answers: [{ text: "Sont largement diffusés", isCorrect: true }, { text: "Sont souvent invisibles", isCorrect: true }, { text: "Sont toujours explicitement signalés", isCorrect: false }] },
  { question: "L'IA est utilisée pour :", answers: [{ text: "Détecter des fraudes", isCorrect: true }, { text: "Recommander des contenus", isCorrect: true }, { text: "Garantir l'absence de biais", isCorrect: false }] },
  { question: "Les plateformes numériques :", answers: [{ text: "Utilisent l'IA pour personnaliser les services", isCorrect: true }, { text: "Utilisent l'IA pour analyser des données", isCorrect: true }, { text: "Utilisent l'IA pour remplacer toute décision humaine", isCorrect: false }] },
  
  // Q73-Q110: Questions à 4 réponses
  { question: "Concernant l'IA dans les services numériques :", answers: [{ text: "Recommandations de films utilisent l'IA", isCorrect: true }, { text: "Publicité ciblée utilise l'IA", isCorrect: true }, { text: "Calculatrice basique utilise l'IA", isCorrect: false }, { text: "Reconnaissance vocale utilise l'IA", isCorrect: true }] },
  { question: "À propos de l'IA :", answers: [{ text: "L'IA est présente dans les smartphones", isCorrect: true }, { text: "L'IA est réservée aux robots", isCorrect: false }, { text: "L'IA peut être invisible pour l'utilisateur", isCorrect: true }, { text: "L'IA remplace toujours l'humain", isCorrect: false }] },
  { question: "L'IA est utilisée dans :", answers: [{ text: "Les moteurs de recherche", isCorrect: true }, { text: "Les réseaux sociaux", isCorrect: true }, { text: "Les interrupteurs mécaniques", isCorrect: false }, { text: "Les recommandations produits", isCorrect: true }] },
  { question: "L'IA intervient dans :", answers: [{ text: "Traduction automatique", isCorrect: true }, { text: "Reconnaissance faciale", isCorrect: true }, { text: "Horloge mécanique", isCorrect: false }, { text: "Filtres anti-spam", isCorrect: true }] },
  { question: "L'IA sert à :", answers: [{ text: "Analyser des données", isCorrect: true }, { text: "Personnaliser des services", isCorrect: true }, { text: "Garantir la vérité absolue", isCorrect: false }, { text: "Améliorer le quotidien", isCorrect: true }] },
  { question: "À propos de la visibilité de l'IA :", answers: [{ text: "L'IA est visible partout", isCorrect: false }, { text: "L'IA est parfois invisible", isCorrect: true }, { text: "L'IA est utilisée par les plateformes numériques", isCorrect: true }, { text: "L'IA fonctionne sans données", isCorrect: false }] },
  { question: "L'IA est présente dans :", answers: [{ text: "Les chatbots", isCorrect: true }, { text: "Les moteurs de recommandation", isCorrect: true }, { text: "Les classeurs vides", isCorrect: false }, { text: "Les assistants vocaux", isCorrect: true }] },
  { question: "L'IA est utilisée pour :", answers: [{ text: "Reconnaître des images", isCorrect: true }, { text: "Classer des contenus", isCorrect: true }, { text: "Comprendre comme un humain", isCorrect: false }, { text: "Personnaliser l'expérience", isCorrect: true }] },
  { question: "L'IA est présente dans :", answers: [{ text: "La musique en ligne", isCorrect: true }, { text: "La vidéo à la demande", isCorrect: true }, { text: "Les livres papier", isCorrect: false }, { text: "Les réseaux sociaux", isCorrect: true }] },
  { question: "L'IA aide à :", answers: [{ text: "Recommander des contenus", isCorrect: true }, { text: "Détecter des fraudes", isCorrect: true }, { text: "Garantir l'absence d'erreurs", isCorrect: false }, { text: "Analyser de grandes quantités de données", isCorrect: true }] },
  { question: "L'IA est utilisée dans :", answers: [{ text: "L'e-commerce", isCorrect: true }, { text: "Le streaming", isCorrect: true }, { text: "Tous les objets", isCorrect: false }, { text: "La publicité ciblée", isCorrect: true }] },
  { question: "Les outils de navigation utilisent l'IA pour :", answers: [{ text: "Optimiser les trajets", isCorrect: true }, { text: "Prédire le trafic", isCorrect: true }, { text: "Lire les cartes papier", isCorrect: false }, { text: "Adapter les itinéraires", isCorrect: true }] },
  { question: "L'IA est utilisée pour :", answers: [{ text: "Traduire des langues", isCorrect: true }, { text: "Reconnaître la voix", isCorrect: true }, { text: "Comprendre les émotions humaines", isCorrect: false }, { text: "Analyser des images", isCorrect: true }] },
  { question: "Les plateformes utilisent l'IA pour :", answers: [{ text: "Personnaliser", isCorrect: true }, { text: "Classer les contenus", isCorrect: true }, { text: "Décider moralement", isCorrect: false }, { text: "Recommander", isCorrect: true }] },
  { question: "À propos de l'IA aujourd'hui :", answers: [{ text: "L'IA est largement diffusée", isCorrect: true }, { text: "L'IA est limitée à la recherche", isCorrect: false }, { text: "L'IA est utilisée sans toujours être visible", isCorrect: true }, { text: "L'IA remplace tous les métiers", isCorrect: false }] },
  { question: "L'IA analyse et utilise :", answers: [{ text: "Des comportements utilisateurs", isCorrect: true }, { text: "Rien, fonctionne sans données", isCorrect: false }, { text: "Des recommandations de produits", isCorrect: true }, { text: "Des filtres de contenus", isCorrect: true }] },
  { question: "L'IA est présente dans :", answers: [{ text: "Les filtres anti-spam", isCorrect: true }, { text: "Les recommandations vidéo", isCorrect: true }, { text: "Les feuilles blanches", isCorrect: false }, { text: "Les assistants vocaux", isCorrect: true }] },
  { question: "À propos de l'intégration de l'IA :", answers: [{ text: "L'IA est intégrée dans de nombreux services numériques", isCorrect: true }, { text: "L'IA est toujours expliquée à l'utilisateur", isCorrect: false }, { text: "L'IA peut être invisible", isCorrect: true }, { text: "L'IA fonctionne sans algorithmes", isCorrect: false }] },
  { question: "L'IA permet :", answers: [{ text: "La personnalisation des services", isCorrect: true }, { text: "L'analyse de données massives", isCorrect: true }, { text: "L'objectivité totale", isCorrect: false }, { text: "L'amélioration du quotidien", isCorrect: true }] },
  { question: "L'IA est utilisée dans :", answers: [{ text: "Les réseaux sociaux", isCorrect: true }, { text: "Les moteurs de recherche", isCorrect: true }, { text: "Les stylos", isCorrect: false }, { text: "Les plateformes vidéo", isCorrect: true }] },
  { question: "L'IA est utilisée pour :", answers: [{ text: "Reconnaître des visages", isCorrect: true }, { text: "Reconnaître des voix", isCorrect: true }, { text: "Prendre des décisions humaines finales", isCorrect: false }, { text: "Analyser des images", isCorrect: true }] },
  { question: "L'IA améliore :", answers: [{ text: "Certains services numériques", isCorrect: true }, { text: "Certaines tâches simples", isCorrect: true }, { text: "Supprime le besoin humain", isCorrect: false }, { text: "Est déjà largement utilisée", isCorrect: true }] },
  { question: "L'IA est présente :", answers: [{ text: "Dans les smartphones", isCorrect: true }, { text: "Dans les plateformes web", isCorrect: true }, { text: "Uniquement chez les experts", isCorrect: false }, { text: "Parfois invisible pour l'utilisateur", isCorrect: true }] },
  { question: "Les recommandations utilisent l'IA :", answers: [{ text: "Produits", isCorrect: true }, { text: "Musique", isCorrect: true }, { text: "Au hasard", isCorrect: false }, { text: "Vidéo", isCorrect: true }] },
  { question: "L'IA est utilisée pour :", answers: [{ text: "Analyser des données", isCorrect: true }, { text: "Faire des prédictions statistiques", isCorrect: true }, { text: "Être consciente", isCorrect: false }, { text: "Être utilisée dans de nombreux secteurs", isCorrect: true }] },
  { question: "L'IA dans la vie quotidienne :", answers: [{ text: "Est présente dans la vie quotidienne", isCorrect: true }, { text: "Est limitée aux robots", isCorrect: false }, { text: "Est utilisée dans les services numériques", isCorrect: true }, { text: "Fonctionne sans données", isCorrect: false }] },
  { question: "L'IA aide à :", answers: [{ text: "Filtrer l'information", isCorrect: true }, { text: "Recommander des contenus", isCorrect: true }, { text: "Garantir la vérité", isCorrect: false }, { text: "Analyser des comportements utilisateurs", isCorrect: true }] },
  { question: "L'IA est utilisée pour :", answers: [{ text: "Reconnaître des images", isCorrect: true }, { text: "Classer des contenus", isCorrect: true }, { text: "Comprendre comme un humain", isCorrect: false }, { text: "Améliorer le quotidien", isCorrect: true }] },
  
  // Q101-Q110: Questions explicatives
  { question: "À propos de l'IA dans les services numériques :", answers: [{ text: "Elle est utilisée pour analyser des comportements utilisateurs", isCorrect: true }, { text: "Elle est utilisée pour recommander des contenus", isCorrect: true }, { text: "Elle fonctionne sans données", isCorrect: false }, { text: "Elle est présente dans de nombreux services en ligne", isCorrect: true }] },
  { question: "L'IA est aujourd'hui utilisée pour :", answers: [{ text: "La traduction automatique de textes", isCorrect: true }, { text: "La reconnaissance vocale", isCorrect: true }, { text: "La compréhension parfaite du raisonnement humain", isCorrect: false }, { text: "L'analyse d'images", isCorrect: true }] },
  { question: "Dans les plateformes de streaming, l'IA sert à :", answers: [{ text: "Recommander des films ou séries", isCorrect: true }, { text: "Trier les contenus proposés", isCorrect: true }, { text: "Garantir que les recommandations sont toujours exactes", isCorrect: false }, { text: "Analyser les préférences utilisateurs", isCorrect: true }] },
  { question: "À propos de l'IA dans les smartphones :", answers: [{ text: "Elle est utilisée pour la reconnaissance faciale", isCorrect: true }, { text: "Elle est utilisée pour la reconnaissance vocale", isCorrect: true }, { text: "Elle est utilisée uniquement pour téléphoner", isCorrect: false }, { text: "Elle est intégrée dans plusieurs fonctionnalités invisibles", isCorrect: true }] },
  { question: "Les systèmes de recommandation utilisent l'IA pour :", answers: [{ text: "Analyser l'historique utilisateur", isCorrect: true }, { text: "Proposer des contenus personnalisés", isCorrect: true }, { text: "Fonctionner totalement au hasard", isCorrect: false }, { text: "Adapter les résultats dans le temps", isCorrect: true }] },
  { question: "L'IA est utilisée dans le domaine bancaire pour :", answers: [{ text: "Détecter des fraudes", isCorrect: true }, { text: "Analyser des transactions suspectes", isCorrect: true }, { text: "Garantir qu'aucune erreur ne se produira", isCorrect: false }, { text: "Aider à la prise de décision automatisée simple", isCorrect: true }] },
  { question: "À propos de l'IA dans la publicité en ligne :", answers: [{ text: "Elle permet de cibler des audiences", isCorrect: true }, { text: "Elle analyse des comportements de navigation", isCorrect: true }, { text: "Elle garantit la pertinence absolue des publicités", isCorrect: false }, { text: "Elle est largement utilisée aujourd'hui", isCorrect: true }] },
  { question: "Les outils de navigation (GPS) utilisent l'IA pour :", answers: [{ text: "Optimiser les trajets", isCorrect: true }, { text: "Prédire l'état du trafic", isCorrect: true }, { text: "Lire les intentions du conducteur", isCorrect: false }, { text: "Adapter les itinéraires en temps réel", isCorrect: true }] },
  { question: "L'IA est présente dans les réseaux sociaux pour :", answers: [{ text: "Trier les contenus affichés", isCorrect: true }, { text: "Recommander des publications", isCorrect: true }, { text: "Garantir une information objective", isCorrect: false }, { text: "Détecter certains abus ou spams", isCorrect: true }] },
  { question: "À propos de la reconnaissance d'images :", answers: [{ text: "Elle repose souvent sur l'IA", isCorrect: true }, { text: "Elle est utilisée dans des applications grand public", isCorrect: true }, { text: "Elle fonctionne sans apprentissage préalable", isCorrect: false }, { text: "Elle sert à identifier des objets ou visages", isCorrect: true }] },
  
  // Q111-Q120: Questions philosophiques sur l'IA
  { question: "À propos de l'intelligence artificielle :", answers: [{ text: "Le terme est souvent utilisé sans précision technique", isCorrect: true }, { text: "Il désigne toujours la même technologie", isCorrect: false }, { text: "Il est compris de la même manière par tout le monde", isCorrect: false }, { text: "Il peut regrouper des réalités très différentes", isCorrect: true }] },
  { question: "Dans l'imaginaire collectif, l'IA :", answers: [{ text: "Est souvent associée aux robots humanoïdes", isCorrect: true }, { text: "Est toujours invisible", isCorrect: false }, { text: "Est parfois perçue comme plus intelligente qu'elle ne l'est réellement", isCorrect: true }, { text: "Est parfaitement comprise", isCorrect: false }] },
  { question: "À propos de l'IA aujourd'hui :", answers: [{ text: "Elle existe uniquement dans les laboratoires", isCorrect: false }, { text: "Elle est déjà présente dans de nombreux outils du quotidien", isCorrect: true }, { text: "Elle nécessite toujours une interface visible", isCorrect: false }, { text: "Elle peut fonctionner sans que l'utilisateur en soit conscient", isCorrect: true }] },
  { question: "Concernant le mot « intelligence » dans IA :", answers: [{ text: "Il peut induire des attentes exagérées", isCorrect: true }, { text: "Il signifie une conscience artificielle", isCorrect: false }, { text: "Il est utilisé par analogie avec l'humain", isCorrect: true }, { text: "Il correspond exactement à l'intelligence humaine", isCorrect: false }] },
  { question: "À propos de la compréhension de l'IA par le grand public :", answers: [{ text: "Elle est souvent partielle ou floue", isCorrect: true }, { text: "Elle repose sur des bases techniques solides", isCorrect: false }, { text: "Elle est influencée par les médias et le marketing", isCorrect: true }, { text: "Elle est homogène chez tous les individus", isCorrect: false }] },
  { question: "L'IA est parfois confondue avec :", answers: [{ text: "Des robots humanoïdes", isCorrect: true }, { text: "Des scripts automatisés simples", isCorrect: true }, { text: "Une intelligence consciente", isCorrect: false }, { text: "Une technologie magique", isCorrect: false }] },
  { question: "À propos des capacités de l'IA :", answers: [{ text: "Elle peut sembler comprendre sans réellement comprendre", isCorrect: true }, { text: "Elle a une intention propre", isCorrect: false }, { text: "Elle est toujours autonome", isCorrect: false }, { text: "Elle dépend fortement de son contexte d'utilisation", isCorrect: true }] },
  { question: "Dans les discours médiatiques sur l'IA :", answers: [{ text: "Les titres sont parfois sensationnalistes", isCorrect: true }, { text: "Les limites sont toujours clairement expliquées", isCorrect: false }, { text: "Le terme est parfois utilisé de manière imprécise", isCorrect: true }, { text: "Les explications sont toujours techniques et détaillées", isCorrect: false }] },
  { question: "Une personne de niveau 1 peut penser que l'IA :", answers: [{ text: "Est très puissante mais difficile à expliquer", isCorrect: true }, { text: "Peut tout faire sans limites", isCorrect: false }, { text: "Est un concept un peu flou mais important", isCorrect: true }, { text: "Est parfaitement maîtrisée par les experts", isCorrect: false }] },
  { question: "À propos de l'usage du terme IA en entreprise :", answers: [{ text: "Il peut être utilisé comme argument marketing", isCorrect: true }, { text: "Il désigne toujours des systèmes très avancés", isCorrect: false }, { text: "Il peut recouvrir des solutions très différentes", isCorrect: true }, { text: "Il est strictement réservé au domaine scientifique", isCorrect: false }] },
];

// Fonction pour traduire du texte via DeepL
async function translateText(text: string, targetLang: string): Promise<string> {
  const apiKey = process.env.DEEPL_API_KEY;
  
  if (!apiKey || targetLang === "FR") {
    return text;
  }

  try {
    const response = await fetch("https://api-free.deepl.com/v2/translate", {
      method: "POST",
      headers: {
        "Authorization": `DeepL-Auth-Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: [text],
        source_lang: "FR",
        target_lang: targetLang === "EN" ? "EN-US" : targetLang,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.translations[0]?.text || text;
    }
  } catch (error) {
    console.error(`Erreur traduction ${targetLang}:`, error);
  }
  return text;
}

async function main() {
  const prisma = new PrismaClient();
  
  try {
    console.log("Connexion à la base de données...");
    
    // Trouver le niveau 2
    const level = await prisma.level.findFirst({
      where: { number: 2 },
    });

    if (!level) {
      console.error("Niveau 2 non trouvé");
      process.exit(1);
    }

    console.log(`Niveau 2 trouvé: ${level.id}`);

    // Trouver un admin pour createdById
    const admin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    if (!admin) {
      console.error("Admin non trouvé");
      process.exit(1);
    }

    console.log(`Admin trouvé: ${admin.id}`);

    // Supprimer les quizz existants du niveau 2
    console.log("Suppression des anciens quizz niveau 2...");
    await prisma.quizTranslation.deleteMany({
      where: { quiz: { levelId: level.id } },
    });
    const deleted = await prisma.quiz.deleteMany({
      where: { levelId: level.id },
    });
    console.log(`${deleted.count} quizz supprimés`);

    // Importer les nouvelles questions
    let imported = 0;
    let translationsCreated = 0;

    console.log(`Import de ${LEVEL2_QUESTIONS.length} questions...`);

    for (const q of LEVEL2_QUESTIONS) {
      // Créer le quiz
      const quiz = await prisma.quiz.create({
        data: {
          question: q.question,
          answers: q.answers,
          levelId: level.id,
          isActive: true,
          createdById: admin.id,
        },
      });

      // Créer les traductions
      for (const lang of SUPPORTED_LANGUAGES) {
        try {
          const translatedQuestion = await translateText(q.question, lang);
          const translatedAnswers = [];
          
          for (const ans of q.answers) {
            const translatedText = await translateText(ans.text, lang);
            translatedAnswers.push({
              text: translatedText,
              isCorrect: ans.isCorrect,
            });
          }

          await prisma.quizTranslation.create({
            data: {
              quizId: quiz.id,
              language: lang,
              question: translatedQuestion,
              answers: translatedAnswers,
            },
          });
          translationsCreated++;
        } catch (error) {
          console.error(`Erreur traduction ${lang} pour question ${imported + 1}:`, error);
          // Créer avec texte original si erreur
          await prisma.quizTranslation.create({
            data: {
              quizId: quiz.id,
              language: lang,
              question: q.question,
              answers: q.answers,
            },
          });
          translationsCreated++;
        }
      }

      imported++;
      if (imported % 10 === 0) {
        console.log(`Progression: ${imported}/${LEVEL2_QUESTIONS.length} questions importées...`);
      }
    }

    console.log("\n========================================");
    console.log(`IMPORT NIVEAU 2 TERMINÉ`);
    console.log(`Questions importées: ${imported}`);
    console.log(`Traductions créées: ${translationsCreated}`);
    console.log(`Langues: ${SUPPORTED_LANGUAGES.length}`);
    console.log("========================================\n");

  } catch (error) {
    console.error("Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
