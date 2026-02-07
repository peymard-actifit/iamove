"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Button,
  Input,
} from "@/components/ui";
import { Save, X, Loader2, RefreshCw } from "lucide-react";
import { getLevelIcon } from "@/lib/levels";
import Image from "next/image";

interface Level {
  id: string;
  number: number;
  name: string;
  category: string;
  seriousGaming: string;
  description: string;
}

interface LevelsEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LevelsEditorDialog({ open, onOpenChange }: LevelsEditorDialogProps) {
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [editingLevel, setEditingLevel] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Level>>({});

  // Charger les niveaux depuis la base de données
  useEffect(() => {
    if (open) {
      loadLevels();
    }
  }, [open]);

  const loadLevels = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/levels");
      if (res.ok) {
        const data = await res.json();
        setLevels(data);
        
        // Si moins de 21 niveaux, initialiser automatiquement
        if (data.length < 21) {
          await seedLevels();
        }
      }
    } catch {
      // Erreur silencieuse
    } finally {
      setLoading(false);
    }
  };

  const seedLevels = async () => {
    setSeeding(true);
    try {
      const res = await fetch("/api/levels/seed", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setLevels(data.levels);
      }
    } catch {
      // Erreur silencieuse
    } finally {
      setSeeding(false);
    }
  };

  const handleEdit = (level: Level) => {
    setEditingLevel(level.id);
    setEditForm({
      name: level.name,
      category: level.category,
      seriousGaming: level.seriousGaming,
      description: level.description,
    });
  };

  const handleSave = async (levelId: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/levels/${levelId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        // Mettre à jour localement
        setLevels((prev) =>
          prev.map((l) =>
            l.id === levelId
              ? { ...l, ...editForm } as Level
              : l
          )
        );
        setEditingLevel(null);
        setEditForm({});
      }
    } catch {
      // Erreur silencieuse
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingLevel(null);
    setEditForm({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              Échelle des niveaux IA
            </DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={seedLevels}
              disabled={seeding}
              title="Resynchroniser depuis le fichier de référence"
            >
              {seeding ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-1" />
              )}
              Sync
            </Button>
          </div>
          <DialogDescription>
            Éditez les informations de chaque niveau de compétence IA
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="space-y-2">
              {levels.map((level) => (
                <div
                  key={level.id}
                  className="border rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {/* Icône et numéro */}
                    <div className="flex items-center gap-2 min-w-[80px]">
                      <Image
                        src={`/images/levels/level-${level.number}.png`}
                        alt={`Niveau ${level.number}`}
                        width={32}
                        height={32}
                        className="flex-shrink-0"
                      />
                      <span className="font-bold text-lg">Niv. {level.number}</span>
                    </div>

                    {/* Contenu éditable */}
                    <div className="flex-1">
                      {editingLevel === level.id ? (
                        <div className="space-y-2">
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="text-xs text-gray-500">Catégorie</label>
                              <select
                                className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900 text-sm"
                                value={editForm.category || ""}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, category: e.target.value })
                                }
                              >
                                <option value="Néophyte">Néophyte</option>
                                <option value="Utilisateur">Utilisateur</option>
                                <option value="Technicien">Technicien</option>
                                <option value="Chercheur">Chercheur</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-xs text-gray-500">Nom du niveau</label>
                              <Input
                                value={editForm.name || ""}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, name: e.target.value })
                                }
                                placeholder="Nom du niveau"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-500">Nom Star Wars</label>
                              <Input
                                value={editForm.seriousGaming || ""}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, seriousGaming: e.target.value })
                                }
                                placeholder="Nom serious gaming"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">Description</label>
                            <textarea
                              className="w-full px-3 py-2 border rounded-md text-sm resize-none"
                              rows={2}
                              value={editForm.description || ""}
                              onChange={(e) =>
                                setEditForm({ ...editForm, description: e.target.value })
                              }
                              placeholder="Description du niveau"
                            />
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleCancel}
                              disabled={saving}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Annuler
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleSave(level.id)}
                              disabled={saving}
                            >
                              {saving ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <Save className="h-4 w-4 mr-1" />
                              )}
                              Enregistrer
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="cursor-pointer"
                          onClick={() => handleEdit(level)}
                        >
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              level.category === "Néophyte" ? "bg-gray-200 text-gray-700" :
                              level.category === "Utilisateur" ? "bg-blue-200 text-blue-700" :
                              level.category === "Technicien" ? "bg-purple-200 text-purple-700" :
                              "bg-orange-200 text-orange-700"
                            }`}>
                              {level.category}
                            </span>
                            <span className="font-medium">{level.name}</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-sm text-gray-500 italic">
                              {level.seriousGaming}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                            {level.description}
                          </p>
                          <p className="text-xs text-blue-500 mt-1">
                            Cliquez pour modifier
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
