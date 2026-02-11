"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";
import { X, Save, Copy, UserPlus, Check } from "lucide-react";
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

interface SiteSettingsPanelProps {
  site: Site;
  onClose: () => void;
  onSaveStart: () => void;
  onSaveDone: () => void;
  onSaveError: () => void;
}

export function SiteSettingsPanel({
  site,
  onClose,
  onSaveStart,
  onSaveDone,
  onSaveError,
}: SiteSettingsPanelProps) {
  const router = useRouter();
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    name: site.name,
    description: site.description || "",
    primaryColor: site.primaryColor,
    secondaryColor: site.secondaryColor,
    allowPublicRegistration: site.settings?.allowPublicRegistration || false,
  });
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

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

  return (
    <div className="fixed right-0 top-16 bottom-0 w-80 bg-white dark:bg-gray-950 border-l border-gray-200 dark:border-gray-800 overflow-auto">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <h3 className="font-semibold">{t.settings.siteSettings}</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4 space-y-6">
        {/* Informations générales */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-500">{t.settings.generalInfo}</h4>
          
          <div className="space-y-2">
            <label className="text-sm">{t.sites.siteName}</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t.placeholder.enterSiteName}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm">{t.sites.siteDescription}</label>
            <textarea
              className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t.placeholder.enterDescription}
            />
          </div>
        </div>

        {/* Couleurs */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-500">{t.settings.personalization}</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm">{t.settings.primaryColor}</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="h-10 w-10 rounded cursor-pointer"
                />
                <Input
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm">{t.settings.secondaryColor}</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                  className="h-10 w-10 rounded cursor-pointer"
                />
                <Input
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* URL du site */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-500">{t.settings.publishedUrl}</h4>
          
          {/* Lien de connexion */}
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
        </div>

        {/* Inscription publique */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-500">Inscription publique</h4>
          
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.allowPublicRegistration}
              onChange={(e) => setFormData({ ...formData, allowPublicRegistration: e.target.checked })}
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
                    Lien d&apos;inscription
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
        </div>

        {/* Bouton sauvegarder */}
        <Button onClick={handleSave} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          {t.common.save}
        </Button>
      </div>
    </div>
  );
}
