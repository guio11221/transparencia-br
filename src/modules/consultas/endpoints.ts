/**
 * Fonte única de verdade dos caminhos oficiais da API do Portal da Transparência.
 *
 * Os caminhos foram gerados e conferidos contra o OpenAPI oficial publicado em
 * `/v3/api-docs`; toda alteração deve partir desse documento. O formato é um objeto
 * `as const` em que cada chave nomeia uma consulta (recurso ou variação) e o valor é o
 * caminho literal da requisição, sempre com prefixo `/api-de-dados`. Placeholders de
 * caminho aparecem entre chaves (ex.: `{codigo}`) e são substituídos em tempo de execução
 * pelo serviço de consultas.
 */
export const endpoints = {
  servidores: '/api-de-dados/servidores',
  servidoresPorOrgao: '/api-de-dados/servidores/por-orgao',
  servidoresFuncoesECargos: '/api-de-dados/servidores/funcoes-e-cargos',
  remuneracoes: '/api-de-dados/servidores/remuneracao',
  permissionarios: '/api-de-dados/permissionarios',
  viagens: '/api-de-dados/viagens',
  viagensPorCpf: '/api-de-dados/viagens-por-cpf',
  contratos: '/api-de-dados/contratos',
  contratosPorId: '/api-de-dados/contratos/id',
  contratosPorCpfCnpj: '/api-de-dados/contratos/cpf-cnpj',
  contratosPorProcesso: '/api-de-dados/contratos/processo',
  contratosPorNumero: '/api-de-dados/contratos/numero',
  contratosItensContratados: '/api-de-dados/contratos/itens-contratados',
  contratosTermoAditivo: '/api-de-dados/contratos/termo-aditivo',
  contratosDocumentosRelacionados: '/api-de-dados/contratos/documentos-relacionados',
  contratosApostilamento: '/api-de-dados/contratos/apostilamento',
  convenios: '/api-de-dados/convenios',
  conveniosPorId: '/api-de-dados/convenios/id',
  conveniosTipoInstrumento: '/api-de-dados/convenios/tipo-instrumento',
  conveniosPorNumero: '/api-de-dados/convenios/numero',
  conveniosPorNumeroProcesso: '/api-de-dados/convenios/numero-processo',
  conveniosPorNumeroOriginal: '/api-de-dados/convenios/numero-original',
  licitacoes: '/api-de-dados/licitacoes',
  licitacoesUgs: '/api-de-dados/licitacoes/ugs',
  licitacoesModalidades: '/api-de-dados/licitacoes/modalidades',
  licitacoesPorProcesso: '/api-de-dados/licitacoes/por-processo',
  licitacoesPorUgModalidadeNumero: '/api-de-dados/licitacoes/por-ug-modalidade-numero',
  licitacoesParticipantes: '/api-de-dados/licitacoes/participantes',
  licitacoesItens: '/api-de-dados/licitacoes/itens-licitados',
  licitacoesEmpenhos: '/api-de-dados/licitacoes/empenhos',
  licitacoesContratosRelacionados: '/api-de-dados/licitacoes/contratos-relacionados-licitacao',
  notasFiscais: '/api-de-dados/notas-fiscais',
  notasFiscaisPorChave: '/api-de-dados/notas-fiscais-por-chave',
  ceis: '/api-de-dados/ceis',
  cnep: '/api-de-dados/cnep',
  ceaf: '/api-de-dados/ceaf',
  cepim: '/api-de-dados/cepim',
  acordosLeniencia: '/api-de-dados/acordos-leniencia',
  cartoes: '/api-de-dados/cartoes',
  peps: '/api-de-dados/peps',
  imoveis: '/api-de-dados/imoveis',
  pessoaFisica: '/api-de-dados/pessoa-fisica',
  pessoaJuridica: '/api-de-dados/pessoa-juridica',
  emendas: '/api-de-dados/emendas',
  emendasDocumentos: '/api-de-dados/emendas/documentos/{codigo}',
  renunciasValor: '/api-de-dados/renuncias-valor',
  renunciasImunesIsentas: '/api-de-dados/renuncias-fiscais-empresas-imunes-isentas',
  renunciasHabilitadas: '/api-de-dados/renuncias-fiscais-empresas-habilitadas-beneficios-fiscais',
  despesasTipoTransferencia: '/api-de-dados/despesas/tipo-transferencia',
  despesasRecursosRecebidos: '/api-de-dados/despesas/recursos-recebidos',
  despesasPorOrgao: '/api-de-dados/despesas/por-orgao',
  despesasPorFuncionalProgramatica: '/api-de-dados/despesas/por-funcional-programatica',
  despesasMovimentacaoLiquida:
    '/api-de-dados/despesas/por-funcional-programatica/movimentacao-liquida',
  despesasPlanoOrcamentario: '/api-de-dados/despesas/plano-orcamentario',
  despesasItensDeEmpenho: '/api-de-dados/despesas/itens-de-empenho',
  despesasItensDeEmpenhoHistorico: '/api-de-dados/despesas/itens-de-empenho/historico',
  despesasFavorecidosFinais: '/api-de-dados/despesas/favorecidos-finais-por-documento',
  despesasEmpenhosImpactados: '/api-de-dados/despesas/empenhos-impactados',
  despesasDocumentos: '/api-de-dados/despesas/documentos',
  despesasDocumento: '/api-de-dados/despesas/documentos/{codigo}',
  despesasDocumentosRelacionados: '/api-de-dados/despesas/documentos-relacionados',
  despesasDocumentosPorFavorecido: '/api-de-dados/despesas/documentos-por-favorecido',
  despesasFuncionalListar: '/api-de-dados/despesas/funcional-programatica/listar',
  despesasFuncionalFuncoes: '/api-de-dados/despesas/funcional-programatica/funcoes',
  despesasFuncionalSubfuncoes: '/api-de-dados/despesas/funcional-programatica/subfuncoes',
  despesasFuncionalProgramas: '/api-de-dados/despesas/funcional-programatica/programas',
  despesasFuncionalAcoes: '/api-de-dados/despesas/funcional-programatica/acoes',
} as const;

/** União literal das chaves de {@link endpoints}: todos os recursos consultáveis pelo SDK. */
export type EndpointConsulta = keyof typeof endpoints;
