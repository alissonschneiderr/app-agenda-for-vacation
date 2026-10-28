# Tasks: Bairros de verdade, data no rótulo do dia e cidade aberta no dia de hoje

**Input**: Design documents from `specs/013-city-days-labels-today/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/screens.md, quickstart.md

**Tests**: obrigatórios (constituição, Princípio II). Em cada história, o teste vem antes da
implementação e deve falhar primeiro.

**Comandos**: prefixar com `export PATH=/opt/homebrew/opt/node@24/bin:$PATH`. Depois de mudar
conteúdo, rodar `npm run content`.

**Branch**: `main`, a pedido do usuário.

**Decisões**:
- **Q1 = A**: só bairros de verdade. Saem parques urbanos e temáticos, tempo livre, museus, a ponte
  e os outlets.
- **Q2 = A**: os cabeçalhos de grupo da 010 não mudam.

**E2e mobile**: os projetos `mobile-360` e `mobile-402` rodam só `tests/e2e/us-mobile*.spec.ts`.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup

- [X] T001 Conferir a base na `main`: `npm run typecheck && npm test` verdes e working tree limpa. Remover só as cópias " 2" vazias ou idênticas ao original, se a sincronização do iCloud tiver criado alguma.

---

## Phase 2: Foundational (bloqueia as histórias)

**Purpose**: as funções de data usadas pela US1 e pela US2.

- [X] T002 Em `tests/unit/trip.test.ts`, testes (devem falhar):
  - `formatDayMonth('2026-11-19')` → `'19/11'` e `formatDayMonth('2026-10-31')` → `'31/10'`;
  - `formatWeekday('2026-11-19')` → `'Quinta-feira'`, `formatWeekday('2026-11-01')` → `'Domingo'`, `formatWeekday('2026-10-31')` → `'Sábado'`, `formatWeekday('2026-11-18')` → `'Quarta-feira'`;
  - `deviceToday(new Date(2026, 10, 2, 23, 59))` → `'2026-11-02'` (data local, sem horário);
  - `todayInCity(['2026-10-31','2026-11-01','2026-11-02'], '2026-11-02')` → `'2026-11-02'`, com `'2026-10-30'` → `undefined` e com `'2026-11-03'` → `undefined`;
  - os limites contam (primeiro e último dia).
- [X] T003 Em `src/domain/trip.ts`, implementar `formatDayMonth`, `formatWeekday` (lista fixa: Domingo, Segunda-feira, Terça-feira, Quarta-feira, Quinta-feira, Sexta-feira, Sábado; o dia da semana vem de `Date.UTC`, como em `formatDayLabel`), `deviceToday(now)` (`getFullYear`, `getMonth`, `getDate`) e `todayInCity(dates, today)`. T002 deve passar.

**Checkpoint**: funções de data prontas e testadas.

---

## Phase 3: User Story 1 - A cidade abre no dia de hoje (Priority: P1) 🎯 MVP

**Goal**: com hoje dentro do período da cidade, a página da cidade abre rolada até o card de hoje, que fica como o primeiro visível abaixo do cabeçalho. A ordem dos dias é crescente.

**Independent Test**: `?agora=` dentro, antes e depois do período e no dia de troca, a 360 e 402 px.

### Tests for User Story 1

- [X] T004 [P] [US1] Em `tests/components/city.test.tsx` (deve falhar):
  - com `?agora`/relógio em 02/11, ao renderizar `City` de Nova York, `scrollIntoView` (mock em `Element.prototype`) é chamado uma vez, no `article.day-card` de 02/11;
  - em 28/10 e 10/11 não é chamado;
  - a ordem dos cards continua crescente (31/10 primeiro).
- [X] T005 [P] [US1] Em `tests/e2e/us-mobile.spec.ts`, describe "US1 (013) – cidade no dia de hoje", nos dois projetos mobile:
  - `openInstalled(page, '2026-11-02T15:00:00Z', '/cidade/nova-york')`: o card de 02/11 tem `top` entre a base do `.page-head` e a base + 16 px. O primeiro card cujo `bottom` passa da base do cabeçalho é o de 02/11;
  - rolar para cima (`mouse.wheel(0, -2000)`) mostra o card de 31/10;
  - `openInstalled(page, '2026-10-28T15:00:00Z', '/cidade/nova-york')`: `scrollY` = 0;
  - `openInstalled(page, '2026-11-07T15:00:00Z', '/cidade/orlando')`: o card de 07/11 é o primeiro visível;
  - sem rolagem lateral.

### Implementation for User Story 1

- [X] T006 [US1] Em `src/pages/City.tsx`:
  - ao montar, calcular `todayInCity(destinationDates(content, cityId), deviceToday(now))`, com `now` do relógio da viagem (`useClock`, que respeita `?agora=`);
  - se houver data, chamar `scrollIntoView({ block: 'start' })` no card dessa data, só uma vez por montagem (`useEffect` com `[cityId]`);
  - dar a cada `article.day-card` um `id="dia-<data>"` (ou `data-date`) para achar o card.
- [X] T007 [US1] Em `src/styles/base.css`, `.city-days .day-card { scroll-margin-top: calc(var(--head-h) + var(--safe-top) + 8px); }`. Rodar T004 e T005, que devem passar.

**Checkpoint**: US1 completa.

---

## Phase 4: User Story 2 - Data no rótulo e só o dia da semana no subtítulo (Priority: P2)

**Goal**: "Dia N" vira "DD/MM" no card, no cabeçalho e na capa. O subtítulo vira só o dia da semana por extenso.

**Independent Test**: o card de 19/11 em Miami e a página do dia 01/11.

### Tests for User Story 2

- [X] T008 [P] [US2] Em `tests/components/city.test.tsx` e `tests/components/day.test.tsx` (devem falhar):
  - card de 19/11 em Miami: chip `'19/11'`, eyebrow `'Quinta-feira'`, nenhum texto `/Dia \d+/`; o `aria-label` do card continua `'quinta, 19/11: Compras na Sawgrass Mills'`;
  - Dia 01/11: título do cabeçalho começa com `'01/11 · '`, a capa tem `'01/11'` e `'Domingo'` e não tem `'Dia 2'` nem `'dom, 01/11'`;
  - os botões "Dia anterior, sábado, 31/10" continuam com esse texto.

  Ajustar as expectativas antigas ("Dia 2", "dom, 01/11") com o comentário "feature 013".

### Implementation for User Story 2

- [X] T009 [US2] Em `src/components/DayCard.tsx`: chip `formatDayMonth(d.date)` no lugar de `Dia {d.dayNumber}`; eyebrow `formatWeekday(d.date)` no lugar do `formatDayLabel`. O `aria-label` do card não muda.
- [X] T010 [US2] Em `src/pages/Day.tsx`:
  - `PageHeader` com `title={`${formatDayMonth(date)} · ${card.title}`}`;
  - capa com eyebrow `formatDayMonth(date)` no lugar de "Dia {card.dayNumber}";
  - chip de data da capa com `formatWeekday(date)` no lugar de `formatDayLabel(date).replace(...)`.

  Os `aria-label` dos botões de dia não mudam. Se `dayNumber` ficar sem uso em `src/`, removê-lo de `dayCard` e de `DayCardView` em `src/domain/notebook.ts` e dos testes. Rodar T008, que deve passar.

**Checkpoint**: US2 completa.

---

## Phase 5: User Story 3 - Só bairros de verdade em "Bairros" (Priority: P2)

**Goal**: "Bairros" sem parques, tempo livre, museus, ponte e outlets. O 18/11 mostra South Beach. Tempo livre sem alfinete. O selo "Bairro" só aparece em bairro.

**Independent Test**: "Bairros" de 03/11, 11/11, 08/11, 19/11 e 18/11; página do grupo Magic Kingdom.

### Tests for User Story 3

- [X] T011 [P] [US3] Em `tests/unit/notebook.test.ts` (deve falhar):
  - `neighborhoods(content, state, 'nova-york').map(n => n.name)` igual à lista de bairros de NY do `research.md` R1, na ordem dos dias (sem Central Park, MET, Museu de História Natural, MoMA, Ponte do Brooklyn, Brooklyn Bridge Park, High Line);
  - Orlando = `['Cocoa Beach']`;
  - Miami = `['South Beach (Art Deco District)']`, que inclui o 18/11 (R3, reproduz o bug);
  - `daySections` sem `bairros` em 08/11, 09/11, 10/11, 11/11, 12/11, 14/11, 15/11, 16/11, 17/11 e 19/11; com `bairros` em 03/11, 13/11 e 18/11;
  - a contagem de `bairros` é igual ao número de itens de `neighborhoods` daquele dia, em todos os dias.
- [X] T012 [P] [US3] Em `tests/content/content-rules.test.ts` (deve falhar):
  - todo nome de `notNeighborhoods` dos três `meta.json` existe como grupo em algum dia do roteiro da cidade;
  - um nome inexistente (fixture) gera erro de build.
- [X] T013 [P] [US3] Em `tests/components/day.test.tsx` e `tests/components/nearby.test.tsx` (devem falhar):
  - 03/11 `#bairros` com Upper West Side e Upper East Side, sem Central Park; as paradas do Central Park continuam em `#paradas`;
  - 11/11 sem `#bairros`; o cabeçalho "Manhã livre" da linha do tempo sem o ícone de alfinete;
  - 18/11 `#bairros` com 1 card, "South Beach (Art Deco District)";
  - `Nearby` de `2026-11-08/magic-kingdom` sem o texto "Bairro"; `Nearby` de `2026-11-01/soho` com "Bairro".

### Implementation for User Story 3

- [X] T014 [US3] Conteúdo, com os valores exatos de `research.md` R1:
  - adicionar `notNeighborhoods` aos `meta.json` de `content/full/nova-york`, `content/full/orlando` e `content/full/miami`;
  - em `scripts/full-itinerary-schema.ts`, `notNeighborhoods: z.array(text).optional()`;
  - em `src/content/types.ts`, `FullItinerary.notNeighborhoods?: string[]`;
  - em `scripts/build-content.ts`, levar o campo ao conteúdo e dar erro `"notNeighborhoods: \"<nome>\" não é um grupo do roteiro de <cidade>"` quando o nome não existir.
- [X] T015 [US3] Em `src/domain/notebook.ts`:
  - `isNeighborhood(area, notNeighborhoods)`: `kind === 'bairro'`, nome fora da lista e fora de `/^(manhã|tarde|noite) livre|tempo livre/i`;
  - `neighborhoods()` passa a usá-la e a incluir os dias de viagem que têm grupos (tirar o filtro `dayKind !== 'transit'`);
  - `daySections` conta `bairros` com a mesma regra.

  A lista vem do roteiro da cidade do dia (`fullItineraries.find(f => f.cityId === cityId)?.notNeighborhoods ?? []`).
- [X] T016 [US3] Telas:
  - em `src/pages/Day.tsx` (função `Stops`, cabeçalho de grupo `tl-area`), sem o ícone de alfinete quando o grupo é tempo livre;
  - em `src/pages/Nearby.tsx` e `src/components/NeighborhoodCard.tsx`, o selo "Bairro" só quando `isNeighborhood`.

  Rodar `npm run content`, T011, T012 e T013, que devem passar.

**Checkpoint**: todas as histórias completas.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T017 Rodar a suíte inteira e ajustar as expectativas antigas que dependiam de "Dia N", do subtítulo com data ou da lista antiga de bairros, com o comentário "feature 013":
  - `tests/unit/notebook.test.ts` (bairros de Orlando com Magic Kingdom);
  - `tests/components/orlando-day.test.tsx`;
  - `tests/components/miami-day.test.tsx` (menu de 18/11 e 19/11);
  - `tests/e2e/*` (ex.: `us-notebook.spec.ts` "Bairros → Magic Kingdom").

  Os grupos da 010 não mudam (Q2 = A).
- [X] T018 [P] Atualizar o `README.md` (tabela "Como o app se usa na viagem"): card com DD/MM e dia da semana; "Bairros" só com bairros (lista por cidade no `meta.json`); a cidade abre no dia de hoje.
- [X] T019 Rodar o CI completo: `npm run typecheck && npm test && npm run content:strict && npm run build && npm run budget && npm run e2e`.
  - Conferir que o snapshot de NY está intacto.
  - Gerar capturas a 360 × 780 e 402 × 874 em `specs/013-city-days-labels-today/screens/`: Nova York com `?agora=2026-11-02T10:00` (aberta em 02/11), cards de Miami, Dia 01/11 (cabeçalho e capa), "Bairros" de 03/11 e 11/11.
- [X] T020 Escrever `specs/013-city-days-labels-today/report.md`:
  - o que mudou em cada um dos 4 pontos;
  - a lista de grupos que saíram de "Bairros", por cidade;
  - a correção do 18/11;
  - os testes a 360 e 402 px.

  Marcar as tarefas no `tasks.md`.
- [X] T021 Com autorização do usuário, commitar a feature 013 na `main`. Sem autorização, só informar que está pronta.

---

## Dependencies & Execution Order

- T001 → Foundational (T002–T003) → histórias.
- **US1 (T004–T007)**: depende de T003 (`deviceToday`, `todayInCity`). É o MVP.
- **US2 (T008–T010)**: depende de T003 (`formatDayMonth`, `formatWeekday`). Mexe em `Day.tsx`, então roda depois ou antes da US3, nunca junto.
- **US3 (T011–T016)**: não depende de US1 nem de US2. T016 mexe em `Day.tsx`, então roda em sequência com T010.
- **Polish**: T017 → T018 ∥ T019 → T020 → T021.

### Parallel Opportunities

- US1: T004 ∥ T005.
- US3: T011 ∥ T012 ∥ T013.
- US2 e US3: os testes (T008, T011–T013) podem ser escritos em paralelo; as implementações que tocam `Day.tsx` (T010, T016) não.

## Parallel Example: User Story 3

```text
T011 [US3] tests/unit/notebook.test.ts
T012 [US3] tests/content/content-rules.test.ts
T013 [US3] tests/components/day.test.tsx + tests/components/nearby.test.tsx
```

## Implementation Strategy

1. **MVP**: Setup, Foundational e US1. A cidade já abre no dia de hoje.
2. US2: rótulos (rápido, visível).
3. US3: bairros, com a correção do 18/11.
4. Polish: ajustes de testes antigos, README, CI, capturas, relatório e commit com autorização.
