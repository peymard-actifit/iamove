"use client";

import { useState, useEffect, useCallback } from "react";
import { Button, Input } from "@/components/ui";
import { Plus, Heart, Trash2, Code2, X } from "lucide-react";

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
  const [tips, setTips] = useState<TechTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", category: "" });
  const [filter, setFilter] = useState("");

  const fetchTips = useCallback(async () => {
    const res = await fetch(`/api/sites/${siteId}/tech-tips`);
    if (res.ok) setTips(await res.json());
    setLoading(false);
  }, [siteId]);

  useEffect(() => { fetchTips(); }, [fetchTips]);

  const handleSubmit = async () => {
    if (!form.title || !form.content) return;
    const res = await fetch(`/api/sites/${siteId}/tech-tips`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowForm(false);
      setForm({ title: "", content: "", category: "" });
      fetchTips();
    }
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
    if (!confirm("Supprimer ce conseil technique ?")) return;
    await fetch(`/api/sites/${siteId}/tech-tips?id=${id}`, { method: "DELETE" });
    fetchTips();
  };

  const filtered = tips.filter((t) => filter === "" || t.category === filter);

  if (loading) return <div className="text-center py-8 text-gray-400">Chargement...</div>;

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
          <Button size="sm" onClick={() => { setShowForm(true); setForm({ title: "", content: "", category: "" }); }} className="h-8 gap-1">
            <Plus className="h-3.5 w-3.5" /> Partager
          </Button>
        </div>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="border rounded-lg p-4 bg-white dark:bg-gray-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm">Nouveau conseil technique</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}><X className="h-4 w-4" /></Button>
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
            <Button size="sm" onClick={handleSubmit} className="h-8">Publier</Button>
          </div>
        </div>
      )}

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Code2 className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p>Aucun conseil technique</p>
          <p className="text-xs mt-1">Partagez vos découvertes techniques !</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((tip) => {
            const isLiked = tip.likes.some((l) => l.personId === currentPersonId);
            const isMine = tip.person.id === currentPersonId;
            return (
              <div key={tip.id} className="border rounded-lg p-4 bg-white dark:bg-gray-800 hover:shadow-sm transition">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm">{tip.title}</h3>
                      {tip.category && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-1.5 py-0.5 rounded">
                          {tip.category}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {tip.person.name} · {new Date(tip.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => handleLike(tip.id)} className={`h-7 px-2 gap-1 ${isLiked ? "text-red-500" : "text-gray-400"}`}>
                      <Heart className={`h-3.5 w-3.5 ${isLiked ? "fill-current" : ""}`} />
                      <span className="text-xs">{tip.likes.length}</span>
                    </Button>
                    {isMine && (
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(tip.id)} className="h-7 px-1.5 text-red-500"><Trash2 className="h-3 w-3" /></Button>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300 mt-2 whitespace-pre-wrap font-mono bg-gray-50 dark:bg-gray-900 p-3 rounded">
                  {tip.content}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
