import type { ConsultasService } from '../../consultas/services/consultas.service.js';
import type { FiltrosConsultaDto } from '../../consultas/dtos/consulta.dto.js';

/**
 * Serviço para consulta de dados de despesas e documentos orçamentários.
 */
export class DespesasService {
  constructor(private readonly consultas: ConsultasService) {}

  /**
   * Consulta os tipos de transferência de despesas.
   *
   * @param signal AbortSignal opcional para cancelar a requisição.
   * @returns Lista de tipos de transferência.
   * @example
   * const tipos = await api.despesas.tipoTransferencia();
   */
  tipoTransferencia(signal?: AbortSignal) {
    return this.consultas.consultar('despesasTipoTransferencia', {}, signal);
  }
  /**
   * Consulta recursos recebidos por período.
   *
   * @param filtros Filtros da consulta com `mesAnoInicio` e `mesAnoFim`.
   * @param signal AbortSignal opcional para cancelar a requisição.
   * @returns Recursos recebidos no período informado.
   * @example
   * const recursos = await api.despesas.recursosRecebidos({
   *   mesAnoInicio: '012025',
   *   mesAnoFim: '122025',
   * });
   */
  recursosRecebidos(
    filtros: { mesAnoInicio: string; mesAnoFim: string } & FiltrosConsultaDto,
    signal?: AbortSignal,
  ) {
    return this.consultas.consultar('despesasRecursosRecebidos', filtros, signal);
  }

  /**
   * Consulta despesas por órgão.
   *
   * @param filtros Filtros da consulta com `ano` obrigatório.
   * @param signal AbortSignal opcional para cancelar a requisição.
   * @returns Despesas agrupadas por órgão.
   * @example
   * const porOrgao = await api.despesas.porOrgao({ ano: 2025 });
   */
  porOrgao(filtros: { ano: number } & FiltrosConsultaDto, signal?: AbortSignal) {
    return this.consultas.consultar('despesasPorOrgao', filtros, signal);
  }

  /**
   * Consulta despesas por funcional programática.
   *
   * @param filtros Filtros da consulta com `ano` obrigatório.
   * @param signal AbortSignal opcional para cancelar a requisição.
   * @returns Despesas por funcional programática.
   * @example
   * const porFuncProg = await api.despesas.porFuncionalProgramatica({ ano: 2025 });
   */
  porFuncionalProgramatica(filtros: { ano: number } & FiltrosConsultaDto, signal?: AbortSignal) {
    return this.consultas.consultar('despesasPorFuncionalProgramatica', filtros, signal);
  }

  /**
   * Consulta a movimentação líquida das despesas.
   *
   * @param filtros Filtros da consulta com `ano` obrigatório.
   * @param signal AbortSignal opcional para cancelar a requisição.
   * @returns Movimentação líquida por ano.
   * @example
   * const movimentacao = await api.despesas.movimentacaoLiquida({ ano: 2025 });
   */
  movimentacaoLiquida(filtros: { ano: number } & FiltrosConsultaDto, signal?: AbortSignal) {
    return this.consultas.consultar('despesasMovimentacaoLiquida', filtros, signal);
  }

  /**
   * Consulta o plano orçamentário de despesas.
   *
   * @param filtros Filtros da consulta com `ano` obrigatório.
   * @param signal AbortSignal opcional para cancelar a requisição.
   * @returns Plano orçamentário do ano informado.
   * @example
   * const plano = await api.despesas.planoOrcamentario({ ano: 2025 });
   */
  planoOrcamentario(filtros: { ano: number } & FiltrosConsultaDto, signal?: AbortSignal) {
    return this.consultas.consultar('despesasPlanoOrcamentario', filtros, signal);
  }
  /**
   * Consulta os itens de empenho de um documento de despesa.
   *
   * @param codigoDocumento Código do documento de empenho.
   * @param pagina Número da página (padrão: 1).
   * @param signal AbortSignal opcional para cancelar a requisição.
   * @returns Itens do empenho referentes ao documento.
   * @example
   * const itens = await api.despesas.itensDeEmpenho('12345678901234567890');
   */
  itensDeEmpenho(codigoDocumento: string, pagina = 1, signal?: AbortSignal) {
    return this.consultas.consultar('despesasItensDeEmpenho', { codigoDocumento, pagina }, signal);
  }

  /**
   * Consulta o histórico dos itens de empenho de um documento.
   *
   * @param codigoDocumento Código do documento de empenho.
   * @param sequencial Sequencial do item.
   * @param pagina Número da página (padrão: 1).
   * @param signal AbortSignal opcional para cancelar a requisição.
   * @returns Histórico dos itens do empenho.
   * @example
   * const historico = await api.despesas.historicoItensDeEmpenho('12345678901234567890', 1);
   */
  historicoItensDeEmpenho(
    codigoDocumento: string,
    sequencial: number,
    pagina = 1,
    signal?: AbortSignal,
  ) {
    return this.consultas.consultar(
      'despesasItensDeEmpenhoHistorico',
      { codigoDocumento, sequencial, pagina },
      signal,
    );
  }

  /**
   * Consulta os favorecidos finais de um documento de despesa.
   *
   * @param codigoDocumento Código do documento de despesa.
   * @param pagina Número da página (padrão: 1).
   * @param signal AbortSignal opcional para cancelar a requisição.
   * @returns Favorecidos finais do documento.
   * @example
   * const favorecidos = await api.despesas.favorecidosFinais('12345678901234567890');
   */
  favorecidosFinais(codigoDocumento: string, pagina = 1, signal?: AbortSignal) {
    return this.consultas.consultar(
      'despesasFavorecidosFinais',
      { codigoDocumento, pagina },
      signal,
    );
  }

  /**
   * Consulta os empenhos impactados por um documento de despesa.
   * Os parâmetros `codigoDocumento` e `fase` são validados antes da chamada.
   *
   * @param codigoDocumento Código do documento de despesa.
   * @param fase Fase do empenho.
   * @param pagina Número da página (padrão: 1).
   * @param signal AbortSignal opcional para cancelar a requisição.
   * @returns Empenhos impactados pelo documento.
   * @example
   * const impactados = await api.despesas.empenhosImpactados('12345678901234567890', 3);
   */
  empenhosImpactados(codigoDocumento: string, fase: number, pagina = 1, signal?: AbortSignal) {
    return this.consultas.consultar(
      'despesasEmpenhosImpactados',
      { codigoDocumento, fase, pagina },
      signal,
    );
  }
  /**
   * Consulta documentos de despesa.
   * Os parâmetros `dataEmissao` e `fase` são validados antes da chamada.
   *
   * @param filtros Filtros da consulta com `dataEmissao` e `fase` obrigatórios.
   * @param signal AbortSignal opcional para cancelar a requisição.
   * @returns Documentos de despesa conforme filtros informados.
   * @example
   * const documentos = await api.despesas.documentos({ dataEmissao: '2025-01-15', fase: 3 });
   */
  documentos(
    filtros: { dataEmissao: string; fase: number } & FiltrosConsultaDto,
    signal?: AbortSignal,
  ) {
    return this.consultas.consultar('despesasDocumentos', filtros, signal);
  }

  /**
   * Consulta um documento de despesa específico pelo seu código.
   *
   * @param codigo Código do documento de despesa.
   * @param signal AbortSignal opcional para cancelar a requisição.
   * @returns Dados do documento de despesa.
   * @example
   * const documento = await api.despesas.documento('12345678901234567890');
   */
  documento(codigo: string, signal?: AbortSignal) {
    return this.consultas.consultarUm('despesasDocumento', { codigo }, signal);
  }

  /**
   * Consulta documentos relacionados a um documento de despesa.
   * O parâmetro `codigoDocumento` e `fase` são validados antes da chamada.
   *
   * @param codigoDocumento Código do documento de despesa.
   * @param fase Fase do documento.
   * @param signal AbortSignal opcional para cancelar a requisição.
   * @returns Documentos relacionados ao documento informado.
   * @example
   * const relacionados = await api.despesas.documentosRelacionados('12345678901234567890', 3);
   */
  documentosRelacionados(codigoDocumento: string, fase: number, signal?: AbortSignal) {
    return this.consultas.consultarUm(
      'despesasDocumentosRelacionados',
      { codigoDocumento, fase },
      signal,
    );
  }

  /**
   * Consulta documentos de despesa por favorecido.
   * Os parâmetros `codigoPessoa`, `fase` e `ano` são validados antes da chamada.
   *
   * @param filtros Filtros da consulta com `codigoPessoa`, `fase` e `ano` obrigatórios.
   * @param signal AbortSignal opcional para cancelar a requisição.
   * @returns Documentos de despesa do favorecido informado.
   * @example
   * const porFavorecido = await api.despesas.documentosPorFavorecido({
   *   codigoPessoa: '12345678901',
   *   fase: 3,
   *   ano: 2025,
   * });
   */
  documentosPorFavorecido(
    filtros: { codigoPessoa: string; fase: number; ano: number } & FiltrosConsultaDto,
    signal?: AbortSignal,
  ) {
    return this.consultas.consultar('despesasDocumentosPorFavorecido', filtros, signal);
  }

  /**
   * Sub-namespace para consultas da funcional programática.
   */
  readonly funcionalProgramatica = {
    /**
     * Lista a classificação funcional programática.
     * O parâmetro `ano` é validado antes da chamada.
     *
     * @param filtros Filtros da consulta com `ano` obrigatório.
     * @param signal AbortSignal opcional para cancelar a requisição.
     * @returns Lista funcional programática do ano informado.
     * @example
     * const lista = await api.despesas.funcionalProgramatica.listar({ ano: 2025 });
     */
    listar: (filtros: { ano: number } & FiltrosConsultaDto, signal?: AbortSignal) =>
      this.consultas.consultar('despesasFuncionalListar', filtros, signal),
    /**
     * Lista as funções da classificação funcional programática.
     * O parâmetro `anoInicio` é validado antes da chamada.
     *
     * @param filtros Filtros da consulta com `anoInicio` obrigatório.
     * @param signal AbortSignal opcional para cancelar a requisição.
     * @returns Lista de funções.
     * @example
     * const funcoes = await api.despesas.funcionalProgramatica.funcoes({ anoInicio: 2025 });
     */
    funcoes: (filtros: { anoInicio: number } & FiltrosConsultaDto, signal?: AbortSignal) =>
      this.consultas.consultar('despesasFuncionalFuncoes', filtros, signal),
    /**
     * Lista as subfunções da classificação funcional programática.
     * O parâmetro `anoInicio` é validado antes da chamada.
     *
     * @param filtros Filtros da consulta com `anoInicio` obrigatório.
     * @param signal AbortSignal opcional para cancelar a requisição.
     * @returns Lista de subfunções.
     * @example
     * const subfuncoes = await api.despesas.funcionalProgramatica.subfuncoes({ anoInicio: 2025 });
     */
    subfuncoes: (filtros: { anoInicio: number } & FiltrosConsultaDto, signal?: AbortSignal) =>
      this.consultas.consultar('despesasFuncionalSubfuncoes', filtros, signal),
    /**
     * Lista os programas da classificação funcional programática.
     * O parâmetro `anoInicio` é validado antes da chamada.
     *
     * @param filtros Filtros da consulta com `anoInicio` obrigatório.
     * @param signal AbortSignal opcional para cancelar a requisição.
     * @returns Lista de programas.
     * @example
     * const programas = await api.despesas.funcionalProgramatica.programas({ anoInicio: 2025 });
     */
    programas: (filtros: { anoInicio: number } & FiltrosConsultaDto, signal?: AbortSignal) =>
      this.consultas.consultar('despesasFuncionalProgramas', filtros, signal),
    /**
     * Lista as ações da classificação funcional programática.
     * O parâmetro `anoInicio` é validado antes da chamada.
     *
     * @param filtros Filtros da consulta com `anoInicio` obrigatório.
     * @param signal AbortSignal opcional para cancelar a requisição.
     * @returns Lista de ações.
     * @example
     * const acoes = await api.despesas.funcionalProgramatica.acoes({ anoInicio: 2025 });
     */
    acoes: (filtros: { anoInicio: number } & FiltrosConsultaDto, signal?: AbortSignal) =>
      this.consultas.consultar('despesasFuncionalAcoes', filtros, signal),
  };
}
