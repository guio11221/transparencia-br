# transparencia-br

SDK TypeScript não oficial para a **API de Dados Abertos do Portal da Transparência** do Governo Federal. Cobre benefícios sociais, servidores, contratos, licitações, convênios, despesas, sanções, pessoas e uma visão consolidada por CPF/NIS — com validação de parâmetros, paginação, rate limiting, retries e cache.

> **v0.4.0 — pré-lançamento.** Os caminhos e parâmetros foram conferidos contra o OpenAPI oficial (`/v3/api-docs`); os formatos de resposta seguem abertos e podem variar. Homologue com a sua chave antes de produção.

[![Node](https://img.shields.io/badge/node-%3E%3D22-brightgreen)](https://nodejs.org)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)
![Testes](https://img.shields.io/badge/testes-44%20passando-brightgreen)

## Por que usar

- **Validação antes do HTTP.** Os parâmetros obrigatórios de cada endpoint (por exemplo `codigoOrgao` em `contratos`) são checados antes da requisição, com mensagem apontando o campo que falta — o erro `HTTP 400 — Required parameter is not present` deixa de acontecer.
- **Uma chamada, todas as fontes.** `pessoas.resumo()` e `beneficios.porPessoa()` consultam vários endpoints em paralelo e agregam o resultado com erros isolados por seção/programa.
- **Tudo tipado.** DTOs Zod para entrada e tipos `*.d.ts` ricos para saída; o editor autocompleta filtros e seções.
- **Pronto para produção.** Rate limit por instância, retries com backoff, timeout por tentativa, cache TTL opt-in e transporte HTTP injetável (testável sem rede).

## Instalação

```bash
npm install transparencia-br
```

Requer **Node.js >= 22** (usa `fetch` nativo). A SDK publica **ESM** e **CommonJS** com tipos.

## Início rápido

```ts
import { Transparencia } from 'transparencia-br';

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
// Cadastro + auxílios (Bolsa Família, BPC, PETI, Seguro Defeso...)
const resumo = await api.pessoas.resumo({ cpf: '12345678901' });

if (resumo.pessoa.status === 'sucesso') {
  console.log(resumo.pessoa.dados);
}

// Cada seção falha de forma independente:
for (const [secao, valor] of Object.entries(resumo)) {
  if (valor.status === 'erro') console.warn(secao, valor.erro.status, valor.erro.mensagem);
}

// Todos os auxílios aplicáveis a um CPF/NIS, com o identificador aceito por programa
const auxilios = await api.beneficios.porPessoa({ cpf: '12345678901' });

// Cartões governamentais (CPGF/CPCC/CPDC) do portador
const cartoes = await api.cartoes.porPortador('12345678901');
```

### Catálogo de auxílios e consultas pontuais

```ts
const catalogo = api.beneficios.catalogo(); // nome, identificador aceito, filtros, endpoint
const bpc = await api.beneficios.bpc({ nis: '12345678901' });
const parcelas = await api.beneficios.novoBolsaFamilia({ nis: '12345678901' });
const agregado = await api.beneficios.consultar({ nis: '12345678901', programas: ['bpc', 'peti'] });
```

### Órgãos, servidores, contratos e despesas

```ts
const orgaos = await api.orgaos.siafi();
const servidores = await api.servidores.porOrgao({ orgaoLotacao: '21000' });
const despesas = await api.despesas.porOrgao({ ano: 2024, orgaoSuperior: '200' });

// Paginação incremental (para cedo) ou coleta total limitada
for await (const pagina of api.contratos.paginas({ codigoOrgao: '10001' }, { maxPaginas: 5 })) {
  console.log(pagina);
}
const registros = await api.licitacoes.todos({ codigoOrgao: '10001' }, { maxItens: 200 });
```

### Tratamento de erros

```ts
import { PortalApiError } from 'transparencia-br';

try {
  await api.contratos.listar({}); // falta codigoOrgao
} catch (erro) {
  // Validação é SÍNCRONA: lançada antes da chamada, não é rejeição de Promise.
  console.error(erro instanceof Error && erro.message); // Filtros inválidos para ... codigoOrgao: ...
}

try {
  await api.pessoas.fisica({ cpf: '12345678901' });
} catch (erro) {
  if (erro instanceof PortalApiError) console.error(erro.status, erro.details);
}
```

## Recursos por domínio

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

Tabela completa em [Endpoints](docs/endpoints.md).

## Comportamentos que vale conhecer

- **Validação síncrona.** Erros de filtro obrigatório são lançados antes de qualquer requisição — use `try/catch` normal, não `.catch()`.
- **Erros agregados.** `porPessoa`, `consultar`, `pessoas.resumo` usam `Promise.allSettled` e devolvem `{ status: 'sucesso' | 'erro', ... }` por programa/seção.
- **Paginação.** `paginas()` devolve `AsyncGenerator` (uma página por vez); `todos()` coleta até um limite. `listar()` injeta `pagina: 1` apenas quando o endpoint suporta.
- **Escopo de instância.** Rate limit e cache são por instância do cliente; reutilize um `Transparencia` por processo.

## Documentação

- [API pública](docs/public-api.md) — referência de todos os métodos
- [Endpoints](docs/endpoints.md) — mapa método → caminho oficial
- [Benefícios, vales e consultas por pessoa](docs/beneficios.md) — o caso de uso mais comum
- [Contratos e limitações](docs/contracts.md) — parâmetros obrigatórios e restrições
- [Paginação](docs/pagination.md) · [Rate limiting](docs/rate-limit.md) · [Cache e privacidade](docs/cache.md)
- [Arquitetura](docs/architecture.md) · [Segurança](docs/security.md)

## Desenvolvimento

```bash
npm install
npm run check   # typecheck + lint + testes + build
```

Os testes usam um `httpClient` injetado: **nenhuma consulta real é executada**. Use uma chave oficial para integração e respeite os limites da API e a LGPD.

## Fontes e licença

- API: [api.portaldatransparencia.gov.br](https://api.portaldatransparencia.gov.br/)
- Dados públicos do Governo Federal (Decreto de Dados Abertos / LAI).
- Este projeto é uma SDK comunitária e não possui vínculo com a CGU.

Dados pessoais obtidos via API devem ser tratados conforme a LGPD. A SDK não persiste identificadores; o cache TTL é opt-in.
