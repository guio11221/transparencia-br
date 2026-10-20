# Instalação e primeiros passos

## Requisitos

- **Node.js >= 22** (o SDK usa `fetch` nativo e `AbortSignal.timeout`)
- Uma **chave oficial** do Portal da Transparência ([como obter](#obtendo-a-chave))

## Instalação

```bash
npm install transparencia-br
```

O pacote publica **ESM** e **CommonJS** com definições de tipo:

```ts
// ESM / TypeScript
import { Transparencia } from 'transparencia-br';

// CommonJS
const { Transparencia } = require('transparencia-br');
```

## Obtendo a chave

1. Cadastre-se em [api.portaldatransparencia.gov.br](https://api.portaldatransparencia.gov.br/).
2. No painel, gere um **Token de Acesso** (chave de API).
3. Guarde no `.env` (nunca no código):

```dotenv
PORTAL_API_KEY=sua-chave-aqui
```

```ts
import 'dotenv/config';
import { Transparencia } from 'transparencia-br';

const api = new Transparencia({ apiKey: process.env.PORTAL_API_KEY! });
```

> A chave é enviada no header `chave-api-dados`. **Use-a apenas no backend** — nunca em código de navegador ou repositório.

## Primeira consulta

```ts
import 'dotenv/config';
import { Transparencia } from 'transparencia-br';

const api = new Transparencia({ apiKey: process.env.PORTAL_API_KEY! });

// Catálogo de auxílios (sem chamada à API)
console.log(api.beneficios.catalogo().map((p) => p.nome));

// Uma pessoa e o que ela recebe
const resumo = await api.pessoas.resumo({ cpf: '000.000.000-00' });
if (resumo.pessoa.status === 'sucesso') console.log(resumo.pessoa.dados);
```

## Próximos passos

- [Configuração](configuration.md) — timeout, retries, rate limit e cache
- [Tratamento de erros](error-handling.md) — o que pode falhar e como reagir
- [Exemplos](../examples/o-que-uma-pessoa-recebe.md) — receitas prontas
