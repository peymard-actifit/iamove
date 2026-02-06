# Historique des Prompts - iamove

## Prompt #1 - Initialisation du projet
```
Je souhaite travailler sur un nouveau projet de nom iamove. J'ai créé un github vierge pour l'instant et en voilà le token que tu peux mémoriser. Je vais ensuite créer un environnement vercel pour pouvoir compiler et déployer. Initialise tout ce qu'il faut en local et sur le github, synchronise bien, pour précéder cette configuration sur vercel.
```

## Prompt #2 - Configuration Vercel
```
Utilise le token VERCEL et le projet iamove dans vercel. Vérifie que tu récupères bien les variables d'environnement dans Vercel pour OPENAI, DEEPL et la base de données.
```

## Prompt #3 - Session d'initialisation
```
Ceci est le prompt d'initialisation de la session de travail sur Cursor. Les commandes suivantes doivent être faites à la suite puis un rapport doit être généré.
Commandes :
- Repasse en revue le code pour bien le comprendre
- Vérifie les tokens Git et Vercel
- Vérifie la synchronisation worktree/Git
- Vérifie le script de déploiement
- Utilise le script pour créer une nouvelle version avec indentation sémantique
Rapport : LoC, Tokens, API Keys, DB info, Sync status, Version, Limites identifiées
```

## Prompt #4 - Augmentation des limites
```
Essaye déjà d'augmenter toutes les limites connues au maximum pour anticiper les besoins à venir du développement.
```

## Prompt #5 - Spécification complète du studio
```
Je veux réaliser un projet de studio de fabrication de site web, full responsive, utilisable sur pc et sur smartphone, dont l'objectif est de réaliser des sites d'accompagnement des compétences de travail d'entreprises et d'équipes autour des technologies liées à l'IA.

Fonctionnalités principales :
- Vue de gestion des sites (CRUD, duplication, publication)
- 5 onglets par site : Liste personnes, Organigramme, Fiche détaillée, Formation IA, Quizz
- Gestion des utilisateurs studio (standard/admin avec code 1241)
- Gestion des personnes dans les sites publiés
- Sauvegarde permanente en base de données
- Menu paramètres escamotable à droite
```

## Prompt #6 - Réinitialisation session
```
[Même prompt d'initialisation que #3]
```

## Prompt #7 - Compléter et déployer
```
Complète tout et utilise le script pour commit and deploy.
```

## Prompt #8 - Problème interface login
```
Je ne vois que cela, pas d'interface pour se connecter ou créer un compte
```

## Prompt #9 - Erreur inscription
```
[Screenshot montrant erreur 500 sur /api/auth/register]
```

## Prompt #10 - Variables Vercel
```
[Screenshot montrant les variables d'environnement déjà présentes dans Vercel]
Mais toutes les variables d'environnement sont déjà présentes dans vercel... récupère les
```

## Prompt #11 - Diagnostic complet
```
J'ai déjà dit que les variables d'environnement sont présentes dans Vercel dans le projet. Réexamine tout, vérifie les accès à la base, examine bien les liaisons et dit moi si quelque chose ne fonctionne pas. Mais ne me redemande pas la même chose à laquelle j'ai déjà répondu. Par ailleurs, sauvegarde la liste des prompts en les incrémentant dans un fichier dans le git.
```

## Prompt #12 - Rappel script déploiement
```
As-tu commit and deploy avec le script et indenté la version ? Tu dois le faire systématiquement après chaque amélioration
```

## Prompt #13 - Déploiement contrôlé
```
Je ne veux pas que le build soit lancé automatiquement par le commit entre Github et Vercel, je veux le maitriser depuis le lancement du script avec cursor.
```

## Prompt #14 - Corrections UI
```
A droite de la mention "Studio", il faut rajouter la version du commit du projet. Quand on crée une personne dans un site, il ne faut pas etre obligé de nommer un responsable. Parfois on veu créer le responsable justement. La fonction d'édition d'une personne ne fonctionne pas.
```

## Prompt #15 - Bug ajout personne
```
Je ne sors pas de la fenetre en faisant ajouter
```

## Prompt #16 - Edition inline personnes
```
L'édition des personnes n'est toujours pas possible dans le studio et un site. Quand je clique sur Editer, cela ne fait rien,. Je veux qu'il n'y ait pas de menu avec trois petit points à droite des lignes de personnes, mais directement les icônes les uns à coté des autres, justifiés à droite. Je veux pouvoir éditer directement les valeurs dans la liste en cliquant sur chaque texte. Y compris le niveau que je veux pouvoir ajuster de 0 à 20.
```

## Prompt #17 - Réorganisation header et UI
```
Dans la page de gestion des sites, met "Ajouter un site" à gauche du menu de l'utilisateur tout en haut. Mets "Mes sites" et le texte en dessous dans la barre du haut au centre de l'espace entre le bouton "Ajouter..." et la version du studio. Garde tout le contenu de la tuile de site en dessous, mais réduit sa taille. Enlèce le menu avec les trois petits points pour mettre les icones à droite du nom du site, côte à côte et en les justifiant à droite. Dans la vue de gestion d'un site dans le studio, remonte le bouton de menu des paramètres du site juste à gauche du menu de l'utilisateur, puis juste à gauche met le statut publié ou non, puis met , entre le statut et la version du studio le titre du site en le centrant entre les deux. réduit la hauteur des lignes de personnes.
```

## Prompt #18 - Bouton ajouter personne dans onglets
```
Le bouton "Ajouter une personne" doit monter dans la barre des onglets du site. Le nombre de personnes doit être affiché dans le bouton d'Ajouter une personne en le mettant entre parenthèse à droite de personne. L'affichage à gauche du nombre de personnes doit donc disparaitre. La flèche à gauche du titre dusite doit disparaître puisqu'on peut revenir au menu de gestion des sites en cliquant en haut à gauche de l'écran.
```

## Prompt #19 - Tri colonnes et correction œil profil
```
Les titres de colonnes de gestion des personnages doivent permettre un tri par ordre alphabétique de la colonne, dans un sens ou dans l'autre. En reclqiuant dessus cela inverse le sens. Il faut réduire la hauteur de la ligne destitres de colonnes à la même hauteur que les lignes de personnages. L'oeil qui permet d'éditer ne lance aucune fenetre.
```

## Prompt #20 - Espace onglets et icônes niveaux organigramme
```
Il faut enlever l'espace au dessus et en dessous des onglets, qui ne sert à rien. Dans les tuiles d'organigramme, il faut enlever l'icone de photo qui ne sert à rien, en revanche, au meme niveau que le numéro du niveau, il faudra rajouter l'icone correspondante (je joins le fichier a lire pour placer les niveaux et les définitions et icones associées à stocker dans un JSON structuré comme l'excel, par niveau).
```

## Prompt #21 - Lecture fichiers Excel
```
Pourquoi tu ne peux pas lire les fichiers excel, fais en sorte de pouvoir les lire.
```
→ Installation de la bibliothèque `xlsx` et création du script `scripts/read-excel.js`
→ Lecture du fichier IASCALE avec 21 niveaux (0-20) et thème Star Wars
→ Création de `src/data/levels.json` avec les données complètes
→ Mise à jour de `src/lib/levels.tsx` avec les icônes correspondantes

## Prompt #22 - Extraction des vraies icônes Excel
```
Prend les icones réels qui sont dans le fichier excel sous forme d'images dans les cases.
```
→ Installation de `adm-zip` pour extraire les images du fichier Excel
→ Extraction des 21 images PNG dans `public/images/levels/`
→ Renommage en `level-0.png` à `level-20.png`
→ Mise à jour de `src/lib/levels.tsx` pour utiliser les images via `next/image`

## Prompt #23 - Tooltip niveaux et icône liste personnes
```
Quand on survole le niveau ou l'icone, sur les tuiles d'organigramme, s'affiche pendant 5 secondes le nom du niveau et le nom star wars, l'un au dessus de l'autre, dans une police plutôt petite. Il faut rajouter l'icone aussi dans la liste des personnes à droite du niveau. Et dans les tuiles d'organigramme, inverser le numéro et l'icone.
```
→ Tooltip au survol avec nom du niveau + nom Star Wars (5 sec)
→ Ordre inversé : "Niv. X" puis icône dans l'organigramme
→ Icône ajoutée à droite du niveau dans la liste des personnes (Tab1)

## Prompt #24 - Système de traduction multilingue
```
Vérifie que toutes les données sont bien sauvegardées. Rajoute un drapeau français à gauche du menu utilisateur. Au clic, affiche tous les drapeaux des langues DeepL. Système GLOBAL (studio) et LOCAL (sites) indépendants.
```
→ Création du système i18n complet (`src/lib/i18n/`)
→ 26 langues supportées (DeepL) avec drapeaux
→ Contexte React `I18nProvider` pour la gestion de langue
→ Composant `LanguageSelector` avec dialog de sélection
→ Traductions FR et EN complètes
→ API `/api/user/language` pour sauvegarder la préférence
→ Champ `language` ajouté au modèle `StudioUser`

## Prompt #25 - Traductions LOCALES par site
```
Vas-y pour les traductions LOCALES par site
```
→ Champ `language` ajouté au modèle `Site` (Prisma)
→ Composant `SiteLanguageSelector` créé
→ Sélecteur de langue sur chaque tuile de site (drapeau)
→ API `/api/sites/[siteId]/language` pour changer la langue
→ Système indépendant du sélecteur GLOBAL

## Prompt #26 - Vrais drapeaux et traductions complètes
```
Ce ne sont pas des drapeaux. Trouve les drapeaux. Sur GLOBAL et LOCAL. Le sous-titre Studio doit être traduit ainsi que les boutons Ajouter et les titres d'onglets.
```
→ Installation du package `flag-icons` (vrais drapeaux SVG)
→ Création du composant `Flag` avec 3 tailles (sm, md, lg)
→ Mise à jour du sélecteur GLOBAL avec vrais drapeaux
→ Mise à jour du sélecteur LOCAL avec vrais drapeaux
→ Traduction du sous-titre "Studio" dans le header
→ Traduction de "Ajouter un site" (dashboard)
→ Traduction de "Ajouter une personne" (site editor)
→ Traduction des titres d'onglets (Équipe, Organisation, Profil, Formation, Évaluation)
→ Traduction des labels du formulaire d'ajout de personne

## Prompt #27 - Traductions 26 langues complètes en base
```
J'ai demandé que les 26 langues soient traitées et que tous les éléments, soit GLOBAUX soit LOCAUX soient traduits. Reprend les données, et prépare les traductions dans les 26 langues et mémorise les dans la base de données.
```
→ Modèle Prisma `Translation` créé pour stocker toutes les traductions
→ 80+ clés de traduction pour l'interface GLOBAL
→ Traductions complètes dans les 26 langues DeepL :
  - FR, EN, DE, ES, IT, PT, NL, PL, RU
  - JA, ZH, KO, AR, TR, SV, DA, FI, NO
  - CS, EL, HU, RO, SK, BG, UK, ID
→ API `/api/translations` pour charger les traductions par langue
→ API `/api/translations/seed` pour initialiser la base avec toutes les traductions
→ Contexte I18n mis à jour pour charger depuis la base de données
→ Fonction `buildTranslationsObject()` pour construire l'objet de traductions
→ Cache des traductions pour éviter les requêtes répétées

## Prompt #28 - Tooltips, placeholders et drapeaux agrandis
```
Les informations au survol ne sont pas traduites, ainsi que les informations à l'intérieur des champs à remplir qui disent avec quoi remplir les champs. Corrige cela dans les 26 langues. Enlève les noms des pays dans la fenêtre de sélection des drapeaux et mets des drapeaux beaucoup plus gros de la taille des cases de la fenêtre. Les drapeaux doivent être parfaitement proportionnés comme les vrais drapeaux.
```
→ Ajout de 14 traductions TOOLTIP (viewProfile, editPerson, deletePerson, editSite, deleteSite, duplicateSite, publishSite, unpublishSite, siteSettings, changeLanguage, userMenu, sortAscending, sortDescending, siteContentLanguage)
→ Ajout de 7 traductions PLACEHOLDER (enterName, enterEmail, enterPosition, enterDepartment, enterSiteName, enterDescription, selectManager)
→ Toutes les traductions dans les 26 langues (80+ clés → 100+ clés)
→ Composant Flag amélioré avec 5 tailles : sm, md, lg, xl, 2xl
→ Proportions de drapeau réalistes (ratio ~3:2)
→ Sélecteurs de langue (GLOBAL et LOCAL) avec drapeaux XL
→ Grille 6 colonnes sans noms de pays
→ Effet de zoom au survol des drapeaux
→ Mise à jour de sites-list.tsx avec tooltips traduits
→ Mise à jour de tab1-persons.tsx avec tooltips traduits
→ Mise à jour de site-editor.tsx avec placeholders traduits
→ Mise à jour de tab3-profile.tsx avec placeholders et labels traduits
→ Mise à jour des sélecteurs de langue avec tooltips traduits

## Prompt #29 - Orientation drapeaux et niveaux dans liste personnes
```
Les drapeaux sont dans le mauvais sens sur l'image, essaye de ne pas faire ce genre d'erreur ridicule que je gagne du temps. Regarde un peu, même l'affichage du drapeau pour rentrer dans la fenêtre avec tous les drapeaux n'est pas correct (met pareil que pour la tuile d'un site). Dans la liste des personnes, je veux la même façon d'indiquer les niveaux que dans les tuiles d'organigramme. et le survol doit aussi donner le même résultat que dans les organigrammes.
```
→ Correction du composant Flag avec ratio 3:2 horizontal (width > height)
→ Dimensions en pixels explicites pour proportions parfaites
→ Ajout de `tooltip.viewSite` dans les 26 langues
→ Mise à jour tab1-persons.tsx avec tooltip sur hover du niveau (comme organigramme)
→ Niveau affiché avec icône + numéro + tooltip 5 secondes

## Prompt #30 - Traductions manquantes (onglets, colonnes, menu paramètres)
```
Les onglets, le contenu du menu sites, les titres des colonnes de personnes, le mot publié en haut, NE SONT PAS TRADUITS : vérifie vraiment partout et complète les traductions dans toutes les langues dans la base.
```
→ Ajout section `settings` avec 6 traductions (siteSettings, generalInfo, personalization, primaryColor, secondaryColor, publishedUrl) dans 26 langues
→ Mise à jour site-settings-panel.tsx avec traductions complètes
→ Mise à jour site-header-content.tsx avec traductions "Publié"/"Brouillon"
→ Mise à jour tab1-persons.tsx avec traductions titres colonnes (Nom, Email, Poste, Service, Niv., Responsable, Actions)
→ Mise à jour site-editor.tsx pour forcer les traductions des onglets (au lieu des valeurs stockées en base)

## Prompt #31 - Affichage niveau dans liste comme organigramme
```
Dans la liste des personnes les affichages pour les niveaux doivent avoir exactement la même forme que pour les tuiles d'organigramme.
```
→ Mise à jour LevelSelector dans tab1-persons.tsx
→ Style harmonisé avec l'organigramme : "Niv. X" + icône
→ Fond bleu arrondi comme badge

## Prompt #32 - Hauteur lignes et forme niveau exacte
```
Mais enfin, la même forme que dans les tuiles d'organigrammes, avec de gauche à droite : Niv X et l'icône. Pareil, pas avec un rond bleu, et en gardant les lignes par personnes mince en hauteur.
```
→ Réduction hauteur des lignes (h-6 au lieu de h-7)
→ Style niveau compact : texte + icône sans fond proéminent
→ Ajustement padding et espacement global du tableau

## Prompt #33 - Icône niveau dans profil
```
Dans le menu d'édition des personnes, l'icône bleue en haut à gauche doit être remplacée par l'icône de niveau à la même taille.
```
→ Remplacement de l'icône User par l'icône du niveau dans tab3-profile.tsx
→ Utilisation de getLevelIcon() avec taille h-12 w-12

## Prompt #34 - Profil en popup et fond blanc icône
```
Ne met pas de fond de couleur sous l'icône, laisse la sur un fond blanc. Fait en sorte que la fenêtre d'édition du profil soit un pop up dans l'onglet de l'équipe plutôt qu'un autre onglet profil (que tu peux supprimer). Dans la liste des personnes, tu peux élargir le fond bleu imparfait qui est mis sous le niveau et la petite icône associée afin que le bleu soit aussi sous l'icône.
```
→ Création du composant PersonProfileDialog (popup)
→ Suppression de l'onglet Profil (tab3) du site-editor.tsx
→ Intégration du dialog directement dans Tab1Persons
→ Icône de profil sur fond blanc (sans gradient)
→ Élargissement du fond bleu du LevelSelector pour couvrir l'icône (pl-2 pr-1 gap-1)

## Prompt #35 - Zoom molette et profil éditable vue publiée
```
Quand j'utilise la roulette sur la vue organigramme, je zoome ou je dézoome et cela met à jour la valeur de zoom dans le menu masquable. Dans la vue publiée, il faut que dans l'onglet profil, on retrouve la vue d'édition du profil de la personne connectée en mode éditable afin que la personne puisse tout modifier sauf directement le niveau.
```
→ Zoom à la molette sur l'organigramme (incrément 5% par défilement)
→ Synchronisation automatique avec la valeur affichée dans le menu zoom
→ Création du composant PersonalProfileEditor pour la vue publiée
→ Onglet Profil en vue publiée affiche le profil de la personne connectée
→ Édition possible de tous les champs SAUF le niveau (verrouillé + explication)
→ Icône du niveau de la personne affichée en grand dans le header du profil

## Prompt #36 - Titres onglets navigateur et favicon dynamique
```
Dans le titre de l'onglet du navigateur dans la vue publiée : met le titre du site rajoute "Publié". Dans le titre de l'onglet du navigateur du studio met "Studio IAMOVE" et pour la vue publiée, met l'icone du niveau de la dernière personne connectée en visibilité du navigateur.
```
→ Layout studio avec metadata "Studio IAMOVE"
→ Pages publiées avec generateMetadata "{nom du site} - Publié"
→ Création du composant DynamicFavicon (change favicon via JS)
→ Favicon dynamique = icône du niveau de la personne connectée (level-X.png)
→ Restauration du favicon par défaut lors de la déconnexion

## Prompt #37 - Menu Échelle et suppression bouton Quizz
```
Finalement, en administrateur, enlève le bouton Quizz, le sous-menu dans le menu action suffit. Rajoute un sous-menu "Echelle" qui permette d'éditer les informations liées aux niveaux dans une fenêtre spécifique.
```
→ Suppression du bouton "Quizz" dans le header du dashboard
→ Le menu Quizz reste dans "Actions > Gérer les quizz"
→ Ajout du sous-menu "Échelle des niveaux" dans le menu Actions
→ Création du composant LevelsEditorDialog pour éditer les niveaux
→ API GET /api/levels pour récupérer tous les niveaux
→ API PATCH /api/levels/[levelId] pour modifier un niveau (admin only)
→ Interface d'édition inline : nom, nom Star Wars, description
→ Icône et numéro du niveau affichés en lecture seule

---
*Dernière mise à jour: 2026-02-06*
