import { RecursoService } from './recurso.service.js';

/**
 * Consulta de notas fiscais eletrônicas.
 *
 * Cobre a listagem de notas com filtros (`/notas-fiscais`) e a busca pela chave única da
 * nota (`/notas-fiscais-por-chave`). Não possui busca por identificador numérico.
 */
export class NotasFiscaisService extends RecursoService<'notasFiscais'> {
  /**
   * Consulta uma nota fiscal pela sua chave única de acesso.
   *
   * @param chaveUnicaNotaFiscal Chave de acesso da nota fiscal (44 dígitos).
   * @param signal AbortSignal opcional para cancelar a requisição.
   * @returns Promessa com a nota encontrada.
   * @throws Error de forma síncrona se a chave estiver vazia.
   * @example
   * const nota = await api.notasFiscais.porChave('35240112345678000199550010000001231000001234');
   */
  porChave(chaveUnicaNotaFiscal: string, signal?: AbortSignal) {
    return this.consultas.consultarUm('notasFiscaisPorChave', { chaveUnicaNotaFiscal }, signal);
  }
}
