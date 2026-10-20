# Rate limiting

O `RequestScheduler` implementa fila FIFO, limite deslizante por janela e máximo de requisições simultâneas. Todas as tentativas (incluindo retries) passam pela fila. O limite funciona **por instância do SDK**, não globalmente em vários processos/pods.

```ts
const api = new Transparencia({
  apiKey: process.env.PORTAL_API_KEY!,
  rateLimit: { maxRequests: 150, windowMs: 60_000, maxConcurrent: 3 },
});
```

O limite padrão de 150/min é conservador frente aos limites publicados no cadastro da API, mas não cobre automaticamente múltiplas instâncias da aplicação ou políticas específicas da chave. A documentação oficial indica 400 req/min durante parte do dia, 700 req/min na madrugada e 180 req/min para endpoints restritos. Consulte sempre as regras atuais; utilize Redis ou outro coordenador quando executar múltiplas réplicas.

`429` recebe retry exponencial, respeitando `Retry-After` numérico em segundos quando disponível (até 30 s); configure `retries` conforme o comportamento desejado.
