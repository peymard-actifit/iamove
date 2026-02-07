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
  const [quizzes, setQuizzes] = useState(initialQuizzes);
  const translationTriggered = useRef(false);

  // Synchroniser avec initialQuizzes si elles changent
  useEffect(() => {
    setQuizzes(initialQuizzes);
  }, [initialQuizzes]);

  // Déclencher la traduction automatique des questions manquantes
  useEffect(() => {
    if (translationTriggered.current) return;
    translationTriggered.current = true;

    // Traduire en arrière-plan de manière progressive
    const ensureTranslations = async () => {
      try {
        // Vérifier s'il y a des traductions manquantes
        const checkRes = await fetch("/api/quizzes/ensure-translations");
        if (!checkRes.ok) return;
        
        const status = await checkRes.json();
        if (status.isComplete) return;

        console.log(`[Auto-traduction] ${status.missingCount} traductions manquantes`);

        // Lancer la traduction en boucle jusqu'à ce que tout soit fait
        let hasMore = true;
        let totalCreated = 0;
        let batchCount = 0;

        while (hasMore) {
          const res = await fetch("/api/quizzes/ensure-translations", { method: "POST" });
          if (!res.ok) break;

          const data = await res.json();
          totalCreated += data.translationsCreated || 0;
          hasMore = data.hasMore && data.translationsCreated > 0;
          batchCount++;

          if (data.translationsCreated > 0) {
            console.log(`[Auto-traduction] +${data.translationsCreated} (total: ${totalCreated})`);
          }

          // Recharger les quizzes via API toutes les 10 batches (sans rafraîchir la page)
          if (batchCount % 10 === 0 && totalCreated > 0) {
            const quizzesRes = await fetch("/api/quizzes");
            if (quizzesRes.ok) {
              const updatedQuizzes = await quizzesRes.json();
              setQuizzes(updatedQuizzes);
            }
          }

          // Petite pause entre les batches
          if (hasMore) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

        // Recharger à la fin pour afficher toutes les nouvelles traductions
        if (totalCreated > 0) {
          console.log(`[Auto-traduction] Terminé: ${totalCreated} traductions créées`);
          const quizzesRes = await fetch("/api/quizzes");
          if (quizzesRes.ok) {
            const updatedQuizzes = await quizzesRes.json();
            setQuizzes(updatedQuizzes);
          }
        }
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
        initialQuizzes={quizzes}
        userId={userId}
        showCreateDialog={showCreateDialog}
        onShowCreateDialogChange={setShowCreateDialog}
        onQuizzesChange={setQuizzes}
      />
    </>
  );
}
