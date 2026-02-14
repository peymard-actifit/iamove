"use client";

import { useState, useEffect, useCallback } from "react";
import { Button, Input, Card } from "@/components/ui";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui";
import { CheckCircle, XCircle, Clock, Pencil, ChevronDown, Save, ArrowUp, ArrowDown } from "lucide-react";
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

interface RefinementTabProps {
  siteId: string;
  persons: { id: string; name: string; department: string | null }[];
}

const STATUS_OPTIONS = [
  { value: "A_VALIDER", label: "À valider", icon: "🟡" },
  { value: "EN_ATTENTE", label: "En attente", icon: "⏳" },
  { value: "VALIDE", label: "Validé", icon: "✅" },
  { value: "REFUSE", label: "Refusé", icon: "❌" },
  { value: "EN_DEV", label: "En dev", icon: "🔧" },
  { value: "MEP", label: "MEP", icon: "🚀" },
];

const PRIORITY_OPTIONS = [
  { value: 0, label: "Non priorisé" },
  { value: 1, label: "🔴 Haute" },
  { value: 2, label: "🟠 Moyenne" },
  { value: 3, label: "🔵 Basse" },
];

const CATEGORIES = ["Automatisation", "Analyse", "Génération", "Productivité", "Support", "RH", "Finance", "Marketing", "IT", "Autre"];

// ─── Component ────────────────────────────────────────────────────────────────

export function RefinementTab({ siteId, persons }: RefinementTabProps) {
  const { t } = useI18n();
  const [items, setItems] = useState<BacklogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState<BacklogItem | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchItems = useCallback(async () => {
    const res = await fetch(`/api/sites/${siteId}/backlog`);
    if (res.ok) setItems(await res.json());
    setLoading(false);
  }, [siteId]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const quickUpdateStatus = async (id: string, status: string) => {
    await fetch(`/api/sites/${siteId}/backlog`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    fetchItems();
  };

  const quickUpdatePriority = async (id: string, priority: number) => {
    await fetch(`/api/sites/${siteId}/backlog`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, priority }),
    });
    fetchItems();
  };

  const filtered = items.filter((i) => statusFilter === "all" || i.status === statusFilter);

  if (loading) return <div className="text-center py-8 text-gray-400">{t.common?.loading || "Chargement..."}</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-4 p-2">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-bold">Refinement</h2>
          <p className="text-xs text-gray-500">Revue, priorisation et validation des cas d&apos;usage du backlog</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 rounded-md border border-gray-200 bg-white px-2 text-xs dark:bg-gray-900 dark:border-gray-700"
          >
            <option value="all">Tous ({items.length})</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.icon} {s.label} ({items.filter((i) => i.status === s.value).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <Card className="p-8 text-center text-gray-400">{t.refinementTab?.noItems || "Aucun item à afficher"}</Card>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 text-[10px] text-gray-500 uppercase">
              <tr>
                <th className="px-3 py-2 text-left w-8">P</th>
                <th className="px-3 py-2 text-left">Titre</th>
                <th className="px-3 py-2 text-left w-24">Statut</th>
                <th className="px-3 py-2 text-left w-28">Owner</th>
                <th className="px-3 py-2 text-left w-24">Charge</th>
                <th className="px-3 py-2 text-left w-24">Date</th>
                <th className="px-3 py-2 text-right w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  {/* Priorité */}
                  <td className="px-3 py-2">
                    <div className="flex flex-col gap-0.5">
                      <button onClick={() => quickUpdatePriority(item.id, Math.max(0, item.priority - 1))} className="text-gray-300 hover:text-gray-600">
                        <ArrowUp className="h-3 w-3" />
                      </button>
                      <span className={`text-[10px] font-bold text-center ${item.priority === 1 ? "text-red-500" : item.priority === 2 ? "text-amber-500" : item.priority === 3 ? "text-blue-500" : "text-gray-300"}`}>
                        {item.priority || "—"}
                      </span>
                      <button onClick={() => quickUpdatePriority(item.id, Math.min(3, item.priority + 1))} className="text-gray-300 hover:text-gray-600">
                        <ArrowDown className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                  {/* Titre */}
                  <td className="px-3 py-2">
                    <p className="font-medium text-sm truncate max-w-xs">{item.title}</p>
                    <p className="text-[10px] text-gray-400 truncate max-w-xs">{item.creator.name} • {item.category || "Sans catégorie"}</p>
                  </td>
                  {/* Statut - changement rapide */}
                  <td className="px-3 py-2">
                    <select
                      value={item.status}
                      onChange={(e) => quickUpdateStatus(item.id, e.target.value)}
                      className="h-7 rounded border text-[10px] px-1 bg-white dark:bg-gray-900 dark:border-gray-700 w-full"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>{s.icon} {s.label}</option>
                      ))}
                    </select>
                  </td>
                  {/* Owner */}
                  <td className="px-3 py-2 text-xs text-gray-500 truncate">
                    {item.owner?.name || "—"}
                  </td>
                  {/* Charge */}
                  <td className="px-3 py-2 text-xs text-gray-500">
                    {item.estimatedEffort || "—"}
                  </td>
                  {/* Date */}
                  <td className="px-3 py-2 text-xs text-gray-500">
                    {item.targetDate ? new Date(item.targetDate).toLocaleDateString("fr-FR") : "—"}
                  </td>
                  {/* Actions */}
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end gap-0.5">
                      <Button variant="ghost" size="sm" onClick={() => setEditItem(item)} className="h-7 px-1.5" title="Éditer">
                        <Pencil className="h-3 w-3" />
                      </Button>
                      {item.status !== "VALIDE" && item.status !== "EN_DEV" && item.status !== "MEP" && (
                        <Button variant="ghost" size="sm" onClick={() => quickUpdateStatus(item.id, "VALIDE")} className="h-7 px-1.5 text-green-500" title="Valider">
                          <CheckCircle className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {item.status === "A_VALIDER" && (
                        <Button variant="ghost" size="sm" onClick={() => quickUpdateStatus(item.id, "REFUSE")} className="h-7 px-1.5 text-red-500" title="Refuser">
                          <XCircle className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {item.status === "A_VALIDER" && (
                        <Button variant="ghost" size="sm" onClick={() => quickUpdateStatus(item.id, "EN_ATTENTE")} className="h-7 px-1.5 text-gray-400" title="En attente">
                          <Clock className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Dialog */}
      {editItem && (
        <EditRefinementDialog
          item={editItem}
          siteId={siteId}
          persons={persons}
          onClose={() => setEditItem(null)}
          onSaved={() => { setEditItem(null); fetchItems(); }}
        />
      )}
    </div>
  );
}

// ─── Edit Dialog ──────────────────────────────────────────────────────────────

function EditRefinementDialog({
  item,
  siteId,
  persons,
  onClose,
  onSaved,
}: {
  item: BacklogItem;
  siteId: string;
  persons: { id: string; name: string; department: string | null }[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t } = useI18n();
  const [form, setForm] = useState({
    title: item.title,
    description: item.description,
    service: item.service || "",
    category: item.category || "",
    tools: item.tools || "",
    impact: item.impact || "",
    url: item.url || "",
    priority: item.priority,
    status: item.status,
    estimatedEffort: item.estimatedEffort || "",
    actualEffort: item.actualEffort || "",
    targetDate: item.targetDate ? item.targetDate.split("T")[0] : "",
    notes: item.notes || "",
    ownerId: item.owner?.id || "",
    sponsorId: item.sponsor?.id || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch(`/api/sites/${siteId}/backlog`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, ...form }),
    });
    if (res.ok) onSaved();
    setSaving(false);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-4 w-4" /> Refinement — {item.title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1 col-span-2">
              <label className="text-xs font-medium">Titre</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="h-9 text-sm" />
            </div>
            <div className="space-y-1 col-span-2">
              <label className="text-xs font-medium">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Statut</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full h-9 rounded-md border border-gray-200 bg-white px-2 text-sm dark:bg-gray-900 dark:border-gray-700">
                {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.icon} {s.label}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Priorité</label>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) })} className="w-full h-9 rounded-md border border-gray-200 bg-white px-2 text-sm dark:bg-gray-900 dark:border-gray-700">
                {PRIORITY_OPTIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Owner</label>
              <select value={form.ownerId} onChange={(e) => setForm({ ...form, ownerId: e.target.value })} className="w-full h-9 rounded-md border border-gray-200 bg-white px-2 text-sm dark:bg-gray-900 dark:border-gray-700">
                <option value="">Non défini</option>
                {persons.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Sponsor</label>
              <select value={form.sponsorId} onChange={(e) => setForm({ ...form, sponsorId: e.target.value })} className="w-full h-9 rounded-md border border-gray-200 bg-white px-2 text-sm dark:bg-gray-900 dark:border-gray-700">
                <option value="">Non défini</option>
                {persons.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Service</label>
              <Input value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Catégorie</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full h-8 rounded-md border border-gray-200 bg-white px-2 text-sm dark:bg-gray-900 dark:border-gray-700">
                <option value="">Choisir...</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Outils</label>
              <Input value={form.tools} onChange={(e) => setForm({ ...form, tools: e.target.value })} className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Impact</label>
              <Input value={form.impact} onChange={(e) => setForm({ ...form, impact: e.target.value })} className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Charge prévisionnelle</label>
              <Input value={form.estimatedEffort} onChange={(e) => setForm({ ...form, estimatedEffort: e.target.value })} placeholder="Ex: 5 jours" className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Charge réelle</label>
              <Input value={form.actualEffort} onChange={(e) => setForm({ ...form, actualEffort: e.target.value })} placeholder="Ex: 8 jours" className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Date cible</label>
              <Input type="date" value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">URL</label>
              <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className="h-8 text-sm" />
            </div>
            <div className="space-y-1 col-span-2">
              <label className="text-xs font-medium">Notes du Scrum Master</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} placeholder="Notes de refinement, commentaires, décisions..." className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t.common?.cancel || "Annuler"}</Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-1" /> {saving ? "Sauvegarde..." : (t.common?.save || "Enregistrer")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
