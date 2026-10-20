# Configuração

Todas as opções são passadas ao construtor e valem **por instância**.

```ts
import { Transparencia } from 'transparencia-br';

const api = new Transparencia({
  apiKey: process.env.PORTAL_API_KEY!,
  baseUrl: 'https://api.portaldatransparencia.gov.br', // padrão
  timeoutMs: 15_000,
  retries: 2,
  rateLimit: { maxRequests: 150, windowMs: 60_000, maxConcurrent: 3 },
  cache: { enabled: false },
});
```

## Referência de `SdkOptions`

| Campo        | Tipo                 | Padrão                                                     | Descrição                                                          |
| ------------ | -------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------ |
| `apiKey`     | `string`             | —                                                          | **Obrigatório** com o transporte padrão. Header `chave-api-dados`. |
| `baseUrl`    | `string`             | `https://api.portaldatransparencia.gov.br`                 | Raiz da API.                                                       |
| `timeoutMs`  | `number`             | `15000`                                                    | Timeout por tentativa; aborta requisições lentas.                  |
| `retries`    | `number`             | `2`                                                        | Retentativas em falhas transitórias (429/5xx/rede) com backoff.    |
| `rateLimit`  | `RateLimitOptions`   | `{ maxRequests: 150, windowMs: 60_000, maxConcurrent: 3 }` | Limite por janela e concorrência.                                  |
| `cache`      | `CacheOptions`       | `{ enabled: false }`                                       | Cache TTL em memória (opt-in).                                     |
| `httpClient` | `HttpClientContract` | `FetchHttpClient`                                          | Transporte injetável — use um stub em testes.                      |
| `fetchImpl`  | `typeof fetch`       | `globalThis.fetch`                                         | Implementação de fetch alternativa.                                |

### `RateLimitOptions`

| Campo           | Descrição                           |
| --------------- | ----------------------------------- |
| `maxRequests`   | Máximo de requisições por janela.   |
| `windowMs`      | Tamanho da janela em milissegundos. |
| `maxConcurrent` | Requisições simultâneas máximas.    |

### `CacheOptions`

| Campo        | Descrição                             |
| ------------ | ------------------------------------- |
| `enabled`    | Liga o cache (padrão `false`).        |
| `ttlMs`      | Tempo de vida de cada entrada.        |
| `maxEntries` | Número máximo de entradas em memória. |

## Ambientes múltiplos

Reutilize **uma instância por processo** (rate limit e cache são por instância):

```ts
// src/portal.ts
import { Transparencia } from 'transparencia-br';

export const api = new Transparencia({
  apiKey: process.env.PORTAL_API_KEY!,
  timeoutMs: 15_000,
  retries: 3,
  rateLimit: { maxRequests: 400, windowMs: 60_000, maxConcurrent: 4 },
});
```

## Testando sem rede

Injete um `httpClient` falso — nenhuma chamada real é feita:

```ts
import { Transparencia, type HttpClientContract } from 'transparencia-br';

const fake: HttpClientContract = {
  get: async (path, query) => [{ path, query }],
};

const api = new Transparencia({ apiKey: 'test', httpClient: fake });
```

Veja também: [Rate limiting](rate-limit.md) · [Cache](cache.md) · [Segurança](security.md)
