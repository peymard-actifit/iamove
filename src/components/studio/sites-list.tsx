"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Button,
  Card,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Input,
} from "@/components/ui";
import {
  Plus,
  Copy,
  Trash2,
  Globe,
  GlobeLock,
  Users,
  ExternalLink,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { SiteLanguageSelector } from "./site-language-selector";
import { useI18n } from "@/lib/i18n";

interface Site {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  language: string;
  isPublished: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  owner: { name: string; email: string };
  _count: { persons: number };
}

interface Folder {
  id: string;
  name: string;
  parentId: string | null;
}

interface SitesListProps {
  sites: Site[];
  folders: Folder[];
  isAdmin: boolean;
}

export function SitesList({ sites, folders, isAdmin }: SitesListProps) {
  const router = useRouter();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newSite, setNewSite] = useState({ name: "", description: "" });

  const handleCreateSite = async () => {
    if (!newSite.name.trim()) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSite),
      });

      if (res.ok) {
        setShowCreateDialog(false);
        setNewSite({ name: "", description: "" });
        router.refresh();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSite = async (siteId: string) => {
    setIsLoading(true);
    try {
      await fetch(`/api/sites/${siteId}`, { method: "DELETE" });
      setShowDeleteDialog(null);
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicateSite = async (siteId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);
    try {
      await fetch(`/api/sites/${siteId}/duplicate`, { method: "POST" });
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishToggle = async (siteId: string, currentStatus: boolean, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await fetch(`/api/sites/${siteId}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publish: !currentStatus }),
    });
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {/* Sites Grid */}
      {sites.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="mx-auto h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center dark:bg-gray-800">
            <Globe className="h-5 w-5 text-gray-400" />
          </div>
          <h3 className="mt-3 text-base font-semibold">Aucun site</h3>
          <p className="mt-1 text-sm text-gray-500">
            Créez votre premier site d&apos;accompagnement IA
          </p>
          <Button size="sm" className="mt-3" onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Créer un site
          </Button>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sites.map((site) => (
            <Link key={site.id} href={`/studio/${site.id}`}>
              <Card className="p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer h-full">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{site.name}</h3>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {site.description || "Sans description"}
                    </p>
                  </div>
                  {/* Icônes d'action */}
                  <div className="flex items-center gap-0.5 shrink-0">
                    {/* Langue du site (LOCAL) */}
                    <SiteLanguageSelector 
                      siteId={site.id} 
                      currentLanguage={site.language || "FR"} 
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => handlePublishToggle(site.id, site.isPublished, e)}
                      title={site.isPublished ? "Dépublier" : "Publier"}
                    >
                      {site.isPublished ? (
                        <Globe className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <GlobeLock className="h-3.5 w-3.5 text-gray-400" />
                      )}
                    </Button>
                    {site.isPublished && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          window.open(`/s/${site.slug}`, '_blank');
                        }}
                        title="Voir le site"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => handleDuplicateSite(site.id, e)}
                      title="Dupliquer"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowDeleteDialog(site.id);
                      }}
                      title="Supprimer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {site._count.persons}
                  </div>
                  <span>•</span>
                  <span>{formatDate(site.updatedAt)}</span>
                  {isAdmin && (
                    <>
                      <span>•</span>
                      <span className="text-gray-400">{site.owner.name}</span>
                    </>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un nouveau site</DialogTitle>
            <DialogDescription>
              Créez un site d&apos;accompagnement IA pour une entreprise
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom du site *</label>
              <Input
                placeholder="Ex: Acme Corporation"
                value={newSite.name}
                onChange={(e) => setNewSite({ ...newSite, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input
                placeholder="Description optionnelle"
                value={newSite.description}
                onChange={(e) => setNewSite({ ...newSite, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateSite} isLoading={isLoading}>
              Créer le site
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!showDeleteDialog} onOpenChange={() => setShowDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le site ?</DialogTitle>
            <DialogDescription>
              Cette action est irréversible. Toutes les données du site seront perdues.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(null)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => showDeleteDialog && handleDeleteSite(showDeleteDialog)}
              isLoading={isLoading}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Export du bouton Ajouter pour le header
export function AddSiteButton() {
  const [showDialog, setShowDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newSite, setNewSite] = useState({ name: "", description: "" });
  const router = useRouter();
  const { t } = useI18n();

  const handleCreate = async () => {
    if (!newSite.name.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSite),
      });
      if (res.ok) {
        setShowDialog(false);
        setNewSite({ name: "", description: "" });
        router.refresh();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button size="sm" onClick={() => setShowDialog(true)}>
        <Plus className="h-4 w-4 mr-1" />
        {t.header.addSite}
      </Button>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.sites.createSite}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t.sites.siteName} *</label>
              <Input
                placeholder="Ex: Acme Corporation"
                value={newSite.name}
                onChange={(e) => setNewSite({ ...newSite, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t.sites.siteDescription}</label>
              <Input
                placeholder="Description optionnelle"
                value={newSite.description}
                onChange={(e) => setNewSite({ ...newSite, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>{t.common.cancel}</Button>
            <Button onClick={handleCreate} isLoading={isLoading}>{t.common.add}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
