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
import {
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  KeyRound,
  Loader2,
  UserPlus,
  Search,
} from "lucide-react";
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
  personRole: "STANDARD" | "ADMIN";
  managerId: string | null;
  isOnline: boolean;
  lastSeenAt?: string | null;
  inviteClickedAt?: string | null;
  participationPoints?: number;
  manager: { id: string; name: string } | null;
  subordinates: { id: string; name: string }[];
  inviteToken?: string | null;
  password?: string | null;
}

interface AdminPersonsManagerProps {
  siteId: string;
  siteSlug: string;
  persons: Person[];
  currentPersonId: string;
}

// Composant cellule éditable inline
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
    if (e.key === "Enter") handleBlur();
    else if (e.key === "Escape") {
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
        className="h-6 text-xs py-0"
      />
    );
  }

  return (
    <span
      onClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
      className="cursor-text hover:bg-gray-100 dark:hover:bg-gray-800 px-1 py-0.5 rounded inline-block text-xs"
    >
      {value || <span className="text-gray-400">{placeholder}</span>}
    </span>
  );
}

// Point de statut coloré selon l'état du compte
// Vert = activité PP < 15 min, Bleu = compte actif, Rouge = invitation cliquée non finalisée, Orange = non créé
const ONLINE_THRESHOLD_MS = 15 * 60 * 1000; // 15 minutes

function PersonStatusDot({ person }: { person: Person }) {
  if (person.password) {
    if (person.lastSeenAt) {
      const lastSeen = new Date(person.lastSeenAt).getTime();
      const now = Date.now();
      if (now - lastSeen < ONLINE_THRESHOLD_MS) {
        return <span className="block h-1.5 w-1.5 rounded-full bg-green-500" title="En ligne (activité < 15 min)" />;
      }
    }
    return <span className="block h-1.5 w-1.5 rounded-full bg-blue-500" title="Compte actif" />;
  }
  if (person.inviteClickedAt) {
    return <span className="block h-1.5 w-1.5 rounded-full bg-red-500" title="Invitation ouverte, compte non finalisé" />;
  }
  return <span className="block h-1.5 w-1.5 rounded-full bg-orange-400" title="Invitation non encore ouverte" />;
}

type SortColumn = "name" | "email" | "jobTitle" | "department" | "currentLevel" | "pp";
type SortDirection = "asc" | "desc";

export function AdminPersonsManager({
  siteId,
  siteSlug,
  persons,
  currentPersonId,
}: AdminPersonsManagerProps) {
  const router = useRouter();
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [resetPasswordId, setResetPasswordId] = useState<string | null>(null);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [sortColumn, setSortColumn] = useState<SortColumn>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // Formulaire d'ajout
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newJobTitle, setNewJobTitle] = useState("");
  const [newDepartment, setNewDepartment] = useState("");

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Filtrer par recherche
  const filteredPersons = persons.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      (p.jobTitle || "").toLowerCase().includes(q) ||
      (p.department || "").toLowerCase().includes(q)
    );
  });

  // Trier
  const sortedPersons = [...filteredPersons].sort((a, b) => {
    let valueA: string | number;
    let valueB: string | number;

    switch (sortColumn) {
      case "name":
        valueA = a.name.toLowerCase();
        valueB = b.name.toLowerCase();
        break;
      case "email":
        valueA = a.email.toLowerCase();
        valueB = b.email.toLowerCase();
        break;
      case "jobTitle":
        valueA = (a.jobTitle || "").toLowerCase();
        valueB = (b.jobTitle || "").toLowerCase();
        break;
      case "department":
        valueA = (a.department || "").toLowerCase();
        valueB = (b.department || "").toLowerCase();
        break;
      case "currentLevel":
        valueA = a.currentLevel;
        valueB = b.currentLevel;
        break;
      case "pp":
        valueA = a.participationPoints ?? 0;
        valueB = b.participationPoints ?? 0;
        break;
      default:
        valueA = a.name.toLowerCase();
        valueB = b.name.toLowerCase();
    }

    if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
    if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const updatePerson = async (personId: string, field: string, value: string | number | null) => {
    setSaveStatus("saving");
    try {
      const res = await fetch(`/api/sites/${siteId}/persons/${personId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (res.ok) {
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 1500);
        router.refresh();
      } else {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 2000);
      }
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }
  };

  const handleAddPerson = async () => {
    if (!newName || !newEmail) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/sites/${siteId}/persons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          jobTitle: newJobTitle || null,
          department: newDepartment || null,
        }),
      });
      if (res.ok) {
        setShowAddDialog(false);
        setNewName("");
        setNewEmail("");
        setNewJobTitle("");
        setNewDepartment("");
        router.refresh();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePerson = async (personId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/sites/${siteId}/persons/${personId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setShowDeleteDialog(null);
        router.refresh();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const copyInviteLink = (person: Person) => {
    if (person.password) {
      const link = `${window.location.origin}/s/${siteSlug}`;
      navigator.clipboard.writeText(link);
    } else if (person.inviteToken) {
      const link = `${window.location.origin}/invite/${person.inviteToken}`;
      navigator.clipboard.writeText(link);
    } else {
      resetPassword(person.id);
      return;
    }
    setCopiedId(person.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const resetPassword = async (personId: string) => {
    setIsResettingPassword(true);
    setResetPasswordId(personId);
    try {
      const res = await fetch(`/api/sites/${siteId}/persons/${personId}/reset-password`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        const link = `${window.location.origin}/invite/${data.inviteToken}`;
        navigator.clipboard.writeText(link);
        setCopiedId(personId);
        setTimeout(() => setCopiedId(null), 2000);
        router.refresh();
      }
    } finally {
      setIsResettingPassword(false);
      setResetPasswordId(null);
    }
  };

  const SortIcon = ({ column }: { column: SortColumn }) =>
    sortColumn === column ? (
      sortDirection === "asc" ? (
        <ArrowUp className="h-3 w-3" />
      ) : (
        <ArrowDown className="h-3 w-3" />
      )
    ) : null;

  return (
    <div className="space-y-3">
      {/* Barre d'outils */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.common?.search || "Rechercher..."}
            className="pl-7 h-8 text-sm"
          />
        </div>
        <Button size="sm" onClick={() => setShowAddDialog(true)} className="h-8 gap-1">
          <UserPlus className="h-3.5 w-3.5" />
          {t.persons?.addPerson || "Ajouter"}
        </Button>
        <span className="text-xs text-gray-500">
          {persons.length} {persons.length > 1 ? "personnes" : "personne"}
          {saveStatus === "saving" && " · Enregistrement..."}
          {saveStatus === "saved" && " · Enregistré"}
          {saveStatus === "error" && " · Erreur"}
        </span>
      </div>

      {/* Tableau */}
      <div className="border rounded-lg overflow-hidden">
        {/* Légende des statuts */}
        <div className="flex items-center gap-4 px-3 py-1.5 bg-gray-50 dark:bg-gray-800/50 border-b text-[10px] text-gray-500">
          <span className="flex items-center gap-1"><span className="block h-1.5 w-1.5 rounded-full bg-green-500" />En ligne</span>
          <span className="flex items-center gap-1"><span className="block h-1.5 w-1.5 rounded-full bg-blue-500" />Compte actif</span>
          <span className="flex items-center gap-1"><span className="block h-1.5 w-1.5 rounded-full bg-red-500" />Non finalisé</span>
          <span className="flex items-center gap-1"><span className="block h-1.5 w-1.5 rounded-full bg-orange-400" />Non créé</span>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="h-7">
              <TableHead
                className="text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 select-none py-1"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center gap-1">
                  {t.persons?.name || "Nom"} <SortIcon column="name" />
                </div>
              </TableHead>
              <TableHead
                className="text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 select-none py-1"
                onClick={() => handleSort("email")}
              >
                <div className="flex items-center gap-1">
                  {t.persons?.email || "Email"} <SortIcon column="email" />
                </div>
              </TableHead>
              <TableHead
                className="text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 select-none py-1"
                onClick={() => handleSort("jobTitle")}
              >
                <div className="flex items-center gap-1">
                  {t.persons?.position || "Poste"} <SortIcon column="jobTitle" />
                </div>
              </TableHead>
              <TableHead
                className="text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 select-none py-1"
                onClick={() => handleSort("department")}
              >
                <div className="flex items-center gap-1">
                  {t.persons?.department || "Service"} <SortIcon column="department" />
                </div>
              </TableHead>
              <TableHead
                className="text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 select-none py-1 w-20"
                onClick={() => handleSort("currentLevel")}
              >
                <div className="flex items-center gap-1">
                  {t.persons?.level || "Niv."} <SortIcon column="currentLevel" />
                </div>
              </TableHead>
              <TableHead
                className="text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 select-none py-1 w-14"
                onClick={() => handleSort("pp")}
              >
                <div className="flex items-center gap-1">
                  PP <SortIcon column="pp" />
                </div>
              </TableHead>
              <TableHead className="w-[80px] text-right text-xs py-1">
                {t.persons?.actions || "Actions"}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedPersons.map((person) => {
              const levelIcon = getLevelIcon(person.currentLevel, "h-3 w-3");
              const levelInfo = getLevelInfo(person.currentLevel);
              const isSelf = person.id === currentPersonId;

              return (
                <TableRow
                  key={person.id}
                  className={`group h-7 ${isSelf ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}`}
                >
                  <TableCell className="py-0.5 font-medium">
                    <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 flex-shrink-0">
                        <PersonStatusDot person={person} />
                      </span>
                      <EditableCell
                        value={person.name}
                        onChange={(v) => updatePerson(person.id, "name", v)}
                      />
                      {isSelf && (
                        <span className="text-[10px] text-blue-500 font-normal flex-shrink-0">(vous)</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-0.5">
                    <EditableCell
                      value={person.email}
                      type="email"
                      onChange={(v) => updatePerson(person.id, "email", v)}
                    />
                  </TableCell>
                  <TableCell className="py-0.5">
                    <EditableCell
                      value={person.jobTitle || ""}
                      onChange={(v) => updatePerson(person.id, "jobTitle", v || null)}
                    />
                  </TableCell>
                  <TableCell className="py-0.5">
                    <EditableCell
                      value={person.department || ""}
                      onChange={(v) => updatePerson(person.id, "department", v || null)}
                    />
                  </TableCell>
                  <TableCell className="py-0.5">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 inline-flex items-center gap-1 whitespace-nowrap"
                      title={`${levelInfo.name} - ${levelInfo.seriousGaming}`}
                    >
                      {person.currentLevel} {levelIcon}
                    </span>
                  </TableCell>
                  <TableCell className="py-0.5 text-right tabular-nums text-xs text-gray-600 dark:text-gray-400">
                    {person.participationPoints ?? 0}
                  </TableCell>
                  <TableCell className="py-0.5">
                    <div className="flex items-center justify-end gap-0.5 w-[68px]">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => copyInviteLink(person)}
                        title={
                          person.password
                            ? "Copier le lien de connexion"
                            : "Copier le lien d'invitation"
                        }
                      >
                        <Copy
                          className={`h-3 w-3 ${copiedId === person.id ? "text-green-500" : ""}`}
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 text-amber-500 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                        onClick={() => resetPassword(person.id)}
                        disabled={isResettingPassword && resetPasswordId === person.id}
                        title="Réinitialiser le mot de passe"
                      >
                        {isResettingPassword && resetPasswordId === person.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <KeyRound className="h-3 w-3" />
                        )}
                      </Button>
                      {isSelf ? (
                        <span className="h-5 w-5 flex-shrink-0" />
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => setShowDeleteDialog(person.id)}
                          title="Supprimer"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.persons?.addPerson || "Ajouter une personne"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">{t.persons?.name || "Nom"} *</label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nom complet"
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t.persons?.email || "Email"} *</label>
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t.persons?.position || "Poste"}</label>
              <Input
                value={newJobTitle}
                onChange={(e) => setNewJobTitle(e.target.value)}
                placeholder="Poste / Fonction"
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t.persons?.department || "Service"}</label>
              <Input
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
                placeholder="Service / Département"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              {t.common?.cancel || "Annuler"}
            </Button>
            <Button onClick={handleAddPerson} isLoading={isLoading} disabled={!newName || !newEmail}>
              {t.persons?.addPerson || "Ajouter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!showDeleteDialog} onOpenChange={() => setShowDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.persons?.confirmDelete || "Supprimer cette personne ?"}</DialogTitle>
          </DialogHeader>
          <p className="text-gray-500">
            {t.persons?.confirmDeleteMessage || "Cette action est irréversible."}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(null)}>
              {t.common?.cancel || "Annuler"}
            </Button>
            <Button
              variant="destructive"
              onClick={() => showDeleteDialog && handleDeletePerson(showDeleteDialog)}
              isLoading={isLoading}
            >
              {t.common?.delete || "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
