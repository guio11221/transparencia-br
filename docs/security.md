# Segurança e privacidade

Use a chave da API somente no backend. CPF/NIS são dados pessoais: aplique autenticação, autorização, minimização e retenção apropriada à LGPD. Não registre identificadores completos em logs, URLs de diagnóstico ou ferramentas APM. O Portal pode aplicar limites de requisições, inclusive limites específicos para APIs restritas. Para produção, adicione rate limiter compartilhado e cache com TTL conforme finalidade e base legal. Não exponha a operação de agregação sem controles de abuso.
