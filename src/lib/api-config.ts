/**
 * Configuration des API externes avec limites maximisées
 * Ce fichier centralise tous les paramètres de timeout, retry et limites
 */

// =============================================================================
// CONFIGURATION OPENAI
// =============================================================================
export const OPENAI_CONFIG = {
  // Timeout maximum pour les requêtes (en ms)
  timeout: 120000, // 2 minutes

  // Nombre maximum de tentatives en cas d'échec
  maxRetries: 5,

  // Délai entre les tentatives (en ms) - croissance exponentielle
  retryDelay: 1000,
  retryMaxDelay: 30000,

  // Limites de tokens par requête
  maxTokens: {
    gpt4: 128000, // GPT-4 Turbo context window
    gpt35: 16385, // GPT-3.5 Turbo context window
    default: 4096, // Réponse par défaut
  },

  // Rate limiting côté client (requêtes par minute)
  rateLimit: {
    requestsPerMinute: 500,
    tokensPerMinute: 150000,
  },
};

// =============================================================================
// CONFIGURATION DEEPL
// =============================================================================
export const DEEPL_CONFIG = {
  // Timeout maximum pour les requêtes (en ms)
  timeout: 60000, // 1 minute

  // Nombre maximum de tentatives
  maxRetries: 3,

  // Délai entre les tentatives
  retryDelay: 500,

  // Limite de caractères par requête
  maxCharactersPerRequest: 131072, // 128 KB

  // Langues supportées (pour validation)
  supportedLanguages: [
    "BG", "CS", "DA", "DE", "EL", "EN", "ES", "ET", "FI", "FR",
    "HU", "ID", "IT", "JA", "KO", "LT", "LV", "NB", "NL", "PL",
    "PT", "RO", "RU", "SK", "SL", "SV", "TR", "UK", "ZH",
  ],
};

// =============================================================================
// CONFIGURATION BASE DE DONNÉES (Neon PostgreSQL)
// =============================================================================
export const DATABASE_CONFIG = {
  // Pool de connexions
  pool: {
    min: 2,
    max: 20, // Maximum de connexions simultanées
    idleTimeoutMs: 30000, // 30 secondes
    connectionTimeoutMs: 10000, // 10 secondes
  },

  // Timeout des requêtes (en ms)
  queryTimeout: 30000, // 30 secondes

  // Limite de taille des résultats
  maxResultRows: 10000,

  // Configuration SSL
  ssl: {
    rejectUnauthorized: true,
  },
};

// =============================================================================
// CONFIGURATION FETCH GÉNÉRIQUE
// =============================================================================
export const FETCH_CONFIG = {
  // Timeout par défaut pour toutes les requêtes fetch
  defaultTimeout: 30000,

  // Headers par défaut
  defaultHeaders: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },

  // Taille maximale du body (en bytes)
  maxBodySize: 10 * 1024 * 1024, // 10 MB
};

// =============================================================================
// UTILITAIRES
// =============================================================================

/**
 * Fonction de retry avec backoff exponentiel
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    onRetry?: (error: Error, attempt: number) => void;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    onRetry,
  } = options;

  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }

      const delay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay);
      
      if (onRetry) {
        onRetry(lastError, attempt + 1);
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Fetch avec timeout
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeout?: number } = {}
): Promise<Response> {
  const { timeout = FETCH_CONFIG.defaultTimeout, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Fetch avec retry et timeout combinés
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit & {
    timeout?: number;
    maxRetries?: number;
    retryDelay?: number;
  } = {}
): Promise<Response> {
  const { maxRetries = 3, retryDelay = 1000, ...fetchOptions } = options;

  return withRetry(
    () => fetchWithTimeout(url, fetchOptions),
    {
      maxRetries,
      initialDelay: retryDelay,
      onRetry: (error, attempt) => {
        console.warn(`Fetch retry ${attempt}/${maxRetries}: ${error.message}`);
      },
    }
  );
}
