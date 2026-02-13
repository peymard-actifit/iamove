"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
} from "@/components/ui";
import { Mail, Briefcase, Building, Award, Edit, Save, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { getLevelIcon, getLevelInfo as getLevelInfoFromLib } from "@/lib/levels";

interface Person {
  id: string;
  email: string;
  name: string;
  firstName: string | null;
  lastName: string | null;
  jobTitle: string | null;
  department: string | null;
  currentLevel: number;
  canViewAll: boolean;
  managerId: string | null;
  manager: { id: string; name: string } | null;
}

interface PersonProfileDialogProps {
  siteId: string;
  person: Person | null;
  persons: Person[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveStart?: () => void;
  onSaveDone?: () => void;
  onSaveError?: () => void;
}

export function PersonProfileDialog({
  siteId,
  person,
  persons,
  open,
  onOpenChange,
  onSaveStart,
  onSaveDone,
  onSaveError,
}: PersonProfileDialogProps) {
  const router = useRouter();
  const { t } = useI18n();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [personBadges, setPersonBadges] = useState<{ name: string; icon: string | null; description: string | null }[]>([]);

  useEffect(() => {
    if (person && open) {
      fetch(`/api/sites/${siteId}/activity?personId=${person.id}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.badges) setPersonBadges(d.badges);
          else setPersonBadges([]);
        })
        .catch(() => setPersonBadges([]));
    }
  }, [siteId, person, open]);

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    jobTitle: "",
    department: "",
    managerId: "",
    canViewAll: false,
  });

  useEffect(() => {
    if (person) {
      setEditForm({
        name: person.name,
        email: person.email,
        jobTitle: person.jobTitle || "",
        department: person.department || "",
        managerId: person.managerId || "",
        canViewAll: person.canViewAll,
      });
      setIsEditing(false);
    }
  }, [person]);

  const handleSave = async () => {
    if (!person) return;
    
    setIsLoading(true);
    onSaveStart?.();

    try {
      const res = await fetch(`/api/sites/${siteId}/persons/${person.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        setIsEditing(false);
        onSaveDone?.();
        router.refresh();
      } else {
        onSaveError?.();
      }
    } catch {
      onSaveError?.();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (person) {
      setEditForm({
        name: person.name,
        email: person.email,
        jobTitle: person.jobTitle || "",
        department: person.department || "",
        managerId: person.managerId || "",
        canViewAll: person.canViewAll,
      });
    }
    setIsEditing(false);
  };

  if (!person) return null;

  const levelInfo = getLevelInfoFromLib(person.currentLevel);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 flex items-center justify-center">
                {getLevelIcon(person.currentLevel, "h-14 w-14")}
              </div>
              <div>
                {isEditing ? (
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="font-bold text-lg"
                    placeholder={t.placeholder.enterName}
                  />
                ) : (
                  <DialogTitle className="text-xl">{person.name}</DialogTitle>
                )}
                {isEditing ? (
                  <Input
                    value={editForm.jobTitle}
                    onChange={(e) => setEditForm({ ...editForm, jobTitle: e.target.value })}
                    className="mt-1 text-sm"
                    placeholder={t.placeholder.enterPosition}
                  />
                ) : (
                  <p className="text-gray-500">{person.jobTitle || "-"}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-1" />
                    {t.common.cancel}
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={isLoading}>
                    <Save className="h-4 w-4 mr-1" />
                    {t.common.save}
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-1" />
                  {t.common.edit}
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Informations de base */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <Mail className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">{t.persons.email}</p>
                {isEditing ? (
                  <Input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="mt-1"
                  />
                ) : (
                  <p className="font-medium">{person.email}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <Building className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">{t.persons.department}</p>
                {isEditing ? (
                  <Input
                    value={editForm.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    className="mt-1"
                    placeholder={t.placeholder.enterDepartment}
                  />
                ) : (
                  <p className="font-medium">{person.department || "-"}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <Briefcase className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">{t.persons.manager}</p>
                {isEditing ? (
                  <select
                    className="w-full h-10 px-3 mt-1 rounded-md border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900"
                    value={editForm.managerId}
                    onChange={(e) => setEditForm({ ...editForm, managerId: e.target.value })}
                  >
                    <option value="">{t.persons.none}</option>
                    {persons
                      .filter((p) => p.id !== person.id)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                  </select>
                ) : (
                  <p className="font-medium">{person.manager?.name || t.persons.none}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <Award className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">{t.profile.aiLevel}</p>
                <p className="font-medium">{levelInfo.name}</p>
              </div>
            </div>
          </div>

          {/* Option vue élargie (en mode édition) */}
          {isEditing && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <input
                type="checkbox"
                id="canViewAll"
                checked={editForm.canViewAll}
                onChange={(e) => setEditForm({ ...editForm, canViewAll: e.target.checked })}
                className="h-4 w-4"
              />
              <label htmlFor="canViewAll" className="text-sm">
                {t.profile.expandedViewDescription}
              </label>
            </div>
          )}

          {/* Badges */}
          {personBadges.length > 0 && (
            <div className="border rounded-lg p-3 bg-amber-50/50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                  Badges ({personBadges.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {personBadges.map((badge, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 border border-amber-200 dark:border-amber-700 rounded-full px-2.5 py-1 bg-white dark:bg-gray-800 shadow-sm"
                    title={badge.description || badge.name}
                  >
                    <span className="text-sm">{badge.icon || "🏆"}</span>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{badge.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Options spéciales */}
          {person.canViewAll && !isEditing && (
            <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                ⭐ {t.profile.expandedView}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
