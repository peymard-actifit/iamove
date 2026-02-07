"use client";

import { useEffect, useState } from "react";
import { useHeaderContent } from "./header-context";
import { Button } from "@/components/ui";
import { Plus, Upload, Loader2 } from "lucide-react";

interface QuizzesHeaderContentProps {
  quizCount: number;
  onNewQuestion: () => void;
  onImportComplete?: () => void;
}

export function QuizzesHeaderContent({ quizCount, onNewQuestion, onImportComplete }: QuizzesHeaderContentProps) {
  const { setCenterContent, setRightActions } = useHeaderContent();
  const [isImporting, setIsImporting] = useState(false);

  const handleImportLevel1 = async () => {
    if (isImporting) return;
    
    if (!confirm("Importer 120 questions pour le niveau 1 ? Les questions existantes du niveau 1 seront remplacées.")) {
      return;
    }
    
    setIsImporting(true);
    try {
      const response = await fetch("/api/quizzes/import-level1", { method: "POST" });
      const data = await response.json();
      
      if (data.success) {
        alert(`Import réussi : ${data.imported} questions importées pour le niveau 1`);
        onImportComplete?.();
        window.location.reload();
      } else {
        alert(`Erreur : ${data.error}`);
      }
    } catch (error) {
      console.error("Erreur d'import:", error);
      alert("Erreur lors de l'import des questions");
    } finally {
      setIsImporting(false);
    }
  };

  useEffect(() => {
    setCenterContent(
      <div className="text-center">
        <h1 className="text-lg font-semibold">Gestion des Quizz</h1>
        <p className="text-xs text-gray-500">{quizCount} question(s) au total</p>
      </div>
    );

    setRightActions(
      <div className="flex items-center gap-2">
        <Button 
          onClick={handleImportLevel1} 
          size="sm" 
          variant="outline"
          disabled={isImporting}
          title="Importer 120 questions niveau 1"
        >
          {isImporting ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <Upload className="h-4 w-4 mr-1" />
          )}
          Import Niv.1
        </Button>
        <Button onClick={onNewQuestion} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Nouvelle question
        </Button>
      </div>
    );

    return () => {
      setCenterContent(null);
      setRightActions(null);
    };
  }, [setCenterContent, setRightActions, quizCount, onNewQuestion, isImporting]);

  return null;
}
