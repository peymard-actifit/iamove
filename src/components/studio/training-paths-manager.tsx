"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui";
import { 
  Loader2, 
  Sparkles, 
  Route, 
  ChevronDown, 
  ChevronRight, 
  BookOpen,
  RefreshCw,
  Check,
  AlertCircle
} from "lucide-react";
import { getLevelIcon } from "@/lib/levels";

interface PathModule {
  id: string;
  title: string;
  duration?: number;
  method?: { name: string; type: string };
  level?: { number: number };
}

interface PathItem {
  id: string;
  order: number;
  module: PathModule;
}

interface TrainingPath {
  id: string;
  name: string;
  description?: string | null;
  order: number;
  isActive: boolean;
  items: PathItem[];
}

interface GenerationResult {
  level: number;
  pathId: string;
  created: boolean;
  itemsCount: number;
}

export function TrainingPathsManager() {
  const [paths, setPaths] = useState<TrainingPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generationResults, setGenerationResults] = useState<GenerationResult[] | null>(null);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  // Charger les parcours existants
  useEffect(() => {
    loadPaths();
  }, []);

  const loadPaths = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/training/paths");
      if (!res.ok) throw new Error("Erreur chargement des parcours");
      const data = await res.json();
      setPaths(data.paths || []);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  // Générer tous les parcours avec l'IA
  const generateAllPaths = async (regenerate = false) => {
    setGenerating(true);
    setGenerationResults(null);
    setError(null);
    try {
      const res = await fetch("/api/training/paths/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regenerate }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erreur lors de la génération");
      }
      const data = await res.json();
      setGenerationResults(data.results || []);
      // Recharger les parcours
      await loadPaths();
    } catch (e) {
      setError(String(e));
    } finally {
      setGenerating(false);
    }
  };

  const toggleExpand = (pathId: string) => {
    const newExpanded = new Set(expandedPaths);
    if (newExpanded.has(pathId)) {
      newExpanded.delete(pathId);
    } else {
      newExpanded.add(pathId);
    }
    setExpandedPaths(newExpanded);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg">
            <Route className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Parcours de Formation</h2>
            <p className="text-sm text-gray-500">
              Générez automatiquement des parcours inspirants pour chaque niveau
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => loadPaths()}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Actions de génération */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-3">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold">Génération automatique avec l'IA</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Créez automatiquement les 20 parcours de formation (un par niveau) avec des titres inspirants, 
          descriptions engageantes et objectifs pédagogiques. Les articles existants seront automatiquement 
          ajoutés à chaque parcours.
        </p>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => generateAllPaths(false)}
            disabled={generating}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Générer les parcours manquants
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => generateAllPaths(true)}
            disabled={generating}
            className="text-amber-600 border-amber-300 hover:bg-amber-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Régénérer tous les parcours
          </Button>
        </div>

        {/* Résultats de génération */}
        {generationResults && (
          <div className="mt-4 p-3 bg-white dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">
                {generationResults.filter(r => r.created).length} parcours créés, 
                {" "}{generationResults.filter(r => !r.created).length} existants
              </span>
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              {generationResults.slice(0, 5).map(r => (
                <div key={r.level}>
                  Niveau {r.level} : {r.created ? "✅ Créé" : "⏭️ Existait"} ({r.itemsCount} modules)
                </div>
              ))}
              {generationResults.length > 5 && (
                <div>... et {generationResults.length - 5} autres niveaux</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Erreur */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Liste des parcours */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
          {paths.length} Parcours existants
        </h3>

        {paths.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Route className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Aucun parcours créé</p>
            <p className="text-sm">Utilisez le bouton ci-dessus pour générer les parcours</p>
          </div>
        ) : (
          <div className="space-y-2">
            {paths.map((path) => {
              const isExpanded = expandedPaths.has(path.id);
              // Extraire le numéro de niveau du nom si possible
              const levelMatch = path.name.match(/Niveau (\d+)/);
              const levelNumber = levelMatch ? parseInt(levelMatch[1], 10) : null;
              
              return (
                <div
                  key={path.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                >
                  {/* Header du parcours */}
                  <button
                    type="button"
                    onClick={() => toggleExpand(path.id)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                  >
                    <div className="flex-shrink-0">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    {levelNumber && (
                      <div className="flex-shrink-0">
                        {getLevelIcon(levelNumber, "h-5 w-5")}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {path.name}
                      </h4>
                      {path.description && (
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {path.description.split("\n")[0]}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-2">
                      <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                        {path.items.length} modules
                      </span>
                    </div>
                  </button>

                  {/* Contenu déplié */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 p-3">
                      {path.description && (
                        <div className="mb-3 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                          {path.description}
                        </div>
                      )}
                      {path.items.length === 0 ? (
                        <p className="text-sm text-gray-400 italic">Aucun module dans ce parcours</p>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-500 uppercase mb-2">Modules du parcours :</p>
                          {path.items.map((item, idx) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700"
                            >
                              <span className="text-xs text-gray-400 w-5 text-right">{idx + 1}.</span>
                              <BookOpen className="h-4 w-4 text-amber-500 flex-shrink-0" />
                              <span className="text-sm flex-1 truncate">{item.module.title}</span>
                              {item.module.duration && (
                                <span className="text-xs text-gray-400">{item.module.duration} min</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
