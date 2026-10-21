import { describe, expect, it, vi } from 'vitest';
import {
  Transparencia,
  catalogoEndpoints,
  buscarEndpoints,
  endpoints,
  EndpointsService,
  ConsultasService,
  type DominioEndpoint,
} from '../../src/index.js';

const criarApi = () => {
  const get = vi.fn().mockResolvedValue([]);
  return { get, api: new Transparencia({ apiKey: 'test', httpClient: { get } }) };
};

const chavesDeEndpoints = Object.keys(endpoints);

describe('Catálogo de endpoints', () => {
  it('cobre todos os endpoints expostos', () => {
    const catalogadas = catalogoEndpoints.map((e) => e.recurso).sort();
    expect(catalogadas).toEqual([...chavesDeEndpoints].sort());
  });

  it('cada entrada tem metadados completos e caminho consistente', () => {
    for (const info of catalogoEndpoints) {
      expect(info.titulo.length).toBeGreaterThan(0);
      expect(info.descricao.length).toBeGreaterThan(0);
      expect(info.caminho).toBe(endpoints[info.recurso]);
      expect(info.caminho.startsWith('/api-de-dados/')).toBe(true);
      expect(info.tags.length).toBeGreaterThan(0);
    }
  });

  it('expõe o catálogo inteiro sem termo', () => {
    const { api } = criarApi();
    expect(api.endpoints.listar()).toHaveLength(catalogoEndpoints.length);
  });

  it('filtra por domínio', () => {
    const { api } = criarApi();
    const sancoes = api.endpoints.listar('sancoes');
    expect(sancoes.length).toBeGreaterThan(0);
    expect(sancoes.every((e) => e.dominio === 'sancoes')).toBe(true);
  });

  it('busca por texto, ignorando acentos e caixa', () => {
    const { api } = criarApi();
    const comAcento = api.endpoints.buscar('benefício');
    const semAcento = api.endpoints.buscar('BENEFICIO');
    expect(comAcento.map((e) => e.recurso).sort()).toEqual(semAcento.map((e) => e.recurso).sort());
    expect(comAcento.length).toBeGreaterThan(0);
  });

  it('busca encontra cartões e PETI', () => {
    const { api } = criarApi();
    expect(api.endpoints.buscar('cartao').map((e) => e.recurso)).toContain('cartoes');
    expect(api.endpoints.buscar('trabalho infantil').map((e) => e.recurso)).toContain(
      'petiPorCpfOuNis',
    );
  });

  it('busca combina termos de forma aditiva, restringindo o resultado', () => {
    const { api } = criarApi();
    const soMunicipio = api.endpoints.buscar('municipio');
    const municipioBpc = api.endpoints.buscar('municipio bpc');
    expect(municipioBpc.length).toBeGreaterThan(0);
    expect(municipioBpc.length).toBeLessThan(soMunicipio.length);
    expect(municipioBpc.every((e) => e.recurso.toLowerCase().includes('bpc'))).toBe(true);
  });

  it('busca pode ser restrita a um domínio', () => {
    const { api } = criarApi();
    const resultados = api.endpoints.buscar('municipio', 'beneficios');
    expect(resultados.every((e) => e.dominio === 'beneficios')).toBe(true);
  });

  it('descreve um endpoint pelo recurso e devolve undefined quando não existe', () => {
    const { api } = criarApi();
    const info = api.endpoints.descrever('ceis');
    expect(info?.recurso).toBe('ceis');
    expect(info?.parametros.some((p) => p.nome === 'nomeSancionado')).toBe(true);
    expect(api.endpoints.descrever('nao-existe')).toBeUndefined();
  });

  it('lista domínios distintos em ordem alfabética', () => {
    const { api } = criarApi();
    const dominios = api.endpoints.dominios();
    expect(dominios).toEqual([...dominios].sort());
    expect(dominios).toContain<DominioEndpoint>('beneficios');
    expect(dominios).toContain<DominioEndpoint>('sancoes');
  });

  it('devolve cópia defensiva do catálogo e dos parâmetros', () => {
    const { api } = criarApi();
    const catalogo = api.endpoints.listar();
    catalogo[0]!.titulo = 'alterado';
    catalogo[0]!.parametros.push({ nome: 'x', obrigatorio: false, descricao: 'x' });
    const novamente = api.endpoints.listar();
    expect(novamente[0]!.titulo).not.toBe('alterado');
    expect(novamente[0]!.parametros).not.toContainEqual({ nome: 'x' });
  });

  it('executa qualquer endpoint do catálogo com validação', async () => {
    const { get, api } = criarApi();
    await api.endpoints.consultar('peps', { nome: 'Silva' });
    expect(get).toHaveBeenCalledWith('/api-de-dados/peps', { nome: 'Silva', pagina: 1 }, undefined);
    expect(() => api.endpoints.consultar('peps', { pagina: 0 })).toThrow(/pagina/);
  });

  it('nunca injeta pagina em endpoints de registro único', async () => {
    const unicos = catalogoEndpoints.filter((e) => e.registroUnico);
    expect(unicos.length).toBeGreaterThan(0);
    expect(unicos.some((e) => e.recurso === 'pessoaFisica')).toBe(true);
    for (const info of unicos) expect(info.paginado).toBe(false);

    const get = vi.fn().mockResolvedValue({});
    const consultas = new ConsultasService({ get });
    await consultas.consultarUm('pessoaFisica', { cpf: '12345678901' });
    expect(get).toHaveBeenCalledWith(
      '/api-de-dados/pessoa-fisica',
      { cpf: '12345678901' },
      undefined,
    );
  });
});

describe('Novas rotas por id', () => {
  it('busca por id em servidores, viagens, licitações e sanções', async () => {
    const { get, api } = criarApi();
    await api.servidores.porId(11);
    await api.viagens.porId(22);
    await api.licitacoes.porId(33);
    await api.sancoes.ceis.porId(44);
    await api.sancoes.cnep.porId(45);
    await api.sancoes.ceaf.porId(46);
    await api.sancoes.cepim.porId(47);
    await api.acordosLeniencia.porId(48);
    const caminhos = [
      '/api-de-dados/servidores/11',
      '/api-de-dados/viagens/22',
      '/api-de-dados/licitacoes/33',
      '/api-de-dados/ceis/44',
      '/api-de-dados/cnep/45',
      '/api-de-dados/ceaf/46',
      '/api-de-dados/cepim/47',
      '/api-de-dados/acordos-leniencia/48',
    ];
    caminhos.forEach((caminho, i) => {
      expect(get).toHaveBeenNthCalledWith(i + 1, caminho, {}, undefined);
    });
  });
});

describe('Novos recursos', () => {
  it('órgãos SIAFI/SIAPE via consultas e serviço de órgãos', async () => {
    const { get, api } = criarApi();
    await api.orgaos.siafi(1);
    await api.orgaos.siape(2);
    await api.consultas.consultar('orgaosSiafi', { codigo: '20000' });
    expect(get).toHaveBeenNthCalledWith(1, '/api-de-dados/orgaos-siafi', { pagina: 1 });
    expect(get).toHaveBeenNthCalledWith(2, '/api-de-dados/orgaos-siape', { pagina: 2 });
    expect(get).toHaveBeenNthCalledWith(
      3,
      '/api-de-dados/orgaos-siafi',
      { codigo: '20000', pagina: 1 },
      undefined,
    );
  });

  it('situação de imóvel e coronavirus', async () => {
    const { get, api } = criarApi();
    await api.consultas.consultar('situacaoImovel', { cpfOcupante: '12345678901' });
    await api.consultas.consultar('coronavirusTransferencias', { mesAno: 202004 });
    await api.consultas.consultar('coronavirusMovimentoLiquido', { mesAnoLancamento: 202004 });
    expect(get).toHaveBeenNthCalledWith(
      1,
      '/api-de-dados/situacao-imovel',
      { cpfOcupante: '12345678901', pagina: 1 },
      undefined,
    );
    expect(get).toHaveBeenNthCalledWith(
      2,
      '/api-de-dados/coronavirus/transferencias',
      { mesAno: 202004, pagina: 1 },
      undefined,
    );
    expect(get).toHaveBeenNthCalledWith(
      3,
      '/api-de-dados/coronavirus/movimento-liquido-despesa',
      { mesAnoLancamento: 202004, pagina: 1 },
      undefined,
    );
  });
});

describe('Benefícios: variantes por município e CPF ou NIS', () => {
  it('beneficiários por município valida o código IBGE', async () => {
    const { get, api } = criarApi();
    await api.beneficios.beneficiariosPorMunicipio('bolsa-familia-disponivel', '3550308', 202401);
    expect(get).toHaveBeenCalledWith(
      '/api-de-dados/bolsa-familia-disponivel-beneficiario-por-municipio',
      { codigoIbge: '3550308', mesAno: 202401, pagina: 1 },
    );
    expect(() => api.beneficios.beneficiariosPorMunicipio('bpc', '123', 202401)).toThrow();
  });

  it('consulta programas sacados por CPF ou NIS via catálogo de endpoints', async () => {
    const { get, api } = criarApi();
    await api.consultas.consultar('bolsaFamiliaSacadoPorCpfOuNis', { codigo: '12345678901' });
    await api.consultas.consultar('auxilioEmergencialPorCpfOuNis', {
      codigoBeneficiario: '12345678901',
    });
    expect(get).toHaveBeenNthCalledWith(
      1,
      '/api-de-dados/bolsa-familia-sacado-por-cpf-ou-nis',
      { codigo: '12345678901', pagina: 1 },
      undefined,
    );
    expect(get).toHaveBeenNthCalledWith(
      2,
      '/api-de-dados/auxilio-emergencial-por-cpf-ou-nis',
      { codigoBeneficiario: '12345678901', pagina: 1 },
      undefined,
    );
  });
});

describe('EndpointsService isolado', () => {
  it('funciona com ConsultasService direto', async () => {
    const get = vi.fn().mockResolvedValue([]);
    const servico = new EndpointsService(new ConsultasService({ get }));
    expect(servico.buscar('cartao').length).toBeGreaterThan(0);
    await servico.consultar('cartoes', { cpfPortador: '12345678901' });
    expect(get).toHaveBeenCalledWith(
      '/api-de-dados/cartoes',
      { cpfPortador: '12345678901', pagina: 1 },
      undefined,
    );
  });
});

describe('buscarEndpoints (função pura)', () => {
  it('sem termo devolve o catálogo completo', () => {
    expect(buscarEndpoints()).toHaveLength(catalogoEndpoints.length);
    expect(buscarEndpoints('', 'sancoes').every((e) => e.dominio === 'sancoes')).toBe(true);
  });

  it('encontra por nome de parâmetro', () => {
    const resultados = buscarEndpoints('chaveUnicaNotaFiscal');
    expect(resultados.map((e) => e.recurso)).toContain('notasFiscaisPorChave');
  });
});
