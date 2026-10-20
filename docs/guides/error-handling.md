# Tratamento de erros

O SDK distingue **três famílias de erro**, e a forma de capturá-las importa.

## 1. Validação de filtros (síncrona)

Parâmetros obrigatórios ausentes ou malformados são rejeitados **antes** de qualquer chamada HTTP — o erro é lançado de forma **síncrona**.

```ts
try {
  await api.contratos.listar({}); // falta codigoOrgao
} catch (erro) {
  // Capturado aqui mesmo, sem round-trip HTTP.
  console.error((erro as Error).message);
  // Filtros inválidos para o recurso "contratos" — codigoOrgao: Required
}
```

> Como o `throw` acontece antes de retornar a Promise, `.catch()` na Promise **não** captura esse erro. Use `try/catch` normal.

## 2. Erros da API (`PortalApiError`)

Respostas HTTP de erro viram `PortalApiError`, com `status` e `details`:

```ts
import { PortalApiError } from 'sdk-transparencia-br';

try {
  await api.pessoas.fisica({ cpf: '00000000000' });
} catch (erro) {
  if (erro instanceof PortalApiError) {
    console.error(erro.status); // 400 | 403 | 429 | 5xx ...
    console.error(erro.details); // corpo do erro, quando fornecido
  }
}
```

| Propriedade | Tipo                  | Descrição                    |
| ----------- | --------------------- | ---------------------------- |
| `message`   | `string`              | Mensagem retornada pela API. |
| `status`    | `number \| undefined` | Código HTTP.                 |
| `details`   | `unknown`             | Corpo do erro.               |

## 3. Erros agregados (por seção/programa)

Métodos que consultam várias fontes (`pessoas.resumo`, `beneficios.porPessoa`, `beneficios.consultar`) **não lançam** quando uma fonte falha: devolvem um resultado por fonte.

```ts
const resumo = await api.pessoas.resumo({ cpf: '00000000000' });

for (const [secao, valor] of Object.entries(resumo)) {
  if (valor.status === 'erro') {
    console.warn(`[${secao}] ${valor.erro.status} ${valor.erro.mensagem}`);
  }
}
```

Cada seção: `{ status: 'sucesso', dados } | { status: 'erro', erro: { mensagem, status? } }`.

## Retries e timeout

- **429/5xx e falhas de rede** são repetidos com backoff exponencial, respeitando `Retry-After` (até 30 s) quando numérico. Controle com `retries`.
- **Timeout** aborta a tentativa (`timeoutMs`) e dispara o retry, se configurado.

## Cancelamento

Todos os métodos aceitam um `AbortSignal` opcional:

```ts
const controller = new AbortController();
setTimeout(() => controller.abort(), 5_000);

const dados = await api.beneficios.bpc({ nis: '12345678901' }, controller.signal);
```

Quando um `signal` é informado, o cache e a deduplicação são ignorados para manter o cancelamento isolado.

Veja também: [Configuração](configuration.md) · [Segurança](security.md)
