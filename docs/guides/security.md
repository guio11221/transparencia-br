# Segurança e privacidade

## Chave da API

- Use a chave **somente no backend**. Nunca em SPA, app mobile distribuído ou repositório.
- Guarde em variável de ambiente (`PORTAL_API_KEY`) — nunca hardcoded.
- A chave é enviada no header `chave-api-dados`.

## Dados pessoais (LGPD)

CPF/NIS e dados de benefícios são **dados pessoais**:

- aplique base legal, finalidade, minimização e retenção apropriadas;
- **não registre identificadores completos** em logs, URLs de diagnóstico ou APM;
- proteja as consultas nominais com autenticação e autorização no seu backend;
- evite expor a **operação de agregação** (`pessoas.resumo`, `beneficios.porPessoa`) sem controles de abuso — ela multiplica requisições por identidade.

## Limites de requisição

O Portal aplica limites, inclusive limites **específicos para APIs restritas**. Para produção, adicione rate limiter compartilhado e cache com TTL conforme a finalidade.

## Cache

O cache é **opt-in** e desligado por padrão, justamente para não reter dados pessoais sem intenção. Veja [Cache e privacidade](cache.md).

## Reporte

Encontrou um problema de segurança? Abra uma issue **sem detalhes sensíveis** ou contate o mantenedor em particular.

Veja também: [Configuração](configuration.md) · [Tratamento de erros](error-handling.md)
