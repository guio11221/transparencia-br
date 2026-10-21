# Changelog

Todas as mudanças relevantes deste projeto são documentadas neste arquivo.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o
versionamento segue [Semantic Versioning](https://semver.org/lang/pt-BR/).
Os títulos de commit seguem [Conventional Commits](https://www.conventionalcommits.org/pt-br/).

## [Unreleased]

### Added

- Catálogo pesquisável de endpoints: `api.endpoints.buscar/listar/descrever/dominios/consultar`,
  com busca tolerante a acentos.
- Cobertura de **todos os 109 endpoints** oficiais (`endpoints.ts` + schemas zod por recurso).
- `beneficios.beneficiariosPorMunicipio()` e variantes de benefícios
  (`-por-municipio`, `-beneficiario-por-municipio`, `-por-cpf-ou-nis`).
- Recursos `situacao-imovel`, `orgaos-siafi`, `orgaos-siape` e `coronavirus/*`.
- Documentação de descoberta (`docs/reference/descoberta.md`).

### Changed

- `porId` usa um mapa exaustivo recurso → endpoint (sem fallback silencioso).
- CI roda em matriz Node 22/24 com `npm ci`, `format:check` e `pack:check`.

## [1.0.4]

### Changed

- Renomeia o pacote para `sdk-transparencia-br` e ajusta metadados do repositório.
- Adiciona licença MIT e reorganiza a documentação em `docs/`.

## [1.0.0]

### Added

- SDK TypeScript inicial para a API de Dados Abertos do Portal da Transparência.
