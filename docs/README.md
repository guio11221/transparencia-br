# Documentação — sdk-transparencia-br

> SDK TypeScript para a API de Dados Abertos do Portal da Transparência do Governo Federal.

Bem-vindo à documentação completa. Escolha um caminho:

## :rocket: Comece aqui

- [Instalação e primeiros passos](guides/installation.md) — instalar, configurar e fazer a primeira consulta
- [Configuração](guides/configuration.md) — todas as opções do cliente
- [Tratamento de erros](guides/error-handling.md) — validação síncrona, `PortalApiError`, retries

## :books: Referência por domínio

- [Benefícios e auxílios](reference/beneficios.md) — Bolsa Família, BPC, PETI, Seguro Defeso, catálogo
- [Pessoas](reference/pessoas.md) — consultas pontuais e o resumo consolidado
- [Cartões de pagamento](reference/cartoes.md) — CPGF, CPCC, CPDC
- [Recursos governamentais](reference/recursos.md) — servidores, contratos, licitações, convênios, despesas, sanções
- [Endpoints](reference/endpoints.md) — mapa método → caminho oficial
- [Contratos e limitações](reference/contracts.md) — parâmetros obrigatórios e escopo

## :wrench: Guias de operação

- [Paginação](guides/pagination.md) — iteradores assíncronos e coleta com limites
- [Rate limiting](guides/rate-limit.md) — fila, janela deslizante e limites oficiais
- [Cache e privacidade](guides/cache.md) — TTL opt-in e LGPD
- [Segurança](guides/security.md) — chave, dados pessoais e exposição
- [Arquitetura](guides/architecture.md) — como o SDK é organizado por dentro
- [Testes](guides/testing.md) — como rodar e escrever testes
- [Publicação](guides/publishing.md) — checklist de release no npm

## :bulb: Exemplos (copy-paste)

- [O que uma pessoa recebe](examples/o-que-uma-pessoa-recebe.md)
- [Verificando auxílios por CPF/NIS](examples/auxilios-por-cpf-nis.md)
- [Cartões governamentais de um servidor](examples/cartoes-de-servidor.md)
- [Contratos de um órgão com paginação](examples/contratos-por-orgao.md)
- [Sanções de uma empresa](examples/sancoes-de-empresa.md)

---

**Fonte oficial da API:** [api.portaldatransparencia.gov.br](https://api.portaldatransparencia.gov.br/) · [Swagger UI](https://api.portaldatransparencia.gov.br/swagger-ui/index.html)
