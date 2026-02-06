"use client";

import { useEffect } from "react";

interface DynamicFaviconProps {
  level: number;
}

export function DynamicFavicon({ level }: DynamicFaviconProps) {
  useEffect(() => {
    // Créer ou mettre à jour le favicon
    const faviconUrl = `/images/levels/level-${level}.png`;
    
    // Chercher un favicon existant ou en créer un
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.type = "image/png";
    link.href = faviconUrl;

    // Cleanup: restaurer le favicon par défaut quand le composant est démonté
    return () => {
      if (link) {
        link.href = "/favicon.ico";
      }
    };
  }, [level]);

  return null;
}
