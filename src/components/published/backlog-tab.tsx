"use client";

import { useState, useEffect, useCallback } from "react";
import { Button, Input, Card } from "@/components/ui";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui";
import { Plus, ChevronDown, ChevronUp, Rocket, Eye, Calendar, User, Briefcase, Tag, ArrowUpDown } from "lucide-react";
import { useI18n } from "@/lib/i18n";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PersonRef {
  id: string;
  name: string;
  department: string | null;
}

interface BacklogItem {
  id: string;
  title: string;
  description: string;
  service: string | null;
  category: string | null;
  tools: string | null;
  impact: string | null;
  url: string | null;
  priority: number;
  status: string;
  estimatedEffort: string | null;
  actualEffort: string | null;
  targetDate: string | null;
  notes: string | null;
  creator: PersonRef;
  owner: PersonRef | null;
  sponsor: PersonRef | null;
  promotedUseCase: { id: string } | null;
  createdAt: string;
}

interface BacklogTabProps {
  siteId: string;
  personId: string;
  isAdmin: boolean;
  persons: { id: string; name: string; department: string | null }[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  A_VALIDER: { label: "À valider", color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30" },
  EN_ATTENTE: { label: "En attente", color: "text-gray-700 dark:text-gray-400", bg: "bg-gray-100 dark:bg-gray-800" },
  VALIDE: { label: "Validé", color: "text-green-700 dark:text-green-400", bg: "bg-green-100 dark:bg-green-900/30" },
  REFUSE: { label: "Refusé", color: "text-red-700 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/30" },
  EN_DEV: { label: "En dev", color: "text-blue-700 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30" },
  MEP: { label: "MEP", color: "text-purple-700 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-900/30" },
};

const PRIORITY_LABELS: Record<number, string> = { 0: "—", 1: "Haute", 2: "Moyenne", 3: "Basse" };

const CATEGORIES = ["Automatisation", "Analyse", "Génération", "Productivité", "Support", "RH", "Finance", "Marketing", "IT", "Autre"];

// ─── Component ────────────────────────────────────────────────────────────────

export function BacklogTab({ siteId, personId, isAdmin, persons }: BacklogTabProps) {
  const { t } = useI18n();
  const [items, setItems] = useState<BacklogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [detailItem, setDetailItem] = useState<BacklogItem | null>(null);

  const fetchItems = useCallback(async () => {
    const res = await fetch(`/api/sites/${siteId}/backlog`);
    if (res.ok) setItems(await res.json());
    setLoading(false);
  }, [siteId]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handlePromote = async (item: BacklogItem) => {
    if (!confirm(`Promouvoir "${item.title}" en Use Case ? Il sera supprimé du backlog et ajouté aux Use Cases de l'owner${item.sponsor ? " et du sponsor" : ""}.`)) return;
    const res = await fetch(`/api/sites/${siteId}/backlog`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, action: "promote" }),
    });
    if (res.ok) fetchItems();
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.backlog?.deleteConfirm || "Supprimer cet item du backlog ?")) return;
    await fetch(`/api/sites/${siteId}/backlog?id=${id}`, { method: "DELETE" });
    fetchItems();
  };

  const filtered = items.filter((i) => filter === "all" || i.status === filter);

  const statusCounts = items.reduce<Record<string, number>>((acc, i) => {
    acc[i.status] = (acc[i.status] || 0) + 1;
    return acc;
  }, {});

  if (loading) return <div className="text-center py-8 text-gray-400">{t.common?.loading || "Chargement..."}</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-4 p-2">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold">Backlog</h2>
          <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-0.5">{items.length}</span>
        </div>
        <Button size="sm" onClick={() => setShowForm(true)} className="gap-1">
          <Plus className="h-3.5 w-3.5" /> Proposer un cas d&apos;usage
        </Button>
      </div>

      {/* Filtres par statut */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setFilter("all")}
          className={`text-xs px-2.5 py-1 rounded-full transition-colors ${filter === "all" ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200"}`}
        >
          Tous ({items.length})
        </button>
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`text-xs px-2.5 py-1 rounded-full transition-colors ${filter === key ? `${cfg.bg} ${cfg.color} font-semibold` : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200"}`}
          >
            {cfg.label} ({statusCounts[key] || 0})
          </button>
        ))}
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <Card className="p-8 text-center text-gray-400">
          {filter === "all" ? (t.backlog?.noItems || "Aucun cas d'usage dans le backlog") : `${t.backlog?.noItems || "Aucun cas d'usage"} "${STATUS_CONFIG[filter]?.label}"`}
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <BacklogCard
              key={item.id}
              item={item}
              personId={personId}
              isAdmin={isAdmin}
              onPromote={() => handlePromote(item)}
              onDelete={() => handleDelete(item.id)}
              onDetail={() => setDetailItem(item)}
            />
          ))}
        </div>
      )}

      {/* Formulaire de proposition */}
      {showForm && (
        <ProposalForm
          siteId={siteId}
          persons={persons}
          onClose={() => setShowForm(false)}
          onCreated={() => { setShowForm(false); fetchItems(); }}
        />
      )}

      {/* Détail en lecture */}
      {detailItem && (
        <DetailDialog item={detailItem} onClose={() => setDetailItem(null)} />
      )}
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function BacklogCard({
  item,
  personId,
  isAdmin,
  onPromote,
  onDelete,
  onDetail,
}: {
  item: BacklogItem;
  personId: string;
  isAdmin: boolean;
  onPromote: () => void;
  onDelete: () => void;
  onDetail: () => void;
}) {
  const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.A_VALIDER;
  const isMine = item.creator.id === personId;

  return (
    <Card className="p-3 hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-3">
        {/* Priorité */}
        <div className="flex flex-col items-center gap-0.5 pt-0.5">
          <ArrowUpDown className="h-3 w-3 text-gray-300" />
          <span className={`text-[10px] font-bold ${item.priority === 1 ? "text-red-500" : item.priority === 2 ? "text-amber-500" : item.priority === 3 ? "text-blue-500" : "text-gray-300"}`}>
            {PRIORITY_LABELS[item.priority] || "—"}
          </span>
        </div>

        {/* Contenu principal */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-sm">{item.title}</h3>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${cfg.bg} ${cfg.color}`}>
              {cfg.label}
            </span>
            {item.category && (
              <span className="text-[10px] text-gray-500 flex items-center gap-0.5">
                <Tag className="h-2.5 w-2.5" /> {item.category}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
          <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-400 flex-wrap">
            <span className="flex items-center gap-0.5"><User className="h-2.5 w-2.5" /> {item.creator.name}</span>
            {item.owner && <span className="flex items-center gap-0.5"><Briefcase className="h-2.5 w-2.5" /> Owner: {item.owner.name}</span>}
            {item.sponsor && <span>Sponsor: {item.sponsor.name}</span>}
            {item.service && <span>Service: {item.service}</span>}
            {item.targetDate && <span className="flex items-center gap-0.5"><Calendar className="h-2.5 w-2.5" /> {new Date(item.targetDate).toLocaleDateString("fr-FR")}</span>}
            {item.estimatedEffort && <span>Charge: {item.estimatedEffort}</span>}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={onDetail} className="h-7 px-1.5" title="Voir le détail">
            <Eye className="h-3.5 w-3.5" />
          </Button>
          {isAdmin && item.status === "MEP" && !item.promotedUseCase && (
            <Button variant="ghost" size="sm" onClick={onPromote} className="h-7 px-1.5 text-purple-500" title="Promouvoir en Use Case">
              <Rocket className="h-3.5 w-3.5" />
            </Button>
          )}
          {(isAdmin || isMine) && item.status === "A_VALIDER" && (
            <Button variant="ghost" size="sm" onClick={onDelete} className="h-7 px-1.5 text-red-500" title="Supprimer">
              ✕
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

// ─── Formulaire de proposition ────────────────────────────────────────────────

function ProposalForm({
  siteId,
  persons,
  onClose,
  onCreated,
}: {
  siteId: string;
  persons: { id: string; name: string; department: string | null }[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const { t } = useI18n();
  const [form, setForm] = useState({
    title: "", description: "", service: "", category: "", tools: "", impact: "", url: "", ownerId: "", sponsorId: "", targetDate: "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.title || !form.description) return;
    setSaving(true);
    const res = await fetch(`/api/sites/${siteId}/backlog`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) onCreated();
    setSaving(false);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Proposer un cas d&apos;usage
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1">
            <label className="text-xs font-medium">Titre *</label>
            <Input placeholder="Nom du cas d'usage" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="h-9 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">Description *</label>
            <textarea
              placeholder="Décrivez le cas d'usage, son contexte et ses objectifs..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-medium">Service</label>
              <Input placeholder="Ex: Marketing" value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Catégorie</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full h-8 rounded-md border border-gray-200 bg-white px-2 text-sm dark:bg-gray-900 dark:border-gray-700">
                <option value="">Choisir...</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-medium">Outils / technologies</label>
              <Input placeholder="Ex: ChatGPT, Copilot" value={form.tools} onChange={(e) => setForm({ ...form, tools: e.target.value })} className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Impact attendu</label>
              <Input placeholder="Ex: Gain 2h/semaine" value={form.impact} onChange={(e) => setForm({ ...form, impact: e.target.value })} className="h-8 text-sm" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">URL de référence</label>
            <Input placeholder="https://..." value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className="h-8 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-medium">Owner suggéré</label>
              <select value={form.ownerId} onChange={(e) => setForm({ ...form, ownerId: e.target.value })} className="w-full h-8 rounded-md border border-gray-200 bg-white px-2 text-sm dark:bg-gray-900 dark:border-gray-700">
                <option value="">Non défini</option>
                {persons.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Sponsor suggéré</label>
              <select value={form.sponsorId} onChange={(e) => setForm({ ...form, sponsorId: e.target.value })} className="w-full h-8 rounded-md border border-gray-200 bg-white px-2 text-sm dark:bg-gray-900 dark:border-gray-700">
                <option value="">Non défini</option>
                {persons.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">Date cible</label>
            <Input type="date" value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} className="h-8 text-sm" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t.common?.cancel || "Annuler"}</Button>
          <Button onClick={handleSubmit} disabled={saving || !form.title || !form.description}>
            {saving ? (t.common?.saving || "Envoi...") : (t.backlog?.proposeUseCase || "Proposer")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Détail en lecture seule ──────────────────────────────────────────────────

function DetailDialog({ item, onClose }: { item: BacklogItem; onClose: () => void }) {
  const { t } = useI18n();
  const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.A_VALIDER;
  const fields = [
    { label: "Statut", value: cfg.label },
    { label: "Priorité", value: PRIORITY_LABELS[item.priority] || "Non priorisé" },
    { label: "Service", value: item.service },
    { label: "Catégorie", value: item.category },
    { label: "Outils", value: item.tools },
    { label: "Impact attendu", value: item.impact },
    { label: "URL", value: item.url },
    { label: "Créateur", value: item.creator.name },
    { label: "Owner", value: item.owner?.name },
    { label: "Sponsor", value: item.sponsor?.name },
    { label: "Charge prévisionnelle", value: item.estimatedEffort },
    { label: "Charge réelle", value: item.actualEffort },
    { label: "Date cible", value: item.targetDate ? new Date(item.targetDate).toLocaleDateString("fr-FR") : null },
    { label: "Notes refinement", value: item.notes },
    { label: "Date de création", value: new Date(item.createdAt).toLocaleDateString("fr-FR") },
  ];

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-4 w-4" /> {item.title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{item.description}</p>
          <div className="border-t pt-3 mt-3 space-y-2">
            {fields.filter((f) => f.value).map((f) => (
              <div key={f.label} className="flex items-start gap-2">
                <span className="text-xs font-medium text-gray-500 w-36 flex-shrink-0">{f.label}</span>
                <span className="text-sm">{f.value}</span>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t.common?.close || "Fermer"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
