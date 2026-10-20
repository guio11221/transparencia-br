# Benefícios, vales e consultas por pessoa

Guia para responder à pergunta mais comum do Portal da Transparência: **"o que esta pessoa recebe?"**.

## A API não tem endpoint "vales"

O Portal da Transparência não expõe um endpoint chamado "vales". Os dados equivalentes estão em três frentes, todas cobertas pela SDK:

| O que você quer saber                                                                          | Endpoint oficial                      | Método da SDK                   |
| ---------------------------------------------------------------------------------------------- | ------------------------------------- | ------------------------------- |
| Auxílios sociais (Bolsa Família, BPC, PETI, Seguro Defeso...)                                  | `/api-de-dados/*-por-cpf-ou-nis` etc. | `api.beneficios.porPessoa(...)` |
| Cartões de pagamento governamentais (CPGF, CPCC, CPDC) — onde vales e diárias viram transações | `/api-de-dados/cartoes`               | `api.cartoes.porPortador(...)`  |
| Vales e benefícios embutidos na folha (descontos e rubricas)                                   | `/api-de-dados/remuneracoes`          | `api.remuneracoes.listar(...)`  |

## Catálogo de auxílios

```ts
const catalogo = api.beneficios.catalogo();
// [
//   { programa: 'bolsaFamilia', nome: 'Bolsa Família — parcelas disponíveis', identificador: 'cpf-ou-nis', aceitaMes: true, endpoint: '...' },
//   ...
// ]
```

O catálogo traz os 9 programas oficiais com o identificador aceito (`cpf-ou-nis`, `nis` ou `codigo`) e se suportam filtro de mês. `api.beneficios.catalogo()` devolve cópia defensiva (pode alterar sem estragar o estado interno).

## Uma chamada para todos os programas: `porPessoa`

```ts
const resultados = await api.beneficios.porPessoa({ cpf: '12345678901' });
// 6 programas (os 3 que aceitam apenas NIS são ignorados)

const comNis = await api.beneficios.porPessoa({ nis: '12345678901' });
// todos os 9 programas

const ambos = await api.beneficios.porPessoa({ cpf: '...', nis: '...' });
// CPF prevalece; programas só-NIS usam o NIS
```

- Cada resultado é `{ programa, status: 'sucesso' | 'erro', dados?, erro? }` — uma falha em um programa não derruba os demais (`Promise.allSettled`).
- Validação é síncrona: `Error` (não promise rejection) se não informar `cpf`/`nis` ou se o identificador não tiver 11 dígitos.
- Faz **6 requisições** com CPF e **9** com NIS; aplique o rate limit da instância.

Para escolher programas explicitamente, use `api.beneficios.consultar({ nis, programas: ['bpc', 'peti'] })`.

## Visão consolidada: `pessoas.resumo`

```ts
const resumo = await api.pessoas.resumo({ cpf: '12345678901' });
```

Dispara em paralelo (uma página de cada) e devolve **seções isoladas** — erro em uma seção não afeta as demais:

| Seção        | Endpoint                      | Incluída com |
| ------------ | ----------------------------- | ------------ |
| `pessoa`     | `pessoa-fisica`               | CPF ou NIS   |
| `beneficios` | 6 ou 9 programas de auxílio   | CPF ou NIS   |
| `cartoes`    | `cartoes` (por portador)      | CPF          |
| `viagens`    | `viagens-por-cpf`             | CPF          |
| `contratos`  | `contratos/cpf-cnpj`          | CPF          |
| `peps`       | `peps`                        | CPF          |
| `ceis`       | `ceis` (sanções a pessoas)    | CPF          |
| `cnep`       | `cnep`                        | CPF          |
| `ceaf`       | `ceaf` (acordos de leniência) | CPF          |

Cada seção tem o formato:

```ts
type SecaoResumo<T> =
  { status: 'sucesso'; dados: T } | { status: 'erro'; erro: { mensagem: string; status?: number } };

const p = resumo.pessoa;
if (p.status === 'sucesso') console.log(p.dados);
else console.warn(p.erro.status, p.erro.mensagem); // ex.: 403, 503
```

Com apenas NIS, `resumo` retorna somente `pessoa` e `beneficios` (os demais endpoints exigem CPF).

> Cada seção traz a **primeira página**. Para varrer todas as páginas de uma seção, use `paginas()`/`todos()` do recurso correspondente ou avance `pagina` manualmente nos métodos especializados.

## Cartões: CPGF, CPCC e CPDC

```ts
import { TIPOS_CARTAO, ROTULOS_TIPOS_CARTAO } from 'transparencia-br';

TIPOS_CARTAO; // { cpgf: 1, cpcc: 2, cpdc: 3 }

await api.cartoes.porPortador('12345678901'); // CPF de quem recebeu
await api.cartoes.porFavorecido('11222333000181'); // CPF/CNPJ favorecido
await api.cartoes.porOrgao('21000');
await api.cartoes.porTipo(TIPOS_CARTAO.cpcc);
await api.cartoes.porPeriodoTransacao('01/01/2024', '31/01/2024');
await api.cartoes.porPeriodoExtrato('202401', '202412');
```

`porTipo` valida o código antes da requisição (1 = CPGF, 2 = CPCC, 3 = CPDC). Todos os helpers aceitam `filtros` extras (`valorDe`, `valorAte`, `pagina`...) e delegam para `listar`, então `paginas()`/`todos()` continuam disponíveis nos filtros.

## Privacidade

Consultas por identificador usam dados pessoais: aplique base legal, minimização e retenção conforme LGPD antes de expor resultados em produto. As requisições são stateless e o cache TTL é opt-in (desligado por padrão).
