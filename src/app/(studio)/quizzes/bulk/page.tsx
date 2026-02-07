"use client";

import { useState, useEffect } from "react";
import { Button, Card } from "@/components/ui";
import { Loader2, Play, RefreshCw, CheckCircle } from "lucide-react";

interface LevelStats {
  number: number;
  name: string;
  currentCount: number;
  target: number;
  missing: number;
}

interface Stats {
  stats: LevelStats[];
  summary: {
    totalCurrent: number;
    totalTarget: number;
    totalMissing: number;
    percentComplete: number;
  };
}

export default function BulkGeneratePage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<number | null>(null);
  const [progress, setProgress] = useState<Record<number, string>>({});
  const [autoMode, setAutoMode] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/quizzes/bulk-stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Erreur fetch stats:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const generateForLevel = async (levelNumber: number, count: number) => {
    setGenerating(levelNumber);
    setProgress(prev => ({ ...prev, [levelNumber]: `Génération de ${count} questions...` }));
    
    try {
      const res = await fetch("/api/quizzes/bulk-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ levelNumber, count, withTranslations: true }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setProgress(prev => ({ 
          ...prev, 
          [levelNumber]: `✓ ${data.created} créées (total: ${data.newTotal}/120)` 
        }));
        await fetchStats();
      } else {
        const error = await res.json();
        setProgress(prev => ({ ...prev, [levelNumber]: `✗ Erreur: ${error.error}` }));
      }
    } catch (error) {
      setProgress(prev => ({ ...prev, [levelNumber]: `✗ Erreur: ${error}` }));
    }
    
    setGenerating(null);
  };

  const generateAll = async () => {
    if (!stats) return;
    setAutoMode(true);
    
    for (const level of stats.stats) {
      if (level.missing > 0) {
        // Générer par lots de 10 jusqu'à atteindre 120
        let remaining = level.missing;
        while (remaining > 0 && autoMode) {
          const batchSize = Math.min(10, remaining);
          await generateForLevel(level.number, batchSize);
          remaining -= batchSize;
          // Pause entre les lots pour éviter les rate limits
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
    
    setAutoMode(false);
  };

  if (loading && !stats) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Chargement des statistiques...</span>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Génération en masse des Quiz</h1>
          <p className="text-gray-500">
            Objectif: 120 questions par niveau = 2400 questions au total
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchStats} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button 
            onClick={generateAll} 
            disabled={autoMode || !stats?.summary.totalMissing}
            className="bg-green-600 hover:bg-green-700"
          >
            <Play className="h-4 w-4 mr-2" />
            Générer tout automatiquement
          </Button>
        </div>
      </div>

      {stats && (
        <>
          {/* Résumé */}
          <Card className="p-4 bg-blue-50 dark:bg-blue-900/20">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600">{stats.summary.totalCurrent}</div>
                <div className="text-sm text-gray-500">Questions actuelles</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">{stats.summary.totalTarget}</div>
                <div className="text-sm text-gray-500">Objectif total</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600">{stats.summary.totalMissing}</div>
                <div className="text-sm text-gray-500">Questions manquantes</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">{stats.summary.percentComplete}%</div>
                <div className="text-sm text-gray-500">Progression</div>
              </div>
            </div>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all"
                style={{ width: `${stats.summary.percentComplete}%` }}
              />
            </div>
          </Card>

          {/* Liste des niveaux */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.stats.map(level => (
              <Card key={level.number} className={`p-4 ${level.missing === 0 ? 'bg-green-50 dark:bg-green-900/20' : ''}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-bold">Niveau {level.number}</div>
                    <div className="text-xs text-gray-500">{level.name}</div>
                  </div>
                  {level.missing === 0 && <CheckCircle className="h-5 w-5 text-green-500" />}
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${level.missing === 0 ? 'bg-green-500' : 'bg-blue-500'}`}
                      style={{ width: `${(level.currentCount / level.target) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-mono">{level.currentCount}/{level.target}</span>
                </div>
                
                {progress[level.number] && (
                  <div className="text-xs text-gray-600 mb-2">{progress[level.number]}</div>
                )}
                
                {level.missing > 0 && (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => generateForLevel(level.number, Math.min(10, level.missing))}
                      disabled={generating !== null}
                      className="flex-1 text-xs"
                    >
                      {generating === level.number ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        `+10`
                      )}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => generateForLevel(level.number, Math.min(20, level.missing))}
                      disabled={generating !== null}
                      className="flex-1 text-xs"
                    >
                      {generating === level.number ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        `+20`
                      )}
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
