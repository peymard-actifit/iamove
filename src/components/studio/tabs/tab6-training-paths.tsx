"use client";

import { useState, useEffect } from "react";
import { Card, Button } from "@/components/ui";
import { 
  Gamepad2, BookOpen, Wrench, Video, FileText, Layers, 
  ChevronRight, Clock, Star, CheckCircle, Play, Lock
} from "lucide-react";
import { useI18n } from "@/lib/i18n";

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
}

interface TrainingModule {
  id: string;
  title: string;
  description: string | null;
  duration: number;
  difficulty: number;
  level: Level;
  translations: TrainingModuleTranslation[];
}

interface TrainingMethod {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  type: string;
  translations: TrainingMethodTranslation[];
  modules: TrainingModule[];
}

interface Tab6TrainingPathsProps {
  siteId: string;
  personId?: string;
  currentLevel: number;
}

const ICONS: Record<string, React.ReactNode> = {
  Gamepad2: <Gamepad2 className="h-6 w-6" />,
  BookOpen: <BookOpen className="h-6 w-6" />,
  Wrench: <Wrench className="h-6 w-6" />,
  Video: <Video className="h-6 w-6" />,
  FileText: <FileText className="h-6 w-6" />,
  Layers: <Layers className="h-6 w-6" />,
};

const TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  SERIOUS_GAME: { 
    bg: "bg-purple-50 dark:bg-purple-900/20", 
    text: "text-purple-700 dark:text-purple-300",
    border: "border-purple-200 dark:border-purple-800"
  },
  TUTORIAL: { 
    bg: "bg-blue-50 dark:bg-blue-900/20", 
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-800"
  },
  EXERCISE: { 
    bg: "bg-green-50 dark:bg-green-900/20", 
    text: "text-green-700 dark:text-green-300",
    border: "border-green-200 dark:border-green-800"
  },
  VIDEO: { 
    bg: "bg-red-50 dark:bg-red-900/20", 
    text: "text-red-700 dark:text-red-300",
    border: "border-red-200 dark:border-red-800"
  },
  ARTICLE: { 
    bg: "bg-yellow-50 dark:bg-yellow-900/20", 
    text: "text-yellow-700 dark:text-yellow-300",
    border: "border-yellow-200 dark:border-yellow-800"
  },
  INTERACTIVE: { 
    bg: "bg-indigo-50 dark:bg-indigo-900/20", 
    text: "text-indigo-700 dark:text-indigo-300",
    border: "border-indigo-200 dark:border-indigo-800"
  },
};

export function Tab6TrainingPaths({ siteId, personId, currentLevel }: Tab6TrainingPathsProps) {
  const { language: globalLanguage, t } = useI18n();
  const [methods, setMethods] = useState<TrainingMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<TrainingMethod | null>(null);
  const [loading, setLoading] = useState(true);

  // Charger les méthodes de formation
  useEffect(() => {
    const fetchMethods = async () => {
      try {
        const res = await fetch("/api/training/seed");
        if (res.ok) {
          const data = await res.json();
          setMethods(data.methods || []);
        }
      } catch (error) {
        console.error("Erreur:", error);
      }
      setLoading(false);
    };
    fetchMethods();
  }, []);

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

  // Filtrer les modules accessibles (niveau actuel ou inférieur)
  const getAccessibleModules = (modules: TrainingModule[]) => {
    return modules.filter(m => m.level.number <= currentLevel + 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (methods.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Layers className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Parcours de formation à venir
        </h3>
        <p className="text-gray-500 mt-2">
          Les méthodes de formation seront bientôt disponibles. 
          En attendant, utilisez l&apos;assistant IA pour vous former.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info niveau */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Votre parcours de formation</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Niveau actuel : <span className="font-bold text-blue-600">{currentLevel}</span> - 
              Accès aux formations jusqu&apos;au niveau {currentLevel + 1}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{currentLevel}/20</div>
            <p className="text-xs text-gray-500">Progression</p>
          </div>
        </div>
      </Card>

      {/* Liste des méthodes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {methods.map(method => {
          const translated = getTranslatedMethod(method);
          const colors = TYPE_COLORS[method.type] || TYPE_COLORS.TUTORIAL;
          const accessibleModules = getAccessibleModules(method.modules);
          const isSelected = selectedMethod?.id === method.id;
          
          return (
            <Card
              key={method.id}
              className={`p-5 cursor-pointer transition-all border-2 ${
                isSelected 
                  ? `ring-2 ring-blue-500 ${colors.bg} ${colors.border}` 
                  : `hover:shadow-lg ${colors.border}`
              }`}
              onClick={() => setSelectedMethod(isSelected ? null : method)}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${colors.bg} ${colors.text}`}>
                  {ICONS[method.icon || "Layers"]}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{translated.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                    {translated.description}
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800">
                      {accessibleModules.length} / {method.modules.length} modules accessibles
                    </span>
                    <ChevronRight className={`h-4 w-4 transition-transform ${isSelected ? "rotate-90" : ""}`} />
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Modules de la méthode sélectionnée */}
      {selectedMethod && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            {getTranslatedMethod(selectedMethod).name} - Modules disponibles
          </h2>

          {selectedMethod.modules.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Modules en cours de création</p>
              <p className="text-sm">Revenez bientôt !</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedMethod.modules.map(module => {
                const translated = getTranslatedModule(module);
                const isAccessible = module.level.number <= currentLevel + 1;
                const isCompleted = false; // TODO: Vérifier la progression de l'utilisateur
                
                return (
                  <Card
                    key={module.id}
                    className={`p-4 transition-all ${
                      isAccessible 
                        ? "hover:shadow-md cursor-pointer" 
                        : "opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        isCompleted 
                          ? "bg-green-100 text-green-600" 
                          : isAccessible 
                            ? "bg-blue-100 text-blue-600" 
                            : "bg-gray-100 text-gray-400"
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : isAccessible ? (
                          <Play className="h-5 w-5" />
                        ) : (
                          <Lock className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{translated.title}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            module.level.number <= currentLevel 
                              ? "bg-green-100 text-green-700" 
                              : "bg-blue-100 text-blue-700"
                          }`}>
                            Niv. {module.level.number}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {translated.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {module.duration} min
                          </span>
                          <span className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star
                                key={star}
                                className={`h-3 w-3 ${
                                  star <= module.difficulty 
                                    ? "text-yellow-400 fill-yellow-400" 
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
