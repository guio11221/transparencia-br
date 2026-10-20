# Exemplo: o que uma pessoa recebe

Consolida, em uma chamada, cadastro, auxílios, cartões, viagens, contratos e sanções de um CPF.

```ts
import 'dotenv/config';
import { Transparencia } from 'transparencia-br';

const api = new Transparencia({ apiKey: process.env.PORTAL_API_KEY! });

const cpf = '000.000.000-00';
const resumo = await api.pessoas.resumo({ cpf });

// Cadastro
if (resumo.pessoa.status === 'sucesso') {
  console.log('Pessoa:', resumo.pessoa.dados);
}

// Auxílios por programa
if (resumo.beneficios.status === 'sucesso') {
  for (const r of resumo.beneficios.dados) {
    console.log(r.programa, r.status === 'sucesso' ? `${r.dados.length} registros` : r.erro);
  }
}

// Relatório de erros por seção (uma falha não derruba as demais)
for (const [secao, valor] of Object.entries(resumo)) {
  if (valor.status === 'erro') {
    console.warn(`[${secao}] HTTP ${valor.erro.status}: ${valor.erro.mensagem}`);
  }
}
```

## Só com NIS

```ts
const comNis = await api.pessoas.resumo({ nis: '12345678901' });
// Retorna apenas `pessoa` e `beneficios` (os demais endpoints exigem CPF).
```

## Observações

- Faz **até 9 requisições** em paralelo — respeite o [rate limit](../guides/rate-limit.md).
- Cada seção traz a **primeira página**; para mais, veja [Paginação](../guides/pagination.md).

Relacionados: [Pessoas](../reference/pessoas.md) · [Tratamento de erros](../guides/error-handling.md)
