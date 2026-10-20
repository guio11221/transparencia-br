import { describe, expect, it, vi } from 'vitest';
import { Transparencia, catalogoProgramas } from '../../src/index.js';

const criarApi = () => {
  const get = vi.fn().mockResolvedValue([]);
  return { get, api: new Transparencia({ apiKey: 'test', httpClient: { get } }) };
};

describe('Catálogo de benefícios', () => {
  it('lista os tipos de auxílio com metadados completos', () => {
    const { api } = criarApi();
    const catalogo = api.beneficios.catalogo();
    expect(catalogo).toHaveLength(catalogoProgramas.length);
    expect(
      catalogo.every(
        (item) => item.nome && item.descricao && item.endpoint.startsWith('/api-de-dados/'),
      ),
    ).toBe(true);
    expect(catalogo.map((item) => item.programa)).toEqual(
      expect.arrayContaining([
        'bolsaFamilia',
        'auxilioBrasil',
        'auxilioEmergencial',
        'bpc',
        'peti',
      ]),
    );
    expect(catalogo.find((item) => item.programa === 'bolsaFamilia')).toMatchObject({
      identificador: 'cpf-ou-nis',
      aceitaMes: true,
    });
    expect(catalogo.find((item) => item.programa === 'peti')).toMatchObject({
      identificador: 'codigo',
    });
    expect(catalogo.find((item) => item.programa === 'novoBolsaFamilia')).toMatchObject({
      identificador: 'nis',
    });
  });

  it('devolve cópia defensiva do catálogo', () => {
    const { api } = criarApi();
    const catalogo = api.beneficios.catalogo();
    catalogo[0]!.nome = 'alterado';
    expect(api.beneficios.catalogo()[0]!.nome).not.toBe('alterado');
  });
});

describe('Novas buscas', () => {
  it('servidores por órgão e lista de funções e cargos', async () => {
    const { get, api } = criarApi();
    await api.servidores.porOrgao({ orgaoLotacao: '21000' });
    await api.servidores.funcoesECargos();
    expect(get).toHaveBeenNthCalledWith(
      1,
      '/api-de-dados/servidores/por-orgao',
      { orgaoLotacao: '21000', pagina: 1 },
      undefined,
    );
    expect(get).toHaveBeenNthCalledWith(
      2,
      '/api-de-dados/servidores/funcoes-e-cargos',
      { pagina: 1 },
      undefined,
    );
  });

  it('contratos por CPF/CNPJ, processo, número e detalhes por id', async () => {
    const { get, api } = criarApi();
    await api.contratos.porCpfCnpj('11222333000181');
    await api.contratos.porProcesso('19400.012345/2024-10', 2);
    await api.contratos.porNumero('123/2024');
    await api.contratos.itensContratados(7);
    await api.contratos.termoAditivo(9);
    await api.contratos.documentosRelacionados(9);
    await api.contratos.apostilamento(9);
    expect(get).toHaveBeenNthCalledWith(
      1,
      '/api-de-dados/contratos/cpf-cnpj',
      { cpfCnpj: '11222333000181', pagina: 1 },
      undefined,
    );
    expect(get).toHaveBeenNthCalledWith(
      2,
      '/api-de-dados/contratos/processo',
      { processo: '19400.012345/2024-10', pagina: 2 },
      undefined,
    );
    expect(get).toHaveBeenNthCalledWith(
      3,
      '/api-de-dados/contratos/numero',
      { numero: '123/2024', pagina: 1 },
      undefined,
    );
    expect(get).toHaveBeenNthCalledWith(
      4,
      '/api-de-dados/contratos/itens-contratados',
      { id: 7, pagina: 1 },
      undefined,
    );
    expect(get).toHaveBeenNthCalledWith(
      5,
      '/api-de-dados/contratos/termo-aditivo',
      { id: 9 },
      undefined,
    );
    expect(get).toHaveBeenNthCalledWith(
      6,
      '/api-de-dados/contratos/documentos-relacionados',
      { id: 9 },
      undefined,
    );
    expect(get).toHaveBeenNthCalledWith(
      7,
      '/api-de-dados/contratos/apostilamento',
      { id: 9 },
      undefined,
    );
  });

  it('licitações por UG, modalidade e número, com itens e participantes', async () => {
    const { get, api } = criarApi();
    const identificacao = { codigoUG: '123456', numero: '00001/2024', codigoModalidade: '1' };
    await api.licitacoes.ugs();
    await api.licitacoes.modalidades();
    await api.licitacoes.porProcesso('19400.012345/2024-10');
    await api.licitacoes.porUgModalidadeNumero(identificacao);
    await api.licitacoes.participantes(identificacao, 3);
    await api.licitacoes.itens(42, 2);
    await api.licitacoes.empenhos(identificacao);
    await api.licitacoes.contratosRelacionados(identificacao);
    expect(get).toHaveBeenNthCalledWith(
      1,
      '/api-de-dados/licitacoes/ugs',
      { pagina: 1 },
      undefined,
    );
    expect(get).toHaveBeenNthCalledWith(2, '/api-de-dados/licitacoes/modalidades', {}, undefined);
    expect(get).toHaveBeenNthCalledWith(
      3,
      '/api-de-dados/licitacoes/por-processo',
      { processo: '19400.012345/2024-10' },
      undefined,
    );
    expect(get).toHaveBeenNthCalledWith(
      4,
      '/api-de-dados/licitacoes/por-ug-modalidade-numero',
      identificacao,
      undefined,
    );
    expect(get).toHaveBeenNthCalledWith(
      5,
      '/api-de-dados/licitacoes/participantes',
      { ...identificacao, pagina: 3 },
      undefined,
    );
    expect(get).toHaveBeenNthCalledWith(
      6,
      '/api-de-dados/licitacoes/itens-licitados',
      { id: 42, pagina: 2 },
      undefined,
    );
    expect(get).toHaveBeenNthCalledWith(
      7,
      '/api-de-dados/licitacoes/empenhos',
      { ...identificacao, pagina: 1 },
      undefined,
    );
    expect(get).toHaveBeenNthCalledWith(
      8,
      '/api-de-dados/licitacoes/contratos-relacionados-licitacao',
      identificacao,
      undefined,
    );
  });

  it('convênios por número, processo, original e tabela de instrumentos', async () => {
    const { get, api } = criarApi();
    await api.convenios.porNumero('123/2024');
    await api.convenios.porNumeroProcesso('19400.012345/2024-10');
    await api.convenios.porNumeroOriginal('001/2024');
    await api.convenios.tipoInstrumento();
    expect(get).toHaveBeenNthCalledWith(
      1,
      '/api-de-dados/convenios/numero',
      { numero: '123/2024', pagina: 1 },
      undefined,
    );
    expect(get).toHaveBeenNthCalledWith(
      2,
      '/api-de-dados/convenios/numero-processo',
      { numeroProcesso: '19400.012345/2024-10', pagina: 1 },
      undefined,
    );
    expect(get).toHaveBeenNthCalledWith(
      3,
      '/api-de-dados/convenios/numero-original',
      { numeroOriginal: '001/2024', pagina: 1 },
      undefined,
    );
    expect(get).toHaveBeenNthCalledWith(
      4,
      '/api-de-dados/convenios/tipo-instrumento',
      {},
      undefined,
    );
  });

  it('viagens por CPF e notas fiscais por chave', async () => {
    const { get, api } = criarApi();
    await api.viagens.porCpf('12345678901', 2);
    await api.notasFiscais.porChave('35240112345678000199550010000001231000001234');
    expect(get).toHaveBeenNthCalledWith(
      1,
      '/api-de-dados/viagens-por-cpf',
      { cpf: '12345678901', pagina: 2 },
      undefined,
    );
    expect(get).toHaveBeenNthCalledWith(
      2,
      '/api-de-dados/notas-fiscais-por-chave',
      { chaveUnicaNotaFiscal: '35240112345678000199550010000001231000001234' },
      undefined,
    );
  });

  it('pessoas física e jurídica', async () => {
    const { get, api } = criarApi();
    await api.pessoas.fisica({ cpf: '12345678901' });
    await api.pessoas.fisica({ nis: '12345678901' });
    await api.pessoas.juridica('11222333000181');
    expect(get).toHaveBeenNthCalledWith(
      1,
      '/api-de-dados/pessoa-fisica',
      { cpf: '12345678901' },
      undefined,
    );
    expect(get).toHaveBeenNthCalledWith(
      2,
      '/api-de-dados/pessoa-fisica',
      { nis: '12345678901' },
      undefined,
    );
    expect(get).toHaveBeenNthCalledWith(
      3,
      '/api-de-dados/pessoa-juridica',
      { cnpj: '11222333000181' },
      undefined,
    );
    expect(() => api.pessoas.fisica({})).toThrow(/cpf ou nis/);
  });

  it('despesas por órgão, funcional-programática e documentos', async () => {
    const { get, api } = criarApi();
    await api.despesas.porOrgao({ ano: 2024, orgaoSuperior: '200' });
    await api.despesas.porFuncionalProgramatica({ ano: 2024, funcao: '12' });
    await api.despesas.movimentacaoLiquida({ ano: 2024 });
    await api.despesas.planoOrcamentario({ ano: 2024 });
    await api.despesas.itensDeEmpenho('ABC123');
    await api.despesas.historicoItensDeEmpenho('ABC123', 1);
    await api.despesas.favorecidosFinais('ABC123');
    await api.despesas.empenhosImpactados('ABC123', 2);
    await api.despesas.documentos({ dataEmissao: '01/01/2024', fase: 2 });
    await api.despesas.documento('ABC123');
    await api.despesas.documentosRelacionados('ABC123', 2);
    await api.despesas.documentosPorFavorecido({ codigoPessoa: '999', fase: 2, ano: 2024 });
    await api.despesas.recursosRecebidos({ mesAnoInicio: '202401', mesAnoFim: '202412' });
    await api.despesas.tipoTransferencia();
    expect(get).toHaveBeenNthCalledWith(
      1,
      '/api-de-dados/despesas/por-orgao',
      { ano: 2024, orgaoSuperior: '200', pagina: 1 },
      undefined,
    );
    expect(get).toHaveBeenNthCalledWith(
      4,
      '/api-de-dados/despesas/plano-orcamentario',
      { ano: 2024, pagina: 1 },
      undefined,
    );
    expect(get).toHaveBeenNthCalledWith(
      9,
      '/api-de-dados/despesas/documentos',
      { dataEmissao: '01/01/2024', fase: 2, pagina: 1 },
      undefined,
    );
    expect(get).toHaveBeenNthCalledWith(
      10,
      '/api-de-dados/despesas/documentos/ABC123',
      {},
      undefined,
    );
    expect(get).toHaveBeenNthCalledWith(
      11,
      '/api-de-dados/despesas/documentos-relacionados',
      { codigoDocumento: 'ABC123', fase: 2 },
      undefined,
    );
    expect(get).toHaveBeenNthCalledWith(
      13,
      '/api-de-dados/despesas/recursos-recebidos',
      { mesAnoInicio: '202401', mesAnoFim: '202412', pagina: 1 },
      undefined,
    );
    expect(get).toHaveBeenNthCalledWith(
      14,
      '/api-de-dados/despesas/tipo-transferencia',
      {},
      undefined,
    );
  });

  it('lista funcional-programática (funções, subfunções, programas e ações)', async () => {
    const { get, api } = criarApi();
    await api.despesas.funcionalProgramatica.listar({ ano: 2024 });
    await api.despesas.funcionalProgramatica.funcoes({ anoInicio: 2020 });
    await api.despesas.funcionalProgramatica.subfuncoes({ anoInicio: 2020 });
    await api.despesas.funcionalProgramatica.programas({ anoInicio: 2020 });
    await api.despesas.funcionalProgramatica.acoes({ anoInicio: 2020, codigo: '2001' });
    expect(get).toHaveBeenNthCalledWith(
      1,
      '/api-de-dados/despesas/funcional-programatica/listar',
      { ano: 2024, pagina: 1 },
      undefined,
    );
    expect(get).toHaveBeenNthCalledWith(
      2,
      '/api-de-dados/despesas/funcional-programatica/funcoes',
      { anoInicio: 2020, pagina: 1 },
      undefined,
    );
    expect(get).toHaveBeenNthCalledWith(
      5,
      '/api-de-dados/despesas/funcional-programatica/acoes',
      { anoInicio: 2020, codigo: '2001', pagina: 1 },
      undefined,
    );
  });

  it('emendas e documentos da emenda com código no caminho', async () => {
    const { get, api } = criarApi();
    await api.emendas.listar({ ano: 2024 });
    await api.emendas.documentos('77', 2);
    expect(get).toHaveBeenNthCalledWith(
      1,
      '/api-de-dados/emendas',
      { ano: 2024, pagina: 1 },
      undefined,
    );
    expect(get).toHaveBeenNthCalledWith(
      2,
      '/api-de-dados/emendas/documentos/77',
      { pagina: 2 },
      undefined,
    );
  });

  it('renúncias fiscais e recursos de apoio', async () => {
    const { get, api } = criarApi();
    await api.renuncias.valor({ nomeSiglaUF: 'SP' });
    await api.renuncias.imunesIsentas({ cnpj: '11222333000181' });
    await api.renuncias.habilitadas();
    await api.permissionarios.listar();
    await api.imoveis.listar({ situacao: 'ATIVO' });
    await api.acordosLeniencia.listar();
    expect(get).toHaveBeenNthCalledWith(
      1,
      '/api-de-dados/renuncias-valor',
      { nomeSiglaUF: 'SP', pagina: 1 },
      undefined,
    );
    expect(get).toHaveBeenNthCalledWith(
      2,
      '/api-de-dados/renuncias-fiscais-empresas-imunes-isentas',
      { cnpj: '11222333000181', pagina: 1 },
      undefined,
    );
    expect(get).toHaveBeenNthCalledWith(
      3,
      '/api-de-dados/renuncias-fiscais-empresas-habilitadas-beneficios-fiscais',
      { pagina: 1 },
      undefined,
    );
    expect(get).toHaveBeenNthCalledWith(
      4,
      '/api-de-dados/permissionarios',
      { pagina: 1 },
      undefined,
    );
    expect(get).toHaveBeenNthCalledWith(
      5,
      '/api-de-dados/imoveis',
      { situacao: 'ATIVO', pagina: 1 },
      undefined,
    );
    expect(get).toHaveBeenNthCalledWith(
      6,
      '/api-de-dados/acordos-leniencia',
      { pagina: 1 },
      undefined,
    );
  });

  it('valida parâmetros obrigatórios dos novos endpoints antes da requisição', () => {
    const { get, api } = criarApi();
    expect(() => api.contratos.porProcesso('')).toThrow(/processo/);
    expect(() => api.contratos.termoAditivo(undefined as unknown as number)).toThrow(/id/);
    expect(() =>
      api.licitacoes.porUgModalidadeNumero({ codigoUG: '1', numero: '', codigoModalidade: '1' }),
    ).toThrow(/numero/);
    expect(() => api.despesas.porOrgao({} as { ano: number })).toThrow(/ano/);
    expect(() => api.despesas.empenhosImpactados('ABC', undefined as unknown as number)).toThrow(
      /fase/,
    );
    expect(() => api.pessoas.juridica('')).toThrow(/cnpj/);
    expect(get).not.toHaveBeenCalled();
  });
});
