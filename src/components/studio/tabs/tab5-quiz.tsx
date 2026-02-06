"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui";
import { ClipboardCheck, CheckCircle, XCircle, ArrowRight, Trophy, Play } from "lucide-react";
import { getLevelIcon, LEVELS } from "@/lib/levels";

interface Tab5QuizProps {
  siteId: string;
  isStudioMode: boolean;
  personId?: string;
  currentLevel?: number;
}

interface LevelScaleProps {
  onStartQuiz?: (level: number) => void;
  selectedLevel?: number | null;
}

// Composant échelle des niveaux
function LevelScale({ onStartQuiz, selectedLevel }: LevelScaleProps) {
  const [hoveredLevel, setHoveredLevel] = useState<number | null>(null);

  return (
    <div className="w-56 h-full bg-gray-50 dark:bg-gray-900 border-r overflow-y-auto overflow-x-hidden flex-shrink-0">
      <div className="p-2">
        <h3 className="text-sm font-semibold mb-2 text-center text-gray-600 dark:text-gray-400">
          Échelle des niveaux
        </h3>
        <div className="space-y-0.5">
          {LEVELS.map((level) => (
            <div
              key={level.number}
              className="relative"
              onMouseEnter={() => setHoveredLevel(level.number)}
              onMouseLeave={() => setHoveredLevel(null)}
            >
              <div 
                className={`flex items-center gap-1.5 p-1.5 rounded-lg transition-colors ${
                  selectedLevel === level.number
                    ? "bg-blue-200 dark:bg-blue-800"
                    : hoveredLevel === level.number 
                    ? "bg-blue-100 dark:bg-blue-900/30" 
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                } ${onStartQuiz ? "cursor-pointer" : "cursor-help"}`}
                onDoubleClick={() => onStartQuiz?.(level.number)}
              >
                <span className="w-4 text-[10px] font-bold text-gray-500 text-right flex-shrink-0">
                  {level.number}
                </span>
                <span className="flex-shrink-0">
                  {getLevelIcon(level.number, "h-4 w-4")}
                </span>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className="text-[10px] font-medium truncate leading-tight">
                    {level.name}
                  </p>
                  <p className="text-[8px] text-gray-500 truncate leading-tight">
                    {level.seriousGaming}
                  </p>
                </div>
              </div>
              
              {/* Tooltip avec description */}
              {hoveredLevel === level.number && (
                <div className="absolute left-full top-0 ml-2 z-50 w-72 p-3 bg-gray-900 text-white rounded-lg shadow-xl pointer-events-none">
                  <p className="text-xs font-semibold mb-1">
                    Niveau {level.number} - {level.name}
                  </p>
                  <p className="text-[10px] text-gray-300 mb-2 italic">
                    {level.seriousGaming}
                  </p>
                  <p className="text-[10px] leading-relaxed">
                    {level.description}
                  </p>
                  {onStartQuiz && (
                    <p className="text-[9px] text-blue-300 mt-2 flex items-center gap-1">
                      <Play className="h-3 w-3" />
                      Double-cliquez pour lancer le quizz
                    </p>
                  )}
                  <div className="absolute right-full top-3 border-8 border-transparent border-r-gray-900" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
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
  const [targetLevel, setTargetLevel] = useState<number | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);

  const startQuiz = async (level?: number) => {
    const levelToUse = level ?? currentLevel + 1;
    setTargetLevel(levelToUse);
    setIsLoading(true);
    setQuizFinished(false);
    try {
      const res = await fetch(`/api/sites/${siteId}/quiz/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personId, targetLevel: levelToUse }),
      });
      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setCurrentQuiz(data.questions);
        setCurrentQuestionIndex(0);
        setScore(0);
        setSelectedAnswers([]);
        setShowResult(false);
      } else {
        // Pas de questions disponibles pour ce niveau
        setCurrentQuiz([]);
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
      setQuizFinished(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuiz(null);
    setTargetLevel(null);
    setQuizFinished(false);
    setScore(0);
  };

  // Rendu du contenu du quizz (partie droite)
  const renderQuizContent = () => {
    // Aucun niveau sélectionné
    if (targetLevel === null && !currentQuiz) {
      return (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center text-gray-500">
            <ClipboardCheck className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">Sélectionnez un niveau</h3>
            <p className="text-sm">Double-cliquez sur un niveau à gauche pour lancer le quizz correspondant</p>
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-left max-w-md mx-auto">
              <p className="text-sm font-medium mb-2">Règles :</p>
              <ul className="text-xs space-y-1">
                <li>• 20 questions par niveau</li>
                <li>• 10 bonnes réponses minimum pour valider</li>
                <li>• 1 à 4 réponses possibles par question</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    // Chargement
    if (isLoading) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-500">Chargement du quizz niveau {targetLevel}...</p>
          </div>
        </div>
      );
    }

    // Pas de questions disponibles
    if (currentQuiz && currentQuiz.length === 0) {
      return (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center text-gray-500">
            <XCircle className="h-16 w-16 mx-auto mb-4 text-orange-400" />
            <h3 className="text-lg font-medium mb-2">Aucune question disponible</h3>
            <p className="text-sm mb-4">Il n&apos;y a pas encore de questions pour le niveau {targetLevel}</p>
            <Button variant="outline" onClick={resetQuiz}>
              Choisir un autre niveau
            </Button>
          </div>
        </div>
      );
    }

    // Quiz terminé
    if (quizFinished && currentQuiz) {
      const passed = score >= 10;
      return (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            {passed ? (
              <Trophy className="h-20 w-20 mx-auto mb-4 text-yellow-500" />
            ) : (
              <XCircle className="h-20 w-20 mx-auto mb-4 text-red-400" />
            )}
            <h3 className="text-2xl font-bold mb-2">
              {passed ? "Félicitations !" : "Dommage..."}
            </h3>
            <p className="text-4xl font-bold mb-4">
              {score} / {currentQuiz.length}
            </p>
            <p className={`text-lg mb-6 ${passed ? "text-green-600" : "text-red-600"}`}>
              {passed 
                ? `Niveau ${targetLevel} validé !` 
                : `Il faut 10/20 minimum pour valider le niveau ${targetLevel}`
              }
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={resetQuiz}>
                Choisir un autre niveau
              </Button>
              {!passed && (
                <Button onClick={() => startQuiz(targetLevel!)}>
                  Réessayer
                </Button>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Quiz en cours
    if (currentQuiz && currentQuiz.length > 0) {
      const currentQuestion = currentQuiz[currentQuestionIndex];
      return (
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Quizz Niveau {targetLevel}</h3>
              <Button variant="ghost" size="sm" onClick={resetQuiz}>
                Abandonner
              </Button>
            </div>

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
        </div>
      );
    }

    return null;
  };

  if (isStudioMode) {
    return (
      <div className="flex h-[calc(100vh-220px)] min-h-[500px] border rounded-lg overflow-hidden">
        {/* Échelle des niveaux à gauche */}
        <LevelScale onStartQuiz={startQuiz} selectedLevel={targetLevel} />
        
        {/* Contenu principal - Quizz */}
        {renderQuizContent()}
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
            <Button size="lg" onClick={() => startQuiz()} isLoading={isLoading}>
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
