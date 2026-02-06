"use client";

import { useEffect } from "react";
import { useHeaderContent } from "./header-context";
import { AddSiteButton } from "./sites-list";
import { useI18n } from "@/lib/i18n";

export function DashboardHeaderContent() {
  const { setCenterContent, setRightActions } = useHeaderContent();
  const { t, language } = useI18n();

  useEffect(() => {
    setCenterContent(
      <div className="text-center">
        <h1 className="text-lg font-semibold">{t.header.mySites}</h1>
        <p className="text-xs text-gray-500">{t.header.mySitesDescription}</p>
      </div>
    );

    setRightActions(<AddSiteButton />);

    return () => {
      setCenterContent(null);
      setRightActions(null);
    };
  }, [setCenterContent, setRightActions, t, language]);

  return null;
}
