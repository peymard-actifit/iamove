"use client";

import { useEffect } from "react";
import { useHeaderContent } from "./header-context";
import { AddSiteButton } from "./sites-list";

export function DashboardHeaderContent() {
  const { setCenterContent, setRightActions } = useHeaderContent();

  useEffect(() => {
    setCenterContent(
      <div className="text-center">
        <h1 className="text-lg font-semibold">Mes sites</h1>
        <p className="text-xs text-gray-500">Gérez vos sites d&apos;accompagnement IA</p>
      </div>
    );

    setRightActions(<AddSiteButton />);

    return () => {
      setCenterContent(null);
      setRightActions(null);
    };
  }, [setCenterContent, setRightActions]);

  return null;
}
