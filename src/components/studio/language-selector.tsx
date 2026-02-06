"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
} from "@/components/ui";
import { useI18n, SupportedLanguage } from "@/lib/i18n";

export function LanguageSelector() {
  const { language, setLanguage, languageInfo, availableLanguages } = useI18n();
  const [showDialog, setShowDialog] = useState(false);

  const handleSelectLanguage = (lang: SupportedLanguage) => {
    setLanguage(lang);
    setShowDialog(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowDialog(true)}
        className="text-xl px-2"
        title={languageInfo?.nativeName || "Langue"}
      >
        {languageInfo?.flag || "🇫🇷"}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              🌍 Choisir la langue / Choose language
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-4 gap-2 py-4">
            {availableLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleSelectLanguage(lang.code)}
                className={`
                  flex flex-col items-center gap-1 p-3 rounded-lg transition-all
                  hover:bg-gray-100 dark:hover:bg-gray-800
                  ${language === lang.code 
                    ? "bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500" 
                    : "bg-gray-50 dark:bg-gray-900"
                  }
                `}
                title={lang.name}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span className="text-[10px] text-gray-600 dark:text-gray-400 truncate w-full text-center">
                  {lang.nativeName}
                </span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
