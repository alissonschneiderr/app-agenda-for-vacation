# Tasks: Rota entre dois lugares do roteiro

**Input**: Design documents from `specs/016-route-between-attractions/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/screens.md, quickstart.md

**Tests**: obrigatórios (constituição II). Cada história escreve os testes antes do código.

Comandos com `export PATH=/opt/homebrew/opt/node@24/bin:$PATH`.

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup

- [ ] T001 Rodar a suíte do CI (`npm run typecheck && npm test && npm run content:strict && npm run build && npm run budget && npm run e2e`) e anotar a linha de base; apagar só duplicatas " 2" do iCloud idênticas ou vazias em `src`, `tests` e `specs`

---

## Phase 2: Foundational (domínio da rota)

**Purpose**: os lugares com local e o link da rota, usados pelas duas histórias.

- [ ] T002 [P] Escrever `tests/unit/route.test.ts` (conteúdo real via `indexContent` + `seedSuggested`, como `tests/unit/notebook.test.ts`):
  - `routeSpot(content, state, '2026-11-01', <chave de Mott Street>)` tem `group: 'paradas'`, `name` "Mott Street", `time` e `target` igual a `mapsQuery` do 1º link de mapa do lugar;
  - um passo sem lugar com mapa mas com ponto (`location`) tem `target` `"lat,lng"`;
  - "Compras no SoHo" (01/11) → `null`; `hasRoute` falso;
  - lugar `food` com link de mapa → `group: 'comer'`; `shop` → `'lojas'`; `screen` → `'curiosidades'`; lugar sem link de mapa → `null`;
  - `routeSpots(content, state, 'nova-york')` traz 31/10 a 07/11 em ordem; dentro do dia, paradas na ordem do roteiro e depois comer, lojas, curiosidades na ordem de `dayPlaceGroups`; nenhum `target` repetido no mesmo dia; nenhum lugar `kind: 'attraction'` solto;
  - 07/11 e 18/11 entram só na cidade dona do roteiro do dia (regra de `owner` em `neighborhoods()` de `src/domain/notebook.ts`);
  - `routeChoices(content, state, origem, false)` só tem o dia da origem e não tem a origem; com `true`, o dia da origem primeiro e depois os outros dias da cidade em ordem;
  - `routeUrl(a, b)` = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(a.target)}&destination=${encodeURIComponent(b.target)}`, sem `travelmode`;
  - Orlando 08/11 e Miami 19/11: só lugares da própria cidade.
- [ ] T003 Criar `src/domain/route.ts` (data-model.md): tipo `RouteSpot` (`key`, `date`, `name`, `time?`, `group: 'paradas' | 'comer' | 'lojas' | 'curiosidades'`, `target`, `address`); `routeSpot`, `routeSpots`, `routeChoices`, `routeUrl`, `hasRoute`. `target` = `mapsQuery(mapsUrls[0].url)` (`src/components/step-helpers.ts`; mover `mapsQuery` para `src/lib/links.ts` se a importação do domínio para `components` for evitada no projeto) ou `${lat},${lng}` do `location`; `address` = endereço do roteiro, senão `target`. Passos: só `trackable`, nome `places[0]?.name ?? title`, horário `timeLabel ?? start`. Lugares: `dayPlaceGroups(view, 'food' | 'shop' | 'screen')` (só com `mapUrl`). Sem repetido por `target` dentro do dia. Nada é salvo
- [ ] T004 `npx vitest run tests/unit/route.test.ts` verde; `npm run typecheck`

**Checkpoint**: domínio pronto; as histórias podem começar.

---

## Phase 3: User Story 1 - Rota da atração atual até outro lugar do roteiro (Priority: P1) 🎯 MVP

**Goal**: na página da atração, "Rota até…" abre a lista do dia (com "Ver outros dias" e "Inverter") e cada opção abre a rota no Google Maps (FR-001 a FR-008).

**Independent Test**: 01/11 → Mott Street → "Rota até…" → escolher uma parada → o link tem origem Mott Street e destino a escolhida.

### Tests for User Story 1

- [ ] T005 [P] [US1] Escrever `tests/components/route.test.tsx` para `src/pages/Route.tsx` (`setupReal` de `tests/components/companion-helpers.ts`):
  - `#/rota/2026-11-01/<Mott Street>`: região "Rota a partir de Mott Street"; título do dia "Domingo, 01/11"; blocos "Paradas", "Restaurantes e Cafés", "Brechós e Lojas", "Curiosidades" na ordem; nenhuma opção "Mott Street";
  - cada opção é link com `target="_blank"`, `rel="noopener"` e `href` igual a `routeUrl(origem, opção)`; nome acessível "<nome>, <horário>" nas paradas;
  - com `?inv=1` (`window.location.hash`): região "Rota até Mott Street" e `href` = `routeUrl(opção, origem)`; o botão "Inverter" alterna o `inv` na query;
  - "Ver outros dias" leva a `?outros=1`; com ele, aparecem os títulos 31/10 e 02/11 e o botão some;
  - offline (`setOnline(false)` de `tests/components/helpers.ts`): opções são botões; tocar mostra `role="alert"` "A rota precisa de internet. De: <endereço da origem>. Até: <endereço do destino>.";
  - chave inválida: "Lugar não encontrado" e link "Voltar ao dia" para `#/dia/2026-11-01`;
  - dia sem outro lugar (fixture com um só): "Nenhum outro lugar neste dia" e os outros dias já visíveis.
- [ ] T006 [P] [US1] Em `tests/components/step-detail.test.tsx`: na atração Mott Street (01/11), link "Rota até…" com `href` `#/rota/2026-11-01/<chave>` na mesma linha (`.row`) de "Abrir no mapa" e antes de "Motorista"; em "Compras no SoHo", sem "Rota até…"

### Implementation for User Story 1

- [ ] T007 [US1] Criar `src/components/RouteButton.tsx`: `RouteButton({ date, spotKey, variant })` → `<a class="btn" href={`#/rota/${date}/${encodeURIComponent(spotKey)}`}>` com `<Icon name="route" size={18} />` e "Rota até…"; `variant="link"` usa `class="nb-link above-link"` e ícone 16 (para os cards, T013). Não renderiza nada se `hasRoute` for falso (recebe `content` e lê o estado com `useUserState`)
- [ ] T008 [US1] Criar `src/pages/Route.tsx` conforme `contracts/screens.md`: `PageHeader` (`back` = `history.back()` via link para `#/dia/<data>` como fallback, `label` "Rota · <cidade>", `title` "A partir de <nome>" ou "Até <nome>"); botão "Inverter" (alterna `inv` na query com `useQuery` de `src/lib/router.ts`); `routeChoices(..., outros)`; por dia, `<section aria-label>` com o título `formatWeekday` + `formatDayMonth` e blocos com os rótulos das seções do dia ("Paradas", "Restaurantes e Cafés", "Brechós e Lojas", "Curiosidades"); opções como links externos (online) ou botões com o aviso (offline, `useOnline` de `src/lib/pwa.ts`); "Ver outros dias" (`?outros=1`) quando ainda não aberto; mensagens "Nenhum outro lugar neste dia" e "Lugar não encontrado"
- [ ] T009 [US1] Em `src/app.tsx`: `if ((m = matchRoute('/rota/:date/:key', path))) return <Route key={...} content={content} date={m.date!} spotKey={decodeURIComponent(m.key!)} />;` junto da rota do Motorista
- [ ] T010 [US1] Em `src/pages/StepDetail.tsx`: `<RouteButton content={content} date={date} spotKey={a.key} />` na `.row` depois de `LinkButtons` / `DirectionsButton` e antes de "Motorista"
- [ ] T011 [US1] Em `src/styles/base.css`: estilos da tela (`.route-list`, `.route-option` com altura ≥ 44 px, nome e horário em linha, chevron; títulos de bloco como `.eyebrow`); sem rolagem lateral a 360 px
- [ ] T012 [US1] `npm run typecheck && npm test` verdes

**Checkpoint**: US1 completa e testável sozinha.

---

## Phase 4: User Story 2 - Rota a partir de restaurantes, lojas e curiosidades (Priority: P2)

**Goal**: o mesmo botão nos cards e no detalhe dos lugares do dia (Q2 = B, FR-009).

**Independent Test**: card de La Cabra SoHo (01/11) → "Rota até…" → escolher uma parada → rota de La Cabra até ela.

### Tests for User Story 2

- [ ] T013 [P] [US2] Em `tests/components/day.test.tsx`: cada card `.place-row` com "Abrir no mapa" tem também "Rota até…" (`href` `#/rota/2026-11-01/<id do lugar>`); card sem link de mapa não tem nenhum dos dois
- [ ] T014 [P] [US2] Em `tests/components/place-card.test.tsx` (ou `nearby.test.tsx`, onde o detalhe `#/perto/<data>/<área>/<id>` é renderizado): "Rota até…" ao lado de "Abrir no mapa"
- [ ] T015 [P] [US2] Em `tests/components/route.test.tsx`: origem num lugar (`#/rota/2026-11-01/<id de La Cabra>`): região "Rota a partir de La Cabra SoHo"; a lista tem as paradas do dia e não tem La Cabra

### Implementation for User Story 2

- [ ] T016 [US2] Em `src/components/DayPlaceCard.tsx`: `DayPlace` ganha `date` (preencher em `toDayPlace` de `src/domain/notebook.ts` com `view.date`); ao lado do link "Abrir no mapa", `<RouteButton variant="link" date={p.date} spotKey={p.id} … />` dentro de um contêiner em linha; `DayPlaceCard` recebe `content` (ajustar quem o usa: `src/components/HoodGroups.tsx`, `src/pages/StepDetail.tsx`, `src/pages/Day.tsx`)
- [ ] T017 [US2] Em `src/components/PlaceCard.tsx`: prop opcional `route?: { content: LoadedContent; date: string }`; com ela, `RouteButton` depois de `LinkButtons`; em `src/pages/Nearby.tsx` (linha ~69, o detalhe do lugar) passar `route={{ content, date }}`
- [ ] T018 [US2] `npm run typecheck && npm test` verdes

**Checkpoint**: US1 e US2 completas.

---

## Phase 5: Polish & Cross-Cutting Concerns

- [ ] T019 Criar `tests/e2e/us-mobile-route.spec.ts` (projetos `mobile-360` e `mobile-402`; helpers `openInstalled`, `goOffline` de `tests/e2e/helpers.ts`): da atração Mott Street (01/11) tocar "Rota até…"; conferir URL `#/rota/…`; o 1º link de parada tem `href` começando com `https://www.google.com/maps/dir/?api=1&origin=` e `target="_blank"`; "Inverter" troca origem e destino no `href`; "Ver outros dias" mostra 31/10; voltar do navegador volta à atração; sem rolagem lateral (`scrollWidth - clientWidth <= 0`); offline: a lista abre e tocar numa opção mostra o aviso com "De:" e "Até:"; card de restaurante do dia → "Rota até…" abre a lista sem abrir o card
- [ ] T020 Suíte completa do CI verde; snapshot de NY sem mudança (`git diff --stat tests/unit/__snapshots__` vazio); JS inicial < 100 KB gzip; apagar só duplicatas " 2" do iCloud idênticas ou vazias
- [ ] T021 Conferência visual a 402 × 874 (screenshots via Playwright no scratchpad) da atração com o botão, da lista do dia, da lista com outros dias e do card de restaurante, conforme `specs/016-route-between-attractions/quickstart.md`

---

## Dependencies & Execution Order

- T001 → T002–T004 (domínio) → US1 → US2 → Polish.
- US2 depende de `RouteButton` (T007) e da tela (T008/T009) da US1.
- Dentro de cada fase: testes primeiro (devem falhar), depois o código.
- Arquivos em comum: `tests/components/route.test.tsx` (T005, T015) e `StepDetail.tsx` (T010, T016) — em sequência.

## Parallel Opportunities

- T002 sozinho antes do domínio; T005 e T006 juntos; T013, T014 e T015 juntos; T016 e T017 depois.

## Implementation Strategy

1. **MVP = Fundação + US1**: a rota a partir das atrações, que é o pedido.
2. **US2**: o botão nos restaurantes, lojas e curiosidades.
3. **Polish**: e2e nos dois tamanhos de celular, CI verde, conferência visual.
