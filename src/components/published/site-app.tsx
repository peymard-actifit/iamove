"use client";

import { useState, useCallback, createContext, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent, Button } from "@/components/ui";
import { Network, User, GraduationCap, ClipboardCheck, LogOut, Users, Lightbulb, MessageCircle, Code2, ClipboardList, BarChart3, Globe } from "lucide-react";
import { Tab2Organigramme } from "@/components/studio/tabs/tab2-organigramme";
import { Tab4Formation } from "@/components/studio/tabs/tab4-formation";
import { Tab5Quiz } from "@/components/studio/tabs/tab5-quiz";
import { PersonalProfileEditor } from "./personal-profile-editor";
import { AdminPersonsManager } from "./admin-persons-manager";
import { UseCasesTab } from "./use-cases-tab";
import { ForumTab } from "./forum-tab";
import { TechTipsTab } from "./tech-tips-tab";
import { BacklogTab } from "./backlog-tab";
import { RefinementTab } from "./refinement-tab";
import { EcosystemTab } from "./ecosystem-tab";
import { DynamicFavicon } from "./dynamic-favicon";
import { LevelSelfAssessment } from "./level-self-assessment";
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
  description?: string;
  translations?: LevelTranslation[];
}

interface PublishedSiteAppProps {
  site: Site;
  currentPerson: Person | null;
  visiblePersons: Person[];
  allPersons?: Person[];
  levels: Level[];
  isStudioUser: boolean;
  isPersonAdmin?: boolean;
  initialPP?: number;
  initialRank?: number;
}

export function PublishedSiteApp({
  site,
  currentPerson,
  visiblePersons,
  allPersons,
  levels,
  isStudioUser: _isStudioUser,
  isPersonAdmin = false,
  initialPP = 0,
  initialRank = 0,
}: PublishedSiteAppProps) {
  const router = useRouter();
  const { t } = useI18n();
  const [pp, setPp] = useState(initialPP);
  const [rank, setRank] = useState(initialRank);
  const [showSelfAssessment, setShowSelfAssessment] = useState(
    currentPerson?.currentLevel === 0
  );

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
      
      {/* Modal d'auto-évaluation pour les utilisateurs de niveau 0 */}
      {showSelfAssessment && currentPerson && (
        <LevelSelfAssessment
          siteId={site.id}
          personId={currentPerson.id}
          personName={currentPerson.firstName || currentPerson.name}
          levels={levels}
          onLevelSelected={() => setShowSelfAssessment(false)}
        />
      )}
      
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        {/* Favicon dynamique basé sur le niveau de la personne connectée */}
        {currentPerson && <DynamicFavicon level={currentPerson.currentLevel} />}
        
        <Tabs defaultValue="tab3" className="flex flex-col flex-1 min-h-0 w-full">
        {/* Header avec onglets intégrés dans la barre */}
        <header 
          className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800"
          style={{ backgroundColor: site.primaryColor }}
        >
          <div className="flex h-10 min-h-[2.5rem] items-center px-2 sm:px-4">
            {/* Gauche : nom du site */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="h-7 w-7 rounded bg-white/20 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">{site.name.charAt(0)}</span>
              </div>
              <span className="text-base font-semibold text-white truncate max-w-[120px] sm:max-w-none">
                {site.name}
              </span>
            </div>
            {/* Centre : onglets — flex-1 + justify-center */}
            <div className="flex-1 flex justify-center min-w-0 mx-2">
              <TabsList className="h-8 bg-white/10 border-0 gap-0.5 p-0.5 [&>button]:text-white/90 [&>button]:data-[state=active]:bg-white/20 [&>button]:rounded [&>button]:px-1.5 [&>button]:py-1 [&>button]:text-[11px]">
                {settings.tab3Enabled && (
                  <TabsTrigger value="tab3" className="gap-0.5" data-pp-menu="tab-profile">
                    <User className="h-3 w-3" />
                    <span className="hidden lg:inline">{t.tabs.profile}</span>
                  </TabsTrigger>
                )}
                {settings.tab2Enabled && (
                  <TabsTrigger value="tab2" className="gap-0.5" data-pp-menu="tab-organization">
                    <Network className="h-3 w-3" />
                    <span className="hidden lg:inline">{t.tabs.organization}</span>
                  </TabsTrigger>
                )}
                {settings.tab5Enabled && (
                  <TabsTrigger value="tab5" className="gap-0.5" data-pp-menu="tab-assessment">
                    <ClipboardCheck className="h-3 w-3" />
                    <span className="hidden lg:inline">{t.tabs.assessment}</span>
                  </TabsTrigger>
                )}
                {settings.tab4Enabled && (
                  <TabsTrigger value="tab4" className="gap-0.5" data-pp-menu="tab-training">
                    <GraduationCap className="h-3 w-3" />
                    <span className="hidden lg:inline">{t.tabs.training}</span>
                  </TabsTrigger>
                )}
                <TabsTrigger value="tab-usecases" className="gap-0.5" data-pp-menu="tab-usecases">
                  <Lightbulb className="h-3 w-3" />
                  <span className="hidden lg:inline">{t.publishedTabs?.useCases || "Use Cases"}</span>
                </TabsTrigger>
                <TabsTrigger value="tab-forum" className="gap-0.5" data-pp-menu="tab-forum">
                  <MessageCircle className="h-3 w-3" />
                  <span className="hidden lg:inline">{t.publishedTabs?.forum || "Forum"}</span>
                </TabsTrigger>
                <TabsTrigger value="tab-tech" className="gap-0.5" data-pp-menu="tab-tech">
                  <Code2 className="h-3 w-3" />
                  <span className="hidden lg:inline">{t.publishedTabs?.tech || "Tech"}</span>
                </TabsTrigger>
                <TabsTrigger value="tab-ecosystem" className="gap-0.5" data-pp-menu="tab-ecosystem">
                  <Globe className="h-3 w-3" />
                  <span className="hidden lg:inline">{t.publishedTabs?.ecosystem || "Écosystème"}</span>
                </TabsTrigger>
                <TabsTrigger value="tab-backlog" className="gap-0.5" data-pp-menu="tab-backlog">
                  <ClipboardList className="h-3 w-3" />
                  <span className="hidden lg:inline">{t.publishedTabs?.backlog || "Backlog"}</span>
                </TabsTrigger>
                {isPersonAdmin && (
                  <TabsTrigger value="tab-refinement" className="gap-0.5" data-pp-menu="tab-refinement">
                    <BarChart3 className="h-3 w-3" />
                    <span className="hidden lg:inline">{t.publishedTabs?.refinement || "Refinement"}</span>
                  </TabsTrigger>
                )}
                {isPersonAdmin && (
                  <TabsTrigger value="tab-admin" className="gap-0.5" data-pp-menu="tab-admin">
                    <Users className="h-3 w-3" />
                    <span className="hidden lg:inline">{t.publishedTabs?.persons || "Personnes"}</span>
                  </TabsTrigger>
                )}
              </TabsList>
            </div>
            {/* Droite : infos utilisateur */}
            <div className="flex items-center gap-2 flex-shrink-0">
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
              persons={isPersonAdmin ? (allPersons || visiblePersons) : visiblePersons}
              currentUserEmail={currentPerson?.email}
              isPublished={true}
              showFullTree={isPersonAdmin}
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

          <TabsContent value="tab-usecases" className="mt-0 flex-1 min-h-0 data-[state=inactive]:hidden flex flex-col">
            {currentPerson && (
              <UseCasesTab siteId={site.id} currentPersonId={currentPerson.id} />
            )}
          </TabsContent>

          <TabsContent value="tab-forum" className="mt-0 flex-1 min-h-0 data-[state=inactive]:hidden flex flex-col">
            {currentPerson && (
              <ForumTab siteId={site.id} currentPersonId={currentPerson.id} />
            )}
          </TabsContent>

          <TabsContent value="tab-tech" className="mt-0 flex-1 min-h-0 data-[state=inactive]:hidden flex flex-col">
            {currentPerson && (
              <TechTipsTab siteId={site.id} currentPersonId={currentPerson.id} />
            )}
          </TabsContent>

          <TabsContent value="tab-ecosystem" className="mt-0 flex-1 min-h-0 data-[state=inactive]:hidden flex flex-col">
            <EcosystemTab siteId={site.id} isAdmin={isPersonAdmin} />
          </TabsContent>

          <TabsContent value="tab-backlog" className="mt-0 flex-1 min-h-0 data-[state=inactive]:hidden flex flex-col">
            {currentPerson && (
              <BacklogTab
                siteId={site.id}
                personId={currentPerson.id}
                isAdmin={isPersonAdmin}
                persons={(allPersons || visiblePersons).map((p) => ({ id: p.id, name: p.name, department: p.department }))}
              />
            )}
          </TabsContent>

          {isPersonAdmin && (
            <TabsContent value="tab-refinement" className="mt-0 flex-1 min-h-0 data-[state=inactive]:hidden flex flex-col">
              <RefinementTab
                siteId={site.id}
                persons={(allPersons || visiblePersons).map((p) => ({ id: p.id, name: p.name, department: p.department }))}
              />
            </TabsContent>
          )}

          {isPersonAdmin && (
            <TabsContent value="tab-admin" className="mt-0 flex-1 min-h-0 data-[state=inactive]:hidden flex flex-col">
              <AdminPersonsManager
                siteId={site.id}
                siteSlug={site.slug}
                persons={allPersons || visiblePersons}
                currentPersonId={currentPerson?.id || ""}
              />
            </TabsContent>
          )}
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
