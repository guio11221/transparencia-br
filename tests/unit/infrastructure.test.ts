import { describe, it, expect, vi } from 'vitest';
import { FetchHttpClient } from '../../src/core/http/fetch-http-client.js';
import { TtlCache } from '../../src/core/http/ttl-cache.js';
import { RequestScheduler } from '../../src/core/http/request-scheduler.js';
import { collectPages, paginate } from '../../src/core/pagination/paginator.js';

describe('Infraestrutura v0.4', () => {
  it('cacheia respostas GET e suporta limpeza manual', async () => {
    const fetchImpl = vi
      .fn()
      .mockImplementation(async () => new Response(JSON.stringify([{ id: 1 }]), { status: 200 }));
    const http = new FetchHttpClient({
      apiKey: 'test',
      retries: 0,
      cache: { enabled: true, ttlMs: 2000 },
      fetchImpl,
    });
    expect(await http.get('/api-de-dados/servidores')).toEqual([{ id: 1 }]);
    expect(await http.get('/api-de-dados/servidores')).toEqual([{ id: 1 }]);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    http.clearCache();
    await http.get('/api-de-dados/servidores');
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });
  it('não faz cache de HTTP 4xx', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response('Proibido', { status: 403 }));
    const http = new FetchHttpClient({
      apiKey: 'test',
      retries: 0,
      cache: { enabled: true },
      fetchImpl,
    });
    await expect(http.get('/api-de-dados/servidores')).rejects.toThrow();
    await expect(http.get('/api-de-dados/servidores')).rejects.toThrow();
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });
  it('itera páginas até a resposta vazia', async () => {
    const load = vi.fn(async (page: number) => (page <= 2 ? [page] : []));
    expect(await collectPages(paginate(load))).toEqual([1, 2]);
    expect(load).toHaveBeenCalledTimes(3);
  });
  it('impõe maxPaginas e maxItens', async () => {
    expect(
      await collectPages(
        paginate(async (page) => [page, page], { maxPaginas: 5 }),
        3,
      ),
    ).toEqual([1, 1, 2]);
  });
  it('aplica limite de concorrência', async () => {
    const scheduler = new RequestScheduler({ maxRequests: 10, windowMs: 1000, maxConcurrent: 1 });
    let running = 0;
    let peak = 0;
    const task = () =>
      scheduler.run(async () => {
        running++;
        peak = Math.max(peak, running);
        await new Promise((resolve) => setTimeout(resolve, 5));
        running--;
      });
    await Promise.all([task(), task(), task()]);
    expect(peak).toBe(1);
  });
  it('cache expira após TTL', async () => {
    vi.useFakeTimers();
    try {
      const cache = new TtlCache(100, 2);
      cache.set('a', 1);
      expect(cache.get('a')).toBe(1);
      vi.advanceTimersByTime(101);
      expect(cache.get('a')).toBeUndefined();
    } finally {
      vi.useRealTimers();
    }
  });
});
