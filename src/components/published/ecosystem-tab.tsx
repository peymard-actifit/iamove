"use client";

import { useState, useEffect, useCallback } from "react";
import { Button, Card } from "@/components/ui";
import { Globe, Pencil, Save, X, Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface EcosystemSection {
  id: string;
  title: string;
  content: string;
  icon: string;
}

interface EcosystemTabProps {
  siteId: string;
  isAdmin: boolean;
}

const DEFAULT_ICONS = ["🏗️", "🔧", "🌐", "📊", "🔒", "💾", "☁️", "📡", "🤖", "📋", "⚙️", "🔗"];

// ─── Component ────────────────────────────────────────────────────────────────

export function EcosystemTab({ siteId, isAdmin }: EcosystemTabProps) {
  const [sections, setSections] = useState<EcosystemSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editSections, setEditSections] = useState<EcosystemSection[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const fetchContent = useCallback(async () => {
    try {
      const res = await fetch(`/api/sites/${siteId}/ecosystem`);
      if (res.ok) {
        const data = await res.json();
        if (data.content) {
          try {
            const parsed = JSON.parse(data.content);
            if (Array.isArray(parsed)) setSections(parsed);
          } catch {
            // Si le contenu n'est pas du JSON valide, on le traite comme du texte brut
            if (data.content.trim()) {
              setSections([{ id: "legacy", title: "Description", content: data.content, icon: "📋" }]);
            }
          }
        }
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, [siteId]);

  useEffect(() => { fetchContent(); }, [fetchContent]);

  const startEditing = () => {
    setEditSections(sections.length > 0 ? [...sections] : [
      { id: crypto.randomUUID(), title: "Architecture technique", content: "", icon: "🏗️" },
      { id: crypto.randomUUID(), title: "Outils & Technologies", content: "", icon: "🔧" },
      { id: crypto.randomUUID(), title: "Intégrations", content: "", icon: "🔗" },
    ]);
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch(`/api/sites/${siteId}/ecosystem`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: JSON.stringify(editSections) }),
    });
    if (res.ok) {
      setSections(editSections);
      setEditing(false);
    }
    setSaving(false);
  };

  const addSection = () => {
    setEditSections([...editSections, {
      id: crypto.randomUUID(),
      title: "Nouvelle section",
      content: "",
      icon: DEFAULT_ICONS[editSections.length % DEFAULT_ICONS.length],
    }]);
  };

  const removeSection = (id: string) => {
    setEditSections(editSections.filter((s) => s.id !== id));
  };

  const updateSection = (id: string, field: keyof EcosystemSection, value: string) => {
    setEditSections(editSections.map((s) => s.id === id ? { ...s, [field]: value } : s));
  };

  const moveSection = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= editSections.length) return;
    const copy = [...editSections];
    [copy[index], copy[newIndex]] = [copy[newIndex], copy[index]];
    setEditSections(copy);
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  if (loading) return <div className="text-center py-8 text-gray-400">Chargement...</div>;

  // ─── Mode édition (admin) ───────────────────────────────────────────────────

  if (editing) {
    return (
      <div className="max-w-4xl mx-auto space-y-4 p-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Pencil className="h-4 w-4" /> Éditer l&apos;Écosystème
          </h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditing(false)} className="gap-1">
              <X className="h-3.5 w-3.5" /> Annuler
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1">
              <Save className="h-3.5 w-3.5" /> {saving ? "Sauvegarde..." : "Enregistrer"}
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {editSections.map((section, index) => (
            <Card key={section.id} className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-gray-300 flex-shrink-0" />
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => moveSection(index, -1)} className="text-gray-400 hover:text-gray-600" disabled={index === 0}>
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => moveSection(index, 1)} className="text-gray-400 hover:text-gray-600" disabled={index === editSections.length - 1}>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>
                {/* Icône */}
                <select
                  value={section.icon}
                  onChange={(e) => updateSection(section.id, "icon", e.target.value)}
                  className="h-8 w-14 rounded border border-gray-200 bg-white text-center text-base dark:bg-gray-900 dark:border-gray-700"
                >
                  {DEFAULT_ICONS.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
                </select>
                {/* Titre */}
                <input
                  value={section.title}
                  onChange={(e) => updateSection(section.id, "title", e.target.value)}
                  placeholder="Titre de la section"
                  className="flex-1 h-8 rounded border border-gray-200 bg-white px-3 text-sm font-medium dark:bg-gray-900 dark:border-gray-700"
                />
                <Button variant="ghost" size="sm" onClick={() => removeSection(section.id)} className="h-8 px-1.5 text-red-500">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <textarea
                value={section.content}
                onChange={(e) => updateSection(section.id, "content", e.target.value)}
                placeholder="Décrivez cette section... (Markdown supporté)"
                rows={6}
                className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700 font-mono"
              />
            </Card>
          ))}
        </div>

        <Button variant="outline" size="sm" onClick={addSection} className="gap-1 w-full">
          <Plus className="h-3.5 w-3.5" /> Ajouter une section
        </Button>
      </div>
    );
  }

  // ─── Mode lecture ───────────────────────────────────────────────────────────

  const isEmpty = sections.length === 0;

  return (
    <div className="max-w-4xl mx-auto space-y-4 p-2">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Globe className="h-5 w-5 text-blue-500" /> Écosystème
        </h2>
        {isAdmin && (
          <Button size="sm" variant="outline" onClick={startEditing} className="gap-1">
            <Pencil className="h-3.5 w-3.5" /> Éditer
          </Button>
        )}
      </div>

      {isEmpty ? (
        <Card className="p-12 text-center">
          <Globe className="h-12 w-12 mx-auto mb-3 text-gray-200" />
          <p className="text-gray-400">Aucune description de l&apos;écosystème disponible</p>
          {isAdmin && (
            <Button size="sm" variant="outline" onClick={startEditing} className="mt-4 gap-1">
              <Plus className="h-3.5 w-3.5" /> Créer le contenu
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {sections.map((section) => {
            const isExpanded = expandedIds.has(section.id);
            return (
              <Card key={section.id} className="overflow-hidden">
                <button
                  onClick={() => toggleExpand(section.id)}
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <span className="text-xl flex-shrink-0">{section.icon}</span>
                  <span className="font-semibold text-sm flex-1">{section.title}</span>
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 border-t">
                    <div className="pt-3 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {section.content}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
