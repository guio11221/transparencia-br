import { describe, expect, it } from 'vitest';
import { endpoints } from '../../src/index.js';

const SPEC_URL = 'https://api.portaldatransparencia.gov.br/v3/api-docs';

/** Normaliza um caminho oficial para comparação: remove a barra final e preserva `{id}`. */
const normalizar = (caminho: string): string => caminho.replace(/\/+$/, '');

/**
 * Teste de contrato contra o OpenAPI oficial do Portal.
 *
 * É um teste de rede: se o spec não estiver acessível (ambiente offline ou CI restrito),
 * a verificação é pulada em vez de falhar, para não tornar o build dependente de rede.
 * Quando acessível, garante que todo caminho usado pelo SDK ainda existe no spec — o que
 * detecta remoções/renomeações de endpoints pela API oficial.
 */
describe('Contrato com o OpenAPI oficial', () => {
  it('todos os caminhos da SDK existem no spec oficial', { timeout: 15000 }, async (ctx) => {
    let spec: { paths?: Record<string, unknown> };
    try {
      const resposta = await fetch(SPEC_URL, { signal: AbortSignal.timeout(8000) });
      if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
      spec = (await resposta.json()) as { paths?: Record<string, unknown> };
    } catch {
      ctx.skip();
      return;
    }

    const oficiais = new Set(Object.keys(spec.paths ?? {}).map(normalizar));
    expect(oficiais.size).toBeGreaterThan(0);

    const faltando = Object.entries(endpoints)
      .map(([recurso, caminho]) => ({ recurso, caminho: normalizar(caminho) }))
      .filter(({ caminho }) => !oficiais.has(caminho));

    expect(faltando).toEqual([]);
  });
});
