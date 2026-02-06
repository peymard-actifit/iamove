"use client";

import { useState } from "react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui";
import { Plus, MoreVertical, Edit, Trash2, Link as LinkIcon, Copy } from "lucide-react";

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

  const handleCreatePerson = async () => {
    if (!newPerson.name || !newPerson.email) return;

    setIsLoading(true);
    onSaveStart();

    try {
      const res = await fetch(`/api/sites/${siteId}/persons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPerson),
      });

      if (res.ok) {
        setShowCreateDialog(false);
        setNewPerson({ name: "", email: "", jobTitle: "", department: "", managerId: "" });
        onSaveDone();
        router.refresh();
      } else {
        onSaveError();
      }
    } catch {
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
    const link = `${window.location.origin}/s/${siteId}/invite/${personId}`;
    navigator.clipboard.writeText(link);
  };

  const getLevelName = (levelNumber: number) => {
    const level = levels.find((l) => l.number === levelNumber);
    return level ? level.name : `Niveau ${levelNumber}`;
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
          <p className="text-sm mt-1">Commencez par ajouter la première personne (sans responsable)</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Poste</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Niveau IA</TableHead>
              <TableHead>Responsable</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {persons.map((person) => (
              <TableRow
                key={person.id}
                className="cursor-pointer"
                onClick={() => onSelectPerson(person.id)}
              >
                <TableCell className="font-medium">{person.name}</TableCell>
                <TableCell>{person.email}</TableCell>
                <TableCell>{person.jobTitle || "-"}</TableCell>
                <TableCell>{person.department || "-"}</TableCell>
                <TableCell>
                  <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    {getLevelName(person.currentLevel)}
                  </span>
                </TableCell>
                <TableCell>{person.manager?.name || "-"}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onSelectPerson(person.id)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Éditer
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => copyInviteLink(person.id)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copier lien invitation
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => setShowDeleteDialog(person.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter une personne</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
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
