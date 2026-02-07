"use client";

import { useState, useCallback } from "react";
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
