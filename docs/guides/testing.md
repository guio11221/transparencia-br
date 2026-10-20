# Testes

## Comandos

| Comando              | O que faz                                            |
| -------------------- | ---------------------------------------------------- |
| `npm test`           | Roda a suíte Vitest uma vez.                         |
| `npm run test:watch` | Modo watch.                                          |
| `npm run typecheck`  | Checagem de tipos (`tsc --noEmit`).                  |
| `npm run lint`       | ESLint.                                              |
| `npm run check`      | typecheck + lint + testes + build (o que o CI roda). |

## Sem chamadas reais

Os testes usam um **`httpClient` injetado** (ou `fetch` simulado) — nenhuma consulta real é feita. Isso mantém a suíte rápida, determinística e livre de chave.

```ts
import { describe, expect, it, vi } from 'vitest';
import { Transparencia } from '../../src/index.js';

it('envia codigoOrgao ao listar contratos', async () => {
  const get = vi.fn().mockResolvedValue([]);
  const api = new Transparencia({ apiKey: 'test', httpClient: { get } });

  await api.contratos.listar({ codigoOrgao: '10001' });

  expect(get).toHaveBeenCalledWith(
    '/api-de-dados/contratos',
    { codigoOrgao: '10001', pagina: 1 },
    undefined,
  );
});
```

## Testando validação síncrona

Erros de filtro são lançados antes da Promise — use `expect(() => ...).toThrow()`:

```ts
expect(() => api.contratos.listar({})).toThrow(/codigoOrgao/);
```

## Integração real

Integrações com a API real exigem credenciais e **não** fazem parte do CI. Mantenha-as em uma suíte separada e opt-in.

Veja também: [Arquitetura](architecture.md) · [Tratamento de erros](error-handling.md)
