"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useHeaderContent } from "./header-context";
import { Button, SaveIndicator } from "@/components/ui";
import { Settings, Globe, GlobeLock } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface SiteHeaderContentProps {
  siteId: string;
  siteName: string;
  isPublished: boolean;
  onSettingsClick: () => void;
  saveStatus: "idle" | "saving" | "saved" | "error";
}

export function SiteHeaderContent({
  siteId,
  siteName,
  isPublished,
  onSettingsClick,
  saveStatus,
}: SiteHeaderContentProps) {
  const { setCenterContent, setRightActions } = useHeaderContent();
  const router = useRouter();
  const { t } = useI18n();
  const [publishing, setPublishing] = useState(false);

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
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onSettingsClick} title={t.tooltip.siteSettings}>
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    );

    return () => {
      setCenterContent(null);
      setRightActions(null);
    };
  }, [siteName, isPublished, saveStatus, publishing, t]);

  return null;
}
