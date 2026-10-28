# Tasks: Sem contagens nem percentuais de progresso — só o check de feito/não feito

**Input**: Design documents from `specs/015-remove-progress-counts/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/screens.md, quickstart.md

**Tests**: obrigatórios (constituição II). Os testes de cada história são ajustados antes do código.

Comandos com `export PATH=/opt/homebrew/opt/node@24/bin:$PATH`.

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup

- [X] T001 Rodar a suíte do CI (`npm run typecheck && npm test && npm run content:strict && npm run build && npm run budget && npm run e2e`) e anotar a linha de base; apagar só duplicatas " 2" do iCloud idênticas ou vazias

---

## Phase 2: Foundational

Nada bloqueante: cada história remove o próprio pedaço da tela e do domínio.

---

## Phase 3: User Story 1 - Sem acompanhamento de progresso (Priority: P1) 🎯 MVP

**Goal**: nenhum anel, barra ou "X de Y feitas"; o check e o "Feito / Pular" continuam (FR-001, FR-002, FR-003, FR-005).

**Independent Test**: Início, Nova York, 01/11 e uma atração sem "%", "feitas" nem `role="progressbar"`; marcar e desmarcar uma parada.

### Tests for User Story 1

- [X] T002 [P] [US1] Em `tests/components/notebook-base.test.tsx`: apagar o teste "ProgressRing: valores acessíveis e porcentagem" e o import de `ProgressRing`; no teste "SectionTitle e PageHeader", tirar `progress={{ done: 1, total: 4 }}` e trocar a última expectativa por `expect(screen.queryByRole('progressbar')).toBeNull()`
- [X] T003 [P] [US1] Em `tests/components/done-toggle.test.tsx`: apagar o teste "ProgressBar com valores ARIA…" e o import de `ProgressBar`; o `describe` passa a "DoneToggle (003 US2)"
- [X] T004 [P] [US1] Em `tests/components/day.test.tsx` (linhas ~75–80): trocar a leitura do `progressbar` por: o círculo fica `aria-checked="true"` depois do clique, e `queryAllByRole('progressbar')` vazio; adicionar que o texto da página não casa com `/\d+%|feitas/`
- [X] T005 [P] [US1] Em `tests/components/city.test.tsx` e `tests/components/start.test.tsx` (ou `home.test.tsx`, onde estão os cards de cidade): nenhum `progressbar`, nenhum texto `/feitas|\d+%/`, e "7 noites", "dias de roteiro" e "3 destinos" continuam
- [X] T006 [P] [US1] Em `tests/unit/trip-view.test.ts`: apagar o teste "progresso real por dia, cidade e viagem…" e o import de `tripProgress`; na linha ~74 trocar `before.progress.total … - 1` pela contagem de atividades com `trackable` dos dois `dayView`; no teste "marcas antigas não alteram o progresso…" (linha ~170) conferir que nenhuma atividade do dia 10/11 fica com `mark?.state === 'done'`, sem `.progress`
- [X] T007 [P] [US1] Em `tests/unit/full-itinerary.test.ts`: tirar `dayProgress` do import e do teste "calcula fim e progresso…" (fica só a parte de `endTime`, renomeada "calcula o fim")
- [X] T008 [P] [US1] Em `tests/e2e/us-notebook.spec.ts`, o teste "marcar Mott Street no círculo sobe o contador da capa; Desfazer volta": renomear para "marcar Mott Street no círculo; Desfazer volta", tirar o `ring` e conferir só o `aria-checked` antes/depois; adicionar `await expect(page.locator('[role="progressbar"]')).toHaveCount(0)`

### Implementation for User Story 1

- [X] T009 [US1] Em `src/components/PageHeader.tsx`: tirar as props `progress` e `scope`, o import de `Progress` e de `ProgressRing`, e o `{progress && <ProgressRing …/>}`; comentário do componente sem "anel"
- [X] T010 [US1] Apagar `src/components/ProgressRing.tsx` e `src/components/ProgressBar.tsx`
- [X] T011 [US1] Em `src/pages/City.tsx` (`PageHeader … progress={c.progress} scope={c.name}`) e `src/pages/Day.tsx` (`progress={day.progress}` e `scope={…}`): tirar as duas props
- [X] T012 [P] [US1] Em `src/components/CityCard.tsx`: tirar `pct`, o `<span class="nb-count">… feitas</span>` e o `<div class="nb-bar">`; "N noites" e "N dias de roteiro" ficam
- [X] T013 [P] [US1] Em `src/components/DayCard.tsx`: tirar `pct` e o bloco `{d.progress.total > 0 && (…feitas… nb-bar)}`; comentário sem "progresso"
- [X] T014 [US1] Domínio (research R5): em `src/domain/trip-view.ts` apagar `Progress`, `progressOf`, `sumProgress`, `tripProgress`, `TripDayView.progress`, `DestinationView.progress` e `activityCount`; em `src/domain/notebook.ts` apagar `progress` de `TripCover`, `CityCard` e `DayCard` (e o import de `sumProgress`/`Progress`); em `src/domain/full-itinerary.ts` apagar `dayProgress` e trocar o comentário de `trackable` para "Atividades com o check de feito (deslocamentos não têm)". `trackable`, `activityMarks` e `daySections().count` ficam
- [X] T015 [US1] Em `src/styles/base.css`: apagar `.progress`, `.progress-track`, `.progress-fill`, `.progress-text`, `.progress-inline`, `.page.day .progress`, as duas regras de alto contraste `.progress-*` (e o comentário "Modo sol: barra de progresso…"), `.cover-panel .progress-text`, `.ring*`, `.cover .ring-*`, `.nb-count` e `.nb-bar`
- [X] T016 [US1] `npm run typecheck && npm test` verdes; conferir com `grep -rnE "progress|Progress|feitas" src` que só sobram comentários que não falam de progresso exibido (ajustar os de `src/storage/prefs.ts` e `src/content/types.ts` se citarem "progresso")

**Checkpoint**: US1 completa e testável sozinha.

---

## Phase 4: User Story 2 - Sem as outras contagens (Priority: P2)

**Goal**: só o número sai; rótulo e atalho ficam (FR-004, FR-004a; research R3, R4).

**Independent Test**: 01/11, grupo SoHo, seção "Bairros" e avisos do dia sem número de itens; "7 noites", "7 dias de roteiro" e "3 destinos" continuam.

### Tests for User Story 2

- [X] T017 [P] [US2] Em `tests/components/nearby.test.tsx` (linha ~26): esperar `['Comer', 'Lojas', 'Curiosidades']`
- [X] T018 [P] [US2] Em `tests/components/orlando-day.test.tsx` (linha ~65): link `'Opções'` em vez de `'Comer (5)'` se o link for o atalho do dia; se for a aba do grupo, `'Comer'`. Conferir o mesmo `href` de antes
- [X] T019 [P] [US2] Em `tests/e2e/us-orlando.spec.ts` (linha ~49) e `tests/e2e/us-companion.spec.ts` (linha ~55): `'Comer (5)'` / `'Comer (6)'` passam a `'Comer'` (`exact: true`)
- [X] T020 [P] [US2] Em `tests/unit/notebook.test.ts` (linha ~48): apagar `expect(d.stops)…`; adicionar que `neighborhoods()` não tem a chave `counts`
- [X] T021 [P] [US2] Em `tests/components/day.test.tsx` e `tests/components/city.test.tsx`: na capa do dia e nos cards de dia, nenhum texto `/\d+ paradas?/`; o chip do tipo do dia continua; o atalho da linha do tempo tem o texto exato "Opções"; os cards de bairro (`.hood-card`) não têm `/\(\d+\)/` e mantêm nome, data e frase; a faixa de aviso tem "Ver todos" sem número e a lista recolhida tem o resumo "Avisos do dia"

### Implementation for User Story 2

- [X] T022 [US2] Em `src/components/DayCard.tsx`: tirar `{d.stops > 0 && <span>…paradas</span>}`; em `src/domain/notebook.ts` tirar `DayCard.stops` e o cálculo `stops: steps.filter(…)` (manter `steps` só se ainda for usado)
- [X] T023 [US2] Em `src/pages/Day.tsx`: na capa, tirar o `<Chip>` de `card.stops`; em `AreaLine`, o link passa a "Opções" (a conta `options > 0` continua só para decidir se o link aparece)
- [X] T024 [P] [US2] Em `src/pages/Nearby.tsx` (linha ~114): a aba mostra só `{label}`; se `kind` deixar de ser usado no `GROUPS.map`, tirar da desestruturação
- [X] T025 [P] [US2] Em `src/components/NeighborhoodCard.tsx`: tirar `tags` e o `<div class="cover-row">` com os chips (e o import de `Chip` só se ficar sem uso — a data usa `Chip`); em `src/domain/notebook.ts` tirar `NeighborhoodCard.counts` e o cálculo (`food`, `places` se ficarem sem uso)
- [X] T026 [P] [US2] Em `src/components/DayAlerts.tsx`: "Ver todos ({alerts.length})" → "Ver todos" (mesma condição `alerts.length > 1`); o resumo da lista `{alerts.length === 1 ? '1 aviso' : …}` → "Avisos do dia"; comentário do componente sem "N avisos para hoje"
- [X] T027 [US2] `npm run typecheck && npm test` verdes

**Checkpoint**: US1 e US2 completas.

---

## Phase 5: Polish & Cross-Cutting Concerns

- [X] T028 Criar `tests/e2e/us-mobile-no-progress.spec.ts` (roda em `mobile-360` e `mobile-402` e no `chromium`), com os helpers de `tests/e2e/helpers.ts`: abrir Início, `#/cidade/nova-york`, `#/dia/2026-11-01`, a página "Opções" de SoHo, uma atração e `#/cidade/orlando`; em cada uma, `[role="progressbar"]` com 0 itens e o texto visível de `main` sem `/\d+\s?%|feitas|\d+ paradas?|\(\d+\)|\d+ avisos?/`; no Início e na cidade, "noites", "dias de roteiro" e "destinos" visíveis; marcar a 1ª parada de 01/11, recarregar e conferir `aria-checked="true"`, desmarcar e conferir `false` (SC-001, SC-001a, SC-002)
- [X] T029 Varredura de sobras: `grep -rnE "ProgressRing|ProgressBar|progressOf|sumProgress|tripProgress|dayProgress|activityCount|\.stops\b|counts\.|nb-count|nb-bar|\bring-" src tests` sem resultado
- [X] T030 Suíte completa do CI verde (`typecheck`, `test`, `content:strict`, `build`, `budget`, `e2e`); snapshot de NY sem mudança (`git diff --stat tests/unit/__snapshots__` vazio); apagar só duplicatas " 2" do iCloud idênticas ou vazias
- [X] T031 Conferência visual a 402 × 874 (screenshots via Playwright em `scratchpad`) de Início, Nova York, 01/11 e Opções de SoHo, conforme `specs/015-remove-progress-counts/quickstart.md`; cabeçalho sem espaço vazio à direita do título

---

## Dependencies & Execution Order

- **Setup (T001)** → US1 → US2 → Polish. US2 pode começar logo depois de T001 (arquivos em comum: `DayCard.tsx`, `Day.tsx`, `notebook.ts`, `day.test.tsx`, `city.test.tsx` — fazer em sequência com US1 nesses arquivos).
- Dentro de cada história: testes primeiro (devem falhar), depois o código.
- T010 depois de T009 e de T002/T003 (os testes ainda importam os componentes).
- T014 depois de T009–T013 (o tipo `Progress` some).
- T028–T031 depois de T027.

## Parallel Opportunities

- US1: T002–T008 juntos; T012 e T013 juntos.
- US2: T017–T021 juntos; T024, T025 e T026 juntos.

## Implementation Strategy

1. **MVP = US1**: some todo o acompanhamento de progresso — o centro do pedido.
2. **US2**: some o número das contagens de itens.
3. **Polish**: varredura e2e nos dois tamanhos de celular, CI verde, conferência visual.
