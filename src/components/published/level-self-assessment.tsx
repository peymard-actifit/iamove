"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui";
import { CheckCircle2, Loader2, AlertTriangle } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface LevelTranslation {
  language: string;
  name: string;
  category: string;
  seriousGaming: string;
  description: string;
}

interface Level {
  id: string;
  number: number;
  name: string;
  category?: string;
  seriousGaming?: string;
  description?: string;
  translations?: LevelTranslation[];
}

interface LevelSelfAssessmentProps {
  siteId: string;
  personId: string;
  personName: string;
  levels: Level[];
  onLevelSelected?: (level: number) => void;
}

// Couleurs par catégorie
const categoryColors: Record<string, { bg: string; border: string; text: string }> = {
  "Néophyte": { bg: "bg-gray-100 dark:bg-gray-800", border: "border-gray-300 dark:border-gray-600", text: "text-gray-700 dark:text-gray-300" },
  "Utilisateur": { bg: "bg-blue-50 dark:bg-blue-900/30", border: "border-blue-300 dark:border-blue-700", text: "text-blue-700 dark:text-blue-300" },
  "Technicien": { bg: "bg-purple-50 dark:bg-purple-900/30", border: "border-purple-300 dark:border-purple-700", text: "text-purple-700 dark:text-purple-300" },
  "Chercheur": { bg: "bg-amber-50 dark:bg-amber-900/30", border: "border-amber-300 dark:border-amber-700", text: "text-amber-700 dark:text-amber-300" },
};

export function LevelSelfAssessment({
  siteId,
  personId,
  personName,
  levels,
  onLevelSelected,
}: LevelSelfAssessmentProps) {
  const router = useRouter();
  const { language, t } = useI18n();
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [hoveredLevel, setHoveredLevel] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour obtenir les données traduites d'un niveau
  const getTranslatedLevel = (level: Level) => {
    const lang = language.toUpperCase();
    if (lang !== "FR" && level.translations?.length) {
      const translation = level.translations.find(t => t.language === lang);
      if (translation) {
        return {
          name: translation.name,
          category: translation.category,
          seriousGaming: translation.seriousGaming,
          description: translation.description,
        };
      }
    }
    return {
      name: level.name,
      category: level.category || "",
      seriousGaming: level.seriousGaming || "",
      description: level.description || "",
    };
  };

  const handleSubmit = async () => {
    if (selectedLevel === null) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/sites/${siteId}/self-assessment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentLevel: selectedLevel }),
      });

      const data = await res.json();

      if (res.ok) {
        onLevelSelected?.(selectedLevel);
        router.refresh();
      } else {
        // Afficher l'erreur retournée par l'API
        setError(data.error || "Une erreur est survenue");
        console.error("Self-assessment error:", data);
      }
    } catch (err) {
      console.error("Self-assessment fetch error:", err);
      setError("Erreur de connexion au serveur");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Afficher les détails du niveau survolé ou sélectionné
  const displayLevel = hoveredLevel !== null ? hoveredLevel : selectedLevel;
  const displayLevelData = displayLevel !== null 
    ? levels.find(l => l.number === displayLevel) 
    : null;
  const translatedDisplay = displayLevelData ? getTranslatedLevel(displayLevelData) : null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white">
          <h1 className="text-xl font-bold text-center">
            {t.selfAssessment?.welcome || "Bienvenue"} {personName} !
          </h1>
          <p className="text-center text-white/80 text-sm mt-1">
            {t.selfAssessment?.chooseLevel || "Sélectionnez le niveau qui correspond le mieux à vos compétences en IA"}
          </p>
        </div>

        {/* Contenu principal */}
        <div className="p-4 flex flex-col gap-4" style={{ maxHeight: "calc(100vh - 200px)" }}>
          {/* Grille des niveaux - 7 colonnes x 3 lignes */}
          <div className="grid grid-cols-7 gap-2">
            {levels.map((level) => {
              const translated = getTranslatedLevel(level);
              const colors = categoryColors[translated.category] || categoryColors["Néophyte"];
              const isSelected = selectedLevel === level.number;
              const isHovered = hoveredLevel === level.number;

              return (
                <button
                  key={level.id}
                  onClick={() => setSelectedLevel(level.number)}
                  onMouseEnter={() => setHoveredLevel(level.number)}
                  onMouseLeave={() => setHoveredLevel(null)}
                  className={`
                    relative flex flex-col items-center p-2 rounded-lg border-2 transition-all cursor-pointer
                    ${colors.bg} ${isSelected ? "border-green-500 ring-2 ring-green-500/50" : isHovered ? "border-blue-400 scale-105" : colors.border}
                    hover:shadow-md
                  `}
                >
                  {isSelected && (
                    <CheckCircle2 className="absolute -top-1 -right-1 h-5 w-5 text-green-500 bg-white rounded-full" />
                  )}
                  
                  {/* Icône du niveau */}
                  <div className="w-10 h-10 relative mb-1">
                    <Image
                      src={`/images/levels/level-${level.number}.png`}
                      alt={translated.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  
                  {/* Numéro */}
                  <span className={`text-xs font-bold ${colors.text}`}>
                    {level.number}
                  </span>
                  
                  {/* Nom court */}
                  <span className={`text-[9px] text-center leading-tight line-clamp-2 ${colors.text}`}>
                    {translated.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Zone de détails du niveau sélectionné/survolé */}
          <div className="flex-1 min-h-[120px] bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            {displayLevelData && translatedDisplay ? (
              <div className="flex gap-4 items-start h-full">
                {/* Grande icône */}
                <div className="w-20 h-20 relative flex-shrink-0">
                  <Image
                    src={`/images/levels/level-${displayLevelData.number}.png`}
                    alt={translatedDisplay.name}
                    fill
                    className="object-contain"
                  />
                </div>
                
                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {t.levels?.level || "Niveau"} {displayLevelData.number}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      categoryColors[translatedDisplay.category]?.text || "text-gray-600"
                    } ${categoryColors[translatedDisplay.category]?.bg || "bg-gray-100"}`}>
                      {translatedDisplay.category}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-0.5">
                    {translatedDisplay.name}
                  </h3>
                  
                  <p className="text-xs text-purple-600 dark:text-purple-400 italic mb-2">
                    🎮 {translatedDisplay.seriousGaming}
                  </p>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {translatedDisplay.description}
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <p className="text-center">
                  {t.selfAssessment?.hoverHint || "Survolez un niveau pour voir sa description"}
                </p>
              </div>
            )}
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 text-sm">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Avertissement si niveau 0 sélectionné */}
          {selectedLevel === 0 && !error && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg text-amber-700 dark:text-amber-300 text-sm">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <p>
                {t.selfAssessment?.level0Warning || 
                  "En choisissant le niveau 0, cette auto-évaluation vous sera proposée à chaque connexion jusqu'à ce que vous sélectionniez un autre niveau."}
              </p>
            </div>
          )}

          {/* Bouton de validation */}
          <div className="flex justify-center">
            <Button
              onClick={handleSubmit}
              disabled={selectedLevel === null || isSubmitting}
              className="px-8 py-2 text-base"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t.common?.loading || "Enregistrement..."}
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {selectedLevel !== null 
                    ? `${t.selfAssessment?.confirmLevel || "Confirmer le niveau"} ${selectedLevel}`
                    : t.selfAssessment?.selectLevel || "Sélectionnez un niveau"
                  }
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
