"use client";

import { useState, useEffect } from "react";
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
} from "@/components/ui";
import { Plus, Trash2, Edit, Search, ChevronUp, ChevronDown, Upload, Sparkles, Loader2 } from "lucide-react";
import { QuizImportDialog } from "./quiz-import-dialog";
import { useI18n } from "@/lib/i18n";

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
  const { language: globalLanguage, t } = useI18n();
  const [quizzes, setQuizzes] = useState(initialQuizzes);
  const [internalShowDialog, setInternalShowDialog] = useState(false);
  
  // Synchroniser quizzes quand initialQuizzes change (après router.refresh())
  useEffect(() => {
    setQuizzes(initialQuizzes);
  }, [initialQuizzes]);
  
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
      alert(t.quiz.atLeast2Answers);
      return;
    }
    
    if (!validAnswers.some((a) => a.isCorrect)) {
      alert(t.quiz.atLeast1Correct);
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
    if (!confirm(t.quiz.deleteConfirm)) return;
    
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

  // Obtenir le texte traduit d'une question (utilise la langue globale)
  const getTranslatedQuestion = (quiz: Quiz): string => {
    const lang = globalLanguage.toUpperCase();
    if (lang === "FR" || !quiz.translations || quiz.translations.length === 0) {
      return quiz.question;
    }
    const translation = quiz.translations.find(t => t.language === lang);
    return translation?.question || quiz.question;
  };

  // Obtenir les réponses traduites (utilise la langue globale)
  const getTranslatedAnswers = (quiz: Quiz): QuizAnswer[] => {
    const originalAnswers = quiz.answers as QuizAnswer[];
    const lang = globalLanguage.toUpperCase();
    if (lang === "FR" || !quiz.translations || quiz.translations.length === 0) {
      return originalAnswers;
    }
    const translation = quiz.translations.find(t => t.language === lang);
    return (translation?.answers as QuizAnswer[]) || originalAnswers;
  };

  // Générer des questions avec l'IA
  const generateQuestions = async (levelNumber: number, count: number) => {
    setGeneratingLevel(levelNumber);
    try {
      const res = await fetch("/api/quizzes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ levelNumber, count }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("Erreur API:", res.status, errorData);
        alert(`Erreur ${res.status}: ${errorData.error || "Échec de la génération"}`);
        return;
      }
      
      const data = await res.json();
      
      if (data.success) {
        router.refresh();
        alert(`${data.created} ${t.quiz.generateSuccess}`);
      } else {
        alert(`${t.common.error}: ${data.error || t.quiz.generateError}`);
      }
    } catch (error) {
      console.error("Erreur génération:", error);
      alert(t.quiz.generateError);
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
    <div className="space-y-0">
      {/* Bandeaux fixes : Recherche + Niveaux */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-950 -mx-4 px-4 pb-2 border-b shadow-sm">
        {/* Toolbar - Hauteur réduite */}
        <div className="flex flex-row gap-2 items-center py-1.5">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              placeholder={t.quiz.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>
          <select
            className="h-8 px-2 text-sm rounded-md border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900"
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
          >
            <option value="">{t.quiz.allLevels}</option>
            {levels.filter((l) => l.number >= 1).map((level) => (
              <option key={level.id} value={level.id}>
                N{level.number} - {level.name}
              </option>
            ))}
          </select>
          
          {/* Bouton Import à droite */}
          <div className="flex-1 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowImportDialog(true)}
              className="h-8"
            >
              <Upload className="h-3.5 w-3.5 mr-1.5" />
              {t.quiz.import}
            </Button>
          </div>
        </div>

        {/* Niveaux - 20 sur une seule ligne */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-md p-1.5 bg-gray-50 dark:bg-gray-900 mt-1">
          <div className="flex gap-1">
            {levels.filter((l) => l.number >= 1).map((level) => {
              const count = quizzes.filter((q) => q.levelId === level.id).length;
              const isGenerating = generatingLevel === level.number;
              return (
                <div 
                  key={level.id} 
                  className={`flex-1 min-w-0 flex flex-col p-1 rounded border transition-all ${
                    filterLevel === level.id 
                      ? "bg-blue-100 dark:bg-blue-900 border-blue-500" 
                      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300"
                  }`}
                >
                  {/* Ligne du haut: numéro et nombre */}
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setFilterLevel(filterLevel === level.id ? "" : level.id)}
                    title={`${level.name} - ${count} questions`}
                  >
                    <span className="text-[8px] font-bold text-gray-600 dark:text-gray-400">{level.number}</span>
                    <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400">{count}</span>
                  </div>
                  
                  {/* Boutons +1 +10 */}
                  <div className="flex gap-0.5 justify-center mt-0.5">
                    <button
                      className="px-1 py-0 text-[7px] font-medium rounded border border-green-400 bg-green-50 dark:bg-green-900/50 text-green-700 dark:text-green-300 hover:bg-green-100 disabled:opacity-50"
                      onClick={(e) => { e.stopPropagation(); generateQuestions(level.number, 1); }}
                      disabled={isGenerating}
                      title={t.quiz.generate1}
                    >
                      {isGenerating ? "..." : "+1"}
                    </button>
                    <button
                      className="px-1 py-0 text-[7px] font-medium rounded border border-purple-400 bg-purple-50 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 hover:bg-purple-100 disabled:opacity-50"
                      onClick={(e) => { e.stopPropagation(); generateQuestions(level.number, 10); }}
                      disabled={isGenerating}
                      title={t.quiz.generate10}
                    >
                      {isGenerating ? "..." : "+10"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Table - avec marge pour le contenu scrollable */}
      <Card className="mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead
                className="cursor-pointer w-24"
                onClick={() => toggleSort("level")}
              >
                <div className="flex items-center gap-2">
                  {t.levels.level}
                  <SortIcon field="level" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => toggleSort("question")}
              >
                <div className="flex items-center gap-2">
                  {t.quiz.question}
                  <SortIcon field="question" />
                </div>
              </TableHead>
              <TableHead className="w-64">{t.quiz.answers}</TableHead>
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
                      {t.quiz.levelLabel} {quiz.level.number}
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
              {editingQuiz ? t.quiz.editQuestion : t.quiz.createQuestion}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4 max-h-[60vh] overflow-auto">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t.quiz.questionLabel} *</label>
              <textarea
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
                rows={3}
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                placeholder={t.quiz.searchPlaceholder}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t.quiz.targetLevel} *</label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900"
                  value={formData.levelId}
                  onChange={(e) => setFormData({ ...formData, levelId: e.target.value })}
                >
                  {levels.filter((l) => l.number >= 1).map((level) => (
                    <option key={level.id} value={level.id}>
                      {t.quiz.levelLabel} {level.number} - {level.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t.quiz.category}</label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Ex: Prompt Engineering"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">{t.quiz.answersCheckCorrect}</label>
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
                    placeholder={`${t.quiz.answerPlaceholder} ${index + 1}`}
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleSubmit} isLoading={isLoading}>
              {editingQuiz ? t.common.edit : t.common.add}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Import Quizz */}
      <QuizImportDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
      />

    </div>
  );
}
