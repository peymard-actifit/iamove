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

---
*Dernière mise à jour: 2026-02-06*
