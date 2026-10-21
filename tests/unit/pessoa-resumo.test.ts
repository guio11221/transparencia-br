import { describe, expect, it, vi } from 'vitest';
import {
  Transparencia,
  TIPOS_CARTAO,
  ROTULOS_TIPOS_CARTAO,
  PortalApiError,
  secoesResumo,
} from '../../src/index.js';

const criarApi = (get = vi.fn().mockResolvedValue([])) => ({
  get,
  api: new Transparencia({ apiKey: 'test', httpClient: { get } }),
});

describe('beneficios.porPessoa', () => {
  it('consulta todos os programas aceitos com CPF', async () => {
    const { get, api } = criarApi();
    const resultados = await api.beneficios.porPessoa({ cpf: '12345678901' });
    expect(resultados).toHaveLength(6);
    expect(resultados.every((r) => r.status === 'sucesso')).toBe(true);
    expect(get).toHaveBeenCalledTimes(6);
    const caminhos = get.mock.calls.map((call) => call[0]);
    expect(caminhos).toEqual([
      '/api-de-dados/bolsa-familia-disponivel-por-cpf-ou-nis',
      '/api-de-dados/auxilio-emergencial-por-cpf-ou-nis',
      '/api-de-dados/bpc-por-cpf-ou-nis',
      '/api-de-dados/seguro-defeso-codigo',
      '/api-de-dados/safra-codigo-por-cpf-ou-nis',
      '/api-de-dados/peti-por-cpf-ou-nis',
    ]);
    for (const call of get.mock.calls) {
      expect(call[1]).toEqual({ codigo: '12345678901', pagina: 1 });
    }
  });

  it('consulta os 9 programas com NIS (inclusive os que só aceitam NIS)', async () => {
    const { get, api } = criarApi();
    const resultados = await api.beneficios.porPessoa({ nis: '12345678901' });
    expect(resultados).toHaveLength(9);
    expect(resultados.every((r) => r.status === 'sucesso')).toBe(true);
    const porPrograma = new Map(
      get.mock.calls.map((call) => [call[0], call[1] as Record<string, unknown>]),
    );
    expect(porPrograma.get('/api-de-dados/bolsa-familia-sacado-por-nis')).toEqual({
      nis: '12345678901',
      pagina: 1,
    });
    expect(porPrograma.get('/api-de-dados/novo-bolsa-familia-sacado-por-nis')).toEqual({
      nis: '12345678901',
      pagina: 1,
    });
    expect(porPrograma.get('/api-de-dados/auxilio-brasil-sacado-por-nis')).toEqual({
      nis: '12345678901',
      pagina: 1,
    });
    expect(porPrograma.get('/api-de-dados/bolsa-familia-disponivel-por-cpf-ou-nis')).toEqual({
      codigo: '12345678901',
      pagina: 1,
    });
  });

  it('prefere CPF quando informa os dois identificadores', async () => {
    const { get, api } = criarApi();
    const resultados = await api.beneficios.porPessoa({
      cpf: '12345678901',
      nis: '99999999999',
    });
    expect(resultados).toHaveLength(9);
    const queNaoSaoSoNis = get.mock.calls.filter(
      (call) => !String(call[0]).includes('sacado-por-nis'),
    );
    for (const call of queNaoSaoSoNis) {
      expect(call[1]).toEqual({ codigo: '12345678901', pagina: 1 });
    }
    expect(queNaoSaoSoNis).toHaveLength(6);
    const nisOnly = get.mock.calls.filter((call) => String(call[0]).includes('sacado-por-nis'));
    expect(nisOnly).toHaveLength(3);
    for (const call of nisOnly) {
      expect(call[1]).toEqual({ nis: '99999999999', pagina: 1 });
    }
  });

  it('agrega erros parciais por programa', async () => {
    const get = vi
      .fn()
      .mockImplementation((path: string) =>
        path.includes('bpc')
          ? Promise.reject(new PortalApiError('serviço fora do ar', 503))
          : Promise.resolve([]),
      );
    const { api } = criarApi(get);
    const resultados = await api.beneficios.porPessoa({ cpf: '12345678901' });
    const bpc = resultados.find((r) => r.programa === 'bpc');
    expect(bpc).toMatchObject({
      status: 'erro',
      erro: { mensagem: 'serviço fora do ar', status: 503 },
    });
    expect(resultados.filter((r) => r.status === 'sucesso')).toHaveLength(5);
  });

  it('valida o identificador antes de consultar', () => {
    const { get, api } = criarApi();
    expect(() => api.beneficios.porPessoa({})).toThrow(/cpf ou nis/);
    expect(() => api.beneficios.porPessoa({ cpf: '123' })).toThrow(/11 dígitos/);
    expect(get).not.toHaveBeenCalled();
  });
});

describe('pessoas.resumo', () => {
  it('monta todas as seções para CPF', async () => {
    const { get, api } = criarApi();
    const resumo = await api.pessoas.resumo({ cpf: '12345678901' });
    expect(Object.keys(resumo).sort()).toEqual([
      'beneficios',
      'cartoes',
      'ceaf',
      'ceis',
      'cnep',
      'contratos',
      'peps',
      'pessoa',
      'viagens',
    ]);
    expect(resumo.pessoa.status).toBe('sucesso');
    expect(resumo.beneficios.status).toBe('sucesso');
    if (resumo.beneficios.status === 'sucesso') {
      expect(resumo.beneficios.dados).toHaveLength(6);
    }
    const consultas = get.mock.calls.map((call) => [call[0], call[1]]);
    expect(consultas).toContainEqual(['/api-de-dados/pessoa-fisica', { cpf: '12345678901' }]);
    expect(consultas).toContainEqual([
      '/api-de-dados/cartoes',
      { cpfPortador: '12345678901', pagina: 1 },
    ]);
    expect(consultas).toContainEqual([
      '/api-de-dados/viagens-por-cpf',
      { cpf: '12345678901', pagina: 1 },
    ]);
    expect(consultas).toContainEqual([
      '/api-de-dados/contratos/cpf-cnpj',
      { cpfCnpj: '12345678901', pagina: 1 },
    ]);
    expect(consultas).toContainEqual(['/api-de-dados/peps', { cpf: '12345678901', pagina: 1 }]);
    expect(consultas).toContainEqual([
      '/api-de-dados/ceis',
      { codigoSancionado: '12345678901', pagina: 1 },
    ]);
    expect(consultas).toContainEqual([
      '/api-de-dados/cnep',
      { codigoSancionado: '12345678901', pagina: 1 },
    ]);
    expect(consultas).toContainEqual([
      '/api-de-dados/ceaf',
      { cpfSancionado: '12345678901', pagina: 1 },
    ]);
  });

  it('com NIS só consulta pessoa e benefícios', async () => {
    const { get, api } = criarApi();
    const resumo = await api.pessoas.resumo({ nis: '12345678901' });
    expect(Object.keys(resumo).sort()).toEqual(['beneficios', 'pessoa']);
    expect(resumo.cartoes).toBeUndefined();
    expect(resumo.pessoa.status).toBe('sucesso');
    expect(get).toHaveBeenCalledWith(
      '/api-de-dados/pessoa-fisica',
      { nis: '12345678901' },
      undefined,
    );
    expect(get).toHaveBeenCalledTimes(1 + 9);
  });

  it('não falha a consulta inteira quando uma seção dá erro', async () => {
    const get = vi
      .fn()
      .mockImplementation((path: string) =>
        path === '/api-de-dados/peps'
          ? Promise.reject(new PortalApiError('403 negado', 403))
          : Promise.resolve([]),
      );
    const { api } = criarApi(get);
    const resumo = await api.pessoas.resumo({ cpf: '12345678901' });
    expect(resumo.pessoa.status).toBe('sucesso');
    expect(resumo.peps).toEqual({
      status: 'erro',
      erro: { mensagem: '403 negado', status: 403 },
    });
    expect(resumo.cartoes?.status).toBe('sucesso');
  });

  it('valida o identificador antes de consultar', () => {
    const { get, api } = criarApi();
    expect(() => api.pessoas.resumo({})).toThrow(/cpf ou nis/);
    expect(get).not.toHaveBeenCalled();
  });

  it('secoesResumo itera apenas as seções presentes com a chave correta', async () => {
    const { api } = criarApi();
    const resumo = await api.pessoas.resumo({ nis: '12345678901' });
    const entradas = secoesResumo(resumo);
    expect(entradas.map((e) => e.chave).sort()).toEqual(['beneficios', 'pessoa']);
    for (const { chave, secao } of entradas) {
      expect(chave).toBeTruthy();
      expect(secao.status).toBe('sucesso');
      if (secao.status === 'erro') throw new Error(`seção ${chave} falhou`);
      expect(secao.dados).toBeDefined();
    }
  });
});

describe('cartões (vales e cartões governamentais)', () => {
  it('expõe os tipos de cartão com rótulos', () => {
    expect(TIPOS_CARTAO).toEqual({ cpgf: 1, cpcc: 2, cpdc: 3 });
    expect(ROTULOS_TIPOS_CARTAO[TIPOS_CARTAO.cpgf]).toMatch(/CPGF/);
    expect(ROTULOS_TIPOS_CARTAO[TIPOS_CARTAO.cpcc]).toMatch(/CPCC/);
    expect(ROTULOS_TIPOS_CARTAO[TIPOS_CARTAO.cpdc]).toMatch(/CPDC/);
  });

  it('consultas por portador, favorecido, órgão, tipo e períodos', async () => {
    const { get, api } = criarApi();
    await api.cartoes.porPortador('12345678901');
    await api.cartoes.porFavorecido('11222333000181', { pagina: 2 });
    await api.cartoes.porOrgao('21000');
    await api.cartoes.porTipo(TIPOS_CARTAO.cpcc);
    await api.cartoes.porPeriodoTransacao('01/01/2024', '31/01/2024');
    await api.cartoes.porPeriodoExtrato('202401', '202412', { codigoOrgao: '21000' });
    expect(get).toHaveBeenNthCalledWith(
      1,
      '/api-de-dados/cartoes',
      { cpfPortador: '12345678901', pagina: 1 },
      undefined,
    );
    expect(get).toHaveBeenNthCalledWith(
      2,
      '/api-de-dados/cartoes',
      { cpfCnpjFavorecido: '11222333000181', pagina: 2 },
      undefined,
    );
    expect(get).toHaveBeenNthCalledWith(
      3,
      '/api-de-dados/cartoes',
      { codigoOrgao: '21000', pagina: 1 },
      undefined,
    );
    expect(get).toHaveBeenNthCalledWith(
      4,
      '/api-de-dados/cartoes',
      { tipoCartao: 2, pagina: 1 },
      undefined,
    );
    expect(get).toHaveBeenNthCalledWith(
      5,
      '/api-de-dados/cartoes',
      { dataTransacaoInicio: '01/01/2024', dataTransacaoFim: '31/01/2024', pagina: 1 },
      undefined,
    );
    expect(get).toHaveBeenNthCalledWith(
      6,
      '/api-de-dados/cartoes',
      { mesExtratoInicio: '202401', mesExtratoFim: '202412', codigoOrgao: '21000', pagina: 1 },
      undefined,
    );
  });

  it('valida tipo de cartão antes de consultar', () => {
    const { get, api } = criarApi();
    expect(() => api.cartoes.porTipo(9 as 1)).toThrow(/tipoCartao inválido/);
    expect(get).not.toHaveBeenCalled();
  });
});
