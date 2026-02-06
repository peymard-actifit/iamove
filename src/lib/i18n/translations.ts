// =============================================================================
// TRADUCTIONS GLOBALES - IAMOVE STUDIO
// =============================================================================

export type SupportedLanguage = 
  | "FR" | "EN" | "DE" | "ES" | "IT" | "PT" | "NL" | "PL" | "RU" 
  | "JA" | "ZH" | "KO" | "AR" | "TR" | "SV" | "DA" | "FI" | "NO" 
  | "CS" | "EL" | "HU" | "RO" | "SK" | "BG" | "UK" | "ID";

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  countryCode: string; // Code pays ISO pour flag-icons (ex: "fr", "gb")
}

// Langues supportées par DeepL avec codes pays pour flag-icons
export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: "FR", name: "French", nativeName: "Français", countryCode: "fr" },
  { code: "EN", name: "English", nativeName: "English", countryCode: "gb" },
  { code: "DE", name: "German", nativeName: "Deutsch", countryCode: "de" },
  { code: "ES", name: "Spanish", nativeName: "Español", countryCode: "es" },
  { code: "IT", name: "Italian", nativeName: "Italiano", countryCode: "it" },
  { code: "PT", name: "Portuguese", nativeName: "Português", countryCode: "pt" },
  { code: "NL", name: "Dutch", nativeName: "Nederlands", countryCode: "nl" },
  { code: "PL", name: "Polish", nativeName: "Polski", countryCode: "pl" },
  { code: "RU", name: "Russian", nativeName: "Русский", countryCode: "ru" },
  { code: "JA", name: "Japanese", nativeName: "日本語", countryCode: "jp" },
  { code: "ZH", name: "Chinese", nativeName: "中文", countryCode: "cn" },
  { code: "KO", name: "Korean", nativeName: "한국어", countryCode: "kr" },
  { code: "AR", name: "Arabic", nativeName: "العربية", countryCode: "sa" },
  { code: "TR", name: "Turkish", nativeName: "Türkçe", countryCode: "tr" },
  { code: "SV", name: "Swedish", nativeName: "Svenska", countryCode: "se" },
  { code: "DA", name: "Danish", nativeName: "Dansk", countryCode: "dk" },
  { code: "FI", name: "Finnish", nativeName: "Suomi", countryCode: "fi" },
  { code: "NO", name: "Norwegian", nativeName: "Norsk", countryCode: "no" },
  { code: "CS", name: "Czech", nativeName: "Čeština", countryCode: "cz" },
  { code: "EL", name: "Greek", nativeName: "Ελληνικά", countryCode: "gr" },
  { code: "HU", name: "Hungarian", nativeName: "Magyar", countryCode: "hu" },
  { code: "RO", name: "Romanian", nativeName: "Română", countryCode: "ro" },
  { code: "SK", name: "Slovak", nativeName: "Slovenčina", countryCode: "sk" },
  { code: "BG", name: "Bulgarian", nativeName: "Български", countryCode: "bg" },
  { code: "UK", name: "Ukrainian", nativeName: "Українська", countryCode: "ua" },
  { code: "ID", name: "Indonesian", nativeName: "Bahasa Indonesia", countryCode: "id" },
];

// Cache des traductions chargées depuis la DB
const translationsCache: Map<string, Record<string, string>> = new Map();

// Charger les traductions depuis l'API (côté client)
export async function loadTranslationsFromDB(lang: SupportedLanguage): Promise<Record<string, string>> {
  const cacheKey = `GLOBAL_${lang}`;
  
  if (translationsCache.has(cacheKey)) {
    return translationsCache.get(cacheKey)!;
  }

  try {
    const res = await fetch(`/api/translations?lang=${lang}&type=GLOBAL`);
    if (res.ok) {
      const data = await res.json();
      translationsCache.set(cacheKey, data);
      return data;
    }
  } catch (error) {
    console.error("Error loading translations:", error);
  }
  
  return {};
}

// Convertir les traductions plates en objet structuré
export function buildTranslationsObject(flatTranslations: Record<string, string>): Translations {
  const getValue = (key: string, fallback: string) => flatTranslations[key] || fallback;
  
  return {
    nav: {
      studio: getValue("nav.studio", "Studio"),
      dashboard: getValue("nav.dashboard", "Tableau de bord"),
      settings: getValue("nav.settings", "Paramètres"),
      logout: getValue("nav.logout", "Se déconnecter"),
      actions: getValue("nav.actions", "Actions"),
      manageQuizzes: getValue("nav.manageQuizzes", "Gérer les Quizz"),
    },
    header: {
      mySites: getValue("header.mySites", "Mes sites"),
      mySitesDescription: getValue("header.mySitesDescription", "Gérez vos sites d'accompagnement IA"),
      addSite: getValue("header.addSite", "Ajouter un site"),
      addPerson: getValue("header.addPerson", "Ajouter une personne"),
    },
    user: {
      accountSettings: getValue("user.accountSettings", "Paramètres du compte"),
      becomeAdmin: getValue("user.becomeAdmin", "Devenir administrateur"),
      becomeStandard: getValue("user.becomeStandard", "Redevenir standard"),
      administrator: getValue("user.administrator", "Administrateur"),
      standardUser: getValue("user.standardUser", "Utilisateur standard"),
      adminCodeTitle: getValue("user.adminCodeTitle", "Devenir administrateur"),
      adminCodeDescription: getValue("user.adminCodeDescription", "Entrez le code administrateur pour accéder aux fonctionnalités avancées."),
      adminCodePlaceholder: getValue("user.adminCodePlaceholder", "Code administrateur"),
      validate: getValue("user.validate", "Valider"),
      cancel: getValue("user.cancel", "Annuler"),
    },
    sites: {
      noSites: getValue("sites.noSites", "Aucun site créé"),
      createFirst: getValue("sites.createFirst", "Créez votre premier site d'accompagnement IA"),
      createSite: getValue("sites.createSite", "Créer un site"),
      siteName: getValue("sites.siteName", "Nom du site"),
      siteDescription: getValue("sites.siteDescription", "Description"),
      edit: getValue("common.edit", "Modifier"),
      duplicate: getValue("sites.duplicate", "Dupliquer"),
      delete: getValue("common.delete", "Supprimer"),
      publish: getValue("sites.publish", "Publier"),
      unpublish: getValue("sites.unpublish", "Dépublier"),
      published: getValue("sites.published", "Publié"),
      draft: getValue("sites.draft", "Brouillon"),
      confirmDelete: getValue("sites.confirmDelete", "Supprimer ce site ?"),
      confirmDeleteMessage: getValue("sites.confirmDeleteMessage", "Cette action est irréversible."),
      persons: getValue("sites.persons", "personnes"),
      lastModified: getValue("sites.lastModified", "Modifié"),
    },
    tabs: {
      team: getValue("tabs.team", "Équipe"),
      organization: getValue("tabs.organization", "Organisation"),
      profile: getValue("tabs.profile", "Profil"),
      training: getValue("tabs.training", "Formation"),
      assessment: getValue("tabs.assessment", "Évaluation"),
    },
    persons: {
      name: getValue("persons.name", "Nom"),
      email: getValue("persons.email", "Email"),
      position: getValue("persons.position", "Poste"),
      department: getValue("persons.department", "Service"),
      level: getValue("persons.level", "Niv."),
      manager: getValue("persons.manager", "Responsable"),
      actions: getValue("persons.actions", "Actions"),
      addPerson: getValue("persons.addPerson", "Ajouter une personne"),
      noPerson: getValue("persons.noPerson", "Aucune personne dans ce site"),
      useAddButton: getValue("persons.useAddButton", "Utilisez le bouton \"Ajouter une personne\" ci-dessus"),
      fullName: getValue("persons.fullName", "Nom complet"),
      none: getValue("persons.none", "Aucun"),
      topLevel: getValue("persons.topLevel", "personne au sommet"),
      confirmDelete: getValue("persons.confirmDelete", "Supprimer cette personne ?"),
      confirmDeleteMessage: getValue("persons.confirmDeleteMessage", "Cette action est irréversible."),
      viewProfile: getValue("persons.viewProfile", "Voir le profil"),
      copyInviteLink: getValue("persons.copyInviteLink", "Copier le lien d'invitation"),
    },
    org: {
      title: getValue("org.title", "Organigramme"),
      noPersons: getValue("org.noPersons", "Aucune personne dans l'organigramme"),
      addPersonsFirst: getValue("org.addPersonsFirst", "Ajoutez des personnes dans l'onglet Équipe"),
    },
    profile: {
      selectPerson: getValue("profile.selectPerson", "Sélectionnez une personne"),
      noPersonSelected: getValue("profile.noPersonSelected", "Cliquez sur une personne dans la liste pour voir son profil"),
      edit: getValue("common.edit", "Modifier"),
      save: getValue("common.save", "Enregistrer"),
      aiLevel: getValue("profile.aiLevel", "Niveau IA"),
      progression: getValue("profile.progression", "Progression"),
      expandedView: getValue("profile.expandedView", "Vue élargie"),
      expandedViewDescription: getValue("profile.expandedViewDescription", "Donner une vue élargie sur tout l'organigramme"),
    },
    levels: {
      level: getValue("levels.level", "Niveau"),
    },
    common: {
      loading: getValue("common.loading", "Chargement..."),
      error: getValue("common.error", "Erreur"),
      success: getValue("common.success", "Succès"),
      save: getValue("common.save", "Enregistrer"),
      cancel: getValue("common.cancel", "Annuler"),
      delete: getValue("common.delete", "Supprimer"),
      edit: getValue("common.edit", "Modifier"),
      add: getValue("common.add", "Ajouter"),
      close: getValue("common.close", "Fermer"),
      confirm: getValue("common.confirm", "Confirmer"),
      yes: getValue("common.yes", "Oui"),
      no: getValue("common.no", "Non"),
      search: getValue("common.search", "Rechercher"),
      filter: getValue("common.filter", "Filtrer"),
      sort: getValue("common.sort", "Trier"),
      noData: getValue("common.noData", "Aucune donnée"),
      required: getValue("common.required", "Requis"),
      chooseLanguage: getValue("common.chooseLanguage", "Choisir la langue"),
      siteLanguage: getValue("common.siteLanguage", "Langue du contenu"),
      siteLanguageDescription: getValue("common.siteLanguageDescription", "Langue utilisée pour le contenu de ce site"),
    },
    dates: {
      today: getValue("dates.today", "Aujourd'hui"),
      yesterday: getValue("dates.yesterday", "Hier"),
      daysAgo: getValue("dates.daysAgo", "il y a {n} jours"),
      format: getValue("dates.format", "DD/MM/YYYY"),
    },
    placeholder: {
      enterName: getValue("placeholder.enterName", "Entrez le nom..."),
      enterEmail: getValue("placeholder.enterEmail", "Entrez l'email..."),
      enterPosition: getValue("placeholder.enterPosition", "Entrez le poste..."),
      enterDepartment: getValue("placeholder.enterDepartment", "Entrez le service..."),
      enterSiteName: getValue("placeholder.enterSiteName", "Entrez le nom du site..."),
      enterDescription: getValue("placeholder.enterDescription", "Entrez une description..."),
      selectManager: getValue("placeholder.selectManager", "Sélectionnez un responsable..."),
    },
    tooltip: {
      viewProfile: getValue("tooltip.viewProfile", "Voir le profil"),
      editPerson: getValue("tooltip.editPerson", "Modifier la personne"),
      deletePerson: getValue("tooltip.deletePerson", "Supprimer la personne"),
      editSite: getValue("tooltip.editSite", "Modifier le site"),
      deleteSite: getValue("tooltip.deleteSite", "Supprimer le site"),
      duplicateSite: getValue("tooltip.duplicateSite", "Dupliquer le site"),
      publishSite: getValue("tooltip.publishSite", "Publier le site"),
      unpublishSite: getValue("tooltip.unpublishSite", "Dépublier le site"),
      siteSettings: getValue("tooltip.siteSettings", "Paramètres du site"),
      changeLanguage: getValue("tooltip.changeLanguage", "Changer la langue"),
      userMenu: getValue("tooltip.userMenu", "Menu utilisateur"),
      sortAscending: getValue("tooltip.sortAscending", "Trier par ordre croissant"),
      sortDescending: getValue("tooltip.sortDescending", "Trier par ordre décroissant"),
      siteContentLanguage: getValue("tooltip.siteContentLanguage", "Langue du contenu du site"),
      viewSite: getValue("tooltip.viewSite", "Voir le site"),
    },
    settings: {
      siteSettings: getValue("settings.siteSettings", "Paramètres du site"),
      generalInfo: getValue("settings.generalInfo", "Informations générales"),
      personalization: getValue("settings.personalization", "Personnalisation"),
      primaryColor: getValue("settings.primaryColor", "Couleur principale"),
      secondaryColor: getValue("settings.secondaryColor", "Couleur secondaire"),
      publishedUrl: getValue("settings.publishedUrl", "URL du site publié"),
    },
  };
}

// Structure des traductions
export interface Translations {
  // Navigation
  nav: {
    studio: string;
    dashboard: string;
    settings: string;
    logout: string;
    actions: string;
    manageQuizzes: string;
  };
  // Header
  header: {
    mySites: string;
    mySitesDescription: string;
    addSite: string;
    addPerson: string;
  };
  // Utilisateur
  user: {
    accountSettings: string;
    becomeAdmin: string;
    becomeStandard: string;
    administrator: string;
    standardUser: string;
    adminCodeTitle: string;
    adminCodeDescription: string;
    adminCodePlaceholder: string;
    validate: string;
    cancel: string;
  };
  // Sites
  sites: {
    noSites: string;
    createFirst: string;
    createSite: string;
    siteName: string;
    siteDescription: string;
    edit: string;
    duplicate: string;
    delete: string;
    publish: string;
    unpublish: string;
    published: string;
    draft: string;
    confirmDelete: string;
    confirmDeleteMessage: string;
    persons: string;
    lastModified: string;
  };
  // Onglets
  tabs: {
    team: string;
    organization: string;
    profile: string;
    training: string;
    assessment: string;
  };
  // Personnes
  persons: {
    name: string;
    email: string;
    position: string;
    department: string;
    level: string;
    manager: string;
    actions: string;
    addPerson: string;
    noPerson: string;
    useAddButton: string;
    fullName: string;
    none: string;
    topLevel: string;
    confirmDelete: string;
    confirmDeleteMessage: string;
    viewProfile: string;
    copyInviteLink: string;
  };
  // Organigramme
  org: {
    title: string;
    noPersons: string;
    addPersonsFirst: string;
  };
  // Profil
  profile: {
    selectPerson: string;
    noPersonSelected: string;
    edit: string;
    save: string;
    aiLevel: string;
    progression: string;
    expandedView: string;
    expandedViewDescription: string;
  };
  // Niveaux
  levels: {
    level: string;
  };
  // Commun
  common: {
    loading: string;
    error: string;
    success: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    close: string;
    confirm: string;
    yes: string;
    no: string;
    search: string;
    filter: string;
    sort: string;
    noData: string;
    required: string;
    chooseLanguage: string;
    siteLanguage: string;
    siteLanguageDescription: string;
  };
  // Dates
  dates: {
    today: string;
    yesterday: string;
    daysAgo: string;
    format: string;
  };
  // Placeholders (textes indicatifs dans les champs)
  placeholder: {
    enterName: string;
    enterEmail: string;
    enterPosition: string;
    enterDepartment: string;
    enterSiteName: string;
    enterDescription: string;
    selectManager: string;
  };
  // Tooltips (informations au survol)
  tooltip: {
    viewProfile: string;
    editPerson: string;
    deletePerson: string;
    editSite: string;
    deleteSite: string;
    duplicateSite: string;
    publishSite: string;
    unpublishSite: string;
    siteSettings: string;
    changeLanguage: string;
    userMenu: string;
    sortAscending: string;
    sortDescending: string;
    siteContentLanguage: string;
    viewSite: string;
  };
  // Paramètres du site
  settings: {
    siteSettings: string;
    generalInfo: string;
    personalization: string;
    primaryColor: string;
    secondaryColor: string;
    publishedUrl: string;
  };
}

// Traductions françaises (par défaut)
export const FR: Translations = {
  nav: {
    studio: "Studio",
    dashboard: "Tableau de bord",
    settings: "Paramètres",
    logout: "Se déconnecter",
    actions: "Actions",
    manageQuizzes: "Gérer les Quizz",
  },
  header: {
    mySites: "Mes sites",
    mySitesDescription: "Gérez vos sites d'accompagnement IA",
    addSite: "Ajouter un site",
    addPerson: "Ajouter une personne",
  },
  user: {
    accountSettings: "Paramètres du compte",
    becomeAdmin: "Devenir administrateur",
    becomeStandard: "Redevenir standard",
    administrator: "Administrateur",
    standardUser: "Utilisateur standard",
    adminCodeTitle: "Devenir administrateur",
    adminCodeDescription: "Entrez le code administrateur pour accéder aux fonctionnalités avancées.",
    adminCodePlaceholder: "Code administrateur",
    validate: "Valider",
    cancel: "Annuler",
  },
  sites: {
    noSites: "Aucun site créé",
    createFirst: "Créez votre premier site d'accompagnement IA",
    createSite: "Créer un site",
    siteName: "Nom du site",
    siteDescription: "Description",
    edit: "Modifier",
    duplicate: "Dupliquer",
    delete: "Supprimer",
    publish: "Publier",
    unpublish: "Dépublier",
    published: "Publié",
    draft: "Brouillon",
    confirmDelete: "Supprimer ce site ?",
    confirmDeleteMessage: "Cette action est irréversible. Toutes les données du site seront perdues.",
    persons: "personnes",
    lastModified: "Modifié",
  },
  tabs: {
    team: "Équipe",
    organization: "Organisation",
    profile: "Profil",
    training: "Formation",
    assessment: "Évaluation",
  },
  persons: {
    name: "Nom",
    email: "Email",
    position: "Poste",
    department: "Service",
    level: "Niv.",
    manager: "Responsable",
    actions: "Actions",
    addPerson: "Ajouter une personne",
    noPerson: "Aucune personne dans ce site",
    useAddButton: "Utilisez le bouton \"Ajouter une personne\" ci-dessus",
    fullName: "Nom complet",
    none: "Aucun",
    topLevel: "personne au sommet",
    confirmDelete: "Supprimer cette personne ?",
    confirmDeleteMessage: "Cette action est irréversible. Toutes les données de cette personne seront perdues.",
    viewProfile: "Voir le profil",
    copyInviteLink: "Copier le lien d'invitation",
  },
  org: {
    title: "Organigramme",
    noPersons: "Aucune personne dans l'organigramme",
    addPersonsFirst: "Ajoutez des personnes dans l'onglet Équipe",
  },
  profile: {
    selectPerson: "Sélectionnez une personne",
    noPersonSelected: "Cliquez sur une personne dans la liste pour voir son profil",
    edit: "Modifier",
    save: "Enregistrer",
    aiLevel: "Niveau IA",
    progression: "Progression",
    expandedView: "Vue élargie",
    expandedViewDescription: "Donner une vue élargie sur tout l'organigramme",
  },
  levels: {
    level: "Niveau",
  },
  common: {
    loading: "Chargement...",
    error: "Erreur",
    success: "Succès",
    save: "Enregistrer",
    cancel: "Annuler",
    delete: "Supprimer",
    edit: "Modifier",
    add: "Ajouter",
    close: "Fermer",
    confirm: "Confirmer",
    yes: "Oui",
    no: "Non",
    search: "Rechercher",
    filter: "Filtrer",
    sort: "Trier",
    noData: "Aucune donnée",
    required: "Requis",
    chooseLanguage: "Choisir la langue",
    siteLanguage: "Langue du contenu",
    siteLanguageDescription: "Langue utilisée pour le contenu de ce site",
  },
  dates: {
    today: "Aujourd'hui",
    yesterday: "Hier",
    daysAgo: "il y a {n} jours",
    format: "DD/MM/YYYY",
  },
  placeholder: {
    enterName: "Entrez le nom...",
    enterEmail: "Entrez l'email...",
    enterPosition: "Entrez le poste...",
    enterDepartment: "Entrez le service...",
    enterSiteName: "Entrez le nom du site...",
    enterDescription: "Entrez une description...",
    selectManager: "Sélectionnez un responsable...",
  },
  tooltip: {
    viewProfile: "Voir le profil",
    editPerson: "Modifier la personne",
    deletePerson: "Supprimer la personne",
    editSite: "Modifier le site",
    deleteSite: "Supprimer le site",
    duplicateSite: "Dupliquer le site",
    publishSite: "Publier le site",
    unpublishSite: "Dépublier le site",
    siteSettings: "Paramètres du site",
    changeLanguage: "Changer la langue",
    userMenu: "Menu utilisateur",
    sortAscending: "Trier par ordre croissant",
    sortDescending: "Trier par ordre décroissant",
    siteContentLanguage: "Langue du contenu du site",
    viewSite: "Voir le site",
  },
  settings: {
    siteSettings: "Paramètres du site",
    generalInfo: "Informations générales",
    personalization: "Personnalisation",
    primaryColor: "Couleur principale",
    secondaryColor: "Couleur secondaire",
    publishedUrl: "URL du site publié",
  },
};

// Traductions anglaises
export const EN: Translations = {
  nav: {
    studio: "Studio",
    dashboard: "Dashboard",
    settings: "Settings",
    logout: "Log out",
    actions: "Actions",
    manageQuizzes: "Manage Quizzes",
  },
  header: {
    mySites: "My sites",
    mySitesDescription: "Manage your AI coaching sites",
    addSite: "Add a site",
    addPerson: "Add a person",
  },
  user: {
    accountSettings: "Account settings",
    becomeAdmin: "Become administrator",
    becomeStandard: "Become standard user",
    administrator: "Administrator",
    standardUser: "Standard user",
    adminCodeTitle: "Become administrator",
    adminCodeDescription: "Enter the administrator code to access advanced features.",
    adminCodePlaceholder: "Administrator code",
    validate: "Validate",
    cancel: "Cancel",
  },
  sites: {
    noSites: "No sites created",
    createFirst: "Create your first AI coaching site",
    createSite: "Create a site",
    siteName: "Site name",
    siteDescription: "Description",
    edit: "Edit",
    duplicate: "Duplicate",
    delete: "Delete",
    publish: "Publish",
    unpublish: "Unpublish",
    published: "Published",
    draft: "Draft",
    confirmDelete: "Delete this site?",
    confirmDeleteMessage: "This action is irreversible. All site data will be lost.",
    persons: "persons",
    lastModified: "Modified",
  },
  tabs: {
    team: "Team",
    organization: "Organization",
    profile: "Profile",
    training: "Training",
    assessment: "Assessment",
  },
  persons: {
    name: "Name",
    email: "Email",
    position: "Position",
    department: "Department",
    level: "Lvl.",
    manager: "Manager",
    actions: "Actions",
    addPerson: "Add a person",
    noPerson: "No person in this site",
    useAddButton: "Use the \"Add a person\" button above",
    fullName: "Full name",
    none: "None",
    topLevel: "top level person",
    confirmDelete: "Delete this person?",
    confirmDeleteMessage: "This action is irreversible. All person data will be lost.",
    viewProfile: "View profile",
    copyInviteLink: "Copy invite link",
  },
  org: {
    title: "Organization chart",
    noPersons: "No person in the organization chart",
    addPersonsFirst: "Add persons in the Team tab",
  },
  profile: {
    selectPerson: "Select a person",
    noPersonSelected: "Click on a person in the list to view their profile",
    edit: "Edit",
    save: "Save",
    aiLevel: "AI Level",
    progression: "Progression",
    expandedView: "Expanded view",
    expandedViewDescription: "Give expanded view on the entire organization chart",
  },
  levels: {
    level: "Level",
  },
  common: {
    loading: "Loading...",
    error: "Error",
    success: "Success",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    close: "Close",
    confirm: "Confirm",
    yes: "Yes",
    no: "No",
    search: "Search",
    filter: "Filter",
    sort: "Sort",
    noData: "No data",
    required: "Required",
    chooseLanguage: "Choose language",
    siteLanguage: "Content language",
    siteLanguageDescription: "Language used for this site's content",
  },
  dates: {
    today: "Today",
    yesterday: "Yesterday",
    daysAgo: "{n} days ago",
    format: "MM/DD/YYYY",
  },
  placeholder: {
    enterName: "Enter name...",
    enterEmail: "Enter email...",
    enterPosition: "Enter position...",
    enterDepartment: "Enter department...",
    enterSiteName: "Enter site name...",
    enterDescription: "Enter description...",
    selectManager: "Select a manager...",
  },
  tooltip: {
    viewProfile: "View profile",
    editPerson: "Edit person",
    deletePerson: "Delete person",
    editSite: "Edit site",
    deleteSite: "Delete site",
    duplicateSite: "Duplicate site",
    publishSite: "Publish site",
    unpublishSite: "Unpublish site",
    siteSettings: "Site settings",
    changeLanguage: "Change language",
    userMenu: "User menu",
    sortAscending: "Sort ascending",
    sortDescending: "Sort descending",
    siteContentLanguage: "Site content language",
    viewSite: "View site",
  },
  settings: {
    siteSettings: "Site settings",
    generalInfo: "General information",
    personalization: "Personalization",
    primaryColor: "Primary color",
    secondaryColor: "Secondary color",
    publishedUrl: "Published site URL",
  },
};

// Map de toutes les traductions
export const TRANSLATIONS: Record<SupportedLanguage, Translations> = {
  FR,
  EN,
  // Les autres langues seront générées dynamiquement via DeepL
  DE: EN, // Placeholder - sera traduit
  ES: EN,
  IT: EN,
  PT: EN,
  NL: EN,
  PL: EN,
  RU: EN,
  JA: EN,
  ZH: EN,
  KO: EN,
  AR: EN,
  TR: EN,
  SV: EN,
  DA: EN,
  FI: EN,
  NO: EN,
  CS: EN,
  EL: EN,
  HU: EN,
  RO: EN,
  SK: EN,
  BG: EN,
  UK: EN,
  ID: EN,
};

// Fonction pour obtenir les traductions
export function getTranslations(lang: SupportedLanguage): Translations {
  return TRANSLATIONS[lang] || FR;
}

// Fonction pour obtenir les infos d'une langue
export function getLanguageInfo(code: SupportedLanguage): LanguageInfo | undefined {
  return SUPPORTED_LANGUAGES.find(l => l.code === code);
}
