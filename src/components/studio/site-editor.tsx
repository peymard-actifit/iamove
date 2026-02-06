"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Button,
  SaveIndicator,
  useSaveStatus,
} from "@/components/ui";
import {
  ArrowLeft,
  Users,
  Network,
  User,
  GraduationCap,
  ClipboardCheck,
  Settings,
  Globe,
  GlobeLock,
} from "lucide-react";
import { Tab1Persons } from "./tabs/tab1-persons";
import { Tab2Organigramme } from "./tabs/tab2-organigramme";
import { Tab3Profile } from "./tabs/tab3-profile";
import { Tab4Formation } from "./tabs/tab4-formation";
import { Tab5Quiz } from "./tabs/tab5-quiz";
import { SiteSettingsPanel } from "./site-settings-panel";

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
  subordinates: { id: string; name: string }[];
}

interface Site {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isPublished: boolean;
  settings: {
    tab1Title: string;
    tab1Enabled: boolean;
    tab2Title: string;
    tab2Enabled: boolean;
    tab3Title: string;
    tab3Enabled: boolean;
    tab4Title: string;
    tab4Enabled: boolean;
    tab5Title: string;
    tab5Enabled: boolean;
  } | null;
  persons: Person[];
}

interface Level {
  id: string;
  number: number;
  name: string;
}

interface SiteEditorProps {
  site: Site;
  levels: Level[];
}

export function SiteEditor({ site, levels }: SiteEditorProps) {
  const router = useRouter();
  const { status, startSaving, saveDone, saveError } = useSaveStatus();
  const [showSettings, setShowSettings] = useState(false);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  const settings = site.settings || {
    tab1Title: "Équipe",
    tab1Enabled: true,
    tab2Title: "Organisation",
    tab2Enabled: true,
    tab3Title: "Profil",
    tab3Enabled: true,
    tab4Title: "Formation",
    tab4Enabled: true,
    tab5Title: "Évaluation",
    tab5Enabled: true,
  };

  const handlePublishToggle = async () => {
    startSaving();
    try {
      await fetch(`/api/sites/${site.id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publish: !site.isPublished }),
      });
      saveDone();
      router.refresh();
    } catch {
      saveError();
    }
  };

  return (
    <div className="relative">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{site.name}</h1>
            <p className="text-sm text-gray-500">{site.slug}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <SaveIndicator status={status} />
          
          <Button
            variant={site.isPublished ? "outline" : "default"}
            onClick={handlePublishToggle}
          >
            {site.isPublished ? (
              <>
                <Globe className="h-4 w-4 mr-2 text-green-500" />
                Publié
              </>
            ) : (
              <>
                <GlobeLock className="h-4 w-4 mr-2" />
                Publier
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-6">
        <div className={`flex-1 transition-all ${showSettings ? "mr-80" : ""}`}>
          <Tabs defaultValue="tab1" className="w-full">
            <TabsList className="w-full justify-start">
              {settings.tab1Enabled && (
                <TabsTrigger value="tab1" className="gap-2">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">{settings.tab1Title}</span>
                </TabsTrigger>
              )}
              {settings.tab2Enabled && (
                <TabsTrigger value="tab2" className="gap-2">
                  <Network className="h-4 w-4" />
                  <span className="hidden sm:inline">{settings.tab2Title}</span>
                </TabsTrigger>
              )}
              {settings.tab3Enabled && (
                <TabsTrigger value="tab3" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{settings.tab3Title}</span>
                </TabsTrigger>
              )}
              {settings.tab4Enabled && (
                <TabsTrigger value="tab4" className="gap-2">
                  <GraduationCap className="h-4 w-4" />
                  <span className="hidden sm:inline">{settings.tab4Title}</span>
                </TabsTrigger>
              )}
              {settings.tab5Enabled && (
                <TabsTrigger value="tab5" className="gap-2">
                  <ClipboardCheck className="h-4 w-4" />
                  <span className="hidden sm:inline">{settings.tab5Title}</span>
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="tab1" className="mt-6">
              <Tab1Persons
                siteId={site.id}
                persons={site.persons}
                levels={levels}
                onSaveStart={startSaving}
                onSaveDone={saveDone}
                onSaveError={saveError}
                onSelectPerson={setSelectedPersonId}
              />
            </TabsContent>

            <TabsContent value="tab2" className="mt-6">
              <Tab2Organigramme
                siteId={site.id}
                persons={site.persons}
                onSaveStart={startSaving}
                onSaveDone={saveDone}
                onSaveError={saveError}
              />
            </TabsContent>

            <TabsContent value="tab3" className="mt-6">
              <Tab3Profile
                siteId={site.id}
                persons={site.persons}
                levels={levels}
                selectedPersonId={selectedPersonId}
                onSelectPerson={setSelectedPersonId}
              />
            </TabsContent>

            <TabsContent value="tab4" className="mt-6">
              <Tab4Formation
                siteId={site.id}
                isStudioMode={true}
              />
            </TabsContent>

            <TabsContent value="tab5" className="mt-6">
              <Tab5Quiz
                siteId={site.id}
                isStudioMode={true}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <SiteSettingsPanel
            site={site}
            onClose={() => setShowSettings(false)}
            onSaveStart={startSaving}
            onSaveDone={saveDone}
            onSaveError={saveError}
          />
        )}
      </div>
    </div>
  );
}
