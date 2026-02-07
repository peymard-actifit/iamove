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
  ChevronDown,
  Scale,
  FileQuestion,
  Upload,
} from "lucide-react";
import type { SessionPayload } from "@/lib/auth";
import { useHeaderContent } from "./header-context";
import { LanguageSelector } from "./language-selector";
import { LevelsEditorDialog } from "./levels-editor-dialog";
import { QuizImportDialog } from "./quiz-import-dialog";
import { useI18n } from "@/lib/i18n";

interface StudioHeaderProps {
  session: SessionPayload;
}

export function StudioHeader({ session }: StudioHeaderProps) {
  const { centerContent, rightActions } = useHeaderContent();
  const { t } = useI18n();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [showLevelsDialog, setShowLevelsDialog] = useState(false);
  const [showQuizImportDialog, setShowQuizImportDialog] = useState(false);
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
      <div className="container mx-auto flex h-14 items-center px-4 gap-4">
        {/* Logo (gauche) */}
        <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600" />
          <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            iamove
          </span>
          <span className="text-xs text-gray-500">{t.nav.studio}</span>
          <span className="text-[10px] text-gray-400 font-mono">v{process.env.NEXT_PUBLIC_APP_VERSION || "2.3.0"}</span>
        </Link>

        {/* Contenu central (flexible) */}
        <div className="flex-1 flex items-center justify-center">
          {centerContent}
        </div>

        {/* Actions droite */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Actions personnalisées */}
          {rightActions}

          {/* Menu Actions (Admin only) */}
          {session.role === "ADMIN" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {t.nav.actions}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/quizzes">
                    <FileQuestion className="mr-2 h-4 w-4" />
                    {t.nav.manageQuizzes}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowQuizImportDialog(true)}>
                  <Upload className="mr-2 h-4 w-4" />
                  {t.nav.importQuizzes}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowLevelsDialog(true)}>
                  <Scale className="mr-2 h-4 w-4" />
                  {t.nav.levelsScale}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Language Selector */}
          <LanguageSelector />

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
                    {session.role === "ADMIN" ? t.user.administrator : t.user.standardUser}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  {t.user.accountSettings}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {session.role === "STANDARD" ? (
                <DropdownMenuItem onClick={() => setShowAdminDialog(true)}>
                  <Shield className="mr-2 h-4 w-4" />
                  {t.user.becomeAdmin}
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={handleDowngradeToStandard}>
                  <ShieldOff className="mr-2 h-4 w-4" />
                  {t.user.becomeStandard}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} disabled={isLoading}>
                <LogOut className="mr-2 h-4 w-4" />
                {t.nav.logout}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Dialog Admin Code */}
      <Dialog open={showAdminDialog} onOpenChange={setShowAdminDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.user.adminCodeTitle}</DialogTitle>
            <DialogDescription>
              {t.user.adminCodeDescription}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {adminError && (
              <p className="text-sm text-red-500 mb-4">{adminError}</p>
            )}
            <Input
              type="password"
              placeholder={t.user.adminCodePlaceholder}
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdminDialog(false)}>
              {t.user.cancel}
            </Button>
            <Button onClick={handleUpgradeToAdmin}>{t.user.validate}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Échelle des niveaux */}
      <LevelsEditorDialog
        open={showLevelsDialog}
        onOpenChange={setShowLevelsDialog}
      />

      {/* Dialog Import Quizz */}
      <QuizImportDialog
        open={showQuizImportDialog}
        onOpenChange={setShowQuizImportDialog}
      />
    </header>
  );
}
