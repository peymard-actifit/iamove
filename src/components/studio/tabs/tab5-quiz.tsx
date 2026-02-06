"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui";
import { ClipboardCheck, CheckCircle, XCircle, ArrowRight, Trophy } from "lucide-react";

interface Tab5QuizProps {
  siteId: string;
  isStudioMode: boolean;
  personId?: string;
  currentLevel?: number;
}

interface QuizQuestion {
  id: string;
  question: string;
  answers: { text: string; isCorrect: boolean }[];
}

export function Tab5Quiz({ siteId, isStudioMode, personId, currentLevel = 0 }: Tab5QuizProps) {
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion[] | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const startQuiz = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/sites/${siteId}/quiz/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personId, targetLevel: currentLevel + 1 }),
      });
      const data = await res.json();
      if (data.questions) {
        setCurrentQuiz(data.questions);
        setCurrentQuestionIndex(0);
        setScore(0);
        setSelectedAnswers([]);
        setShowResult(false);
      }
    } catch (error) {
      console.error("Quiz error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAnswer = (index: number) => {
    if (showResult) return;
    setSelectedAnswers((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  const validateAnswer = () => {
    if (!currentQuiz) return;
    
    const question = currentQuiz[currentQuestionIndex];
    const correctAnswers = question.answers
      .map((a, i) => (a.isCorrect ? i : -1))
      .filter((i) => i !== -1);
    
    const isAnswerCorrect =
      selectedAnswers.length === correctAnswers.length &&
      selectedAnswers.every((i) => correctAnswers.includes(i));

    setIsCorrect(isAnswerCorrect);
    setShowResult(true);
    
    if (isAnswerCorrect) {
      setScore((prev) => prev + 1);
    }

    // Sauvegarder la réponse
    fetch(`/api/sites/${siteId}/quiz/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        personId,
        questionId: question.id,
        selectedAnswers,
        isCorrect: isAnswerCorrect,
      }),
    });
  };

  const nextQuestion = () => {
    if (!currentQuiz) return;
    
    if (currentQuestionIndex < currentQuiz.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswers([]);
      setShowResult(false);
    } else {
      // Fin du quiz
      setCurrentQuiz(null);
    }
  };

  if (isStudioMode) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Évaluation</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-green-500" />
              Aperçu du module d&apos;évaluation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">
              Dans cet onglet, les utilisateurs du site publié pourront passer des quizz 
              pour valider leurs niveaux de compétences IA.
            </p>
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Règles :</strong>
              </p>
              <ul className="mt-2 text-sm text-gray-500 space-y-1">
                <li>• 20 questions par niveau</li>
                <li>• 10 bonnes réponses pour valider un niveau</li>
                <li>• Questions non répétées (nouvelles à chaque passage)</li>
                <li>• 1 à 4 réponses possibles par question</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mode site publié
  if (!currentQuiz) {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center">
          <Trophy className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Évaluation des compétences IA</h2>
          <p className="text-gray-500 mb-6">
            Testez vos connaissances et validez le niveau {currentLevel + 1}
          </p>
          
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg inline-block">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Votre niveau actuel : <strong>Niveau {currentLevel}</strong>
            </p>
          </div>

          <div className="space-y-4">
            <Button size="lg" onClick={startQuiz} isLoading={isLoading}>
              Commencer le quiz
            </Button>
            <p className="text-xs text-gray-400">
              20 questions • 10 bonnes réponses requises pour valider
            </p>
          </div>

          {score > 0 && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm">
                Dernier score : <strong>{score}/20</strong>
                {score >= 10 ? (
                  <span className="text-green-600 ml-2">✓ Niveau validé !</span>
                ) : (
                  <span className="text-orange-600 ml-2">Encore {10 - score} points nécessaires</span>
                )}
              </p>
            </div>
          )}
        </Card>
      </div>
    );
  }

  const currentQuestion = currentQuiz[currentQuestionIndex];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>Question {currentQuestionIndex + 1} / {currentQuiz.length}</span>
        <span>Score : {score} / {currentQuestionIndex + (showResult ? 1 : 0)}</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all"
          style={{ width: `${((currentQuestionIndex + 1) / currentQuiz.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{currentQuestion.question}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentQuestion.answers.map((answer, index) => (
            <button
              key={index}
              onClick={() => toggleAnswer(index)}
              disabled={showResult}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                showResult
                  ? answer.isCorrect
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                    : selectedAnswers.includes(index)
                    ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                    : "border-gray-200 dark:border-gray-700"
                  : selectedAnswers.includes(index)
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{answer.text}</span>
                {showResult && answer.isCorrect && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                {showResult && selectedAnswers.includes(index) && !answer.isCorrect && (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        {!showResult ? (
          <Button
            onClick={validateAnswer}
            disabled={selectedAnswers.length === 0}
          >
            Valider ma réponse
          </Button>
        ) : (
          <Button onClick={nextQuestion}>
            {currentQuestionIndex < currentQuiz.length - 1 ? (
              <>
                Question suivante
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            ) : (
              "Voir les résultats"
            )}
          </Button>
        )}
      </div>

      {/* Feedback */}
      {showResult && (
        <Card className={`p-4 ${isCorrect ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"}`}>
          <div className="flex items-center gap-3">
            {isCorrect ? (
              <>
                <CheckCircle className="h-6 w-6 text-green-500" />
                <span className="font-medium text-green-700 dark:text-green-300">
                  Bonne réponse !
                </span>
              </>
            ) : (
              <>
                <XCircle className="h-6 w-6 text-red-500" />
                <span className="font-medium text-red-700 dark:text-red-300">
                  Mauvaise réponse
                </span>
              </>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
