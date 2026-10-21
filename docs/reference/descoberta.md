# Descobrir endpoints

A SDK cobre **todos os endpoints oficiais** do Portal da Transparência (109 caminhos). Para
achar rapidamente o que você precisa, sem decorar nomes de métodos, use o catálogo pesquisável
em `api.endpoints`.

```ts
// Procurar por texto livre (ignora acentos e caixa)
const resultados = api.endpoints.buscar('cartao');
const porMunicipio = api.endpoints.buscar('municipio', 'beneficios');

// Listar tudo ou só um domínio
const todos = api.endpoints.listar();
const sancoes = api.endpoints.listar('sancoes');

// Descrever um endpoint específico
const info = api.endpoints.descrever('ceis');
console.log(info?.parametros.map((p) => p.nome));

// Listar os domínios disponíveis
const dominios = api.endpoints.dominios();

// Executar qualquer endpoint do catálogo
const dados = await api.endpoints.consultar('ceis', { nomeSancionado: 'ACME' });
```

## Métodos

| Método                         | Retorno                     | Descrição                                                       |
| ------------------------------ | --------------------------- | --------------------------------------------------------------- |
| `buscar(termo?, dominio?)`     | `EndpointInfo[]`            | Pesquisa textual tolerante a acentos; termos múltiplos são AND. |
| `listar(dominio?)`             | `EndpointInfo[]`            | Catálogo completo, opcionalmente restrito a um domínio.         |
| `descrever(recurso)`           | `EndpointInfo \| undefined` | Metadados de um endpoint específico.                            |
| `dominios()`                   | `DominioEndpoint[]`         | Domínios disponíveis, em ordem alfabética.                      |
| `consultar(recurso, filtros?)` | `Promise<RegistroDto[]>`    | Executa o endpoint, com validação e paginação.                  |

## Metadados de um endpoint

Cada `EndpointInfo` traz:

| Campo           | Descrição                                                        |
| --------------- | ---------------------------------------------------------------- |
| `recurso`       | Chave em `endpoints` (ex.: `'cartoes'`), usada em `consultar`.   |
| `caminho`       | Caminho literal (`/api-de-dados/...`), com `{id}` quando houver. |
| `dominio`       | Domínio de negócio (`beneficios`, `sancoes`, `despesas`...).     |
| `titulo`        | Título curto legível.                                            |
| `descricao`     | O que o endpoint retorna e quando usá-lo.                        |
| `parametros`    | Lista de `{ nome, obrigatorio, descricao }`.                     |
| `paginado`      | `true` se aceita `pagina`.                                       |
| `registroUnico` | `true` se devolve um único registro.                             |
| `tags`          | Palavras-chave extras para a busca.                              |

## Domínios

`servidores`, `beneficios`, `despesas`, `contratos`, `convenios`, `licitacoes`, `viagens`,
`notas-fiscais`, `cartoes`, `sancoes`, `renuncias`, `emendas`, `pessoas`, `orgaos`, `imoveis`,
`coronavirus`, `outros`.

## Funções puras

O catálogo também pode ser usado fora do cliente:

```ts
import { catalogoEndpoints, buscarEndpoints } from 'sdk-transparencia-br';

const resultados = buscarEndpoints('sancao');
const total = catalogoEndpoints.length;
```

Veja também: [Endpoints](endpoints.md) · [Recursos](recursos.md)
