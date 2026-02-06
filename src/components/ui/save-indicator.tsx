"use client";

import { useEffect, useState } from "react";
import { Cloud, CloudOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface SaveIndicatorProps {
  status: SaveStatus;
  className?: string;
}

export function SaveIndicator({ status, className }: SaveIndicatorProps) {
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (status === "saved") {
      setShowSaved(true);
      const timer = setTimeout(() => setShowSaved(false), 2000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [status]);

  if (status === "idle" && !showSaved) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-sm transition-all duration-300",
        className
      )}
    >
      {status === "saving" && (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          <span className="text-gray-500">Sauvegarde...</span>
        </>
      )}
      {(status === "saved" || showSaved) && status !== "saving" && (
        <>
          <Cloud className="h-4 w-4 text-green-500" />
          <span className="text-green-600">Sauvegardé</span>
        </>
      )}
      {status === "error" && (
        <>
          <CloudOff className="h-4 w-4 text-red-500" />
          <span className="text-red-600">Erreur de sauvegarde</span>
        </>
      )}
    </div>
  );
}

// Hook pour gérer le statut de sauvegarde
export function useSaveStatus() {
  const [status, setStatus] = useState<SaveStatus>("idle");

  const startSaving = () => setStatus("saving");
  const saveDone = () => setStatus("saved");
  const saveError = () => setStatus("error");
  const reset = () => setStatus("idle");

  return { status, startSaving, saveDone, saveError, reset };
}
