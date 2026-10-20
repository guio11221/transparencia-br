import { RecursoComIdService } from './recurso.service.js';

/**
 * Consulta de contratos federais.
 *
 * Cobre os endpoints oficiais de busca por CPF/CNPJ, processo, número, itens contratados,
 * termo aditivo, documentos relacionados e apostilamento. A listagem geral e a busca por
 * id (`GET /contratos/id?id=N`) são herdadas de {@link RecursoComIdService}; `listar`
 * exige `codigoOrgao`, validado de forma síncrona antes da requisição.
 */
export class ContratosService extends RecursoComIdService<'contratos'> {
  /**
   * Consulta contratos vinculados a um CPF ou CNPJ.
   *
   * @param cpfCnpj CPF ou CNPJ do contratado (somente dígitos).
   * @param pagina Número da página (padrão `1`).
   * @param signal AbortSignal opcional para cancelar a requisição.
   * @returns Promessa com os contratos da página atual.
   * @throws Error de forma síncrona se `cpfCnpj` estiver vazio.
   * @example
   * const contratos = await api.contratos.porCpfCnpj('11222333000181');
   */
  porCpfCnpj(cpfCnpj: string, pagina = 1, signal?: AbortSignal) {
    return this.consultas.consultar('contratosPorCpfCnpj', { cpfCnpj, pagina }, signal);
  }
  /**
   * Consulta contratos de um processo administrativo.
   *
   * @param processo Número do processo administrativo.
   * @param pagina Número da página (padrão `1`).
   * @param signal AbortSignal opcional para cancelar a requisição.
   * @returns Promessa com os contratos da página atual.
   * @throws Error de forma síncrona se `processo` estiver vazio.
   * @example
   * const contratos = await api.contratos.porProcesso('19400.012345/2024-10', 2);
   */
  porProcesso(processo: string, pagina = 1, signal?: AbortSignal) {
    return this.consultas.consultar('contratosPorProcesso', { processo, pagina }, signal);
  }
  /**
   * Consulta contratos pelo número do contrato.
   *
   * @param numero Número do contrato.
   * @param pagina Número da página (padrão `1`).
   * @param signal AbortSignal opcional para cancelar a requisição.
   * @returns Promessa com os contratos da página atual.
   * @throws Error de forma síncrona se `numero` estiver vazio.
   * @example
   * const contratos = await api.contratos.porNumero('123/2024');
   */
  porNumero(numero: string, pagina = 1, signal?: AbortSignal) {
    return this.consultas.consultar('contratosPorNumero', { numero, pagina }, signal);
  }
  /**
   * Lista os itens contratados de um contrato.
   *
   * @param id Identificador do contrato.
   * @param pagina Número da página (padrão `1`).
   * @param signal AbortSignal opcional para cancelar a requisição.
   * @returns Promessa com os itens da página atual.
   * @throws Error de forma síncrona se `id` não for um inteiro válido.
   * @example
   * const itens = await api.contratos.itensContratados(7);
   */
  itensContratados(id: number | string, pagina = 1, signal?: AbortSignal) {
    return this.consultas.consultar('contratosItensContratados', { id, pagina }, signal);
  }
  /**
   * Consulta o termo aditivo de um contrato.
   *
   * @param id Identificador do contrato.
   * @param signal AbortSignal opcional para cancelar a requisição.
   * @returns Promessa com o termo aditivo.
   * @throws Error de forma síncrona se `id` não for um inteiro válido.
   * @example
   * const aditivo = await api.contratos.termoAditivo(9);
   */
  termoAditivo(id: number | string, signal?: AbortSignal) {
    return this.consultas.consultarUm('contratosTermoAditivo', { id }, signal);
  }
  /**
   * Consulta os documentos relacionados a um contrato.
   *
   * @param id Identificador do contrato.
   * @param signal AbortSignal opcional para cancelar a requisição.
   * @returns Promessa com os documentos relacionados.
   * @throws Error de forma síncrona se `id` não for um inteiro válido.
   * @example
   * const documentos = await api.contratos.documentosRelacionados(9);
   */
  documentosRelacionados(id: number | string, signal?: AbortSignal) {
    return this.consultas.consultarUm('contratosDocumentosRelacionados', { id }, signal);
  }
  /**
   * Consulta o apostilamento de um contrato.
   *
   * @param id Identificador do contrato.
   * @param signal AbortSignal opcional para cancelar a requisição.
   * @returns Promessa com o apostilamento.
   * @throws Error de forma síncrona se `id` não for um inteiro válido.
   * @example
   * const apostilamento = await api.contratos.apostilamento(9);
   */
  apostilamento(id: number | string, signal?: AbortSignal) {
    return this.consultas.consultarUm('contratosApostilamento', { id }, signal);
  }
}
