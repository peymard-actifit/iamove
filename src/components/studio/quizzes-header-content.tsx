"use client";

import { useEffect } from "react";
import { useHeaderContent } from "./header-context";
import { Button } from "@/components/ui";
import { Plus } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface QuizzesHeaderContentProps {
  quizCount: number;
  onNewQuestion: () => void;
}

export function QuizzesHeaderContent({ quizCount, onNewQuestion }: QuizzesHeaderContentProps) {
  const { setCenterContent, setRightActions } = useHeaderContent();
  const { t } = useI18n();

  useEffect(() => {
    setCenterContent(
      <div className="text-center">
        <h1 className="text-lg font-semibold">{t.quiz.title}</h1>
        <p className="text-xs text-gray-500">{quizCount} {t.quiz.questionsCount}</p>
      </div>
    );

    setRightActions(
      <div className="flex items-center gap-2">
        <Button onClick={onNewQuestion} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          {t.quiz.newQuestion}
        </Button>
      </div>
    );

    return () => {
      setCenterContent(null);
      setRightActions(null);
    };
  }, [setCenterContent, setRightActions, quizCount, onNewQuestion, t]);

  return null;
}
