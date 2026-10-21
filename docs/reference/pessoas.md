# Pessoas

Consultas de pessoa física/jurídica e a **visão consolidada** de tudo que uma pessoa recebe.

## Consultas pontuais

```ts
const pessoa = await api.pessoas.fisica({ cpf: '12345678901' });
const porNis = await api.pessoas.fisica({ nis: '12345678901' });
const empresa = await api.pessoas.juridica('11222333000181');
```

| Método                   | Parâmetro      | Observação                                    |
| ------------------------ | -------------- | --------------------------------------------- |
| `fisica({ cpf \| nis })` | `cpf` ou `nis` | Lança `Error` **síncrono** sem identificador. |
| `juridica(cnpj)`         | `cnpj`         | Obrigatório.                                  |

## Resumo consolidado: `resumo`

Responde "o que esta pessoa recebe?" em **uma chamada**, disparando as consultas em paralelo.

```ts
const resumo = await api.pessoas.resumo({ cpf: '12345678901' });
```

### Seções

| Seção        | Consulta                      | Incluída com |
| ------------ | ----------------------------- | ------------ |
| `pessoa`     | `pessoa-fisica`               | CPF ou NIS   |
| `beneficios` | 6 ou 9 programas de auxílio   | CPF ou NIS   |
| `cartoes`    | `cartoes` por portador        | CPF          |
| `viagens`    | `viagens-por-cpf`             | CPF          |
| `contratos`  | `contratos/cpf-cnpj`          | CPF          |
| `peps`       | `peps`                        | CPF          |
| `ceis`       | `ceis` (sanções a pessoas)    | CPF          |
| `cnep`       | `cnep`                        | CPF          |
| `ceaf`       | `ceaf` (acordos de leniência) | CPF          |

> Com apenas NIS, `resumo` retorna somente `pessoa` e `beneficios` — os demais endpoints exigem CPF.

### Formato de cada seção

```ts
type SecaoResumo<T> =
  { status: 'sucesso'; dados: T } | { status: 'erro'; erro: { mensagem: string; status?: number } };

const p = resumo.pessoa;
if (p.status === 'sucesso') console.log(p.dados);
else console.warn(p.erro.status, p.erro.mensagem);
```

- **Erro isolado**: uma seção que falha não afeta as demais.
- Cada seção traz a **primeira página**.
- **Validação síncrona** do identificador.

### Iterando as seções com tipos

`secoesResumo()` transforma o resumo em pares `{ chave, secao }` com chave tipada,
pulando as seções ausentes (ex.: sem CPF não há `cartoes`):

```ts
import { secoesResumo } from 'sdk-transparencia-br';

for (const { chave, secao } of secoesResumo(resumo)) {
  if (secao.status === 'sucesso') console.log(chave, secao.dados);
}
```

Os tipos `ChaveResumo` e `EntradaResumo` também são exportados.

### Varrendo todas as páginas de uma seção

`resumo` traz só a primeira página. Para mais, use o recurso correspondente:

```ts
for await (const pagina of api.cartoes.paginas({ cpfPortador: '12345678901' })) {
  // ...
}
```

## LGPD

Consultas por identificador usam dados pessoais — aplique base legal, minimização e retenção. As requisições são stateless; o cache TTL é opt-in (desligado por padrão). Veja [Segurança](../guides/security.md).

Veja também: [Exemplo: o que uma pessoa recebe](../examples/o-que-uma-pessoa-recebe.md)
