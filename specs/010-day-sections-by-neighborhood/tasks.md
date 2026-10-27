# Tasks: Seções do dia agrupadas por bairro, Transporte e Dicas só quando relevantes

**Input**: Design documents from `specs/010-day-sections-by-neighborhood/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/screens.md, quickstart.md

**Tests**: obrigatórios (constituição, Princípio II). Em cada história, o teste vem antes da
implementação e deve falhar primeiro.

**Comandos**: prefixar com `export PATH=/opt/homebrew/opt/node@24/bin:$PATH`.

**Decisões**: Q1 = A ("Transporte" só com trechos não a pé) e Q2 = A (cabeçalho = nome do grupo do
roteiro).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência pendente)
- **[Story]**: US1–US4 da spec

---

## Phase 1: Setup

- [ ] T001 Com autorização do usuário, criar a branch `010-day-sections-by-neighborhood` a partir de `009-mobile-first-navigation` e commitar as specs da 010. Sem autorização, seguir na branch atual e registrar a pendência no `report.md`.
- [X] T002 Conferir a base: `npm run typecheck && npm test` verdes antes de mudar código.

---

## Phase 2: Foundational (bloqueia todas as histórias)

**Purpose**: o grupo de bairro e a nova seção no domínio, usados pelas US1 e US3.

- [X] T003 Em `tests/unit/notebook.test.ts`, criar os testes de `dayPlaceGroups` com o conteúdo real (devem falhar):
  - 01/11 `food`: 6 grupos, nomes na ordem `['SoHo','Nolita','Chinatown','Little Italy','Lower East Side','East Village']`, contagens `[2,4,6,3,4,5]`, total 24;
  - 01/11 `shop`: grupos `['SoHo','Nolita','Lower East Side','East Village']`, total 17;
  - 01/11 `screen`: total 5 em 4 grupos;
  - 06/11 `food`: grupos `['Empire State e arredores (Midtown South)','Noite: jantar no Harlem']`, o segundo com `isNeighborhood: false`;
  - nenhum grupo repetido e nenhum grupo vazio, em nenhum dia;
  - "Outros" (`areaId: null`) ausente em todos os dias;
  - fixture com um lugar fora de qualquer grupo → grupo "Outros" por último;
  - fixture com um lugar em dois grupos → fica só no primeiro;
  - `dayPlaces(view, k)` igual a `dayPlaceGroups(view, k).flatMap(g => g.items)`.
- [X] T004 Em `src/domain/notebook.ts`, implementar `PlaceGroup` e `dayPlaceGroups(view, kind: 'food' | 'shop' | 'screen')` conforme `data-model.md`:
  - `name` = `area.name` como no roteiro (Q2 = A);
  - `isNeighborhood` = `area.kind === 'bairro'`;
  - "Outros" sempre por último e só se tiver itens;
  - sem repetir nome dentro da seção.

  Reescrever `dayPlaces` como `dayPlaceGroups(...).flatMap(g => g.items)`, aceitando também `'screen'`. Para `screen`, o resumo usa a descrição e, sem ela, `works`. T003 deve passar.
- [X] T005 Em `src/domain/notebook.ts`, acrescentar `'curiosidades'` a `DaySectionId` e a `SECTION_LABEL` ("Curiosidades"), entre `lojas` e `bairros`. Em `daySections`, a contagem é `dayPlaces(view, 'screen').length`. Atualizar os testes de seções da 009 em `tests/unit/notebook.test.ts`: 01/11 passa a `['paradas','comer','lojas','curiosidades','bairros','transporte','dicas']`.

**Checkpoint**: domínio com grupos e com a nova seção; `npm test` verde.

---

## Phase 3: User Story 1 - Comer, comprar e curiosidades por bairro (Priority: P1) 🎯 MVP

**Goal**: as três seções do dia agrupadas pelos grupos do roteiro, com cabeçalho preso.

**Independent Test**: 01/11, 02/11 e 04/11 a 360 e 402 px, conferindo:
- a ordem dos grupos;
- nenhum bairro repetido;
- cabeçalhos só com o nome;
- cabeçalho preso durante a rolagem.

### Tests for User Story 1

- [X] T006 [P] [US1] Em `tests/components/day.test.tsx`, testes (devem falhar):
  - 01/11, em `#comer`, os `h3.hood-group-head` têm os 6 nomes na ordem e os cards somam 24;
  - em `#lojas`, 4 grupos e 17 cards;
  - `#curiosidades` existe, com 5 cards;
  - em 05/11, `#curiosidades` não existe e o menu não tem "Curiosidades";
  - os cabeçalhos não têm `img`, `p` nem número;
  - cada card continua com exatamente 1 `a.card-link`.
- [X] T007 [P] [US1] Em `tests/e2e/us-mobile.spec.ts`, describe "US1 (010) – grupos por bairro", que roda nos projetos `mobile-360` e `mobile-402`:
  - em 01/11, tocar no chip "Restaurantes e Cafés" e rolar até o 3º card do grupo Chinatown;
  - conferir que `h3` "Chinatown" está no viewport, com `top` entre a base do menu e a base do menu + 4 px, e que não cobre o primeiro card visível (sobreposição ≤ 0);
  - conferir que não há rolagem lateral;
  - repetir offline em 04/11, seção "Brechós e Lojas" com o grupo "Williamsburg".

### Implementation for User Story 1

- [X] T008 [US1] Criar `src/components/HoodGroups.tsx`, que recebe `groups: PlaceGroup[]` e `section: string`:
  - um `<section class="hood-group" aria-labelledby>` por grupo, com `<h3 class="hood-group-head" id>` só com `name`;
  - um `div.card-stack` de `DayPlaceCard`.

  Ajustar `src/components/DayPlaceCard.tsx` para mostrar `works` como resumo quando não houver `summary`.
- [X] T009 [US1] Em `src/pages/Day.tsx`:
  - trocar as listas de `#comer` e `#lojas` por `<HoodGroups groups={dayPlaceGroups(day, kind)} />`;
  - acrescentar a seção `#curiosidades` (`SectionTitle` com ícone `film`, título "Curiosidades") entre `#lojas` e `#bairros`, só quando `has('curiosidades')`.
- [X] T010 [US1] Em `src/styles/base.css`:
  - `.hood-group-head` com `position: sticky`, `top: calc(var(--head-h) + var(--menu-h) + var(--safe-top))`, `z-index: 20`, fundo `var(--paper)`, `min-height: 44px` e alinhamento vertical central;
  - margens de ponta a ponta iguais às do `.section-menu`;
  - borda inferior `var(--border)`;
  - contraste alto com `var(--bg)`;
  - `.hood-group + .hood-group { margin-top: 16px }`.

  Rodar T006 e T007, que devem passar.

**Checkpoint**: US1 completa e testável sozinha.

---

## Phase 4: User Story 2 - "Transporte" só com o que ajuda a se deslocar (Priority: P2)

**Goal**: a seção e o item do menu só aparecem com trechos de metrô, ferry, táxi ou carro, ou com os blocos de troca de cidade.

**Independent Test**: para cada dia, a presença de "Transporte" bate com a tabela de `research.md` (R3).

### Tests for User Story 2

- [X] T011 [P] [US2] Em `tests/unit/notebook.test.ts`, testes (devem falhar):
  - `isRelevantMove`:
    - `true` para "metrô 6 na estação 51 St até Bleecker St (~15 min)", "NYC Ferry, rota East River…", "~1h de carro", "monotrilho ou barca (~20 a 30 min)", "táxi (~15 min) ou … metrô 7";
    - `false` para "o parque abre às 9h (hóspedes Disney às 8h30) e fecha às 21h", "5 minutos a pé pela Prince Street", "até o MoMA, na rua 53… (~15 min)", "Contem com 45 a 90 minutos entre imigração e malas".
  - `dayMoves`:
    - 01/11 com 1 trecho (metrô 6);
    - 04/11 com 2 (metrô 6, NYC Ferry);
    - 13/11 com 2 (carro, Cocoa Beach);
    - 31/10 e 09/11 com 0.
  - `daySections`:
    - sem `transporte` em 31/10, 09/11, 10/11, 12/11, 14/11, 15/11 e 17/11;
    - com `transporte` em 01/11 a 06/11, 07/11, 08/11, 13/11 e 18/11.
- [X] T012 [P] [US2] Em `tests/components/day.test.tsx`:
  - 01/11, `#transporte` com 1 item e sem o texto "a pé pela Prince Street";
  - 31/10 sem `#transporte`;
  - 07/11 com "1. Antes de sair".

### Implementation for User Story 2

- [X] T013 [US2] Em `src/domain/notebook.ts`, implementar:
  - `isRelevantMove(text)` com a lista de modos de R3, sem diferenciar maiúsculas;
  - `dayMoves(view)`, que devolve os passos `transit` com `how` relevante (exceto "volta…", como na 009) e os `transfer` relevantes;
  - `dayTransportCount = dayMoves(view).length + blocos de troca de cidade` (o mapa não conta mais).
- [X] T014 [US2] Em `src/pages/Day.tsx`, `Moves` passa a usar `dayMoves(day)`. O "Mapa do dia" só aparece dentro da seção. Rodar T011 e T012, que devem passar.

**Checkpoint**: US2 completa; US1 continua verde.

---

## Phase 5: User Story 3 - Atração de compras com as lojas da região (Priority: P2)

**Goal**: "Compras no SoHo" e outras atrações de compras mostram as lojas do bairro, com os mesmos dados de "Brechós e Lojas".

**Independent Test**: "Compras no SoHo" (01/11) e "Compras na Bedford Avenue" (04/11), com textos idênticos aos da seção do dia e o atalho funcionando.

### Tests for User Story 3

- [X] T015 [P] [US3] Em `tests/unit/notebook.test.ts`, `shoppingSlice` (deve falhar):
  - "Compras no SoHo" → grupo "SoHo" com 5;
  - "Compras na Elizabeth e na Mott Street" → "Nolita" com 4;
  - "Compras na Bedford Avenue" → "Williamsburg" com 5;
  - "Compras (tarde)" de 11/11 → `undefined`;
  - "Lincoln Road" de 19/11 (com os roteiros sugeridos semeados) → `undefined`;
  - os itens são os mesmos objetos de `dayPlaceGroups(view, 'shop')`.
- [X] T016 [P] [US3] Em `tests/components/step-detail.test.tsx`:
  - "Compras no SoHo" tem `section.step-shops` com título "Lojas e brechós em SoHo" e 5 `article`;
  - o texto de cada card é igual ao do card de mesmo nome em `#lojas` do Dia 01/11;
  - "Ver todas as lojas do dia" tem `href` `#/dia/2026-11-01?secao=lojas`;
  - a atração de 11/11 não tem `step-shops`;
  - a ordem fica título → descritivo → práticas → `step-shops` → ações.
- [X] T017 [P] [US3] Em `tests/e2e/us-mobile.spec.ts`, describe "US3 (010) – compras", nos dois projetos mobile:
  - abrir a atração "Compras no SoHo" pela parada de 01/11;
  - ver 5 cards e tocar em "Ver todas as lojas do dia";
  - conferir a URL `#/dia/2026-11-01?secao=lojas`, `#lojas` no viewport e o chip "Brechós e Lojas" com `aria-current`;
  - conferir que não há rolagem lateral.

### Implementation for User Story 3

- [X] T018 [US3] Em `src/domain/notebook.ts`, implementar `shoppingSlice(view, activity)` conforme `data-model.md`.
- [X] T019 [US3] Em `src/pages/StepDetail.tsx`, depois de `.step-practical`, mostrar `section.step-shops` quando houver `shoppingSlice`:
  - título "Lojas e brechós em {name}";
  - `DayPlaceCard` dos itens;
  - `a.btn` "Ver todas as lojas do dia" → `#/dia/{date}?secao=lojas`.

  CSS mínimo em `src/styles/base.css`.
- [X] T020 [US3] Em `src/pages/Day.tsx`, ler `secao` com `useQuery()`. Ao montar, se `secao` for uma seção existente, rolar até ela com `scrollIntoView({ block: 'start' })`. Rodar T015, T016 e T017, que devem passar.

**Checkpoint**: US3 completa; US1 e US2 continuam verdes.

---

## Phase 6: User Story 4 - "Dicas" só com o que muda o planejamento (Priority: P3)

**Goal**: dicas genéricas não aparecem; um dia sem dicas perde a seção.

**Independent Test**: os 9 dias com "Dicas" na 009 continuam com a seção, e as fixtures genéricas são cortadas.

### Tests for User Story 4

- [X] T021 [P] [US4] Em `tests/unit/notebook.test.ts`, `isGenericTip` (deve falhar):
  - `false` para as 10 dicas reais (percorrer `fullItineraries[*].days[*].alerts`);
  - `true` para "<p>Usem sapatos confortáveis e aproveitem o passeio.</p>", "<p>Caminhem a pé e aproveitem.</p>" e "<p>Levem água.</p>";
  - `false` para "<p>Levem água: o parque não vende garrafa depois das 18h.</p>" (tem hora);
  - `dayTips` de um dia de fixture só com dicas genéricas → `[]`, e `daySections` sem `dicas`.

### Implementation for User Story 4

- [X] T022 [US4] Em `src/domain/notebook.ts`, implementar `isGenericTip(html)` (R4: genérica só sem nenhum marcador específico **e** com um padrão genérico) e `dayTips(view)`. `daySections` conta `dayTips(view).length`.
- [X] T023 [US4] Em `src/pages/Day.tsx`, `#dicas` renderiza `DayAlerts` com `dayTips(day)`. Rodar T021, que deve passar.

**Checkpoint**: todas as histórias completas.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T024 Em `tests/unit/notebook.test.ts`, testar `sectionReview` (deve falhar) e depois implementá-la em `src/domain/notebook.ts` (R6, `data-model.md`). Esperado:
  - `removed: ['transporte']` em 31/10, 09/11, 10/11, 12/11, 14/11, 15/11 e 17/11;
  - nenhum `cutTips` real;
  - `nonNeighborhoodGroups` com os blocos "Noite: …" de 02/11, 05/11 e 06/11;
  - nenhum `uncertain` real;
  - cada `droppedMoves` com o texto do roteiro.
- [X] T025 [P] Em `tests/e2e/us-mobile.spec.ts`, acrescentar ao teste "leitura no celular" as páginas `/dia/2026-11-04`, `/dia/2026-11-06` e a atração "Compras no SoHo". Incluir `.hood-group-head` no seletor de alvos ≥ 44 px. Em `tests/e2e/us-notebook-a11y.spec.ts`, incluir `.hood-group-head` e `.step-shops h2` no contraste essencial (≥ 7:1, claro, escuro e alto contraste).
- [X] T026 [P] Atualizar `README.md`, linha **Dia** da tabela:
  - grupos por bairro em Restaurantes e Cafés, Brechós e Lojas e Curiosidades;
  - Transporte só com metrô, ferry, táxi ou carro;
  - Dicas sem genéricas.

  Na linha **Atração**: lojas do bairro nas atrações de compras.
- [X] T027 Remover o código que ficou sem uso (ex.: o cálculo antigo de transporte, se sobrar). Conferir com a mesma varredura de exports da 009.
- [X] T028 Rodar o CI completo: `npm run typecheck && npm test && npm run content:strict && npm run build && npm run budget && npm run e2e`.
  - Conferir o snapshot de NY intacto e o JS inicial < 100 KB.
  - Gerar capturas a 360 × 780 e 402 × 874 em `specs/010-day-sections-by-neighborhood/screens/`:
    - Dia 01/11 rolado em "Restaurantes e Cafés", com o cabeçalho preso;
    - Dia 06/11;
    - Dia 09/11, sem Transporte;
    - "Compras no SoHo".
- [X] T029 Escrever `specs/010-day-sections-by-neighborhood/report.md` (FR-018, FR-019) a partir de `sectionReview`:
  - por dia, as seções removidas, os trechos de transporte descartados e as dicas cortadas (hoje nenhuma, dito claramente);
  - a confirmação do agrupamento por bairro em todos os dias com essas seções (tabela dia × seção × grupos);
  - os cabeçalhos que não são bairros, para revisão (Q2 = A);
  - os testes a 360 e 402 px, com o resultado.

  Marcar as tarefas no `tasks.md`.
- [ ] T030 Com autorização do usuário, commitar a feature 010. Sem autorização, só informar que está pronta.

---

## Dependencies & Execution Order

- **Setup (T001–T002)** → **Foundational (T003–T005)** → histórias.
- **US1 (T006–T010)** depende da Foundational. É o MVP.
- **US2 (T011–T014)** depende só da Foundational (T005, por causa da ordem das seções).
- **US3 (T015–T020)** depende da Foundational (`dayPlaceGroups`). Usa `HoodGroups`/`DayPlaceCard` da US1 só indiretamente; pode vir antes da US2.
- **US4 (T021–T023)** depende só da Foundational.
- **Polish**:
  - T024 depende de US2 e US4;
  - T025 e T026 dependem das histórias;
  - T027 → T028 → T029 → T030.
- Dentro de cada história: testes primeiro (falhando) → domínio → tela → testes passando.
- `src/domain/notebook.ts` e `src/pages/Day.tsx` são tocados por várias histórias. As tarefas que
  mexem neles rodam em sequência, não em paralelo.

### Parallel Opportunities

- US1: T006 ∥ T007 (arquivos diferentes).
- US2: T011 ∥ T012.
- US3: T015 ∥ T016 ∥ T017.
- US4: T021 sozinho.
- Polish: T025 ∥ T026.
- Os testes de histórias diferentes podem ser escritos em paralelo. As implementações, não, porque
  dividem `notebook.ts` e `Day.tsx`.

## Parallel Example: User Story 3

```text
T015 [US3] tests/unit/notebook.test.ts     — shoppingSlice
T016 [US3] tests/components/step-detail.test.tsx — bloco de lojas na atração
T017 [US3] tests/e2e/us-mobile.spec.ts     — fluxo atração → seção do dia
```

## Implementation Strategy

### MVP first

1. Setup e Foundational (T001–T005).
2. US1 (T006–T010): agrupamento por bairro com cabeçalho preso e Curiosidades.
3. **Parar e validar** a 360 e 402 px (quickstart, cenários 1–3).

### Incremental delivery

4. US2: Transporte enxuto (cenário 4).
5. US3: atração de compras (cenário 6).
6. US4: Dicas (cenário 5).
7. Polish: relatório, CI, capturas e commit com autorização.
