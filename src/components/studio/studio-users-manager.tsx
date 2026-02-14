"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Button,
  Input,
  Card,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui";
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Shield,
  ShieldOff,
  KeyRound,
  Eye,
  EyeOff,
  Search,
  Globe,
  Calendar,
  Mail,
  Link2,
  Check,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface StudioUser {
  id: string;
  email: string;
  name: string;
  role: "STANDARD" | "ADMIN";
  language: string;
  createdAt: string;
  lastLoginAt: string | null;
  _count: { sites: number };
}

interface StudioUsersManagerProps {
  currentUserId: string;
}

export function StudioUsersManager({ currentUserId }: StudioUsersManagerProps) {
  const { t } = useI18n();
  const [users, setUsers] = useState<StudioUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editUser, setEditUser] = useState<StudioUser | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<StudioUser | null>(null);
  const [copiedUserId, setCopiedUserId] = useState<string | null>(null);

  const copyLoginUrl = (user: StudioUser) => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const link = `${baseUrl}/login`;
    const text = `Votre accès Studio iamove :\nURL : ${link}\nEmail : ${user.email}\n\nConnectez-vous avec le mot de passe qui vous a été communiqué.`;
    navigator.clipboard.writeText(text);
    setCopiedUserId(user.id);
    setTimeout(() => setCopiedUserId(null), 2000);
  };

  const fetchUsers = useCallback(async () => {
    const res = await fetch("/api/studio/users");
    if (res.ok) setUsers(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleDelete = async (user: StudioUser) => {
    if (user.id === currentUserId) return;
    if (!confirm(`${t.common?.delete || "Supprimer"} l'utilisateur "${user.name}" ? Ses sites seront également supprimés.`)) return;
    await fetch(`/api/studio/users?id=${user.id}`, { method: "DELETE" });
    fetchUsers();
  };

  const handleToggleRole = async (user: StudioUser) => {
    if (user.id === currentUserId) return;
    const newRole = user.role === "ADMIN" ? "STANDARD" : "ADMIN";
    if (!confirm(`Changer le rôle de "${user.name}" en ${newRole} ?`)) return;
    await fetch("/api/studio/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user.id, action: "toggle-role" }),
    });
    fetchUsers();
  };

  const filtered = users.filter((u) =>
    search === "" ||
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="text-center py-8 text-gray-400">{t.common?.loading || "Chargement..."}</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-500" />
          <h1 className="text-xl font-bold">Utilisateurs Studio</h1>
          <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-0.5">
            {users.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 text-sm pl-8 w-48"
            />
          </div>
          <Button size="sm" onClick={() => setShowAddDialog(true)} className="h-8 gap-1">
            <Plus className="h-3.5 w-3.5" /> {t.common?.add || "Ajouter"}
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Shield className="h-3 w-3 text-yellow-500" /> Admin
        </span>
        <span className="flex items-center gap-1">
          <ShieldOff className="h-3 w-3 text-gray-400" /> Standard
        </span>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 uppercase">
            <tr>
              <th className="px-4 py-2 text-left">Utilisateur</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-center">Rôle</th>
              <th className="px-4 py-2 text-center">Sites</th>
              <th className="px-4 py-2 text-center">Dernière connexion</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((user) => {
              const isSelf = user.id === currentUserId;
              return (
                <tr key={user.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 ${isSelf ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}`}>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      {user.role === "ADMIN" ? (
                        <Shield className="h-3.5 w-3.5 text-yellow-500 flex-shrink-0" />
                      ) : (
                        <ShieldOff className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" />
                      )}
                      <span className="font-medium">{user.name}</span>
                      {isSelf && (
                        <span className="text-[10px] bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 px-1.5 py-0.5 rounded">
                          vous
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-gray-500">{user.email}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      user.role === "ADMIN"
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-1">
                      <Globe className="h-3 w-3" />
                      {user._count.sites}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-center text-gray-500 text-xs">
                    {user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                      : "Jamais"
                    }
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-0.5">
                      {!isSelf && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleRole(user)}
                            className="h-7 px-1.5"
                            title={user.role === "ADMIN" ? "Rétrograder en Standard" : "Promouvoir en Admin"}
                          >
                            {user.role === "ADMIN" ? (
                              <ShieldOff className="h-3.5 w-3.5 text-gray-400" />
                            ) : (
                              <Shield className="h-3.5 w-3.5 text-yellow-500" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditUser(user)}
                            className="h-7 px-1.5"
                            title={t.common?.edit || "Modifier"}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setResetPasswordUser(user)}
                            className="h-7 px-1.5"
                            title="Réinitialiser le mot de passe"
                          >
                            <KeyRound className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyLoginUrl(user)}
                            className="h-7 px-1.5"
                            title="Copier l'URL de connexion"
                          >
                            {copiedUserId === user.id ? (
                              <Check className="h-3.5 w-3.5 text-green-500" />
                            ) : (
                              <Link2 className="h-3.5 w-3.5 text-blue-500" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(user)}
                            className="h-7 px-1.5 text-red-500"
                            title={t.common?.delete || "Supprimer"}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-400">{t.common?.noData || "Aucun utilisateur trouvé"}</div>
      )}

      {/* Add Dialog */}
      {showAddDialog && (
        <AddUserDialog
          onClose={() => setShowAddDialog(false)}
          onCreated={() => { setShowAddDialog(false); fetchUsers(); }}
        />
      )}

      {/* Edit Dialog */}
      {editUser && (
        <EditUserDialog
          user={editUser}
          onClose={() => setEditUser(null)}
          onSaved={() => { setEditUser(null); fetchUsers(); }}
        />
      )}

      {/* Reset Password Dialog */}
      {resetPasswordUser && (
        <ResetPasswordDialog
          user={resetPasswordUser}
          onClose={() => setResetPasswordUser(null)}
          onReset={() => { setResetPasswordUser(null); fetchUsers(); }}
        />
      )}
    </div>
  );
}

// ------- Add User Dialog -------

function AddUserDialog({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { t } = useI18n();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "STANDARD" });
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) {
      setError("Tous les champs sont requis");
      return;
    }
    if (form.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }
    setSaving(true);
    setError("");
    const res = await fetch("/api/studio/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      onCreated();
    } else {
      setError(data.error || "Erreur");
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nouvel utilisateur Studio
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          {error && <div className="p-2 rounded bg-red-50 text-red-600 text-sm dark:bg-red-900/20 dark:text-red-400">{error}</div>}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Nom *</label>
            <Input
              placeholder="Nom complet"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="h-9"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium flex items-center gap-1"><Mail className="h-3 w-3" /> Email *</label>
            <Input
              type="email"
              placeholder="email@exemple.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="h-9"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium flex items-center gap-1"><KeyRound className="h-3 w-3" /> Mot de passe *</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 8 caractères"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="h-9 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium flex items-center gap-1"><Shield className="h-3 w-3" /> Rôle</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full h-9 px-3 rounded-md border border-gray-200 bg-white text-sm dark:bg-gray-900 dark:border-gray-700"
            >
              <option value="STANDARD">Standard</option>
              <option value="ADMIN">Administrateur</option>
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t.common?.cancel || "Annuler"}</Button>
          <Button onClick={handleSubmit} isLoading={saving}>Créer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ------- Edit User Dialog -------

function EditUserDialog({ user, onClose, onSaved }: { user: StudioUser; onClose: () => void; onSaved: () => void }) {
  const { t } = useI18n();
  const [form, setForm] = useState({ name: user.name, email: user.email });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.name || !form.email) {
      setError("Nom et email requis");
      return;
    }
    setSaving(true);
    setError("");
    const res = await fetch("/api/studio/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user.id, name: form.name, email: form.email }),
    });
    const data = await res.json();
    if (res.ok) {
      onSaved();
    } else {
      setError(data.error || "Erreur");
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier – {user.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          {error && <div className="p-2 rounded bg-red-50 text-red-600 text-sm dark:bg-red-900/20 dark:text-red-400">{error}</div>}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Nom</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Email</label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-9" />
          </div>
          <div className="text-xs text-gray-400 flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Créé le {new Date(user.createdAt).toLocaleDateString("fr-FR")}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t.common?.cancel || "Annuler"}</Button>
          <Button onClick={handleSubmit} isLoading={saving}>{t.common?.save || "Enregistrer"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ------- Reset Password Dialog -------

function ResetPasswordDialog({ user, onClose, onReset }: { user: StudioUser; onClose: () => void; onReset: () => void }) {
  const { t } = useI18n();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!password || password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }
    setSaving(true);
    setError("");
    const res = await fetch("/api/studio/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user.id, action: "reset-password", newPassword: password }),
    });
    const data = await res.json();
    if (res.ok) {
      onReset();
    } else {
      setError(data.error || "Erreur");
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-4 w-4" />
            Réinitialiser le mot de passe
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <p className="text-sm text-gray-500">
            Nouveau mot de passe pour <span className="font-medium text-gray-700 dark:text-gray-300">{user.name}</span> ({user.email})
          </p>
          {error && <div className="p-2 rounded bg-red-50 text-red-600 text-sm dark:bg-red-900/20 dark:text-red-400">{error}</div>}
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Nouveau mot de passe (8 car. min.)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-9 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t.common?.cancel || "Annuler"}</Button>
          <Button onClick={handleSubmit} isLoading={saving}>Réinitialiser</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
