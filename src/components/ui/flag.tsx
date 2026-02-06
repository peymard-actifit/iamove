"use client";

import "flag-icons/css/flag-icons.min.css";

interface FlagProps {
  countryCode: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}

export function Flag({ countryCode, size = "md", className = "" }: FlagProps) {
  // Drapeaux HORIZONTAUX - ratio standard 3:2 (largeur > hauteur)
  const sizes = {
    sm: { width: 24, height: 16 },
    md: { width: 32, height: 21 },
    lg: { width: 48, height: 32 },
    xl: { width: 72, height: 48 },
    "2xl": { width: 96, height: 64 },
  };

  const { width, height } = sizes[size];

  return (
    <span
      className={`fi fi-${countryCode.toLowerCase()} inline-block rounded-sm shadow-md ${className}`}
      style={{ 
        width: `${width}px`,
        height: `${height}px`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    />
  );
}
