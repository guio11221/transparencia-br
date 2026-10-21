# Changelog

Todas as mudanças relevantes deste projeto são documentadas neste arquivo.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o
versionamento segue [Semantic Versioning](https://semver.org/lang/pt-BR/).
Os títulos de commit seguem [Conventional Commits](https://www.conventionalcommits.org/pt-br/).

## [Unreleased]

### Added

- Catálogo pesquisável de endpoints: `api.endpoints.buscar/listar/descrever/dominios/consultar`,
  com busca tolerante a acentos. `consultar` também aceita uma entrada do catálogo
  (`EndpointInfo`) diretamente.
- Cobertura de **todos os 109 endpoints** oficiais (`endpoints.ts` + schemas zod por recurso).
- `beneficios.beneficiariosPorMunicipio()` e variantes de benefícios
  (`-por-municipio`, `-beneficiario-por-municipio`, `-por-cpf-ou-nis`).
- Recursos `situacao-imovel`, `orgaos-siafi`, `orgaos-siape` e `coronavirus/*`.
- `secoesResumo()` e os tipos `ChaveResumo`/`EntradaResumo` para iterar o resumo de pessoa
  com chaves tipadas.
- Documentação de descoberta (`docs/reference/descoberta.md`).

### Changed

- `porId` usa um mapa exaustivo recurso → endpoint (sem fallback silencioso).
- CI roda em matriz Node 22/24 com `npm ci`, `format:check`, `test:coverage` e `pack:check`.

### Tests

- Testes de integração do transporte HTTP com `fetch` falso (rate limit, cache, retries,
  deduplicação e wiring do cliente).
- Teste de contrato contra o OpenAPI oficial (pula automaticamente quando offline).
- Cobertura mínima de 80% aplicada no CI.

## [1.0.4]

### Changed

- Renomeia o pacote para `sdk-transparencia-br` e ajusta metadados do repositório.
- Adiciona licença MIT e reorganiza a documentação em `docs/`.

## [1.0.0]

### Added

- SDK TypeScript inicial para a API de Dados Abertos do Portal da Transparência.
