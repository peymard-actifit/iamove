"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from "@/components/ui";
import { Mail, Briefcase, Building, Edit, Save, X, User } from "lucide-react";
import { getLevelIcon, getLevelInfo } from "@/lib/levels";
import { useI18n } from "@/lib/i18n";

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
  language?: string;
}

interface LevelTranslation {
  id: string;
  language: string;
  name: string;
  category: string;
  seriousGaming: string;
  description: string;
}

interface LevelWithTranslations {
  id: string;
  number: number;
  name: string;
  category?: string;
  seriousGaming?: string;
  translations?: LevelTranslation[];
}

interface PersonalProfileEditorProps {
  siteId: string;
  person: Person;
  persons: Person[];
  levels: LevelWithTranslations[];
}

// Style par index de catégorie (0–3 : Néophyte, Utilisateur, Technicien, Chercheur)
function getCategoryStyleIndex(levelNumber: number): number {
  if (levelNumber <= 3) return 0;
  if (levelNumber <= 9) return 1;
  if (levelNumber <= 15) return 2;
  return 3;
}

function getLevelDisplayInfo(
  levelNumber: number,
  levels: LevelWithTranslations[],
  language: string
): { name: string; category: string; seriousGaming: string } {
  if (!levels?.length) {
    const fallback = getLevelInfo(levelNumber);
    return { name: fallback.name, category: fallback.category, seriousGaming: fallback.seriousGaming };
  }
  const level = levels.find((l) => l.number === levelNumber);
  if (!level) {
    const fallback = levels.find((l) => l.number === 0);
    if (fallback) {
      const tr = fallback.translations?.find((t) => t.language.toUpperCase() === (language?.toUpperCase() || "FR"));
      if (tr) return { name: tr.name, category: tr.category, seriousGaming: tr.seriousGaming };
      return { name: fallback.name, category: fallback.category || "", seriousGaming: fallback.seriousGaming || "" };
    }
    const staticFallback = getLevelInfo(levelNumber);
    return { name: staticFallback.name, category: staticFallback.category, seriousGaming: staticFallback.seriousGaming };
  }
  const lang = language?.toUpperCase() || "FR";
  const translation = level.translations?.find((tr) => tr.language.toUpperCase() === lang);
  if (translation) {
    return { name: translation.name, category: translation.category, seriousGaming: translation.seriousGaming };
  }
  return {
    name: level.name,
    category: level.category || "",
    seriousGaming: level.seriousGaming || "",
  };
}

export function PersonalProfileEditor({
  siteId,
  person,
  persons,
  levels,
}: PersonalProfileEditorProps) {
  const router = useRouter();
  const { t, language } = useI18n();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    name: person.name,
    email: person.email,
    firstName: person.firstName || "",
    lastName: person.lastName || "",
    jobTitle: person.jobTitle || "",
    department: person.department || "",
    managerId: person.managerId || "",
  });

  const handleSave = async () => {
    setIsLoading(true);

    try {
      const res = await fetch(`/api/sites/${siteId}/persons/${person.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        setIsEditing(false);
        router.refresh();
      }
    } catch {
      // Erreur silencieuse
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditForm({
      name: person.name,
      email: person.email,
      firstName: person.firstName || "",
      lastName: person.lastName || "",
      jobTitle: person.jobTitle || "",
      department: person.department || "",
      managerId: person.managerId || "",
    });
    setIsEditing(false);
  };

  const levelDisplay = getLevelDisplayInfo(person.currentLevel, levels, language);
  const categoryStyleIndex = getCategoryStyleIndex(person.currentLevel);

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 flex items-center justify-center">
                {getLevelIcon(person.currentLevel, "h-14 w-14")}
              </div>
              <div>
                {isEditing ? (
                  <div className="space-y-2">
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="font-bold text-lg"
                      placeholder={t.published.fullName}
                    />
                    <div className="flex gap-2">
                      <Input
                        value={editForm.firstName}
                        onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                        className="text-sm"
                        placeholder={t.published.firstName}
                      />
                      <Input
                        value={editForm.lastName}
                        onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                        className="text-sm"
                        placeholder={t.published.lastName}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <CardTitle>{person.name}</CardTitle>
                    <p className="text-gray-500">{person.jobTitle || t.published.noPosition}</p>
                  </>
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
        </CardHeader>
        <CardContent className="space-y-6">
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
              <Briefcase className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">{t.persons.position}</p>
                {isEditing ? (
                  <Input
                    value={editForm.jobTitle}
                    onChange={(e) => setEditForm({ ...editForm, jobTitle: e.target.value })}
                    className="mt-1"
                    placeholder={t.published.yourPosition}
                  />
                ) : (
                  <p className="font-medium">{person.jobTitle || "-"}</p>
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
                    placeholder={t.published.yourDepartment}
                  />
                ) : (
                  <p className="font-medium">{person.department || "-"}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <User className="h-5 w-5 text-gray-400" />
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
        </div>

          {/* Catégorie IA (non modifiable) - libellés selon la langue (GLOBAL / LevelTranslation) */}
          <div className={`p-4 rounded-lg border ${
            categoryStyleIndex === 0 ? "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700" :
            categoryStyleIndex === 1 ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800" :
            categoryStyleIndex === 2 ? "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800" :
            "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800"
          }`}>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 flex items-center justify-center">
                {getLevelIcon(person.currentLevel, "h-8 w-8")}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  categoryStyleIndex === 0 ? "text-gray-700 dark:text-gray-300" :
                  categoryStyleIndex === 1 ? "text-blue-700 dark:text-blue-300" :
                  categoryStyleIndex === 2 ? "text-purple-700 dark:text-purple-300" :
                  "text-orange-700 dark:text-orange-300"
                }`}>
                  {t.published.aiCategory}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    categoryStyleIndex === 0 ? "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200" :
                    categoryStyleIndex === 1 ? "bg-blue-200 text-blue-700 dark:bg-blue-800 dark:text-blue-200" :
                    categoryStyleIndex === 2 ? "bg-purple-200 text-purple-700 dark:bg-purple-800 dark:text-purple-200" :
                    "bg-orange-200 text-orange-700 dark:bg-orange-800 dark:text-orange-200"
                  }`}>
                    {levelDisplay.category}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">{levelDisplay.name} - {levelDisplay.seriousGaming}</p>
              </div>
            </div>
            <p className={`text-xs mt-3 ${
              categoryStyleIndex === 0 ? "text-gray-600 dark:text-gray-400" :
              categoryStyleIndex === 1 ? "text-blue-600 dark:text-blue-400" :
              categoryStyleIndex === 2 ? "text-purple-600 dark:text-purple-400" :
              "text-orange-600 dark:text-orange-400"
            }`}>
              {t.published.categoryUpdatedAuto}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
