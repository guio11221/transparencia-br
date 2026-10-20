import type { HttpClientContract, Query } from '../contracts/http-client.contract.js';
import type { SdkOptions } from '../types/sdk-options.type.js';
import { PortalApiError } from '../errors/portal-api.error.js';
import { RequestScheduler } from './request-scheduler.js';
import { TtlCache } from './ttl-cache.js';

/** Aguarda `ms` milissegundos; rejeita imediatamente se o `signal` for abortado. */
const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', abort);
      resolve();
    }, ms);
    const abort = () => {
      clearTimeout(timer);
      reject(signal?.reason ?? new Error('Cancelado'));
    };
    signal?.addEventListener('abort', abort, { once: true });
  });

/**
 * Transporte HTTP padrão do SDK, baseado no `fetch` nativo.
 *
 * Aplica autenticação por `chave-api-dados`, rate limit, cache opcional,
 * deduplicação de requisições em voo, timeout e retries com backoff.
 * Um cliente alternativo pode ser injetado via `options.httpClient`
 * (útil em testes), substituindo esta implementação por completo.
 */
export class FetchHttpClient implements HttpClientContract {
  private readonly fetcher: typeof fetch;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly retries: number;
  private readonly scheduler: RequestScheduler;
  private readonly cache?: TtlCache;
  private readonly pending = new Map<string, Promise<unknown>>();
  constructor(private readonly options: SdkOptions) {
    if (!options.apiKey?.trim()) throw new Error('apiKey é obrigatória');
    this.fetcher = options.fetchImpl ?? fetch;
    this.baseUrl = (options.baseUrl ?? 'https://api.portaldatransparencia.gov.br').replace(
      /\/$/,
      '',
    );
    this.timeoutMs = options.timeoutMs ?? 15000;
    this.retries = options.retries ?? 2;
    if (
      !Number.isSafeInteger(this.timeoutMs) ||
      this.timeoutMs < 1 ||
      !Number.isSafeInteger(this.retries) ||
      this.retries < 0 ||
      this.retries > 10
    )
      throw new Error('Timeout ou retries inválidos');
    this.scheduler = new RequestScheduler(options.rateLimit);
    if (options.cache?.enabled)
      this.cache = new TtlCache(options.cache.ttlMs, options.cache.maxEntries);
  }
  /** Limpa todas as entradas do cache em memória, se estiver habilitado. */
  clearCache(): void {
    this.cache?.clear();
  }
  /**
   * Executa uma requisição GET com cache, deduplicação e retries.
   *
   * @param path Caminho iniciando com `/api-de-dados/`.
   * @param query Parâmetros de query string (entradas nulas/`undefined` são ignoradas).
   * @param signal Sinal de cancelamento; quando presente, ignora cache e deduplicação.
   * @returns O corpo JSON da resposta convertido para `T`.
   * @throws {PortalApiError} Em respostas não bem-sucedidas ou após esgotar as tentativas.
   * @throws {Error} Se o caminho não for permitido ou as opções forem inválidas.
   */
  async get<T>(path: string, query: Query = {}, signal?: AbortSignal): Promise<T> {
    if (!path.startsWith('/api-de-dados/')) throw new Error('Caminho não permitido');
    const url = new URL(path, `${this.baseUrl}/`);
    for (const [key, value] of Object.entries(query).sort(([a], [b]) => a.localeCompare(b))) {
      if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
    }
    const cacheKey = url.toString();
    // A cache de dados pessoais é opt-in. AbortSignal bypasses deduplication for independent cancellations.
    if (this.cache && !signal) {
      const cached = this.cache.get<T>(cacheKey);
      if (cached !== undefined) return cached;
      const existing = this.pending.get(cacheKey);
      if (existing) return existing as Promise<T>;
    }
    const job = this.fetchWithRetry<T>(url, signal);
    if (this.cache && !signal) this.pending.set(cacheKey, job);
    try {
      const data = await job;
      if (this.cache && !signal && data !== undefined) this.cache.set(cacheKey, data);
      return data;
    } finally {
      if (this.pending.get(cacheKey) === job) this.pending.delete(cacheKey);
    }
  }
  /** Tenta a requisição com backoff exponencial, respeitando `retry-after` em 429/5xx. */
  private async fetchWithRetry<T>(url: URL, signal?: AbortSignal): Promise<T> {
    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        const response = await this.scheduler.run(
          () =>
            this.fetcher(url, {
              method: 'GET',
              headers: { 'chave-api-dados': this.options.apiKey, accept: 'application/json' },
              signal: AbortSignal.any([
                AbortSignal.timeout(this.timeoutMs),
                ...(signal ? [signal] : []),
              ]),
            }),
          signal,
        );
        if (!response.ok) {
          const body = await response.text();
          if ((response.status === 429 || response.status >= 500) && attempt < this.retries) {
            const retryAfter = response.headers.get('retry-after');
            const seconds = retryAfter && /^\d+$/.test(retryAfter) ? Number(retryAfter) : undefined;
            await sleep(
              seconds !== undefined
                ? Math.min(seconds * 1000, 30000)
                : Math.min(500 * 2 ** attempt, 5000),
              signal,
            );
            continue;
          }
          throw new PortalApiError(
            `Portal retornou HTTP ${response.status}`,
            response.status,
            body,
          );
        }
        if (response.status === 204) return undefined as T;
        return (await response.json()) as T;
      } catch (error) {
        if (error instanceof PortalApiError || signal?.aborted || attempt === this.retries)
          throw error;
        await sleep(Math.min(500 * 2 ** attempt, 5000), signal);
      }
    }
    throw new PortalApiError('Falha após tentativas de consulta');
  }
}
