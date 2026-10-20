/**
 * Opções de paginação do gerador {@link paginate}.
 * Itera por páginas até encontrar a primeira página vazia ou o limite estabelecido.
 */
export interface PaginationOptions {
  /** Número da primeira página a carregar. Padrão: 1. */
  paginaInicial?: number;
  /** Limite máximo de páginas percorridas. Padrão: 100. */
  maxPaginas?: number;
  /** Sinal de cancelamento interrompe a iteração entre páginas. */
  signal?: AbortSignal;
}

/**
 * Percorre páginas consecutivas de um recurso paginado, de forma lazy.
 *
 * Para na primeira página vazia ou ao atingir `maxPaginas`, o que evita
 * consultas infinitas a endpoints sem limite natural de resultados.
 *
 * @param load Função que carrega uma página específica (1-based).
 * @param options Opções de paginação (`paginaInicial`, `maxPaginas`, `signal`).
 * @yields Cada página como array de itens.
 * @throws {Error} Se as opções de paginação forem inválidas, a resposta não for
 * array ou o `signal` for abortado.
 *
 * @example
 * ```ts
 * for await (const pagina of paginate((p) => api.servidores.listar({ pagina: p }))) {
 *   ...
 * }
 * ```
 */
export async function* paginate<T>(
  load: (pagina: number, signal?: AbortSignal) => Promise<T[]>,
  options: PaginationOptions = {},
): AsyncGenerator<T[], void, unknown> {
  const { paginaInicial = 1, maxPaginas = 100, signal } = options;
  if (
    !Number.isSafeInteger(paginaInicial) ||
    paginaInicial < 1 ||
    !Number.isSafeInteger(maxPaginas) ||
    maxPaginas < 1
  )
    throw new Error('Paginação inválida');
  for (let offset = 0; offset < maxPaginas; offset++) {
    if (signal?.aborted) throw signal.reason ?? new Error('Cancelado');
    const page = await load(paginaInicial + offset, signal);
    if (!Array.isArray(page)) throw new Error('Resposta não paginável: esperado array');
    if (page.length === 0) return;
    yield page;
  }
}
/**
 * Consolida um iterador de páginas em um único array, com teto de itens.
 *
 * Interrompe a leitura assim que `maxItems` forem acumulados, evitando
 * consumir páginas desnecessárias.
 *
 * @param iterator Iterador de páginas, normalmente o retorno de {@link paginate}.
 * @param maxItems Quantidade máxima de itens a acumular. Padrão: 10000.
 * @returns Array com os itens coletados, no máximo `maxItems`.
 * @throws {Error} Se `maxItems` não for inteiro positivo.
 */
export async function collectPages<T>(
  iterator: AsyncIterable<T[]>,
  maxItems = 10000,
): Promise<T[]> {
  if (!Number.isSafeInteger(maxItems) || maxItems < 1) throw new Error('maxItems inválido');
  const result: T[] = [];
  for await (const page of iterator) {
    result.push(...page.slice(0, maxItems - result.length));
    if (result.length >= maxItems) break;
  }
  return result;
}
