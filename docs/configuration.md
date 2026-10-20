# Configuração

`apiKey` é obrigatória quando se usa FetchHttpClient; `baseUrl` usa `https://api.portaldatransparencia.gov.br`; `timeoutMs` padrão 15000; `retries` padrão 2; `fetchImpl` permite mocks; `httpClient` injeta adaptador.

Use a chave somente no backend. Os limites de taxa variam por endpoint e horário. Configure throttling externo para alto volume e respeite 429.
