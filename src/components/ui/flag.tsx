"use client";

import "flag-icons/css/flag-icons.min.css";

interface FlagProps {
  countryCode: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Flag({ countryCode, size = "md", className = "" }: FlagProps) {
  const sizeClasses = {
    sm: "w-4 h-3",
    md: "w-6 h-4",
    lg: "w-8 h-6",
  };

  return (
    <span
      className={`fi fi-${countryCode.toLowerCase()} ${sizeClasses[size]} inline-block rounded-sm shadow-sm ${className}`}
      style={{ 
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    />
  );
}
