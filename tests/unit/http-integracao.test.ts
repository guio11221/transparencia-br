import { afterEach, describe, expect, it, vi } from 'vitest';
import { FetchHttpClient } from '../../src/core/http/fetch-http-client.js';
import { PortalApiError } from '../../src/core/errors/portal-api.error.js';
import { Transparencia } from '../../src/index.js';

const json = (body: unknown, status = 200, headers?: Record<string, string>) =>
  new Response(JSON.stringify(body), { status, headers });

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('FetchHttpClient (integração com fetch falso)', () => {
  it('deduplica requisições em voo com cache habilitado', async () => {
    let resolver!: (r: Response) => void;
    const fetcher = vi.fn().mockReturnValue(
      new Promise<Response>((resolve) => {
        resolver = resolve;
      }),
    );
    const http = new FetchHttpClient({
      apiKey: 'k',
      fetchImpl: fetcher as unknown as typeof fetch,
      retries: 0,
      cache: { enabled: true, ttlMs: 1000 },
    });
    const a = http.get('/api-de-dados/peps', { nome: 'Silva' });
    const b = http.get('/api-de-dados/peps', { nome: 'Silva' });
    resolver(json([{ id: 1 }]));
    const [ra, rb] = await Promise.all([a, b]);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(ra).toEqual([{ id: 1 }]);
    expect(rb).toBe(ra);
  });

  it('serve do cache sem nova chamada de rede', async () => {
    const fetcher = vi.fn().mockResolvedValue(json([{ id: 1 }]));
    const http = new FetchHttpClient({
      apiKey: 'k',
      fetchImpl: fetcher as unknown as typeof fetch,
      retries: 0,
      cache: { enabled: true, ttlMs: 60000 },
    });
    const primeira = await http.get('/api-de-dados/peps', { nome: 'Silva' });
    const segunda = await http.get('/api-de-dados/peps', { nome: 'Silva' });
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(segunda).toEqual(primeira);
  });

  it('quando o cache está desabilitado, repete a chamada de rede', async () => {
    const fetcher = vi.fn().mockImplementation(async () => json([{ id: 1 }]));
    const http = new FetchHttpClient({
      apiKey: 'k',
      fetchImpl: fetcher as unknown as typeof fetch,
      retries: 0,
    });
    await http.get('/api-de-dados/peps', { nome: 'Silva' });
    await http.get('/api-de-dados/peps', { nome: 'Silva' });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('não faz cache quando há AbortSignal', async () => {
    const fetcher = vi.fn().mockImplementation(async () => json([{ id: 1 }]));
    const http = new FetchHttpClient({
      apiKey: 'k',
      fetchImpl: fetcher as unknown as typeof fetch,
      retries: 0,
      cache: { enabled: true, ttlMs: 60000 },
    });
    const signal = new AbortController().signal;
    await http.get('/api-de-dados/peps', { nome: 'Silva' }, signal);
    await http.get('/api-de-dados/peps', { nome: 'Silva' }, signal);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('repassa o motivo do abort do usuário após esgotar tentativas', async () => {
    const fetcher = vi.fn().mockImplementation(async () => new Response('', { status: 429 }));
    const http = new FetchHttpClient({
      apiKey: 'k',
      fetchImpl: fetcher as unknown as typeof fetch,
      retries: 1,
    });
    const controller = new AbortController();
    const promessa = http.get('/api-de-dados/peps', {}, controller.signal).catch((e) => e);
    controller.abort(new Error('usuário cancelou'));
    const erro = await promessa;
    expect(erro).toBeInstanceOf(Error);
  });
});

describe('Retries e backoff', () => {
  it('tenta novamente em 429 e obtém sucesso', async () => {
    vi.useFakeTimers();
    const fetcher = vi
      .fn()
      .mockImplementationOnce(async () => json({}, 429, { 'retry-after': '0' }))
      .mockImplementationOnce(async () => json([{ id: 1 }]));
    const http = new FetchHttpClient({
      apiKey: 'k',
      fetchImpl: fetcher as unknown as typeof fetch,
      retries: 2,
    });
    const promessa = http.get('/api-de-dados/peps');
    await vi.runAllTimersAsync();
    expect(await promessa).toEqual([{ id: 1 }]);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('tenta novamente em 5xx e desiste após o limite', async () => {
    vi.useFakeTimers();
    const fetcher = vi.fn().mockImplementation(async () => new Response('erro', { status: 500 }));
    const http = new FetchHttpClient({
      apiKey: 'k',
      fetchImpl: fetcher as unknown as typeof fetch,
      retries: 2,
    });
    const promessa = http.get('/api-de-dados/peps');
    const assercao = expect(promessa).rejects.toBeInstanceOf(PortalApiError);
    await vi.runAllTimersAsync();
    await assercao;
    expect(fetcher).toHaveBeenCalledTimes(3);
  });

  it('não repete 4xx que não seja 429', async () => {
    const fetcher = vi
      .fn()
      .mockImplementation(async () => new Response('not found', { status: 404 }));
    const http = new FetchHttpClient({
      apiKey: 'k',
      fetchImpl: fetcher as unknown as typeof fetch,
      retries: 3,
    });
    await expect(http.get('/api-de-dados/peps')).rejects.toBeInstanceOf(PortalApiError);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('trata 204 como corpo vazio', async () => {
    const fetcher = vi.fn().mockImplementation(async () => new Response(null, { status: 204 }));
    const http = new FetchHttpClient({
      apiKey: 'k',
      fetchImpl: fetcher as unknown as typeof fetch,
      retries: 0,
    });
    expect(await http.get('/api-de-dados/peps')).toBeUndefined();
  });
});

describe('Rate limit na integração', () => {
  it('serializa requisições acima de maxConcurrent', async () => {
    let emVoo = 0;
    let pico = 0;
    const fetcher = vi.fn().mockImplementation(async () => {
      emVoo++;
      pico = Math.max(pico, emVoo);
      await Promise.resolve();
      emVoo--;
      return json([]);
    });
    const http = new FetchHttpClient({
      apiKey: 'k',
      fetchImpl: fetcher as unknown as typeof fetch,
      retries: 0,
      rateLimit: { maxConcurrent: 2, maxRequests: 100, windowMs: 60000 },
    });
    await Promise.all(
      Array.from({ length: 6 }, (_, i) => http.get('/api-de-dados/peps', { pagina: i + 1 })),
    );
    expect(fetcher).toHaveBeenCalledTimes(6);
    expect(pico).toBeLessThanOrEqual(2);
  });
});

describe('Wiring completo do cliente', () => {
  it('encaminha a chamada de um serviço por domínio até o fetch', async () => {
    const fetcher = vi.fn().mockResolvedValue(json([{ id: 1 }]));
    const api = new Transparencia({
      apiKey: 'k',
      fetchImpl: fetcher as unknown as typeof fetch,
      retries: 0,
    });
    const servidores = await api.servidores.listar({ pagina: 2 });
    expect(servidores).toEqual([{ id: 1 }]);
    const [url, init] = fetcher.mock.calls[0];
    expect(String(url)).toContain('/api-de-dados/servidores');
    expect(String(url)).toContain('pagina=2');
    expect(init.headers['chave-api-dados']).toBe('k');
  });

  it('expõe serviços, catálogo e métodos por id no cliente', async () => {
    const fetcher = vi.fn().mockResolvedValue(json([{ id: 1 }]));
    const api = new Transparencia({
      apiKey: 'k',
      fetchImpl: fetcher as unknown as typeof fetch,
      retries: 0,
    });
    expect(api.endpoints.buscar('cartao').length).toBeGreaterThan(0);
    await api.sancoes.ceis.porId(10);
    expect(String(fetcher.mock.calls[0][0])).toContain('/api-de-dados/ceis/10');
  });

  it('rejeita apiKey vazia na construção', () => {
    expect(() => new Transparencia({ apiKey: '  ' })).toThrow(/apiKey/);
  });
});
