"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from "@/components/ui";
import { Mail, Briefcase, Building, Award, Edit, Save, X, User } from "lucide-react";
import { getLevelIcon, getLevelInfo } from "@/lib/levels";

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

interface PersonalProfileEditorProps {
  siteId: string;
  person: Person;
  persons: Person[];
}

export function PersonalProfileEditor({
  siteId,
  person,
  persons,
}: PersonalProfileEditorProps) {
  const router = useRouter();
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

  const levelInfo = getLevelInfo(person.currentLevel);

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
                      placeholder="Nom complet"
                    />
                    <div className="flex gap-2">
                      <Input
                        value={editForm.firstName}
                        onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                        className="text-sm"
                        placeholder="Prénom"
                      />
                      <Input
                        value={editForm.lastName}
                        onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                        className="text-sm"
                        placeholder="Nom"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <CardTitle>{person.name}</CardTitle>
                    <p className="text-gray-500">{person.jobTitle || "Sans poste"}</p>
                  </>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-1" />
                    Annuler
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={isLoading}>
                    <Save className="h-4 w-4 mr-1" />
                    Enregistrer
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Modifier
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
                <p className="text-xs text-gray-500">Email</p>
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
                <p className="text-xs text-gray-500">Poste</p>
                {isEditing ? (
                  <Input
                    value={editForm.jobTitle}
                    onChange={(e) => setEditForm({ ...editForm, jobTitle: e.target.value })}
                    className="mt-1"
                    placeholder="Votre poste"
                  />
                ) : (
                  <p className="font-medium">{person.jobTitle || "-"}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <Building className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Service</p>
                {isEditing ? (
                  <Input
                    value={editForm.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    className="mt-1"
                    placeholder="Votre service"
                  />
                ) : (
                  <p className="font-medium">{person.department || "-"}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <User className="h-5 w-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Responsable</p>
                {isEditing ? (
                  <select
                    className="w-full h-10 px-3 mt-1 rounded-md border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900"
                    value={editForm.managerId}
                    onChange={(e) => setEditForm({ ...editForm, managerId: e.target.value })}
                  >
                    <option value="">Aucun</option>
                    {persons
                      .filter((p) => p.id !== person.id)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                  </select>
                ) : (
                  <p className="font-medium">{person.manager?.name || "Aucun"}</p>
                )}
              </div>
            </div>
          </div>

          {/* Niveau IA (non modifiable) */}
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-4">
              <Award className="h-6 w-6 text-blue-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Niveau IA actuel
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {getLevelIcon(person.currentLevel, "h-5 w-5")}
                  <span className="font-bold text-lg">Niveau {person.currentLevel}</span>
                  <span className="text-gray-500">- {levelInfo.name}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1 italic">{levelInfo.seriousGaming}</p>
              </div>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-3">
              Le niveau est mis à jour automatiquement en validant les évaluations.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
