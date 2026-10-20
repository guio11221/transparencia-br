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

```bash
npm login
npm publish --access public
```

## Nunca publique

- Chaves de API (`.env`, exemplos, testes);
- `node_modules/`, `dist/` desatualizado ou artefatos temporários.

## Pós-release

- Crie a tag: `git tag vX.Y.Z && git push --tags`.
- Atualize o changelog e as notas de release no GitHub.

Veja também: [Testes](testing.md) · [Configuração](configuration.md)
