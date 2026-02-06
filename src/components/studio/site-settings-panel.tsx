"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Card } from "@/components/ui";
import { X, Save } from "lucide-react";

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
  const [formData, setFormData] = useState({
    name: site.name,
    description: site.description || "",
    primaryColor: site.primaryColor,
    secondaryColor: site.secondaryColor,
  });

  const handleSave = async () => {
    onSaveStart();
    try {
      await fetch(`/api/sites/${site.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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
        <h3 className="font-semibold">Paramètres du site</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4 space-y-6">
        {/* Informations générales */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-500">Informations générales</h4>
          
          <div className="space-y-2">
            <label className="text-sm">Nom du site</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm">Description</label>
            <textarea
              className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>

        {/* Couleurs */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-500">Personnalisation</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm">Couleur principale</label>
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
              <label className="text-sm">Couleur secondaire</label>
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
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-500">URL du site publié</h4>
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
            <code className="text-sm break-all">
              {typeof window !== "undefined" ? window.location.origin : ""}/s/{site.slug}
            </code>
          </div>
        </div>

        {/* Bouton sauvegarder */}
        <Button onClick={handleSave} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          Sauvegarder
        </Button>
      </div>
    </div>
  );
}
