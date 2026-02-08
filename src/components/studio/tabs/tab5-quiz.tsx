"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui";
import { ClipboardCheck, CheckCircle, XCircle, ArrowRight, Trophy, Play, PartyPopper } from "lucide-react";
import { getLevelIcon, LEVELS } from "@/lib/levels";
import { useI18n } from "@/lib/i18n";

// Limite de bonnes réponses pour valider un niveau
const PASSING_SCORE = 15;
const TOTAL_QUESTIONS = 20;
const MAX_ERRORS = TOTAL_QUESTIONS - PASSING_SCORE; // 5 erreurs max = échec certain à 6

interface LevelTranslation {
  id: string;
  language: string;
  name: string;
  category: string;
  seriousGaming: string;
  description: string;
}

interface LevelWithTranslations {
  id: string;
  number: number;
  name: string;
  category?: string;
  seriousGaming?: string;
  description?: string;
  translations?: LevelTranslation[];
}

interface Tab5QuizProps {
  siteId: string;
  isStudioMode: boolean;
  personId?: string;
  currentLevel?: number;
  /** En mode publié : niveaux avec traductions pour afficher l'échelle dans la langue sélectionnée */
  levelsWithTranslations?: LevelWithTranslations[];
}

interface LevelScaleProps {
  onStartQuiz?: (level: number) => void;
  selectedLevel?: number | null;
  /** En mode publié : niveaux 1 à maxAllowedLevel (inclus) sont jouables. Non défini = studio, tous les niveaux 1-20. */
  maxAllowedLevel?: number;
  /** Niveaux avec traductions + langue pour afficher noms/catégories traduits (mode publié) */
  levelsWithTranslations?: LevelWithTranslations[];
  language?: string;
}

function getCategoryStyleIndex(levelNumber: number): number {
  if (levelNumber <= 3) return 0;
  if (levelNumber <= 9) return 1;
  if (levelNumber <= 15) return 2;
  return 3;
}

function getLevelDisplayForScale(
  levelNumber: number,
  levels: LevelWithTranslations[] | undefined,
  language: string
): { name: string; category: string; seriousGaming: string; description: string } {
  if (!levels?.length) {
    const info = LEVELS[levelNumber] ?? LEVELS[0];
    return { name: info.name, category: info.category, seriousGaming: info.seriousGaming, description: info.description };
  }
  const level = levels.find((l) => l.number === levelNumber);
  if (!level) {
    const info = LEVELS[levelNumber] ?? LEVELS[0];
    return { name: info.name, category: info.category, seriousGaming: info.seriousGaming, description: info.description };
  }
  const lang = language?.toUpperCase() || "FR";
  const tr = level.translations?.find((x) => x.language.toUpperCase() === lang);
  if (tr) return { name: tr.name, category: tr.category, seriousGaming: tr.seriousGaming, description: tr.description };
  return {
    name: level.name,
    category: level.category || "",
    seriousGaming: level.seriousGaming || "",
    description: level.description || "",
  };
}

// Composant échelle des niveaux
function LevelScale({ onStartQuiz, selectedLevel, maxAllowedLevel, levelsWithTranslations, language }: LevelScaleProps) {
  const { t, language: i18nLanguage } = useI18n();
  const [hoveredLevel, setHoveredLevel] = useState<number | null>(null);
  const lang = language ?? i18nLanguage ?? "FR";

  // En mode publié : jouable = niveau 1 à maxAllowedLevel (et niveau 0 toujours indisponible)
  const isLevelPlayable = (levelNum: number) => {
    if (levelNum === 0) return false;
    if (maxAllowedLevel === undefined) return true; // studio : tous les niveaux 1-20
    return levelNum <= maxAllowedLevel;
  };

  const getDisplayInfo = (levelNum: number) =>
    levelsWithTranslations?.length && lang
      ? { number: levelNum, ...getLevelDisplayForScale(levelNum, levelsWithTranslations, lang) }
      : (LEVELS[levelNum] ?? LEVELS[0]);

  const hoveredLevelInfo = hoveredLevel !== null ? getDisplayInfo(hoveredLevel) : null;

  return (
    <div className="w-56 h-full bg-gray-50 dark:bg-gray-900 border-r flex-shrink-0 flex flex-col">
      <div className="p-2 flex-shrink-0">
        <h3 className="text-sm font-semibold mb-2 text-center text-gray-600 dark:text-gray-400">
          {t.assessment.levelScaleTitle}
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        <div className="space-y-0.5">
          {LEVELS.map((level) => {
            const display = getDisplayInfo(level.number);
            const playable = isLevelPlayable(level.number);
            const disabled = level.number === 0 || (maxAllowedLevel !== undefined && level.number > maxAllowedLevel);
            return (
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
                } ${onStartQuiz && playable ? "cursor-pointer" : disabled ? "cursor-not-allowed opacity-60" : "cursor-help"}`}
                onDoubleClick={() => {
                  if (playable) {
                    onStartQuiz?.(level.number);
                  }
                }}
              >
                <span className="w-4 text-[10px] font-bold text-gray-500 text-right flex-shrink-0">
                  {level.number}
                </span>
                <span className="flex-shrink-0">
                  {getLevelIcon(level.number, "h-4 w-4")}
                </span>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className="text-[10px] font-medium truncate leading-tight">
                    {display.name}
                  </p>
                  <p className="text-[8px] text-gray-500 truncate leading-tight">
                    {display.seriousGaming}
                  </p>
                </div>
              </div>
            </div>
          );
          })}
        </div>
      </div>

      {/* Tooltip fixe en bas de la colonne */}
      {hoveredLevelInfo && (
        <div className="flex-shrink-0 p-2 border-t bg-gray-900 text-white">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
              getCategoryStyleIndex(hoveredLevelInfo.number) === 0 ? "bg-gray-600 text-gray-200" :
              getCategoryStyleIndex(hoveredLevelInfo.number) === 1 ? "bg-blue-600 text-blue-100" :
              getCategoryStyleIndex(hoveredLevelInfo.number) === 2 ? "bg-purple-600 text-purple-100" :
              "bg-orange-600 text-orange-100"
            }`}>
              {hoveredLevelInfo.category}
            </span>
            <span className="text-xs font-semibold">
              {t.assessment.level} {hoveredLevelInfo.number} - {hoveredLevelInfo.name}
            </span>
          </div>
          <p className="text-[10px] text-gray-300 mb-1 italic">
            {hoveredLevelInfo.seriousGaming}
          </p>
          <p className="text-[10px] leading-relaxed text-gray-200">
            {hoveredLevelInfo.description}
          </p>
          {onStartQuiz && isLevelPlayable(hoveredLevelInfo.number) && (
            <p className="text-[9px] text-blue-300 mt-2 flex items-center gap-1">
              <Play className="h-3 w-3" />
              {t.assessment.doubleClickToStartQuiz}
            </p>
          )}
          {onStartQuiz && hoveredLevelInfo.number === 0 && (
            <p className="text-[9px] text-gray-400 mt-2">
              {t.assessment.baseLevelNoQuiz}
            </p>
          )}
          {onStartQuiz && maxAllowedLevel !== undefined && hoveredLevelInfo.number > maxAllowedLevel && (
            <p className="text-[9px] text-gray-400 mt-2">
              {t.assessment.unlockLevelHint.replace("{n}", String(maxAllowedLevel))}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

interface QuizQuestion {
  id: string;
  question: string;
  answers: { text: string; isCorrect: boolean }[];
}

export function Tab5Quiz({ siteId, isStudioMode, personId, currentLevel = 0, levelsWithTranslations }: Tab5QuizProps) {
  const { language, t } = useI18n();
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion[] | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [targetLevel, setTargetLevel] = useState<number | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);
  const [passedEarly, setPassedEarly] = useState(false);
  const [failedEarly, setFailedEarly] = useState(false);
  const [errors, setErrors] = useState(0);
  const quizCompleteSentRef = useRef(false);
  // En mode publié : niveau de quiz choisi (1 à currentLevel+1), défaut = niveau cible
  const maxQuizLevel = Math.min(20, currentLevel + 1);
  const [selectedQuizLevel, setSelectedQuizLevel] = useState(maxQuizLevel);

  const startQuiz = async (level?: number) => {
    quizCompleteSentRef.current = false;
    const levelToUse = level ?? currentLevel + 1;
    setTargetLevel(levelToUse);
    setIsLoading(true);
    setQuizFinished(false);
    setPassedEarly(false);
    setFailedEarly(false);
    setErrors(0);
    try {
      const res = await fetch(`/api/sites/${siteId}/quiz/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personId, targetLevel: levelToUse, language }),
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
    
    const newScore = isAnswerCorrect ? score + 1 : score;
    const newErrors = isAnswerCorrect ? errors : errors + 1;
    
    if (isAnswerCorrect) {
      setScore(newScore);
    } else {
      setErrors(newErrors);
    }

    // Vérifier si le score de passage est atteint (15/20)
    if (newScore >= PASSING_SCORE) {
      setPassedEarly(true);
      setQuizFinished(true);
    }
    // Vérifier si l'échec est certain (plus de 5 erreurs = impossible d'atteindre 15/20)
    else if (newErrors > MAX_ERRORS) {
      setFailedEarly(true);
      setQuizFinished(true);
    }
    // Vérifier si c'est la dernière question
    else if (currentQuestionIndex >= currentQuiz.length - 1) {
      setQuizFinished(true);
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
    if (!currentQuiz || quizFinished) return;
    
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
    setPassedEarly(false);
    setFailedEarly(false);
    setScore(0);
    setErrors(0);
    quizCompleteSentRef.current = false;
  };

  // En mode publié : notifier la fin du quiz pour les PP (une fois par session quiz)
  useEffect(() => {
    if (
      !quizFinished ||
      !currentQuiz?.length ||
      targetLevel == null ||
      isStudioMode ||
      !personId ||
      !siteId ||
      quizCompleteSentRef.current
    ) {
      return;
    }
    quizCompleteSentRef.current = true;
    const passed = score >= PASSING_SCORE;
    fetch(`/api/sites/${siteId}/quiz/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ targetLevel, passed }),
    }).catch(() => {});
  }, [quizFinished, currentQuiz?.length, targetLevel, isStudioMode, personId, siteId, score]);

  // Rendu du contenu du quizz (partie droite)
  const renderQuizContent = () => {
    // Aucun niveau sélectionné
    if (targetLevel === null && !currentQuiz) {
      return (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center text-gray-500">
            <ClipboardCheck className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">{t.assessment.selectLevelTitle}</h3>
            <p className="text-sm">{t.assessment.doubleClickHint}</p>
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-left max-w-md mx-auto">
              <p className="text-sm font-medium mb-2">{t.assessment.rules}</p>
              <ul className="text-xs space-y-1">
                <li>• {t.assessment.rulesQuestions}</li>
                <li>• {t.assessment.rulesMinScore.replace("{n}", String(PASSING_SCORE))}</li>
                <li>• {t.assessment.rulesStopAt.replace("{n}", String(PASSING_SCORE))}</li>
                <li>• {t.assessment.rulesAnswers}</li>
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
            <p className="text-gray-500">{t.assessment.loading.replace("{level}", String(targetLevel))}</p>
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
            <h3 className="text-lg font-medium mb-2">{t.assessment.noQuestions}</h3>
            <p className="text-sm mb-4">{t.assessment.noQuestionsForLevel.replace("{level}", String(targetLevel))}</p>
            <Button variant="outline" onClick={resetQuiz}>
              {t.assessment.chooseOtherLevel}
            </Button>
          </div>
        </div>
      );
    }

    // Quiz terminé
    if (quizFinished && currentQuiz) {
      const passed = score >= PASSING_SCORE;
      const questionsAnswered = currentQuestionIndex + 1;
      return (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            {passed ? (
              <div className="relative">
                <Trophy className="h-20 w-20 mx-auto mb-4 text-yellow-500" />
                {passedEarly && (
                  <PartyPopper className="h-8 w-8 absolute -top-2 -right-2 text-purple-500 animate-bounce" />
                )}
              </div>
            ) : (
              <XCircle className="h-20 w-20 mx-auto mb-4 text-red-400" />
            )}
            <h3 className="text-2xl font-bold mb-2">
              {passed 
                ? (passedEarly ? t.assessment.congrats : t.assessment.felicitations) 
                : (failedEarly ? t.assessment.fail : t.assessment.dommage)}
            </h3>
            <p className="text-4xl font-bold mb-4">
              {score} / {questionsAnswered}
            {passedEarly && <span className="text-lg text-green-500 ml-2">({t.assessment.passingReached.replace("{n}", String(PASSING_SCORE))})</span>}
            {failedEarly && <span className="text-lg text-red-500 ml-2">({errors} {t.assessment.errorsLabel.replace(" :", "")})</span>}
            </p>
            {passedEarly && (
              <p className="text-lg mb-2 text-purple-600">
                {t.assessment.earlyReached.replace("{n}", String(PASSING_SCORE)).replace("{q}", String(questionsAnswered))}
              </p>
            )}
            {failedEarly && (
              <p className="text-lg mb-2 text-red-600">
                {t.assessment.earlyFail.replace("{n}", String(errors)).replace("{min}", String(PASSING_SCORE)).replace("{total}", String(TOTAL_QUESTIONS))}
              </p>
            )}
            <p className={`text-lg mb-6 ${passed ? "text-green-600" : "text-red-600"}`}>
              {passed 
                ? t.assessment.levelValidated.replace("{level}", String(targetLevel)) 
                : t.assessment.needToValidate.replace("{min}", String(PASSING_SCORE)).replace("{total}", String(TOTAL_QUESTIONS)).replace("{level}", String(targetLevel))
              }
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={resetQuiz}>
                {t.assessment.chooseOtherLevel}
              </Button>
              {!passed && (
                <Button onClick={() => startQuiz(targetLevel!)}>
                  {t.assessment.retry}
                </Button>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Quiz en cours (seulement si pas terminé)
    if (currentQuiz && currentQuiz.length > 0 && !quizFinished) {
      const currentQuestion = currentQuiz[currentQuestionIndex];
      return (
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t.assessment.quizLevel} {targetLevel}</h3>
              <Button variant="ghost" size="sm" onClick={resetQuiz}>
                {t.assessment.quit}
              </Button>
            </div>

            {/* Progress */}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{t.assessment.questionProgress} {currentQuestionIndex + 1} / {currentQuiz.length}</span>
              <span>{t.assessment.scoreLabel} {score} / {currentQuestionIndex + (showResult ? 1 : 0)}</span>
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
                  {t.assessment.validateAnswer}
                </Button>
              ) : (
                <Button onClick={nextQuestion}>
                  {currentQuestionIndex < currentQuiz.length - 1 && !quizFinished ? (
                    <>
                      {t.assessment.nextQuestion}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    t.assessment.seeResults
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
                        {t.assessment.correctAnswer}
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-6 w-6 text-red-500" />
                      <span className="font-medium text-red-700 dark:text-red-300">
                        {t.assessment.wrongAnswer}
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
        <LevelScale
          onStartQuiz={startQuiz}
          selectedLevel={targetLevel}
          maxAllowedLevel={isStudioMode ? undefined : Math.min(20, currentLevel + 1)}
          levelsWithTranslations={levelsWithTranslations}
          language={language}
        />
        
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
          <h2 className="text-2xl font-bold mb-2">{t.assessment.title}</h2>
          <p className="text-gray-500 mb-4">
            {t.assessment.subtitleValidate.replace("{level}", String(selectedQuizLevel))}
          </p>
          {/* Sélecteur de niveau : cliquer pour choisir le niveau du quiz (1 à currentLevel+1) */}
          <div className="mb-4 flex items-center justify-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600 dark:text-gray-400">{t.assessment.chooseQuizLevel}</span>
            <select
              value={selectedQuizLevel}
              onChange={(e) => setSelectedQuizLevel(Number(e.target.value))}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-base font-semibold cursor-pointer focus:ring-2 focus:ring-blue-500"
              title={t.assessment.clickToChooseLevel.replace("{max}", String(maxQuizLevel))}
            >
              {Array.from({ length: maxQuizLevel }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {t.assessment.level} {n}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg inline-block">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {t.assessment.yourCurrentLevel} <strong>{t.assessment.level} {currentLevel}</strong>
            </p>
          </div>

          <div className="space-y-4">
            <Button size="lg" onClick={() => startQuiz(selectedQuizLevel)} isLoading={isLoading}>
              {t.assessment.startQuiz}
            </Button>
            <p className="text-xs text-gray-400">
              {t.assessment.quizParams.replace("{n}", String(PASSING_SCORE))}
            </p>
          </div>

          {score > 0 && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm">
                {t.assessment.lastScore} <strong>{score}/20</strong>
                {score >= PASSING_SCORE ? (
                  <span className="text-green-600 ml-2">{t.assessment.levelValidatedShort}</span>
                ) : (
                  <span className="text-orange-600 ml-2">{t.assessment.pointsNeeded.replace("{n}", String(PASSING_SCORE - score))}</span>
                )}
              </p>
            </div>
          )}
        </Card>
      </div>
    );
  }

  // Quiz terminé - mode publié
  if (quizFinished) {
    const passed = score >= PASSING_SCORE;
    const questionsAnswered = currentQuestionIndex + 1;
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 text-center">
          {passed ? (
            <div className="relative inline-block">
              <Trophy className="h-20 w-20 mx-auto mb-4 text-yellow-500" />
              {passedEarly && (
                <PartyPopper className="h-8 w-8 absolute -top-2 -right-2 text-purple-500 animate-bounce" />
              )}
            </div>
          ) : (
            <XCircle className="h-20 w-20 mx-auto mb-4 text-red-400" />
          )}
          <h3 className="text-2xl font-bold mb-2">
            {passed 
              ? (passedEarly ? t.assessment.congrats : t.assessment.felicitations) 
              : (failedEarly ? t.assessment.fail : t.assessment.dommage)}
          </h3>
          <p className="text-4xl font-bold mb-4">
            {score} / {questionsAnswered}
          {passedEarly && <span className="text-lg text-green-500 ml-2">({t.assessment.passingReached.replace("{n}", String(PASSING_SCORE))})</span>}
          {failedEarly && <span className="text-lg text-red-500 ml-2">({errors} {t.assessment.errorsLabel.replace(" :", "")})</span>}
          </p>
          {passedEarly && (
            <p className="text-lg mb-2 text-purple-600">
              {t.assessment.earlyReached.replace("{n}", String(PASSING_SCORE)).replace("{q}", String(questionsAnswered))}
            </p>
          )}
          {failedEarly && (
            <p className="text-lg mb-2 text-red-600">
              {t.assessment.earlyFail.replace("{n}", String(errors)).replace("{min}", String(PASSING_SCORE)).replace("{total}", String(TOTAL_QUESTIONS))}
            </p>
          )}
          <p className={`text-lg mb-6 ${passed ? "text-green-600" : "text-red-600"}`}>
            {passed 
              ? t.assessment.levelValidated.replace("{level}", String(currentLevel + 1)) 
              : t.assessment.needToValidate.replace("{min}", String(PASSING_SCORE)).replace("{total}", String(TOTAL_QUESTIONS)).replace("{level}", String(currentLevel + 1))
            }
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={resetQuiz}>
              {t.assessment.back}
            </Button>
            {!passed && (
              <Button onClick={() => startQuiz(targetLevel!)}>
                {t.assessment.retry}
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  const currentQuestion = currentQuiz[currentQuestionIndex];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>{t.assessment.questionProgress} {currentQuestionIndex + 1} / {currentQuiz.length}</span>
        <span>{t.assessment.scoreLabel} {score} / {currentQuestionIndex + (showResult ? 1 : 0)} | {t.assessment.errorsLabel} {errors}/{MAX_ERRORS + 1}</span>
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
            {t.assessment.validateAnswer}
          </Button>
        ) : (
          <Button onClick={nextQuestion}>
            {currentQuestionIndex < currentQuiz.length - 1 && !quizFinished ? (
              <>
                {t.assessment.nextQuestion}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            ) : (
              t.assessment.seeResults
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
                  {t.assessment.correctAnswer}
                </span>
              </>
            ) : (
              <>
                <XCircle className="h-6 w-6 text-red-500" />
                <span className="font-medium text-red-700 dark:text-red-300">
                  {t.assessment.wrongAnswer}
                </span>
              </>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
