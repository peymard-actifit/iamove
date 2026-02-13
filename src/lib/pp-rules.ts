/**
 * Règles des Points de Participation (PP) – Serious game site publié.
 * Seul l'usage de la version publiée (pas le studio) fait gagner des PP.
 */

export type PPAction =
  | "click"
  | "login"
  | "menu_or_button"
  | "menu_or_button_first"
  | "quiz_complete"
  | "quiz_win_superior"
  | "quiz_win_inferior"
  | "quiz_all_questions_level"
  | "quiz_all_questions_all_levels"
  | "formation_prompt"
  | "knowledge_view"
  | "usecase_create"
  | "usecase_like"
  | "forum_post"
  | "forum_reply"
  | "tech_tip_create"
  | "tech_tip_like";

export interface PPGainRow {
  action: PPAction;
  label: string;
  description: string;
  pp: number;
}

/** Tableau des gains en PP (affichable / extensible) */
export const PP_GAINS: PPGainRow[] = [
  { action: "click", label: "Clic (n'importe où)", description: "Un clic n'importe où sur le site publié", pp: 1 },
  { action: "login", label: "Connexion", description: "Connexion à son compte sur le site publié", pp: 10 },
  {
    action: "menu_or_button",
    label: "Menu / bouton",
    description: "Clic sur un menu ou un bouton",
    pp: 5,
  },
  {
    action: "menu_or_button_first",
    label: "Menu / bouton (1ère fois dans la séance)",
    description: "Bonus si pas déjà cliqué dans la même séance",
    pp: 5,
  },
  {
    action: "quiz_complete",
    label: "Passer un quiz",
    description: "Avoir terminé une session de quiz (20 questions ou passage/échec)",
    pp: 100,
  },
  {
    action: "quiz_win_superior",
    label: "Gagner un quiz (niveau supérieur)",
    description: "Réussir un quiz d'un niveau supérieur à son niveau actuel",
    pp: 200,
  },
  {
    action: "quiz_win_inferior",
    label: "Gagner un quiz (niveau inférieur)",
    description: "Réussir un quiz d'un niveau inférieur à son niveau actuel",
    pp: 50,
  },
  {
    action: "quiz_all_questions_level",
    label: "Toutes les questions d'un niveau",
    description: "Avoir vu toutes les questions d'un même niveau",
    pp: 1000,
  },
  {
    action: "quiz_all_questions_all_levels",
    label: "Toutes les questions de tous les niveaux",
    description: "Avoir vu toutes les questions de tous les niveaux",
    pp: 100000,
  },
  {
    action: "formation_prompt",
    label: "Prompt zone Formation IA",
    description: "Chaque message envoyé dans la zone IA de la Formation",
    pp: 5,
  },
  {
    action: "knowledge_view",
    label: "Consultation base de connaissances",
    description: "Consulter un élément de la base de connaissances (ex. un niveau)",
    pp: 10,
  },
  { action: "usecase_create", label: "Publier un Use Case", description: "Partager un cas d'usage IA", pp: 50 },
  { action: "usecase_like", label: "Liker un Use Case", description: "Apprécier le use case d'un collègue", pp: 5 },
  { action: "forum_post", label: "Poster sur le Forum", description: "Créer une discussion sur le forum", pp: 20 },
  { action: "forum_reply", label: "Répondre sur le Forum", description: "Répondre à une discussion", pp: 10 },
  { action: "tech_tip_create", label: "Partager un Tech Tip", description: "Partager un conseil technique", pp: 30 },
  { action: "tech_tip_like", label: "Liker un Tech Tip", description: "Apprécier un conseil technique", pp: 5 },
];

const ppByAction: Record<PPAction, number> = {
  click: 1,
  login: 10,
  menu_or_button: 5,
  menu_or_button_first: 5,
  quiz_complete: 100,
  quiz_win_superior: 200,
  quiz_win_inferior: 50,
  quiz_all_questions_level: 1000,
  quiz_all_questions_all_levels: 100000,
  formation_prompt: 5,
  knowledge_view: 10,
  usecase_create: 50,
  usecase_like: 5,
  forum_post: 20,
  forum_reply: 10,
  tech_tip_create: 30,
  tech_tip_like: 5,
};

export function getPPForAction(action: PPAction): number {
  return ppByAction[action] ?? 0;
}
