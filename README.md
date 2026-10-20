<div align="center">

# sdk-transparencia-br

**SDK TypeScript para a API de Dados Abertos do Portal da Transparência do Governo Federal.**

Benefícios sociais, servidores, contratos, licitações, convênios, despesas, sanções e uma
visão consolidada por CPF/NIS — com validação de parâmetros, paginação, rate limiting,
retries e cache.

[![npm version](https://img.shields.io/npm/v/sdk-transparencia-br?color=cb3837&logo=npm&logoColor=white)](https://www.npmjs.com/package/sdk-transparencia-br)
[![Node](https://img.shields.io/badge/node-%3E%3D22-339933?logo=node.js&logoColor=white)](https://nodejs.org)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](#licença)
![Tests](https://img.shields.io/badge/tests-44%20passing-brightgreen)

[Documentação](docs/README.md) · [Exemplos](docs/examples/) · [Referência](docs/reference/) · [Guias](docs/guides/)

</div>

---

## :sparkles: Por que usar

- **Valida antes do HTTP.** Parâmetros obrigatórios (ex.: `codigoOrgao` em `contratos`) são
  checados antes da requisição, com mensagem apontando o campo que falta — o
  `HTTP 400 — Required parameter is not present` deixa de acontecer.
- **Uma chamada, todas as fontes.** `pessoas.resumo()` e `beneficios.porPessoa()` consultam
  vários endpoints em paralelo e agregam com erros isolados por seção/programa.
- **Tudo tipado.** DTOs Zod na entrada e tipos ricos na saída — o editor autocompleta filtros.
- **Pronto para produção.** Rate limit por instância, retries com backoff, timeout por
  tentativa, cache TTL opt-in e transporte HTTP injetável (testável sem rede).

## :package: Instalação

```bash
npm install sdk-transparencia-br
```

Requer **Node.js >= 22** (usa `fetch` nativo). Publica **ESM** e **CommonJS** com tipos.

## :rocket: Início rápido

```ts
import 'dotenv/config';
import { Transparencia } from 'sdk-transparencia-br';

const api = new Transparencia({
  apiKey: process.env.PORTAL_API_KEY!,
  timeoutMs: 15_000,
  retries: 2,
  rateLimit: { maxRequests: 150, windowMs: 60_000, maxConcurrent: 3 },
  cache: { enabled: false },
});
```

### O que uma pessoa recebe

```ts
// Cadastro + auxílios + cartões + viagens + contratos + sanções, em paralelo
const resumo = await api.pessoas.resumo({ cpf: '12345678901' });

if (resumo.pessoa.status === 'sucesso') console.log(resumo.pessoa.dados);

// Cada seção falha de forma independente
for (const [secao, valor] of Object.entries(resumo)) {
  if (valor.status === 'erro') console.warn(secao, valor.erro.status, valor.erro.mensagem);
}
```

### Auxílios, cartões e catálogo

```ts
const catalogo = api.beneficios.catalogo(); // nome, identificador aceito, filtros, endpoint
const auxilios = await api.beneficios.porPessoa({ cpf: '12345678901' });
const cartoes = await api.cartoes.porPortador('12345678901');
const bpc = await api.beneficios.bpc({ nis: '12345678901' });
```

### Órgãos, contratos e paginação

```ts
const orgaos = await api.orgaos.siafi();
const servidores = await api.servidores.porOrgao({ orgaoLotacao: '21000' });

for await (const pagina of api.contratos.paginas({ codigoOrgao: '10001' }, { maxPaginas: 5 })) {
  console.log(pagina.length);
}
```

### Tratamento de erros

```ts
import { PortalApiError } from 'sdk-transparencia-br';

try {
  await api.contratos.listar({}); // falta codigoOrgao → Error síncrono
} catch (erro) {
  if (erro instanceof Error) console.error(erro.message);
}

try {
  await api.pessoas.fisica({ cpf: '12345678901' });
} catch (erro) {
  if (erro instanceof PortalApiError) console.error(erro.status, erro.details);
}
```

## :card_index_dividers: Recursos por domínio

| Namespace                                                                    | Destaques                                                                                   |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `beneficios`                                                                 | `catalogo()`, `porPessoa()`, `consultar()` agregado, métodos por programa, `porMunicipio()` |
| `pessoas`                                                                    | `fisica`, `juridica`, `resumo()` consolidado                                                |
| `cartoes`                                                                    | `porPortador`, `porFavorecido`, `porOrgao`, `porTipo`, `porPeriodo*`                        |
| `servidores`                                                                 | `listar`, `porId`, `porOrgao`, `funcoesECargos`                                             |
| `contratos`                                                                  | `listar`, `porId`, `porProcesso`, `porNumero`, `porCpfCnpj`, aditivos, documentos           |
| `licitacoes`                                                                 | `ugs`, `modalidades`, `participantes`, `itens`, `empenhos`, `contratosRelacionados`         |
| `convenios`                                                                  | `tipoInstrumento`, `porNumero`, `porNumeroProcesso`, `porNumeroOriginal`                    |
| `viagens` / `notasFiscais`                                                   | `porCpf` / `porChave`                                                                       |
| `despesas`                                                                   | desembolsos, documentos, empenhos, `funcionalProgramatica.*`                                |
| `renuncias`, `emendas`, `peps`, `imoveis`, `permissionarios`, `remuneracoes` | consultas específicas                                                                       |
| `sancoes`                                                                    | `ceis`, `cnep`, `ceaf`, `cepim`                                                             |

Tabela completa em [Endpoints](docs/reference/endpoints.md).

## :bulb: Comportamentos que vale conhecer

- **Validação síncrona** — erros de filtro obrigatório são lançados antes de qualquer
  requisição; use `try/catch` normal, não `.catch()`.
- **Erros agregados** — `porPessoa`, `consultar` e `pessoas.resumo` devolvem
  `{ status: 'sucesso' | 'erro', ... }` por programa/seção.
- **Paginação** — `paginas()` é um `AsyncGenerator`; `todos()` coleta até um limite.
- **Escopo de instância** — rate limit e cache são por instância; reutilize um cliente.

## :books: Documentação

| Seção                             | Conteúdo                                                                 |
| --------------------------------- | ------------------------------------------------------------------------ |
| [Guias](docs/guides/)             | Instalação, configuração, erros, paginação, rate limit, cache, segurança |
| [Referência](docs/reference/)     | Benefícios, pessoas, cartões, recursos, endpoints, contratos             |
| [Exemplos](docs/examples/)        | Receitas copy-paste prontas                                              |
| [Índice completo](docs/README.md) | Todas as páginas                                                         |

## :hammer_and_wrench: Desenvolvimento

```bash
npm install
npm run check   # typecheck + lint + testes + build
```

Os testes usam um `httpClient` injetado: **nenhuma consulta real é executada**.

## :scroll: Fontes e licença

- API: [api.portaldatransparencia.gov.br](https://api.portaldatransparencia.gov.br/)
- Dados públicos do Governo Federal (LAI / Decreto de Dados Abertos).
- SDK comunitária, **sem vínculo com a CGU**.

<a name="licença"></a>

- Licença: **MIT**.

> Dados pessoais obtidos via API devem ser tratados conforme a **LGPD**. A SDK não persiste
> identificadores; o cache TTL é opt-in. Veja [Segurança](docs/guides/security.md).
