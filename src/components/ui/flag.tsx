"use client";

import "flag-icons/css/flag-icons.min.css";

interface FlagProps {
  countryCode: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}

export function Flag({ countryCode, size = "md", className = "" }: FlagProps) {
  // Proportions standard d'un drapeau : ratio 3:2
  const sizeClasses = {
    sm: "w-5 h-[14px]",      // 20x14 (ratio 1.43)
    md: "w-7 h-[19px]",      // 28x19 (ratio 1.47)
    lg: "w-9 h-6",           // 36x24 (ratio 1.5)
    xl: "w-14 h-[38px]",     // 56x38 (ratio 1.47)
    "2xl": "w-20 h-[54px]",  // 80x54 (ratio 1.48)
  };

  return (
    <span
      className={`fi fi-${countryCode.toLowerCase()} ${sizeClasses[size]} inline-block rounded shadow-md ${className}`}
      style={{ 
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    />
  );
}
