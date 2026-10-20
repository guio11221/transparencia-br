# Exemplo: verificando auxílios por CPF/NIS

Consulta todos os programas sociais aplicáveis a um identificador.

```ts
import 'dotenv/config';
import { Transparencia } from 'sdk-transparencia-br';

const api = new Transparencia({ apiKey: process.env.PORTAL_API_KEY! });

// 1) Descubra os programas disponíveis (sem chamada à API)
for (const p of api.beneficios.catalogo()) {
  console.log(`${p.nome} — aceita ${p.identificador}, mês: ${p.aceitaMes}`);
}
```

## Todos de uma vez

```ts
const porCpf = await api.beneficios.porPessoa({ cpf: '12345678901' }); // 6 programas
const porNis = await api.beneficios.porPessoa({ nis: '12345678901' }); // 9 programas

for (const r of porNis) {
  if (r.status === 'sucesso') {
    console.log(`${r.programa}: ${r.dados.length} registros`);
  } else {
    console.warn(`${r.programa}: ${r.erro.message ?? r.erro.mensagem}`);
  }
}
```

## Uma seleção específica

```ts
const alvo = await api.beneficios.consultar({
  nis: '12345678901',
  programas: ['bpc', 'peti', 'seguroDefeso'],
});
```

## Um programa e uma competência

```ts
const bpc = await api.beneficios.bpc({ nis: '12345678901' });
const parcelasJaneiro = await api.beneficios.bolsaFamilia({ cpf: '12345678901', mes: '2024-01' });
```

## Por município

```ts
const municipio = await api.beneficios.porMunicipio('bolsa-familia', '3550308', 202401);
```

## Observações

- Saque aceita **apenas NIS** — não passe `{ cpf }` para `bolsaFamiliaSacado`, `novoBolsaFamilia` ou `auxilioBrasil`.
- Erros de identificador são **síncronos** (`Error`), não rejeição de Promise.
- `porPessoa` faz 6–9 requisições; combine com [rate limit](../guides/rate-limit.md).

Relacionados: [Benefícios](../reference/beneficios.md) · [Endpoints](../reference/endpoints.md)
