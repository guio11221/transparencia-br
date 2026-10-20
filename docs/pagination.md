# Paginação automática

O Portal usa `pagina` em diversos endpoints. A SDK suporta iterador assíncrono, para consumir com baixo uso de memória, e agregação com limites de segurança.

```ts
for await (const registros of api.contratos.paginas({ codigoOrgao: '26000' }, { maxPaginas: 10 })) {
  console.log(registros.length);
}
const todos = await api.licitacoes.todos({ pagina: 1 }, { maxPaginas: 10, maxItens: 1000 });
const bpc = await api.beneficios.todos('bpc', { nis: '12345678901' }, { maxPaginas: 10 });
```

A iteração termina na primeira página vazia ou após `maxPaginas` (padrão: 100). `todos()` limita o array a `maxItens` (padrão: 10.000). O iterador pode realizar uma requisição adicional para detectar o fim após uma página não vazia. Não há garantia de snapshot consistente quando a API altera registros durante a paginação.
