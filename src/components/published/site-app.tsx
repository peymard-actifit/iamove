"use client";

import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent, Button } from "@/components/ui";
import { Network, User, GraduationCap, ClipboardCheck, LogOut } from "lucide-react";
import { Tab2Organigramme } from "@/components/studio/tabs/tab2-organigramme";
import { Tab4Formation } from "@/components/studio/tabs/tab4-formation";
import { Tab5Quiz } from "@/components/studio/tabs/tab5-quiz";
import { PersonalProfileEditor } from "./personal-profile-editor";
import { DynamicFavicon } from "./dynamic-favicon";

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
  manager: { id: string; name: string } | null;
  subordinates: { id: string; name: string }[];
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

interface Level {
  id: string;
  number: number;
  name: string;
}

interface PublishedSiteAppProps {
  site: Site;
  currentPerson: Person | null;
  visiblePersons: Person[];
  levels: Level[];
  isStudioUser: boolean;
}

export function PublishedSiteApp({
  site,
  currentPerson,
  visiblePersons,
  levels,
  isStudioUser: _isStudioUser,
}: PublishedSiteAppProps) {
  const router = useRouter();

  const settings = site.settings || {
    tab2Title: "Organisation",
    tab2Enabled: true,
    tab3Title: "Profil",
    tab3Enabled: true,
    tab4Title: "Formation",
    tab4Enabled: true,
    tab5Title: "Évaluation",
    tab5Enabled: true,
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push(`/s/${site.slug}`);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Favicon dynamique basé sur le niveau de la personne connectée */}
      {currentPerson && <DynamicFavicon level={currentPerson.currentLevel} />}
      
      {/* Header */}
      <header 
        className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800"
        style={{ backgroundColor: site.primaryColor }}
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
              <span className="text-white font-bold">
                {site.name.charAt(0)}
              </span>
            </div>
            <span className="text-lg font-semibold text-white">
              {site.name}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {currentPerson && (
              <span className="text-white/80 text-sm hidden sm:inline">
                {currentPerson.name}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-white hover:bg-white/20"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Déconnexion</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="tab3" className="w-full">
          <TabsList className="w-full justify-start mb-6">
            {/* Ordre : Profil, Organigramme, Évaluation, Formation */}
            {settings.tab3Enabled && (
              <TabsTrigger value="tab3" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{settings.tab3Title}</span>
              </TabsTrigger>
            )}
            {settings.tab2Enabled && (
              <TabsTrigger value="tab2" className="gap-2">
                <Network className="h-4 w-4" />
                <span className="hidden sm:inline">{settings.tab2Title}</span>
              </TabsTrigger>
            )}
            {settings.tab5Enabled && (
              <TabsTrigger value="tab5" className="gap-2">
                <ClipboardCheck className="h-4 w-4" />
                <span className="hidden sm:inline">{settings.tab5Title}</span>
              </TabsTrigger>
            )}
            {settings.tab4Enabled && (
              <TabsTrigger value="tab4" className="gap-2">
                <GraduationCap className="h-4 w-4" />
                <span className="hidden sm:inline">{settings.tab4Title}</span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="tab2">
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

          <TabsContent value="tab3">
            {currentPerson ? (
              <PersonalProfileEditor
                siteId={site.id}
                person={currentPerson}
                persons={visiblePersons}
              />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>Aucun profil associé à votre compte dans ce site</p>
                <p className="text-sm mt-2">Votre email ne correspond à aucune personne enregistrée</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="tab4">
            <Tab4Formation
              siteId={site.id}
              isStudioMode={false}
              personId={currentPerson?.id}
            />
          </TabsContent>

          <TabsContent value="tab5">
            <Tab5Quiz
              siteId={site.id}
              isStudioMode={false}
              personId={currentPerson?.id}
              currentLevel={currentPerson?.currentLevel || 0}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
