import { RecursoComIdService } from './recurso.service.js';

/**
 * Consulta de convênios e instrumentos congêneres.
 *
 * Cobre os endpoints oficiais de tipo de instrumento, busca por número, número de
 * processo e número original. A listagem geral com filtros e a busca por id
 * (`GET /convenios/id?id=N`) são herdadas de {@link RecursoComIdService}.
 */
export class ConveniosService extends RecursoComIdService<'convenios'> {
  /**
   * Lista os tipos de instrumento disponíveis.
   *
   * @param signal AbortSignal opcional para cancelar a requisição.
   * @returns Promessa com os tipos de instrumento.
   * @example
   * const tipos = await api.convenios.tipoInstrumento();
   */
  tipoInstrumento(signal?: AbortSignal) {
    return this.consultas.consultar('conveniosTipoInstrumento', {}, signal);
  }
  /**
   * Consulta convênios pelo número do instrumento.
   *
   * @param numero Número do convênio.
   * @param pagina Número da página (padrão `1`).
   * @param signal AbortSignal opcional para cancelar a requisição.
   * @returns Promessa com os convênios da página atual.
   * @throws Error de forma síncrona se `numero` estiver vazio.
   * @example
   * const convenios = await api.convenios.porNumero('123/2024');
   */
  porNumero(numero: string, pagina = 1, signal?: AbortSignal) {
    return this.consultas.consultar('conveniosPorNumero', { numero, pagina }, signal);
  }
  /**
   * Consulta convênios pelo número do processo.
   *
   * @param numeroProcesso Número do processo administrativo.
   * @param pagina Número da página (padrão `1`).
   * @param signal AbortSignal opcional para cancelar a requisição.
   * @returns Promessa com os convênios da página atual.
   * @throws Error de forma síncrona se `numeroProcesso` estiver vazio.
   * @example
   * const convenios = await api.convenios.porNumeroProcesso('19400.012345/2024-10');
   */
  porNumeroProcesso(numeroProcesso: string, pagina = 1, signal?: AbortSignal) {
    return this.consultas.consultar(
      'conveniosPorNumeroProcesso',
      { numeroProcesso, pagina },
      signal,
    );
  }
  /**
   * Consulta convênios pelo número original do instrumento.
   *
   * @param numeroOriginal Número original do convênio.
   * @param pagina Número da página (padrão `1`).
   * @param signal AbortSignal opcional para cancelar a requisição.
   * @returns Promessa com os convênios da página atual.
   * @throws Error de forma síncrona se `numeroOriginal` estiver vazio.
   * @example
   * const convenios = await api.convenios.porNumeroOriginal('001/2024');
   */
  porNumeroOriginal(numeroOriginal: string, pagina = 1, signal?: AbortSignal) {
    return this.consultas.consultar(
      'conveniosPorNumeroOriginal',
      { numeroOriginal, pagina },
      signal,
    );
  }
}
