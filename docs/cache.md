# Cache TTL

Por padrão `cache.enabled = false`, para não reter CPF/NIS e dados de benefícios em memória sem decisão explícita do aplicativo.

```ts
const api = new Transparencia({
  apiKey: process.env.PORTAL_API_KEY!,
  cache: { enabled: true, ttlMs: 30_000, maxEntries: 500 },
});
```

Cache é local por instância, limitada por quantidade de entradas e baseada na URL+query; não armazena em disco e só armazena respostas HTTP bem-sucedidas. Quando se fornece `signal`, cache e desduplicação são ignorados para manter cancelamento isolado. Em produção implemente controle de autorização, minimização de dados e estratégia de retenção compatível com a LGPD; em geral não cacheie consultas nominais de beneficiários.

Para limpar o cache explicitamente em uso avançado, crie e retenha a instância `FetchHttpClient` e invoque `clearCache()`.
