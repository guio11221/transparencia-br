# Publicação

Checklist para lançar uma versão no npm.

## Antes de publicar

1. **Escolha/valide o nome** do pacote e atualize `package.json`.
2. **Rode a verificação completa**:

   ```bash
   npm run check
   ```

3. **Inspecione o artefato** (exports ESM/CJS e tipos):

   ```bash
   npm pack --dry-run
   ```

   Confirme que `dist/`, `README.md` e `docs/` estão incluídos e que `.env`/`node_modules/` ficaram de fora.

4. **Versionamento SemVer** — atualize `version` (`npm version patch|minor|major`) e mantenha um changelog por release.

## Publicando

### Automático (recomendado)

O repositório tem o workflow `.github/workflows/release.yml`: ao empurrar uma tag `vX.Y.Z`,
o CI roda `npm run check` e publica no npm **com provenance** (assinatura verificável via OIDC).

```bash
npm version patch        # ou minor/major — cria o commit e a tag
git push origin main --follow-tags
```

Pré-requisito (uma vez): crie um **Automation token** no npm e salve como secret `NPM_TOKEN`
no GitHub (Settings → Secrets and variables → Actions).

### Manual (local)

```bash
npm login
npm publish --access public
```

> O npm exige 2FA (OTP) para contas com autenticação de dois fatores; o publish pelo CI evita
> o prompt interativo.

## Nunca publique

- Chaves de API (`.env`, exemplos, testes);
- `node_modules/`, `dist/` desatualizado ou artefatos temporários.

## Pós-release

- Crie a tag: `git tag vX.Y.Z && git push --tags` (o workflow de release cuida do publish).
- Atualize o changelog e as notas de release no GitHub.

Veja também: [Testes](testing.md) · [Configuração](configuration.md)
