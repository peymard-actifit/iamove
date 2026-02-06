"use client";

import {
  HelpCircle,
  Lightbulb,
  BookOpen,
  Target,
  Zap,
  Rocket,
  Star,
  Award,
  Crown,
  Sparkles,
  Brain,
  Cpu,
  Bot,
  Cog,
  Settings,
  Wand2,
  Gem,
  Trophy,
  Medal,
  Shield,
  Flame,
} from "lucide-react";
import { ReactNode } from "react";

// Structure des niveaux avec icônes
// À compléter avec les données du fichier Excel
export interface LevelInfo {
  number: number;
  name: string;
  description: string;
  icon: ReactNode;
  color: string;
}

// Niveaux par défaut (0-20)
// Les icônes et descriptions seront mises à jour avec le contenu Excel
export const LEVELS: LevelInfo[] = [
  { number: 0, name: "Non évalué", description: "Pas encore évalué", icon: <HelpCircle className="h-4 w-4" />, color: "gray" },
  { number: 1, name: "Niveau 1", description: "Découverte", icon: <Lightbulb className="h-4 w-4" />, color: "slate" },
  { number: 2, name: "Niveau 2", description: "Initiation", icon: <BookOpen className="h-4 w-4" />, color: "zinc" },
  { number: 3, name: "Niveau 3", description: "Fondamentaux", icon: <Target className="h-4 w-4" />, color: "stone" },
  { number: 4, name: "Niveau 4", description: "Pratique", icon: <Zap className="h-4 w-4" />, color: "amber" },
  { number: 5, name: "Niveau 5", description: "Compétent", icon: <Rocket className="h-4 w-4" />, color: "yellow" },
  { number: 6, name: "Niveau 6", description: "Confirmé", icon: <Star className="h-4 w-4" />, color: "lime" },
  { number: 7, name: "Niveau 7", description: "Avancé", icon: <Award className="h-4 w-4" />, color: "green" },
  { number: 8, name: "Niveau 8", description: "Expert", icon: <Crown className="h-4 w-4" />, color: "emerald" },
  { number: 9, name: "Niveau 9", description: "Spécialiste", icon: <Sparkles className="h-4 w-4" />, color: "teal" },
  { number: 10, name: "Niveau 10", description: "Maître", icon: <Brain className="h-4 w-4" />, color: "cyan" },
  { number: 11, name: "Niveau 11", description: "Architecte", icon: <Cpu className="h-4 w-4" />, color: "sky" },
  { number: 12, name: "Niveau 12", description: "Ingénieur IA", icon: <Bot className="h-4 w-4" />, color: "blue" },
  { number: 13, name: "Niveau 13", description: "Concepteur", icon: <Cog className="h-4 w-4" />, color: "indigo" },
  { number: 14, name: "Niveau 14", description: "Innovateur", icon: <Settings className="h-4 w-4" />, color: "violet" },
  { number: 15, name: "Niveau 15", description: "Créateur", icon: <Wand2 className="h-4 w-4" />, color: "purple" },
  { number: 16, name: "Niveau 16", description: "Stratège", icon: <Gem className="h-4 w-4" />, color: "fuchsia" },
  { number: 17, name: "Niveau 17", description: "Leader IA", icon: <Trophy className="h-4 w-4" />, color: "pink" },
  { number: 18, name: "Niveau 18", description: "Visionnaire", icon: <Medal className="h-4 w-4" />, color: "rose" },
  { number: 19, name: "Niveau 19", description: "Champion", icon: <Shield className="h-4 w-4" />, color: "red" },
  { number: 20, name: "Niveau 20", description: "Légende", icon: <Flame className="h-4 w-4" />, color: "orange" },
];

// Fonction pour obtenir les infos d'un niveau
export function getLevelInfo(levelNumber: number): LevelInfo {
  return LEVELS[levelNumber] || LEVELS[0];
}

// Fonction pour obtenir l'icône d'un niveau
export function getLevelIcon(levelNumber: number, className?: string): ReactNode {
  const level = getLevelInfo(levelNumber);
  const IconComponent = level.icon;
  
  // Si une className personnalisée est fournie, on la réutilise
  if (className) {
    const icons = [
      HelpCircle, Lightbulb, BookOpen, Target, Zap, Rocket, Star, Award, Crown, Sparkles,
      Brain, Cpu, Bot, Cog, Settings, Wand2, Gem, Trophy, Medal, Shield, Flame,
    ];
    const Icon = icons[levelNumber] || icons[0];
    return <Icon className={className} />;
  }
  
  return IconComponent;
}

// Couleurs Tailwind pour les badges de niveau
export function getLevelColorClasses(levelNumber: number): string {
  const colors: Record<number, string> = {
    0: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    1: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    2: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    3: "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300",
    4: "bg-amber-100 text-amber-700 dark:bg-amber-800 dark:text-amber-300",
    5: "bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-300",
    6: "bg-lime-100 text-lime-700 dark:bg-lime-800 dark:text-lime-300",
    7: "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300",
    8: "bg-emerald-100 text-emerald-700 dark:bg-emerald-800 dark:text-emerald-300",
    9: "bg-teal-100 text-teal-700 dark:bg-teal-800 dark:text-teal-300",
    10: "bg-cyan-100 text-cyan-700 dark:bg-cyan-800 dark:text-cyan-300",
    11: "bg-sky-100 text-sky-700 dark:bg-sky-800 dark:text-sky-300",
    12: "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300",
    13: "bg-indigo-100 text-indigo-700 dark:bg-indigo-800 dark:text-indigo-300",
    14: "bg-violet-100 text-violet-700 dark:bg-violet-800 dark:text-violet-300",
    15: "bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-300",
    16: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-800 dark:text-fuchsia-300",
    17: "bg-pink-100 text-pink-700 dark:bg-pink-800 dark:text-pink-300",
    18: "bg-rose-100 text-rose-700 dark:bg-rose-800 dark:text-rose-300",
    19: "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-300",
    20: "bg-orange-100 text-orange-700 dark:bg-orange-800 dark:text-orange-300",
  };
  return colors[levelNumber] || colors[0];
}
