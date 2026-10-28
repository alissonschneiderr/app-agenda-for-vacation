# Implementation Plan: Sem contagens nem percentuais de progresso — só o check de feito/não feito

**Branch**: `main` (a pedido do usuário) | **Date**: 2026-10-28 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/015-remove-progress-counts/spec.md`

## Summary

Remoção pura, sem nada novo na tela:
- **progresso** (US1): saem o anel do cabeçalho (cidade e dia), o "X de Y feitas" com barra dos cards
  da cidade e do dia, e os componentes `ProgressRing` e `ProgressBar` (R1, R2);
- **contagens de itens** (US2, Q1 = B): saem "N paradas", o "(N)" de "Opções", das abas do grupo e de
  "Ver todos", a linha "Comer N · Lojas N" dos cards de bairro e o "N avisos" da lista de avisos (R3,
  R4);
- **domínio**: o cálculo de progresso que só servia para a tela sai (`Progress`, `progressOf`,
  `sumProgress`, `tripProgress`, `dayProgress`, `activityCount`, `stops`, `counts`), sem tocar no que é
  salvo no aparelho (R5).

O check de cada parada, o "Feito / Pular" da atração, "N noites", "N dias de roteiro" e "N destinos"
não mudam.

## Technical Context

**Language/Version**: TypeScript 5 (strict), Node 24 (build e scripts)

**Primary Dependencies**: as atuais (Preact, Vite, vite-plugin-pwa); **nenhuma dependência nova**

**Storage**: sem mudança. As marcas (`activityMarks`) continuam no IndexedDB com o mesmo formato.

**Testing**:
- Vitest: componentes (`DayCard`, `CityCard`, `NeighborhoodCard`, `PageHeader`, `DayAlerts`, `Day`,
  `City`, `Nearby`) sem número de itens nem progresso; o check continua marcando; testes de domínio
  só do que fica.
- Playwright (`chromium`, `mobile-360`, `mobile-402`): varredura das telas sem "%", "feitas",
  `role="progressbar"` e "(N)"; marcar, reabrir e continuar marcado.

**Target Platform**: Chrome no Galaxy S24 Ultra e Safari no iPhone 17, app instalado

**Project Type**: app web de página única (PWA)

**Performance Goals**: sem mudança (o JS inicial só diminui)

**Constraints**:
- offline-first;
- formato das marcas salvo intacto;
- nada além do pedido;
- snapshot de NY intacto.

**Scale/Scope**: cerca de 12 arquivos de código alterados, 2 componentes apagados, regras de CSS
apagadas, testes ajustados

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Situação |
|---|---|
| I. Offline-first | ✅ Nada passa a depender de internet. As marcas continuam salvas no aparelho, no mesmo formato. |
| II. Testes obrigatórios | ✅ Unit e componentes para cada tela que perde número. E2e a 360 e 402 px com a varredura de "%", "feitas", barras e "(N)", e o check marcando e salvando. |
| III. Simplicidade | ✅ Só remoção. Componentes, CSS e cálculos sem uso saem (FR-005). Nenhuma dependência nova. |
| Plataforma mobile-first | ✅ Os dois alvos conferidos; o cabeçalho sem o anel dá mais espaço ao título. |

Pós-design: sem violações.

## Project Structure

### Documentation (this feature)

```text
specs/015-remove-progress-counts/
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
├── components/ProgressRing.tsx     # apagado
├── components/ProgressBar.tsx      # apagado
├── components/PageHeader.tsx       # sem `progress` e `scope`
├── components/CityCard.tsx         # sem "X de Y feitas" e barra
├── components/DayCard.tsx          # sem "N paradas", "X/Y feitas" e barra
├── components/NeighborhoodCard.tsx # sem a linha "Comer N · Lojas N"
├── components/DayAlerts.tsx        # "Ver todos" e "Avisos do dia", sem número
├── pages/City.tsx                  # PageHeader sem anel
├── pages/Day.tsx                   # PageHeader sem anel; capa sem "N paradas"; "Opções"
├── pages/Nearby.tsx                # abas sem "(N)"
├── domain/trip-view.ts             # sem Progress, progressOf, sumProgress, tripProgress, activityCount
├── domain/notebook.ts              # sem progress em TripCover/CityCard/DayCard, sem stops e counts
├── domain/full-itinerary.ts        # sem dayProgress
└── styles/base.css                 # sem .progress*, .ring*, .nb-count, .nb-bar
tests/
├── components/*.test.tsx           # expectativas de progresso e contagem trocadas
├── unit/{notebook,trip-view,full-itinerary}.test.ts
└── e2e/us-mobile-no-progress.spec.ts   # novo: varredura a 360 e 402 px
```

**Structure Decision**: o projeto único de sempre. Nada novo; só remoção e ajuste de testes.

## Complexity Tracking

Sem violações a justificar.
