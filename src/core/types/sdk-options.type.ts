import type { HttpClientContract } from '../contracts/http-client.contract.js';

/**
 * Opções de cache em memória do SDK.
 *
 * O cache é opt-in: só é ativado quando `enabled` é `true`.
 */
export interface CacheOptions {
  /** Ativa o cache de respostas. Padrão: desabilitado. */
  enabled?: boolean;
  /** Tempo de vida de cada entrada em milissegundos. Padrão: 30000. */
  ttlMs?: number;
  /** Número máximo de entradas mantidas em memória. Padrão: 500. */
  maxEntries?: number;
}

/**
 * Opções de limite de requisições (rate limit) ao Portal.
 */
export interface RateLimitOptions {
  /** Requisições máximas por janela deslizante. Padrão: 150. */
  maxRequests?: number;
  /** Duração da janela deslizante em milissegundos. Padrão: 60000. */
  windowMs?: number;
  /** Requisições simultâneas máximas. Padrão: 4. */
  maxConcurrent?: number;
}

/**
 * Opções globais do cliente SDK.
 */
export interface SdkOptions {
  /** Chave oficial da API do Portal da Transparência (`chave-api-dados`). */
  apiKey: string;
  /** Base URL da API. Padrão: `https://api.portaldatransparencia.gov.br`. */
  baseUrl?: string;
  /** Timeout por requisição em milissegundos. Padrão: 15000. */
  timeoutMs?: number;
  /** Tentativas extras após falha transitória (429/5xx). Padrão: 2, máximo: 10. */
  retries?: number;
  /** Implementação de `fetch` alternativa (ex.: polyfill ou stub em testes). */
  fetchImpl?: typeof fetch;
  /** Cliente HTTP personalizado injetável; substitui o `FetchHttpClient` padrão. */
  httpClient?: HttpClientContract;
  /** Configuração do cache de respostas em memória. */
  cache?: CacheOptions;
  /** Configuração do limite de requisições por janela. */
  rateLimit?: RateLimitOptions;
}
