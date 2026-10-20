# Benefícios e auxílios

Programas sociais indexados por CPF/NIS. Este é o domínio mais usado do Portal da Transparência.

## O que existe

| O que você quer saber                                         | Onde está                             | Método da SDK                                        |
| ------------------------------------------------------------- | ------------------------------------- | ---------------------------------------------------- |
| Auxílios sociais (Bolsa Família, BPC, PETI, Seguro Defeso...) | `/api-de-dados/*-por-cpf-ou-nis` etc. | `beneficios.*`                                       |
| Cartões de pagamento (CPGF, CPCC, CPDC)                       | `/api-de-dados/cartoes`               | `api.cartoes.*` → [Cartões](../reference/cartoes.md) |
| Vales/rubricas na folha                                       | `/api-de-dados/remuneracoes`          | `api.remuneracoes.listar(...)`                       |

> A API **não** possui um endpoint "vales". Os dados equivalentes estão nas três frentes acima.

## Catálogo de auxílios

```ts
const catalogo = api.beneficios.catalogo();
// [
//   { programa: 'bolsaFamilia', nome: 'Bolsa Família — parcelas disponíveis',
//     identificador: 'cpf-ou-nis', aceitaMes: true, endpoint: '...' },
//   ...
// ]
```

O catálogo traz os **9 programas** com o identificador aceito e se suportam filtro de mês. Sem chamada à API (metadados locais), com cópia defensiva.

| Programa             | Identificador | Aceita mês |
| -------------------- | ------------- | ---------- |
| `bolsaFamilia`       | `cpf-ou-nis`  | sim        |
| `bolsaFamiliaSacado` | `nis`         | sim        |
| `novoBolsaFamilia`   | `nis`         | sim        |
| `auxilioBrasil`      | `nis`         | sim        |
| `auxilioEmergencial` | `cpf-ou-nis`  | sim        |
| `bpc`                | `cpf-ou-nis`  | sim        |
| `seguroDefeso`       | `codigo`      | não        |
| `garantiaSafra`      | `codigo`      | não        |
| `peti`               | `codigo`      | não        |

## Consultando por programa

```ts
const bpc = await api.beneficios.bpc({ nis: '12345678901' });
const parcelas = await api.beneficios.novoBolsaFamilia({ nis: '12345678901' });
const depois = await api.beneficios.auxilioEmergencial({ cpf: '12345678901' });
```

| Método                             | Identificador  |
| ---------------------------------- | -------------- |
| `bolsaFamilia(dto)`                | `cpf` ou `nis` |
| `bolsaFamiliaSacado(nis, pagina?)` | `nis`          |
| `novoBolsaFamilia(nis, pagina?)`   | `nis`          |
| `auxilioBrasil(nis, pagina?)`      | `nis`          |
| `auxilioEmergencial(dto)`          | `cpf` ou `nis` |
| `bpc(dto)`                         | `cpf` ou `nis` |
| `seguroDefeso(dto)`                | `codigo`       |
| `garantiaSafra(dto)`               | `codigo`       |
| `peti(dto)`                        | `codigo`       |

## Uma chamada, todos os programas: `porPessoa`

```ts
const resultados = await api.beneficios.porPessoa({ cpf: '12345678901' }); // 6 programas
const comNis = await api.beneficios.porPessoa({ nis: '12345678901' }); // 9 programas
const ambos = await api.beneficios.porPessoa({ cpf: '...', nis: '...' }); // CPF prevalece
```

- Retorna `ResultadoPrograma[]`: `{ programa, status: 'sucesso' | 'erro', dados?, erro? }`.
- Uma falha em um programa **não derruba** os demais (`Promise.allSettled`).
- **Validação síncrona**: `Error` se faltar identificador ou não tiver 11 dígitos.
- Faz **6 requisições** com CPF e **9** com NIS.

## Agregando uma seleção: `consultar`

```ts
const agregado = await api.beneficios.consultar({
  nis: '12345678901',
  programas: ['bpc', 'peti'],
});
```

## Por município

```ts
await api.beneficios.porMunicipio('bolsa-familia', '3550308', 202401, 1);
```

`programa` ∈ `bolsa-familia`, `novo-bolsa-familia`, `auxilio-brasil`, `auxilio-emergencial`, `bpc`, `seguro-defeso`, `safra`, `peti`. `codigoIbge` de 7 dígitos, `mesAno` no formato `AAAAMM`.

## Paginação

```ts
for await (const pagina of api.beneficios.paginas('bpc', { nis: '12345678901' })) {
  console.log(pagina);
}
const todos = await api.beneficios.todos('bpc', { nis: '12345678901' }, { maxPaginas: 5 });
```

## Filtros e aliases

- `mes` aceita `AAAA-MM` e converte para `mesAno=AAAAMM`.
- `codigo` e `mesAno` são aliases legados.
- Endpoints de saque aceitam **apenas NIS** — não use `{ cpf }` neles.
- `porId` **não é suportado** (a API não tem consulta de auxílio por id); lança erro explicativo.

Veja também: [Exemplo: auxílios por CPF/NIS](../examples/auxilios-por-cpf-nis.md) · [Endpoints](endpoints.md)
