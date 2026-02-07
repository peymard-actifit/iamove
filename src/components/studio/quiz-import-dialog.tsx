"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
} from "@/components/ui";
import { Upload, Loader2, Check, AlertCircle, FileText } from "lucide-react";
import { getLevelIcon } from "@/lib/levels";

interface Level {
  id: string;
  number: number;
  name: string;
  seriousGaming: string;
}

interface QuizImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuizImportDialog({ open, onOpenChange }: QuizImportDialogProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [levels, setLevels] = useState<Level[]>([]);
  const [quizCounts, setQuizCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [importingLevel, setImportingLevel] = useState<number | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [importResult, setImportResult] = useState<{ level: number; success: boolean; message: string } | null>(null);

  // Charger les niveaux et le nombre de quizz par niveau
  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Charger les niveaux
      const levelsRes = await fetch("/api/levels");
      if (levelsRes.ok) {
        const levelsData = await levelsRes.json();
        setLevels(levelsData.filter((l: Level) => l.number >= 1)); // Niveaux 1-20 seulement
      }

      // Charger le compte des quizz par niveau
      const quizzesRes = await fetch("/api/quizzes/counts-by-level");
      if (quizzesRes.ok) {
        const countsData = await quizzesRes.json();
        setQuizCounts(countsData);
      }
    } catch (error) {
      console.error("Erreur chargement:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Ouvre le sélecteur de fichier pour un niveau donné
  const handleSelectFile = (levelNumber: number) => {
    setSelectedLevel(levelNumber);
    setImportResult(null);
    // Réinitialiser l'input pour permettre de sélectionner le même fichier à nouveau
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  // Gestion du fichier sélectionné
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || selectedLevel === null) return;

    // Vérifier que c'est un PDF
    if (file.type !== "application/pdf") {
      setImportResult({
        level: selectedLevel,
        success: false,
        message: "Veuillez sélectionner un fichier PDF",
      });
      return;
    }

    setImportingLevel(selectedLevel);
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("levelNumber", selectedLevel.toString());

      const response = await fetch("/api/quizzes/import-from-pdf", {
        method: "POST",
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.success) {
        setImportResult({
          level: selectedLevel,
          success: true,
          message: `${data.imported} questions importées depuis "${file.name}" et traduites en 26 langues`,
        });
        // Recharger les données
        loadData();
        router.refresh();
      } else {
        setImportResult({
          level: selectedLevel,
          success: false,
          message: data.error || "Erreur d'importation",
        });
      }
    } catch (error) {
      setImportResult({
        level: selectedLevel,
        success: false,
        message: "Erreur de connexion",
      });
    } finally {
      setImportingLevel(null);
      setSelectedLevel(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Input file caché pour sélectionner le PDF */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Importer des Quizz
          </DialogTitle>
          <DialogDescription>
            Sélectionnez un niveau puis choisissez un fichier PDF contenant les questions.
            Les questions seront automatiquement extraites et traduites en 26 langues.
          </DialogDescription>
        </DialogHeader>

        {importResult && (
          <div
            className={`p-3 rounded-lg flex items-center gap-2 ${
              importResult.success
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {importResult.success ? (
              <Check className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <span className="text-sm">{importResult.message}</span>
          </div>
        )}

        <div className="py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {levels.map((level) => {
                const LevelIcon = getLevelIcon(level.number);
                const count = quizCounts[level.id] || 0;
                const isImporting = importingLevel === level.number;
                const hasQuestions = count > 0;

                  return (
                    <div
                      key={level.id}
                      className={`relative p-3 rounded-lg border ${
                        hasQuestions
                          ? "border-green-200 bg-green-50"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-white rounded p-0.5">
                          {LevelIcon}
                        </div>
                        <span className="text-xs font-medium">Niv. {level.number}</span>
                      </div>
                    <p className="text-[10px] text-gray-600 truncate mb-1" title={level.name}>
                      {level.name}
                    </p>
                    <p className="text-xs text-gray-500 mb-2">
                      {count} question{count !== 1 ? "s" : ""}
                    </p>
                    <Button
                      size="sm"
                      variant={hasQuestions ? "outline" : "default"}
                      className="w-full h-7 text-xs"
                      onClick={() => handleSelectFile(level.number)}
                      disabled={isImporting}
                    >
                      {isImporting ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <>
                          <FileText className="h-3 w-3 mr-1" />
                          {hasQuestions ? "Remplacer" : "Importer"}
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
