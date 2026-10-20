# Rate limiting

O `RequestScheduler` implementa **fila FIFO**, **limite deslizante por janela** e **máximo de requisições simultâneas**. Todas as tentativas — inclusive retries — passam pela fila.

```ts
const api = new Transparencia({
  apiKey: process.env.PORTAL_API_KEY!,
  rateLimit: { maxRequests: 150, windowMs: 60_000, maxConcurrent: 3 },
});
```

## Escopo

O limite funciona **por instância do SDK**, não globalmente entre processos. Com múltiplas réplicas (pods, lambdas), o total efetivo é `maxRequests × réplicas` — use um coordenador externo (Redis, API gateway) quando necessário.

## Limites oficiais da API

O Portal aplica limites que variam ao longo do dia, aproximadamente:

| Faixa               | Limite       |
| ------------------- | ------------ |
| Horário comercial   | ~400 req/min |
| Madrugada           | ~700 req/min |
| Endpoints restritos | ~180 req/min |

O padrão do SDK (150/min) é conservador. Ajuste conforme sua chave e horário; **consulte sempre as regras atuais**.

## Retries e `Retry-After`

Respostas `429` recebem retry exponencial, respeitando `Retry-After` numérico em segundos (até 30 s) quando presente. Ajuste `retries` para controlar a insistência.

## Produção

- Prefira um **limiter compartilhado** ao invés do por-instância.
- Monitore `429` como sinal de throttling externo necessário.
- Não amplie a concorrência sem considerar os limites por endpoint.

Veja também: [Paginação](pagination.md) · [Cache](cache.md) · [Segurança](security.md)
