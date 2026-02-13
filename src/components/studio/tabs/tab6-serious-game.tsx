"use client";

import { useState, useEffect, useCallback } from "react";
import { Button, Input } from "@/components/ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Award, Gift } from "lucide-react";
import { PP_GAINS } from "@/lib/pp-rules";

interface Badge {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  category: string | null;
  criteria: string | null;
  ppReward: number;
  earnedBy: { person: { id: string; name: string } }[];
}

interface Person {
  id: string;
  name: string;
}

interface Tab6SeriousGameProps {
  siteId: string;
  persons: Person[];
}

const BADGE_CATEGORIES = ["PP", "UseCase", "Forum", "Tech", "Quiz", "Spécial"];
const BADGE_ICONS = ["🏆", "⭐", "🎯", "🚀", "💡", "🔥", "💎", "🎓", "🏅", "👑", "🌟", "⚡"];

const CRITERIA_LABELS: Record<string, string> = {
  PP: "PP minimum",
  UseCase: "Nb use cases",
  Forum: "Nb posts forum",
  Tech: "Nb tech tips",
  Quiz: "Nb questions",
};

const CRITERIA_TYPES: Record<string, string> = {
  PP: "pp_threshold",
  UseCase: "usecase_count",
  Forum: "forum_count",
  Tech: "tech_count",
  Quiz: "quiz_count",
};

export function Tab6SeriousGame({ siteId, persons }: Tab6SeriousGameProps) {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", icon: "🏆", category: "", ppReward: 0, threshold: 0 });
  const [awardBadgeId, setAwardBadgeId] = useState<string | null>(null);
  const [awardPersonId, setAwardPersonId] = useState("");

  const fetchBadges = useCallback(async () => {
    const res = await fetch(`/api/sites/${siteId}/badges`);
    if (res.ok) setBadges(await res.json());
    setLoading(false);
  }, [siteId]);

  useEffect(() => { fetchBadges(); }, [fetchBadges]);

  const handleCreate = async () => {
    if (!form.name) return;
    // Construire le criteria JSON si catégorie et seuil définis
    const criteriaType = form.category ? CRITERIA_TYPES[form.category] : null;
    const criteria = criteriaType && form.threshold > 0
      ? { type: criteriaType, value: form.threshold }
      : undefined;
    const res = await fetch(`/api/sites/${siteId}/badges`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, criteria }),
    });
    if (res.ok) {
      setShowForm(false);
      setForm({ name: "", description: "", icon: "🏆", category: "", ppReward: 0, threshold: 0 });
      fetchBadges();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce badge ?")) return;
    await fetch(`/api/sites/${siteId}/badges?id=${id}`, { method: "DELETE" });
    fetchBadges();
  };

  const handleAward = async (badgeId: string) => {
    if (!awardPersonId) return;
    const res = await fetch(`/api/sites/${siteId}/badges`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "award", badgeId, personId: awardPersonId }),
    });
    if (res.ok) {
      setAwardBadgeId(null);
      setAwardPersonId("");
      fetchBadges();
    }
  };

  if (loading) return <div className="text-center py-8 text-gray-400">Chargement...</div>;

  return (
    <div className="space-y-6">
      {/* Section Badges */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-semibold">Badges</h2>
            <span className="text-xs text-gray-500">({badges.length})</span>
          </div>
          <Button size="sm" onClick={() => setShowForm(true)} className="h-8 gap-1">
            <Plus className="h-3.5 w-3.5" /> Nouveau badge
          </Button>
        </div>

        {/* Formulaire badge */}
        {showForm && (
          <div className="border rounded-lg p-4 mb-4 bg-white dark:bg-gray-800 space-y-3">
            <h3 className="font-medium text-sm">Nouveau badge</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Input placeholder="Nom du badge *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-8 text-sm" />
              <Input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="h-8 text-sm" />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">Icône:</span>
                <div className="flex gap-0.5">
                  {BADGE_ICONS.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setForm({ ...form, icon })}
                      className={`w-7 h-7 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${form.icon === icon ? "bg-amber-100 dark:bg-amber-900/30 ring-1 ring-amber-400" : ""}`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="h-8 rounded-md border border-gray-200 bg-white px-2 text-sm dark:bg-gray-900 dark:border-gray-700"
              >
                <option value="">Catégorie</option>
                {BADGE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {form.category && form.category !== "Spécial" && CRITERIA_LABELS[form.category] && (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">{CRITERIA_LABELS[form.category]} :</span>
                  <Input type="number" value={form.threshold} onChange={(e) => setForm({ ...form, threshold: parseInt(e.target.value) || 0 })} className="h-8 text-sm w-24" placeholder="Seuil" />
                </div>
              )}
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">PP récompense :</span>
                <Input type="number" value={form.ppReward} onChange={(e) => setForm({ ...form, ppReward: parseInt(e.target.value) || 0 })} className="h-8 text-sm w-20" />
              </div>
              <Button size="sm" onClick={handleCreate} className="h-8">Créer</Button>
              <Button size="sm" variant="ghost" onClick={() => setShowForm(false)} className="h-8">Annuler</Button>
            </div>
          </div>
        )}

        {/* Tableau des badges */}
        {badges.length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="h-7">
                  <TableHead className="text-xs py-1 w-10"></TableHead>
                  <TableHead className="text-xs py-1">Nom</TableHead>
                  <TableHead className="text-xs py-1">Catégorie</TableHead>
                  <TableHead className="text-xs py-1 w-20">Seuil</TableHead>
                  <TableHead className="text-xs py-1 w-16">PP</TableHead>
                  <TableHead className="text-xs py-1">Attribué à</TableHead>
                  <TableHead className="text-xs py-1 w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {badges.map((badge) => (
                  <TableRow key={badge.id} className="h-8">
                    <TableCell className="py-0.5 text-center">{badge.icon || "🏆"}</TableCell>
                    <TableCell className="py-0.5">
                      <div>
                        <span className="text-sm font-medium">{badge.name}</span>
                        {badge.description && <p className="text-[10px] text-gray-400">{badge.description}</p>}
                      </div>
                    </TableCell>
                    <TableCell className="py-0.5 text-xs text-gray-500">{badge.category || "—"}</TableCell>
                    <TableCell className="py-0.5 text-xs text-gray-500">
                      {(() => {
                        try {
                          const c = badge.criteria ? JSON.parse(badge.criteria) : null;
                          return c?.value ? `≥ ${c.value}` : "Manuel";
                        } catch { return "Manuel"; }
                      })()}
                    </TableCell>
                    <TableCell className="py-0.5 text-xs font-medium">{badge.ppReward > 0 ? `+${badge.ppReward}` : "—"}</TableCell>
                    <TableCell className="py-0.5">
                      <div className="flex flex-wrap gap-1">
                        {badge.earnedBy.map((pb) => (
                          <span key={pb.person.id} className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-1.5 py-0.5 rounded">
                            {pb.person.name}
                          </span>
                        ))}
                        {awardBadgeId === badge.id ? (
                          <div className="flex items-center gap-1">
                            <select
                              value={awardPersonId}
                              onChange={(e) => setAwardPersonId(e.target.value)}
                              className="h-6 rounded border text-[10px] px-1"
                            >
                              <option value="">Choisir...</option>
                              {persons.filter((p) => !badge.earnedBy.some((pb) => pb.person.id === p.id)).map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                            </select>
                            <Button size="sm" onClick={() => handleAward(badge.id)} className="h-6 px-1.5 text-[10px]">OK</Button>
                            <Button size="sm" variant="ghost" onClick={() => setAwardBadgeId(null)} className="h-6 px-1">✕</Button>
                          </div>
                        ) : (
                          <button onClick={() => setAwardBadgeId(badge.id)} className="text-[10px] text-blue-500 hover:underline">
                            <Gift className="h-3 w-3 inline" /> Attribuer
                          </button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-0.5">
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(badge.id)} className="h-6 px-1.5 text-red-500">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Section Règles PP */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🎮</span>
          <h2 className="text-lg font-semibold">Règles des Points de Participation</h2>
        </div>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="h-7">
                <TableHead className="text-xs py-1">Action</TableHead>
                <TableHead className="text-xs py-1">Description</TableHead>
                <TableHead className="text-xs py-1 w-16 text-right">PP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PP_GAINS.map((row) => (
                <TableRow key={row.action} className="h-7">
                  <TableCell className="py-0.5 text-sm font-medium">{row.label}</TableCell>
                  <TableCell className="py-0.5 text-xs text-gray-500">{row.description}</TableCell>
                  <TableCell className="py-0.5 text-sm font-bold text-right text-amber-600">+{row.pp}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
