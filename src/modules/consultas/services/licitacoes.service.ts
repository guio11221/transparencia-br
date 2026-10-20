import { RecursoComIdService } from './recurso.service.js';

/**
 * Consulta de licitações e processos licitatórios.
 *
 * Cobre os endpoints oficiais de unidades gestoras, modalidades, busca por processo,
 * identificação por UG/modalidade/número, participantes, itens licitados, empenhos e
 * contratos relacionados. A listagem geral e a busca por id são herdadas de
 * {@link RecursoComIdService}; `listar` exige `codigoOrgao`, validado de forma síncrona
 * antes da requisição.
 */
export class LicitacoesService extends RecursoComIdService<'licitacoes'> {
  /**
   * Lista as unidades gestoras (UG) disponíveis para consulta.
   *
   * @param pagina Número da página (padrão `1`).
   * @param signal AbortSignal opcional para cancelar a requisição.
   * @returns Promessa com as unidades gestoras da página atual.
   * @example
   * const ugs = await api.licitacoes.ugs();
   */
  ugs(pagina = 1, signal?: AbortSignal) {
    return this.consultas.consultar('licitacoesUgs', { pagina }, signal);
  }
  /**
   * Lista as modalidades de licitação cadastradas.
   *
   * @param signal AbortSignal opcional para cancelar a requisição.
   * @returns Promessa com as modalidades disponíveis.
   * @example
   * const modalidades = await api.licitacoes.modalidades();
   */
  modalidades(signal?: AbortSignal) {
    return this.consultas.consultar('licitacoesModalidades', {}, signal);
  }
  /**
   * Consulta a licitação de um processo administrativo.
   *
   * @param processo Número do processo licitatório.
   * @param signal AbortSignal opcional para cancelar a requisição.
   * @returns Promessa com a licitação encontrada.
   * @throws Error de forma síncrona se `processo` estiver vazio.
   * @example
   * const licitacao = await api.licitacoes.porProcesso('19400.012345/2024-10');
   */
  porProcesso(processo: string, signal?: AbortSignal) {
    return this.consultas.consultarUm('licitacoesPorProcesso', { processo }, signal);
  }
  /**
   * Consulta uma licitação pela tripla UG, número e modalidade.
   *
   * @param identificacao `codigoUG`, `numero` e `codigoModalidade` da licitação.
   * @param signal AbortSignal opcional para cancelar a requisição.
   * @returns Promessa com a licitação encontrada.
   * @throws Error de forma síncrona se algum identificador estiver vazio.
   * @example
   * const identificacao = { codigoUG: '26000', numero: '123/2024', codigoModalidade: '6' };
   * const licitacao = await api.licitacoes.porUgModalidadeNumero(identificacao);
   */
  porUgModalidadeNumero(
    identificacao: { codigoUG: string; numero: string; codigoModalidade: string },
    signal?: AbortSignal,
  ) {
    return this.consultas.consultarUm('licitacoesPorUgModalidadeNumero', identificacao, signal);
  }
  /**
   * Lista os participantes de uma licitação.
   *
   * @param identificacao `codigoUG`, `numero` e `codigoModalidade` da licitação.
   * @param pagina Número da página (padrão `1`).
   * @param signal AbortSignal opcional para cancelar a requisição.
   * @returns Promessa com os participantes da página atual.
   * @throws Error de forma síncrona se algum identificador estiver vazio.
   * @example
   * const participantes = await api.licitacoes.participantes(
   *   { codigoUG: '26000', numero: '123/2024', codigoModalidade: '6' }, 3,
   * );
   */
  participantes(
    identificacao: { codigoUG: string; numero: string; codigoModalidade: string },
    pagina = 1,
    signal?: AbortSignal,
  ) {
    return this.consultas.consultar(
      'licitacoesParticipantes',
      { ...identificacao, pagina },
      signal,
    );
  }
  /**
   * Lista os itens licitados de uma licitação.
   *
   * @param id Identificador da licitação.
   * @param pagina Número da página (padrão `1`).
   * @param signal AbortSignal opcional para cancelar a requisição.
   * @returns Promessa com os itens da página atual.
   * @throws Error de forma síncrona se `id` não for um inteiro válido.
   * @example
   * const itens = await api.licitacoes.itens(42, 2);
   */
  itens(id: number | string, pagina = 1, signal?: AbortSignal) {
    return this.consultas.consultar('licitacoesItens', { id, pagina }, signal);
  }
  /**
   * Lista os empenhos vinculados a uma licitação.
   *
   * @param identificacao `codigoUG`, `numero` e `codigoModalidade` da licitação.
   * @param pagina Número da página (padrão `1`).
   * @param signal AbortSignal opcional para cancelar a requisição.
   * @returns Promessa com os empenhos da página atual.
   * @throws Error de forma síncrona se algum identificador estiver vazio.
   * @example
   * const empenhos = await api.licitacoes.empenhos(
   *   { codigoUG: '26000', numero: '123/2024', codigoModalidade: '6' },
   * );
   */
  empenhos(
    identificacao: { codigoUG: string; numero: string; codigoModalidade: string },
    pagina = 1,
    signal?: AbortSignal,
  ) {
    return this.consultas.consultar('licitacoesEmpenhos', { ...identificacao, pagina }, signal);
  }
  /**
   * Lista os contratos relacionados a uma licitação.
   *
   * @param identificacao `codigoUG`, `numero` e `codigoModalidade` da licitação.
   * @param signal AbortSignal opcional para cancelar a requisição.
   * @returns Promessa com os contratos vinculados.
   * @throws Error de forma síncrona se algum identificador estiver vazio.
   * @example
   * const contratos = await api.licitacoes.contratosRelacionados(
   *   { codigoUG: '26000', numero: '123/2024', codigoModalidade: '6' },
   * );
   */
  contratosRelacionados(
    identificacao: { codigoUG: string; numero: string; codigoModalidade: string },
    signal?: AbortSignal,
  ) {
    return this.consultas.consultarUm('licitacoesContratosRelacionados', identificacao, signal);
  }
}
