"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Input,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui";
import { Plus, Trash2, Copy, Eye } from "lucide-react";

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

interface Tab1PersonsProps {
  siteId: string;
  persons: Person[];
  levels: Level[];
  onSaveStart: () => void;
  onSaveDone: () => void;
  onSaveError: () => void;
  onSelectPerson: (id: string) => void;
}

// Composant cellule éditable
function EditableCell({
  value,
  onChange,
  type = "text",
  placeholder = "-",
}: {
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email";
  placeholder?: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleBlur = () => {
    setIsEditing(false);
    if (editValue !== value) {
      onChange(editValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBlur();
    } else if (e.key === "Escape") {
      setEditValue(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        type={type}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="h-8 text-sm"
      />
    );
  }

  return (
    <span
      onClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
      className="cursor-text hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 rounded inline-block min-w-[60px]"
    >
      {value || <span className="text-gray-400">{placeholder}</span>}
    </span>
  );
}

// Composant sélecteur de niveau
function LevelSelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <select
        value={value}
        onChange={(e) => {
          onChange(Number(e.target.value));
          setIsEditing(false);
        }}
        onBlur={() => setIsEditing(false)}
        autoFocus
        className="h-8 px-2 text-sm rounded-md border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900"
      >
        {Array.from({ length: 21 }, (_, i) => (
          <option key={i} value={i}>
            Niveau {i}
          </option>
        ))}
      </select>
    );
  }

  return (
    <span
      onClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
      className="cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800 px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
    >
      Niveau {value}
    </span>
  );
}

// Composant sélecteur de responsable
function ManagerSelector({
  value,
  persons,
  currentPersonId,
  onChange,
}: {
  value: string | null;
  persons: Person[];
  currentPersonId: string;
  onChange: (value: string | null) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const manager = persons.find((p) => p.id === value);

  if (isEditing) {
    return (
      <select
        value={value || ""}
        onChange={(e) => {
          onChange(e.target.value || null);
          setIsEditing(false);
        }}
        onBlur={() => setIsEditing(false)}
        autoFocus
        className="h-8 px-2 text-sm rounded-md border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900 max-w-[150px]"
      >
        <option value="">Aucun</option>
        {persons
          .filter((p) => p.id !== currentPersonId)
          .map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
      </select>
    );
  }

  return (
    <span
      onClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 rounded inline-block min-w-[60px]"
    >
      {manager?.name || <span className="text-gray-400">-</span>}
    </span>
  );
}

export function Tab1Persons({
  siteId,
  persons,
  levels,
  onSaveStart,
  onSaveDone,
  onSaveError,
  onSelectPerson,
}: Tab1PersonsProps) {
  const router = useRouter();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newPerson, setNewPerson] = useState({
    name: "",
    email: "",
    jobTitle: "",
    department: "",
    managerId: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fonction de mise à jour d'une personne
  const updatePerson = async (personId: string, field: string, value: string | number | null) => {
    onSaveStart();
    try {
      const res = await fetch(`/api/sites/${siteId}/persons/${personId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });

      if (res.ok) {
        onSaveDone();
        router.refresh();
      } else {
        onSaveError();
      }
    } catch {
      onSaveError();
    }
  };

  const handleCreatePerson = async () => {
    if (!newPerson.name || !newPerson.email) {
      setErrorMessage("Le nom et l'email sont requis");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    onSaveStart();

    try {
      const res = await fetch(`/api/sites/${siteId}/persons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPerson),
      });

      const data = await res.json();

      if (res.ok) {
        setShowCreateDialog(false);
        setNewPerson({ name: "", email: "", jobTitle: "", department: "", managerId: "" });
        onSaveDone();
        router.refresh();
      } else {
        setErrorMessage(data.error || "Une erreur est survenue");
        onSaveError();
      }
    } catch {
      setErrorMessage("Erreur de connexion au serveur");
      onSaveError();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePerson = async (personId: string) => {
    setIsLoading(true);
    onSaveStart();

    try {
      await fetch(`/api/sites/${siteId}/persons/${personId}`, {
        method: "DELETE",
      });
      setShowDeleteDialog(null);
      onSaveDone();
      router.refresh();
    } catch {
      onSaveError();
    } finally {
      setIsLoading(false);
    }
  };

  const copyInviteLink = (personId: string) => {
    const link = `${window.location.origin}/invite/${personId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(personId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Personnes ({persons.length})</h2>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une personne
        </Button>
      </div>

      {persons.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>Aucune personne dans ce site</p>
          <p className="text-sm mt-1">Commencez par ajouter la première personne</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Poste</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Niveau IA</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead className="w-[120px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {persons.map((person) => (
                <TableRow key={person.id} className="group">
                  <TableCell className="font-medium">
                    <EditableCell
                      value={person.name}
                      onChange={(v) => updatePerson(person.id, "name", v)}
                    />
                  </TableCell>
                  <TableCell>
                    <EditableCell
                      value={person.email}
                      type="email"
                      onChange={(v) => updatePerson(person.id, "email", v)}
                    />
                  </TableCell>
                  <TableCell>
                    <EditableCell
                      value={person.jobTitle || ""}
                      onChange={(v) => updatePerson(person.id, "jobTitle", v || null)}
                    />
                  </TableCell>
                  <TableCell>
                    <EditableCell
                      value={person.department || ""}
                      onChange={(v) => updatePerson(person.id, "department", v || null)}
                    />
                  </TableCell>
                  <TableCell>
                    <LevelSelector
                      value={person.currentLevel}
                      onChange={(v) => updatePerson(person.id, "currentLevel", v)}
                    />
                  </TableCell>
                  <TableCell>
                    <ManagerSelector
                      value={person.managerId}
                      persons={persons}
                      currentPersonId={person.id}
                      onChange={(v) => updatePerson(person.id, "managerId", v)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onSelectPerson(person.id)}
                        title="Voir le profil"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => copyInviteLink(person.id)}
                        title="Copier le lien d'invitation"
                      >
                        <Copy className={`h-4 w-4 ${copiedId === person.id ? "text-green-500" : ""}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => setShowDeleteDialog(person.id)}
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={(open) => {
        setShowCreateDialog(open);
        if (!open) setErrorMessage("");
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter une personne</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {errorMessage && (
              <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm dark:bg-red-900/20 dark:text-red-400">
                {errorMessage}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom complet *</label>
              <Input
                placeholder="Jean Dupont"
                value={newPerson.name}
                onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email *</label>
              <Input
                type="email"
                placeholder="jean.dupont@entreprise.com"
                value={newPerson.email}
                onChange={(e) => setNewPerson({ ...newPerson, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Poste</label>
              <Input
                placeholder="Développeur"
                value={newPerson.jobTitle}
                onChange={(e) => setNewPerson({ ...newPerson, jobTitle: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Service</label>
              <Input
                placeholder="IT"
                value={newPerson.department}
                onChange={(e) => setNewPerson({ ...newPerson, department: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Responsable</label>
              <select
                className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900"
                value={newPerson.managerId}
                onChange={(e) => setNewPerson({ ...newPerson, managerId: e.target.value })}
              >
                <option value="">Aucun (personne au sommet)</option>
                {persons.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} - {p.jobTitle || "Sans poste"}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreatePerson} isLoading={isLoading}>
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!showDeleteDialog} onOpenChange={() => setShowDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer cette personne ?</DialogTitle>
          </DialogHeader>
          <p className="text-gray-500">
            Cette action est irréversible. Toutes les données de cette personne seront perdues.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(null)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => showDeleteDialog && handleDeletePerson(showDeleteDialog)}
              isLoading={isLoading}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
