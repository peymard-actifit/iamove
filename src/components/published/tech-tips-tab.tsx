"use client";

import { useState, useEffect, useCallback } from "react";
import { Button, Input, Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui";
import { Plus, Heart, Trash2, Code2, X, Pencil } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface Person {
  id: string;
  name: string;
  jobTitle: string | null;
  avatar: string | null;
}

interface TechTip {
  id: string;
  title: string;
  content: string;
  category: string | null;
  person: Person;
  likes: { personId: string }[];
  createdAt: string;
}

interface TechTipsTabProps {
  siteId: string;
  currentPersonId: string;
}

const CATEGORIES = ["API", "Outil", "Méthode", "Service Web", "Prompt", "Script", "Autre"];

export function TechTipsTab({ siteId, currentPersonId }: TechTipsTabProps) {
  const { t } = useI18n();
  const [tips, setTips] = useState<TechTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", content: "", category: "" });
  const [filter, setFilter] = useState("");
  const [selectedTip, setSelectedTip] = useState<TechTip | null>(null);

  const fetchTips = useCallback(async () => {
    const res = await fetch(`/api/sites/${siteId}/tech-tips`);
    if (res.ok) setTips(await res.json());
    setLoading(false);
  }, [siteId]);

  useEffect(() => { fetchTips(); }, [fetchTips]);

  const handleSubmit = async () => {
    if (!form.title || !form.content) return;
    const method = editId ? "PATCH" : "POST";
    const body = editId ? { ...form, id: editId } : form;
    const res = await fetch(`/api/sites/${siteId}/tech-tips`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setShowForm(false);
      setEditId(null);
      setForm({ title: "", content: "", category: "" });
      fetchTips();
    }
  };

  const startEdit = (tip: TechTip) => {
    setForm({ title: tip.title, content: tip.content, category: tip.category || "" });
    setEditId(tip.id);
    setSelectedTip(null);
    setShowForm(true);
  };

  const handleLike = async (techTipId: string) => {
    await fetch(`/api/sites/${siteId}/tech-tips`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "like", techTipId }),
    });
    fetchTips();
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.techTips?.deleteConfirm || "Supprimer ce conseil technique ?")) return;
    await fetch(`/api/sites/${siteId}/tech-tips?id=${id}`, { method: "DELETE" });
    fetchTips();
  };

  const filtered = tips.filter((t) => filter === "" || t.category === filter);

  if (loading) return <div className="text-center py-8 text-gray-400">{t.common?.loading || "Chargement..."}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Code2 className="h-5 w-5 text-emerald-500" />
          <h2 className="text-lg font-semibold">Tech Tips</h2>
          <span className="text-xs text-gray-500">({tips.length})</span>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-8 rounded-md border border-gray-200 bg-white px-2 text-sm dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="">Toutes catégories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <Button size="sm" onClick={() => { setShowForm(true); setEditId(null); setForm({ title: "", content: "", category: "" }); }} className="h-8 gap-1">
            <Plus className="h-3.5 w-3.5" /> Partager
          </Button>
        </div>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="border rounded-lg p-4 bg-white dark:bg-gray-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm">{editId ? (t.techTips?.editTip || "Modifier le conseil technique") : (t.techTips?.newTip || "Nouveau conseil technique")}</h3>
            <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setEditId(null); }}><X className="h-4 w-4" /></Button>
          </div>
          <Input placeholder="Titre *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="h-8 text-sm" />
          <textarea
            placeholder="Décrivez le conseil, l'API, la méthode, le service... *"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows={5}
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-mono dark:bg-gray-900 dark:border-gray-700"
          />
          <div className="flex items-center gap-2">
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="h-8 rounded-md border border-gray-200 bg-white px-2 text-sm dark:bg-gray-900 dark:border-gray-700"
            >
              <option value="">Catégorie</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <Button size="sm" onClick={handleSubmit} className="h-8">{editId ? (t.common?.save || "Enregistrer") : (t.useCases?.publish || "Publier")}</Button>
          </div>
        </div>
      )}

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Code2 className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p>{t.techTips?.noTips || "Aucun conseil technique"}</p>
          <p className="text-xs mt-1">Partagez vos découvertes techniques !</p>
        </div>
      ) : (
        <div className="grid gap-1.5">
          {filtered.map((tip) => {
            const isLiked = tip.likes.some((l) => l.personId === currentPersonId);
            const isMine = tip.person.id === currentPersonId;
            return (
              <div
                key={tip.id}
                className="border rounded-lg px-4 py-2.5 bg-white dark:bg-gray-800 hover:shadow-sm hover:border-emerald-300 dark:hover:border-emerald-600 transition cursor-pointer flex items-center justify-between gap-2"
                onClick={() => setSelectedTip(tip)}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{tip.title}</h3>
                  {tip.category && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-1.5 py-0.5 rounded flex-shrink-0">
                      {tip.category}
                    </span>
                  )}
                  <span className="text-[10px] text-gray-400 flex-shrink-0">{tip.person.name} · {new Date(tip.createdAt).toLocaleDateString("fr-FR")}</span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" onClick={() => handleLike(tip.id)} className={`h-7 px-2 gap-1 ${isLiked ? "text-red-500" : "text-gray-400"}`}>
                    <Heart className={`h-3.5 w-3.5 ${isLiked ? "fill-current" : ""}`} />
                    <span className="text-xs">{tip.likes.length}</span>
                  </Button>
                  {isMine && (
                    <>
                      {tip.likes.length === 0 && (
                        <Button variant="ghost" size="sm" onClick={() => startEdit(tip)} className="h-7 px-1.5"><Pencil className="h-3 w-3" /></Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(tip.id)} className="h-7 px-1.5 text-red-500"><Trash2 className="h-3 w-3" /></Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pop-up détail */}
      <Dialog open={!!selectedTip} onOpenChange={() => setSelectedTip(null)}>
        <DialogContent className="max-w-2xl">
          {selectedTip && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedTip.title}
                  {selectedTip.category && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-1.5 py-0.5 rounded font-normal">
                      {selectedTip.category}
                    </span>
                  )}
                </DialogTitle>
              </DialogHeader>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  {selectedTip.person.name} · {new Date(selectedTip.createdAt).toLocaleDateString("fr-FR")}
                </p>
                {selectedTip.person.id === currentPersonId && selectedTip.likes.length === 0 && (
                  <Button variant="outline" size="sm" onClick={() => startEdit(selectedTip)} className="h-7 gap-1 text-xs">
                    <Pencil className="h-3 w-3" /> {t.common?.edit || "Modifier"}
                  </Button>
                )}
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono bg-gray-50 dark:bg-gray-900 p-4 rounded max-h-[60vh] overflow-auto">
                {selectedTip.content}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
