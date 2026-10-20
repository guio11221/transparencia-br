import { describe, expect, it, vi } from 'vitest';
import { FetchHttpClient } from '../../src/core/http/fetch-http-client.js';
import { PortalApiError } from '../../src/core/errors/portal-api.error.js';
describe('FetchHttpClient', () => {
  it('envia token e parâmetros', async () => {
    const mock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify([{ codigo: '1' }]), { status: 200 }));
    const http = new FetchHttpClient({ apiKey: 'token', fetchImpl: mock, retries: 0 });
    expect(await http.get('/api-de-dados/orgaos-siafi', { pagina: 1 })).toEqual([{ codigo: '1' }]);
    const [url, init] = mock.mock.calls[0];
    expect(String(url)).toContain('pagina=1');
    expect(init.headers['chave-api-dados']).toBe('token');
  });
  it('propaga erro HTTP com status', async () => {
    const http = new FetchHttpClient({
      apiKey: 'token',
      fetchImpl: vi.fn().mockResolvedValue(new Response('sem autorização', { status: 403 })),
      retries: 0,
    });
    await expect(http.get('/api-de-dados/orgaos-siafi')).rejects.toBeInstanceOf(PortalApiError);
  });
});
