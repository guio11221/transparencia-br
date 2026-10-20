# Erros

`PortalApiError` contém `status` e `details`. Respostas 429/5xx são repetidas com backoff limitado. Falhas de validação Zod não chegam ao HTTP. AbortSignal pode cancelar consultas.

Não faça logging de identificadores completos ou payloads de benefícios; aplique controle de acesso, minimização e retenção conforme LGPD.
