"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { QuizzesManager } from "./quizzes-manager";
import { QuizzesHeaderContent } from "./quizzes-header-content";

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
  answers: unknown;
  levelId: string;
  level: Level;
  category: string | null;
  isActive: boolean;
  createdBy: { name: string };
  translations?: QuizTranslation[];
}

interface QuizzesPageContentProps {
  levels: Level[];
  initialQuizzes: Quiz[];
  quizCount: number;
  userId: string;
}

export function QuizzesPageContent({ 
  levels, 
  initialQuizzes, 
  quizCount,
  userId 
}: QuizzesPageContentProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const translationTriggered = useRef(false);

  // Déclencher la traduction automatique des questions manquantes
  useEffect(() => {
    if (translationTriggered.current) return;
    translationTriggered.current = true;

    // Vérifier et traduire en arrière-plan (sans bloquer l'interface)
    const ensureTranslations = async () => {
      try {
        // Vérifier s'il y a des traductions manquantes
        const checkRes = await fetch("/api/quizzes/ensure-translations");
        if (!checkRes.ok) return;
        
        const status = await checkRes.json();
        if (status.isComplete) return;

        // Lancer la traduction en arrière-plan
        console.log(`[Auto-traduction] ${status.missingCount} traductions manquantes, lancement...`);
        fetch("/api/quizzes/ensure-translations", { method: "POST" })
          .then(res => res.json())
          .then(data => {
            if (data.translationsCreated > 0) {
              console.log(`[Auto-traduction] ${data.translationsCreated} traductions créées`);
            }
          })
          .catch(() => {});
      } catch {
        // Silencieux
      }
    };

    ensureTranslations();
  }, []);

  const handleNewQuestion = useCallback(() => {
    setShowCreateDialog(true);
  }, []);

  return (
    <>
      <QuizzesHeaderContent 
        quizCount={quizCount} 
        onNewQuestion={handleNewQuestion} 
      />
      <QuizzesManager
        levels={levels}
        initialQuizzes={initialQuizzes}
        userId={userId}
        showCreateDialog={showCreateDialog}
        onShowCreateDialogChange={setShowCreateDialog}
      />
    </>
  );
}
