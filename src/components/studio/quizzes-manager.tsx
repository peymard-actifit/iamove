"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Input,
  Card,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Flag,
} from "@/components/ui";
import { Plus, Trash2, Edit, Search, ChevronUp, ChevronDown, Upload, Sparkles, Loader2 } from "lucide-react";
import { QuizImportDialog } from "./quiz-import-dialog";
import { useI18n, SUPPORTED_LANGUAGES } from "@/lib/i18n";

interface Level {
  id: string;
  number: number;
  name: string;
}

interface QuizTranslation {
  language: string;
  question: string;
  answers: unknown;
}

interface Quiz {
  id: string;
  question: string;
  answers: unknown; // JsonValue from Prisma
  levelId: string;
  level: Level;
  category: string | null;
  isActive: boolean;
  createdBy: { name: string };
  translations?: QuizTranslation[];
}

type QuizAnswer = { text: string; isCorrect: boolean };

interface QuizzesManagerProps {
  levels: Level[];
  initialQuizzes: Quiz[];
  userId: string;
  showCreateDialog?: boolean;
  onShowCreateDialogChange?: (show: boolean) => void;
}

export function QuizzesManager({ 
  levels, 
  initialQuizzes, 
  userId,
  showCreateDialog: externalShowDialog,
  onShowCreateDialogChange,
}: QuizzesManagerProps) {
  const router = useRouter();
  const { language: globalLanguage, languageInfo } = useI18n();
  const [quizzes, setQuizzes] = useState(initialQuizzes);
  const [internalShowDialog, setInternalShowDialog] = useState(false);
  
  // Utiliser le state externe si fourni, sinon le state interne
  const showCreateDialog = externalShowDialog !== undefined ? externalShowDialog : internalShowDialog;
  const setShowCreateDialog = onShowCreateDialogChange || setInternalShowDialog;
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState<string>("");
  const [sortField, setSortField] = useState<"question" | "level" | "category">("level");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showImportDialog, setShowImportDialog] = useState(false);
  
  // État pour le sélecteur de langue dans la gestion des quizz
  const [displayLanguage, setDisplayLanguage] = useState(globalLanguage);
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);
  
  // État pour la génération de questions
  const [generatingLevel, setGeneratingLevel] = useState<number | null>(null);

  // Premier niveau valide pour les quizz (niveau 1, pas 0)
  const firstValidLevel = levels.find((l) => l.number >= 1);
  
  const [formData, setFormData] = useState({
    question: "",
    levelId: firstValidLevel?.id || "",
    category: "",
    answers: [
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ],
  });

  const resetForm = () => {
    setFormData({
      question: "",
      levelId: firstValidLevel?.id || "",
      category: "",
      answers: [
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ],
    });
    setEditingQuiz(null);
  };

  const handleSubmit = async () => {
    if (!formData.question.trim()) return;
    
    const validAnswers = formData.answers.filter((a) => a.text.trim());
    if (validAnswers.length < 2) {
      alert("Au moins 2 réponses sont requises");
      return;
    }
    
    if (!validAnswers.some((a) => a.isCorrect)) {
      alert("Au moins une réponse doit être correcte");
      return;
    }

    setIsLoading(true);

    try {
      const url = editingQuiz
        ? `/api/quizzes/${editingQuiz.id}`
        : "/api/quizzes";
      
      const res = await fetch(url, {
        method: editingQuiz ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          answers: validAnswers,
        }),
      });

      if (res.ok) {
        setShowCreateDialog(false);
        resetForm();
        router.refresh();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (quizId: string) => {
    if (!confirm("Supprimer cette question ?")) return;
    
    await fetch(`/api/quizzes/${quizId}`, { method: "DELETE" });
    router.refresh();
  };

  const handleEdit = (quiz: Quiz) => {
    const quizAnswers = (quiz.answers as QuizAnswer[]) || [];
    setFormData({
      question: quiz.question,
      levelId: quiz.levelId,
      category: quiz.category || "",
      answers: [
        ...quizAnswers,
        ...Array(4 - quizAnswers.length).fill({ text: "", isCorrect: false }),
      ].slice(0, 4),
    });
    setEditingQuiz(quiz);
    setShowCreateDialog(true);
  };

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Obtenir le texte traduit d'une question
  const getTranslatedQuestion = (quiz: Quiz): string => {
    if (displayLanguage === "FR" || !quiz.translations) {
      return quiz.question;
    }
    const translation = quiz.translations.find(t => t.language === displayLanguage);
    return translation?.question || quiz.question;
  };

  // Obtenir les réponses traduites
  const getTranslatedAnswers = (quiz: Quiz): QuizAnswer[] => {
    const originalAnswers = quiz.answers as QuizAnswer[];
    if (displayLanguage === "FR" || !quiz.translations) {
      return originalAnswers;
    }
    const translation = quiz.translations.find(t => t.language === displayLanguage);
    return (translation?.answers as QuizAnswer[]) || originalAnswers;
  };

  // Générer des questions avec l'IA
  const generateQuestions = async (levelNumber: number, count: number) => {
    setGeneratingLevel(levelNumber);
    try {
      const res = await fetch("/api/quizzes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ levelNumber, count }),
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        router.refresh();
        // Montrer une notification de succès
        alert(`${data.created} question(s) créée(s) et traduite(s) en 26 langues !`);
      } else {
        alert(`Erreur: ${data.error || "Échec de la génération"}`);
      }
    } catch (error) {
      console.error("Erreur génération:", error);
      alert("Erreur lors de la génération des questions");
    } finally {
      setGeneratingLevel(null);
    }
  };

  const filteredQuizzes = quizzes
    .filter((q) => {
      const matchesSearch = q.question.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLevel = !filterLevel || q.levelId === filterLevel;
      return matchesSearch && matchesLevel;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === "question") {
        comparison = a.question.localeCompare(b.question);
      } else if (sortField === "level") {
        comparison = a.level.number - b.level.number;
      } else if (sortField === "category") {
        comparison = (a.category || "").localeCompare(b.category || "");
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

  const SortIcon = ({ field }: { field: typeof sortField }) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher une question..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          className="h-10 px-3 rounded-md border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900"
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
        >
          <option value="">Tous les niveaux</option>
          {levels.filter((l) => l.number >= 1).map((level) => (
            <option key={level.id} value={level.id}>
              Niv. {level.number} - {level.name}
            </option>
          ))}
        </select>
        
        {/* Sélecteur de langue pour voir les traductions */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowLanguageDialog(true)}
          className="px-2 h-10"
          title="Changer la langue d'affichage des questions"
        >
          <Flag countryCode={SUPPORTED_LANGUAGES.find(l => l.code === displayLanguage)?.countryCode || "fr"} size="md" />
          <span className="ml-2 text-xs">{displayLanguage}</span>
        </Button>
        
        {/* Bouton Import à droite */}
        <div className="flex-1 flex justify-end">
          <Button
            variant="outline"
            onClick={() => setShowImportDialog(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Importer
          </Button>
        </div>
      </div>

      {/* Stats - Bandeau fixe des 20 niveaux */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-950 py-2 -mx-4 px-4 border-b">
        <div className="flex gap-1 overflow-x-auto pb-1">
          {levels.filter((l) => l.number >= 1).map((level) => {
            const count = quizzes.filter((q) => q.levelId === level.id).length;
            const isGenerating = generatingLevel === level.number;
            return (
              <div 
                key={level.id} 
                className={`flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded border cursor-pointer transition-colors ${
                  filterLevel === level.id 
                    ? "bg-blue-100 dark:bg-blue-900 border-blue-500" 
                    : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                onClick={() => setFilterLevel(filterLevel === level.id ? "" : level.id)}
                title={`Niv. ${level.number} - ${level.name} - ${count} question(s)`}
              >
                <span className="text-xs font-medium w-4 text-center">{level.number}</span>
                <span className="text-sm font-bold min-w-[24px] text-center">{count}</span>
                
                {/* Boutons de génération IA - compacts */}
                <div className="flex gap-0.5 ml-1 border-l pl-1 border-gray-300 dark:border-gray-600">
                  <button
                    className="text-[9px] px-1 py-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      generateQuestions(level.number, 1);
                    }}
                    disabled={isGenerating}
                    title="Générer 1 question avec l'IA"
                  >
                    {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Sparkles className="h-2.5 w-2.5 inline" />+1</>}
                  </button>
                  <button
                    className="text-[9px] px-1 py-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      generateQuestions(level.number, 10);
                    }}
                    disabled={isGenerating}
                    title="Générer 10 questions avec l'IA"
                  >
                    {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Sparkles className="h-2.5 w-2.5 inline" />+10</>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead
                className="cursor-pointer w-24"
                onClick={() => toggleSort("level")}
              >
                <div className="flex items-center gap-2">
                  Niveau
                  <SortIcon field="level" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => toggleSort("question")}
              >
                <div className="flex items-center gap-2">
                  Question
                  <SortIcon field="question" />
                </div>
              </TableHead>
              <TableHead className="w-64">Réponses</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuizzes.map((quiz, index) => {
              return (
                <TableRow key={quiz.id}>
                  <TableCell className="font-mono text-gray-500">{index + 1}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                      Niv. {quiz.level.number}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <p className="truncate font-medium">{getTranslatedQuestion(quiz)}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {getTranslatedAnswers(quiz)?.map((a, i) => (
                        <span
                          key={i}
                          className={`px-1.5 py-0.5 rounded text-[10px] ${
                            a.isCorrect
                              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                              : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                          }`}
                          title={a.text}
                        >
                          R{i + 1}:{a.isCorrect ? "✓" : "✗"}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(quiz)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(quiz.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingQuiz ? "Modifier la question" : "Nouvelle question"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4 max-h-[60vh] overflow-auto">
            <div className="space-y-2">
              <label className="text-sm font-medium">Question *</label>
              <textarea
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
                rows={3}
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                placeholder="Entrez la question..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Niveau cible (1-20) *</label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900"
                  value={formData.levelId}
                  onChange={(e) => setFormData({ ...formData, levelId: e.target.value })}
                >
                  {levels.filter((l) => l.number >= 1).map((level) => (
                    <option key={level.id} value={level.id}>
                      Niv. {level.number} - {level.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Catégorie</label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Ex: Prompt Engineering"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Réponses (cochez les bonnes)</label>
              {formData.answers.map((answer, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={answer.isCorrect}
                    onChange={(e) => {
                      const newAnswers = [...formData.answers];
                      newAnswers[index] = { ...answer, isCorrect: e.target.checked };
                      setFormData({ ...formData, answers: newAnswers });
                    }}
                    className="h-5 w-5 rounded"
                  />
                  <Input
                    value={answer.text}
                    onChange={(e) => {
                      const newAnswers = [...formData.answers];
                      newAnswers[index] = { ...answer, text: e.target.value };
                      setFormData({ ...formData, answers: newAnswers });
                    }}
                    placeholder={`Réponse ${index + 1}`}
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleSubmit} isLoading={isLoading}>
              {editingQuiz ? "Modifier" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Import Quizz */}
      <QuizImportDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
      />

      {/* Dialog Sélection de langue */}
      <Dialog open={showLanguageDialog} onOpenChange={setShowLanguageDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-center">
              Langue d&apos;affichage des questions
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500 text-center mb-4">
            Sélectionnez une langue pour voir les questions traduites
          </p>
          <div className="grid grid-cols-6 gap-3 py-4">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setDisplayLanguage(lang.code);
                  setShowLanguageDialog(false);
                }}
                className={`
                  flex items-center justify-center p-2 rounded-lg transition-all
                  hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105
                  ${displayLanguage === lang.code 
                    ? "bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500 scale-105" 
                    : "bg-gray-50 dark:bg-gray-900"
                  }
                `}
                title={lang.nativeName}
              >
                <Flag countryCode={lang.countryCode} size="xl" />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
