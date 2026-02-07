"use client";

import { I18nProvider } from "@/lib/i18n";

export default function PublishedAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <I18nProvider initialLanguage="EN">
      {children}
    </I18nProvider>
  );
}
