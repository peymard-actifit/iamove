"use client";

import { useState, useCallback, createContext, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent, Button } from "@/components/ui";
import { Network, User, GraduationCap, ClipboardCheck, LogOut } from "lucide-react";
import { Tab2Organigramme } from "@/components/studio/tabs/tab2-organigramme";
import { Tab4Formation } from "@/components/studio/tabs/tab4-formation";
import { Tab5Quiz } from "@/components/studio/tabs/tab5-quiz";
import { PersonalProfileEditor } from "./personal-profile-editor";
import { DynamicFavicon } from "./dynamic-favicon";
import { LanguageSelector } from "@/components/studio/language-selector";
import { useI18n } from "@/lib/i18n";
import type { PPAction } from "@/lib/pp-rules";

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
  isOnline: boolean;
  participationPoints?: number;
  manager: { id: string; name: string } | null;
  subordinates: { id: string; name: string }[];
}

interface PPContextValue {
  pp: number;
  rank: number;
  addPP: (action: PPAction) => Promise<void>;
}

const PPContext = createContext<PPContextValue | null>(null);

export function usePP() {
  const ctx = useContext(PPContext);
  return ctx;
}

interface Site {
  id: string;
  name: string;
  slug: string;
  primaryColor: string;
  secondaryColor: string;
  settings: {
    tab2Title: string;
    tab2Enabled: boolean;
    tab3Title: string;
    tab3Enabled: boolean;
    tab4Title: string;
    tab4Enabled: boolean;
    tab5Title: string;
    tab5Enabled: boolean;
  } | null;
}

interface LevelTranslation {
  id: string;
  language: string;
  name: string;
  category: string;
  seriousGaming: string;
  description: string;
}

interface Level {
  id: string;
  number: number;
  name: string;
  category?: string;
  seriousGaming?: string;
  translations?: LevelTranslation[];
}

interface PublishedSiteAppProps {
  site: Site;
  currentPerson: Person | null;
  visiblePersons: Person[];
  levels: Level[];
  isStudioUser: boolean;
  initialPP?: number;
  initialRank?: number;
}

export function PublishedSiteApp({
  site,
  currentPerson,
  visiblePersons,
  levels,
  isStudioUser: _isStudioUser,
  initialPP = 0,
  initialRank = 0,
}: PublishedSiteAppProps) {
  const router = useRouter();
  const { t } = useI18n();
  const [pp, setPp] = useState(initialPP);
  const [rank, setRank] = useState(initialRank);

  const addPP = useCallback(
    async (action: PPAction) => {
      try {
        const res = await fetch(`/api/sites/${site.id}/pp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ action }),
        });
        if (!res.ok) return;
        const data = await res.json();
        if (typeof data.newTotal === "number") setPp(data.newTotal);
        if (typeof data.rank === "number") setRank(data.rank);
      } catch {
        // ignore
      }
    },
    [site.id]
  );

  const ppValue: PPContextValue = { pp, rank, addPP };

  const settings = site.settings || {
    tab2Title: t.tabs.organization,
    tab2Enabled: true,
    tab3Title: t.tabs.profile,
    tab3Enabled: true,
    tab4Title: t.tabs.training,
    tab4Enabled: true,
    tab5Title: t.tabs.assessment,
    tab5Enabled: true,
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push(`/s/${site.slug}`);
    router.refresh();
  };

  return (
    <PPContext.Provider value={ppValue}>
      {currentPerson && <PPClickTracker />}
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        {/* Favicon dynamique basé sur le niveau de la personne connectée */}
        {currentPerson && <DynamicFavicon level={currentPerson.currentLevel} />}
        
        <Tabs defaultValue="tab3" className="flex flex-col flex-1 min-h-0 w-full">
        {/* Header avec onglets intégrés dans la barre */}
        <header 
          className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800"
          style={{ backgroundColor: site.primaryColor }}
        >
          <div className="container mx-auto flex h-10 min-h-[2.5rem] items-center justify-between gap-2 px-2 sm:px-4">
            <div className="flex items-center gap-2 flex-shrink-0 min-w-0 flex-1 justify-start">
              <div className="h-7 w-7 rounded bg-white/20 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">{site.name.charAt(0)}</span>
              </div>
              <span className="text-base font-semibold text-white truncate max-w-[120px] sm:max-w-none">
                {site.name}
              </span>
            </div>
            {/* Onglets centrés dans la barre */}
            <TabsList className="flex-shrink-0 justify-center h-8 mx-1 bg-white/10 border-0 gap-0.5 p-0.5 [&>button]:text-white/90 [&>button]:data-[state=active]:bg-white/20 [&>button]:rounded [&>button]:px-2 [&>button]:py-1 [&>button]:text-xs">
              {settings.tab3Enabled && (
                <TabsTrigger value="tab3" className="gap-1" data-pp-menu="tab-profile">
                  <User className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{t.tabs.profile}</span>
                </TabsTrigger>
              )}
              {settings.tab2Enabled && (
                <TabsTrigger value="tab2" className="gap-1" data-pp-menu="tab-organization">
                  <Network className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{t.tabs.organization}</span>
                </TabsTrigger>
              )}
              {settings.tab5Enabled && (
                <TabsTrigger value="tab5" className="gap-1" data-pp-menu="tab-assessment">
                  <ClipboardCheck className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{t.tabs.assessment}</span>
                </TabsTrigger>
              )}
              {settings.tab4Enabled && (
                <TabsTrigger value="tab4" className="gap-1" data-pp-menu="tab-training">
                  <GraduationCap className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{t.tabs.training}</span>
                </TabsTrigger>
              )}
            </TabsList>
            <div className="flex items-center gap-2 flex-shrink-0 flex-1 justify-end">
              {currentPerson && (
                <>
                  <span className="text-white/80 text-xs hidden sm:inline truncate max-w-[100px]">
                    {currentPerson.name}
                  </span>
                  <PPCounter />
                </>
              )}
              <LanguageSelector />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-white hover:bg-white/20 h-8 px-2"
              >
                <LogOut className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">{t.published.logout}</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Contenu des onglets */}
        <main className="container mx-auto px-4 pt-2 pb-6 flex-1 min-h-0 flex flex-col">
          <TabsContent value="tab2" className="mt-0 flex-1 min-h-0 data-[state=inactive]:hidden flex flex-col">
            <Tab2Organigramme
              siteId={site.id}
              siteName={site.name}
              persons={visiblePersons}
              currentUserEmail={currentPerson?.email}
              isPublished={true}
              onSaveStart={() => {}}
              onSaveDone={() => {}}
              onSaveError={() => {}}
            />
          </TabsContent>

          <TabsContent value="tab3" className="mt-0 flex-1 min-h-0 data-[state=inactive]:hidden flex flex-col">
            {currentPerson ? (
              <PersonalProfileEditor
                siteId={site.id}
                person={currentPerson}
                persons={visiblePersons}
                levels={levels}
              />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>{t.published.noProfileAssociated}</p>
                <p className="text-sm mt-2">{t.published.emailNotMatching}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="tab4" className="mt-0 flex-1 min-h-0 data-[state=inactive]:hidden flex flex-col">
            <Tab4Formation
              siteId={site.id}
              isStudioMode={false}
              personId={currentPerson?.id}
              levelsWithTranslations={levels}
            />
          </TabsContent>

          <TabsContent value="tab5" className="mt-0 flex-1 min-h-0 data-[state=inactive]:hidden flex flex-col">
            <Tab5Quiz
              siteId={site.id}
              isStudioMode={false}
              personId={currentPerson?.id}
              currentLevel={currentPerson?.currentLevel || 0}
              levelsWithTranslations={levels}
            />
          </TabsContent>
        </main>
      </Tabs>
    </div>
    </PPContext.Provider>
  );
}

const PP_SESSION_KEY = "pp_seen_menu";

function PPClickTracker() {
  const { addPP } = usePP() ?? { addPP: async () => {} };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const menuEl = target.closest?.("[data-pp-menu]");

      if (menuEl) {
        const id = (menuEl as HTMLElement).getAttribute("data-pp-menu") || "menu";
        try {
          const seen = sessionStorage.getItem(PP_SESSION_KEY) || "[]";
          const arr: string[] = JSON.parse(seen);
          if (!arr.includes(id)) {
            addPP("menu_or_button");
            sessionStorage.setItem(PP_SESSION_KEY, JSON.stringify([...arr, id]));
          } else {
            addPP("click");
          }
        } catch {
          addPP("menu_or_button");
        }
      } else {
        addPP("click");
      }
    };
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [addPP]);

  return null;
}

function PPCounter() {
  const ctx = usePP();
  if (!ctx) return null;
  return (
    <span className="text-white/90 text-xs font-medium tabular-nums whitespace-nowrap" title="Points de Participation">
      {ctx.pp} PP <span className="text-white/70">({ctx.rank})</span>
    </span>
  );
}
