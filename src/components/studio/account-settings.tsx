"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui";
import { Eye, EyeOff, Save, Shield, ShieldOff } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface User {
  id: string;
  name: string;
  email: string;
  role: "STANDARD" | "ADMIN";
  createdAt: Date;
}

interface AccountSettingsProps {
  user: User;
}

export function AccountSettings({ user }: AccountSettingsProps) {
  const router = useRouter();
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const [profileData, setProfileData] = useState({
    name: user.name,
    email: user.email,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [adminCode, setAdminCode] = useState("");

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/update-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });

      const data = await res.json();

      if (data.error) {
        setMessage({ type: "error", text: data.error });
      } else {
        setMessage({ type: "success", text: "Profil mis à jour" });
        router.refresh();
      }
    } catch {
      setMessage({ type: "error", text: "Une erreur est survenue" });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "Les mots de passe ne correspondent pas" });
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/update-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setMessage({ type: "error", text: data.error });
      } else {
        setMessage({ type: "success", text: "Mot de passe mis à jour" });
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch {
      setMessage({ type: "error", text: "Une erreur est survenue" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminUpgrade = async () => {
    if (!adminCode) return;
    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/upgrade-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: adminCode }),
      });

      const data = await res.json();

      if (data.error) {
        setMessage({ type: "error", text: data.error });
      } else {
        setMessage({ type: "success", text: "Vous êtes maintenant administrateur" });
        setAdminCode("");
        router.refresh();
      }
    } catch {
      setMessage({ type: "error", text: "Une erreur est survenue" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminDowngrade = async () => {
    if (!confirm("Voulez-vous vraiment redevenir utilisateur standard ?")) return;
    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/downgrade-standard", {
        method: "POST",
      });

      const data = await res.json();

      if (data.error) {
        setMessage({ type: "error", text: data.error });
      } else {
        setMessage({ type: "success", text: "Vous êtes maintenant utilisateur standard" });
        router.refresh();
      }
    } catch {
      setMessage({ type: "error", text: "Une erreur est survenue" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`p-4 rounded-md ${
            message.type === "success"
              ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
              : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
        </CardHeader>
        <form onSubmit={handleProfileUpdate}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom</label>
              <Input
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" isLoading={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {t.common?.save || "Enregistrer"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle>Changer le mot de passe</CardTitle>
        </CardHeader>
        <form onSubmit={handlePasswordUpdate}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Mot de passe actuel</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nouveau mot de passe</label>
              <Input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                }
                required
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Confirmer le nouveau mot de passe</label>
              <Input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" isLoading={isLoading}>
              Mettre à jour le mot de passe
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Admin */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Statut administrateur
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-md bg-gray-50 dark:bg-gray-800">
            <div>
              <p className="font-medium">Statut actuel</p>
              <p className="text-sm text-gray-500">
                {user.role === "ADMIN" ? "Administrateur" : "Utilisateur standard"}
              </p>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                user.role === "ADMIN"
                  ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
              }`}
            >
              {user.role}
            </div>
          </div>

          {user.role === "STANDARD" ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                Entrez le code administrateur pour accéder aux fonctionnalités avancées
              </p>
              <div className="flex gap-2">
                <Input
                  type="password"
                  placeholder="Code administrateur"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                />
                <Button onClick={handleAdminUpgrade} isLoading={isLoading} disabled={!adminCode}>
                  <Shield className="h-4 w-4 mr-2" />
                  Activer
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                En tant qu&apos;administrateur, vous avez accès à la gestion des quizz et pouvez voir tous les sites.
              </p>
              <Button
                variant="outline"
                onClick={handleAdminDowngrade}
                isLoading={isLoading}
              >
                <ShieldOff className="h-4 w-4 mr-2" />
                Redevenir utilisateur standard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="border-dashed">
        <CardContent className="pt-6 text-sm text-gray-500">
          <p>Compte créé le {new Date(user.createdAt).toLocaleDateString("fr-FR")}</p>
        </CardContent>
      </Card>
    </div>
  );
}
