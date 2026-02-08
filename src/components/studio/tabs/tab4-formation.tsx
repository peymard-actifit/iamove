"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui";
import { Send, Bot, User, Sparkles, FileText, Clock, ExternalLink, Loader2 } from "lucide-react";
import { LEVELS, getLevelIcon } from "@/lib/levels";
import { useI18n, getLanguageInfo } from "@/lib/i18n";
import { usePP } from "@/components/published/site-app";
import dynamic from "next/dynamic";

const TrainingPageContent = dynamic(
  () => import("@/components/studio/training-page-content").then((m) => m.TrainingPageContent),
  { ssr: false, loading: () => <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div> }
);

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
  resources?: Array<{ type?: string; title?: string; url?: string; description?: string }> | null;
  translations?: Array<{ language: string; title: string; description: string | null; content: string | null }>;
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

  // Mode studio : charger dynamiquement les méthodes, niveaux et parcours,
  // puis afficher le vrai composant de gestion (Connaissances, Applications, Parcours).
  const [studioData, setStudioData] = useState<{ methods: unknown[]; levels: unknown[]; paths: unknown[] } | null>(null);
  const [studioLoading, setStudioLoading] = useState(isStudioMode);

  useEffect(() => {
    if (!isStudioMode) return;
    let cancelled = false;
    setStudioLoading(true);
    Promise.all([
      fetch("/api/training/seed").then((r) => r.json()),
      fetch("/api/levels").then((r) => r.json()),
      fetch("/api/training/paths").then((r) => r.json()),
    ])
      .then(([methodsData, levelsData, pathsData]) => {
        if (cancelled) return;
        setStudioData({
          methods: methodsData.methods || [],
          levels: Array.isArray(levelsData) ? levelsData : levelsData.levels || [],
          paths: pathsData.paths || [],
        });
      })
      .catch((err) => {
        console.error("Erreur chargement formation studio:", err);
        if (!cancelled) setStudioData({ methods: [], levels: [], paths: [] });
      })
      .finally(() => {
        if (!cancelled) setStudioLoading(false);
      });
    return () => { cancelled = true; };
  }, [isStudioMode]);

  if (isStudioMode) {
    if (studioLoading || !studioData) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      );
    }
    return (
      <TrainingPageContent
        methods={studioData.methods as never[]}
        levels={studioData.levels as never[]}
        paths={studioData.paths as never[]}
      />
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

  // Charger les articles du niveau sélectionné (site publié uniquement)
  useEffect(() => {
    if (isStudioMode || selectedKnowledgeLevel == null) {
      setKnowledgeArticles([]);
      return;
    }
    let cancelled = false;
    setKnowledgeArticlesLoading(true);
    setKnowledgeArticles([]);
    fetch(`/api/training/articles?levelNumber=${selectedKnowledgeLevel}`)
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
      className={`flex flex-1 min-h-0 w-full ${isDragging ? "select-none" : ""}`}
    >
      {/* Partie gauche : prompt / assistant OpenAI */}
      <div
        className="flex flex-col border rounded-l-lg overflow-hidden bg-white dark:bg-gray-900 shadow-sm flex-shrink-0 min-w-0"
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
            <div className="p-4 border-t bg-gray-50/50 dark:bg-gray-800/30">
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
            <TabsContent value="parcours" className="mt-0 p-4 h-full data-[state=inactive]:hidden">
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <p className="text-sm">{t.formation.parcoursPlaceholder}</p>
              </div>
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
                                        {link && (
                                          <a
                                            href={link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                                          >
                                            Lire l’article
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
