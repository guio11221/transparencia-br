# Cartões de pagamento (CPGF, CPCC, CPDC)

Cartões de pagamento governamentais — onde despesas de custeio, diárias e vales viram transações rastreáveis.

## Tipos de cartão

```ts
import { TIPOS_CARTAO, ROTULOS_TIPOS_CARTAO } from 'sdk-transparencia-br';

TIPOS_CARTAO; // { cpgf: 1, cpcc: 2, cpdc: 3 }
ROTULOS_TIPOS_CARTAO[TIPOS_CARTAO.cpcc];
// 'CPCC — Cartão de Pagamentos de Crédito'
```

| Código | Constante           | Rótulo                                            |
| ------ | ------------------- | ------------------------------------------------- |
| `1`    | `TIPOS_CARTAO.cpgf` | CPGF — Cartão de Pagamentos do Governo Federal    |
| `2`    | `TIPOS_CARTAO.cpcc` | CPCC — Cartão de Pagamentos de Crédito            |
| `3`    | `TIPOS_CARTAO.cpdc` | CPDC — Cartão de Pagamentos de Diárias e Créditos |

## Consultas

```ts
await api.cartoes.porPortador('12345678901'); // quem RECEBEU
await api.cartoes.porFavorecido('11222333000181'); // quem USOU
await api.cartoes.porOrgao('21000');
await api.cartoes.porTipo(TIPOS_CARTAO.cpcc);
await api.cartoes.porPeriodoTransacao('01/01/2024', '31/01/2024');
await api.cartoes.porPeriodoExtrato('202401', '202412');
```

| Método                                           | Parâmetro       | Descrição                         |
| ------------------------------------------------ | --------------- | --------------------------------- |
| `porPortador(cpf, filtros?)`                     | CPF             | Transações do portador.           |
| `porFavorecido(cpfCnpj, filtros?)`               | CPF/CNPJ        | Transações ao favorecido.         |
| `porOrgao(codigoOrgao, filtros?)`                | código do órgão | Por unidade.                      |
| `porTipo(tipoCartao, filtros?)`                  | `TIPOS_CARTAO`  | Valida o código antes da chamada. |
| `porPeriodoTransacao(inicio, fim, filtros?)`     | datas           | Intervalo de transação.           |
| `porPeriodoExtrato(mesInicio, mesFim, filtros?)` | `AAAAMM`        | Intervalo de extrato.             |

Todos os helpers aceitam `filtros` extras e delegam para `listar` — `paginas()`/`todos()` continuam disponíveis.

## Filtros aceitos

| Filtro                                     | Descrição              |
| ------------------------------------------ | ---------------------- |
| `mesExtratoInicio` / `mesExtratoFim`       | `AAAAMM`               |
| `dataTransacaoInicio` / `dataTransacaoFim` | `DD/MM/AAAA`           |
| `tipoCartao`                               | `1`/`2`/`3`            |
| `codigoOrgao`                              | Órgão                  |
| `cpfPortador`                              | CPF do portador        |
| `cpfCnpjFavorecido`                        | CPF/CNPJ do favorecido |
| `valorDe` / `valorAte`                     | Faixa de valor         |
| `pagina`                                   | Página                 |

## Paginação e validação

```ts
const cartoes = await api.cartoes.todos({ cpfPortador: '12345678901' }, { maxPaginas: 5 });
expect(() => api.cartoes.porTipo(9 as 1)).toThrow(/tipoCartao inválido/);
```

`porTipo` valida o código **sincronamente** antes de qualquer requisição.

Veja também: [Exemplo: cartões de um servidor](../examples/cartoes-de-servidor.md) · [Endpoints](endpoints.md)
