"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useHeaderContent } from "./header-context";
import { AddSiteButton } from "./sites-list";
import { Button } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { FileQuestion } from "lucide-react";

interface DashboardHeaderContentProps {
  isAdmin?: boolean;
}

export function DashboardHeaderContent({ isAdmin = false }: DashboardHeaderContentProps) {
  const { setCenterContent, setRightActions } = useHeaderContent();
  const { t, language } = useI18n();

  useEffect(() => {
    setCenterContent(
      <div className="text-center">
        <h1 className="text-lg font-semibold">{t.header.mySites}</h1>
        <p className="text-xs text-gray-500">{t.header.mySitesDescription}</p>
      </div>
    );

    setRightActions(
      <div className="flex items-center gap-2">
        {isAdmin && (
          <Button variant="outline" size="sm" asChild>
            <Link href="/quizzes">
              <FileQuestion className="h-4 w-4 mr-1" />
              Quizz
            </Link>
          </Button>
        )}
        <AddSiteButton />
      </div>
    );

    return () => {
      setCenterContent(null);
      setRightActions(null);
    };
  }, [setCenterContent, setRightActions, t, language, isAdmin]);

  return null;
}
