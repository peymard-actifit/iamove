"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  useSaveStatus,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Input,
} from "@/components/ui";
import {
  Users,
  Network,
  User,
  GraduationCap,
  ClipboardCheck,
  Plus,
} from "lucide-react";
import { Tab1Persons } from "./tabs/tab1-persons";
import { Tab2Organigramme } from "./tabs/tab2-organigramme";
import { Tab3Profile } from "./tabs/tab3-profile";
import { Tab4Formation } from "./tabs/tab4-formation";
import { Tab5Quiz } from "./tabs/tab5-quiz";
import { SiteSettingsPanel } from "./site-settings-panel";
import { SiteHeaderContent } from "./site-header-content";

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
  primaryColor: string;
  secondaryColor: string;
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
  const [activeTab, setActiveTab] = useState("tab1");
  const [showAddPersonDialog, setShowAddPersonDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newPerson, setNewPerson] = useState({
    name: "",
    email: "",
    jobTitle: "",
    department: "",
    managerId: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  const handleCreatePerson = async () => {
    if (!newPerson.name || !newPerson.email) {
      setErrorMessage("Le nom et l'email sont requis");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    startSaving();

    try {
      const res = await fetch(`/api/sites/${site.id}/persons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPerson),
      });

      const data = await res.json();

      if (res.ok) {
        setShowAddPersonDialog(false);
        setNewPerson({ name: "", email: "", jobTitle: "", department: "", managerId: "" });
        saveDone();
        router.refresh();
      } else {
        setErrorMessage(data.error || "Une erreur est survenue");
        saveError();
      }
    } catch {
      setErrorMessage("Erreur de connexion au serveur");
      saveError();
    } finally {
      setIsLoading(false);
    }
  };

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

  // Fonction pour voir le profil d'une personne (change d'onglet)
  const handleViewProfile = (personId: string) => {
    setSelectedPersonId(personId);
    setActiveTab("tab3");
  };

  return (
    <div className="relative">
      {/* Injection du contenu dans le header global */}
      <SiteHeaderContent
        siteId={site.id}
        siteName={site.name}
        isPublished={site.isPublished}
        onSettingsClick={() => setShowSettings(!showSettings)}
        saveStatus={status}
      />

      {/* Main Content */}
      <div className="flex gap-6">
        <div className={`flex-1 transition-all ${showSettings ? "mr-80" : ""}`}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between w-full">
              <TabsList className="justify-start">
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
              <Button size="sm" onClick={() => setShowAddPersonDialog(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Ajouter une personne ({site.persons.length})
              </Button>
            </div>

            <TabsContent value="tab1" className="mt-2">
              <Tab1Persons
                siteId={site.id}
                persons={site.persons}
                levels={levels}
                onSaveStart={startSaving}
                onSaveDone={saveDone}
                onSaveError={saveError}
                onSelectPerson={handleViewProfile}
              />
            </TabsContent>

            <TabsContent value="tab2" className="mt-2">
              <Tab2Organigramme
                siteId={site.id}
                persons={site.persons}
                onSaveStart={startSaving}
                onSaveDone={saveDone}
                onSaveError={saveError}
              />
            </TabsContent>

            <TabsContent value="tab3" className="mt-2">
              <Tab3Profile
                siteId={site.id}
                persons={site.persons}
                levels={levels}
                selectedPersonId={selectedPersonId}
                onSelectPerson={setSelectedPersonId}
                onSaveStart={startSaving}
                onSaveDone={saveDone}
                onSaveError={saveError}
              />
            </TabsContent>

            <TabsContent value="tab4" className="mt-6">
              <Tab4Formation
                siteId={site.id}
                isStudioMode={true}
              />
            </TabsContent>

            <TabsContent value="tab5" className="mt-2">
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

      {/* Add Person Dialog */}
      <Dialog open={showAddPersonDialog} onOpenChange={(open) => {
        setShowAddPersonDialog(open);
        if (!open) setErrorMessage("");
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter une personne</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {errorMessage && (
              <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm dark:bg-red-900/20 dark:text-red-400">
                {errorMessage}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom complet *</label>
              <Input
                placeholder="Jean Dupont"
                value={newPerson.name}
                onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email *</label>
              <Input
                type="email"
                placeholder="jean.dupont@entreprise.com"
                value={newPerson.email}
                onChange={(e) => setNewPerson({ ...newPerson, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Poste</label>
              <Input
                placeholder="Développeur"
                value={newPerson.jobTitle}
                onChange={(e) => setNewPerson({ ...newPerson, jobTitle: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Service</label>
              <Input
                placeholder="IT"
                value={newPerson.department}
                onChange={(e) => setNewPerson({ ...newPerson, department: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Responsable</label>
              <select
                className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900"
                value={newPerson.managerId}
                onChange={(e) => setNewPerson({ ...newPerson, managerId: e.target.value })}
              >
                <option value="">Aucun (personne au sommet)</option>
                {site.persons.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} - {p.jobTitle || "Sans poste"}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddPersonDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreatePerson} isLoading={isLoading}>
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
