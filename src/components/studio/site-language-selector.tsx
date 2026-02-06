"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
  Flag,
} from "@/components/ui";
import { SUPPORTED_LANGUAGES, SupportedLanguage, getLanguageInfo, useI18n } from "@/lib/i18n";

interface SiteLanguageSelectorProps {
  siteId: string;
  currentLanguage: string;
  onLanguageChange?: (lang: string) => void;
}

export function SiteLanguageSelector({ 
  siteId, 
  currentLanguage,
  onLanguageChange,
}: SiteLanguageSelectorProps) {
  const router = useRouter();
  const { t } = useI18n();
  const [showDialog, setShowDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const languageInfo = getLanguageInfo(currentLanguage as SupportedLanguage);

  const handleSelectLanguage = async (lang: SupportedLanguage) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/sites/${siteId}/language`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: lang }),
      });

      if (res.ok) {
        setShowDialog(false);
        onLanguageChange?.(lang);
        router.refresh();
      }
    } catch (error) {
      console.error("Error updating site language:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowDialog(true);
        }}
        className="h-7 w-7"
        title={t.tooltip.siteContentLanguage}
        disabled={isLoading}
      >
        <Flag countryCode={languageInfo?.countryCode || "fr"} size="sm" />
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle className="text-center">
              {t.common.siteLanguage}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500 text-center mb-2">
            {t.common.siteLanguageDescription}
          </p>
          <div className="grid grid-cols-6 gap-3 py-4">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleSelectLanguage(lang.code)}
                disabled={isLoading}
                className={`
                  flex items-center justify-center p-2 rounded-lg transition-all
                  hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${currentLanguage === lang.code 
                    ? "bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500 scale-105" 
                    : "bg-gray-50 dark:bg-gray-900"
                  }
                `}
                title={lang.nativeName}
              >
                <Flag countryCode={lang.countryCode} size="xl" />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
