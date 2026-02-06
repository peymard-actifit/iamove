"use client";

import Image from "next/image";
import { ReactNode } from "react";
import levelsData from "@/data/levels.json";

// Structure des niveaux avec icônes
export interface LevelInfo {
  number: number;
  name: string;
  seriousGaming: string;
  description: string;
  skills: {
    usage: number;
    automatisation: number;
    programmation: number;
    conception: number;
    recherche: number;
  };
}

// Construire les infos de niveau à partir du JSON
export const LEVELS: LevelInfo[] = levelsData.levels;

// Fonction pour obtenir les infos d'un niveau
export function getLevelInfo(levelNumber: number): LevelInfo {
  return LEVELS[levelNumber] || LEVELS[0];
}

// Fonction pour obtenir l'icône/image d'un niveau
export function getLevelIcon(levelNumber: number, className?: string): ReactNode {
  const size = className?.includes("h-3") ? 14 : className?.includes("h-5") ? 20 : className?.includes("h-12") ? 48 : className?.includes("h-14") ? 56 : 16;
  
  return (
    <Image
      src={`/images/levels/level-${levelNumber}.png`}
      alt={`Niveau ${levelNumber}`}
      width={size}
      height={size}
      className={`${className || "h-4 w-4"} flex-shrink-0 block`}
      style={{ objectFit: "contain", margin: 0, padding: 0 }}
    />
  );
}

// Composant image de niveau (pour usage direct)
export function LevelImage({ 
  level, 
  size = 16,
  className = ""
}: { 
  level: number; 
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src={`/images/levels/level-${level}.png`}
      alt={`Niveau ${level}`}
      width={size}
      height={size}
      className={className}
      style={{ objectFit: "contain" }}
    />
  );
}

// Couleurs Tailwind pour les badges de niveau (gradient progressif)
export function getLevelColorClasses(levelNumber: number): string {
  const colors: Record<number, string> = {
    0: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    1: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    2: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    3: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    4: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    5: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    6: "bg-lime-100 text-lime-700 dark:bg-lime-900 dark:text-lime-300",
    7: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    8: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
    9: "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300",
    10: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300",
    11: "bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300",
    12: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    13: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300",
    14: "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300",
    15: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    16: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900 dark:text-fuchsia-300",
    17: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
    18: "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300",
    19: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    20: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  };
  return colors[levelNumber] || colors[0];
}

// Export des données brutes pour usage externe
export { levelsData };
