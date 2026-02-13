"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";
import { X, Save, Copy, UserPlus, Check, Loader2, Link2, ChevronDown, Settings, FileText, Share2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface Site {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  primaryColor: string;
  secondaryColor: string;
  settings: {
    tab1Title: string;
    tab1Enabled: boolean;
    tab2Title: string;
    tab2Enabled: boolean;
    tab3Title: string;
    tab3Enabled: boolean;
    tab4Title: string;
    tab4Enabled: boolean;
    tab5Title: string;
    tab5Enabled: boolean;
    allowPublicRegistration?: boolean;
  } | null;
}

interface SharedUser {
  id: string;
  name: string;
  email: string;
}

interface StudioUserOption {
  id: string;
  name: string;
  email: string;
}

interface SiteSettingsPanelProps {
  site: Site;
  onClose: () => void;
  onSaveStart: () => void;
  onSaveDone: () => void;
  onSaveError: () => void;
}

type SettingsSection = "properties" | "registration" | "sharing";

export function SiteSettingsPanel({
  site,
  onClose,
  onSaveStart,
  onSaveDone,
  onSaveError,
}: SiteSettingsPanelProps) {
  const router = useRouter();
  const { t } = useI18n();
  const [openSection, setOpenSection] = useState<SettingsSection | null>("properties");
  const [formData, setFormData] = useState({
    name: site.name,
    description: site.description || "",
    primaryColor: site.primaryColor,
    secondaryColor: site.secondaryColor,
    allowPublicRegistration: site.settings?.allowPublicRegistration || false,
  });
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);

  // Partage
  const [sharedUserIds, setSharedUserIds] = useState<Set<string>>(new Set());
  const [allUsers, setAllUsers] = useState<StudioUserOption[]>([]);
  const [loadingShare, setLoadingShare] = useState(false);
  const [sharingLoaded, setSharingLoaded] = useState(false);

  const fetchSharing = useCallback(async () => {
    const res = await fetch(`/api/sites/${site.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "get-sharing" }),
    });
    if (res.ok) {
      const data = await res.json();
      setSharedUserIds(new Set((data.sharedWith || []).map((u: SharedUser) => u.id)));
    }
  }, [site.id]);

  const fetchAllUsers = useCallback(async () => {
    const res = await fetch("/api/studio/users");
    if (res.ok) {
      const users = await res.json();
      setAllUsers(users.map((u: StudioUserOption & { _count?: { sites: number } }) => ({
        id: u.id,
        name: u.name,
        email: u.email,
      })));
    }
  }, []);

  useEffect(() => {
    if (openSection === "sharing" && !sharingLoaded) {
      Promise.all([fetchSharing(), fetchAllUsers()]).then(() => setSharingLoaded(true));
    }
  }, [openSection, sharingLoaded, fetchSharing, fetchAllUsers]);

  const toggleShare = async (userId: string) => {
    setLoadingShare(true);
    const isShared = sharedUserIds.has(userId);
    const action = isShared ? "unshare" : "share";
    await fetch(`/api/sites/${site.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, userId }),
    });
    setSharedUserIds((prev) => {
      const next = new Set(prev);
      if (isShared) next.delete(userId);
      else next.add(userId);
      return next;
    });
    setLoadingShare(false);
  };

  // Sauvegarde auto du toggle inscription publique
  const handleToggleRegistration = async (checked: boolean) => {
    setFormData({ ...formData, allowPublicRegistration: checked });
    await fetch(`/api/sites/${site.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ allowPublicRegistration: checked }),
    });
    router.refresh();
  };

  // Génère un nouveau token à usage unique et le copie
  const copyOneTimeLink = async () => {
    setIsGeneratingToken(true);
    try {
      const res = await fetch(`/api/sites/${site.id}/registration-token`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
        const link = `${baseUrl}/s/${site.slug}/register/${data.token}`;
        navigator.clipboard.writeText(link);
        setCopiedLink("one-time");
        setTimeout(() => setCopiedLink(null), 2000);
      }
    } catch (error) {
      console.error("Error generating one-time link:", error);
    } finally {
      setIsGeneratingToken(false);
    }
  };

  const copyLink = (type: "login" | "register") => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const link = type === "register"
      ? `${baseUrl}/s/${site.slug}/register`
      : `${baseUrl}/s/${site.slug}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(type);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleSave = async () => {
    onSaveStart();
    try {
      await fetch(`/api/sites/${site.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          primaryColor: formData.primaryColor,
          secondaryColor: formData.secondaryColor,
          allowPublicRegistration: formData.allowPublicRegistration,
        }),
      });
      onSaveDone();
      router.refresh();
    } catch {
      onSaveError();
    }
  };

  const toggleSection = (key: SettingsSection) => {
    setOpenSection((prev) => (prev === key ? null : key));
  };

  const sections: { key: SettingsSection; label: string; icon: React.ReactNode }[] = [
    { key: "properties", label: "Propriétés générales", icon: <Settings className="h-4 w-4" /> },
    { key: "registration", label: "Inscriptions", icon: <FileText className="h-4 w-4" /> },
    { key: "sharing", label: "Partages", icon: <Share2 className="h-4 w-4" /> },
  ];

  return (
    <div className="fixed right-0 top-16 bottom-0 w-96 bg-white dark:bg-gray-950 border-l border-gray-200 dark:border-gray-800 overflow-auto z-50">
      {/* En-tête */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <h3 className="font-semibold">{t.settings.siteSettings}</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Sections accordéon */}
      <div className="divide-y divide-gray-200 dark:divide-gray-800">

        {sections.map((section) => (
          <div key={section.key}>
            {/* Barre de titre cliquable */}
            <button
              onClick={() => toggleSection(section.key)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-2.5 text-sm font-medium text-gray-700 dark:text-gray-200">
                {section.icon}
                {section.label}
              </div>
              <ChevronDown
                className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                  openSection === section.key ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Contenu dépliable */}
            {openSection === section.key && (
              <div className="px-4 pb-4 space-y-5">

                {/* ======================================================= */}
                {/* PROPRIÉTÉS GÉNÉRALES                                     */}
                {/* ======================================================= */}
                {section.key === "properties" && (
                  <>
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <label className="text-xs text-gray-500">{t.sites.siteName}</label>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder={t.placeholder.enterSiteName}
                          className="h-9 text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-gray-500">{t.sites.siteDescription}</label>
                        <textarea
                          className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
                          rows={2}
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder={t.placeholder.enterDescription}
                        />
                      </div>
                    </div>

                    {/* Couleurs */}
                    <div className="space-y-3">
                      <label className="text-xs text-gray-500">{t.settings.personalization}</label>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-xs text-gray-400">{t.settings.primaryColor}</label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={formData.primaryColor}
                              onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                              className="h-9 w-9 rounded cursor-pointer"
                            />
                            <Input
                              value={formData.primaryColor}
                              onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                              className="flex-1 h-9 text-sm"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs text-gray-400">{t.settings.secondaryColor}</label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={formData.secondaryColor}
                              onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                              className="h-9 w-9 rounded cursor-pointer"
                            />
                            <Input
                              value={formData.secondaryColor}
                              onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                              className="flex-1 h-9 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* URL du site */}
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-gray-500 mb-1">Lien de connexion</p>
                          <code className="text-xs break-all">
                            {typeof window !== "undefined" ? window.location.origin : ""}/s/{site.slug}
                          </code>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 flex-shrink-0"
                          onClick={() => copyLink("login")}
                        >
                          {copiedLink === "login" ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <Button onClick={handleSave} className="w-full" size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      {t.common.save}
                    </Button>
                  </>
                )}

                {/* ======================================================= */}
                {/* INSCRIPTIONS                                             */}
                {/* ======================================================= */}
                {section.key === "registration" && (
                  <>
                    {/* Toggle inscription publique — sauvegarde immédiate */}
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.allowPublicRegistration}
                        onChange={(e) => handleToggleRegistration(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">
                        Autoriser l&apos;auto-inscription
                      </span>
                    </label>
                    <p className="text-xs text-gray-500">
                      Permet à n&apos;importe qui de créer un compte sur ce site via un lien public.
                    </p>

                    {formData.allowPublicRegistration && (
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-green-700 dark:text-green-400 mb-1 flex items-center gap-1">
                              <UserPlus className="h-3 w-3" />
                              Lien d&apos;inscription permanent
                            </p>
                            <code className="text-xs break-all text-green-800 dark:text-green-300">
                              {typeof window !== "undefined" ? window.location.origin : ""}/s/{site.slug}/register
                            </code>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 flex-shrink-0 text-green-600 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-900/30"
                            onClick={() => copyLink("register")}
                          >
                            {copiedLink === "register" ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Lien à usage unique */}
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-amber-700 dark:text-amber-400 mb-1 flex items-center gap-1">
                            <Link2 className="h-3 w-3" />
                            Lien à usage unique
                          </p>
                          <p className="text-xs text-amber-600 dark:text-amber-300">
                            Cliquez pour générer et copier un nouveau lien
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 flex-shrink-0 text-amber-600 hover:text-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                          onClick={copyOneTimeLink}
                          disabled={isGeneratingToken}
                        >
                          {isGeneratingToken ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : copiedLink === "one-time" ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                {/* ======================================================= */}
                {/* PARTAGES                                                  */}
                {/* ======================================================= */}
                {section.key === "sharing" && (
                  <>
                    <p className="text-xs text-gray-500">
                      Cochez les utilisateurs Studio qui doivent avoir accès à ce site.
                    </p>

                    {allUsers.length === 0 ? (
                      <p className="text-xs text-gray-400 italic py-2">Chargement...</p>
                    ) : (
                      <div className="border rounded-lg divide-y divide-gray-100 dark:divide-gray-800 max-h-80 overflow-auto">
                        {allUsers.map((user) => {
                          const isShared = sharedUserIds.has(user.id);
                          return (
                            <label
                              key={user.id}
                              className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors ${
                                isShared
                                  ? "bg-blue-50/50 dark:bg-blue-900/10"
                                  : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isShared}
                                onChange={() => toggleShare(user.id)}
                                disabled={loadingShare}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">{user.name}</p>
                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                              </div>
                              {isShared && (
                                <span className="text-[10px] bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 px-1.5 py-0.5 rounded flex-shrink-0">
                                  accès
                                </span>
                              )}
                            </label>
                          );
                        })}
                      </div>
                    )}

                    {sharedUserIds.size > 0 && (
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        {sharedUserIds.size} utilisateur{sharedUserIds.size > 1 ? "s" : ""} avec accès
                      </p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
