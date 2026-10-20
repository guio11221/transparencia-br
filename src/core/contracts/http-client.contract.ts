/** Query string de uma consulta, com valores serializáveis e opcionais. */
export type Query = Record<string, string | number | boolean | undefined | null>;

/**
 * Contrato mínimo de transporte HTTP usado por todos os serviços do SDK.
 * Permite injetar um cliente alternativo (ex.: mock em testes) sem alterar a lógica.
 */
export interface HttpClientContract {
  /**
   * Executa uma requisição GET e retorna o corpo já tipado.
   *
   * @param path Caminho do recurso (deve iniciar com `/api-de-dados/`).
   * @param query Parâmetros de query string opcionais.
   * @param signal Sinal de cancelamento opcional.
   * @returns O corpo da resposta convertido para `T`.
   */
  get<T>(path: string, query?: Query, signal?: AbortSignal): Promise<T>;
}
