/**
 * Types globaux pour l'application iamove
 */

// =============================================================================
// TYPES API
// =============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata?: {
    timestamp: number;
    duration: number;
    requestId?: string;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  stack?: string;
}

// =============================================================================
// TYPES OPENAI
// =============================================================================

export interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OpenAICompletionRequest {
  model: string;
  messages: OpenAIMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  stream?: boolean;
}

export interface OpenAICompletionResponse {
  id: string;
  choices: {
    index: number;
    message: OpenAIMessage;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// =============================================================================
// TYPES DEEPL
// =============================================================================

export interface DeepLTranslationRequest {
  text: string[];
  target_lang: string;
  source_lang?: string;
  formality?: "default" | "more" | "less" | "prefer_more" | "prefer_less";
}

export interface DeepLTranslationResponse {
  translations: {
    detected_source_language: string;
    text: string;
  }[];
}

// =============================================================================
// TYPES UTILITAIRES
// =============================================================================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncResult<T> = Promise<ApiResponse<T>>;

/**
 * Type pour les fonctions avec retry
 */
export interface RetryOptions {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  shouldRetry?: (error: Error) => boolean;
}
