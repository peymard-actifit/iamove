"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
  Flag,
} from "@/components/ui";
import { useI18n, SupportedLanguage } from "@/lib/i18n";

export function LanguageSelector() {
  const { language, setLanguage, languageInfo, availableLanguages, t } = useI18n();
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
        className="px-2 h-8"
        title={t.tooltip.changeLanguage}
      >
        <Flag countryCode={languageInfo?.countryCode || "fr"} size="md" />
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-center">
              {t.common.chooseLanguage || "Choisir la langue"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-6 gap-2 py-4">
            {availableLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleSelectLanguage(lang.code)}
                className={`
                  flex items-center justify-center p-1 rounded-lg transition-all aspect-[3/2]
                  hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105
                  ${language === lang.code 
                    ? "bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500 scale-105" 
                    : "bg-gray-50 dark:bg-gray-900"
                  }
                `}
                title={lang.nativeName}
              >
                <Flag countryCode={lang.countryCode} size="2xl" />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
