# API pública

Referência completa da superfície pública do pacote. Tipos exatos ficam nos `.d.ts` gerados (`dist/index.d.ts`); aqui está a semântica, os parâmetros aceitos e os comportamentos.

## Cliente

```ts
import { Transparencia } from 'transparencia-br';

const api = new Transparencia({
  apiKey: process.env.PORTAL_API_KEY!, // obrigatório
  timeoutMs: 15_000, // tempo máximo por tentativa (padrão 15s)
  retries: 2, // tentativas extras em falhas transitórias
  rateLimit: { maxRequests: 150, windowMs: 60_000, maxConcurrent: 3 },
  cache: { enabled: false }, // TTL opt-in; desligado por padrão (privacidade)
  httpClient: undefined, // transporte alternativo (testes)
});
```

### `SdkOptions`

| Campo        | Tipo                 | Descrição                                               |
| ------------ | -------------------- | ------------------------------------------------------- |
| `apiKey`     | `string`             | Chave oficial (`Token de Acesso`).                      |
| `timeoutMs`  | `number`             | Timeout por tentativa; aborta a requisição excedida.    |
| `retries`    | `number`             | Número de retentativas com backoff exponencial.         |
| `rateLimit`  | `RateLimitOptions`   | Limite de requisições por janela e concorrência máxima. |
| `cache`      | `CacheOptions`       | Cache TTL em memória (opt-in).                          |
| `httpClient` | `HttpClientContract` | Injeção de transporte — use um stub para testes.        |

### `PortalApiError`

Lançado quando a API responde com erro HTTP.

| Propriedade | Tipo                  | Descrição                                |
| ----------- | --------------------- | ---------------------------------------- |
| `message`   | `string`              | Mensagem retornada pela API (ou resumo). |
| `status`    | `number \| undefined` | Código HTTP (`400`, `403`, `503`...).    |
| `details`   | `unknown`             | Corpo do erro quando disponível.         |

## Benefícios (`api.beneficios`)

Programas sociais indexados por CPF/NIS. Ver [Benefícios, vales e consultas por pessoa](beneficios.md).

- `catalogo()` — lista os **9 auxílios** com `programa`, `nome`, `descricao`, `identificador` (`cpf-ou-nis`, `nis` ou `codigo`), `aceitaMes` e `endpoint`. Cópia defensiva, sem chamada à API.
- `porPessoa({ cpf? , nis? })` — consulta automaticamente todos os programas aplicáveis: **6 com CPF**, **9 com NIS**; com ambos, o CPF prevalece e os programas só-NIS usam o NIS. Retorna `ResultadoPrograma[]` (`{ programa, status, dados | erro }`). **Validação síncrona.**
- `consultar({ cpf | nis, programas?: [...] })` — agrega uma seleção explícita de programas, sem interromper o conjunto em caso de falha.
- Métodos por programa: `bolsaFamilia`, `bolsaFamiliaSacado`, `novoBolsaFamilia`, `auxilioBrasil`, `auxilioEmergencial`, `bpc`, `seguroDefeso`, `garantiaSafra`, `peti`.
- `listar(programa, filtros)`, `buscar(...)` (alias), `paginas(programa, filtros, opts)`, `todos(programa, filtros, opts)`.
- `porMunicipio(programa, codigoIbge, mesAno, pagina?)` — agregado por município (código IBGE de 7 dígitos).
- `consultarTodos(codigo, mesAno?)` — todos os programas para um único identificador.
- `porId(...)` — **não suportado**; lança erro explicativo (a API não possui consulta de auxílio por id).

Filtros de benefício: `cpf`, `nis`, `codigo`, `mes` (`AAAA-MM`, convertido para `mesAno=AAAAMM`), `mesAno` (alias legado), `pagina`. Os endpoints de saque aceitam **apenas NIS**.

## Pessoas (`api.pessoas`)

- `fisica({ cpf | nis })` — cadastro da pessoa física. Lança `Error` síncrono se faltar identificador.
- `juridica(cnpj)` — cadastro da pessoa jurídica. `cnpj` obrigatório.
- `resumo({ cpf | nis })` — **visão consolidada** em paralelo:

| Seção           | Consulta                 | Incluída com |
| --------------- | ------------------------ | ------------ |
| `pessoa`        | `pessoa-fisica`          | CPF ou NIS   |
| `beneficios`    | 6/9 programas de auxílio | CPF ou NIS   |
| `cartoes`       | `cartoes` por portador   | CPF          |
| `viagens`       | `viagens-por-cpf`        | CPF          |
| `contratos`     | `contratos/cpf-cnpj`     | CPF          |
| `peps`          | `peps`                   | CPF          |
| `ceis` / `cnep` | sanções a pessoas        | CPF          |
| `ceaf`          | acordos de leniência     | CPF          |

Cada seção:

```ts
type SecaoResumo<T> =
  { status: 'sucesso'; dados: T } | { status: 'erro'; erro: { mensagem: string; status?: number } };
```

Erro em uma seção não afeta as demais; cada seção traz a **primeira página**.

## Cartões (`api.cartoes`)

Cartões de pagamento governamentais. `TIPOS_CARTAO` (`{ cpgf: 1, cpcc: 2, cpdc: 3 }`) e `ROTULOS_TIPOS_CARTAO` são exportados.

- `listar(filtros)`, `paginas(...)`, `todos(...)`
- `porPortador(cpfPortador, filtros?, signal?)` — quem **recebeu**.
- `porFavorecido(cpfCnpjFavorecido, filtros?, signal?)` — quem **usou**.
- `porOrgao(codigoOrgao, filtros?, signal?)`
- `porTipo(tipoCartao, filtros?, signal?)` — valida contra `TIPOS_CARTAO`.
- `porPeriodoTransacao(dataTransacaoInicio, dataTransacaoFim, filtros?, signal?)`
- `porPeriodoExtrato(mesExtratoInicio, mesExtratoFim, filtros?, signal?)`

Filtros aceitos: `mesExtratoInicio`, `mesExtratoFim`, `dataTransacaoInicio`, `dataTransacaoFim`, `tipoCartao`, `codigoOrgao`, `cpfPortador`, `cpfCnpjFavorecido`, `valorDe`, `valorAte`, `pagina`.

## Recursos genéricos

Todos os serviços abaixo compartilham o padrão `listar` / `buscar` (alias) / `consultar` (alias) / `paginas` / `todos`, e `.porId(id)` quando o endpoint oficial oferece consulta por identificador.

| Serviço                                              | `porId` | Extras                                                                                                                      |
| ---------------------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------- |
| `servidores`                                         | ✅      | `porOrgao`, `funcoesECargos`                                                                                                |
| `contratos`                                          | ✅      | `porCpfCnpj`, `porProcesso`, `porNumero`, `itensContratados`, `termoAditivo`, `documentosRelacionados`, `apostilamento`     |
| `licitacoes`                                         | ✅      | `ugs`, `modalidades`, `porProcesso`, `porUgModalidadeNumero`, `participantes`, `itens`, `empenhos`, `contratosRelacionados` |
| `convenios`                                          | ✅      | `tipoInstrumento`, `porNumero`, `porNumeroProcesso`, `porNumeroOriginal`                                                    |
| `viagens`                                            | ✅      | `porCpf`                                                                                                                    |
| `sancoes.ceis` / `.cnep` / `.ceaf` / `.cepim`        | ✅      | —                                                                                                                           |
| `acordosLeniencia`                                   | ✅      | —                                                                                                                           |
| `remuneracoes`, `permissionarios`, `peps`, `imoveis` | —       | —                                                                                                                           |
| `notasFiscais`                                       | —       | `porChave`                                                                                                                  |

### Validação de parâmetros obrigatórios

A SDK valida antes da requisição e lança `Error` **síncrono** com o campo faltante. Os principais casos:

| Recurso / método                        | Obrigatórios                                                                |
| --------------------------------------- | --------------------------------------------------------------------------- |
| `contratos.listar`, `licitacoes.listar` | `codigoOrgao`                                                               |
| `remuneracoes.listar`                   | `mesAno`                                                                    |
| `viagens.listar`                        | `dataIdaDe`, `dataIdaAte`, `dataRetornoDe`, `dataRetornoAte`, `codigoOrgao` |
| `contratos.porCpfCnpj`                  | `cpfCnpj`                                                                   |
| `viagens.porCpf`                        | `cpf`                                                                       |
| `pessoas.juridica`                      | `cnpj`                                                                      |

Tabela completa e observações em [Contratos e limitações](contracts.md). Use `api.orgaos.siafi()` para descobrir `codigoOrgao`.

> Filtros não são traduzidos automaticamente nesses recursos: use os nomes de parâmetro do OpenAPI oficial. `listar` injeta `pagina: 1` apenas quando o endpoint suporta paginação.

## Despesas (`api.despesas`)

- `tipoTransferencia()`, `recursosRecebidos(filtros)`
- `porOrgao` / `porFuncionalProgramatica` / `movimentacaoLiquida` / `planoOrcamentario`
- `itensDeEmpenho`, `historicoItensDeEmpenho`, `favorecidosFinais`, `empenhosImpactados`
- `documentos`, `documento(codigo)`, `documentosRelacionados`, `documentosPorFavorecido`
- `funcionalProgramatica.*`: `listar`, `funcoes`, `subfuncoes`, `programas`, `acoes`

## Renúncias e emendas

- `api.renuncias`: `valor(filtros)`, `imunesIsentas(filtros)`, `habilitadas(filtros)`
- `api.emendas`: `listar(filtros)`, `documentos(codigo, pagina?)` (código no caminho da URL)

## Órgãos

- `api.orgaos.siafi()` e `api.orgaos.siape()` — catálogos de órgãos com paginação validada (`paginationSchema`).

## Consultas diretas (`api.consultas`)

Acesso de baixo nível quando você precisa de um caminho ainda não exposto por um serviço.

```ts
await api.consultas.consultar('cartoes', { cpfPortador: '12345678901' });
await api.consultas.consultarUm('pessoaFisica', { cpf: '12345678901' });
await api.consultas.porId('contratos', 123);
```

- `consultar(recurso, filtros, signal?)` — uma página.
- `consultarUm(recurso, filtros, signal?)` — assume resposta única.
- `porId(recurso, id, signal?)` — `GET /id?id=N` em `contratos`/`convenios`; `/{id}` nos demais.
- `endpoints` (exportado) é a fonte única dos caminhos oficiais; o tipo `EndpointConsulta` lista os recursos válidos.

## Paginação, infraestrutura e utilitários

```ts
import { paginate, collectPages, TtlCache, RequestScheduler } from 'transparencia-br';

for await (const pagina of paginate(
  (p, signal) => api.consultas.consultar('peps', { pagina: p }, signal),
  {
    maxPaginas: 10,
  },
)) {
  // uma página por vez
}
```

- `paginate(fetchPage, options)` — `AsyncGenerator` de páginas; `maxPaginas` limita o laço.
- `collectPages(gerador, maxItens)` — acumula itens até `maxItens`.
- `PaginationOptions` — `paginaInicial`, `maxPaginas`, `tamanhoPagina?`.
- `TtlCache` / `RequestScheduler` — cache e limiter reutilizáveis (usados pelo transporte padrão).

## Limitações

- **Respostas não validadas em runtime.** Recursos genéricos retornam `RegistroDto` (objeto extensível); a forma varia por endpoint.
- **Sem descoberta implícita de identidade.** A SDK não cruza dados por conta própria além do que `pessoas.resumo` explicita.
- **Agregações custam requisições.** `porPessoa` (6–9) e `resumo` (até 9) disparam várias chamadas — respeite o rate limit.
- **Não há endpoints privados.** Somente a API pública de Dados Abertos.
