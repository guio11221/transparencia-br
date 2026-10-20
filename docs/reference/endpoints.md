# Endpoints

Mapa de método da SDK → caminho oficial da API. A lista completa e canônica fica em `src/modules/consultas/endpoints.ts`.

## Órgãos

- `orgaos.siafi()` → `/orgaos-siafi`
- `orgaos.siape()` → `/orgaos-siape`

## Benefícios

| Método                        | Caminho (`/api-de-dados/...`)             |
| ----------------------------- | ----------------------------------------- |
| `bolsaFamilia(dto)`           | `bolsa-familia-disponivel-por-cpf-ou-nis` |
| `bolsaFamiliaSacado(nis)`     | `bolsa-familia-sacado-por-nis`            |
| `novoBolsaFamilia(nis)`       | `novo-bolsa-familia-sacado-por-nis`       |
| `auxilioBrasil(nis)`          | `auxilio-brasil-sacado-por-nis`           |
| `auxilioEmergencial(dto)`     | `auxilio-emergencial-por-cpf-ou-nis`      |
| `bpc(dto)`                    | `bpc-por-cpf-ou-nis`                      |
| `seguroDefeso(codigo)`        | `seguro-defeso-codigo`                    |
| `garantiaSafra(codigo)`       | `safra-codigo-por-cpf-ou-nis`             |
| `peti(codigo)`                | `peti-por-cpf-ou-nis`                     |
| `porMunicipio(programa, ...)` | `${programa}-por-municipio`               |

Métodos agregados (`porPessoa`, `consultar`, `consultarTodos`) não têm caminho próprio — combinam os acima. `catalogo()` é local (sem chamada).

## Pessoas

| Método             | Caminho                                                                          |
| ------------------ | -------------------------------------------------------------------------------- |
| `pessoas.fisica`   | `/api-de-dados/pessoa-fisica`                                                    |
| `pessoas.juridica` | `/api-de-dados/pessoa-juridica`                                                  |
| `pessoas.resumo`   | combina `pessoa-fisica`, benefícios, cartões, viagens, contratos, PEPs e sanções |

## Recursos genéricos

`consultas.consultar(recurso, parametros)` alcança todos os recursos. Namespaces e métodos:

| Namespace                                            | Métodos                                                                                                                                                                                                                                                                                                                         |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `servidores`                                         | `listar`, `porId`, `porOrgao`, `funcoesECargos`                                                                                                                                                                                                                                                                                 |
| `remuneracoes`, `permissionarios`, `peps`, `imoveis` | `listar`                                                                                                                                                                                                                                                                                                                        |
| `viagens`                                            | `listar`, `porId`, `porCpf`                                                                                                                                                                                                                                                                                                     |
| `contratos`                                          | `listar`, `porId`, `porCpfCnpj`, `porProcesso`, `porNumero`, `itensContratados`, `termoAditivo`, `documentosRelacionados`, `apostilamento`                                                                                                                                                                                      |
| `convenios`                                          | `listar`, `porId`, `tipoInstrumento`, `porNumero`, `porNumeroProcesso`, `porNumeroOriginal`                                                                                                                                                                                                                                     |
| `licitacoes`                                         | `listar`, `porId`, `ugs`, `modalidades`, `porProcesso`, `porUgModalidadeNumero`, `participantes`, `itens`, `empenhos`, `contratosRelacionados`                                                                                                                                                                                  |
| `notasFiscais`                                       | `listar`, `porChave`                                                                                                                                                                                                                                                                                                            |
| `cartoes`                                            | `listar`, `porPortador`, `porFavorecido`, `porOrgao`, `porTipo`, `porPeriodoTransacao`, `porPeriodoExtrato`                                                                                                                                                                                                                     |
| `sancoes.*`, `acordosLeniencia`                      | `listar`, `porId`                                                                                                                                                                                                                                                                                                               |
| `renuncias`                                          | `valor`, `imunesIsentas`, `habilitadas`                                                                                                                                                                                                                                                                                         |
| `emendas`                                            | `listar`, `documentos`                                                                                                                                                                                                                                                                                                          |
| `despesas`                                           | `tipoTransferencia`, `recursosRecebidos`, `porOrgao`, `porFuncionalProgramatica`, `movimentacaoLiquida`, `planoOrcamentario`, `itensDeEmpenho`, `historicoItensDeEmpenho`, `favorecidosFinais`, `empenhosImpactados`, `documentos`, `documento`, `documentosRelacionados`, `documentosPorFavorecido`, `funcionalProgramatica.*` |

**Parâmetros obrigatórios** (validados antes da requisição): `contratos`/`licitacoes` → `codigoOrgao`; `remuneracoes` → `mesAno`; `viagens` → `dataIdaDe`, `dataIdaAte`, `dataRetornoDe`, `dataRetornoAte`, `codigoOrgao`; `contratosPorCpfCnpj` → `cpfCnpj`; `viagensPorCpf` → `cpf`; `pessoaJuridica` → `cnpj`. Tabela completa em [Contratos e limitações](contracts.md).

Caminhos conferidos contra o OpenAPI oficial (`/v3/api-docs`). Respostas seguem abertas (`RegistroDto`), pois o payload não é validado em runtime.

**Fonte:** [Swagger UI](https://api.portaldatransparencia.gov.br/swagger-ui/index.html)
