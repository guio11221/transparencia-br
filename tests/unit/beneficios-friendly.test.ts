import { describe, expect, it, vi } from 'vitest';
import { BeneficiosService } from '../../src/modules/beneficios/services/beneficios.service.js';

describe('benefícios amigáveis', () => {
  it('converte CPF e mês para o formato da API', async () => {
    const get = vi.fn().mockResolvedValue([]);
    await new BeneficiosService({ get }).bolsaFamilia({ cpf: '123.456.789-01', mes: '2026-01' });
    expect(get).toHaveBeenCalledWith(
      '/api-de-dados/bolsa-familia-disponivel-por-cpf-ou-nis',
      { pagina: 1, codigo: '12345678901', mesAno: 202601 },
      undefined,
    );
  });
  it('impede CPF em programa que só aceita NIS', () => {
    const get = vi.fn();
    expect(() => new BeneficiosService({ get }).novoBolsaFamilia({ cpf: '12345678901' })).toThrow(
      'somente NIS',
    );
    expect(get).not.toHaveBeenCalled();
  });
  it('retorna resultado separado por programa mesmo se houver falha', async () => {
    const get = vi
      .fn()
      .mockResolvedValueOnce([{ id: 1 }])
      .mockRejectedValueOnce(new Error('indisponível'));
    const result = await new BeneficiosService({ get }).consultar({
      nis: '12345678901',
      programas: ['bpc', 'peti'],
    });
    expect(result[0]).toEqual({ programa: 'bpc', status: 'sucesso', dados: [{ id: 1 }] });
    expect(result[1]).toEqual({
      programa: 'peti',
      status: 'erro',
      erro: { mensagem: 'indisponível' },
    });
  });
  it('rejeita dois identificadores no mesmo filtro', () => {
    const get = vi.fn();
    expect(() =>
      new BeneficiosService({ get }).bpc({ cpf: '12345678901', nis: '12345678901' }),
    ).toThrow();
  });
});
