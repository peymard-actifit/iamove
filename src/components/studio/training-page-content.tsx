"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Input } from "@/components/ui";
import { 
  Gamepad2, BookOpen, Wrench, Video, FileText, Layers, 
  Plus, Edit, Trash2, ChevronRight, Sparkles, Route, ArrowUp, ArrowDown
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useHeaderContent } from "./header-context";

interface TrainingMethodTranslation {
  id: string;
  language: string;
  name: string;
  description: string | null;
}

interface Level {
  id: string;
  number: number;
  name: string;
}

interface TrainingModuleTranslation {
  id: string;
  language: string;
  title: string;
  description: string | null;
  content: string | null;
}

interface TrainingModule {
  id: string;
  title: string;
  description: string | null;
  duration: number;
  difficulty: number;
  order: number;
  level: Level;
  methodId?: string;
  translations: TrainingModuleTranslation[];
}

interface TrainingMethod {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  type: string;
  order: number;
  translations: TrainingMethodTranslation[];
  modules: TrainingModule[];
  _count: {
    modules: number;
  };
}

// Typologies : Connaissances (vidéos, articles, tutoriels, modules) / Applications (reste)
const TYPOLOGY_KNOWLEDGE = ["VIDEO", "ARTICLE", "TUTORIAL", "INTERACTIVE"];
const TYPOLOGY_APPLICATIONS = ["SERIOUS_GAME", "EXERCISE"];

interface PathItemModule {
  id: string;
  title: string;
  level: { number: number };
  method: { id: string; name: string; type: string };
  translations: TrainingModuleTranslation[];
}

interface TrainingPathItem {
  id: string;
  order: number;
  module: PathItemModule;
}

interface TrainingPath {
  id: string;
  name: string;
  description: string | null;
  order: number;
  items: TrainingPathItem[];
}

interface TrainingPageContentProps {
  methods: TrainingMethod[];
  levels: Level[];
  paths: TrainingPath[];
}

const ICONS: Record<string, React.ReactNode> = {
  Gamepad2: <Gamepad2 className="h-6 w-6" />,
  BookOpen: <BookOpen className="h-6 w-6" />,
  Wrench: <Wrench className="h-6 w-6" />,
  Video: <Video className="h-6 w-6" />,
  FileText: <FileText className="h-6 w-6" />,
  Layers: <Layers className="h-6 w-6" />,
};

const TYPE_COLORS: Record<string, string> = {
  SERIOUS_GAME: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  TUTORIAL: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  EXERCISE: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  VIDEO: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  ARTICLE: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  INTERACTIVE: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300",
};

const TRAINING_SUBTITLE = "Gérez les méthodes et modules de formation";

export function TrainingPageContent({ methods, levels, paths: initialPaths }: TrainingPageContentProps) {
  const router = useRouter();
  const { language: globalLanguage, t } = useI18n();
  const { setCenterContent, setRightActions } = useHeaderContent();
  const [selectedMethod, setSelectedMethod] = useState<TrainingMethod | null>(null);
  const [showModuleDialog, setShowModuleDialog] = useState(false);
  const [editingModule, setEditingModule] = useState<TrainingModule | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paths, setPaths] = useState<TrainingPath[]>(initialPaths);
  const [showPathDialog, setShowPathDialog] = useState(false);
  const [editingPath, setEditingPath] = useState<TrainingPath | null>(null);
  const [pathForm, setPathForm] = useState({ name: "", description: "" });
  const [showAddPathItemDialog, setShowAddPathItemDialog] = useState<TrainingPath | null>(null);

  const knowledgeMethods = methods.filter((m) => TYPOLOGY_KNOWLEDGE.includes(m.type));
  const applicationMethods = methods.filter((m) => TYPOLOGY_APPLICATIONS.includes(m.type));

  const handleInitMethods = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/training/seed", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) router.refresh();
    } catch (e) {
      console.error("Erreur:", e);
    }
    setIsLoading(false);
  }, []);

  // Titre et sous-titre au centre du header, bouton "Initialiser" à droite si besoin
  useEffect(() => {
    setCenterContent(
      <div className="flex flex-col items-center justify-center text-center">
        <h1 className="text-lg font-bold leading-tight">{t.tabs.training}</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">{TRAINING_SUBTITLE}</p>
      </div>
    );
    return () => setCenterContent(null);
  }, [t.tabs.training, setCenterContent]);

  useEffect(() => {
    if (methods.length === 0) {
      setRightActions(
        <Button onClick={handleInitMethods} size="sm" disabled={isLoading}>
          <Sparkles className="h-4 w-4 mr-2" />
          Initialiser les méthodes
        </Button>
      );
    } else {
      setRightActions(null);
    }
    return () => setRightActions(null);
  }, [methods.length, isLoading, handleInitMethods, setRightActions]);

  const [moduleForm, setModuleForm] = useState({
    title: "",
    description: "",
    levelId: "",
    duration: 15,
    difficulty: 1,
  });

  // Obtenir le texte traduit
  const getTranslatedMethod = (method: TrainingMethod) => {
    const lang = globalLanguage.toUpperCase();
    const translation = method.translations.find(t => t.language === lang);
    return {
      name: translation?.name || method.name,
      description: translation?.description || method.description,
    };
  };

  const getTranslatedModule = (module: TrainingModule) => {
    const lang = globalLanguage.toUpperCase();
    const translation = module.translations.find(t => t.language === lang);
    return {
      title: translation?.title || module.title,
      description: translation?.description || module.description,
    };
  };

  const resetModuleForm = () => {
    setModuleForm({
      title: "",
      description: "",
      levelId: levels[0]?.id || "",
      duration: 15,
      difficulty: 1,
    });
    setEditingModule(null);
  };

  const handleCreateModule = async () => {
    if (!selectedMethod || !moduleForm.title.trim() || !moduleForm.levelId) return;
    
    setIsLoading(true);
    try {
      const res = await fetch("/api/training/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...moduleForm,
          methodId: selectedMethod.id,
        }),
      });
      
      if (res.ok) {
        setShowModuleDialog(false);
        resetModuleForm();
        router.refresh();
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
    setIsLoading(false);
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("Supprimer ce module de formation ?")) return;
    
    try {
      await fetch(`/api/training/modules/${moduleId}`, {
        method: "DELETE",
        credentials: "include",
      });
      router.refresh();
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleCreatePath = async () => {
    if (!pathForm.name.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/training/paths", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: pathForm.name.trim(), description: pathForm.description.trim() || undefined }),
      });
      if (res.ok) {
        const { path } = await res.json();
        setPaths((prev) => [...prev, { ...path, items: [] }]);
        setShowPathDialog(false);
        setPathForm({ name: "", description: "" });
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  const handleUpdatePath = async (pathId: string, data: { name?: string; description?: string }) => {
    try {
      const res = await fetch(`/api/training/paths/${pathId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const { path } = await res.json();
        setPaths((prev) => prev.map((p) => (p.id === pathId ? path : p)));
        setEditingPath(null);
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeletePath = async (pathId: string) => {
    if (!confirm("Supprimer ce parcours ?")) return;
    try {
      const res = await fetch(`/api/training/paths/${pathId}`, { method: "DELETE", credentials: "include" });
      if (res.ok) {
        setPaths((prev) => prev.filter((p) => p.id !== pathId));
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddPathItem = async (pathId: string, moduleId: string) => {
    try {
      const res = await fetch(`/api/training/paths/${pathId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ moduleId }),
      });
      if (res.ok) {
        const { item } = await res.json();
        setPaths((prev) =>
          prev.map((p) => (p.id === pathId ? { ...p, items: [...p.items, item] } : p))
        );
        setShowAddPathItemDialog(null);
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Erreur");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemovePathItem = async (pathId: string, itemId: string) => {
    try {
      const res = await fetch(`/api/training/paths/${pathId}/items/${itemId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setPaths((prev) =>
          prev.map((p) => (p.id === pathId ? { ...p, items: p.items.filter((i) => i.id !== itemId) } : p))
        );
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleReorderPathItems = async (pathId: string, itemIds: string[]) => {
    try {
      const res = await fetch(`/api/training/paths/${pathId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ itemIds }),
      });
      if (res.ok) {
        const { path } = await res.json();
        setPaths((prev) => prev.map((p) => (p.id === pathId ? path : p)));
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const allModules = methods.flatMap((m) => m.modules);

  return (
    <div className="px-3 py-2 sm:px-4 sm:py-3 space-y-6 max-w-full">
      {/* Connaissances : vidéos, articles, tutoriels, modules interactifs */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Connaissances</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          Vidéos, articles, tutoriels et modules interactifs.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {knowledgeMethods.map((method) => {
            const translated = getTranslatedMethod(method);
            const isSelected = selectedMethod?.id === method.id;
            return (
              <Card
                key={method.id}
                className={`p-4 cursor-pointer transition-all ${
                  isSelected ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20" : "hover:shadow-md"
                }`}
                onClick={() => setSelectedMethod(isSelected ? null : method)}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${TYPE_COLORS[method.type] || "bg-gray-100"}`}>
                    {ICONS[method.icon || "Layers"]}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{translated.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{translated.description}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800">
                        {method._count.modules} module(s)
                      </span>
                      <ChevronRight className={`h-4 w-4 transition-transform ${isSelected ? "rotate-90" : ""}`} />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Applications : serious game, exercices */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Applications</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          Serious game et exercices pratiques.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {applicationMethods.map((method) => {
            const translated = getTranslatedMethod(method);
            const isSelected = selectedMethod?.id === method.id;
            return (
              <Card
                key={method.id}
                className={`p-4 cursor-pointer transition-all ${
                  isSelected ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20" : "hover:shadow-md"
                }`}
                onClick={() => setSelectedMethod(isSelected ? null : method)}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${TYPE_COLORS[method.type] || "bg-gray-100"}`}>
                    {ICONS[method.icon || "Layers"]}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{translated.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{translated.description}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800">
                        {method._count.modules} module(s)
                      </span>
                      <ChevronRight className={`h-4 w-4 transition-transform ${isSelected ? "rotate-90" : ""}`} />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Parcours : enchaînements vers un objectif */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Route className="h-5 w-5" />
              Parcours
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Enchaînements de formations pour guider vers des objectifs précis.
            </p>
          </div>
          <Button size="sm" onClick={() => { setPathForm({ name: "", description: "" }); setEditingPath(null); setShowPathDialog(true); }}>
            <Plus className="h-4 w-4 mr-1" />
            Nouveau parcours
          </Button>
        </div>
        {paths.length === 0 ? (
          <Card className="p-6 text-center text-gray-500">
            <Route className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Aucun parcours. Créez un parcours et ajoutez-y des modules (Connaissances ou Applications).</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {paths.map((path) => (
              <Card key={path.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {editingPath?.id === path.id ? (
                      <div className="space-y-2">
                        <Input
                          value={pathForm.name}
                          onChange={(e) => setPathForm((f) => ({ ...f, name: e.target.value }))}
                          placeholder="Nom du parcours"
                          className="font-semibold"
                        />
                        <textarea
                          className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
                          rows={2}
                          value={pathForm.description}
                          onChange={(e) => setPathForm((f) => ({ ...f, description: e.target.value }))}
                          placeholder="Objectif / description"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleUpdatePath(path.id, { name: pathForm.name, description: pathForm.description })}>
                            Enregistrer
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => { setEditingPath(null); setShowPathDialog(false); }}>
                            Annuler
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-semibold">{path.name}</h3>
                        {path.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{path.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Button variant="ghost" size="sm" onClick={() => { setEditingPath(path); setPathForm({ name: path.name, description: path.description || "" }); }}>
                            <Edit className="h-3 w-3 mr-1" />
                            Modifier
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setShowAddPathItemDialog(path)}>
                            <Plus className="h-3 w-3 mr-1" />
                            Ajouter un élément
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDeletePath(path.id)}>
                            <Trash2 className="h-3 w-3 mr-1" />
                            Supprimer
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                {path.items.length > 0 && (
                  <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Étapes du parcours</p>
                    <ul className="space-y-2">
                      {path.items.map((item, index) => {
                        const tr = item.module.translations?.find((x) => x.language === globalLanguage.toUpperCase());
                        const title = tr?.title ?? item.module.title;
                        return (
                          <li
                            key={item.id}
                            className="flex items-center gap-2 py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                          >
                            <span className="text-xs font-mono text-gray-400 w-6">{index + 1}.</span>
                            <span className="flex-1 text-sm">
                              {title}
                              <span className="text-xs text-gray-500 ml-2">
                                ({item.module.method.name} · Niv. {item.module.level.number})
                              </span>
                            </span>
                            <div className="flex items-center gap-0.5">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                disabled={index === 0}
                                onClick={() => {
                                  const ids = path.items.map((i) => i.id);
                                  const idx = ids.indexOf(item.id);
                                  if (idx > 0) {
                                    [ids[idx - 1], ids[idx]] = [ids[idx], ids[idx - 1]];
                                    handleReorderPathItems(path.id, ids);
                                  }
                                }}
                              >
                                <ArrowUp className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                disabled={index === path.items.length - 1}
                                onClick={() => {
                                  const ids = path.items.map((i) => i.id);
                                  const idx = ids.indexOf(item.id);
                                  if (idx < ids.length - 1) {
                                    [ids[idx], ids[idx + 1]] = [ids[idx + 1], ids[idx]];
                                    handleReorderPathItems(path.id, ids);
                                  }
                                }}
                              >
                                <ArrowDown className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-red-500"
                                onClick={() => handleRemovePathItem(path.id, item.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Modules de la méthode sélectionnée */}
      {selectedMethod && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              Modules de formation - {getTranslatedMethod(selectedMethod).name}
            </h2>
            <Button size="sm" onClick={() => {
              resetModuleForm();
              setShowModuleDialog(true);
            }}>
              <Plus className="h-4 w-4 mr-1" />
              Ajouter un module
            </Button>
          </div>

          {selectedMethod.modules.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Layers className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Aucun module pour cette méthode</p>
              <p className="text-sm">Cliquez sur "Ajouter un module" pour commencer</p>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedMethod.modules.map(module => {
                const translated = getTranslatedModule(module);
                return (
                  <div
                    key={module.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                        Niv. {module.level.number}
                      </span>
                      <div>
                        <h4 className="font-medium">{translated.title}</h4>
                        <p className="text-sm text-gray-500">{translated.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500">{module.duration} min</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <span
                            key={star}
                            className={`text-xs ${star <= module.difficulty ? "text-yellow-500" : "text-gray-300"}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => {
                          setEditingModule(module);
                          setModuleForm({
                            title: module.title,
                            description: module.description || "",
                            levelId: module.level.id,
                            duration: module.duration,
                            difficulty: module.difficulty,
                          });
                          setShowModuleDialog(true);
                        }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteModule(module.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* Dialog création/édition module */}
      <Dialog open={showModuleDialog} onOpenChange={setShowModuleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingModule ? "Modifier le module" : "Nouveau module de formation"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Titre *</label>
              <Input
                value={moduleForm.title}
                onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                placeholder="Ex: Introduction à l'IA"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
                rows={3}
                value={moduleForm.description}
                onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                placeholder="Description du module..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Niveau cible *</label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900"
                  value={moduleForm.levelId}
                  onChange={(e) => setModuleForm({ ...moduleForm, levelId: e.target.value })}
                >
                  {levels.map(level => (
                    <option key={level.id} value={level.id}>
                      Niv. {level.number} - {level.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Durée (minutes)</label>
                <Input
                  type="number"
                  min={5}
                  max={120}
                  value={moduleForm.duration}
                  onChange={(e) => setModuleForm({ ...moduleForm, duration: parseInt(e.target.value) || 15 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Difficulté</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(level => (
                  <button
                    key={level}
                    type="button"
                    className={`px-3 py-1 rounded ${
                      moduleForm.difficulty >= level
                        ? "bg-yellow-400 text-yellow-900"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                    onClick={() => setModuleForm({ ...moduleForm, difficulty: level })}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModuleDialog(false)}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleCreateModule} isLoading={isLoading}>
              {editingModule ? t.common.edit : t.common.add}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog nouveau parcours */}
      <Dialog open={showPathDialog} onOpenChange={setShowPathDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau parcours</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom *</label>
              <Input
                value={pathForm.name}
                onChange={(e) => setPathForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Ex: Parcours IA débutant"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Objectif / description</label>
              <textarea
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
                rows={3}
                value={pathForm.description}
                onChange={(e) => setPathForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Objectif précis pour les personnes qui suivront ce parcours..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPathDialog(false)}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleCreatePath} disabled={!pathForm.name.trim()} isLoading={isLoading}>
              Créer le parcours
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog ajouter un élément au parcours */}
      <Dialog open={!!showAddPathItemDialog} onOpenChange={() => setShowAddPathItemDialog(null)}>
        <DialogContent className="max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Ajouter un élément au parcours</DialogTitle>
            {showAddPathItemDialog && (
              <p className="text-sm text-gray-500">Parcours : {showAddPathItemDialog.name}</p>
            )}
          </DialogHeader>
          <div className="overflow-auto flex-1 min-h-0 py-4">
            {allModules.length === 0 ? (
              <p className="text-sm text-gray-500">Aucun module disponible. Créez d’abord des modules dans Connaissances ou Applications.</p>
            ) : (
              <ul className="space-y-1">
                {allModules.map((mod) => {
                  const method = methods.find((m) => m.modules.some((mo) => mo.id === mod.id));
                  const alreadyInPath = showAddPathItemDialog?.items.some((i) => i.module.id === mod.id);
                  const tr = mod.translations?.find((x) => x.language === globalLanguage.toUpperCase());
                  const title = tr?.title ?? mod.title;
                  return (
                    <li key={mod.id}>
                      <button
                        type="button"
                        disabled={!!alreadyInPath}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between gap-2 ${
                          alreadyInPath
                            ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                            : "hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                        onClick={() => !alreadyInPath && showAddPathItemDialog && handleAddPathItem(showAddPathItemDialog.id, mod.id)}
                      >
                        <span>
                          {title}
                          <span className="text-xs text-gray-500 ml-2">
                            {method?.name ?? ""} · Niv. {mod.level.number}
                          </span>
                        </span>
                        {alreadyInPath ? <span className="text-xs">Déjà dans le parcours</span> : <Plus className="h-4 w-4 flex-shrink-0" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
