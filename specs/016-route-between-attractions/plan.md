# Implementation Plan: Rota entre dois lugares do roteiro

**Branch**: `main` (a pedido do usuário) | **Date**: 2026-10-28 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/016-route-between-attractions/spec.md`

## Summary

Um botão "Rota até…" (ícone `route`) ao lado de "Abrir no mapa" leva a uma tela nova do app,
`#/rota/<data>/<chave>` (R1), no mesmo formato da tela "Motorista". A tela lista os outros lugares do
dia — paradas com horário, depois restaurantes, lojas e curiosidades — e "Ver outros dias" mostra os
da cidade inteira (Q1 = C, R4). Tocar num lugar abre o Google Maps com a rota da origem até ele
(`maps/dir/?api=1&origin=…&destination=…`, R3); "Inverter" troca o sentido. O local de cada lugar é o
mesmo do "Abrir no mapa" (R2), sem nada inventado. O botão aparece na atração, no detalhe do lugar e
nos cards de restaurantes, lojas e curiosidades (Q2 = B, R5). Sem internet, a lista abre e a escolha
mostra os dois endereços (R6).

## Technical Context

**Language/Version**: TypeScript 5 (strict), Node 24 (build e scripts)

**Primary Dependencies**: as atuais (Preact, Vite, vite-plugin-pwa); **nenhuma dependência nova**

**Storage**: nenhum dado novo salvo (FR-007)

**Testing**:
- Vitest: `routeSpots`, `routeChoices`, `routeUrl`, `hasRoute` com o conteúdo real (01/11, 07/11,
  08/11, 19/11); componentes da tela `Route` (lista, inverter, outros dias, offline, origem inválida)
  e dos botões em `StepDetail`, `PlaceCard` e `DayPlaceCard`.
- Playwright (`mobile-360`, `mobile-402`): `tests/e2e/us-mobile-route.spec.ts` — abrir, escolher,
  conferir o `href`, inverter, outros dias, voltar, offline, sem rolagem lateral.

**Target Platform**: Chrome no Galaxy S24 Ultra e Safari no iPhone 17, app instalado

**Project Type**: app web de página única (PWA)

**Performance Goals**: a lista abre sem atraso perceptível (cálculo sobre o conteúdo já carregado; NY
tem cerca de 70 paradas e 190 lugares com mapa); JS inicial < 100 KB gzip

**Constraints**:
- offline-first (a lista abre sem internet; só a rota precisa dela);
- nunca inventar local: só o link de mapa ou o ponto do roteiro;
- nada além do pedido;
- snapshot de NY intacto.

**Scale/Scope**: 1 tela nova, 1 módulo de domínio, 1 componente de botão, 4 telas com o botão,
cerca de 8 arquivos de código

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Situação |
|---|---|
| I. Offline-first | ✅ A tela da rota é do app e abre offline. A única parte que precisa de internet (o Google Maps) falha de forma explícita, com os dois endereços (R6). |
| II. Testes obrigatórios | ✅ Unit do domínio com conteúdo real, componentes da tela e dos botões, e2e a 360 e 402 px com offline. |
| III. Simplicidade | ✅ Nenhuma dependência nova; URL documentada do Google Maps; reaproveita `mapsQuery`, `dayPlaceGroups`, `useOnline`, o padrão de rota do Motorista. Sem pop-up modal (R1). |
| Plataforma mobile-first | ✅ Tela cheia, alvos ≥ 44 px, voltar do celular fecha a lista. |

Pós-design: sem violações.

## Project Structure

### Documentation (this feature)

```text
specs/016-route-between-attractions/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/screens.md
├── checklists/requirements.md
└── tasks.md          # /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── domain/route.ts               # novo: RouteSpot, routeSpot, routeSpots, routeChoices, routeUrl, hasRoute
├── components/RouteButton.tsx    # novo: "Rota até…" (variante botão e variante link do card)
├── pages/Route.tsx               # novo: a lista, inverter, outros dias, offline
├── app.tsx                       # rota #/rota/:date/:key
├── pages/StepDetail.tsx          # botão na linha de mapa/motorista
├── components/PlaceCard.tsx      # botão ao lado de "Abrir no mapa" (detalhe do lugar)
├── components/DayPlaceCard.tsx   # link ao lado de "Abrir no mapa" (cards do dia)
└── styles/base.css               # estilos da lista (reaproveita .page-head, .chip, .place-row)
tests/
├── unit/route.test.ts
├── components/route.test.tsx
├── components/{step-detail,place-card,day}.test.tsx   # o botão aparece / não aparece
└── e2e/us-mobile-route.spec.ts
```

**Structure Decision**: o projeto único de sempre; uma tela nova no padrão das existentes.

## Complexity Tracking

Sem violações a justificar.
