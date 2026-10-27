# Implementation Plan: Seções do dia agrupadas por bairro, Transporte e Dicas só quando relevantes

**Branch**: `010-day-sections-by-neighborhood` | **Date**: 2026-10-27 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/010-day-sections-by-neighborhood/spec.md`

## Summary

A página do dia passa a mostrar:
- "Restaurantes e Cafés", "Brechós e Lojas" e a nova "Curiosidades" agrupadas pelos grupos do
  roteiro, com o nome do bairro preso no topo durante a rolagem;
- "Transporte" só com trechos de metrô, ferry, táxi ou carro (Q1 = A);
- "Dicas" sem dicas genéricas.

As atrações de compras mostram as lojas do seu bairro, com os mesmos dados da seção do dia. Tudo
é calculado no domínio (`src/domain/notebook.ts`) a partir do conteúdo atual. O relatório sai de
uma função testada. Detalhes em [research.md](research.md).

## Technical Context

**Language/Version**: TypeScript 5 (strict), Node 24 para scripts

**Primary Dependencies**: Preact, Vite, vite-plugin-pwa (sem mudança; **nenhuma dependência nova**)

**Storage**: conteúdo estático gerado no build; estado do usuário em localStorage (sem mudança)

**Testing**: Vitest + Testing Library (unit e componentes), Playwright (`chromium`, `mobile-360`,
`mobile-402`)

**Target Platform**: PWA offline em Safari iOS e Chrome Android; referência 360 × 780 e 402 × 874

**Project Type**: app web de página única (PWA)

**Performance Goals**: JS inicial < 100 KB gzip (hoje 35,7 KB); sem custo perceptível ao abrir um dia

**Constraints**:
- offline-first;
- não inventar dados (bairro só do roteiro; dica nunca reescrita);
- não mexer no snapshot de NY;
- manter tudo da 009.

**Scale/Scope**: 22 dias, cerca de 230 lugares, 10 dicas, 7 atrações de compras

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Situação |
|---|---|
| I. Offline-first | ✅ Só leitura do conteúdo já no precache. Os fluxos do dia e da atração funcionam sem rede, com um teste e2e offline (agrupamento e Transporte). |
| II. Testes obrigatórios | ✅ Unit para `dayPlaceGroups`, `isRelevantMove`, `isGenericTip`, `dayMoves`, `dayTips`, `shoppingSlice` e `sectionReview`. Componentes para o Dia e a atração. E2E a 360 e 402 px para cada user story. |
| III. Simplicidade | ✅ Nenhuma dependência e nenhuma camada nova. Funções puras no módulo de domínio que já existe. Sticky só com CSS. `dayPlaces` passa a derivar de `dayPlaceGroups` (sem duplicar). O código que deixar de ser usado sai. |
| Plataforma mobile-first | ✅ Cabeçalhos presos testados a 360 e 402 px. |

Pós-design: sem violações; "Complexity Tracking" vazio.

## Project Structure

### Documentation (this feature)

```text
specs/010-day-sections-by-neighborhood/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/screens.md
├── checklists/requirements.md
├── tasks.md             # /speckit-tasks
└── report.md            # na implementação (FR-018)
```

### Source Code (repository root)

```text
src/
├── domain/notebook.ts        # dayPlaceGroups, isRelevantMove, isGenericTip, dayMoves, dayTips,
│                             # shoppingSlice, sectionReview; DaySectionId + 'curiosidades'
├── components/
│   ├── HoodGroups.tsx        # novo: grupos com cabeçalho preso + DayPlaceCard
│   ├── DayPlaceCard.tsx      # resumo com `works` para curiosidades
│   └── DayAlerts.tsx         # recebe só as dicas que ficam
├── pages/
│   ├── Day.tsx               # seções agrupadas, Curiosidades, Moves com dayMoves, ?secao=
│   └── StepDetail.tsx        # bloco "Lojas e brechós em <grupo>"
└── styles/base.css           # .hood-group, .hood-group-head (sticky), .step-shops

tests/
├── unit/notebook.test.ts             # regras e números reais (R1–R8)
├── components/day.test.tsx           # agrupamento, Curiosidades, Transporte, Dicas
├── components/step-detail.test.tsx   # atração de compras
└── e2e/us-mobile.spec.ts             # US1–US3 a 360 e 402 px (+ offline)
```

**Structure Decision**: o projeto único de sempre. As regras ficam no domínio e as telas só
renderizam o que o domínio devolve.

## Complexity Tracking

Sem violações a justificar.
