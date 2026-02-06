"use client";

import { ReactNode } from "react";
import { HeaderProvider } from "./header-context";
import { I18nProvider } from "@/lib/i18n";

export function StudioProviders({ children }: { children: ReactNode }) {
  return (
    <I18nProvider initialLanguage="FR">
      <HeaderProvider>
        {children}
      </HeaderProvider>
    </I18nProvider>
  );
}
