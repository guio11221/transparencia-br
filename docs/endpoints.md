# Endpoints

## Benefícios

- `bolsaFamilia(dto)` → `bolsa-familia-disponivel-por-cpf-ou-nis`
- `bolsaFamiliaSacado(nis)` → `bolsa-familia-sacado-por-nis`
- `novoBolsaFamilia(nis)` → `novo-bolsa-familia-sacado-por-nis`
- `auxilioBrasil(nis)` → `auxilio-brasil-sacado-por-nis`
- `auxilioEmergencial(dto)` → `auxilio-emergencial-por-cpf-ou-nis`
- `bpc(dto)` → `bpc-por-cpf-ou-nis`
- `seguroDefeso(codigo)` → `seguro-defeso-codigo`
- `garantiaSafra(codigo)` → `safra-codigo-por-cpf-ou-nis`
- `peti(codigo)` → `peti-por-cpf-ou-nis`
- `porMunicipio(programa, codigoIbge, mesAno, pagina)` → `${programa}-por-municipio`
- `consultarTodos(codigo, mesAno)` → retorna resultados e falhas por programa, sem interromper o conjunto
- `porPessoa({ cpf | nis })` → seleciona automaticamente os programas aplicáveis (6 com CPF, 9 com NIS) e agrega resultados/falhas por programa
- `catalogo()` → lista os auxílios disponíveis com identificador, suporte a mês e endpoint (metadados locais, sem chamada à API)

## Recursos genéricos

`orgaos.siafi()` e `orgaos.siape()`; `consultas.consultar(recurso, parametros)` para todos os recursos abaixo. A lista completa de caminhos está em `src/modules/consultas/endpoints.ts`.

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
| `pessoas`                                            | `fisica`, `juridica`, `resumo` (auxílios + cartões + viagens + contratos + PEPs + sanções em paralelo, com seções isoladas)                                                                                                                                                                                                     |
| `renuncias`                                          | `valor`, `imunesIsentas`, `habilitadas`                                                                                                                                                                                                                                                                                         |
| `emendas`                                            | `listar`, `documentos`                                                                                                                                                                                                                                                                                                          |
| `despesas`                                           | `tipoTransferencia`, `recursosRecebidos`, `porOrgao`, `porFuncionalProgramatica`, `movimentacaoLiquida`, `planoOrcamentario`, `itensDeEmpenho`, `historicoItensDeEmpenho`, `favorecidosFinais`, `empenhosImpactados`, `documentos`, `documento`, `documentosRelacionados`, `documentosPorFavorecido`, `funcionalProgramatica.*` |

**Parâmetros obrigatórios:** `contratos` e `licitacoes` exigem `codigoOrgao`; `remuneracoes` exige `mesAno`; `viagens` exige `dataIdaDe`, `dataIdaAte`, `dataRetornoDe`, `dataRetornoAte` e `codigoOrgao`; `contratosPorCpfCnpj` exige `cpfCnpj`; `viagensPorCpf` exige `cpf`; `pessoaJuridica` exige `cnpj`; consulte a tabela completa em [Contratos oficiais](contracts.md). A SDK valida isso antes da requisição.

Os parâmetros e caminhos foram conferidos contra o OpenAPI oficial (`/v3/api-docs`). Os formatos de resposta seguem abertos (`RegistroDto`), pois o payload não é validado em runtime.

Fonte: https://api.portaldatransparencia.gov.br/swagger-ui/index.html
