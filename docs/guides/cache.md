# Cache e privacidade

Por padrão, `cache.enabled = false` — o SDK **não retém** CPF/NIS nem dados de benefícios em memória sem decisão explícita.

```ts
const api = new Transparencia({
  apiKey: process.env.PORTAL_API_KEY!,
  cache: { enabled: true, ttlMs: 30_000, maxEntries: 500 },
});
```

## Como funciona

- Cache **local por instância**, chaveado por **URL + query**.
- **Em memória** apenas — não grava em disco.
- Só armazena **respostas HTTP bem-sucedidas**.
- Quando um `signal` é passado, cache e deduplicação são **ignorados** (para manter o cancelamento isolado).

## Limpeza manual

Para limpar em uso avançado, retenha o `FetchHttpClient` e chame `clearCache()`:

```ts
import { FetchHttpClient, Transparencia } from 'transparencia-br';

const http = new FetchHttpClient({ apiKey: process.env.PORTAL_API_KEY! });
const api = new Transparencia({ apiKey: process.env.PORTAL_API_KEY!, httpClient: http });

// ...
http.clearCache();
```

## LGPD

Em geral **não cacheie consultas nominais** de beneficiários. Se o fizer, garanta:

- base legal e finalidade definidas;
- minimização (evite guardar identificadores desnecessários);
- TTL curto e estratégia de retenção documentada;
- controle de acesso aos dados em cache.

Veja também: [Segurança](security.md) · [Configuração](configuration.md)
