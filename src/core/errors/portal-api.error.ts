/**
 * Erro lançado quando a API do Portal da Transparência responde com falha
 * ou quando o SDK esgota as tentativas de consulta.
 *
 * Carrega três informações úteis ao chamador: `message` (mensagem legível),
 * `status` (código HTTP, quando houve resposta) e `details` (corpo bruto).
 *
 * @example
 * ```ts
 * try { await api.servidores.listar({ pagina: 1 }) } catch (e) {
 *   if (e instanceof PortalApiError) console.log(e.status, e.details);
 * }
 * ```
 */
export class PortalApiError extends Error {
  /**
   * @param message Mensagem legível descrevendo a falha.
   * @param status Código HTTP retornado pelo Portal, quando disponível.
   * @param details Corpo bruto da resposta ou causa adicional do erro.
   */
  constructor(
    message: string,
    /** Código HTTP retornado pelo Portal, quando disponível. */
    public readonly status?: number,
    /** Corpo bruto da resposta ou causa adicional do erro. */
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'PortalApiError';
  }
}
