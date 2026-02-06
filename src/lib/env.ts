/**
 * Validation et typage des variables d'environnement
 * Ce fichier garantit que toutes les variables requises sont présentes
 */

// =============================================================================
// TYPES
// =============================================================================

interface EnvConfig {
  // API Keys
  OPENAI_API_KEY: string;
  DEEPL_API_KEY: string;

  // Base de données
  DATABASE_URL: string;
  POSTGRES_URL: string;
  POSTGRES_PRISMA_URL?: string;
  POSTGRES_URL_NON_POOLING?: string;

  // Métadonnées base de données
  PGHOST: string;
  PGDATABASE: string;
  PGUSER: string;
  PGPASSWORD: string;

  // Environnement
  NODE_ENV: "development" | "production" | "test";
  VERCEL_ENV?: "development" | "preview" | "production";
}

// =============================================================================
// VALIDATION
// =============================================================================

function getEnvVar(key: string, required: boolean = true): string {
  const value = process.env[key];

  if (required && !value) {
    throw new Error(
      `Variable d'environnement manquante: ${key}. ` +
      `Vérifiez votre fichier .env ou les variables Vercel.`
    );
  }

  return value || "";
}

// =============================================================================
// EXPORT DE LA CONFIGURATION
// =============================================================================

/**
 * Configuration des variables d'environnement validées
 * Utiliser cette fonction pour accéder aux variables de manière sécurisée
 */
export function getEnv(): EnvConfig {
  return {
    // API Keys
    OPENAI_API_KEY: getEnvVar("OPENAI_API_KEY"),
    DEEPL_API_KEY: getEnvVar("DEEPL_API_KEY"),

    // Base de données
    DATABASE_URL: getEnvVar("DATABASE_URL"),
    POSTGRES_URL: getEnvVar("POSTGRES_URL"),
    POSTGRES_PRISMA_URL: getEnvVar("POSTGRES_PRISMA_URL", false),
    POSTGRES_URL_NON_POOLING: getEnvVar("POSTGRES_URL_NON_POOLING", false),

    // Métadonnées
    PGHOST: getEnvVar("PGHOST"),
    PGDATABASE: getEnvVar("PGDATABASE"),
    PGUSER: getEnvVar("PGUSER"),
    PGPASSWORD: getEnvVar("PGPASSWORD"),

    // Environnement
    NODE_ENV: (process.env.NODE_ENV as EnvConfig["NODE_ENV"]) || "development",
    VERCEL_ENV: process.env.VERCEL_ENV as EnvConfig["VERCEL_ENV"],
  };
}

/**
 * Vérifie si on est en mode développement
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

/**
 * Vérifie si on est en mode production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Vérifie si on est sur Vercel
 */
export function isVercel(): boolean {
  return !!process.env.VERCEL;
}
