"use client";

import { ReactNode } from "react";
import { HeaderProvider } from "./header-context";
import { I18nProvider, useI18n } from "@/lib/i18n";

// Wrapper interne pour avoir accès au contexte I18n
function InnerProviders({ children }: { children: ReactNode }) {
  // Ne plus utiliser key={language} car cela remonte tous les composants
  // et réinitialise leurs états (filtres, recherche, etc.)
  // Les composants se mettent à jour automatiquement via useI18n()
  return (
    <HeaderProvider>
      {children}
    </HeaderProvider>
  );
}

export function StudioProviders({ children }: { children: ReactNode }) {
  return (
    <I18nProvider initialLanguage="FR">
      <InnerProviders>
        {children}
      </InnerProviders>
    </I18nProvider>
  );
}
