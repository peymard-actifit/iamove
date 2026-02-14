"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from "@/components/ui";
import { User, Mail, Briefcase, Building, Award, ChevronRight, Edit, Save, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { getLevelIcon } from "@/lib/levels";

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

interface Level {
  id: string;
  number: number;
  name: string;
}

interface Tab3ProfileProps {
  siteId: string;
  persons: Person[];
  levels: Level[];
  selectedPersonId: string | null;
  onSelectPerson: (id: string) => void;
  onSaveStart?: () => void;
  onSaveDone?: () => void;
  onSaveError?: () => void;
}

export function Tab3Profile({
  siteId,
  persons,
  levels,
  selectedPersonId,
  onSelectPerson,
  onSaveStart,
  onSaveDone,
  onSaveError,
}: Tab3ProfileProps) {
  const router = useRouter();
  const { t } = useI18n();
  const selectedPerson = persons.find((p) => p.id === selectedPersonId);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    jobTitle: "",
    department: "",
    managerId: "",
    canViewAll: false,
  });

  // Mettre à jour le formulaire quand la personne sélectionnée change
  useEffect(() => {
    if (selectedPerson) {
      setEditForm({
        name: selectedPerson.name,
        email: selectedPerson.email,
        jobTitle: selectedPerson.jobTitle || "",
        department: selectedPerson.department || "",
        managerId: selectedPerson.managerId || "",
        canViewAll: selectedPerson.canViewAll,
      });
      setIsEditing(false);
    }
  }, [selectedPerson]);

  const handleSave = async () => {
    if (!selectedPerson) return;
    
    setIsLoading(true);
    onSaveStart?.();

    try {
      const res = await fetch(`/api/sites/${siteId}/persons/${selectedPerson.id}`, {
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
    if (selectedPerson) {
      setEditForm({
        name: selectedPerson.name,
        email: selectedPerson.email,
        jobTitle: selectedPerson.jobTitle || "",
        department: selectedPerson.department || "",
        managerId: selectedPerson.managerId || "",
        canViewAll: selectedPerson.canViewAll,
      });
    }
    setIsEditing(false);
  };

  const getLevelInfo = (levelNumber: number) => {
    const level = levels.find((l) => l.number === levelNumber);
    return level || { number: levelNumber, name: `Niveau ${levelNumber}` };
  };

  if (persons.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>{t.common?.noData || "Aucune personne à afficher"}</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Liste des personnes */}
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sélectionner une personne</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y dark:divide-gray-800">
              {persons.map((person) => (
                <button
                  key={person.id}
                  onClick={() => onSelectPerson(person.id)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-between transition-colors ${
                    selectedPersonId === person.id ? "bg-blue-50 dark:bg-blue-900/20" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{person.name}</p>
                      <p className="text-xs text-gray-500">{person.jobTitle || "Sans poste"}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Détails de la personne */}
      <div className="md:col-span-2">
        {selectedPerson ? (
          <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 flex items-center justify-center">
                    {getLevelIcon(selectedPerson.currentLevel, "h-14 w-14")}
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
                      <CardTitle>{selectedPerson.name}</CardTitle>
                    )}
                    {isEditing ? (
                      <Input
                        value={editForm.jobTitle}
                        onChange={(e) => setEditForm({ ...editForm, jobTitle: e.target.value })}
                        className="mt-1 text-sm"
                        placeholder={t.placeholder.enterPosition}
                      />
                    ) : (
                      <p className="text-gray-500">{selectedPerson.jobTitle || "-"}</p>
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
                      <Button size="sm" onClick={handleSave} isLoading={isLoading}>
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
                      <p className="font-medium">{selectedPerson.email}</p>
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
                      <p className="font-medium">{selectedPerson.department || "-"}</p>
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
                        <option value="">{t.common?.noData || "Aucun"} (sommet)</option>
                        {persons
                          .filter((p) => p.id !== selectedPerson.id)
                          .map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                      </select>
                    ) : (
                      <p className="font-medium">{selectedPerson.manager?.name || (t.common?.noData || "Aucun")}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <Award className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Niveau IA</p>
                    <p className="font-medium">{getLevelInfo(selectedPerson.currentLevel).name}</p>
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
                    Donner une vue élargie sur tout l&apos;organigramme
                  </label>
                </div>
              )}

              {/* Progression IA */}
              <div>
                <h3 className="font-semibold mb-4">Progression IA</h3>
                <div className="space-y-2">
                  {levels.map((level) => (
                    <div
                      key={level.id}
                      className={`p-3 rounded-lg border ${
                        level.number <= selectedPerson.currentLevel
                          ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                          : level.number === selectedPerson.currentLevel + 1
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{level.name}</span>
                        {level.number <= selectedPerson.currentLevel ? (
                          <span className="text-green-600 text-sm">✓ Validé</span>
                        ) : level.number === selectedPerson.currentLevel + 1 ? (
                          <span className="text-blue-600 text-sm">En cours</span>
                        ) : (
                          <span className="text-gray-400 text-sm">À venir</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Options spéciales */}
              {selectedPerson.canViewAll && (
                <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    ⭐ Cette personne a une vue élargie sur tout l&apos;organigramme
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="p-12 text-center">
            <User className="h-12 w-12 mx-auto text-gray-300" />
            <p className="mt-4 text-gray-500">Sélectionnez une personne pour voir son profil</p>
          </Card>
        )}
      </div>
    </div>
  );
}
