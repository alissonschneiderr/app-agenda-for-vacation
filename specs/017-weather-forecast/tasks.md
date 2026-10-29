# Tasks: Previsão do tempo no dia e no Início

**Input**: Design documents from `specs/017-weather-forecast/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/screens.md, quickstart.md

**Tests**: obrigatórios (constituição II). Testes antes do código. **Nenhum teste usa a rede de verdade**:
`fetch` falso no Vitest e `page.route` no Playwright.

Comandos com `export PATH=/opt/homebrew/opt/node@24/bin:$PATH`.

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup

- [X] T001 Rodar a suíte do CI (`npm run typecheck && npm test && npm run content:strict && npm run build && npm run budget && npm run e2e`) e anotar a linha de base; apagar só duplicatas " 2" do iCloud idênticas ou vazias em `src`, `tests` e `specs`

---

## Phase 2: Foundational (domínio, busca e ícones)

**Purpose**: previsão salva e lida da mesma forma pelas duas histórias.

- [X] T002 [P] Escrever `tests/unit/weather.test.ts` (domínio, conteúdo real via `assembleContent` + `indexContent`):
  - `describe(code)`: 0 → `{ icon: 'sun', label: 'Céu limpo' }`; 1 e 2 → `cloud-sun` "Parcialmente nublado"; 3 → `cloud` "Nublado"; 45, 48 → `fog` "Neblina"; 51–57 → `rain` "Garoa"; 61–67, 80–82 → `rain` "Chuva"; 71–77, 85, 86 → `snow` "Neve"; 95–99 → `storm` "Tempestade"; código desconhecido → `cloud` "Tempo variável";
  - `weatherFor(store, 'nova-york', '2026-11-01', '2026-10-29')` com o dia salvo → `{ kind: 'forecast', day, fetchedAt }`; `'2026-11-18'` com hoje 29/10 → `{ kind: 'later', from: '2026-11-12' }` (data − 6); dia dentro do alcance sem nada salvo → `{ kind: 'none' }`;
  - `dayCities(content, '2026-11-01')` → `['nova-york']`; `'2026-11-07'` → `['nova-york', 'orlando']`; `'2026-11-18'` → `['orlando', 'miami']`;
  - `homeStrip(content, '2026-10-29')` → 5 datas 29/10 a 02/11; 29/10 e 30/10 com `cities: []`; 31/10 com `['nova-york']`; `homeStrip(content, '2026-11-19')` termina em 23/11 com 22/11 e 23/11 vazios;
  - `mergeWeather(old, fetched)`: substitui os dias que vieram e mantém os outros; `fetchedAt` novo;
  - `stale(fetchedAt, now)`: falso com 23 h, verdadeiro com 25 h;
  - `cityLocations(content)`: a `location` do `heroPointId` de cada cidade (Central Park, Magic Kingdom, South Beach), na ordem de `content.trip`.
- [X] T003 [P] Escrever `tests/unit/weather-fetch.test.ts` (busca, com `vi.stubGlobal('fetch', …)` e o armazenamento em memória de `tests/fixtures/content.ts` `MemoryStorage` via `setAppStorage`):
  - online sem nada salvo → 1 chamada a `https://api.open-meteo.com/v1/forecast` com `latitude` e `longitude` das 3 cidades separadas por vírgula, `daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max`, `timezone=America/New_York`, `forecast_days=7`; resposta (lista de 3, fixture escrita no teste) salva em `ctha:weather` com máximas/mínimas arredondadas;
  - salvo há menos de 3 h → nenhuma chamada; há mais de 3 h → chama;
  - offline (`navigator.onLine` falso) → nenhuma chamada, salvo intacto;
  - erro de rede, status 500 ou JSON inválido → salvo intacto, sem exceção;
  - duas chamadas seguidas de `refreshWeather()` → uma busca só;
  - `ctha:weather` com JSON quebrado → lido como vazio.
- [X] T004 Criar `src/domain/weather.ts` (data-model.md): tipos `DayWeather { code: number; max: number; min: number; rain: number | null }` e `WeatherStore { fetchedAt: string; cities: Record<CityId, Record<DateStr, DayWeather>> }`; `describe`, `weatherFor`, `dayCities` (uma cidade; duas no dia de troca pela `content.trip`: a que sai e a que chega), `homeStrip` (hoje + 4; `cities` vazio fora de `tripRange`), `mergeWeather`, `stale` (> 24 h), `cityLocations`, `FORECAST_DAYS = 7`
- [X] T005 Criar `src/lib/weather.ts`: `WEATHER_KEY = 'ctha:weather'`; `readWeather()` / `saveWeather()` em `getAppStorage()` (JSON inválido = vazio); `refreshWeather(content, now = new Date())` — só se `navigator.onLine !== false` e (nada salvo ou `now − fetchedAt > 3 h`); uma busca por vez; monta a URL do contrato (`contracts/screens.md`); converte a resposta em `DayWeather` (arredonda `max`/`min`; `rain` `null` quando faltar) e grava com `mergeWeather`; qualquer falha mantém o salvo; avisa os ouvintes; `useWeather()` devolve o `WeatherStore | null` atual e re-renderiza quando muda
- [X] T006 [P] Em `src/components/Icon.tsx`: ícones `cloud`, `cloud-sun`, `fog`, `rain`, `snow`, `storm` em SVG de traço, no mesmo estilo (24 × 24, linhas) dos outros
- [X] T007 Em `src/main.tsx`: depois de `setAppStorage(...)` e do `render`, chamar `refreshWeather(content)` quando o conteúdo estiver carregado (ou dentro de `App` com `useEffect` em `src/app.tsx`, onde `content` existe) e no `visibilitychange` para `visible`; nunca bloqueia a primeira tela
- [X] T008 `npx vitest run tests/unit/weather.test.ts tests/unit/weather-fetch.test.ts` verde; `npm run typecheck`

**Checkpoint**: previsão buscada, salva e lida.

---

## Phase 3: User Story 1 - Previsão no dia (Priority: P1) 🎯 MVP

**Goal**: box "Tempo" em cada dia da viagem de hoje em diante (FR-001, FR-002, FR-004, FR-005, FR-007).

**Independent Test**: abrir 01/11 com previsão salva → box com descrição, máxima, mínima, chuva e "atualizada em …"; 07/11 → duas cidades; 18/11 com hoje 29/10 → "Previsão a partir de 12/11".

### Tests for User Story 1

- [X] T009 [P] [US1] Em `tests/components/weather.test.tsx` (com `setupReal` e `ctha:weather` gravado antes do render):
  - `WeatherBox` de 01/11: região "Tempo"; texto "Parcialmente nublado", "15° / 9°", "20%", "atualizada em 29/10 às 14h05"; texto para leitor "Nova York: parcialmente nublado, máxima 15, mínima 9 graus, 20% de chance de chuva";
  - 07/11 com as duas cidades salvas: duas linhas, "Nova York" e "Orlando";
  - 18/11 com hoje 29/10: "Previsão a partir de 12/11";
  - nada salvo: "Previsão disponível com internet";
  - salva há mais de 24 h: "atualizada em …" com a classe de destaque;
  - `rain: null`: sem a parte da chuva.
- [X] T010 [P] [US1] Em `tests/components/day.test.tsx`: no `Day` de 01/11 (hoje 29/10), a região "Tempo" vem depois de `.day-summary` e antes do menu "Seções do dia"; no `Day` de 31/10 com hoje 01/11 (dia passado), sem região "Tempo"

### Implementation for User Story 1

- [X] T011 [US1] Criar `src/components/WeatherBox.tsx` (contracts/screens.md): `<section class="weather-box" aria-label="Tempo">` com título "Tempo"; por cidade de `dayCities`: nome (só com duas cidades), `<Icon>` + descrição, "max° / min°", "💧 N%" (ícone `rain`, sem emoji) quando `rain` não for `null`; texto oculto para leitor de tela no formato do contrato; "atualizada em DD/MM às HHhMM" (destaque se `stale`); estados `later` e `none`; recebe `content`, `date` e `today`
- [X] T012 [US1] Em `src/pages/Day.tsx`: `{date >= today && <WeatherBox content={content} date={date} today={today} />}` logo depois do `<p class="day-summary">` (linha ~240) e antes do menu de seções; `today` = o mesmo "hoje" já usado na página (feature 013)
- [X] T013 [US1] Em `src/styles/base.css`: `.weather-box` (cartão claro como `.alert-list`, ícone 28 px, temperaturas em `tabular-nums`, `.weather-updated` e `.weather-updated.is-stale`), variantes escuro e `:root[data-contrast='high']`
- [X] T014 [US1] `npm run typecheck && npm test` verdes

**Checkpoint**: US1 completa e testável sozinha.

---

## Phase 4: User Story 2 - Hoje e os próximos 4 dias no Início (Priority: P2)

**Goal**: faixa hoje + 4 no Início (FR-003, FR-008).

**Independent Test**: Início em 29/10 → 29/10 e 30/10 "fora da viagem"; 31/10 a 02/11 com ícone e temperaturas e link para o dia.

### Tests for User Story 2

- [X] T015 [P] [US2] Em `tests/components/weather.test.tsx`: `WeatherStrip` com hoje 29/10 e previsão salva: 5 itens; 29/10 e 30/10 com "fora da viagem" e sem link; 31/10, 01/11 e 02/11 são links `#/dia/<data>` com nome acessível "Sábado, 31/10, Nova York: nublado, máxima 15, mínima 5 graus"; 07/11 (com hoje 03/11) mostra NY e ORL; sem nada salvo: "Previsão disponível com internet"
- [X] T016 [P] [US2] Em `tests/components/start.test.tsx`: a faixa (`.weather-strip`) vem depois do cabeçalho e antes do 1º card de cidade; os 3 cards continuam

### Implementation for User Story 2

- [X] T017 [US2] Criar `src/components/WeatherStrip.tsx`: `<section class="weather-strip" aria-label="Previsão: hoje e os próximos 4 dias">` com `<ol>` de 5 itens de `homeStrip(content, today)`; cada dia: DD/MM, e por cidade ícone + "max°/min°" (sigla NY/ORL/MIA quando há duas); dia da viagem = `<a href="#/dia/<data>">`; fora = "fora da viagem"; "atualizada em …" uma vez abaixo; estado sem nada salvo
- [X] T018 [US2] Em `src/pages/Start.tsx`: `<WeatherStrip content={content} today={deviceToday(new Date())} />` depois do `<header>` (linha ~20–30) e antes da lista de cards
- [X] T019 [US2] Em `src/styles/base.css`: `.weather-strip` em grade de 5 colunas iguais a 360 px (sem rolagem lateral da página; se não couber, `overflow-x: auto` só na faixa), alvos ≥ 44 px, temas escuro e alto contraste
- [X] T020 [US2] `npm run typecheck && npm test` verdes

**Checkpoint**: US1 e US2 completas.

---

## Phase 5: Polish & Cross-Cutting Concerns

- [X] T021 Criar `tests/e2e/us-mobile-weather.spec.ts` (projetos `mobile-360` e `mobile-402`; `page.route('https://api.open-meteo.com/**', …)` com uma resposta fixa de 3 cidades; relógio com `page.clock.setFixedTime`): Início em 29/10 mostra 5 dias, 2 "fora da viagem", 31/10 com temperaturas; tocar em 01/11 abre o dia com o box "Tempo"; sem rolagem lateral; `goOffline` e recarregar → mesma previsão com "atualizada em"; instalação nova offline (sem rota, `context.setOffline(true)` antes) → "Previsão disponível com internet" e o resto do app abre
- [X] T022 Garantir que os e2e já existentes não chamam o Open-Meteo de verdade: em `tests/e2e/helpers.ts` (`openInstalled`), bloquear `https://api.open-meteo.com/**` com `route.abort()` por padrão (os testes de tempo sobrescrevem)
- [X] T023 Suíte completa do CI verde; snapshot de NY sem mudança; JS inicial < 100 KB gzip; apagar só duplicatas " 2" do iCloud idênticas ou vazias
- [X] T024 Conferência visual a 402 × 874 (screenshots via Playwright no scratchpad, com a rede real do Open-Meteo) do Início e dos dias 31/10 e 18/11, conforme `specs/017-weather-forecast/quickstart.md`

---

## Dependencies & Execution Order

- T001 → Fundação (T002–T008) → US1 → US2 → Polish.
- US2 não depende da US1 (só da Fundação), mas as duas mexem em `tests/components/weather.test.tsx` e `src/styles/base.css` — em sequência.
- T022 antes de T023 (para a suíte não sair para a rede).

## Parallel Opportunities

- T002, T003 e T006 juntos; T009 e T010 juntos; T015 e T016 juntos.

## Implementation Strategy

1. **MVP = Fundação + US1**: o box do tempo em cada dia.
2. **US2**: a faixa hoje + 4 no Início.
3. **Polish**: e2e nos dois tamanhos com a rede interceptada, CI verde, conferência visual com a previsão real.
