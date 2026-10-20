# Arquitetura

## Camadas

```
src/
├── client/           # PortalTransparenciaClient — compõe os serviços
├── core/
│   ├── contracts/    # portas (HttpClientContract)
│   ├── http/         # adaptador Fetch + scheduler + cache
│   ├── errors/       # PortalApiError
│   ├── pagination/   # paginate / collectPages
│   ├── schemas/      # schemas compartilhados (paginação)
│   └── types/        # SdkOptions
├── modules/          # serviços por domínio (beneficios, pessoas, consultas...)
└── index.ts          # API pública
```

- **`client`** compõe os serviços e é o ponto de entrada (`Transparencia`).
- **`modules`** define as consultas e os DTOs (Zod) por domínio.
- **`core/contracts`** estabelece a **porta HTTP**; **`core/http`** implementa o adaptador Fetch.
- **`core`** não depende de frameworks web nem de `modules` (inversão por injeção).

## Princípios

- **Ports & adapters.** `HttpClientContract` é a fronteira; o transporte real (`FetchHttpClient`) é substituível — é assim que os testes rodam sem rede.
- **Fonte única de caminhos.** `src/modules/consultas/endpoints.ts` mapeia os caminhos oficiais; os serviços não inventam URLs.
- **Validação na borda.** Filtros são validados com Zod antes de chegar ao HTTP.
- **Respostas abertas.** Módulos sem esquema confirmado retornam `RegistroDto` (`Record<string, unknown>` extensível) — **não invente campos tipados** sem validar contra o OpenAPI.
- **Agregação isolada.** Consultas multi-fonte usam `Promise.allSettled` e devolvem resultado por fonte.

## Adicionando um módulo

1. Adicione os caminhos em `src/modules/consultas/endpoints.ts`.
2. Crie o schema Zod do endpoint em `dtos/` (com os obrigatórios).
3. Crie o serviço em `services/` (estendendo `RecursoService`/`RecursoComIdService` ou compondo `ConsultasService`).
4. Exponha em `client/portal-transparencia.client.ts` e exporte em `src/index.ts`.
5. Cubra com teste em `tests/unit/` usando `httpClient` falso.

Veja o guia da pasta `skills/new-module` para o passo a passo interno.

Veja também: [Contratos e limitações](../reference/contracts.md) · [Testes](testing.md)
