"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button, Input, Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui";
import { Send, Bot, User, Sparkles, FileText, Clock, ExternalLink, Loader2, Eye, EyeOff, GraduationCap, Route, ChevronRight, Target, BookOpen, CheckCircle2, Gamepad2, Video, Wrench, Layers, Play } from "lucide-react";
import { LEVELS, getLevelIcon } from "@/lib/levels";
import { useI18n, getLanguageInfo } from "@/lib/i18n";
import { usePP } from "@/components/published/site-app";

interface LevelTranslation {
  id: string;
  language: string;
  name: string;
  category: string;
  seriousGaming: string;
  description?: string;
}

interface LevelWithTranslations {
  id: string;
  number: number;
  name: string;
  category?: string;
  seriousGaming?: string;
  translations?: LevelTranslation[];
}

interface Tab4FormationProps {
  siteId: string;
  isStudioMode: boolean;
  personId?: string;
  /** En mode publié : niveaux avec traductions pour afficher noms/catégories dans la langue sélectionnée */
  levelsWithTranslations?: LevelWithTranslations[];
}

function getLevelDisplay(
  levelNumber: number,
  levels: LevelWithTranslations[] | undefined,
  language: string
): { name: string; category: string } {
  if (!levels?.length) {
    const info = LEVELS[levelNumber] ?? LEVELS[0];
    return { name: info.name, category: info.category };
  }
  const level = levels.find((l) => l.number === levelNumber);
  if (!level) {
    const info = LEVELS[levelNumber] ?? LEVELS[0];
    return { name: info.name, category: info.category };
  }
  const lang = language?.toUpperCase() || "FR";
  const tr = level.translations?.find((x) => x.language.toUpperCase() === lang);
  if (tr) return { name: tr.name, category: tr.category };
  return { name: level.name, category: level.category || "" };
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

/** Module article (type ARTICLE) renvoyé par l’API /api/training/articles */
interface KnowledgeArticle {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  duration: number;
  difficulty: number;
  hasPdf?: boolean;
  resources?: Array<{ type?: string; title?: string; url?: string; description?: string }> | null;
  translations?: Array<{ language: string; title: string; description: string | null; content: string | null }>;
}

/** Parcours de formation */
interface TrainingPathModule {
  id: string;
  title: string;
  duration?: number;
  level?: { number: number };
  method?: { name: string; type: string };
}

interface TrainingPathItem {
  id: string;
  order: number;
  module: TrainingPathModule;
}

interface TrainingPath {
  id: string;
  name: string;
  description: string | null;
  order: number;
  items: TrainingPathItem[];
}

/** Icône et couleur selon le type de méthode de formation */
function getMethodIcon(type?: string, className = "h-4 w-4") {
  switch (type) {
    case "SERIOUS_GAME":
      return <Gamepad2 className={`${className} text-pink-500`} />;
    case "VIDEO":
      return <Video className={`${className} text-red-500`} />;
    case "TUTORIAL":
      return <BookOpen className={`${className} text-blue-500`} />;
    case "EXERCISE":
      return <Wrench className={`${className} text-orange-500`} />;
    case "INTERACTIVE":
      return <Layers className={`${className} text-purple-500`} />;
    case "ARTICLE":
      return <FileText className={`${className} text-amber-500`} />;
    default:
      return <Play className={`${className} text-gray-400`} />;
  }
}

/** Badge couleur selon le type de méthode */
function getMethodBadgeColor(type?: string): string {
  switch (type) {
    case "SERIOUS_GAME": return "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300";
    case "VIDEO": return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300";
    case "TUTORIAL": return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300";
    case "EXERCISE": return "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300";
    case "INTERACTIVE": return "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300";
    case "ARTICLE": return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300";
    default: return "bg-gray-100 dark:bg-gray-800 text-gray-500";
  }
}

export function Tab4Formation({ siteId, isStudioMode, personId, levelsWithTranslations }: Tab4FormationProps) {
  const { t, language } = useI18n();
  const ppApi = usePP();
  const locale = (() => {
    const info = getLanguageInfo(language);
    return info ? `${language.toLowerCase()}-${info.countryCode.toUpperCase()}` : "fr-FR";
  })();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(`/api/sites/${siteId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: input,
          personId,
        }),
      });

      const data = await res.json();

      if (data.response) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ─── Mode Studio : interface de sélection de visibilité des modules ───
  interface StudioModule {
    id: string;
    title: string;
    description?: string | null;
    duration?: number;
    difficulty?: number;
    isActive?: boolean;
    level?: { number: number; name: string } | null;
    translations?: Array<{ language: string; title: string; description: string | null }>;
  }
  interface StudioMethod {
    id: string;
    name: string;
    type: string;
    icon?: string | null;
    modules?: StudioModule[];
    translations?: Array<{ language: string; name: string; description: string | null }>;
  }
  const [studioMethods, setStudioMethods] = useState<StudioMethod[]>([]);
  const [hiddenModuleIds, setHiddenModuleIds] = useState<Set<string>>(new Set());
  const [studioLoading, setStudioLoading] = useState(isStudioMode);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isStudioMode) return;
    let cancelled = false;
    setStudioLoading(true);
    Promise.all([
      fetch("/api/training/seed").then((r) => r.json()),
      fetch(`/api/sites/${siteId}/training-visibility`).then((r) => r.json()),
    ])
      .then(([methodsData, visData]) => {
        if (cancelled) return;
        setStudioMethods(methodsData.methods || []);
        setHiddenModuleIds(new Set(visData.hiddenModuleIds || []));
      })
      .catch((err) => {
        console.error("Erreur chargement formation studio:", err);
        if (!cancelled) {
          setStudioMethods([]);
          setHiddenModuleIds(new Set());
        }
      })
      .finally(() => {
        if (!cancelled) setStudioLoading(false);
      });
    return () => { cancelled = true; };
  }, [isStudioMode, siteId]);

  const toggleModuleVisibility = async (moduleId: string, currentlyVisible: boolean) => {
    setTogglingId(moduleId);
    const newVisible = !currentlyVisible;
    try {
      const res = await fetch(`/api/sites/${siteId}/training-visibility`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId, visible: newVisible }),
      });
      if (res.ok) {
        const data = await res.json();
        setHiddenModuleIds(new Set(data.hiddenModuleIds || []));
      }
    } catch (e) {
      console.error("Erreur toggle visibilité:", e);
    }
    setTogglingId(null);
  };

  if (isStudioMode) {
    if (studioLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      );
    }

    const knowledgeMethods = studioMethods.filter((m) =>
      ["VIDEO", "ARTICLE", "TUTORIAL", "INTERACTIVE"].includes(m.type)
    );
    const applicationMethods = studioMethods.filter((m) =>
      ["SERIOUS_GAME", "EXERCISE"].includes(m.type)
    );

    const renderMethodModules = (method: StudioMethod) => {
      const modules = method.modules || [];
      if (modules.length === 0) {
        return (
          <p className="text-xs text-gray-400 italic ml-4">Aucun module. Ajoutez-en via Actions → Gérer les formations.</p>
        );
      }
      const allVisible = modules.every((m) => !hiddenModuleIds.has(m.id));
      const allHidden = modules.every((m) => hiddenModuleIds.has(m.id));
      return (
        <div className="space-y-1">
          {/* Bouton tout afficher / tout masquer */}
          <div className="flex items-center gap-2 mb-2 ml-4">
            <button
              type="button"
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-40"
              disabled={allVisible || togglingId !== null}
              onClick={async () => {
                for (const m of modules) {
                  if (hiddenModuleIds.has(m.id)) {
                    await toggleModuleVisibility(m.id, false);
                  }
                }
              }}
            >
              Tout afficher
            </button>
            <span className="text-gray-300">|</span>
            <button
              type="button"
              className="text-xs text-gray-500 hover:underline disabled:opacity-40"
              disabled={allHidden || togglingId !== null}
              onClick={async () => {
                for (const m of modules) {
                  if (!hiddenModuleIds.has(m.id)) {
                    await toggleModuleVisibility(m.id, true);
                  }
                }
              }}
            >
              Tout masquer
            </button>
            <span className="text-xs text-gray-400 ml-2">
              {modules.filter((m) => !hiddenModuleIds.has(m.id)).length}/{modules.length} visible(s)
            </span>
          </div>
          {modules.map((mod) => {
            const isVisible = !hiddenModuleIds.has(mod.id);
            const lang = language?.toUpperCase() || "FR";
            const tr = mod.translations?.find((x) => x.language.toUpperCase() === lang);
            const title = tr?.title ?? mod.title;
            const levelNum = mod.level?.number;
            return (
              <div
                key={mod.id}
                className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
                  isVisible
                    ? "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                    : "bg-gray-100 dark:bg-gray-800/50 border border-dashed border-gray-300 dark:border-gray-600 opacity-60"
                }`}
              >
                <button
                  type="button"
                  disabled={togglingId === mod.id}
                  onClick={() => toggleModuleVisibility(mod.id, isVisible)}
                  className={`flex-shrink-0 p-1 rounded transition-colors ${
                    isVisible
                      ? "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30"
                      : "text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                  title={isVisible ? "Cliquer pour masquer du site publié" : "Cliquer pour rendre visible sur le site publié"}
                >
                  {togglingId === mod.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isVisible ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </button>
                {levelNum && (
                  <span className="flex-shrink-0 text-xs font-mono bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded">
                    Niv.{levelNum}
                  </span>
                )}
                <span className={`text-sm flex-1 truncate ${isVisible ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400 line-through"}`}>
                  {title}
                </span>
                {mod.duration && mod.duration > 0 && (
                  <span className="text-xs text-gray-400 flex-shrink-0">{mod.duration} min</span>
                )}
              </div>
            );
          })}
        </div>
      );
    };

    return (
      <div className="p-4 space-y-6 overflow-auto max-h-full">
        <div className="flex items-center gap-2 mb-2">
          <GraduationCap className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold">Visibilité des formations sur ce site</h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 -mt-4">
          Choisissez les modules visibles sur le site publié. Pour gérer le contenu des formations (créer, modifier, supprimer), utilisez le menu <strong>Actions → Gérer les formations</strong>.
        </p>

        {/* Connaissances */}
        <section>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Connaissances</h3>
          {knowledgeMethods.length === 0 ? (
            <p className="text-sm text-gray-400 italic">Aucune méthode de type connaissances.</p>
          ) : (
            <div className="space-y-4">
              {knowledgeMethods.map((method) => {
                const lang = language?.toUpperCase() || "FR";
                const mtr = method.translations?.find((x) => x.language.toUpperCase() === lang);
                const name = mtr?.name ?? method.name;
                return (
                  <div key={method.id}>
                    <h4 className="text-sm font-medium mb-1 flex items-center gap-2">
                      <span>{method.icon || "📚"}</span> {name}
                      <span className="text-xs text-gray-400">({method.type})</span>
                    </h4>
                    {renderMethodModules(method)}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Applications */}
        <section>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Applications</h3>
          {applicationMethods.length === 0 ? (
            <p className="text-sm text-gray-400 italic">Aucune méthode de type application.</p>
          ) : (
            <div className="space-y-4">
              {applicationMethods.map((method) => {
                const lang = language?.toUpperCase() || "FR";
                const mtr = method.translations?.find((x) => x.language.toUpperCase() === lang);
                const name = mtr?.name ?? method.name;
                return (
                  <div key={method.id}>
                    <h4 className="text-sm font-medium mb-1 flex items-center gap-2">
                      <span>{method.icon || "🎮"}</span> {name}
                      <span className="text-xs text-gray-400">({method.type})</span>
                    </h4>
                    {renderMethodModules(method)}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    );
  }

  // Mode site publié : fenêtre divisée en deux avec drag pour modifier la largeur
  // Gauche = prompt / chat OpenAI ; Droite = autres éléments de formation
  // On peut tout masquer d'un côté en tirant le drag jusqu'au bord ; reprendre le drag pour réagrandir
  const [leftPercent, setLeftPercent] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const startPercentRef = useRef(50);
  const containerRef = useRef<HTMLDivElement>(null);
  // Niveau sélectionné dans l'onglet Connaissances (1-20), null = tous
  const [selectedKnowledgeLevel, setSelectedKnowledgeLevel] = useState<number | null>(null);
  const [knowledgeArticles, setKnowledgeArticles] = useState<KnowledgeArticle[]>([]);
  const [knowledgeArticlesLoading, setKnowledgeArticlesLoading] = useState(false);
  // Viewer PDF : moduleId de l'article actuellement affiché
  const [viewingPdfId, setViewingPdfId] = useState<string | null>(null);
  // Parcours de formation
  const [trainingPaths, setTrainingPaths] = useState<TrainingPath[]>([]);
  const [pathsLoading, setPathsLoading] = useState(false);
  const [selectedPathId, setSelectedPathId] = useState<string | null>(null);
  // Module sélectionné dans un parcours
  const [selectedPathModuleId, setSelectedPathModuleId] = useState<string | null>(null);
  // Filtre niveau pour les parcours (null = tous)
  const [pathLevelFilter, setPathLevelFilter] = useState<number | null>(null);

  // Charger les parcours de formation (site publié uniquement)
  useEffect(() => {
    if (isStudioMode) return;
    let cancelled = false;
    setPathsLoading(true);
    fetch("/api/training/paths")
      .then((res) => (res.ok ? res.json() : { paths: [] }))
      .then((data) => {
        if (!cancelled && Array.isArray(data.paths)) setTrainingPaths(data.paths);
      })
      .catch(() => {
        if (!cancelled) setTrainingPaths([]);
      })
      .finally(() => {
        if (!cancelled) setPathsLoading(false);
      });
    return () => { cancelled = true; };
  }, [isStudioMode]);

  // Charger les articles du niveau sélectionné (site publié uniquement)
  useEffect(() => {
    if (isStudioMode || selectedKnowledgeLevel == null) {
      setKnowledgeArticles([]);
      return;
    }
    let cancelled = false;
    setKnowledgeArticlesLoading(true);
    setKnowledgeArticles([]);
    fetch(`/api/training/articles?levelNumber=${selectedKnowledgeLevel}&siteId=${siteId}`)
      .then((res) => (res.ok ? res.json() : { articles: [] }))
      .then((data) => {
        if (!cancelled && Array.isArray(data.articles)) setKnowledgeArticles(data.articles);
      })
      .catch(() => {
        if (!cancelled) setKnowledgeArticles([]);
      })
      .finally(() => {
        if (!cancelled) setKnowledgeArticlesLoading(false);
      });
    return () => { cancelled = true; };
  }, [isStudioMode, selectedKnowledgeLevel]);

  const handleDividerMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startXRef.current = e.clientX;
    startPercentRef.current = leftPercent;
  }, [leftPercent]);

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const deltaX = e.clientX - startXRef.current;
      const deltaPercent = (deltaX / rect.width) * 100;
      let next = startPercentRef.current + deltaPercent;
      next = Math.max(0, Math.min(100, next));
      setLeftPercent(next);
    };
    const onUp = () => setIsDragging(false);
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isDragging]);

  return (
    <div
      ref={containerRef}
      className={`flex w-full ${isDragging ? "select-none" : ""}`}
      style={{ height: "calc(100vh - 7rem)" }}
    >
      {/* Partie gauche : prompt / assistant OpenAI – le prompt reste fixe en bas */}
      <div
        className="flex flex-col border rounded-l-lg bg-white dark:bg-gray-900 shadow-sm flex-shrink-0 min-w-0 min-h-0 overflow-hidden"
        style={{ width: leftPercent === 0 ? "0" : `calc(${leftPercent}% - 3px)` }}
      >
        {leftPercent > 0 && (
          <>
            <div className="border-b px-4 bg-gray-50 dark:bg-gray-800/50 h-8 flex items-center flex-shrink-0">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Bot className="h-4 w-4 text-blue-500" />
                {t.formation.assistantTitle}
              </h3>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-4 min-h-0">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center min-h-[160px]">
                  <div>
                    <Sparkles className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
                    <h3 className="font-semibold text-lg">{t.formation.welcomeTitle}</h3>
                    <p className="text-gray-500 mt-2 max-w-md text-sm">
                      {t.formation.welcomeIntro}
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-lg ${
                        message.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 dark:bg-gray-800"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {message.role === "assistant" ? (
                          <Bot className="h-4 w-4" />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                        <span className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4" />
                      <span className="animate-pulse text-sm">{t.formation.thinking}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t bg-gray-50/50 dark:bg-gray-800/30 flex-shrink-0">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t.formation.placeholder}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Drag handle : toujours visible pour pouvoir réagrandir une partie masquée */}
      <div
        role="separator"
        aria-valuenow={leftPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        onMouseDown={handleDividerMouseDown}
        className="w-1.5 flex-shrink-0 bg-gray-200 dark:bg-gray-700 hover:bg-blue-400 dark:hover:bg-blue-600 cursor-col-resize flex items-center justify-center group transition-colors"
        title={t.formation.resizeTitle}
      >
        <div className="w-0.5 h-8 rounded-full bg-gray-400 group-hover:bg-white opacity-50 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Partie droite : Formation avec sous-onglets Parcours, Applications, Connaissances */}
      <div
        className="flex flex-col border rounded-r-lg overflow-hidden bg-white dark:bg-gray-900 shadow-sm min-w-0"
        style={{
          flex: leftPercent >= 100 ? "0 0 0" : "1 1 0",
          width: leftPercent >= 100 ? 0 : undefined,
          minWidth: leftPercent >= 100 ? 0 : undefined,
        }}
      >
        <Tabs defaultValue="parcours" className="flex flex-col flex-1 min-h-0">
          <div className="border-b px-4 bg-gray-50 dark:bg-gray-800/50 flex items-center gap-4 flex-shrink-0 h-8">
            <h3 className="text-sm font-semibold">{t.formation.title}</h3>
            <TabsList className="h-6 bg-transparent p-0 gap-0 border-0 [&>button]:rounded [&>button]:px-2.5 [&>button]:py-0.5 [&>button]:text-xs [&>button]:data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 [&>button]:data-[state=active]:shadow-sm">
              <TabsTrigger value="parcours">{t.formation.tabParcours}</TabsTrigger>
              <TabsTrigger value="applications">{t.formation.tabApplications}</TabsTrigger>
              <TabsTrigger value="connaissances">{t.formation.tabConnaissances}</TabsTrigger>
            </TabsList>
          </div>
          <div className="flex-1 overflow-auto min-h-0">
            <TabsContent value="parcours" className="mt-0 h-full data-[state=inactive]:hidden flex flex-col min-h-0">
              {pathsLoading ? (
                <div className="flex items-center justify-center py-8 flex-1">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                </div>
              ) : trainingPaths.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8 flex-1 flex flex-col items-center justify-center">
                  <Route className="h-12 w-12 mb-3 opacity-30" />
                  <p className="text-sm">{t.formation.parcoursPlaceholder}</p>
                </div>
              ) : selectedPathId ? (
                /* Détail d'un parcours sélectionné */
                (() => {
                  const path = trainingPaths.find((p) => p.id === selectedPathId);
                  if (!path) return null;
                  // Extraire le numéro de niveau si présent dans le nom
                  const levelMatch = path.name.match(/Niveau (\d+)/);
                  const levelNumber = levelMatch ? parseInt(levelMatch[1], 10) : null;
                  return (
                    <div className="flex flex-col h-full min-h-0 p-4">
                      <div className="flex items-center gap-3 mb-4 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => { setSelectedPathId(null); setSelectedPathModuleId(null); }}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          ← Retour aux parcours
                        </button>
                      </div>
                      <div className="flex items-start gap-3 mb-4 flex-shrink-0">
                        {levelNumber && getLevelIcon(levelNumber, "h-8 w-8")}
                        <div>
                          <h3 className="font-semibold text-lg">{path.name}</h3>
                          {path.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 whitespace-pre-line">
                              {path.description}
                            </p>
                          )}
                        </div>
                      </div>
                      {path.items.length === 0 ? (
                        <p className="text-sm text-gray-400 italic">Aucun module dans ce parcours</p>
                      ) : selectedPathModuleId ? (
                        /* Affichage du contenu d'un module sélectionné */
                        (() => {
                          const selectedItem = path.items.find(i => i.module.id === selectedPathModuleId);
                          if (!selectedItem) return null;
                          const mod = selectedItem.module;
                          const methodType = mod.method?.type;
                          return (
                            <div className="flex-1 flex flex-col min-h-0">
                              <button
                                type="button"
                                onClick={() => setSelectedPathModuleId(null)}
                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline mb-3 text-left"
                              >
                                ← Retour aux étapes
                              </button>
                              <div className="flex items-center gap-2 mb-3">
                                {getMethodIcon(mod.method?.type, "h-5 w-5")}
                                <h4 className="font-semibold">{mod.title}</h4>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                                {mod.method && <span className={`px-2 py-0.5 rounded font-medium ${getMethodBadgeColor(mod.method.type)}`}>{mod.method.name}</span>}
                                {mod.duration && <span>{mod.duration} min</span>}
                              </div>
                              {/* Contenu unifié via iframe pour tous les types */}
                              <iframe
                                src={`/api/training/modules/${mod.id}/view`}
                                className="flex-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 min-h-[400px]"
                                title={mod.title}
                              />
                            </div>
                          );
                        })()
                      ) : (
                        <div className="flex-1 overflow-auto space-y-2">
                          <p className="text-xs font-medium text-gray-500 uppercase mb-2">
                            {path.items.length} étapes dans ce parcours
                          </p>
                          {path.items.map((item, idx) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setSelectedPathModuleId(item.module.id)}
                              className="w-full flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 transition-colors text-left"
                            >
                              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-bold flex-shrink-0">
                                {idx + 1}
                              </div>
                              {getMethodIcon(item.module.method?.type)}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{item.module.title}</p>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  {item.module.method && (
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${getMethodBadgeColor(item.module.method.type)}`}>
                                      {item.module.method.name}
                                    </span>
                                  )}
                                  {item.module.duration && <span>· {item.module.duration} min</span>}
                                </div>
                              </div>
                              <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : (
                /* Liste des parcours avec filtre par niveau */
                <div className="flex-1 flex flex-col min-h-0">
                  {/* Barre de filtre par niveau — horizontale, scrollable */}
                  {(() => {
                    // Extraire les niveaux uniques présents dans les parcours
                    const availableLevels = Array.from(
                      new Set(
                        trainingPaths
                          .map((p) => {
                            const m = p.name.match(/Niveau (\d+)/);
                            return m ? parseInt(m[1], 10) : null;
                          })
                          .filter((n): n is number => n !== null)
                      )
                    ).sort((a, b) => a - b);

                    // Compter les parcours sans niveau
                    const noLevelCount = trainingPaths.filter((p) => !p.name.match(/Niveau (\d+)/)).length;

                    return availableLevels.length > 0 ? (
                      <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 px-3 py-2 bg-gray-50/50 dark:bg-gray-800/30">
                        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                          <button
                            type="button"
                            onClick={() => setPathLevelFilter(null)}
                            className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                              pathLevelFilter === null
                                ? "bg-blue-600 text-white shadow-sm"
                                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                          >
                            Tous ({trainingPaths.length})
                          </button>
                          {availableLevels.map((lvl) => {
                            const count = trainingPaths.filter((p) => p.name.match(new RegExp(`Niveau ${lvl}\\b`))).length;
                            const isActive = pathLevelFilter === lvl;
                            return (
                              <button
                                key={lvl}
                                type="button"
                                onClick={() => setPathLevelFilter(isActive ? null : lvl)}
                                className={`flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                                  isActive
                                    ? "bg-blue-600 text-white shadow-sm"
                                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                                }`}
                              >
                                {getLevelIcon(lvl, "h-3.5 w-3.5")}
                                <span>Niv. {lvl}</span>
                                {count > 1 && <span className="opacity-60">({count})</span>}
                              </button>
                            );
                          })}
                          {noLevelCount > 0 && (
                            <button
                              type="button"
                              onClick={() => setPathLevelFilter(-1)}
                              className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                                pathLevelFilter === -1
                                  ? "bg-purple-600 text-white shadow-sm"
                                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                              }`}
                            >
                              Transversal ({noLevelCount})
                            </button>
                          )}
                        </div>
                      </div>
                    ) : null;
                  })()}

                  {/* Liste filtrée des parcours */}
                  <div className="flex-1 overflow-auto p-4 space-y-3">
                  {(() => {
                    const filteredPaths = pathLevelFilter === null
                      ? trainingPaths
                      : pathLevelFilter === -1
                        ? trainingPaths.filter((p) => !p.name.match(/Niveau (\d+)/))
                        : trainingPaths.filter((p) => p.name.match(new RegExp(`Niveau ${pathLevelFilter}\\b`)));

                    return filteredPaths.length === 0 ? (
                      <div className="text-center text-gray-400 py-8">
                        <p className="text-sm">Aucun parcours pour ce niveau.</p>
                      </div>
                    ) : (
                      filteredPaths.map((path) => {
                    // Extraire le numéro de niveau si présent dans le nom
                    const levelMatch = path.name.match(/Niveau (\d+)/);
                    const levelNumber = levelMatch ? parseInt(levelMatch[1], 10) : null;
                    const totalDuration = path.items.reduce((sum, i) => sum + (i.module.duration || 0), 0);
                    return (
                      <button
                        key={path.id}
                        type="button"
                        onClick={() => setSelectedPathId(path.id)}
                        className="w-full text-left p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          {levelNumber ? (
                            getLevelIcon(levelNumber, "h-6 w-6 flex-shrink-0")
                          ) : (
                            <Route className="h-6 w-6 text-purple-500 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                              {path.name}
                            </h4>
                            {path.description && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                                {path.description.split("\n")[0]}
                              </p>
                            )}
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                              <span className="flex items-center gap-1">
                                <Target className="h-3 w-3" />
                                {path.items.length} étapes
                              </span>
                              {totalDuration > 0 && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {totalDuration} min
                                </span>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        </div>
                      </button>
                    );
                  })
                    );
                  })()}
                  </div>
                </div>
              )}
            </TabsContent>
            <TabsContent value="applications" className="mt-0 p-4 h-full data-[state=inactive]:hidden">
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <p className="text-sm">{t.formation.applicationsPlaceholder}</p>
              </div>
            </TabsContent>
            <TabsContent value="connaissances" className="mt-0 h-full data-[state=inactive]:hidden flex flex-col min-h-0">
              <div className="flex flex-1 min-h-0 overflow-hidden">
                {/* Barre verticale des 20 niveaux (1 à 20) : une seule colonne, icône puis numéro à droite, répartition de la hauteur sans ascenseur */}
                <div className="w-14 flex-shrink-0 self-stretch border-r border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 flex flex-col min-h-0">
                  {LEVELS.filter((l) => l.number >= 1 && l.number <= 20).map((level) => {
                    const display = levelsWithTranslations?.length
                      ? getLevelDisplay(level.number, levelsWithTranslations, language)
                      : { name: level.name, category: level.category };
                    return (
                    <button
                      key={level.number}
                      type="button"
                      onClick={() => {
                        const next = selectedKnowledgeLevel === level.number ? null : level.number;
                        setSelectedKnowledgeLevel(next);
                        if (next != null && !isStudioMode && personId && ppApi?.addPP) {
                          ppApi.addPP("knowledge_view");
                        }
                      }}
                      className={`flex items-center justify-center gap-1 min-h-0 flex-1 px-1 rounded-sm transition-colors ${
                        selectedKnowledgeLevel === level.number
                          ? "bg-blue-100 dark:bg-blue-900/50 ring-1 ring-blue-500 dark:ring-blue-400"
                          : "hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                      title={`${t.formation.levelLabel} ${level.number} - ${display.name} (${display.category})`}
                    >
                      {getLevelIcon(level.number, "h-3.5 w-3.5 flex-shrink-0")}
                      <span className="text-[10px] font-semibold text-gray-700 dark:text-gray-300 tabular-nums leading-none">
                        {level.number}
                      </span>
                    </button>
                  );
                  })}
                </div>
                {/* Zone contenu Connaissances (accessible à tous, triée par niveau si sélectionné) */}
                <div className="flex-1 overflow-auto p-4 min-w-0">
                  {selectedKnowledgeLevel === null ? (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                      <p className="text-sm">{t.formation.selectLevelHint}</p>
                      <p className="text-xs mt-4">{t.formation.resourcesHint}</p>
                    </div>
                  ) : (() => {
                    const display = levelsWithTranslations?.length
                      ? getLevelDisplay(selectedKnowledgeLevel, levelsWithTranslations, language)
                      : { name: LEVELS[selectedKnowledgeLevel]?.name ?? "", category: LEVELS[selectedKnowledgeLevel]?.category ?? "" };
                    return (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        {getLevelIcon(selectedKnowledgeLevel, "h-6 w-6")}
                        <div>
                          <p className="text-sm font-semibold">
                            {t.formation.levelLabel} {selectedKnowledgeLevel} – {display.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {display.category}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedKnowledgeLevel(null)}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline ml-2"
                        >
                          {t.formation.seeAll}
                        </button>
                      </div>
                      {knowledgeArticlesLoading ? (
                        <div className="flex items-center justify-center gap-2 py-8 text-gray-500 dark:text-gray-400">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span className="text-sm">{t.formation.resourcesHint}</span>
                        </div>
                      ) : knowledgeArticles.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400 py-4">
                          {t.formation.resourcesHint}
                        </p>
                      ) : viewingPdfId ? (
                        /* Viewer PDF intégré */
                        (() => {
                          const article = knowledgeArticles.find((a) => a.id === viewingPdfId);
                          const lang = language?.toUpperCase() || "FR";
                          const tr = article?.translations?.find((x) => x.language.toUpperCase() === lang);
                          const title = tr?.title ?? article?.title ?? "";
                          return (
                            <div className="flex flex-col h-full min-h-0">
                              <div className="flex items-center justify-between mb-2 flex-shrink-0">
                                <h4 className="font-medium text-sm truncate flex-1">{title}</h4>
                                <button
                                  type="button"
                                  onClick={() => setViewingPdfId(null)}
                                  className="ml-2 text-xs text-blue-600 dark:text-blue-400 hover:underline flex-shrink-0"
                                >
                                  \u2190 Retour aux articles
                                </button>
                              </div>
                              <iframe
                                src={`/api/training/articles/${viewingPdfId}`}
                                className="flex-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 min-h-[400px]"
                                title={title}
                              />
                            </div>
                          );
                        })()
                      ) : (
                        <ul className="space-y-3">
                          {knowledgeArticles.map((article) => {
                            const lang = language?.toUpperCase() || "FR";
                            const tr = article.translations?.find((x) => x.language.toUpperCase() === lang);
                            const title = tr?.title ?? article.title;
                            const description = tr?.description ?? article.description;
                            const link = Array.isArray(article.resources) && article.resources[0]?.url
                              ? article.resources[0].url
                              : null;
                            return (
                              <li key={article.id}>
                                <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 p-4">
                                  <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 p-2 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                                      <FileText className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                        {title}
                                      </h4>
                                      {description && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                          {description}
                                        </p>
                                      )}
                                      <div className="flex flex-wrap items-center gap-3 mt-2">
                                        {article.duration > 0 && (
                                          <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                            <Clock className="h-3.5 w-3.5" />
                                            {article.duration} min
                                          </span>
                                        )}
                                        {article.hasPdf && (
                                          <button
                                            type="button"
                                            onClick={() => setViewingPdfId(article.id)}
                                            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                                          >
                                            <FileText className="h-3.5 w-3.5" />
                                            Voir le PDF
                                          </button>
                                        )}
                                        {link && (
                                          <a
                                            href={link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 hover:underline"
                                          >
                                            Source originale
                                            <ExternalLink className="h-3.5 w-3.5" />
                                          </a>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  );
                  })()}
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
