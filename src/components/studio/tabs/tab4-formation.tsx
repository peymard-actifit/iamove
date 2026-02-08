"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from "@/components/ui";
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

  // Mode site publié : fenêtre divisée en deux verticalement
  // Gauche = prompt / chat OpenAI ; Droite = autres éléments de formation
  return (
    <div className="flex gap-4 h-[calc(100vh-12rem)] min-h-[400px]">
      {/* Partie gauche : prompt / assistant OpenAI */}
      <div className="w-1/2 min-w-0 flex flex-col border rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
        <div className="border-b px-4 py-3 bg-gray-50 dark:bg-gray-800/50">
          <h3 className="font-semibold flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-500" />
            Assistant Formation IA
          </h3>
        </div>
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center min-h-[200px]">
              <div>
                <Sparkles className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
                <h3 className="font-semibold text-lg">Bienvenue dans votre formation IA</h3>
                <p className="text-gray-500 mt-2 max-w-md">
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
                      {message.timestamp.toLocaleTimeString("fr-FR", { 
                        hour: "2-digit", 
                        minute: "2-digit" 
                      })}
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
      </div>

      {/* Partie droite : autres éléments de formation (à venir) */}
      <div className="w-1/2 min-w-0 flex flex-col border rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
        <div className="border-b px-4 py-3 bg-gray-50 dark:bg-gray-800/50">
          <h3 className="font-semibold">Formation</h3>
        </div>
        <div className="flex-1 overflow-auto p-6 flex items-center justify-center min-h-[200px]">
          <div className="text-center text-gray-500 dark:text-gray-400 max-w-sm">
            <p className="text-sm">
              Modules, parcours et ressources de formation seront affichés ici.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
