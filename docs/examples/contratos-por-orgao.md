# Exemplo: contratos de um órgão com paginação

Varredura paginada dos contratos de um órgão federal.

```ts
import 'dotenv/config';
import { Transparencia } from 'sdk-transparencia-br';

const api = new Transparencia({ apiKey: process.env.PORTAL_API_KEY! });

const codigoOrgao = '10001'; // descubra com api.orgaos.siafi()

// Iteração incremental (memória baixa)
let total = 0;
for await (const pagina of api.contratos.paginas({ codigoOrgao }, { maxPaginas: 20 })) {
  total += pagina.length;
  console.log(`+${pagina.length} (${total})`);
}
```

## Coleta com teto de segurança

```ts
const contratos = await api.contratos.todos({ codigoOrgao }, { maxPaginas: 10, maxItens: 1000 });
console.log(contratos.length);
```

## Buscas específicas

```ts
await api.contratos.porProcesso('19400.012345/2024-10');
await api.contratos.porNumero('123/2024');
await api.contratos.porCpfCnpj('11222333000181');
await api.contratos.termoAditivo(9);
```

## Descobrindo o código do órgão

```ts
const orgaos = await api.orgaos.siafi();
const meuOrgao = orgaos.find((o) => String(o.codigo).startsWith('10'));
console.log(meuOrgao);
```

## Observações

- `codigoOrgao` é **obrigatório** em `contratos.listar` — sem ele, `Error` síncrono.
- Sem snapshot consistente durante a paginação; veja [Paginação](../guides/pagination.md).

Relacionados: [Recursos](../reference/recursos.md) · [Endpoints](../reference/endpoints.md)
