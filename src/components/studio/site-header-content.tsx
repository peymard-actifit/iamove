"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useHeaderContent } from "./header-context";
import { Button, SaveIndicator, useSaveStatus } from "@/components/ui";
import { ArrowLeft, Settings, Globe, GlobeLock } from "lucide-react";

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
      <div className="flex items-center gap-3">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-base font-semibold">{siteName}</h1>
      </div>
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
              Publié
            </>
          ) : (
            <>
              <GlobeLock className="h-4 w-4 mr-1" />
              Brouillon
            </>
          )}
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onSettingsClick}>
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    );

    return () => {
      setCenterContent(null);
      setRightActions(null);
    };
  }, [siteName, isPublished, saveStatus, publishing]);

  return null;
}
