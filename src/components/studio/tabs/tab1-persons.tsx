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
import { Trash2, Copy, Eye, ArrowUp, ArrowDown } from "lucide-react";
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
        className="h-7 text-xs"
      />
    );
  }

  return (
    <span
      onClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
      className="cursor-text hover:bg-gray-100 dark:hover:bg-gray-800 px-1.5 py-0.5 rounded inline-block text-sm"
    >
      {value || <span className="text-gray-400">{placeholder}</span>}
    </span>
  );
}

// Composant sélecteur de niveau avec tooltip (comme l'organigramme)
function LevelSelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const levelIcon = getLevelIcon(value, "h-3.5 w-3.5");
  const levelInfo = getLevelInfo(value);

  const handleMouseEnter = () => {
    if (!isEditing) {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 5000);
    }
  };

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
        className="h-6 px-1 text-xs rounded border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900"
      >
        {Array.from({ length: 21 }, (_, i) => (
          <option key={i} value={i}>
            {i}
          </option>
        ))}
      </select>
    );
  }

  return (
    <div className="relative inline-block">
      <span
        onClick={(e) => {
          e.stopPropagation();
          setIsEditing(true);
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShowTooltip(false)}
        className="cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800 px-1.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 flex items-center gap-1"
      >
        Niv. {value}
        {levelIcon}
      </span>
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1.5 bg-gray-900 text-white rounded shadow-lg z-50 whitespace-nowrap text-center">
          <p className="text-[10px] font-medium">{levelInfo.name}</p>
          <p className="text-[10px] text-gray-300">{levelInfo.seriousGaming}</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
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
        className="h-6 px-1 text-xs rounded border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900 max-w-[120px]"
      >
        <option value="">-</option>
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
      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 px-1.5 py-0.5 rounded text-sm"
    >
      {manager?.name || <span className="text-gray-400">-</span>}
    </span>
  );
}

type SortColumn = "name" | "email" | "jobTitle" | "department" | "currentLevel" | "manager";
type SortDirection = "asc" | "desc";

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
  const { t } = useI18n();
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<SortColumn>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Fonction de tri
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Personnes triées
  const sortedPersons = [...persons].sort((a, b) => {
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
      case "manager":
        valueA = (a.manager?.name || "").toLowerCase();
        valueB = (b.manager?.name || "").toLowerCase();
        break;
      default:
        valueA = a.name.toLowerCase();
        valueB = b.name.toLowerCase();
    }

    if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
    if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

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
      {persons.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>Aucune personne dans ce site</p>
          <p className="text-sm mt-1">Utilisez le bouton &quot;Ajouter une personne&quot; ci-dessus</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="h-7">
                <TableHead 
                  className="text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 select-none py-1"
                  onClick={() => handleSort("name")}
                  title={sortDirection === "asc" ? t.tooltip.sortDescending : t.tooltip.sortAscending}
                >
                  <div className="flex items-center gap-1">
                    {t.persons.name}
                    {sortColumn === "name" && (sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                  </div>
                </TableHead>
                <TableHead 
                  className="text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 select-none py-1"
                  onClick={() => handleSort("email")}
                  title={sortDirection === "asc" ? t.tooltip.sortDescending : t.tooltip.sortAscending}
                >
                  <div className="flex items-center gap-1">
                    {t.persons.email}
                    {sortColumn === "email" && (sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                  </div>
                </TableHead>
                <TableHead 
                  className="text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 select-none py-1"
                  onClick={() => handleSort("jobTitle")}
                  title={sortDirection === "asc" ? t.tooltip.sortDescending : t.tooltip.sortAscending}
                >
                  <div className="flex items-center gap-1">
                    {t.persons.position}
                    {sortColumn === "jobTitle" && (sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                  </div>
                </TableHead>
                <TableHead 
                  className="text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 select-none py-1"
                  onClick={() => handleSort("department")}
                  title={sortDirection === "asc" ? t.tooltip.sortDescending : t.tooltip.sortAscending}
                >
                  <div className="flex items-center gap-1">
                    {t.persons.department}
                    {sortColumn === "department" && (sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                  </div>
                </TableHead>
                <TableHead 
                  className="text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 select-none py-1 w-12"
                  onClick={() => handleSort("currentLevel")}
                  title={sortDirection === "asc" ? t.tooltip.sortDescending : t.tooltip.sortAscending}
                >
                  <div className="flex items-center gap-1">
                    {t.persons.level}
                    {sortColumn === "currentLevel" && (sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                  </div>
                </TableHead>
                <TableHead 
                  className="text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 select-none py-1"
                  onClick={() => handleSort("manager")}
                  title={sortDirection === "asc" ? t.tooltip.sortDescending : t.tooltip.sortAscending}
                >
                  <div className="flex items-center gap-1">
                    {t.persons.manager}
                    {sortColumn === "manager" && (sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                  </div>
                </TableHead>
                <TableHead className="w-[90px] text-right text-xs py-1">{t.persons.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPersons.map((person) => (
                <TableRow key={person.id} className="group">
                  <TableCell className="py-1 font-medium">
                    <EditableCell
                      value={person.name}
                      onChange={(v) => updatePerson(person.id, "name", v)}
                    />
                  </TableCell>
                  <TableCell className="py-1">
                    <EditableCell
                      value={person.email}
                      type="email"
                      onChange={(v) => updatePerson(person.id, "email", v)}
                    />
                  </TableCell>
                  <TableCell className="py-1">
                    <EditableCell
                      value={person.jobTitle || ""}
                      onChange={(v) => updatePerson(person.id, "jobTitle", v || null)}
                    />
                  </TableCell>
                  <TableCell className="py-1">
                    <EditableCell
                      value={person.department || ""}
                      onChange={(v) => updatePerson(person.id, "department", v || null)}
                    />
                  </TableCell>
                  <TableCell className="py-1">
                    <LevelSelector
                      value={person.currentLevel}
                      onChange={(v) => updatePerson(person.id, "currentLevel", v)}
                    />
                  </TableCell>
                  <TableCell className="py-1">
                    <ManagerSelector
                      value={person.managerId}
                      persons={persons}
                      currentPersonId={person.id}
                      onChange={(v) => updatePerson(person.id, "managerId", v)}
                    />
                  </TableCell>
                  <TableCell className="py-1">
                    <div className="flex items-center justify-end gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => onSelectPerson(person.id)}
                        title={t.tooltip.viewProfile}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyInviteLink(person.id)}
                        title={t.persons.copyInviteLink}
                      >
                        <Copy className={`h-3.5 w-3.5 ${copiedId === person.id ? "text-green-500" : ""}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => setShowDeleteDialog(person.id)}
                        title={t.tooltip.deletePerson}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Delete Dialog */}
      <Dialog open={!!showDeleteDialog} onOpenChange={() => setShowDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.persons.confirmDelete}</DialogTitle>
          </DialogHeader>
          <p className="text-gray-500">
            {t.persons.confirmDeleteMessage}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(null)}>
              {t.common.cancel}
            </Button>
            <Button
              variant="destructive"
              onClick={() => showDeleteDialog && handleDeletePerson(showDeleteDialog)}
              isLoading={isLoading}
            >
              {t.common.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
