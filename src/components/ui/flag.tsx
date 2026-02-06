"use client";

import "flag-icons/css/flag-icons.min.css";

interface FlagProps {
  countryCode: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}

export function Flag({ countryCode, size = "md", className = "" }: FlagProps) {
  // Drapeaux avec proportions standard ratio 3:2 (largeur:hauteur)
  const sizeClasses = {
    sm: "w-6 h-4",           // 24x16
    md: "w-8 h-5",           // 32x20
    lg: "w-10 h-7",          // 40x28
    xl: "w-16 h-11",         // 64x44 - pour les sélecteurs
    "2xl": "w-20 h-14",      // 80x56 - très grand
  };

  return (
    <span
      className={`fi fi-${countryCode.toLowerCase()} ${sizeClasses[size]} inline-block rounded-sm shadow-md ${className}`}
      style={{ 
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    />
  );
}
