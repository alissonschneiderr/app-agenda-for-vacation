# Implementation Plan: Guia de Pontos Turísticos e Roteiros Salvos

**Branch**: `001-tourist-guide-itineraries` | **Date**: 2026-10-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-tourist-guide-itineraries/spec.md`

## Summary

PWA estática, sem backend, em português, que serve de guia para uma viagem fixa (Nova York →
Orlando → Miami, 31/10 a 21/11/2026). Mostra pontos turísticos por cidade em lista e mapa,
permite favoritar e montar roteiros por dia, e já vem com 19 roteiros sugeridos. Todo o conteúdo
(JSON + fotos livres da Wikimedia Commons) é versionado no repositório e pré-armazenado pelo
Service Worker na instalação, então tudo funciona offline. Favoritos e roteiros ficam apenas no
aparelho. Entrega obrigatória até 30/10/2026.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 24 LTS (apenas build e scripts)

**Primary Dependencies**: Preact 11 (UI), Leaflet 1.9 (mapa, carregado sob demanda),
vite-plugin-pwa (Service Worker/Workbox e manifest); build com Vite 8. Roteamento por hash próprio.

Justificativa das dependências de runtime (Princípio III; detalhes em [research.md](./research.md) R2):

| Dependência | Por que a plataforma nativa não basta |
|---|---|
| preact | Renderização declarativa e testável das ~8 telas, em ~4 KB |
| leaflet | Mapa interativo com marcadores; não há componente de mapa nativo na web |

**Storage**: Conteúdo do guia: arquivos JSON e imagens estáticos, pré-cacheados. Dados do
usuário (favoritos, roteiros): `localStorage` com persistência solicitada via
`navigator.storage.persist()`.

**Testing**: Vitest + @testing-library/preact (unidade e componentes), Playwright (E2E, incluindo
cenários offline), validação de conteúdo com Zod em teste.

**Target Platform**: Safari iOS 17+ e Chrome Android atuais (instalado na tela inicial), navegadores
desktop atuais.

**Project Type**: Aplicação web (PWA) estática, frontend único.

**Performance Goals**: Lista e detalhe em < 2 s com conteúdo já salvo (SC-005); bundle de JS
inicial < 100 KB gzip.

**Constraints**: 100% offline após a instalação (FR-012/FR-013); nenhum dado do usuário sai do
aparelho (FR-017); conteúdo total (JSON + fotos) ≤ 40 MB; prazo 30/10/2026.

**Scale/Scope**: 1 usuário/grupo; ~100–150 pontos; 3 cidades; 19 roteiros sugeridos; ~8 telas.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio / Regra | Como o plano atende | Status |
|---|---|---|
| I. Offline-First: spec declara fluxos offline | FR-012 a FR-016 na spec | ✅ |
| I. Fluxos essenciais offline após 1º carregamento | Precache de todo o app, JSON e fotos na instalação do SW | ✅ |
| I. Dados criados offline não se perdem | Dados do usuário só locais; escrita síncrona em `localStorage`; sem sincronização | ✅ |
| I. Indicar offline e conteúdo desatualizado | Barra de status offline + data de verificação por ponto | ✅ |
| I. Falha explícita do que exige rede | Mapa sem tiles e "como chegar" mostram mensagem amigável | ✅ |
| II. Testes por user story antes do merge | Testes de componente + E2E por story (ver quickstart) | ✅ |
| II. Testes unitários de domínio e cache | Testes de horário/fuso, busca, roteiros, repositório local, seed | ✅ |
| II. Teste sem rede por fluxo offline | Playwright `context.setOffline(true)` para US1, US2, US3 | ✅ |
| II. CI verde para merge | GitHub Actions: lint, tipos, unidade, conteúdo, E2E | ✅ |
| III. Menor solução / sem requisitos hipotéticos | Sem backend, sem contas, sem estado global, JSON estático | ✅ |
| III. Dependências justificadas | Tabela em research.md (R2) | ✅ |
| III. Abstrações justificadas | Única camada extra: módulo `storage` (necessário para testar e versionar o formato) | ✅ |
| Plataforma: PWA instalável, mobile-first | Manifest + SW via vite-plugin-pwa; CSS mobile-first | ✅ |
| Fluxo: branch própria + PR com CI verde | Branch `001-tourist-guide-itineraries` (a criar após commit inicial) | ✅ |

**Resultado**: nenhuma violação. Re-checagem pós-design (Phase 1): mantido, sem violações.

## Project Structure

### Documentation (this feature)

```text
specs/001-tourist-guide-itineraries/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── content-schema.md    # formato dos JSON de conteúdo
│   ├── user-storage.md      # formato dos dados do usuário no aparelho
│   └── routes.md            # telas/rotas da PWA
└── tasks.md                 # gerado por /speckit-tasks
```

### Source Code (repository root)

```text
content/                     # fonte do conteúdo, editada por humanos/Claude
├── trip.json                # cidades + trechos da viagem
├── categories.json
├── points/
│   ├── nova-york.json       # fotos referenciadas por `ref` (Commons/Wikipédia)
│   ├── orlando.json
│   └── miami.json
├── itineraries.json         # 19 roteiros sugeridos
└── photo-credits.json       # gerado por scripts/fetch-photos.ts

public/
├── photos/                  # fotos processadas (WebP), geradas por script e commitadas
├── icons/                   # ícones da PWA
└── data/content.json        # bundle de conteúdo gerado no build (não editar)

scripts/
├── fetch-photos.ts          # baixa da Commons, redimensiona, extrai autor/licença
├── content-schema.ts        # schemas Zod e regras de conteúdo
├── build-content.ts         # valida e junta content/ → public/data/content.json
└── check-budget.ts          # orçamento de JS inicial e de conteúdo

src/
├── main.tsx
├── app.tsx                  # rotas
├── domain/                  # lógica pura, sem UI
│   ├── trip.ts              # cidade do dia, dias de locomoção
│   ├── opening-hours.ts     # "aberto agora" em America/New_York
│   ├── search.ts            # busca sem acento/caixa, filtros
│   └── itineraries.ts       # criar, reordenar, remover, seed dos sugeridos
├── storage/
│   └── user-store.ts        # leitura/escrita versionada em localStorage
├── content/
│   └── load.ts              # carrega public/data/content.json
├── pages/                   # Home, PointDetail, Favorites, Itineraries, ItineraryDetail, Credits
├── components/              # PointCard, PointMap, CityPicker, CategoryFilter, OfflineBanner...
└── styles/

tests/
├── unit/                    # domain/, storage/
├── components/              # páginas e componentes
├── content/                 # validação do conteúdo (Zod) e regras FR-023–FR-026, SC-008
└── e2e/                     # Playwright, inclui cenários offline
```

**Structure Decision**: projeto único de frontend na raiz. `content/` separado de `src/` porque é
dado editorial, revisado pelo usuário, e não código. `domain/` concentra a lógica testável sem
UI (Princípio II).

## Cronograma (prazo 30/10/2026)

| Datas | Entrega |
|---|---|
| 19–20/10 | Setup (Vite, PWA, CI, deploy), schema de conteúdo, `domain/` com testes |
| 21–23/10 | US1 (guia, mapa, detalhe, offline) + conteúdo de Nova York |
| 23–24/10 | US2 (favoritos) + conteúdo de Orlando e Miami |
| 25–27/10 | US3 (roteiros, sugeridos, agrupamento por dia) + 19 roteiros |
| 27–28/10 | Fotos e créditos, E2E offline, ajustes de UX em celular real |
| 28–29/10 | **Revisão do conteúdo pelo usuário** e correções |
| 30/10 | Instalação no(s) celular(es), abrir offline em modo avião e conferir |

## Complexity Tracking

| Item | Por que é necessário | Alternativa mais simples rejeitada porque |
|---|---|---|
| Módulo `src/storage/user-store.ts` | Isola o `localStorage` para testar quota cheia, JSON corrompido e migrações | Acesso direto ao `localStorage` nas telas espalharia o tratamento de erro e impediria testes |
