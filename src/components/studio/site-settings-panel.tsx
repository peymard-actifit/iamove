"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";
import { X, Save, Copy, UserPlus, Check, Loader2, Link2, Share2, Trash2, Settings, FileText, Users } from "lucide-react";
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
  const [activeSection, setActiveSection] = useState<SettingsSection>("properties");
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
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([]);
  const [allUsers, setAllUsers] = useState<StudioUserOption[]>([]);
  const [shareSearch, setShareSearch] = useState("");
  const [loadingShare, setLoadingShare] = useState(false);

  const fetchSharing = useCallback(async () => {
    const res = await fetch(`/api/sites/${site.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "get-sharing" }),
    });
    if (res.ok) {
      const data = await res.json();
      setSharedUsers(data.sharedWith || []);
    }
  }, [site.id]);

  const fetchAllUsers = useCallback(async () => {
    const res = await fetch("/api/studio/users");
    if (res.ok) {
      const users = await res.json();
      setAllUsers(users.map((u: StudioUserOption & { _count?: { sites: number } }) => ({ id: u.id, name: u.name, email: u.email })));
    }
  }, []);

  useEffect(() => {
    if (activeSection === "sharing") {
      fetchSharing();
      fetchAllUsers();
    }
  }, [activeSection, fetchSharing, fetchAllUsers]);

  const handleShare = async (userId: string) => {
    setLoadingShare(true);
    await fetch(`/api/sites/${site.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "share", userId }),
    });
    await fetchSharing();
    setShareSearch("");
    setLoadingShare(false);
  };

  const handleUnshare = async (userId: string) => {
    setLoadingShare(true);
    await fetch(`/api/sites/${site.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "unshare", userId }),
    });
    await fetchSharing();
    setLoadingShare(false);
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

  const sections: { key: SettingsSection; label: string; icon: React.ReactNode }[] = [
    { key: "properties", label: "Propriétés générales", icon: <Settings className="h-3.5 w-3.5" /> },
    { key: "registration", label: "Inscriptions", icon: <FileText className="h-3.5 w-3.5" /> },
    { key: "sharing", label: "Partages", icon: <Share2 className="h-3.5 w-3.5" /> },
  ];

  // Utilisateurs éligibles au partage (pas déjà partagés, pas le owner)
  const availableUsers = allUsers.filter(
    (u) => !sharedUsers.some((s) => s.id === u.id) && shareSearch.length > 0 && (
      u.name.toLowerCase().includes(shareSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(shareSearch.toLowerCase())
    )
  );

  return (
    <div className="fixed right-0 top-16 bottom-0 w-96 bg-white dark:bg-gray-950 border-l border-gray-200 dark:border-gray-800 overflow-auto z-50">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <h3 className="font-semibold">{t.settings.siteSettings}</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Navigation sous-menus */}
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        {sections.map((s) => (
          <button
            key={s.key}
            onClick={() => setActiveSection(s.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 text-xs font-medium transition-colors ${
              activeSection === s.key
                ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            {s.icon}
            {s.label}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-6">

        {/* ============================================================= */}
        {/* PROPRIÉTÉS GÉNÉRALES                                          */}
        {/* ============================================================= */}
        {activeSection === "properties" && (
          <>
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

            {/* Bouton sauvegarder */}
            <Button onClick={handleSave} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              {t.common.save}
            </Button>
          </>
        )}

        {/* ============================================================= */}
        {/* INSCRIPTIONS                                                   */}
        {/* ============================================================= */}
        {activeSection === "registration" && (
          <>
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
            </div>

            {/* Lien d'inscription à usage unique */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-500">Lien à usage unique</h4>
              
              <p className="text-xs text-gray-500">
                Génère un lien d&apos;inscription qui ne peut être utilisé qu&apos;une seule fois.
                Un nouveau lien est créé à chaque copie.
              </p>

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
            </div>

            {/* Bouton sauvegarder (pour inscription publique) */}
            <Button onClick={handleSave} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              {t.common.save}
            </Button>
          </>
        )}

        {/* ============================================================= */}
        {/* PARTAGES                                                       */}
        {/* ============================================================= */}
        {activeSection === "sharing" && (
          <>
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-500">Partager ce site</h4>
              <p className="text-xs text-gray-500">
                Donnez accès à ce site à d&apos;autres utilisateurs du Studio. Ils pourront le voir et le gérer.
              </p>
            </div>

            {/* Utilisateurs ayant accès */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-500 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                Utilisateurs avec accès ({sharedUsers.length})
              </h4>

              {sharedUsers.length === 0 ? (
                <p className="text-xs text-gray-400 italic">Aucun partage pour le moment</p>
              ) : (
                <div className="space-y-1.5">
                  {sharedUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between gap-2 p-2 rounded-md bg-gray-50 dark:bg-gray-800">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => handleUnshare(user.id)}
                        disabled={loadingShare}
                        title="Retirer l'accès"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ajouter un utilisateur */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-500">Ajouter un utilisateur</h4>
              <Input
                placeholder="Rechercher par nom ou email..."
                value={shareSearch}
                onChange={(e) => setShareSearch(e.target.value)}
                className="h-9 text-sm"
              />

              {availableUsers.length > 0 && (
                <div className="max-h-40 overflow-auto border rounded-md bg-white dark:bg-gray-900">
                  {availableUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleShare(user.id)}
                      disabled={loadingShare}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-b last:border-b-0"
                    >
                      <Share2 className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className="font-medium">{user.name}</span>
                        <span className="text-xs text-gray-500 ml-2">{user.email}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {shareSearch.length > 0 && availableUsers.length === 0 && (
                <p className="text-xs text-gray-400 italic">Aucun utilisateur trouvé</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
