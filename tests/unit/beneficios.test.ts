import { describe, expect, it, vi } from 'vitest';
import { BeneficiosService } from '../../src/modules/beneficios/services/beneficios.service.js';
describe('BeneficiosService', () => {
  it('normaliza CPF e envia a consulta ao endpoint correto', async () => {
    const get = vi.fn().mockResolvedValue([]);
    const service = new BeneficiosService({ get });
    await service.bpc({ codigo: '123.456.789-01', mesAno: 202601 });
    expect(get).toHaveBeenCalledWith(
      '/api-de-dados/bpc-por-cpf-ou-nis',
      { codigo: '12345678901', mesAno: 202601, pagina: 1 },
      undefined,
    );
  });
  it('rejeita identificadores inválidos', () => {
    const service = new BeneficiosService({ get: vi.fn() });
    expect(() => service.bpc({ codigo: '123' })).toThrow();
  });
  it('consulta NIS em endpoint de saque', async () => {
    const get = vi.fn().mockResolvedValue([]);
    await new BeneficiosService({ get }).novoBolsaFamilia('12345678901');
    expect(get).toHaveBeenCalledWith(
      '/api-de-dados/novo-bolsa-familia-sacado-por-nis',
      { nis: '12345678901', pagina: 1 },
      undefined,
    );
  });
});
