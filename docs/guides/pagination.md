# Paginação

Muitos endpoints aceitam `pagina`. O SDK oferece dois padrões: **iteração incremental** (memória baixa) e **coleta com limite de segurança**.

## Iteração incremental (`paginas`)

Devolve um `AsyncGenerator`: uma página por vez, ideal para processar em streaming.

```ts
for await (const registros of api.contratos.paginas({ codigoOrgao: '26000' }, { maxPaginas: 10 })) {
  console.log(registros.length);
}
```

## Coleta limitada (`todos`)

Acumula todas as páginas em um único array, respeitando um teto.

```ts
const todos = await api.licitacoes.todos(
  { codigoOrgao: '26000' },
  { maxPaginas: 10, maxItens: 1000 },
);

const bpc = await api.beneficios.todos('bpc', { nis: '12345678901' }, { maxPaginas: 10 });
```

## `PaginationOptions`

| Opção           | Padrão   | Descrição                   |
| --------------- | -------- | --------------------------- |
| `paginaInicial` | `1`      | Primeira página a buscar.   |
| `maxPaginas`    | `100`    | Teto de páginas no laço.    |
| `maxItens`      | `10.000` | Teto de itens em `todos()`. |

## Comportamento

- A iteração termina na **primeira página vazia** ou após `maxPaginas`.
- Pode ocorrer **uma requisição extra** para detectar o fim após uma página não vazia.
- `listar()` injeta `pagina: 1` apenas quando o endpoint suporta paginação.
- **Não há snapshot consistente**: se a API mudar registros durante a paginação, os resultados podem variar.

## Utilitários de baixo nível

```ts
import { paginate, collectPages } from 'sdk-transparencia-br';

for await (const pagina of paginate(
  (p, signal) => api.consultas.consultar('peps', { pagina: p }, signal),
  { maxPaginas: 5 },
)) {
  // ...
}

const itens = await collectPages(paginate(/* ... */), 500);
```

Veja também: [Rate limiting](rate-limit.md) · [Configuração](configuration.md)
