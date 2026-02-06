"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Input,
} from "@/components/ui";
import {
  User,
  LogOut,
  Settings,
  Shield,
  ShieldOff,
  FileQuestion,
  ChevronDown,
} from "lucide-react";
import type { SessionPayload } from "@/lib/auth";

interface StudioHeaderProps {
  session: SessionPayload;
}

export function StudioHeader({ session }: StudioHeaderProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [adminCode, setAdminCode] = useState("");
  const [adminError, setAdminError] = useState("");

  const handleLogout = async () => {
    setIsLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const handleUpgradeToAdmin = async () => {
    setAdminError("");
    const res = await fetch("/api/auth/upgrade-admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: adminCode }),
    });

    const data = await res.json();
    if (data.error) {
      setAdminError(data.error);
    } else {
      setShowAdminDialog(false);
      router.refresh();
    }
  };

  const handleDowngradeToStandard = async () => {
    await fetch("/api/auth/downgrade-standard", { method: "POST" });
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600" />
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            iamove
          </span>
          <span className="text-sm text-gray-500">Studio</span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Menu Actions (Admin only) */}
          {session.role === "ADMIN" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Actions
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Administration</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/quizzes">
                    <FileQuestion className="mr-2 h-4 w-4" />
                    Gérer les Quizz
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center dark:bg-gray-700">
                  <User className="h-4 w-4" />
                </div>
                <span className="hidden sm:inline">{session.name}</span>
                {session.role === "ADMIN" && (
                  <Shield className="h-4 w-4 text-yellow-500" />
                )}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{session.name}</span>
                  <span className="text-xs font-normal text-gray-500">
                    {session.email}
                  </span>
                  <span className="text-xs font-normal text-gray-400 mt-1">
                    {session.role === "ADMIN" ? "Administrateur" : "Utilisateur standard"}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Paramètres du compte
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {session.role === "STANDARD" ? (
                <DropdownMenuItem onClick={() => setShowAdminDialog(true)}>
                  <Shield className="mr-2 h-4 w-4" />
                  Devenir administrateur
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={handleDowngradeToStandard}>
                  <ShieldOff className="mr-2 h-4 w-4" />
                  Redevenir standard
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} disabled={isLoading}>
                <LogOut className="mr-2 h-4 w-4" />
                Se déconnecter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Dialog Admin Code */}
      <Dialog open={showAdminDialog} onOpenChange={setShowAdminDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Devenir administrateur</DialogTitle>
            <DialogDescription>
              Entrez le code administrateur pour accéder aux fonctionnalités avancées.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {adminError && (
              <p className="text-sm text-red-500 mb-4">{adminError}</p>
            )}
            <Input
              type="password"
              placeholder="Code administrateur"
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdminDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpgradeToAdmin}>Valider</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}
