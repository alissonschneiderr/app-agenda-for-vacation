# Implementation Plan: Bairros de verdade, data no rótulo do dia e cidade aberta no dia de hoje

**Branch**: `main` (a pedido do usuário) | **Date**: 2026-10-28 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/013-city-days-labels-today/spec.md`

## Summary

Quatro ajustes pequenos, todos testados:

1. **"Bairros"** só com bairros de verdade. Uma lista explícita por cidade (`notNeighborhoods` no
   `meta.json`) e uma regra de tempo livre alimentam uma única função de domínio, usada pela seção e
   pela contagem do menu. Isso também corrige a seção vazia de 18/11. O tipo das áreas não muda, e os
   grupos da 010 ficam como estão (Q2 = A).
2. **"Dia N"** vira "DD/MM" no card, no cabeçalho e na capa do dia.
3. **O subtítulo** vira só o dia da semana por extenso ("Quinta-feira").
4. **A cidade** abre já rolada até o card de hoje (data local do aparelho), quando hoje está no
   período dela.

Detalhes em [research.md](research.md).

## Technical Context

**Language/Version**: TypeScript 5 (strict), Node 24 (build do conteúdo)

**Primary Dependencies**: as atuais; **nenhuma dependência nova**

**Storage**: conteúdo estático (campo novo `notNeighborhoods` nos `meta.json`). O estado do aparelho
não muda.

**Testing**: Vitest (domínio, conteúdo real, componentes) e Playwright (`chromium`, `mobile-360`,
`mobile-402`)

**Target Platform**: PWA offline, 360 × 780 e 402 × 874

**Project Type**: app web de página única (PWA)

**Performance Goals**: sem custo perceptível; a rolagem ao abrir a cidade é imediata

**Constraints**:
- nada além do descrito muda;
- nada deduzido (a lista de não-bairros é explícita);
- snapshot de NY intacto;
- offline-first.

**Scale/Scope**:
- 18 grupos saem de "Bairros" (7 de NY, 9 de Orlando, 2 de Miami);
- 3 "Manhã livre" saem pela regra de tempo livre;
- 3 lugares de rótulo;
- 1 tela com rolagem inicial.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Situação |
|---|---|
| I. Offline-first | ✅ Só conteúdo e telas que já estão no precache. A rolagem usa a data do aparelho, sem rede. |
| II. Testes obrigatórios | ✅ Unit: `isNeighborhood`, `neighborhoods` (lista real por cidade), `formatDayMonth`, `formatWeekday`, `deviceToday`, `todayInCity`. Conteúdo: todo nome de `notNeighborhoods` existe no roteiro. Componentes: card, cabeçalho, capa, "Bairros" de 03/11, 11/11, 08/11 e 18/11 (bug R3, com teste que o reproduz). E2e a 360 e 402 px: cidade aberta no dia de hoje (dentro, antes, depois, dia de troca). |
| III. Simplicidade | ✅ Uma função de regra, um campo de conteúdo e duas funções de data. Nenhuma camada nova. O `dayNumber` sai se ficar sem uso. |
| Plataforma mobile-first | ✅ Rolagem e rótulos testados nas duas larguras. |

Pós-design: sem violações.

## Project Structure

### Documentation (this feature)

```text
specs/013-city-days-labels-today/
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
content/full/{nova-york,orlando,miami}/meta.json   # notNeighborhoods
scripts/
├── full-itinerary-schema.ts   # campo notNeighborhoods (opcional)
└── build-content.ts           # leva o campo ao conteúdo; erro se um nome não existe no roteiro
src/
├── content/types.ts           # FullItinerary.notNeighborhoods
├── domain/notebook.ts         # isNeighborhood; neighborhoods (inclui dia de viagem); contagem "bairros"
├── domain/trip.ts             # formatDayMonth, formatWeekday, deviceToday, todayInCity
├── components/DayCard.tsx     # chip DD/MM, eyebrow dia da semana
├── pages/Day.tsx              # cabeçalho e capa; sem alfinete no tempo livre
├── pages/City.tsx             # rolagem até o card de hoje ao abrir
├── pages/Nearby.tsx, components/NeighborhoodCard.tsx   # selo "Bairro" só em bairro
└── styles/base.css            # scroll-margin-top dos cards de dia
tests/
├── unit/notebook.test.ts, unit/trip.test.ts
├── content/content-rules.test.ts
├── components/{city,day,orlando-day,miami-day,nearby}.test.tsx
└── e2e/us-mobile.spec.ts      # US1 (013) a 360 e 402 px
```

**Structure Decision**: o projeto único de sempre. Regras no domínio, telas só exibem.

## Complexity Tracking

Sem violações a justificar.
