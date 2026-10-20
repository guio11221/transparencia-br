import { RecursoService } from './recurso.service.js';
import type { FiltrosConsultaDto } from '../dtos/consulta.dto.js';

/**
 * Tipos de cartão governamental aceitos pelo endpoint de cartões:
 * `1` CPGF, `2` CPCC e `3` CPDC.
 */
export const TIPOS_CARTAO = {
  cpgf: 1,
  cpcc: 2,
  cpdc: 3,
} as const;

/** Valor numérico de um dos tipos de {@link TIPOS_CARTAO}. */
export type TipoCartao = (typeof TIPOS_CARTAO)[keyof typeof TIPOS_CARTAO];

/** Rótulo descritivo de cada {@link TipoCartao}, para exibição ao usuário. */
export const ROTULOS_TIPOS_CARTAO: Record<TipoCartao, string> = {
  [TIPOS_CARTAO.cpgf]: 'CPGF — Cartão de Pagamentos do Governo Federal',
  [TIPOS_CARTAO.cpcc]: 'CPCC — Cartão de Pagamentos de Crédito',
  [TIPOS_CARTAO.cpdc]: 'CPDC — Cartão de Pagamentos de Diárias e Créditos',
};

/**
 * Confere se o valor está em {@link TIPOS_CARTAO} antes da requisição.
 *
 * @throws Error síncrono informando o valor recebido e as opções aceitas.
 */
function validarTipoCartao(tipoCartao: number): TipoCartao {
  if (!Object.values(TIPOS_CARTAO).includes(tipoCartao as TipoCartao)) {
    throw new Error(`tipoCartao inválido: ${tipoCartao} — use 1 (CPGF), 2 (CPCC) ou 3 (CPDC)`);
  }
  return tipoCartao as TipoCartao;
}

/**
 * Consulta de transações de cartões governamentais (CPGF, CPCC e CPDC).
 *
 * Cobre o endpoint oficial `/api-de-dados/cartoes` com helpers tipados por portador,
 * favorecido, órgão, tipo e períodos; todos herdam a paginação de {@link RecursoService}
 * e `porTipo` valida o valor contra {@link TIPOS_CARTAO} antes da chamada.
 */
export class CartoesService extends RecursoService<'cartoes'> {
  /**
   * Consulta transações realizadas por um portador de cartão.
   *
   * @param cpfPortador CPF do portador (somente dígitos).
   * @param filtros Filtros complementares (período, órgão, página...).
   * @param signal AbortSignal opcional para cancelar a requisição.
   * @returns Promessa com as transações da página atual.
   * @example
   * const transacoes = await api.cartoes.porPortador('12345678901');
   */
  porPortador(cpfPortador: string, filtros: FiltrosConsultaDto = {}, signal?: AbortSignal) {
    return this.listar({ ...filtros, cpfPortador }, signal);
  }
  /**
   * Consulta transações pagas a um favorecido.
   *
   * @param cpfCnpjFavorecido CPF ou CNPJ do favorecido (somente dígitos).
   * @param filtros Filtros complementares (período, órgão, página...).
   * @param signal AbortSignal opcional para cancelar a requisição.
   * @returns Promessa com as transações da página atual.
   * @example
   * const transacoes = await api.cartoes.porFavorecido('11222333000181', { pagina: 2 });
   */
  porFavorecido(cpfCnpjFavorecido: string, filtros: FiltrosConsultaDto = {}, signal?: AbortSignal) {
    return this.listar({ ...filtros, cpfCnpjFavorecido }, signal);
  }
  /**
   * Consulta transações de um órgão.
   *
   * @param codigoOrgao Código SIAFI do órgão.
   * @param filtros Filtros complementares (período, tipo, página...).
   * @param signal AbortSignal opcional para cancelar a requisição.
   * @returns Promessa com as transações da página atual.
   * @example
   * const transacoes = await api.cartoes.porOrgao('21000');
   */
  porOrgao(codigoOrgao: string, filtros: FiltrosConsultaDto = {}, signal?: AbortSignal) {
    return this.listar({ ...filtros, codigoOrgao }, signal);
  }
  /**
   * Consulta transações por tipo de cartão, com validação prévia do valor.
   *
   * @param tipoCartao Um dos valores de {@link TIPOS_CARTAO} (`1` CPGF, `2` CPCC, `3` CPDC).
   * @param filtros Filtros complementares (período, órgão, página...).
   * @param signal AbortSignal opcional para cancelar a requisição.
   * @returns Promessa com as transações da página atual.
   * @throws Error de forma síncrona se `tipoCartao` não for `1`, `2` ou `3`.
   * @example
   * const transacoes = await api.cartoes.porTipo(TIPOS_CARTAO.cpcc);
   */
  porTipo(tipoCartao: TipoCartao, filtros: FiltrosConsultaDto = {}, signal?: AbortSignal) {
    return this.listar({ ...filtros, tipoCartao: validarTipoCartao(tipoCartao) }, signal);
  }
  /**
   * Consulta transações por período de transação.
   *
   * @param dataTransacaoInicio Data inicial no formato do endpoint (ex.: `01/01/2024`).
   * @param dataTransacaoFim Data final no mesmo formato.
   * @param filtros Filtros complementares (órgão, tipo, página...).
   * @param signal AbortSignal opcional para cancelar a requisição.
   * @returns Promessa com as transações da página atual.
   * @example
   * const transacoes = await api.cartoes.porPeriodoTransacao('01/01/2024', '31/01/2024');
   */
  porPeriodoTransacao(
    dataTransacaoInicio: string,
    dataTransacaoFim: string,
    filtros: FiltrosConsultaDto = {},
    signal?: AbortSignal,
  ) {
    return this.listar({ ...filtros, dataTransacaoInicio, dataTransacaoFim }, signal);
  }
  /**
   * Consulta transações por período do extrato.
   *
   * @param mesExtratoInicio Mês inicial no formato `AAAAMM` (ex.: `202401`).
   * @param mesExtratoFim Mês final no mesmo formato.
   * @param filtros Filtros complementares (órgão, tipo, página...).
   * @param signal AbortSignal opcional para cancelar a requisição.
   * @returns Promessa com as transações da página atual.
   * @example
   * const extrato = await api.cartoes.porPeriodoExtrato('202401', '202412', { codigoOrgao: '21000' });
   */
  porPeriodoExtrato(
    mesExtratoInicio: string,
    mesExtratoFim: string,
    filtros: FiltrosConsultaDto = {},
    signal?: AbortSignal,
  ) {
    return this.listar({ ...filtros, mesExtratoInicio, mesExtratoFim }, signal);
  }
}
