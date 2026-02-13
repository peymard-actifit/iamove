"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useHeaderContent } from "./header-context";
import { Button, SaveIndicator } from "@/components/ui";
import { Settings, Globe, GlobeLock, ExternalLink } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface SiteHeaderContentProps {
  siteId: string;
  siteName: string;
  siteSlug: string;
  isPublished: boolean;
  onSettingsClick: () => void;
  saveStatus: "idle" | "saving" | "saved" | "error";
}

export function SiteHeaderContent({
  siteId,
  siteName,
  siteSlug,
  isPublished,
  onSettingsClick,
  saveStatus,
}: SiteHeaderContentProps) {
  const { setCenterContent, setRightActions } = useHeaderContent();
  const router = useRouter();
  const { t } = useI18n();
  const [publishing, setPublishing] = useState(false);

  // Ref stable pour le callback settings (évite les closures stales dans useEffect)
  const onSettingsClickRef = useRef(onSettingsClick);
  onSettingsClickRef.current = onSettingsClick;
  const stableSettingsClick = useCallback(() => onSettingsClickRef.current(), []);

  const handlePublishToggle = async () => {
    setPublishing(true);
    try {
      await fetch(`/api/sites/${siteId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publish: !isPublished }),
      });
      router.refresh();
    } finally {
      setPublishing(false);
    }
  };

  useEffect(() => {
    setCenterContent(
      <h1 className="text-base font-semibold">{siteName}</h1>
    );

    setRightActions(
      <div className="flex items-center gap-2">
        <SaveIndicator status={saveStatus} />
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePublishToggle}
          disabled={publishing}
          className={isPublished ? "text-green-600" : "text-gray-500"}
        >
          {isPublished ? (
            <>
              <Globe className="h-4 w-4 mr-1" />
              {t.sites.published}
            </>
          ) : (
            <>
              <GlobeLock className="h-4 w-4 mr-1" />
              {t.sites.draft}
            </>
          )}
        </Button>
        {isPublished && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`/s/${siteSlug}/app`, "_blank")}
            className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-900/20"
            title="Ouvrir le site publié dans un nouvel onglet"
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Voir le site
          </Button>
        )}
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={stableSettingsClick} title={t.tooltip.siteSettings}>
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    );

    return () => {
      setCenterContent(null);
      setRightActions(null);
    };
  }, [siteName, siteSlug, isPublished, saveStatus, publishing, t, stableSettingsClick]);

  return null;
}
