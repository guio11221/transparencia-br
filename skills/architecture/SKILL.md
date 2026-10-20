# Architecture Skill

Preserve dependência unidirecional: módulos dependem de contratos do core; adaptadores concretos não devem ser importados por serviços. Exporte API pública exclusivamente em `src/index.ts`. Prefira injeção de dependência e DTOs explícitos.
