import { describe, expect, it, vi } from 'vitest';
import { Transparencia } from '../../src/index.js';

describe('API pública', () => {
  it('padroniza listar, buscar, consultar e porId', async () => {
    const get = vi.fn().mockResolvedValue([]);
    const api = new Transparencia({ apiKey: 'test', httpClient: { get } });
    await api.servidores.buscar({ pagina: 2 });
    await api.contratos.listar({ codigoOrgao: '10001' });
    await api.licitacoes.consultar({ codigoOrgao: '10001', pagina: 3 });
    await api.convenios.porId(12);
    expect(get).toHaveBeenNthCalledWith(1, '/api-de-dados/servidores', { pagina: 2 }, undefined);
    expect(get).toHaveBeenNthCalledWith(
      2,
      '/api-de-dados/contratos',
      { codigoOrgao: '10001', pagina: 1 },
      undefined,
    );
    expect(get).toHaveBeenNthCalledWith(
      3,
      '/api-de-dados/licitacoes',
      { codigoOrgao: '10001', pagina: 3 },
      undefined,
    );
    expect(get).toHaveBeenNthCalledWith(4, '/api-de-dados/convenios/id', { id: 12 }, undefined);
  });

  it('falha antes da requisição quando falta parâmetro obrigatório', () => {
    const get = vi.fn().mockResolvedValue([]);
    const api = new Transparencia({ apiKey: 'test', httpClient: { get } });
    expect(() => api.contratos.listar()).toThrow(/codigoOrgao/);
    expect(() => api.licitacoes.listar({ pagina: 1 })).toThrow(/codigoOrgao/);
    expect(() => api.remuneracoes.listar()).toThrow(/mesAno/);
    expect(() => api.viagens.listar({ codigoOrgao: '10001' })).toThrow(/dataIdaDe/);
    expect(() => api.consultas.consultar('contratosPorCpfCnpj', {})).toThrow(/cpfCnpj/);
    expect(get).not.toHaveBeenCalled();
  });

  it('propaga o erro de validação na primeira página do paginador', async () => {
    const get = vi.fn().mockResolvedValue([]);
    const api = new Transparencia({ apiKey: 'test', httpClient: { get } });
    const paginas = api.contratos.paginas({}, { maxPaginas: 5 });
    await expect(paginas.next()).rejects.toThrow(/codigoOrgao/);
    expect(get).not.toHaveBeenCalled();
  });

  it('aceita recursos sem parâmetros obrigatórios além da página', async () => {
    const get = vi.fn().mockResolvedValue([]);
    const api = new Transparencia({ apiKey: 'test', httpClient: { get } });
    await api.sancoes.ceis.listar();
    await api.cartoes.listar({ tipoCartao: 1 });
    await api.peps.listar({ cpf: '12345678901' });
    expect(get).toHaveBeenNthCalledWith(1, '/api-de-dados/ceis', { pagina: 1 }, undefined);
    expect(get).toHaveBeenNthCalledWith(
      2,
      '/api-de-dados/cartoes',
      { tipoCartao: 1, pagina: 1 },
      undefined,
    );
    expect(get).toHaveBeenNthCalledWith(
      3,
      '/api-de-dados/peps',
      { cpf: '12345678901', pagina: 1 },
      undefined,
    );
  });
});
