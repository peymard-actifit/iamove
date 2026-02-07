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
} from "@/components/ui";
import { Plus, Trash2, Edit, Search, ChevronUp, ChevronDown } from "lucide-react";

interface Level {
  id: string;
  number: number;
  name: string;
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

  const [formData, setFormData] = useState({
    question: "",
    levelId: levels[0]?.id || "",
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
      levelId: levels[0]?.id || "",
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
          {levels.map((level) => (
            <option key={level.id} value={level.id}>
              {level.name}
            </option>
          ))}
        </select>
      </div>

      {/* Stats - Tuiles compactes pour 21 niveaux */}
      <div className="grid grid-cols-7 sm:grid-cols-11 lg:grid-cols-21 gap-1.5">
        {levels.map((level) => {
          const count = quizzes.filter((q) => q.levelId === level.id).length;
          return (
            <Card 
              key={level.id} 
              className={`p-1.5 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                filterLevel === level.id ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => setFilterLevel(filterLevel === level.id ? "" : level.id)}
              title={`${level.name} - ${count} question(s)`}
            >
              <p className="text-[10px] text-gray-500 truncate">{level.number}</p>
              <p className="text-sm font-bold">{count}</p>
            </Card>
          );
        })}
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
              const answers = quiz.answers as QuizAnswer[];
              return (
                <TableRow key={quiz.id}>
                  <TableCell className="font-mono text-gray-500">{index + 1}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                      Niv. {quiz.level.number}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <p className="truncate font-medium">{quiz.question}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {answers?.map((a, i) => (
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
                <label className="text-sm font-medium">Niveau *</label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900"
                  value={formData.levelId}
                  onChange={(e) => setFormData({ ...formData, levelId: e.target.value })}
                >
                  {levels.map((level) => (
                    <option key={level.id} value={level.id}>
                      {level.name}
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
    </div>
  );
}
