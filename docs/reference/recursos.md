# Recursos governamentais

Serviços que compartilham o padrão `listar` / `buscar` (alias) / `consultar` (alias) / `paginas` / `todos`, e `.porId(id)` quando o endpoint oficial oferece consulta por identificador.

## Panorama

| Serviço                                       | `porId` | Métodos extras                                                                                                              |
| --------------------------------------------- | :-----: | --------------------------------------------------------------------------------------------------------------------------- |
| `servidores`                                  |   ✅    | `porOrgao`, `funcoesECargos`                                                                                                |
| `remuneracoes`                                |    —    | —                                                                                                                           |
| `contratos`                                   |   ✅    | `porCpfCnpj`, `porProcesso`, `porNumero`, `itensContratados`, `termoAditivo`, `documentosRelacionados`, `apostilamento`     |
| `licitacoes`                                  |   ✅    | `ugs`, `modalidades`, `porProcesso`, `porUgModalidadeNumero`, `participantes`, `itens`, `empenhos`, `contratosRelacionados` |
| `convenios`                                   |   ✅    | `tipoInstrumento`, `porNumero`, `porNumeroProcesso`, `porNumeroOriginal`                                                    |
| `viagens`                                     |   ✅    | `porCpf`                                                                                                                    |
| `notasFiscais`                                |    —    | `porChave`                                                                                                                  |
| `peps`                                        |    —    | —                                                                                                                           |
| `imoveis`                                     |    —    | —                                                                                                                           |
| `permissionarios`                             |    —    | —                                                                                                                           |
| `acordosLeniencia`                            |   ✅    | —                                                                                                                           |
| `sancoes.ceis` / `.cnep` / `.ceaf` / `.cepim` |   ✅    | —                                                                                                                           |

## Servidores

```ts
await api.servidores.listar({ pagina: 1 });
await api.servidores.porOrgao({ orgaoLotacao: '21000', tipoServidor: '2' });
await api.servidores.funcoesECargos({ pagina: 1 });
await api.servidores.porId(123);
```

## Contratos

```ts
await api.contratos.listar({ codigoOrgao: '10001' }); // codigoOrgao obrigatório
await api.contratos.porId(123);
await api.contratos.porCpfCnpj('11222333000181');
await api.contratos.porProcesso('19400.012345/2024-10');
await api.contratos.porNumero('123/2024');
await api.contratos.itensContratados(7);
await api.contratos.termoAditivo(9);
await api.contratos.documentosRelacionados(9);
await api.contratos.apostilamento(9);
```

## Licitações

```ts
const identificacao = { codigoUG: '123456', numero: '00001/2024', codigoModalidade: '1' };

await api.licitacoes.listar({ codigoOrgao: '10001' });
await api.licitacoes.ugs();
await api.licitacoes.modalidades();
await api.licitacoes.porProcesso('19400.012345/2024-10');
await api.licitacoes.porUgModalidadeNumero(identificacao);
await api.licitacoes.participantes(identificacao);
await api.licitacoes.itens(42);
await api.licitacoes.empenhos(identificacao);
await api.licitacoes.contratosRelacionados(identificacao);
```

## Convênios

```ts
await api.convenios.listar();
await api.convenios.tipoInstrumento();
await api.convenios.porNumero('123/2024');
await api.convenios.porNumeroProcesso('19400.012345/2024-10');
await api.convenios.porNumeroOriginal('001/2024');
```

## Viagens e notas fiscais

```ts
await api.viagens.listar({
  dataIdaDe: '01/01/2024',
  dataIdaAte: '31/01/2024',
  dataRetornoDe: '01/01/2024',
  dataRetornoAte: '31/12/2024',
  codigoOrgao: '10001',
});
await api.viagens.porCpf('12345678901');
await api.notasFiscais.porChave('35240112345678000199550010000001231000001234');
```

## Sanções e acordos

```ts
await api.sancoes.ceis.listar({ codigoSancionado: '11222333000181' });
await api.sancoes.cnep.listar();
await api.sancoes.ceaf.listar();
await api.sancoes.cepim.listar();
await api.acordosLeniencia.listar();
```

## Despesas

```ts
await api.despesas.tipoTransferencia();
await api.despesas.recursosRecebidos({ mesAnoInicio: '202401', mesAnoFim: '202412' });
await api.despesas.porOrgao({ ano: 2024, orgaoSuperior: '200' });
await api.despesas.porFuncionalProgramatica({ ano: 2024, funcao: '12' });
await api.despesas.movimentacaoLiquida({ ano: 2024 });
await api.despesas.planoOrcamentario({ ano: 2024 });
await api.despesas.itensDeEmpenho('ABC123');
await api.despesas.historicoItensDeEmpenho('ABC123', 1);
await api.despesas.favorecidosFinais('ABC123');
await api.despesas.empenhosImpactados('ABC123', 2);
await api.despesas.documentos({ dataEmissao: '01/01/2024', fase: 2 });
await api.despesas.documento('ABC123');
await api.despesas.documentosRelacionados('ABC123', 2);
await api.despesas.documentosPorFavorecido({ codigoPessoa: '999', fase: 2, ano: 2024 });

// Sub-namespace funcional-programática
await api.despesas.funcionalProgramatica.listar({ ano: 2024 });
await api.despesas.funcionalProgramatica.funcoes({ anoInicio: 2020 });
await api.despesas.funcionalProgramatica.subfuncoes({ anoInicio: 2020 });
await api.despesas.funcionalProgramatica.programas({ anoInicio: 2020 });
await api.despesas.funcionalProgramatica.acoes({ anoInicio: 2020, codigo: '2001' });
```

## Renúncias e emendas

```ts
await api.renuncias.valor({ nomeSiglaUF: 'SP' });
await api.renuncias.imunesIsentas({ cnpj: '11222333000181' });
await api.renuncias.habilitadas();

await api.emendas.listar({ ano: 2024 });
await api.emendas.documentos('77'); // codigo vai no caminho da URL
```

## Órgãos

```ts
const orgaosSiafi = await api.orgaos.siafi();
const orgaosSiape = await api.orgaos.siape();
```

Use os códigos retornados como `codigoOrgao` em contratos/licitações/despesas.

## Acesso direto (`consultas`) e descoberta (`endpoints`)

Para caminhos ainda não expostos por um serviço:

```ts
await api.consultas.consultar('cartoes', { cpfPortador: '12345678901' });
await api.consultas.consultarUm('pessoaFisica', { cpf: '12345678901' });
await api.consultas.porId('contratos', 123);
await api.consultas.consultar('coronavirusTransferencias', { mesAno: 202004 });
```

Para **achar** o endpoint certo sem decorar nomes, use o catálogo pesquisável:

```ts
const encontrados = api.endpoints.buscar('municipio'); // tolera acentos e caixa
const deSancoes = api.endpoints.listar('sancoes');
const info = api.endpoints.descrever('ceis'); // parâmetros e descrição
await api.endpoints.consultar(info!.recurso, { nomeSancionado: 'ACME' });
```

A SDK cobre **todos os 109 endpoints** do OpenAPI oficial. Detalhes em
[Descobrir endpoints](descoberta.md).

- `porId` usa `GET /id?id=N` em `contratos`/`convenios`; `/{id}` nos demais.
- `endpoints` (exportado) é a fonte única dos caminhos; `EndpointConsulta` lista os recursos válidos.

## Validação de obrigatórios

A SDK valida **antes** da requisição e lança `Error` síncrono. Resumo dos principais:

| Recurso / método                        | Obrigatórios                                                                |
| --------------------------------------- | --------------------------------------------------------------------------- |
| `contratos.listar`, `licitacoes.listar` | `codigoOrgao`                                                               |
| `remuneracoes.listar`                   | `mesAno`                                                                    |
| `viagens.listar`                        | `dataIdaDe`, `dataIdaAte`, `dataRetornoDe`, `dataRetornoAte`, `codigoOrgao` |
| `contratos.porCpfCnpj`                  | `cpfCnpj`                                                                   |
| `viagens.porCpf`                        | `cpf`                                                                       |
| `pessoas.juridica`                      | `cnpj`                                                                      |

Tabela completa em [Contratos e limitações](contracts.md).

Veja também: [Endpoints](endpoints.md) · [Exemplo: contratos de um órgão](../examples/contratos-por-orgao.md)
