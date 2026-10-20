# Exemplo: sanções de uma empresa

Verifica se um CNPJ consta em cadastros de sanção (CEIS, CNEP) e afins.

```ts
import 'dotenv/config';
import { Transparencia, PortalApiError } from 'sdk-transparencia-br';

const api = new Transparencia({ apiKey: process.env.PORTAL_API_KEY! });

const cnpj = '11222333000181';
```

## Consultando cada cadastro

```ts
const [ceis, cnep] = await Promise.all([
  api.sancoes.ceis.listar({ codigoSancionado: cnpj }),
  api.sancoes.cnep.listar({ codigoSancionado: cnpj }),
]);

console.log('CEIS:', ceis.length, 'CNEP:', cnep.length);
```

## Todos os cadastros com tratamento de erro

```ts
const cadastros = {
  ceis: () => api.sancoes.ceis.listar({ codigoSancionado: cnpj }),
  cnep: () => api.sancoes.cnep.listar({ codigoSancionado: cnpj }),
  ceaf: () => api.sancoes.ceaf.listar({ codigoSancionado: cnpj }),
  cepim: () => api.sancoes.cepim.listar({ codigoSancionado: cnpj }),
  acordos: () => api.acordosLeniencia.listar(),
};

const resultados = await Promise.allSettled(
  Object.entries(cadastros).map(async ([nome, fn]) => [nome, await fn()] as const),
);

for (const r of resultados) {
  if (r.status === 'fulfilled') {
    const [nome, dados] = r.value;
    console.log(`${nome}: ${dados.length} registros`);
  } else if (r.reason instanceof PortalApiError) {
    console.warn(`falha ${r.reason.status}: ${r.reason.message}`);
  }
}
```

## Observações

- `codigoSancionado` aceita CPF/CNPJ conforme o cadastro.
- Use `Promise.allSettled` para não abortar tudo quando um cadastro falha.

Relacionados: [Recursos](../reference/recursos.md) · [Tratamento de erros](../guides/error-handling.md)
