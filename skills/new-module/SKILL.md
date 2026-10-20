# Criar novo módulo

1. Conferir rota, parâmetros obrigatórios, formato de retorno e disponibilidade no Swagger oficial.
2. Criar DTO em `src/modules/<recurso>/dtos/` com validação Zod quando a API for conhecida.
3. Implementar serviço injetando `HttpClientContract`, sem dependência de frameworks.
4. Expor serviço em `Transparencia`, mantendo versões anteriores quando possível.
5. Adicionar testes: URL, query, retorno, resposta vazia e erro.
6. Documentar exemplos e limitações em `docs/`.

Nunca inferir que um endpoint aceita CPF, NIS, `porId` ou paginação sem confirmar no contrato oficial.
