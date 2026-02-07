/**
 * Script d'import des quizz niveau 1 depuis le PDF
 * 120 questions pour le niveau 1
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Données extraites du PDF - 120 questions niveau 1
const quizzes = [
  {
    question: "À propos de l'intelligence artificielle :",
    answers: [
      { text: "L'IA est un concept uniquement de science-fiction", isCorrect: false },
      { text: "Le terme IA est utilisé pour désigner des logiciels très variés", isCorrect: true },
      { text: "L'IA existe uniquement sous forme de robots physiques", isCorrect: false }
    ]
  },
  {
    question: "Concernant l'IA dans le grand public :",
    answers: [
      { text: "Les recommandations Netflix reposent souvent sur des algorithmes d'IA", isCorrect: true },
      { text: "L'IA prend toujours des décisions autonomes sans humain", isCorrect: false },
      { text: "Les assistants vocaux utilisent des techniques d'IA", isCorrect: true }
    ]
  },
  {
    question: "Parmi les usages suivants, lesquels peuvent intégrer de l'IA sans que l'utilisateur en ait conscience ?",
    answers: [
      { text: "Correction orthographique automatique", isCorrect: true },
      { text: "Recherche sur un moteur classique", isCorrect: true },
      { text: "Calculatrice simple", isCorrect: false }
    ]
  },
  {
    question: "Un utilisateur conscient de l'IA :",
    answers: [
      { text: "Sait qu'un outil utilise de l'IA sans en connaître les détails techniques", isCorrect: true },
      { text: "Est capable d'entraîner un modèle", isCorrect: false },
      { text: "Comprend la finalité générale de l'outil utilisé", isCorrect: true }
    ]
  },
  {
    question: "Un usage régulier de l'IA implique :",
    answers: [
      { text: "Une utilisation volontaire et répétée d'outils IA", isCorrect: true },
      { text: "Une compréhension mathématique des modèles", isCorrect: false },
      { text: "Un usage pour des tâches concrètes (texte, synthèse, idées)", isCorrect: true }
    ]
  },
  {
    question: "À propos de la perception de l'IA :",
    answers: [
      { text: "Les films montrent une version réaliste de l'IA actuelle", isCorrect: false },
      { text: "L'IA actuelle est beaucoup plus limitée que celle montrée dans les films", isCorrect: true }
    ]
  },
  {
    question: "L'expression « IA » est souvent utilisée :",
    answers: [
      { text: "Comme argument marketing même pour des fonctions simples", isCorrect: true },
      { text: "Uniquement pour des systèmes très avancés", isCorrect: false }
    ]
  },
  {
    question: "À propos du fonctionnement de l'IA :",
    answers: [
      { text: "Comprendre l'IA nécessite forcément des connaissances mathématiques avancées", isCorrect: false },
      { text: "On peut parler d'IA sans connaître son fonctionnement technique précis", isCorrect: true }
    ]
  },
  {
    question: "L'IA est utilisée :",
    answers: [
      { text: "Uniquement dans les laboratoires de recherche", isCorrect: false },
      { text: "Dans des outils du quotidien sans que l'utilisateur s'en rende toujours compte", isCorrect: true },
      { text: "Seulement par des ingénieurs spécialisés", isCorrect: false }
    ]
  },
  {
    question: "Concernant l'IA :",
    answers: [
      { text: "L'IA pense comme un humain", isCorrect: false },
      { text: "L'IA peut donner l'impression de comprendre sans réellement comprendre", isCorrect: true }
    ]
  },
  {
    question: "Le terme « intelligence artificielle » :",
    answers: [
      { text: "A une définition unique et universelle", isCorrect: false },
      { text: "Est utilisé pour désigner des choses très différentes selon le contexte", isCorrect: true }
    ]
  },
  {
    question: "À propos de l'IA aujourd'hui :",
    answers: [
      { text: "Elle est encore très rare dans la vie quotidienne", isCorrect: false },
      { text: "Elle est souvent invisible pour l'utilisateur final", isCorrect: true }
    ]
  },
  {
    question: "L'IA :",
    answers: [
      { text: "A des émotions", isCorrect: false },
      { text: "Peut donner l'illusion d'un comportement intelligent", isCorrect: true }
    ]
  },
  {
    question: "Quand on parle d'IA dans les médias :",
    answers: [
      { text: "Le terme est parfois simplifié à l'extrême", isCorrect: true },
      { text: "Les explications sont toujours techniquement exactes", isCorrect: false }
    ]
  },
  {
    question: "À propos de l'IA (historique) :",
    answers: [
      { text: "C'est une technologie apparue uniquement ces dernières années", isCorrect: false },
      { text: "Le terme existe depuis plusieurs décennies", isCorrect: true }
    ]
  },
  {
    question: "L'IA (domaines) :",
    answers: [
      { text: "Est uniquement liée à l'informatique", isCorrect: false },
      { text: "Est souvent associée à l'informatique même si elle touche d'autres domaines", isCorrect: true }
    ]
  },
  {
    question: "Pour parler d'IA, il faut :",
    answers: [
      { text: "Être ingénieur spécialisé", isCorrect: false },
      { text: "Avoir au minimum entendu le concept sans le maîtriser", isCorrect: true }
    ]
  },
  {
    question: "Le mot « IA » :",
    answers: [
      { text: "Est parfois utilisé pour désigner des algorithmes simples", isCorrect: true },
      { text: "Désigne toujours des systèmes très complexes", isCorrect: false }
    ]
  },
  {
    question: "Certaines personnes pensent que l'IA :",
    answers: [
      { text: "Peut tout faire sans limite", isCorrect: false },
      { text: "Est souvent surestimée dans l'imaginaire collectif", isCorrect: true }
    ]
  },
  {
    question: "À propos de l'IA actuelle :",
    answers: [
      { text: "Elle est capable de remplacer totalement l'humain dans tous les domaines", isCorrect: false },
      { text: "Elle est puissante mais très dépendante de son contexte d'utilisation", isCorrect: true }
    ]
  },
  {
    question: "L'IA est souvent perçue comme :",
    answers: [
      { text: "Une technologie difficile à définir précisément", isCorrect: true }
    ]
  },
  {
    question: "À propos de l'IA (confusion) :",
    answers: [
      { text: "Elle existe uniquement sur Internet", isCorrect: false },
      { text: "Elle est parfois confondue avec de simples automatismes", isCorrect: true }
    ]
  },
  {
    question: "L'expression « IA » (définitions) :",
    answers: [
      { text: "Est toujours utilisée de manière rigoureuse", isCorrect: false },
      { text: "Peut désigner des choses très différentes", isCorrect: true },
      { text: "A le même sens pour tout le monde", isCorrect: false }
    ]
  },
  {
    question: "Beaucoup de personnes pensent que l'IA :",
    answers: [
      { text: "Est capable de raisonner comme un humain", isCorrect: false },
      { text: "Peut sembler intelligente sans l'être réellement", isCorrect: true }
    ]
  },
  {
    question: "À propos des outils dits « IA » :",
    answers: [
      { text: "Ils sont tous récents", isCorrect: false },
      { text: "Certains existent depuis longtemps sans être appelés IA", isCorrect: true },
      { text: "Ils sont réservés aux chercheurs", isCorrect: false }
    ]
  },
  {
    question: "L'IA est souvent associée :",
    answers: [
      { text: "Aux robots humanoïdes", isCorrect: false },
      { text: "À des logiciels invisibles pour l'utilisateur", isCorrect: true }
    ]
  },
  {
    question: "Une personne débutante peut croire que :",
    answers: [
      { text: "L'IA sait tout", isCorrect: false },
      { text: "L'IA dépend de ce qu'on lui demande", isCorrect: true }
    ]
  },
  {
    question: "À propos de l'intelligence artificielle (compréhension) :",
    answers: [
      { text: "Le terme est parfois mal compris", isCorrect: true }
    ]
  },
  {
    question: "L'IA (complexité) :",
    answers: [
      { text: "Peut être présente dans des systèmes simples", isCorrect: true },
      { text: "Est toujours complexe", isCorrect: false }
    ]
  },
  {
    question: "Dans le langage courant :",
    answers: [
      { text: "IA et automatisation sont parfois confondues", isCorrect: true },
      { text: "Ils signifient toujours la même chose", isCorrect: false },
      { text: "La distinction n'est pas toujours claire pour le grand public", isCorrect: true }
    ]
  },
  {
    question: "L'IA (secteurs) :",
    answers: [
      { text: "Existe uniquement dans les grandes entreprises", isCorrect: false },
      { text: "Est utilisée dans de nombreux secteurs sans être visible", isCorrect: true }
    ]
  },
  {
    question: "Certaines personnes pensent que l'IA (volonté) :",
    answers: [
      { text: "A une volonté propre", isCorrect: false },
      { text: "Peut fonctionner sans données", isCorrect: false },
      { text: "Est souvent présentée de manière exagérée", isCorrect: true }
    ]
  },
  {
    question: "À propos de la compréhension de l'IA :",
    answers: [
      { text: "On peut en parler sans savoir comment elle fonctionne exactement", isCorrect: true }
    ]
  },
  {
    question: "L'IA est parfois perçue comme :",
    answers: [
      { text: "Une boîte noire incompréhensible", isCorrect: true },
      { text: "Une technologie magique", isCorrect: false }
    ]
  },
  {
    question: "À propos de l'IA dans les médias :",
    answers: [
      { text: "Les titres sont parfois sensationnalistes", isCorrect: true },
      { text: "Les explications sont toujours détaillées", isCorrect: false }
    ]
  },
  {
    question: "L'IA (autonomie) :",
    answers: [
      { text: "Est toujours autonome", isCorrect: false },
      { text: "Est souvent pilotée par des humains", isCorrect: true }
    ]
  },
  {
    question: "Beaucoup assimilent l'IA :",
    answers: [
      { text: "À un cerveau artificiel", isCorrect: false },
      { text: "À un ensemble de programmes informatiques", isCorrect: true }
    ]
  },
  {
    question: "L'IA (visibilité) :",
    answers: [
      { text: "Peut être utilisée sans que l'utilisateur le sache", isCorrect: true },
      { text: "Est toujours visible", isCorrect: false }
    ]
  },
  {
    question: "À propos des limites de l'IA :",
    answers: [
      { text: "Elles sont souvent mal perçues par les non-spécialistes", isCorrect: true }
    ]
  },
  {
    question: "Le terme IA (précision) :",
    answers: [
      { text: "Peut prêter à confusion", isCorrect: true },
      { text: "Est toujours précis", isCorrect: false }
    ]
  },
  {
    question: "L'IA est souvent décrite comme :",
    answers: [
      { text: "Plus intelligente qu'elle ne l'est réellement dans l'imaginaire collectif", isCorrect: true }
    ]
  },
  {
    question: "À propos de l'IA (assistance) :",
    answers: [
      { text: "Elle remplace déjà tous les métiers", isCorrect: false },
      { text: "Elle assiste certaines tâches humaines", isCorrect: true }
    ]
  },
  {
    question: "L'IA (forme) :",
    answers: [
      { text: "Peut exister sans interface visible", isCorrect: true },
      { text: "Est toujours incarnée dans un robot", isCorrect: false }
    ]
  },
  {
    question: "Certaines définitions de l'IA :",
    answers: [
      { text: "Sont volontairement floues", isCorrect: true },
      { text: "Sont toujours consensuelles", isCorrect: false }
    ]
  },
  {
    question: "Une personne de niveau 1 :",
    answers: [
      { text: "A entendu parler de l'IA sans la pratiquer", isCorrect: true },
      { text: "Maîtrise les concepts techniques", isCorrect: false }
    ]
  },
  {
    question: "À propos du terme « intelligent » dans IA :",
    answers: [
      { text: "Il est parfois trompeur", isCorrect: true },
      { text: "Il signifie une intelligence humaine", isCorrect: false }
    ]
  },
  {
    question: "L'IA (apparence autonomie) :",
    answers: [
      { text: "Peut sembler autonome alors qu'elle ne l'est pas vraiment", isCorrect: true }
    ]
  },
  {
    question: "L'IA (évolution) :",
    answers: [
      { text: "A toujours existé sous ce nom", isCorrect: false },
      { text: "A évolué dans sa définition au fil du temps", isCorrect: true }
    ]
  },
  {
    question: "L'IA est parfois confondue avec :",
    answers: [
      { text: "Des scripts automatiques simples", isCorrect: true },
      { text: "Des bases de données", isCorrect: false }
    ]
  },
  {
    question: "Dans l'imaginaire collectif, l'IA :",
    answers: [
      { text: "Est souvent surestimée", isCorrect: true },
      { text: "Est parfaitement comprise", isCorrect: false }
    ]
  },
  {
    question: "L'IA est un terme :",
    answers: [
      { text: "Souvent utilisé sans être précisément défini", isCorrect: true }
    ]
  },
  {
    question: "À propos de l'IA (forme physique) :",
    answers: [
      { text: "Elle est uniquement liée aux robots", isCorrect: false },
      { text: "Elle peut exister sans forme physique", isCorrect: true }
    ]
  },
  {
    question: "L'IA (sens) :",
    answers: [
      { text: "A toujours le même sens selon les personnes", isCorrect: false },
      { text: "Peut désigner des réalités différentes", isCorrect: true }
    ]
  },
  {
    question: "Beaucoup de gens pensent que l'IA :",
    answers: [
      { text: "Est intelligente comme un humain", isCorrect: false }
    ]
  },
  {
    question: "L'IA est souvent :",
    answers: [
      { text: "Présentée de façon simplifiée dans les médias", isCorrect: true },
      { text: "Expliquée avec rigueur technique", isCorrect: false }
    ]
  },
  {
    question: "Le mot « intelligence » dans IA :",
    answers: [
      { text: "Peut prêter à confusion", isCorrect: true }
    ]
  },
  {
    question: "À propos de l'IA aujourd'hui (visibilité) :",
    answers: [
      { text: "Elle est déjà partout visible", isCorrect: false },
      { text: "Elle est souvent invisible pour l'utilisateur final", isCorrect: true }
    ]
  },
  {
    question: "L'IA (autonomie réelle) :",
    answers: [
      { text: "Peut sembler autonome sans l'être réellement", isCorrect: true },
      { text: "Prend toujours des décisions seule", isCorrect: false }
    ]
  },
  {
    question: "Dans le langage courant (confusion) :",
    answers: [
      { text: "IA et robot sont parfois confondus", isCorrect: true }
    ]
  },
  {
    question: "L'IA est parfois vue comme :",
    answers: [
      { text: "Une boîte noire incompréhensible", isCorrect: true },
      { text: "Une science exacte parfaitement maîtrisée", isCorrect: false }
    ]
  },
  {
    question: "L'IA (historique 2) :",
    answers: [
      { text: "Elle existe depuis très longtemps sous différentes formes", isCorrect: true },
      { text: "Elle est apparue uniquement avec Internet", isCorrect: false }
    ]
  },
  {
    question: "L'IA (conscience) :",
    answers: [
      { text: "L'IA est toujours consciente", isCorrect: false }
    ]
  },
  {
    question: "L'IA (associations) :",
    answers: [
      { text: "Elle est associée aux films de science-fiction", isCorrect: true },
      { text: "À des usages concrets quotidiens", isCorrect: false }
    ]
  },
  {
    question: "L'IA (usage invisible) :",
    answers: [
      { text: "Elle peut être utilisée sans que l'utilisateur le sache", isCorrect: true }
    ]
  },
  {
    question: "L'IA (remplacement) :",
    answers: [
      { text: "Elle remplace déjà tous les humains", isCorrect: false },
      { text: "Elle assiste certaines tâches humaines", isCorrect: true }
    ]
  },
  {
    question: "Le terme IA (marketing) :",
    answers: [
      { text: "Le terme IA est parfois utilisé abusivement à des fins marketing", isCorrect: true }
    ]
  },
  {
    question: "L'IA (erreurs) :",
    answers: [
      { text: "L'IA fonctionne toujours sans erreurs", isCorrect: false },
      { text: "Elle peut produire des résultats incorrects", isCorrect: true }
    ]
  },
  {
    question: "Les systèmes IA :",
    answers: [
      { text: "Les systèmes IA sont tous identiques", isCorrect: false },
      { text: "Ils peuvent être très différents les uns des autres", isCorrect: true }
    ]
  },
  {
    question: "L'IA (perception) :",
    answers: [
      { text: "Elle est magique", isCorrect: false },
      { text: "Très puissante mais mal comprise", isCorrect: true }
    ]
  },
  {
    question: "L'IA (simplification) :",
    answers: [
      { text: "Elle est souvent simplifiée à l'extrême dans les discussions grand public", isCorrect: true }
    ]
  },
  {
    question: "L'IA (robot visible) :",
    answers: [
      { text: "Elle est toujours visible sous forme de robot", isCorrect: false }
    ]
  },
  {
    question: "L'IA (contexte) :",
    answers: [
      { text: "Elle dépend fortement de son contexte d'utilisation", isCorrect: true },
      { text: "Elle agit toujours de la même façon", isCorrect: false }
    ]
  },
  {
    question: "L'IA (compréhension réelle) :",
    answers: [
      { text: "L'IA comprend réellement ce qu'elle fait", isCorrect: false }
    ]
  },
  {
    question: "L'IA (description) :",
    answers: [
      { text: "Elle est souvent décrite comme plus intelligente qu'en réalité", isCorrect: true }
    ]
  },
  {
    question: "L'IA (connaissance technique) :",
    answers: [
      { text: "On peut en parler sans savoir comment elle fonctionne exactement", isCorrect: true }
    ]
  },
  {
    question: "L'IA (logicielle) :",
    answers: [
      { text: "Elle peut être purement logicielle", isCorrect: true },
      { text: "Elle doit toujours avoir un corps physique", isCorrect: false }
    ]
  },
  {
    question: "Le terme IA (toujours précis) :",
    answers: [
      { text: "Le terme IA est toujours précis", isCorrect: false }
    ]
  },
  {
    question: "L'IA (limites) :",
    answers: [
      { text: "Elle peut tout faire", isCorrect: false },
      { text: "Elle a des limites importantes", isCorrect: true }
    ]
  },
  {
    question: "L'IA (grand public) :",
    answers: [
      { text: "Elle est souvent mal comprise par le grand public", isCorrect: true }
    ]
  },
  {
    question: "L'IA (automatisation) :",
    answers: [
      { text: "Elle est parfois confondue avec de simples automatisations", isCorrect: true }
    ]
  },
  {
    question: "Le terme IA (réalités) :",
    answers: [
      { text: "Le terme IA est utilisé pour des réalités très différentes", isCorrect: true },
      { text: "Il existe une définition unique", isCorrect: false },
      { text: "Le mot peut être source de confusion", isCorrect: true }
    ]
  },
  {
    question: "L'IA (médias exagération) :",
    answers: [
      { text: "Elle est exagérée dans les médias", isCorrect: true },
      { text: "Parfaitement comprise", isCorrect: false },
      { text: "Donne une impression d'intelligence humaine", isCorrect: false }
    ]
  },
  {
    question: "L'IA (existence forme) :",
    answers: [
      { text: "Existe uniquement dans des robots", isCorrect: false },
      { text: "Peut être purement logicielle", isCorrect: true },
      { text: "Invisible pour l'utilisateur final", isCorrect: true }
    ]
  },
  {
    question: "L'IA (capacités imaginées) :",
    answers: [
      { text: "Capable de tout faire", isCorrect: false },
      { text: "Fonctionne comme un cerveau humain", isCorrect: false },
      { text: "Souvent surestimée dans l'imaginaire collectif", isCorrect: true }
    ]
  },
  {
    question: "Le mot intelligence (IA) :",
    answers: [
      { text: "Le mot intelligence est parfois trompeur", isCorrect: true },
      { text: "Il signifie une conscience", isCorrect: false },
      { text: "Il est utilisé par analogie humaine", isCorrect: true }
    ]
  },
  {
    question: "L'IA (confusions) :",
    answers: [
      { text: "Confondue avec des scripts simples", isCorrect: true },
      { text: "Une conscience artificielle", isCorrect: false },
      { text: "Une magie technologique", isCorrect: false }
    ]
  },
  {
    question: "IA et robot :",
    answers: [
      { text: "IA et robot assimilés à tort", isCorrect: true },
      { text: "IA = une seule techno", isCorrect: false },
      { text: "Terme parfois marketing", isCorrect: true }
    ]
  },
  {
    question: "L'IA (métiers) :",
    answers: [
      { text: "Elle remplace tous les métiers", isCorrect: false },
      { text: "Elle assiste certaines tâches humaines", isCorrect: true },
      { text: "Elle agit sans supervision", isCorrect: false }
    ]
  },
  {
    question: "L'IA (autonomie apparente) :",
    answers: [
      { text: "Peut sembler autonome sans l'être réellement", isCorrect: true },
      { text: "Décide toujours seule", isCorrect: false },
      { text: "Dépend fortement du contexte", isCorrect: true }
    ]
  },
  {
    question: "Systèmes IA (équivalence) :",
    answers: [
      { text: "Tous les systèmes IA sont équivalents", isCorrect: false },
      { text: "Ils peuvent être très différents", isCorrect: true },
      { text: "Même complexité", isCorrect: false }
    ]
  },
  {
    question: "L'IA (compréhension) :",
    answers: [
      { text: "Elle comprend réellement", isCorrect: false },
      { text: "Réponses impressionnantes sans compréhension réelle", isCorrect: true },
      { text: "A une intention propre", isCorrect: false }
    ]
  },
  {
    question: "L'IA (identification) :",
    answers: [
      { text: "Toujours clairement identifiée", isCorrect: false },
      { text: "Utilisée sans que l'utilisateur le sache", isCorrect: true },
      { text: "Réservée aux experts", isCorrect: false }
    ]
  },
  {
    question: "Médias et IA :",
    answers: [
      { text: "Titres sensationnalistes", isCorrect: true },
      { text: "Toujours précis", isCorrect: false },
      { text: "Simplifiée à l'extrême", isCorrect: true }
    ]
  },
  {
    question: "L'IA (définition évolution) :",
    answers: [
      { text: "Existe depuis seulement quelques années", isCorrect: false },
      { text: "A évolué dans sa définition", isCorrect: true },
      { text: "Toujours comprise pareil", isCorrect: false }
    ]
  },
  {
    question: "Personne niveau 1 :",
    answers: [
      { text: "A entendu parler de l'IA", isCorrect: true },
      { text: "Maîtrise la technique", isCorrect: false },
      { text: "Confond IA et science-fiction", isCorrect: true }
    ]
  },
  {
    question: "L'IA (boîte noire) :",
    answers: [
      { text: "Décrite comme une boîte noire", isCorrect: true },
      { text: "Toujours transparente", isCorrect: false },
      { text: "Perçue comme complexe", isCorrect: true }
    ]
  },
  {
    question: "L'IA (données) :",
    answers: [
      { text: "Fonctionne sans données", isCorrect: false },
      { text: "Magique", isCorrect: false },
      { text: "Mal comprise par une partie du public", isCorrect: true }
    ]
  },
  {
    question: "L'IA (imaginaire puissance) :",
    answers: [
      { text: "Souvent plus puissante qu'en réalité dans l'imaginaire", isCorrect: true },
      { text: "Parfaitement maîtrisée", isCorrect: false },
      { text: "Anthropomorphisée", isCorrect: true }
    ]
  },
  {
    question: "L'IA (outils simples) :",
    answers: [
      { text: "Peut désigner des outils simples", isCorrect: true },
      { text: "Toujours très avancés", isCorrect: false },
      { text: "Utilisé de manière imprécise", isCorrect: true }
    ]
  },
  {
    question: "L'IA (dépendance humain) :",
    answers: [
      { text: "Dépend fortement de l'humain", isCorrect: true },
      { text: "Fonctionne toujours seule", isCorrect: false },
      { text: "Entourée d'idées reçues", isCorrect: true }
    ]
  },
  {
    question: "À propos de l'intelligence artificielle (4 choix) :",
    answers: [
      { text: "Le terme est utilisé dans des contextes très variés", isCorrect: true },
      { text: "Il existe une définition simple comprise par tous", isCorrect: false },
      { text: "Le mot peut recouvrir des réalités très différentes", isCorrect: true },
      { text: "L'IA désigne toujours des systèmes autonomes", isCorrect: false }
    ]
  },
  {
    question: "Dans le discours grand public, l'IA :",
    answers: [
      { text: "Est parfois présentée comme révolutionnaire sans explication technique", isCorrect: true },
      { text: "Est toujours expliquée avec précision", isCorrect: false },
      { text: "Peut être confondue avec de simples automatisations", isCorrect: true },
      { text: "Est réservée aux spécialistes", isCorrect: false }
    ]
  },
  {
    question: "À propos de la perception de l'IA (4 choix) :",
    answers: [
      { text: "Elle est souvent associée à la science-fiction", isCorrect: true },
      { text: "Elle est toujours perçue comme un outil banal", isCorrect: false },
      { text: "Elle peut paraître plus intelligente qu'elle ne l'est réellement", isCorrect: true },
      { text: "Elle est unanimement bien comprise", isCorrect: false }
    ]
  },
  {
    question: "L'IA aujourd'hui (4 choix) :",
    answers: [
      { text: "Peut exister uniquement sous forme logicielle", isCorrect: true },
      { text: "Doit forcément être incarnée dans un robot", isCorrect: false },
      { text: "Est parfois invisible pour l'utilisateur final", isCorrect: true },
      { text: "Fonctionne toujours de manière autonome", isCorrect: false }
    ]
  },
  {
    question: "Concernant le mot « intelligence » dans IA :",
    answers: [
      { text: "Il est utilisé par analogie avec l'intelligence humaine", isCorrect: true },
      { text: "Il signifie une conscience artificielle", isCorrect: false },
      { text: "Il peut induire des attentes exagérées", isCorrect: true },
      { text: "Il correspond exactement à l'intelligence humaine", isCorrect: false }
    ]
  },
  {
    question: "À propos de la compréhension de l'IA par le grand public :",
    answers: [
      { text: "Elle est souvent partielle ou floue", isCorrect: true },
      { text: "Elle repose généralement sur des bases techniques solides", isCorrect: false },
      { text: "Elle est influencée par les médias et le marketing", isCorrect: true },
      { text: "Elle est homogène d'une personne à l'autre", isCorrect: false }
    ]
  },
  {
    question: "L'IA est parfois confondue avec (4 choix) :",
    answers: [
      { text: "Des robots humanoïdes", isCorrect: true },
      { text: "Des scripts automatiques simples", isCorrect: true },
      { text: "Une intelligence consciente", isCorrect: false },
      { text: "Une technologie magique", isCorrect: false }
    ]
  },
  {
    question: "À propos de l'IA dans la société :",
    answers: [
      { text: "Elle est utilisée dans de nombreux domaines", isCorrect: true },
      { text: "Elle est toujours clairement identifiée comme telle", isCorrect: false },
      { text: "Elle est parfois surestimée dans l'imaginaire collectif", isCorrect: true },
      { text: "Elle a supprimé la majorité des emplois", isCorrect: false }
    ]
  },
  {
    question: "Une personne de niveau 1 peut penser que l'IA :",
    answers: [
      { text: "Comprend réellement ce qu'elle fait", isCorrect: false },
      { text: "Est très puissante mais difficile à expliquer", isCorrect: true },
      { text: "Peut tout faire sans limites", isCorrect: false },
      { text: "Est un concept un peu flou mais important", isCorrect: true }
    ]
  },
  {
    question: "À propos de l'usage du terme IA :",
    answers: [
      { text: "Il est parfois utilisé de manière imprécise", isCorrect: true },
      { text: "Il désigne toujours des systèmes très avancés", isCorrect: false },
      { text: "Il peut être employé comme argument marketing", isCorrect: true },
      { text: "Il est strictement réservé au domaine scientifique", isCorrect: false }
    ]
  },
  {
    question: "À propos de l'intelligence artificielle (terme) :",
    answers: [
      { text: "Le terme est souvent utilisé sans précision technique", isCorrect: true },
      { text: "Il désigne toujours la même technologie", isCorrect: false },
      { text: "Il est compris de la même manière par tout le monde", isCorrect: false },
      { text: "Il peut regrouper des réalités très différentes", isCorrect: true }
    ]
  },
  {
    question: "Dans l'imaginaire collectif, l'IA (4 choix) :",
    answers: [
      { text: "Est souvent associée aux robots humanoïdes", isCorrect: true },
      { text: "Est toujours invisible", isCorrect: false },
      { text: "Est parfois perçue comme plus intelligente qu'elle ne l'est réellement", isCorrect: true },
      { text: "Est parfaitement comprise", isCorrect: false }
    ]
  },
  {
    question: "À propos de l'IA aujourd'hui (présence) :",
    answers: [
      { text: "Elle existe uniquement dans les laboratoires", isCorrect: false },
      { text: "Elle est déjà présente dans de nombreux outils du quotidien", isCorrect: true },
      { text: "Elle nécessite toujours une interface visible", isCorrect: false },
      { text: "Elle peut fonctionner sans que l'utilisateur en soit conscient", isCorrect: true }
    ]
  },
  {
    question: "Concernant le mot « intelligence » dans IA (attentes) :",
    answers: [
      { text: "Il peut induire des attentes exagérées", isCorrect: true },
      { text: "Il signifie une conscience artificielle", isCorrect: false },
      { text: "Il est utilisé par analogie avec l'humain", isCorrect: true },
      { text: "Il correspond exactement à l'intelligence humaine", isCorrect: false }
    ]
  },
  {
    question: "À propos de la compréhension de l'IA par le grand public (influence) :",
    answers: [
      { text: "Elle est souvent partielle ou floue", isCorrect: true },
      { text: "Elle repose sur des bases techniques solides", isCorrect: false },
      { text: "Elle est influencée par les médias et le marketing", isCorrect: true },
      { text: "Elle est homogène chez tous les individus", isCorrect: false }
    ]
  },
  {
    question: "L'IA est parfois confondue avec (bis) :",
    answers: [
      { text: "Des robots humanoïdes", isCorrect: true },
      { text: "Des scripts automatisés simples", isCorrect: true },
      { text: "Une intelligence consciente", isCorrect: false },
      { text: "Une technologie magique", isCorrect: false }
    ]
  },
  {
    question: "À propos des capacités de l'IA :",
    answers: [
      { text: "Elle peut sembler comprendre sans réellement comprendre", isCorrect: true },
      { text: "Elle a une intention propre", isCorrect: false },
      { text: "Elle est toujours autonome", isCorrect: false },
      { text: "Elle dépend fortement de son contexte d'utilisation", isCorrect: true }
    ]
  },
  {
    question: "Dans les discours médiatiques sur l'IA :",
    answers: [
      { text: "Les titres sont parfois sensationnalistes", isCorrect: true },
      { text: "Les limites sont toujours clairement expliquées", isCorrect: false },
      { text: "Le terme est parfois utilisé de manière imprécise", isCorrect: true },
      { text: "Les explications sont toujours techniques et détaillées", isCorrect: false }
    ]
  },
  {
    question: "Une personne de niveau 1 peut penser que l'IA (concept) :",
    answers: [
      { text: "Est très puissante mais difficile à expliquer", isCorrect: true },
      { text: "Peut tout faire sans limites", isCorrect: false },
      { text: "Est un concept un peu flou mais important", isCorrect: true },
      { text: "Est parfaitement maîtrisée par les experts", isCorrect: false }
    ]
  },
  {
    question: "À propos de l'usage du terme IA en entreprise :",
    answers: [
      { text: "Il peut être utilisé comme argument marketing", isCorrect: true },
      { text: "Il désigne toujours des systèmes très avancés", isCorrect: false },
      { text: "Il peut recouvrir des solutions très différentes", isCorrect: true },
      { text: "Il est strictement réservé au domaine scientifique", isCorrect: false }
    ]
  }
];

async function importQuizzes() {
  console.log('Début de l\'import des quizz niveau 1...');
  
  try {
    // Récupérer le niveau 1
    const level1 = await prisma.level.findUnique({
      where: { number: 1 }
    });
    
    if (!level1) {
      console.error('Niveau 1 non trouvé dans la base de données. Exécutez d\'abord le seed des niveaux.');
      process.exit(1);
    }
    
    console.log(`Niveau 1 trouvé: ${level1.name} (${level1.id})`);
    
    // Récupérer un admin pour créer les quizz
    const admin = await prisma.studioUser.findFirst({
      where: { role: 'ADMIN' }
    });
    
    if (!admin) {
      console.error('Aucun administrateur trouvé. Créez d\'abord un compte admin.');
      process.exit(1);
    }
    
    console.log(`Admin trouvé: ${admin.name} (${admin.id})`);
    
    // Supprimer les anciens quizz du niveau 1
    const deleted = await prisma.quiz.deleteMany({
      where: { levelId: level1.id }
    });
    console.log(`${deleted.count} anciens quizz supprimés`);
    
    // Importer les nouveaux quizz
    let imported = 0;
    for (const quiz of quizzes) {
      await prisma.quiz.create({
        data: {
          question: quiz.question,
          answers: quiz.answers,
          levelId: level1.id,
          createdById: admin.id,
          isActive: true,
          difficulty: 1
        }
      });
      imported++;
      if (imported % 20 === 0) {
        console.log(`${imported} quizz importés...`);
      }
    }
    
    console.log(`\n✅ Import terminé: ${imported} quizz importés pour le niveau 1`);
    
    // Vérification
    const count = await prisma.quiz.count({
      where: { levelId: level1.id }
    });
    console.log(`Vérification: ${count} quizz en base pour le niveau 1`);
    
  } catch (error) {
    console.error('Erreur lors de l\'import:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

importQuizzes();
