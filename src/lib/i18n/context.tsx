"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { 
  SupportedLanguage, 
  Translations, 
  getTranslations, 
  getLanguageInfo,
  LanguageInfo,
  SUPPORTED_LANGUAGES,
} from "./translations";

interface I18nContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: Translations;
  languageInfo: LanguageInfo | undefined;
  availableLanguages: LanguageInfo[];
}

const I18nContext = createContext<I18nContextType | null>(null);

const STORAGE_KEY = "iamove-language";

export function I18nProvider({ 
  children,
  initialLanguage = "FR",
}: { 
  children: ReactNode;
  initialLanguage?: SupportedLanguage;
}) {
  const [language, setLanguageState] = useState<SupportedLanguage>(initialLanguage);
  const [mounted, setMounted] = useState(false);

  // Charger la langue depuis le localStorage au montage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as SupportedLanguage | null;
    if (stored && SUPPORTED_LANGUAGES.some(l => l.code === stored)) {
      setLanguageState(stored);
    }
    setMounted(true);
  }, []);

  // Sauvegarder et mettre à jour la langue
  const setLanguage = async (lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    
    // Sauvegarder en base si l'utilisateur est connecté
    try {
      await fetch("/api/user/language", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: lang }),
      });
    } catch {
      // Ignorer les erreurs - la préférence reste en localStorage
    }
  };

  const t = getTranslations(language);
  const languageInfo = getLanguageInfo(language);

  // Éviter le flash de contenu non traduit
  if (!mounted) {
    return null;
  }

  return (
    <I18nContext.Provider value={{
      language,
      setLanguage,
      t,
      languageInfo,
      availableLanguages: SUPPORTED_LANGUAGES,
    }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}

// Hook pour utiliser uniquement les traductions (sans changer la langue)
export function useTranslations() {
  const { t } = useI18n();
  return t;
}
