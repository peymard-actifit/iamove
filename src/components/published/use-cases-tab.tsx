"use client";

import { useState, useEffect, useCallback } from "react";
import { Button, Input } from "@/components/ui";
import { Plus, Heart, Pencil, Trash2, Lightbulb, Wrench, TrendingUp, X } from "lucide-react";

interface Person {
  id: string;
  name: string;
  jobTitle: string | null;
  avatar: string | null;
}

interface UseCase {
  id: string;
  title: string;
  description: string;
  category: string | null;
  tools: string | null;
  impact: string | null;
  status: string;
  person: Person;
  likes: { personId: string }[];
  createdAt: string;
}

interface UseCasesTabProps {
  siteId: string;
  currentPersonId: string;
}

const CATEGORIES = ["Automatisation", "Analyse", "Génération", "Productivité", "Communication", "Autre"];

export function UseCasesTab({ siteId, currentPersonId }: UseCasesTabProps) {
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", category: "", tools: "", impact: "" });
  const [filter, setFilter] = useState("");

  const fetchUseCases = useCallback(async () => {
    const res = await fetch(`/api/sites/${siteId}/use-cases`);
    if (res.ok) setUseCases(await res.json());
    setLoading(false);
  }, [siteId]);

  useEffect(() => { fetchUseCases(); }, [fetchUseCases]);

  const handleSubmit = async () => {
    if (!form.title || !form.description) return;
    const method = editId ? "PATCH" : "POST";
    const body = editId ? { ...form, id: editId } : form;
    const res = await fetch(`/api/sites/${siteId}/use-cases`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setShowForm(false);
      setEditId(null);
      setForm({ title: "", description: "", category: "", tools: "", impact: "" });
      fetchUseCases();
    }
  };

  const handleLike = async (useCaseId: string) => {
    await fetch(`/api/sites/${siteId}/use-cases`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "like", useCaseId }),
    });
    fetchUseCases();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce use case ?")) return;
    await fetch(`/api/sites/${siteId}/use-cases?id=${id}`, { method: "DELETE" });
    fetchUseCases();
  };

  const startEdit = (uc: UseCase) => {
    setForm({ title: uc.title, description: uc.description, category: uc.category || "", tools: uc.tools || "", impact: uc.impact || "" });
    setEditId(uc.id);
    setShowForm(true);
  };

  const filtered = useCases.filter((uc) =>
    filter === "" || uc.category === filter
  );

  if (loading) return <div className="text-center py-8 text-gray-400">Chargement...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          <h2 className="text-lg font-semibold">Use Cases IA</h2>
          <span className="text-xs text-gray-500">({useCases.length})</span>
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
          <Button size="sm" onClick={() => { setShowForm(true); setEditId(null); setForm({ title: "", description: "", category: "", tools: "", impact: "" }); }} className="h-8 gap-1">
            <Plus className="h-3.5 w-3.5" /> Partager
          </Button>
        </div>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="border rounded-lg p-4 bg-white dark:bg-gray-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm">{editId ? "Modifier" : "Nouveau"} Use Case</h3>
            <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setEditId(null); }}><X className="h-4 w-4" /></Button>
          </div>
          <Input placeholder="Titre du use case *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="h-8 text-sm" />
          <textarea
            placeholder="Description détaillée du use case... *"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="h-8 rounded-md border border-gray-200 bg-white px-2 text-sm dark:bg-gray-900 dark:border-gray-700"
            >
              <option value="">Catégorie</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <Input placeholder="Outils utilisés" value={form.tools} onChange={(e) => setForm({ ...form, tools: e.target.value })} className="h-8 text-sm" />
            <Input placeholder="Impact observé" value={form.impact} onChange={(e) => setForm({ ...form, impact: e.target.value })} className="h-8 text-sm" />
          </div>
          <Button size="sm" onClick={handleSubmit} className="h-8">{editId ? "Enregistrer" : "Publier"}</Button>
        </div>
      )}

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Lightbulb className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p>Aucun use case partagé</p>
          <p className="text-xs mt-1">Soyez le premier à partager votre expérience !</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((uc) => {
            const isLiked = uc.likes.some((l) => l.personId === currentPersonId);
            const isMine = uc.person.id === currentPersonId;
            return (
              <div key={uc.id} className="border rounded-lg p-4 bg-white dark:bg-gray-800 hover:shadow-sm transition">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm">{uc.title}</h3>
                      {uc.category && (
                        <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-1.5 py-0.5 rounded">
                          {uc.category}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {uc.person.name} · {new Date(uc.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => handleLike(uc.id)} className={`h-7 px-2 gap-1 ${isLiked ? "text-red-500" : "text-gray-400"}`}>
                      <Heart className={`h-3.5 w-3.5 ${isLiked ? "fill-current" : ""}`} />
                      <span className="text-xs">{uc.likes.length}</span>
                    </Button>
                    {isMine && (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => startEdit(uc)} className="h-7 px-1.5"><Pencil className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(uc.id)} className="h-7 px-1.5 text-red-500"><Trash2 className="h-3 w-3" /></Button>
                      </>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 whitespace-pre-wrap">{uc.description}</p>
                {(uc.tools || uc.impact) && (
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    {uc.tools && <span className="flex items-center gap-1"><Wrench className="h-3 w-3" />{uc.tools}</span>}
                    {uc.impact && <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" />{uc.impact}</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
