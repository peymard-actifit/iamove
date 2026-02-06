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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui";
import {
  Plus,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Globe,
  GlobeLock,
  Users,
  ExternalLink,
  FolderOpen,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Site {
  id: string;
  name: string;
  slug: string;
  description: string | null;
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

  const handleDuplicateSite = async (siteId: string) => {
    setIsLoading(true);
    try {
      await fetch(`/api/sites/${siteId}/duplicate`, { method: "POST" });
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishToggle = async (siteId: string, currentStatus: boolean) => {
    await fetch(`/api/sites/${siteId}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publish: !currentStatus }),
    });
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {folders.length > 0 && (
            <Button variant="outline" size="sm">
              <FolderOpen className="h-4 w-4 mr-2" />
              Dossiers ({folders.length})
            </Button>
          )}
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau site
        </Button>
      </div>

      {/* Sites Grid */}
      {sites.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center dark:bg-gray-800">
            <Globe className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">Aucun site</h3>
          <p className="mt-2 text-gray-500">
            Créez votre premier site d&apos;accompagnement IA
          </p>
          <Button className="mt-4" onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Créer un site
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sites.map((site) => (
            <Card key={site.id} className="overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/studio/${site.id}`}
                      className="text-lg font-semibold hover:text-blue-600 truncate block"
                    >
                      {site.name}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1 truncate">
                      {site.description || "Aucune description"}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="shrink-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/studio/${site.id}`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Éditer
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicateSite(site.id)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Dupliquer
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handlePublishToggle(site.id, site.isPublished)}
                      >
                        {site.isPublished ? (
                          <>
                            <GlobeLock className="mr-2 h-4 w-4" />
                            Dépublier
                          </>
                        ) : (
                          <>
                            <Globe className="mr-2 h-4 w-4" />
                            Publier
                          </>
                        )}
                      </DropdownMenuItem>
                      {site.isPublished && (
                        <DropdownMenuItem asChild>
                          <a href={`/s/${site.slug}`} target="_blank" rel="noreferrer">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Voir le site
                          </a>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => setShowDeleteDialog(site.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {site._count.persons} personne(s)
                  </div>
                  <div className="flex items-center gap-1">
                    {site.isPublished ? (
                      <>
                        <Globe className="h-4 w-4 text-green-500" />
                        <span className="text-green-600">Publié</span>
                      </>
                    ) : (
                      <>
                        <GlobeLock className="h-4 w-4" />
                        <span>Brouillon</span>
                      </>
                    )}
                  </div>
                </div>

                {isAdmin && (
                  <p className="mt-2 text-xs text-gray-400">
                    Par {site.owner.name}
                  </p>
                )}

                <p className="mt-2 text-xs text-gray-400">
                  Modifié le {formatDate(site.updatedAt)}
                </p>
              </div>
            </Card>
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
