/**
 * Schemas zod dos parâmetros de cada endpoint de consulta e tipos livres associados.
 *
 * Cada entrada de `filtrosPorRecursoSchema` espelha um caminho de `endpoints` e valida os
 * filtros aceitos por aquele endpoint conforme o OpenAPI oficial. Os helpers locais
 * centralizam as regras de digitação: `requerido()` exige texto ou número não vazio,
 * `valor()` aceita opcionalmente o mesmo formato, `inteiro()`/`obrigatorioInteiro()`
 * aceitam string ou número inteiro e `paginaSchema` padroniza a página. Todos os objetos
 * passam por `schema()`, que aplica `.passthrough()` e preserva chaves desconhecidas
 * enviadas ao endpoint. Os tipos exportados descrevem as formas livres usadas nas
 * assinaturas dos serviços.
 */
import { z } from 'zod';
import type { EndpointConsulta } from '../endpoints.js';

/** Página a ser consultada: inteiro positivo, com padrão `1`. */
export const paginaSchema = z.number().int().positive().default(1);
/** Aceita texto ou número e rejeita valores vazios ou compostos só por espaços. */
const naoVazio = z
  .union([z.string(), z.number()])
  .refine((valor) => String(valor).trim().length > 0, 'não pode ser vazio');
/** Variante opcional de {@link naoVazio}. */
const valor = () => naoVazio.optional();
/** Campo obrigatório: texto ou número não vazio, com mensagens de erro em português. */
const requerido = () =>
  z
    .union([z.string(), z.number()], {
      required_error: 'é obrigatório',
      invalid_type_error: 'deve ser texto ou número',
    })
    .refine((item) => String(item).trim().length > 0, 'não pode ser vazio');
/** Aceita número inteiro ou sua representação em string. */
const inteiro = () => z.union([z.string(), z.number().int()]);
/** Variante obrigatória de {@link inteiro}. */
const obrigatorioInteiro = () =>
  z.union([z.string(), z.number().int()], {
    required_error: 'é obrigatório',
    invalid_type_error: 'deve ser inteiro',
  });
/** Monta o objeto de filtros com `.passthrough()` para preservar chaves desconhecidas. */
const schema = (shape: z.ZodRawShape) => z.object(shape).passthrough();

/**
 * Um schema por endpoint, com as mesmas chaves de `endpoints`, conforme o OpenAPI oficial
 * (`/v3/api-docs`). A restrição `satisfies Record<EndpointConsulta, ...>` garante que
 * nenhum recurso fique sem validação.
 */
export const filtrosPorRecursoSchema = {
  servidores: schema({
    tipoServidor: inteiro().optional(),
    situacaoServidor: inteiro().optional(),
    cpf: valor().optional(),
    nome: valor().optional(),
    codigoFuncaoCargo: valor().optional(),
    orgaoServidorExercicio: valor().optional(),
    orgaoServidorLotacao: valor().optional(),
    pagina: paginaSchema,
  }),
  servidoresPorId: schema({ id: obrigatorioInteiro() }),
  servidoresPorOrgao: schema({
    orgaoLotacao: valor().optional(),
    orgaoExercicio: valor().optional(),
    tipoServidor: inteiro().optional(),
    tipoVinculo: inteiro().optional(),
    licenca: inteiro().optional(),
    pagina: paginaSchema,
  }),
  servidoresFuncoesECargos: schema({ pagina: paginaSchema }),
  remuneracoes: schema({
    id: valor().optional(),
    cpf: valor().optional(),
    mesAno: requerido(),
    pagina: paginaSchema,
  }),
  permissionarios: schema({
    codigoOrgaoResponsavelGestaoSiafi: valor().optional(),
    descricaoOrgaoOcupante: valor().optional(),
    cpfOcupante: valor().optional(),
    dataInicioOcupacao: valor().optional(),
    dataFimOcupacao: valor().optional(),
    pagina: paginaSchema,
  }),
  viagens: schema({
    dataIdaDe: requerido(),
    dataIdaAte: requerido(),
    dataRetornoDe: requerido(),
    dataRetornoAte: requerido(),
    codigoOrgao: requerido(),
    pagina: paginaSchema,
  }),
  viagensPorCpf: schema({ cpf: requerido(), pagina: paginaSchema }),
  viagensPorId: schema({ id: obrigatorioInteiro() }),
  contratos: schema({
    dataInicial: valor().optional(),
    dataFinal: valor().optional(),
    codigoOrgao: requerido(),
    pagina: paginaSchema,
  }),
  contratosPorId: schema({ id: obrigatorioInteiro() }),
  contratosPorCpfCnpj: schema({ cpfCnpj: requerido(), pagina: paginaSchema }),
  contratosPorProcesso: schema({ processo: requerido(), pagina: paginaSchema }),
  contratosPorNumero: schema({ numero: requerido(), pagina: paginaSchema }),
  contratosItensContratados: schema({ id: obrigatorioInteiro(), pagina: paginaSchema }),
  contratosTermoAditivo: schema({ id: obrigatorioInteiro() }),
  contratosDocumentosRelacionados: schema({ id: obrigatorioInteiro() }),
  contratosApostilamento: schema({ id: obrigatorioInteiro() }),
  convenios: schema({
    dataInicial: valor().optional(),
    dataFinal: valor().optional(),
    dataUltimaLiberacaoInicial: valor().optional(),
    dataUltimaLiberacaoFinal: valor().optional(),
    dataVigenciaInicial: valor().optional(),
    dataVigenciaFinal: valor().optional(),
    convenente: valor().optional(),
    tipoConvenente: valor().optional(),
    numero: valor().optional(),
    numeroOriginal: valor().optional(),
    codigoOrgao: valor().optional(),
    uf: valor().optional(),
    codigoIBGE: valor().optional(),
    situacao: valor().optional(),
    tipoInstrumento: valor().optional(),
    funcao: valor().optional(),
    subfuncao: valor().optional(),
    valorLiberadoDe: valor().optional(),
    valorLiberadoAte: valor().optional(),
    valorTotalDe: valor().optional(),
    valorTotalAte: valor().optional(),
    pagina: paginaSchema,
  }),
  conveniosPorId: schema({ id: obrigatorioInteiro() }),
  conveniosTipoInstrumento: schema({}),
  conveniosPorNumero: schema({ numero: requerido(), pagina: paginaSchema }),
  conveniosPorNumeroProcesso: schema({ numeroProcesso: requerido(), pagina: paginaSchema }),
  conveniosPorNumeroOriginal: schema({ numeroOriginal: requerido(), pagina: paginaSchema }),
  licitacoes: schema({
    dataInicial: valor().optional(),
    dataFinal: valor().optional(),
    codigoOrgao: requerido(),
    pagina: paginaSchema,
  }),
  licitacoesPorId: schema({ id: obrigatorioInteiro() }),
  licitacoesUgs: schema({ pagina: paginaSchema }),
  licitacoesModalidades: schema({}),
  licitacoesPorProcesso: schema({ processo: requerido() }),
  licitacoesPorUgModalidadeNumero: schema({
    codigoUG: requerido(),
    numero: requerido(),
    codigoModalidade: requerido(),
  }),
  licitacoesParticipantes: schema({
    codigoUG: requerido(),
    numero: requerido(),
    codigoModalidade: requerido(),
    pagina: paginaSchema,
  }),
  licitacoesItens: schema({ id: obrigatorioInteiro(), pagina: paginaSchema }),
  licitacoesEmpenhos: schema({
    codigoUG: requerido(),
    numero: requerido(),
    codigoModalidade: requerido(),
    pagina: paginaSchema,
  }),
  licitacoesContratosRelacionados: schema({
    codigoUG: requerido(),
    numero: requerido(),
    codigoModalidade: requerido(),
  }),
  notasFiscais: schema({
    cnpjEmitente: valor().optional(),
    codigoOrgao: valor().optional(),
    nomeProduto: valor().optional(),
    pagina: paginaSchema,
  }),
  notasFiscaisPorChave: schema({ chaveUnicaNotaFiscal: requerido() }),
  ceis: schema({
    codigoSancionado: valor().optional(),
    nomeSancionado: valor().optional(),
    orgaoSancionador: valor().optional(),
    dataInicialSancao: valor().optional(),
    dataFinalSancao: valor().optional(),
    pagina: paginaSchema,
  }),
  ceisPorId: schema({ id: obrigatorioInteiro() }),
  cnep: schema({
    codigoSancionado: valor().optional(),
    nomeSancionado: valor().optional(),
    orgaoSancionador: valor().optional(),
    dataInicialSancao: valor().optional(),
    dataFinalSancao: valor().optional(),
    pagina: paginaSchema,
  }),
  cnepPorId: schema({ id: obrigatorioInteiro() }),
  ceaf: schema({
    cpfSancionado: valor().optional(),
    nomeSancionado: valor().optional(),
    orgaoLotacao: valor().optional(),
    dataPublicacaoInicio: valor().optional(),
    dataPublicacaoFim: valor().optional(),
    pagina: paginaSchema,
  }),
  ceafPorId: schema({ id: obrigatorioInteiro() }),
  cepim: schema({
    cnpjSancionado: valor().optional(),
    nomeSancionado: valor().optional(),
    ufSancionado: valor().optional(),
    orgaoEntidade: valor().optional(),
    pagina: paginaSchema,
  }),
  cepimPorId: schema({ id: obrigatorioInteiro() }),
  acordosLeniencia: schema({
    cnpjSancionado: valor().optional(),
    nomeSancionado: valor().optional(),
    situacao: valor().optional(),
    dataInicialSancao: valor().optional(),
    dataFinalSancao: valor().optional(),
    pagina: paginaSchema,
  }),
  acordosLenienciaPorId: schema({ id: obrigatorioInteiro() }),
  cartoes: schema({
    mesExtratoInicio: valor().optional(),
    mesExtratoFim: valor().optional(),
    dataTransacaoInicio: valor().optional(),
    dataTransacaoFim: valor().optional(),
    tipoCartao: inteiro().optional(),
    codigoOrgao: valor().optional(),
    cpfPortador: valor().optional(),
    cpfCnpjFavorecido: valor().optional(),
    valorDe: valor().optional(),
    valorAte: valor().optional(),
    pagina: paginaSchema,
  }),
  peps: schema({
    cpf: valor().optional(),
    nome: valor().optional(),
    descricaoFuncao: valor().optional(),
    orgaoServidorLotacao: valor().optional(),
    dataInicioExercicioDe: valor().optional(),
    datInicioExercicioAte: valor().optional(),
    dataFimExercicioDe: valor().optional(),
    datFimExercicioAte: valor().optional(),
    pagina: paginaSchema,
  }),
  imoveis: schema({
    codigoOrgaoSiafiResponsavelGestao: valor().optional(),
    situacao: valor().optional(),
    regiao: valor().optional(),
    cep: valor().optional(),
    endereco: valor().optional(),
    pagina: paginaSchema,
  }),
  situacaoImovel: schema({
    codigoImovel: valor().optional(),
    cpfOcupante: valor().optional(),
    nomeOcupante: valor().optional(),
    situacaoImovel: valor().optional(),
    pagina: paginaSchema,
  }),
  orgaosSiafi: schema({
    codigo: valor().optional(),
    descricao: valor().optional(),
    pagina: paginaSchema,
  }),
  orgaosSiape: schema({
    codigo: valor().optional(),
    descricao: valor().optional(),
    pagina: paginaSchema,
  }),
  pessoaFisica: schema({
    cpf: valor().optional(),
    nis: valor().optional(),
  }),
  pessoaJuridica: schema({ cnpj: requerido() }),
  emendas: schema({
    codigoEmenda: valor().optional(),
    numeroEmenda: valor().optional(),
    nomeAutor: valor().optional(),
    tipoEmenda: valor().optional(),
    ano: inteiro().optional(),
    codigoFuncao: valor().optional(),
    codigoSubfuncao: valor().optional(),
    pagina: paginaSchema,
  }),
  emendasDocumentos: schema({ codigo: requerido(), pagina: paginaSchema }),
  renunciasValor: schema({
    nomeSiglaUF: valor().optional(),
    codigoIbge: valor().optional(),
    cnpj: valor().optional(),
    pagina: paginaSchema,
  }),
  renunciasImunesIsentas: schema({
    nomeSiglaUF: valor().optional(),
    codigoIbge: valor().optional(),
    cnpj: valor().optional(),
    beneficiarioNomeFantasia: valor().optional(),
    pagina: paginaSchema,
  }),
  renunciasHabilitadas: schema({
    nomeSiglaUF: valor().optional(),
    codigoIbge: valor().optional(),
    cnpj: valor().optional(),
    beneficiarioNomeFantasia: valor().optional(),
    pagina: paginaSchema,
  }),
  despesasTipoTransferencia: schema({}),
  despesasRecursosRecebidos: schema({
    mesAnoInicio: requerido(),
    mesAnoFim: requerido(),
    nomeFavorecido: valor().optional(),
    codigoFavorecido: valor().optional(),
    tipoFavorecido: valor().optional(),
    uf: valor().optional(),
    codigoIBGE: valor().optional(),
    orgaoSuperior: valor().optional(),
    orgao: valor().optional(),
    unidadeGestora: valor().optional(),
    pagina: paginaSchema,
  }),
  despesasPorOrgao: schema({
    ano: obrigatorioInteiro(),
    orgaoSuperior: valor().optional(),
    orgao: valor().optional(),
    pagina: paginaSchema,
  }),
  despesasPorFuncionalProgramatica: schema({
    ano: obrigatorioInteiro(),
    funcao: valor().optional(),
    subfuncao: valor().optional(),
    programa: valor().optional(),
    acao: valor().optional(),
    pagina: paginaSchema,
  }),
  despesasMovimentacaoLiquida: schema({
    ano: obrigatorioInteiro(),
    funcao: valor().optional(),
    subfuncao: valor().optional(),
    programa: valor().optional(),
    acao: valor().optional(),
    grupoDespesa: valor().optional(),
    elementoDespesa: valor().optional(),
    modalidadeAplicacao: valor().optional(),
    idPlanoOrcamentario: inteiro().optional(),
    pagina: paginaSchema,
  }),
  despesasPlanoOrcamentario: schema({
    codPlanoOrcamentario: valor().optional(),
    descPlanoOrcamentario: valor().optional(),
    codPOIdentfAcompanhamento: valor().optional(),
    ano: obrigatorioInteiro(),
    pagina: paginaSchema,
  }),
  despesasItensDeEmpenho: schema({ codigoDocumento: requerido(), pagina: paginaSchema }),
  despesasItensDeEmpenhoHistorico: schema({
    codigoDocumento: requerido(),
    sequencial: obrigatorioInteiro(),
    pagina: paginaSchema,
  }),
  despesasFavorecidosFinais: schema({ codigoDocumento: requerido(), pagina: paginaSchema }),
  despesasEmpenhosImpactados: schema({
    codigoDocumento: requerido(),
    fase: obrigatorioInteiro(),
    pagina: paginaSchema,
  }),
  despesasDocumentos: schema({
    unidadeGestora: valor().optional(),
    gestao: valor().optional(),
    dataEmissao: requerido(),
    fase: obrigatorioInteiro(),
    pagina: paginaSchema,
  }),
  despesasDocumento: schema({ codigo: requerido() }),
  despesasDocumentosRelacionados: schema({
    codigoDocumento: requerido(),
    fase: obrigatorioInteiro(),
  }),
  despesasDocumentosPorFavorecido: schema({
    codigoPessoa: requerido(),
    fase: obrigatorioInteiro(),
    ano: obrigatorioInteiro(),
    ug: valor().optional(),
    gestao: valor().optional(),
    ordenacaoResultado: inteiro().optional(),
    pagina: paginaSchema,
  }),
  despesasFuncionalListar: schema({ ano: obrigatorioInteiro(), pagina: paginaSchema }),
  despesasFuncionalFuncoes: schema({
    anoInicio: obrigatorioInteiro(),
    codigo: valor().optional(),
    pagina: paginaSchema,
  }),
  despesasFuncionalSubfuncoes: schema({
    anoInicio: obrigatorioInteiro(),
    codigo: valor().optional(),
    pagina: paginaSchema,
  }),
  despesasFuncionalProgramas: schema({
    anoInicio: obrigatorioInteiro(),
    codigo: valor().optional(),
    pagina: paginaSchema,
  }),
  despesasFuncionalAcoes: schema({
    anoInicio: obrigatorioInteiro(),
    codigo: valor().optional(),
    pagina: paginaSchema,
  }),
  coronavirusTransferencias: schema({
    mesAno: requerido(),
    codigoOrgao: valor().optional(),
    tipoTransferencia: valor().optional(),
    uf: valor().optional(),
    codigoIbge: valor().optional(),
    pagina: paginaSchema,
  }),
  coronavirusMovimentoLiquido: schema({
    mesAnoLancamento: requerido(),
    funcao: valor().optional(),
    subfuncao: valor().optional(),
    programa: valor().optional(),
    acao: valor().optional(),
    grupoDespesa: valor().optional(),
    elementoDespesa: valor().optional(),
    modalidadeAplicacao: valor().optional(),
    idPlanoOrcamentario: inteiro().optional(),
    pagina: paginaSchema,
  }),
  bolsaFamiliaPorMunicipio: schema({
    mesAno: requerido(),
    codigoIbge: requerido(),
    pagina: paginaSchema,
  }),
  bolsaFamiliaDisponivelBeneficiarioPorMunicipio: schema({
    mesAno: requerido(),
    codigoIbge: requerido(),
    pagina: paginaSchema,
  }),
  bolsaFamiliaDisponivelPorCpfOuNis: schema({
    codigo: requerido(),
    anoMesReferencia: valor().optional(),
    anoMesCompetencia: valor().optional(),
    pagina: paginaSchema,
  }),
  bolsaFamiliaSacadoBeneficiarioPorMunicipio: schema({
    mesAno: requerido(),
    codigoIbge: requerido(),
    pagina: paginaSchema,
  }),
  bolsaFamiliaSacadoPorCpfOuNis: schema({
    codigo: requerido(),
    anoMesReferencia: valor().optional(),
    anoMesCompetencia: valor().optional(),
    pagina: paginaSchema,
  }),
  bolsaFamiliaSacadoPorNis: schema({
    nis: requerido(),
    anoMesReferencia: valor().optional(),
    anoMesCompetencia: valor().optional(),
    pagina: paginaSchema,
  }),
  bpcBeneficiarioPorMunicipio: schema({
    mesAno: requerido(),
    codigoIbge: requerido(),
    pagina: paginaSchema,
  }),
  bpcPorCpfOuNis: schema({ codigo: requerido(), pagina: paginaSchema }),
  bpcPorMunicipio: schema({
    mesAno: requerido(),
    codigoIbge: requerido(),
    pagina: paginaSchema,
  }),
  novoBolsaFamiliaPorMunicipio: schema({
    mesAno: requerido(),
    codigoIbge: requerido(),
    pagina: paginaSchema,
  }),
  novoBolsaFamiliaSacadoBeneficiarioPorMunicipio: schema({
    mesAno: requerido(),
    codigoIbge: requerido(),
    pagina: paginaSchema,
  }),
  novoBolsaFamiliaSacadoPorCpfOuNis: schema({
    codigo: requerido(),
    anoMesReferencia: valor().optional(),
    anoMesCompetencia: valor().optional(),
    pagina: paginaSchema,
  }),
  novoBolsaFamiliaSacadoPorNis: schema({
    nis: requerido(),
    anoMesReferencia: valor().optional(),
    anoMesCompetencia: valor().optional(),
    pagina: paginaSchema,
  }),
  petiBeneficiarioPorMunicipio: schema({
    mesAno: requerido(),
    codigoIbge: requerido(),
    pagina: paginaSchema,
  }),
  petiPorCpfOuNis: schema({ codigo: requerido(), pagina: paginaSchema }),
  petiPorMunicipio: schema({
    mesAno: requerido(),
    codigoIbge: requerido(),
    pagina: paginaSchema,
  }),
  safraBeneficiarioPorMunicipio: schema({
    mesAno: requerido(),
    codigoIbge: requerido(),
    pagina: paginaSchema,
  }),
  safraPorCpfOuNis: schema({ codigo: requerido(), pagina: paginaSchema }),
  safraPorMunicipio: schema({
    mesAno: requerido(),
    codigoIbge: requerido(),
    pagina: paginaSchema,
  }),
  seguroDefesoBeneficiarioPorMunicipio: schema({
    mesAno: requerido(),
    codigoIbge: requerido(),
    pagina: paginaSchema,
  }),
  seguroDefesoPorMunicipio: schema({
    mesAno: requerido(),
    codigoIbge: requerido(),
    pagina: paginaSchema,
  }),
  auxilioBrasilPorMunicipio: schema({
    mesAno: requerido(),
    codigoIbge: requerido(),
    pagina: paginaSchema,
  }),
  auxilioBrasilSacadoBeneficiarioPorMunicipio: schema({
    mesAno: requerido(),
    codigoIbge: requerido(),
    pagina: paginaSchema,
  }),
  auxilioBrasilSacadoPorCpfOuNis: schema({
    codigo: requerido(),
    anoMesReferencia: valor().optional(),
    anoMesCompetencia: valor().optional(),
    pagina: paginaSchema,
  }),
  auxilioBrasilSacadoPorNis: schema({
    nis: requerido(),
    anoMesReferencia: valor().optional(),
    anoMesCompetencia: valor().optional(),
    pagina: paginaSchema,
  }),
  auxilioEmergencialBeneficiarioPorMunicipio: schema({
    mesAno: requerido(),
    codigoIbge: requerido(),
    pagina: paginaSchema,
  }),
  auxilioEmergencialPorCpfOuNis: schema({
    codigoBeneficiario: valor().optional(),
    codigoResponsavelFamiliar: valor().optional(),
    pagina: paginaSchema,
  }),
  auxilioEmergencialPorMunicipio: schema({
    mesAno: requerido(),
    codigoIbge: requerido(),
    pagina: paginaSchema,
  }),
} satisfies Record<EndpointConsulta, z.ZodTypeAny>;

/** Filtros livres em query string aceitos pelos serviços; `pagina` é o número da página. */
export type FiltrosConsultaDto = Record<string, string | number | boolean | null | undefined> & {
  pagina?: number;
};
/** Registro genérico de um endpoint: mantém todas as chaves retornadas pela API. */
export type RegistroDto = Record<string, unknown> & {
  id?: number | string;
  codigo?: string;
  nome?: string;
};
