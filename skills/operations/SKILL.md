# Operação e escala

- Para adicionar endpoint, confirmar método/caminho/nomes de parâmetros em `/v3/api-docs`.
- Introduzir schema Zod de entrada por operação e fixtures de resposta; não presumir que CPF é aceito em rota `-por-nis`.
- Toda chamada externa deve usar o `HttpClientContract`; rate limiter e retry são aplicados apenas pelo cliente concreto `FetchHttpClient`.
- Evitar registrar query strings que contenham CPF/NIS; cache desativado por padrão.
- Para múltiplas réplicas, adicionar rate limiter distribuído sem mudar a API pública.
- Sempre executar `npm run check` antes de publicar.
