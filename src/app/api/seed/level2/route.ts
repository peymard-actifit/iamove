import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Les 26 langues supportées
const LANGS = ["FR","EN","DE","ES","IT","PT","NL","PL","RU","JA","ZH","KO","AR","TR","SV","DA","FI","NO","CS","EL","HU","RO","SK","BG","UK","ID"];

// Questions du niveau 2 (120 questions)
const Q = [
  {q:"L'IA est utilisée dans les moteurs de recherche modernes.",a:[{t:"Vrai",c:true},{t:"Faux",c:false}]},
  {q:"Un assistant vocal grand public repose sur de l'IA.",a:[{t:"Vrai",c:true},{t:"Faux",c:false}]},
  {q:"La reconnaissance faciale est un exemple d'IA.",a:[{t:"Vrai",c:true},{t:"Faux",c:false}]},
  {q:"Un correcteur automatique avancé peut utiliser de l'IA.",a:[{t:"Vrai",c:true},{t:"Faux",c:false}]},
  {q:"Les recommandations de vidéos en ligne utilisent souvent l'IA.",a:[{t:"Vrai",c:true},{t:"Faux",c:false}]},
  {q:"Un chatbot conversationnel est un usage typique de l'IA.",a:[{t:"Vrai",c:true},{t:"Faux",c:false}]},
  {q:"La traduction automatique moderne repose sur l'IA.",a:[{t:"Vrai",c:true},{t:"Faux",c:false}]},
  {q:"Les filtres anti-spam utilisent parfois l'IA.",a:[{t:"Vrai",c:true},{t:"Faux",c:false}]},
  {q:"Les systèmes de recommandation musicale utilisent l'IA.",a:[{t:"Vrai",c:true},{t:"Faux",c:false}]},
  {q:"La détection de fraude bancaire peut utiliser l'IA.",a:[{t:"Vrai",c:true},{t:"Faux",c:false}]},
  {q:"La reconnaissance vocale est un cas d'usage de l'IA.",a:[{t:"Vrai",c:true},{t:"Faux",c:false}]},
  {q:"L'IA est déjà présente dans de nombreux outils du quotidien.",a:[{t:"Vrai",c:true},{t:"Faux",c:false}]},
  {q:"Parmi ces usages, lesquels reposent souvent sur de l'IA ?",a:[{t:"Recommandations Netflix",c:true},{t:"Tableur vide",c:false}]},
  {q:"L'IA est utilisée :",a:[{t:"Dans la publicité ciblée",c:true},{t:"Uniquement dans les laboratoires",c:false}]},
  {q:"Des exemples courants d'IA sont :",a:[{t:"Assistants vocaux",c:true},{t:"Calculatrice simple",c:false}]},
  {q:"L'IA peut servir à :",a:[{t:"Reconnaître des images",c:true},{t:"Remplacer toute décision humaine",c:false}]},
  {q:"Les réseaux sociaux utilisent l'IA pour :",a:[{t:"Trier les contenus",c:true},{t:"Afficher les messages par hasard",c:false}]},
  {q:"L'IA est présente dans :",a:[{t:"Les filtres anti-spam",c:true},{t:"Les fichiers texte bruts",c:false}]},
  {q:"La reconnaissance d'images est :",a:[{t:"Un cas d'usage de l'IA",c:true},{t:"Un simple stockage de données",c:false}]},
  {q:"Les recommandations d'achat utilisent souvent :",a:[{t:"Des algorithmes d'IA",c:true},{t:"Des décisions humaines directes",c:false}]},
  {q:"L'IA peut être utilisée pour :",a:[{t:"Traduire automatiquement un texte",c:true},{t:"Écrire à la place de l'utilisateur sans contrôle",c:false}]},
  {q:"Les systèmes de navigation utilisent l'IA pour :",a:[{t:"Optimiser les trajets",c:true},{t:"Deviner la destination sans données",c:false}]},
  {q:"Les moteurs de recherche modernes :",a:[{t:"Utilisent parfois l'IA pour classer les résultats",c:true},{t:"Fonctionnent uniquement par ordre alphabétique",c:false}]},
  {q:"Les outils de reconnaissance vocale :",a:[{t:"Utilisent l'IA",c:true},{t:"Sont purement mécaniques",c:false}]},
  {q:"L'IA est souvent utilisée pour :",a:[{t:"Classer de grandes quantités de données",c:true},{t:"Supprimer tout besoin de vérification",c:false}]},
  {q:"Les recommandations musicales reposent souvent sur :",a:[{t:"L'IA",c:true},{t:"Le hasard total",c:false}]},
  {q:"L'IA est visible pour l'utilisateur :",a:[{t:"Parfois seulement",c:true},{t:"Toujours clairement",c:false}]},
  {q:"Les publicités ciblées utilisent :",a:[{t:"Des modèles d'IA",c:true},{t:"Uniquement des règles fixes",c:false}]},
  {q:"Les chatbots peuvent :",a:[{t:"Répondre automatiquement à des questions simples",c:true},{t:"Comprendre parfaitement les intentions humaines",c:false}]},
  {q:"La reconnaissance faciale est utilisée :",a:[{t:"Dans certains smartphones",c:true},{t:"Dans tous les logiciels",c:false}]},
  {q:"Les plateformes vidéo utilisent l'IA pour :",a:[{t:"Recommander des contenus",c:true},{t:"Ignorer les préférences utilisateurs",c:false}]},
  {q:"L'IA peut être utilisée pour :",a:[{t:"Détecter des anomalies",c:true},{t:"Garantir l'absence d'erreurs",c:false}]},
  {q:"Les outils de traduction automatique :",a:[{t:"Utilisent l'IA moderne",c:true},{t:"Traduisent toujours parfaitement",c:false}]},
  {q:"L'IA est souvent intégrée :",a:[{t:"Sans que l'utilisateur s'en rende compte",c:true},{t:"Avec une explication technique détaillée",c:false}]},
  {q:"Les systèmes de recommandation :",a:[{t:"Analysent des comportements utilisateurs",c:true},{t:"Fonctionnent sans données",c:false}]},
  {q:"L'IA est aujourd'hui :",a:[{t:"Déployée à grande échelle",c:true},{t:"Réservée à la recherche fondamentale",c:false}]},
  {q:"Quels usages courants reposent sur l'IA ?",a:[{t:"Recommandations de contenus",c:true},{t:"Reconnaissance vocale",c:true},{t:"Horloge analogique",c:false}]},
  {q:"L'IA est utilisée pour :",a:[{t:"Analyser des images",c:true},{t:"Trier des données",c:true},{t:"Garantir la vérité absolue",c:false}]},
  {q:"Exemples d'IA grand public :",a:[{t:"Assistants vocaux",c:true},{t:"Traduction automatique",c:true},{t:"Calculatrice basique",c:false}]},
  {q:"Les plateformes numériques utilisent l'IA pour :",a:[{t:"Personnaliser l'expérience utilisateur",c:true},{t:"Classer les contenus",c:true},{t:"Supprimer toute modération humaine",c:false}]},
  {q:"L'IA est présente dans :",a:[{t:"Les smartphones modernes",c:true},{t:"Les moteurs de recherche",c:true},{t:"Les feuilles blanches",c:false}]},
  {q:"Les systèmes IA peuvent :",a:[{t:"Recommander des produits",c:true},{t:"Détecter des fraudes",c:true},{t:"Prendre des décisions morales",c:false}]},
  {q:"L'IA est souvent utilisée pour :",a:[{t:"Reconnaître des motifs",c:true},{t:"Traiter de grandes quantités de données",c:true},{t:"Comprendre le sens humain profond",c:false}]},
  {q:"Les chatbots peuvent :",a:[{t:"Répondre automatiquement",c:true},{t:"Fournir une assistance de premier niveau",c:true},{t:"Remplacer un expert humain",c:false}]},
  {q:"L'IA intervient dans :",a:[{t:"Les filtres anti-spam",c:true},{t:"Les recommandations vidéo",c:true},{t:"Les interrupteurs mécaniques",c:false}]},
  {q:"Les usages médiatiques de l'IA incluent :",a:[{t:"Recommandation de contenus",c:true},{t:"Publicité ciblée",c:true},{t:"Impression papier",c:false}]},
  {q:"L'IA est utilisée pour :",a:[{t:"Reconnaissance vocale",c:true},{t:"Reconnaissance faciale",c:true},{t:"Décisions juridiques finales",c:false}]},
  {q:"Les systèmes IA :",a:[{t:"Analysent des données passées",c:true},{t:"Font des prédictions statistiques",c:true},{t:"Ont une conscience propre",c:false}]},
  {q:"L'IA peut améliorer :",a:[{t:"La recherche d'information",c:true},{t:"La personnalisation des services",c:true},{t:"La certitude absolue des résultats",c:false}]},
  {q:"Les plateformes e-commerce utilisent l'IA pour :",a:[{t:"Recommandations produits",c:true},{t:"Détection de fraude",c:true},{t:"Garantir la satisfaction client",c:false}]},
  {q:"L'IA est souvent :",a:[{t:"Invisible pour l'utilisateur final",c:true},{t:"Présente dans les services numériques",c:true},{t:"Limitée aux robots physiques",c:false}]},
  {q:"Les moteurs de recommandation :",a:[{t:"Analysent des comportements",c:true},{t:"Utilisent des modèles d'IA",c:true},{t:"Fonctionnent sans données",c:false}]},
  {q:"L'IA est employée pour :",a:[{t:"Traduction automatique",c:true},{t:"Analyse d'images",c:true},{t:"Création de lois",c:false}]},
  {q:"Les outils IA grand public :",a:[{t:"Facilitent certaines tâches",c:true},{t:"Automatisent certains choix simples",c:true},{t:"Suppriment tout contrôle humain",c:false}]},
  {q:"L'IA est utilisée dans :",a:[{t:"La musique en ligne",c:true},{t:"La vidéo à la demande",c:true},{t:"Les livres papier",c:false}]},
  {q:"Les systèmes de navigation utilisent l'IA pour :",a:[{t:"Optimiser les trajets",c:true},{t:"Prédire le trafic",c:true},{t:"Lire les pensées",c:false}]},
  {q:"L'IA permet de :",a:[{t:"Reconnaître des visages",c:true},{t:"Classer des images",c:true},{t:"Comprendre les émotions humaines",c:false}]},
  {q:"Les plateformes sociales utilisent l'IA pour :",a:[{t:"Trier les contenus",c:true},{t:"Détecter des abus",c:true},{t:"Garantir l'objectivité totale",c:false}]},
  {q:"L'IA est aujourd'hui :",a:[{t:"Largement diffusée",c:true},{t:"Présente dans de nombreux secteurs",c:true},{t:"Parfaitement comprise",c:false}]},
  {q:"Les usages quotidiens de l'IA incluent :",a:[{t:"Recommandations musicales",c:true},{t:"Filtres anti-spam",c:true},{t:"Claviers mécaniques",c:false}]},
  {q:"L'IA peut aider à :",a:[{t:"Automatiser certaines tâches",c:true},{t:"Améliorer l'expérience utilisateur",c:true},{t:"Éliminer toute erreur",c:false}]},
  {q:"Les services numériques utilisent l'IA pour :",a:[{t:"Personnalisation",c:true},{t:"Analyse de données",c:true},{t:"Décisions éthiques finales",c:false}]},
  {q:"L'IA est présente dans :",a:[{t:"Les smartphones",c:true},{t:"Les plateformes web",c:true},{t:"Les objets purement mécaniques",c:false}]},
  {q:"Les systèmes IA peuvent :",a:[{t:"Recommander des contenus",c:true},{t:"Filtrer des informations",c:true},{t:"Garantir la vérité",c:false}]},
  {q:"L'IA est souvent associée à :",a:[{t:"Des algorithmes statistiques",c:true},{t:"Des données massives",c:true},{t:"Une intelligence consciente",c:false}]},
  {q:"Les usages médiatiques de l'IA comprennent :",a:[{t:"La recommandation de vidéos",c:true},{t:"La publicité ciblée",c:true},{t:"La création artistique humaine",c:false}]},
  {q:"L'IA est utilisée pour :",a:[{t:"Reconnaissance vocale",c:true},{t:"Analyse d'images",c:true},{t:"Décisions politiques",c:false}]},
  {q:"Les systèmes de recommandation :",a:[{t:"Analysent des données utilisateurs",c:true},{t:"S'appuient sur l'IA",c:true},{t:"Fonctionnent sans algorithmes",c:false}]},
  {q:"L'IA permet de :",a:[{t:"Classer des informations",c:true},{t:"Automatiser des réponses simples",c:true},{t:"Comprendre l'intention humaine profonde",c:false}]},
  {q:"Les outils IA grand public :",a:[{t:"Sont largement diffusés",c:true},{t:"Sont souvent invisibles",c:true},{t:"Sont toujours explicitement signalés",c:false}]},
  {q:"L'IA est utilisée pour :",a:[{t:"Détecter des fraudes",c:true},{t:"Recommander des contenus",c:true},{t:"Garantir l'absence de biais",c:false}]},
  {q:"Les plateformes numériques :",a:[{t:"Utilisent l'IA pour personnaliser les services",c:true},{t:"Utilisent l'IA pour analyser des données",c:true},{t:"Utilisent l'IA pour remplacer toute décision humaine",c:false}]},
  {q:"Concernant l'IA dans les services numériques :",a:[{t:"Recommandations de films utilisent l'IA",c:true},{t:"Publicité ciblée utilise l'IA",c:true},{t:"Calculatrice basique utilise l'IA",c:false},{t:"Reconnaissance vocale utilise l'IA",c:true}]},
  {q:"À propos de l'IA :",a:[{t:"L'IA est présente dans les smartphones",c:true},{t:"L'IA est réservée aux robots",c:false},{t:"L'IA peut être invisible pour l'utilisateur",c:true},{t:"L'IA remplace toujours l'humain",c:false}]},
  {q:"L'IA est utilisée dans :",a:[{t:"Les moteurs de recherche",c:true},{t:"Les réseaux sociaux",c:true},{t:"Les interrupteurs mécaniques",c:false},{t:"Les recommandations produits",c:true}]},
  {q:"L'IA intervient dans :",a:[{t:"Traduction automatique",c:true},{t:"Reconnaissance faciale",c:true},{t:"Horloge mécanique",c:false},{t:"Filtres anti-spam",c:true}]},
  {q:"L'IA sert à :",a:[{t:"Analyser des données",c:true},{t:"Personnaliser des services",c:true},{t:"Garantir la vérité absolue",c:false},{t:"Améliorer le quotidien",c:true}]},
  {q:"À propos de la visibilité de l'IA :",a:[{t:"L'IA est visible partout",c:false},{t:"L'IA est parfois invisible",c:true},{t:"L'IA est utilisée par les plateformes numériques",c:true},{t:"L'IA fonctionne sans données",c:false}]},
  {q:"L'IA est présente dans :",a:[{t:"Les chatbots",c:true},{t:"Les moteurs de recommandation",c:true},{t:"Les classeurs vides",c:false},{t:"Les assistants vocaux",c:true}]},
  {q:"L'IA est utilisée pour :",a:[{t:"Reconnaître des images",c:true},{t:"Classer des contenus",c:true},{t:"Comprendre comme un humain",c:false},{t:"Personnaliser l'expérience",c:true}]},
  {q:"L'IA est présente dans :",a:[{t:"La musique en ligne",c:true},{t:"La vidéo à la demande",c:true},{t:"Les livres papier",c:false},{t:"Les réseaux sociaux",c:true}]},
  {q:"L'IA aide à :",a:[{t:"Recommander des contenus",c:true},{t:"Détecter des fraudes",c:true},{t:"Garantir l'absence d'erreurs",c:false},{t:"Analyser de grandes quantités de données",c:true}]},
  {q:"L'IA est utilisée dans :",a:[{t:"L'e-commerce",c:true},{t:"Le streaming",c:true},{t:"Tous les objets",c:false},{t:"La publicité ciblée",c:true}]},
  {q:"Les outils de navigation utilisent l'IA pour :",a:[{t:"Optimiser les trajets",c:true},{t:"Prédire le trafic",c:true},{t:"Lire les cartes papier",c:false},{t:"Adapter les itinéraires",c:true}]},
  {q:"L'IA est utilisée pour :",a:[{t:"Traduire des langues",c:true},{t:"Reconnaître la voix",c:true},{t:"Comprendre les émotions humaines",c:false},{t:"Analyser des images",c:true}]},
  {q:"Les plateformes utilisent l'IA pour :",a:[{t:"Personnaliser",c:true},{t:"Classer les contenus",c:true},{t:"Décider moralement",c:false},{t:"Recommander",c:true}]},
  {q:"À propos de l'IA aujourd'hui :",a:[{t:"L'IA est largement diffusée",c:true},{t:"L'IA est limitée à la recherche",c:false},{t:"L'IA est utilisée sans toujours être visible",c:true},{t:"L'IA remplace tous les métiers",c:false}]},
  {q:"L'IA analyse et utilise :",a:[{t:"Des comportements utilisateurs",c:true},{t:"Rien, fonctionne sans données",c:false},{t:"Des recommandations de produits",c:true},{t:"Des filtres de contenus",c:true}]},
  {q:"L'IA est présente dans :",a:[{t:"Les filtres anti-spam",c:true},{t:"Les recommandations vidéo",c:true},{t:"Les feuilles blanches",c:false},{t:"Les assistants vocaux",c:true}]},
  {q:"À propos de l'intégration de l'IA :",a:[{t:"L'IA est intégrée dans de nombreux services numériques",c:true},{t:"L'IA est toujours expliquée à l'utilisateur",c:false},{t:"L'IA peut être invisible",c:true},{t:"L'IA fonctionne sans algorithmes",c:false}]},
  {q:"L'IA permet :",a:[{t:"La personnalisation des services",c:true},{t:"L'analyse de données massives",c:true},{t:"L'objectivité totale",c:false},{t:"L'amélioration du quotidien",c:true}]},
  {q:"L'IA est utilisée dans :",a:[{t:"Les réseaux sociaux",c:true},{t:"Les moteurs de recherche",c:true},{t:"Les stylos",c:false},{t:"Les plateformes vidéo",c:true}]},
  {q:"L'IA est utilisée pour :",a:[{t:"Reconnaître des visages",c:true},{t:"Reconnaître des voix",c:true},{t:"Prendre des décisions humaines finales",c:false},{t:"Analyser des images",c:true}]},
  {q:"L'IA améliore :",a:[{t:"Certains services numériques",c:true},{t:"Certaines tâches simples",c:true},{t:"Supprime le besoin humain",c:false},{t:"Est déjà largement utilisée",c:true}]},
  {q:"L'IA est présente :",a:[{t:"Dans les smartphones",c:true},{t:"Dans les plateformes web",c:true},{t:"Uniquement chez les experts",c:false},{t:"Parfois invisible pour l'utilisateur",c:true}]},
  {q:"Les recommandations utilisent l'IA :",a:[{t:"Produits",c:true},{t:"Musique",c:true},{t:"Au hasard",c:false},{t:"Vidéo",c:true}]},
  {q:"L'IA est utilisée pour :",a:[{t:"Analyser des données",c:true},{t:"Faire des prédictions statistiques",c:true},{t:"Être consciente",c:false},{t:"Être utilisée dans de nombreux secteurs",c:true}]},
  {q:"L'IA dans la vie quotidienne :",a:[{t:"Est présente dans la vie quotidienne",c:true},{t:"Est limitée aux robots",c:false},{t:"Est utilisée dans les services numériques",c:true},{t:"Fonctionne sans données",c:false}]},
  {q:"L'IA aide à :",a:[{t:"Filtrer l'information",c:true},{t:"Recommander des contenus",c:true},{t:"Garantir la vérité",c:false},{t:"Analyser des comportements utilisateurs",c:true}]},
  {q:"L'IA est utilisée pour :",a:[{t:"Reconnaître des images",c:true},{t:"Classer des contenus",c:true},{t:"Comprendre comme un humain",c:false},{t:"Améliorer le quotidien",c:true}]},
  {q:"À propos de l'IA dans les services numériques :",a:[{t:"Elle est utilisée pour analyser des comportements utilisateurs",c:true},{t:"Elle est utilisée pour recommander des contenus",c:true},{t:"Elle fonctionne sans données",c:false},{t:"Elle est présente dans de nombreux services en ligne",c:true}]},
  {q:"L'IA est aujourd'hui utilisée pour :",a:[{t:"La traduction automatique de textes",c:true},{t:"La reconnaissance vocale",c:true},{t:"La compréhension parfaite du raisonnement humain",c:false},{t:"L'analyse d'images",c:true}]},
  {q:"Dans les plateformes de streaming, l'IA sert à :",a:[{t:"Recommander des films ou séries",c:true},{t:"Trier les contenus proposés",c:true},{t:"Garantir que les recommandations sont toujours exactes",c:false},{t:"Analyser les préférences utilisateurs",c:true}]},
  {q:"À propos de l'IA dans les smartphones :",a:[{t:"Elle est utilisée pour la reconnaissance faciale",c:true},{t:"Elle est utilisée pour la reconnaissance vocale",c:true},{t:"Elle est utilisée uniquement pour téléphoner",c:false},{t:"Elle est intégrée dans plusieurs fonctionnalités invisibles",c:true}]},
  {q:"Les systèmes de recommandation utilisent l'IA pour :",a:[{t:"Analyser l'historique utilisateur",c:true},{t:"Proposer des contenus personnalisés",c:true},{t:"Fonctionner totalement au hasard",c:false},{t:"Adapter les résultats dans le temps",c:true}]},
  {q:"L'IA est utilisée dans le domaine bancaire pour :",a:[{t:"Détecter des fraudes",c:true},{t:"Analyser des transactions suspectes",c:true},{t:"Garantir qu'aucune erreur ne se produira",c:false},{t:"Aider à la prise de décision automatisée simple",c:true}]},
  {q:"À propos de l'IA dans la publicité en ligne :",a:[{t:"Elle permet de cibler des audiences",c:true},{t:"Elle analyse des comportements de navigation",c:true},{t:"Elle garantit la pertinence absolue des publicités",c:false},{t:"Elle est largement utilisée aujourd'hui",c:true}]},
  {q:"Les outils de navigation (GPS) utilisent l'IA pour :",a:[{t:"Optimiser les trajets",c:true},{t:"Prédire l'état du trafic",c:true},{t:"Lire les intentions du conducteur",c:false},{t:"Adapter les itinéraires en temps réel",c:true}]},
  {q:"L'IA est présente dans les réseaux sociaux pour :",a:[{t:"Trier les contenus affichés",c:true},{t:"Recommander des publications",c:true},{t:"Garantir une information objective",c:false},{t:"Détecter certains abus ou spams",c:true}]},
  {q:"À propos de la reconnaissance d'images :",a:[{t:"Elle repose souvent sur l'IA",c:true},{t:"Elle est utilisée dans des applications grand public",c:true},{t:"Elle fonctionne sans apprentissage préalable",c:false},{t:"Elle sert à identifier des objets ou visages",c:true}]},
  {q:"À propos de l'intelligence artificielle :",a:[{t:"Le terme est souvent utilisé sans précision technique",c:true},{t:"Il désigne toujours la même technologie",c:false},{t:"Il est compris de la même manière par tout le monde",c:false},{t:"Il peut regrouper des réalités très différentes",c:true}]},
  {q:"Dans l'imaginaire collectif, l'IA :",a:[{t:"Est souvent associée aux robots humanoïdes",c:true},{t:"Est toujours invisible",c:false},{t:"Est parfois perçue comme plus intelligente qu'elle ne l'est réellement",c:true},{t:"Est parfaitement comprise",c:false}]},
  {q:"À propos de l'IA aujourd'hui :",a:[{t:"Elle existe uniquement dans les laboratoires",c:false},{t:"Elle est déjà présente dans de nombreux outils du quotidien",c:true},{t:"Elle nécessite toujours une interface visible",c:false},{t:"Elle peut fonctionner sans que l'utilisateur en soit conscient",c:true}]},
  {q:"Concernant le mot « intelligence » dans IA :",a:[{t:"Il peut induire des attentes exagérées",c:true},{t:"Il signifie une conscience artificielle",c:false},{t:"Il est utilisé par analogie avec l'humain",c:true},{t:"Il correspond exactement à l'intelligence humaine",c:false}]},
  {q:"À propos de la compréhension de l'IA par le grand public :",a:[{t:"Elle est souvent partielle ou floue",c:true},{t:"Elle repose sur des bases techniques solides",c:false},{t:"Elle est influencée par les médias et le marketing",c:true},{t:"Elle est homogène chez tous les individus",c:false}]},
  {q:"L'IA est parfois confondue avec :",a:[{t:"Des robots humanoïdes",c:true},{t:"Des scripts automatisés simples",c:true},{t:"Une intelligence consciente",c:false},{t:"Une technologie magique",c:false}]},
  {q:"À propos des capacités de l'IA :",a:[{t:"Elle peut sembler comprendre sans réellement comprendre",c:true},{t:"Elle a une intention propre",c:false},{t:"Elle est toujours autonome",c:false},{t:"Elle dépend fortement de son contexte d'utilisation",c:true}]},
  {q:"Dans les discours médiatiques sur l'IA :",a:[{t:"Les titres sont parfois sensationnalistes",c:true},{t:"Les limites sont toujours clairement expliquées",c:false},{t:"Le terme est parfois utilisé de manière imprécise",c:true},{t:"Les explications sont toujours techniques et détaillées",c:false}]},
  {q:"Une personne de niveau 1 peut penser que l'IA :",a:[{t:"Est très puissante mais difficile à expliquer",c:true},{t:"Peut tout faire sans limites",c:false},{t:"Est un concept un peu flou mais important",c:true},{t:"Est parfaitement maîtrisée par les experts",c:false}]},
  {q:"À propos de l'usage du terme IA en entreprise :",a:[{t:"Il peut être utilisé comme argument marketing",c:true},{t:"Il désigne toujours des systèmes très avancés",c:false},{t:"Il peut recouvrir des solutions très différentes",c:true},{t:"Il est strictement réservé au domaine scientifique",c:false}]},
];

async function tr(text: string, lang: string): Promise<string> {
  if (!process.env.DEEPL_API_KEY || lang === "FR") return text;
  try {
    const r = await fetch("https://api-free.deepl.com/v2/translate", {
      method: "POST",
      headers: { "Authorization": `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ text: [text], source_lang: "FR", target_lang: lang === "EN" ? "EN-US" : lang }),
    });
    if (r.ok) { const d = await r.json(); return d.translations[0]?.text || text; }
  } catch (e) { console.error(`Err tr ${lang}:`, e); }
  return text;
}

export async function POST() {
  try {
    const level = await prisma.level.findFirst({ where: { number: 2 } });
    if (!level) return NextResponse.json({ error: "Level 2 not found" }, { status: 404 });
    
    const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    if (!admin) return NextResponse.json({ error: "Admin not found" }, { status: 404 });

    // Delete existing
    await prisma.quizTranslation.deleteMany({ where: { quiz: { levelId: level.id } } });
    await prisma.quiz.deleteMany({ where: { levelId: level.id } });

    let imported = 0, translations = 0;
    
    for (const item of Q) {
      const answers = item.a.map(a => ({ text: a.t, isCorrect: a.c }));
      const quiz = await prisma.quiz.create({
        data: { question: item.q, answers, levelId: level.id, isActive: true, createdById: admin.id },
      });

      for (const lang of LANGS) {
        const tq = await tr(item.q, lang);
        const ta = [];
        for (const a of item.a) {
          ta.push({ text: await tr(a.t, lang), isCorrect: a.c });
        }
        await prisma.quizTranslation.create({
          data: { quizId: quiz.id, language: lang, question: tq, answers: ta },
        });
        translations++;
      }
      imported++;
    }

    return NextResponse.json({ success: true, imported, translations, languages: LANGS.length });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ questions: Q.length, languages: LANGS.length, method: "POST to import" });
}
