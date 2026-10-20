# Exemplo: cartões governamentais de um servidor

Transações de CPGF/CPCC/CPDC de um portador.

```ts
import 'dotenv/config';
import { Transparencia, TIPOS_CARTAO, ROTULOS_TIPOS_CARTAO } from 'sdk-transparencia-br';

const api = new Transparencia({ apiKey: process.env.PORTAL_API_KEY! });

const cpfPortador = '12345678901';

// Todas as transações do portador
const cartoes = await api.cartoes.porPortador(cpfPortador);
console.log(cartoes);
```

## Filtrando por tipo e período

```ts
const credito = await api.cartoes.porTipo(TIPOS_CARTAO.cpcc, { pagina: 1 });
console.log(ROTULOS_TIPOS_CARTAO[TIPOS_CARTAO.cpcc]);

const janeiro = await api.cartoes.porPeriodoTransacao('01/01/2024', '31/01/2024', {
  cpfPortador,
});

const extrato = await api.cartoes.porPeriodoExtrato('202401', '202412', { cpfPortador });
```

## Coletando todas as páginas

```ts
const todas = await api.cartoes.todos({ cpfPortador }, { maxPaginas: 10, maxItens: 2000 });
console.log(`Total: ${todas.length}`);
```

## Observações

- `porTipo` valida o código **antes** da requisição (`1`=CPGF, `2`=CPCC, `3`=CPDC).
- Todos os helpers aceitam `filtros` extras (`valorDe`, `valorAte`, `codigoOrgao`...).
- CPF é dado pessoal — aplique [LGPD/segurança](../guides/security.md).

Relacionados: [Cartões](../reference/cartoes.md) · [Paginação](../guides/pagination.md)
