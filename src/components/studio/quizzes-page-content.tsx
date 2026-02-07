"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const translationTriggered = useRef(false);

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

          // Rafraîchir les données toutes les 10 batches pour voir les traductions
          if (batchCount % 10 === 0 && totalCreated > 0) {
            router.refresh();
          }

          // Petite pause entre les batches
          if (hasMore) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

        // Rafraîchir à la fin pour afficher toutes les nouvelles traductions
        if (totalCreated > 0) {
          console.log(`[Auto-traduction] Terminé: ${totalCreated} traductions créées`);
          router.refresh();
        }
      } catch {
        // Silencieux
      }
    };

    ensureTranslations();
  }, [router]);

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
