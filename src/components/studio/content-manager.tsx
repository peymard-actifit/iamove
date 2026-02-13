"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Button,
  Input,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Card,
} from "@/components/ui";
import {
  Lightbulb,
  MessageCircle,
  Code2,
  Pencil,
  Trash2,
  Share2,
  X,
  Check,
  ArrowRight,
  Search,
} from "lucide-react";

// ------- Types -------

interface SiteRef {
  id: string;
  name: string;
  slug?: string;
}

interface PersonRef {
  id: string;
  name: string;
  jobTitle: string | null;
}

interface UseCaseItem {
  id: string;
  title: string;
  description: string;
  category: string | null;
  tools: string | null;
  impact: string | null;
  url: string | null;
  person: PersonRef;
  site: SiteRef;
  likes: { personId: string }[];
  sharedWith: SiteRef[];
  createdAt: string;
}

interface ForumItem {
  id: string;
  title: string;
  content: string;
  category: string | null;
  person: PersonRef;
  site: SiteRef;
  replies: { id: string }[];
  sharedWith: SiteRef[];
  createdAt: string;
}

interface TechTipItem {
  id: string;
  title: string;
  content: string;
  category: string | null;
  person: PersonRef;
  site: SiteRef;
  likes: { personId: string }[];
  sharedWith: SiteRef[];
  createdAt: string;
}

type ContentItem = UseCaseItem | ForumItem | TechTipItem;

// ------- Component -------

export function ContentManager({ defaultTab }: { defaultTab: string }) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="use-cases" className="gap-2">
            <Lightbulb className="h-4 w-4" />
            Use Cases
          </TabsTrigger>
          <TabsTrigger value="forum" className="gap-2">
            <MessageCircle className="h-4 w-4" />
            Forum
          </TabsTrigger>
          <TabsTrigger value="tech-tips" className="gap-2">
            <Code2 className="h-4 w-4" />
            Tech Tips
          </TabsTrigger>
        </TabsList>

        <TabsContent value="use-cases" className="mt-4">
          <ContentList type="use-cases" />
        </TabsContent>
        <TabsContent value="forum" className="mt-4">
          <ContentList type="forum" />
        </TabsContent>
        <TabsContent value="tech-tips" className="mt-4">
          <ContentList type="tech-tips" />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ------- Generic content list -------

const TYPE_LABELS: Record<string, { singular: string; plural: string; icon: typeof Lightbulb }> = {
  "use-cases": { singular: "Use Case", plural: "Use Cases", icon: Lightbulb },
  "forum": { singular: "Discussion", plural: "Discussions Forum", icon: MessageCircle },
  "tech-tips": { singular: "Tech Tip", plural: "Tech Tips", icon: Code2 },
};

function ContentList({ type }: { type: string }) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [sites, setSites] = useState<SiteRef[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [siteFilter, setSiteFilter] = useState("");
  const [editItem, setEditItem] = useState<ContentItem | null>(null);
  const [shareItem, setShareItem] = useState<ContentItem | null>(null);

  const meta = TYPE_LABELS[type];

  const fetchData = useCallback(async () => {
    const res = await fetch(`/api/studio/content?type=${type}`);
    if (res.ok) {
      const data = await res.json();
      setItems(data.items);
      setSites(data.sites);
    }
    setLoading(false);
  }, [type]);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: string) => {
    if (!confirm(`Supprimer ce contenu ?`)) return;
    await fetch(`/api/studio/content?type=${type}&id=${id}`, { method: "DELETE" });
    fetchData();
  };

  const filtered = items.filter((item) => {
    const matchSearch =
      search === "" ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.person.name.toLowerCase().includes(search.toLowerCase());
    const matchSite = siteFilter === "" || item.site.id === siteFilter;
    return matchSearch && matchSite;
  });

  if (loading) return <div className="text-center py-8 text-gray-400">Chargement...</div>;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <meta.icon className="h-5 w-5 text-blue-500" />
          <h2 className="text-lg font-semibold">{meta.plural}</h2>
          <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-0.5">
            {items.length} total
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 text-sm pl-8 w-48"
            />
          </div>
          <select
            value={siteFilter}
            onChange={(e) => setSiteFilter(e.target.value)}
            className="h-8 rounded-md border border-gray-200 bg-white px-2 text-sm dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="">Tous les sites</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <meta.icon className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p>Aucun contenu trouvé</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <ContentRow
              key={item.id}
              item={item}
              type={type}
              sites={sites}
              onEdit={() => setEditItem(item)}
              onDelete={() => handleDelete(item.id)}
              onShare={() => setShareItem(item)}
            />
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      {editItem && (
        <EditDialog
          item={editItem}
          type={type}
          onClose={() => setEditItem(null)}
          onSaved={() => {
            setEditItem(null);
            fetchData();
          }}
        />
      )}

      {/* Share Dialog */}
      {shareItem && (
        <ShareDialog
          item={shareItem}
          type={type}
          sites={sites}
          onClose={() => setShareItem(null)}
          onChanged={() => {
            setShareItem(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
}

// ------- Row -------

function ContentRow({
  item,
  type,
  sites,
  onEdit,
  onDelete,
  onShare,
}: {
  item: ContentItem;
  type: string;
  sites: SiteRef[];
  onEdit: () => void;
  onDelete: () => void;
  onShare: () => void;
}) {
  const sharedWith = (item as UseCaseItem | ForumItem | TechTipItem).sharedWith || [];
  const interactionCount =
    type === "forum"
      ? (item as ForumItem).replies?.length || 0
      : (item as UseCaseItem | TechTipItem).likes?.length || 0;
  const interactionLabel = type === "forum" ? "réponse(s)" : "like(s)";

  return (
    <Card className="p-3 hover:shadow-sm transition">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-sm truncate">{item.title}</h3>
            {item.category && (
              <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-1.5 py-0.5 rounded">
                {item.category}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500 flex-wrap">
            <span className="font-medium text-gray-700 dark:text-gray-300">{item.site.name}</span>
            <span>·</span>
            <span>{item.person.name}</span>
            <span>·</span>
            <span>{new Date(item.createdAt).toLocaleDateString("fr-FR")}</span>
            <span>·</span>
            <span>
              {interactionCount} {interactionLabel}
            </span>
          </div>
          {sharedWith.length > 0 && (
            <div className="flex items-center gap-1 mt-1 flex-wrap">
              <Share2 className="h-3 w-3 text-green-500" />
              <span className="text-[10px] text-green-600 dark:text-green-400">
                Partagé avec : {sharedWith.map((s) => s.name).join(", ")}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={onShare} className="h-7 px-1.5" title="Partager avec un autre site">
            <Share2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onEdit} className="h-7 px-1.5" title="Modifier">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete} className="h-7 px-1.5 text-red-500" title="Supprimer">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

// ------- Edit Dialog -------

function EditDialog({
  item,
  type,
  onClose,
  onSaved,
}: {
  item: ContentItem;
  type: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<Record<string, string>>(() => {
    if (type === "use-cases") {
      const uc = item as UseCaseItem;
      return { title: uc.title, description: uc.description, category: uc.category || "", tools: uc.tools || "", impact: uc.impact || "", url: uc.url || "" } as Record<string, string>;
    }
    if (type === "forum") {
      const fp = item as ForumItem;
      return { title: fp.title, content: fp.content, category: fp.category || "" } as Record<string, string>;
    }
    const tt = item as TechTipItem;
    return { title: tt.title, content: tt.content, category: tt.category || "" } as Record<string, string>;
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch("/api/studio/content", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, id: item.id, ...form }),
    });
    if (res.ok) onSaved();
    setSaving(false);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Modifier – {item.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Input
            placeholder="Titre"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="h-9 text-sm"
          />
          {type === "use-cases" ? (
            <>
              <textarea
                placeholder="Description"
                value={form.description || ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700"
              />
              <div className="grid grid-cols-3 gap-2">
                <Input
                  placeholder="Catégorie"
                  value={form.category || ""}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="h-8 text-sm"
                />
                <Input
                  placeholder="Outils"
                  value={form.tools || ""}
                  onChange={(e) => setForm({ ...form, tools: e.target.value })}
                  className="h-8 text-sm"
                />
                <Input
                  placeholder="Impact"
                  value={form.impact || ""}
                  onChange={(e) => setForm({ ...form, impact: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
              <Input
                placeholder="URL à partager (optionnel)"
                value={form.url || ""}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                className="h-8 text-sm"
              />
            </>
          ) : (
            <>
              <textarea
                placeholder="Contenu"
                value={form.content || ""}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={6}
                className={`w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700 ${type === "tech-tips" ? "font-mono" : ""}`}
              />
              <Input
                placeholder="Catégorie"
                value={form.category || ""}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="h-8 text-sm"
              />
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave} isLoading={saving}>
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ------- Share Dialog -------

function ShareDialog({
  item,
  type,
  sites,
  onClose,
  onChanged,
}: {
  item: ContentItem;
  type: string;
  sites: SiteRef[];
  onClose: () => void;
  onChanged: () => void;
}) {
  const sharedWith = (item as UseCaseItem | ForumItem | TechTipItem).sharedWith || [];
  const sharedIds = new Set(sharedWith.map((s) => s.id));
  const [loading, setLoading] = useState<string | null>(null);

  // All sites except the origin site
  const otherSites = sites.filter((s) => s.id !== item.site.id);

  const handleToggle = async (targetSiteId: string, isShared: boolean) => {
    setLoading(targetSiteId);
    await fetch("/api/studio/content", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        id: item.id,
        action: isShared ? "unshare" : "share",
        targetSiteId,
      }),
    });
    onChanged();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Partager avec d&apos;autres sites
          </DialogTitle>
        </DialogHeader>
        <div className="py-2">
          <p className="text-sm text-gray-500 mb-3">
            <span className="font-medium text-gray-700 dark:text-gray-300">{item.title}</span>
            <br />
            Origine : <span className="font-medium">{item.site.name}</span>
          </p>
          {otherSites.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Aucun autre site disponible</p>
          ) : (
            <div className="space-y-1.5">
              {otherSites.map((site) => {
                const isShared = sharedIds.has(site.id);
                return (
                  <div
                    key={site.id}
                    className={`flex items-center justify-between p-2.5 rounded-lg border transition ${
                      isShared
                        ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ArrowRight className={`h-3.5 w-3.5 ${isShared ? "text-green-500" : "text-gray-300"}`} />
                      <span className="text-sm font-medium">{site.name}</span>
                    </div>
                    <Button
                      variant={isShared ? "outline" : "default"}
                      size="sm"
                      className={`h-7 text-xs ${isShared ? "text-red-500 border-red-200 hover:bg-red-50" : ""}`}
                      onClick={() => handleToggle(site.id, isShared)}
                      disabled={loading === site.id}
                    >
                      {isShared ? (
                        <>
                          <X className="h-3 w-3 mr-1" /> Retirer
                        </>
                      ) : (
                        <>
                          <Check className="h-3 w-3 mr-1" /> Partager
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
