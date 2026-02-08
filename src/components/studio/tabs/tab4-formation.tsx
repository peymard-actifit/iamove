"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui";
import { Send, Bot, User, Sparkles } from "lucide-react";

interface Tab4FormationProps {
  siteId: string;
  isStudioMode: boolean;
  personId?: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function Tab4Formation({ siteId, isStudioMode, personId }: Tab4FormationProps) {
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

  if (isStudioMode) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Formation IA</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              Aperçu du module de formation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">
              Dans cet onglet, les utilisateurs du site publié pourront dialoguer avec une IA 
              spécialisée pour progresser dans leurs compétences.
            </p>
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Fonctionnalités :</strong>
              </p>
              <ul className="mt-2 text-sm text-gray-500 space-y-1">
                <li>• Dialogue avec l&apos;assistant IA</li>
                <li>• Base de connaissances sur les technologies IA</li>
                <li>• Suggestions de progression personnalisées</li>
                <li>• Historique des conversations sauvegardé</li>
              </ul>
            </div>
          </CardContent>
        </Card>
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
      className={`flex h-[calc(100vh-8rem)] min-h-[360px] ${isDragging ? "select-none" : ""}`}
    >
      {/* Partie gauche : prompt / assistant OpenAI */}
      <div
        className="flex flex-col border rounded-l-lg overflow-hidden bg-white dark:bg-gray-900 shadow-sm flex-shrink-0 min-w-0"
        style={{ width: leftPercent === 0 ? "0" : `calc(${leftPercent}% - 3px)` }}
      >
        {leftPercent > 0 && (
          <>
            <div className="border-b px-4 py-2 bg-gray-50 dark:bg-gray-800/50">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Bot className="h-4 w-4 text-blue-500" />
                Assistant Formation IA
              </h3>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-4 min-h-0">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center min-h-[160px]">
                  <div>
                    <Sparkles className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
                    <h3 className="font-semibold text-lg">Bienvenue dans votre formation IA</h3>
                    <p className="text-gray-500 mt-2 max-w-md text-sm">
                      Posez vos questions sur l&apos;intelligence artificielle, les bonnes pratiques, 
                      ou demandez des conseils pour progresser dans vos compétences.
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
                          {message.timestamp.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
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
                      <span className="animate-pulse text-sm">En train de réfléchir...</span>
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
                  placeholder="Posez votre question..."
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
        title="Glisser pour modifier la largeur"
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
          <div className="border-b px-4 py-2 bg-gray-50 dark:bg-gray-800/50 flex items-center gap-4 flex-shrink-0">
            <h3 className="text-sm font-semibold">Formation</h3>
            <TabsList className="h-7 bg-transparent p-0 gap-0 border-0 [&>button]:rounded [&>button]:px-3 [&>button]:py-1 [&>button]:text-xs [&>button]:data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 [&>button]:data-[state=active]:shadow-sm">
              <TabsTrigger value="parcours">Parcours</TabsTrigger>
              <TabsTrigger value="applications">Applications</TabsTrigger>
              <TabsTrigger value="connaissances">Connaissances</TabsTrigger>
            </TabsList>
          </div>
          <div className="flex-1 overflow-auto min-h-0">
            <TabsContent value="parcours" className="mt-0 p-4 h-full data-[state=inactive]:hidden">
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <p className="text-sm">Parcours de formation seront affichés ici.</p>
              </div>
            </TabsContent>
            <TabsContent value="applications" className="mt-0 p-4 h-full data-[state=inactive]:hidden">
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <p className="text-sm">Applications et exercices seront affichés ici.</p>
              </div>
            </TabsContent>
            <TabsContent value="connaissances" className="mt-0 p-4 h-full data-[state=inactive]:hidden">
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <p className="text-sm">Ressources et connaissances seront affichées ici.</p>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
