/**
 * Cache em memória limitado por TTL (time-to-live), com política LRU aproximada.
 *
 * Nunca persiste dados em disco — ideal para respostas da API que podem
 * conter dados pessoais. As entradas expiram após `ttlMs` e o total é
 * limitado a `maxEntries`.
 *
 * @example
 * ```ts
 * const cache = new TtlCache(30000, 500);
 * cache.set('chave', dados);
 * const valor = cache.get<typeof dados>('chave');
 * ```
 */
export class TtlCache {
  private readonly values = new Map<string, { value: unknown; expires: number }>();
  constructor(
    private readonly ttlMs = 30000,
    private readonly maxEntries = 500,
  ) {
    if (
      !Number.isSafeInteger(ttlMs) ||
      ttlMs < 1 ||
      !Number.isSafeInteger(maxEntries) ||
      maxEntries < 1
    )
      throw new Error('Cache inválido');
  }
  /**
   * Recupera uma entrada não expirada e a refresca na ordem de acesso.
   *
   * @param key Chave da entrada.
   * @returns O valor armazenado ou `undefined` se ausente/expirada.
   */
  get<T>(key: string): T | undefined {
    const entry = this.values.get(key);
    if (!entry) return undefined;
    if (entry.expires <= Date.now()) {
      this.values.delete(key);
      return undefined;
    }
    this.values.delete(key);
    this.values.set(key, entry);
    return entry.value as T;
  }
  /**
   * Armazena uma entrada com novo prazo de expiração, descartando as mais antigas
   * caso o limite de `maxEntries` seja excedido.
   *
   * @param key Chave da entrada.
   * @param value Valor a armazenar.
   */
  set(key: string, value: unknown): void {
    this.values.delete(key);
    this.values.set(key, { value, expires: Date.now() + this.ttlMs });
    while (this.values.size > this.maxEntries) this.values.delete(this.values.keys().next().value!);
  }
  /** Remove todas as entradas do cache. */
  clear(): void {
    this.values.clear();
  }
}
