"use client";

import { ReactNode } from "react";
import { HeaderProvider } from "./header-context";
import { I18nProvider, useI18n } from "@/lib/i18n";

// Wrapper interne pour avoir accès au contexte I18n
function InnerProviders({ children }: { children: ReactNode }) {
  const { language } = useI18n();
  
  // La clé force le re-mount du HeaderProvider quand la langue change
  // Cela garantit que tous les contenus sont recalculés avec les nouvelles traductions
  return (
    <HeaderProvider key={language}>
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
