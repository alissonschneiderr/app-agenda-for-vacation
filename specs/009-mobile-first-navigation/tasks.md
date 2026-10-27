---

description: "Task list for feature 009 — Navegação mobile first"
---

# Tasks: Navegação mobile first — Início só com destinos, dia como centro da viagem

**Input**: Design documents from `/specs/009-mobile-first-navigation/`

**Prerequisites**: plan.md, spec.md (Q1 = B, Q2 = B, Q3 = A), research.md, data-model.md,
contracts/screens.md, quickstart.md

**Tests**: Incluídos (constituição, Princípio II):
- domínio (`daySections`, `dayPlaces`, `dataReview`);
- páginas Início, Cidade, Dia e Atração;
- redirecionamentos;
- E2E a 360 × 780 e 402 × 874, com offline e acessibilidade nos 3 temas.

**Organization**: por user story (US1–US3 da spec).

**Ambiente**: `export PATH=/opt/homebrew/opt/node@24/bin:$PATH`. O sed do macOS não aceita `\|`;
use python para substituições múltiplas.

**Regras que valem para todas as tarefas**:
- **Conteúdo**:
  - não muda nenhum texto, atração, dia, endereço ou foto;
  - nada é inventado: o que faltar vai para `data-review.md`;
  - o snapshot de NY (`tests/unit/__snapshots__/nyc-snapshot.test.ts.snap`) nunca é atualizado.
- **Layout**:
  - nenhuma seção vazia ou com "sem informações";
  - alvos ≥ 44 × 44 px;
  - corpo ≥ 16 px;
  - sem rolagem lateral a 360 px e 402 px.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência pendente)
- **[Story]**: US1–US3

---

## Phase 1: Setup

- [X] T001 Com autorização do usuário, commitar a feature 008 (branch `008-travel-notebook-ui`) e criar a branch `009-mobile-first-navigation` a partir dela. Sem autorização, seguir na branch atual e registrar a pendência no relatório final.
- [X] T002 [P] Em `index.html`, acrescentar `viewport-fit=cover` à meta `viewport`. Em `playwright.config.ts`, criar dois projetos de viewport:
  - `mobile-360`: 360 × 780, `deviceScaleFactor` 3, `isMobile` true, `hasTouch` true;
  - `mobile-402`: 402 × 874, mesmas opções.

  Manter o projeto atual para os testes que já fixam o viewport. Rodar `npx playwright test --list` para conferir os projetos.

---

## Phase 2: Foundational (Blocking Prerequisites)

**⚠️ CRITICAL**: nenhuma user story começa antes desta fase.

- [X] T003 Criar `src/lib/links.ts` com `stepHref(date, key)` e `driverHref(date, key)`, movidos de `src/pages/Now.tsx`. Atualizar os imports em:
  - `src/components/StopCard.tsx`;
  - `src/pages/Day.tsx`, `src/pages/Nearby.tsx`, `src/pages/StepDetail.tsx`, `src/pages/Start.tsx`;
  - `src/app.tsx`.

  Rodar `npm run typecheck`.
- [X] T004 Criar `src/components/CardLink.tsx`, o padrão único de card clicável (research R2, contracts/screens.md "Card clicável"):
  - **componente**: `<CardLink href label class>`, usado como o link do título, com `class="card-link"`;
  - **link esticado**: o CSS estica a área do link com `::after { content: ''; position: absolute; inset: 0 }` sobre o ancestral `.click-card` (`position: relative`);
  - **controles internos**: `.click-card .above-link { position: relative; z-index: 1 }`;
  - **foco**: `.click-card:focus-within` mostra o contorno no card inteiro;
  - **toque**: `.click-card:active` aplica `transform: scale(0.99)` e um leve escurecimento;
  - **indicador**: a seta › vem de um `<Icon name="chevron-right">` com `aria-hidden`.

  Estilos em `src/styles/base.css`. Teste em `tests/components/card-link.test.tsx`:
  - um único `<a>` por card;
  - o nome acessível é o título;
  - a seta tem `aria-hidden`.
- [X] T005 Tornar `src/components/PageHeader.tsx` um cabeçalho fixo e enxuto:
  - `position: sticky; top: 0` com `padding-top: env(safe-area-inset-top)`;
  - fundo `--paper`;
  - uma linha: voltar 48 × 48, rótulo + título com reticências, anel opcional;
  - `z-index` acima do conteúdo.

  Em `src/styles/base.css`:
  - `.page`: `max-width: 520px; margin: 0 auto`, com `padding-left/right` usando `max(16px, env(safe-area-inset-left/right))`;
  - `.app`: `padding-bottom: env(safe-area-inset-bottom)`.

  Remover o espaço reservado à barra de baixo (`--nav-h`).
- [X] T006 Remover a barra de baixo (Q3 = A):
  - tirar `<TabBar>` de `src/app.tsx` e apagar `src/components/TabBar.tsx` e o CSS `.tab-bar`;
  - em `tests/unit/router-redirects.test.ts`, trocar o teste da barra por um que confirma que o app não renderiza `nav[aria-label="Navegação principal"]`;
  - no `scroll-padding-bottom` do `html`, tirar a altura da barra.
- [X] T007 Atualizar rotas e redirecionamentos em `src/app.tsx` (data-model.md "Rotas"):
  - **redirecionar** para `#/`: `#/dicas`, `#/transporte`, `#/viagem` e `#/perto` (sem parâmetros);
  - **redirecionar** `#/cidade/:c/:aba` para `#/cidade/:c`;
  - **nova rota** `#/exibicao` → `src/pages/Display.tsx`. A página tem `PageHeader` com voltar para `#/`, título "Exibição" e o interruptor "Alto contraste (modo sol)" (`setHighContrast`, `usePrefs`), tirado do Início;
  - **remover** os imports de `Tips` e `Transport`.

  Testes em `tests/unit/router-redirects.test.ts` para cada redirecionamento e para `#/exibicao`.
- [X] T008 Em `src/domain/notebook.ts`, criar as funções do data-model.md, como funções puras sobre `TripDayView`:
  - **`daySections(view, content)`**:
    - devolve `{ id, label, count }[]` só com `count > 0`;
    - ordem e rótulos fixos: `paradas` "Paradas" · `comer` "Restaurantes e Cafés" · `lojas` "Brechós e Lojas" · `bairros` "Bairros" · `transporte` "Transporte" · `dicas` "Dicas";
    - `dicas` = avisos do dia (Q2 = B);
    - `transporte` = passos `transit` com `how`, mais os `transfer` das regiões, mais o mapa do dia; nos dias de viagem, os itens dos três blocos;
  - **`dayPlaces(view, kind: 'food' | 'shop')`**:
    - devolve `DayPlace[]` na ordem do roteiro, sem repetir nome no dia;
    - campos: `where` = endereço, senão o nome da região; `summary` = 1º texto sem rótulo, senão `works`; `mapUrl` = 1º `mapsUrls`; `href` = `#/perto/<data>/<região>/<id>`;
  - **`dataReview(content)`**: devolve os lugares `food` e `shop` sem endereço e sem mapa, por dia, e os textos sem estrutura conhecidos (mercados de 07/11 no `arrivals.html`).
- [X] T009 [P] Testes em `tests/unit/notebook.test.ts`, com o conteúdo real:
  - **01/11**: `daySections` traz as 6 seções; `dayPlaces('food')` tem 24 itens e `('shop')` 17;
  - **09/11**: sem `lojas`; com `comer` (4);
  - **19/11** (Miami): só `paradas`;
  - **07/11**: `transporte` com os itens dos blocos e sem `comer` e `lojas`;
  - **nunca** aparece uma seção com `count` 0;
  - **`dataReview`**: lista os 29 lugares de comida de Orlando sem endereço nem mapa e os mercados de 07/11.

**Checkpoint**: `npm run typecheck && npm test` verdes, sem a barra de baixo e com as rotas novas.

---

## Phase 3: User Story 1 - Do Início ao dia em três toques, com cards inteiros clicáveis (Priority: P1) 🎯 MVP

**Goal**:
- o Início só com os 3 cards de cidade;
- a cidade só com a capa curta e os cards de dia;
- todos os cards clicáveis em toda a área;
- o cabeçalho fixo.

**Independent Test**: a 360 e a 402 px, Início → cidade → dia tocando no meio dos cards, sem
rolagem lateral, e voltando pelo "voltar".

### Tests for User Story 1

- [X] T010 [P] [US1] Reescrever `tests/components/start.test.tsx`:
  - **Início** em 27/10 e em 01/11: só 3 `article` de cidade, sem as regiões "Agora", "Reservar hoje", "Destaques" e "Consulta";
  - **links**: cada card tem 1 link, cujo nome acessível é o nome da cidade e que aponta para `#/cidade/<c>`;
  - **conteúdo**: cada card mostra foto, país, noites e datas.

  Os testes de "Agora" e "Viagem concluída" saem. Os do motorista (`Driver`) vão para `tests/components/driver.test.tsx`.
- [X] T011 [P] [US1] Reescrever `tests/components/city.test.tsx`:
  - a capa curta tem foto, país, nome, datas e noites, sem frase, sem tags (`.city-tags` ausente) e sem `tablist`;
  - os 8 cards de dia de Nova York, cada um com 1 link para `#/dia/<d>`;
  - Miami mostra os dias com os roteiros sugeridos;
  - nenhum texto "Sem informações".

### Implementation for User Story 1

- [X] T012 [US1] Passar `src/components/CityCard.tsx`, `src/components/DayCard.tsx`, `src/components/NeighborhoodCard.tsx` e o cartão curto de `src/components/PlaceCard.tsx` para o padrão `CardLink`:
  - o título é o único link, com área esticada;
  - os textos "Ver roteiro", "Abrir dia" e "Ver o bairro" saem, e fica só a seta ›;
  - o nome acessível do link é o título (por exemplo, "Nova York", "domingo, 01/11: …").
- [X] T013 [US1] Reescrever `src/pages/Start.tsx`:
  - uma linha de topo com o ícone do app, o título com as 3 cidades e "3 destinos";
  - a lista de `CityCard` grandes;
  - **sai** o resto: capa da viagem, `NowSection`, `ReserveToday`, Destaques, Consulta e o interruptor.

  Apagar `src/pages/Now.tsx`, `src/components/ReserveToday.tsx` e os testes `tests/components/reserve-today.test.tsx`. A parte "Reservar hoje" de `tests/e2e/us-orlando.spec.ts` e `tests/e2e/us-notebook.spec.ts` também sai. Conferir com `grep` que nada mais importa esses arquivos.
- [X] T014 [US1] Reescrever `src/pages/City.tsx` (contracts/screens.md "Cidade"):
  - `PageHeader` (voltar para `#/`, nome e anel);
  - `Cover` curta com foto, país, nome, datas e noites;
  - a lista de `DayCard`.

  **Sai**: as tags, `PillTabs`, `CityTransport` e as abas. Apagar `src/components/PillTabs.tsx`, se ficar sem uso, e o teste dele em `tests/components/notebook-base.test.tsx`.
- [X] T015 [US1] Apagar `src/pages/Tips.tsx`, `src/pages/Transport.tsx`, `src/components/TipCard.tsx` (se sem uso) e `tests/components/tips-transport.test.tsx`. Remover os casos de US4 de `tests/e2e/us-notebook.spec.ts`. Em `src/domain/notebook.ts`, manter `tipsOf` e `transportView` só se ainda forem usados; senão remover os dois e os testes deles.
- [X] T016 [US1] E2E em `tests/e2e/us-mobile.spec.ts` (US1), nos projetos `mobile-360` e `mobile-402`:
  - **Início**: só 3 cards;
  - **navegação**: tocar no centro da foto do card de Orlando abre `#/cidade/orlando`, e tocar no centro do 2º card de dia abre `#/dia/2026-11-08`. Os toques são `page.mouse.click` no centro do `boundingBox`, não no link;
  - **voltar**: o "voltar" refaz o caminho;
  - **largura**: em cada tela, `scrollWidth - clientWidth ≤ 0`;
  - **cabeçalho**: fica visível no topo depois de rolar 1000 px.

**Checkpoint**: Início → cidade → dia funciona nas duas larguras.

---

## Phase 4: User Story 2 - O dia com menu de seções só com o que existe (Priority: P1)

**Goal**: o dia com menu de seções preso no topo e as seções Paradas, Restaurantes e Cafés, Brechós
e Lojas, Bairros, Transporte e Dicas, só quando houver conteúdo.

**Independent Test**: 01/11, 09/11, 19/11 e 07/11 com os menus esperados (quickstart.md).

### Tests for User Story 2

- [X] T017 [P] [US2] Atualizar `tests/components/day.test.tsx`:
  - **01/11**:
    - o menu (`nav[aria-label="Seções do dia"]`) tem 6 links, na ordem: Paradas, Restaurantes e Cafés, Brechós e Lojas, Bairros, Transporte, Dicas;
    - `#comer` tem 24 cards e `#lojas` 17, cada um com 1 link para `#/perto/2026-11-01/<região>/<id>`;
  - **09/11**: sem "Brechós e Lojas";
  - **19/11**: só Paradas, sem nenhum "Sem informações";
  - **07/11**: Transporte com os três blocos;
  - **parada**: o card inteiro abre o detalhe, e o círculo de marcar continua marcando sem navegar;
  - **mantidos**: os testes atuais de marca "agora", Desfazer e voltar.
- [X] T018 [P] [US2] Atualizar `tests/components/orlando-day.test.tsx` às seções novas, com os mesmos fatos:
  - os avisos ficam em `#dicas`;
  - o deslocamento para Cocoa Beach fica em `#transporte`;
  - as 5 opções de comida do Magic Kingdom ficam em `#comer` em 08/11.

### Implementation for User Story 2

- [X] T019 [P] [US2] Criar `src/components/SectionMenu.tsx`:
  - `nav aria-label="Seções do dia"` com chips (`<a href="#<id>">`, alvo ≥ 44 px), presos abaixo do cabeçalho (`position: sticky; top: <altura do cabeçalho>`);
  - o menu rola na horizontal só por dentro (`overflow-x: auto`, sem rolagem da página);
  - o toque chama `document.getElementById(id).scrollIntoView({ block: 'start' })` com `preventDefault`, para não mexer no hash da rota;
  - a seção visível ganha `aria-current="true"` (IntersectionObserver com `rootMargin` negativo da altura do cabeçalho + menu).

  Seções com `scroll-margin-top` igual ao cabeçalho + menu. CSS em `src/styles/base.css`.
- [X] T020 [P] [US2] Criar `src/components/DayPlaceCard.tsx` no padrão `CardLink`:
  - miniatura quando houver foto;
  - nível ☕/🏆/🍰 e preço quando houver;
  - nome serifado (é o link);
  - `where`, `summary` (2 linhas);
  - o link de mapa "Abrir no mapa" como controle acima do link do card (`above-link`), externo e só quando houver `mapUrl`.
- [X] T021 [US2] Reestruturar `src/pages/Day.tsx` (contracts/screens.md "Dia"):
  - `PageHeader` → `Cover` com o resumo → `SectionMenu` (de `daySections`) → as seções, cada uma com `id` e título.

  As seções:
  - **`#paradas`**: os `StopCard`, com marca "agora" e Desfazer;
  - **`#comer`**: `DayPlaceCard` de `dayPlaces('food')`;
  - **`#lojas`**: `DayPlaceCard` de `dayPlaces('shop')`;
  - **`#bairros`**: `NeighborhoodCard`;
  - **`#transporte`**: a lista "Como circular hoje" da 008, com "Mapa do dia"; nos dias de viagem, `TransitionBlocks`;
  - **`#dicas`**: `DayAlerts` em modo lista.

  "Sobre este dia" se reduz ao resumo na capa. Nenhuma seção é renderizada sem conteúdo.
- [X] T022 [US2] Passar `src/components/StopCard.tsx` ao padrão `CardLink`:
  - o nome é o link esticado para o detalhe;
  - o círculo de marcar e a seta de expandir ficam `above-link`;
  - as ações do cartão expandido continuam;
  - o link "Ver onde comer perto" passa a apontar para `#comer` na mesma página, com rolagem, em vez de `#/perto/...`.
- [X] T023 [US2] E2E em `tests/e2e/us-mobile.spec.ts` (US2), nos dois projetos:
  - **01/11**: o menu tem 6 chips; tocar em "Brechós e Lojas" rola até `#lojas`, com o menu ainda visível no topo e com `aria-current` em "Brechós e Lojas";
  - **cards de lugar**: tocar no centro de um card de restaurante abre o detalhe;
  - **09/11**: sem "Brechós e Lojas";
  - **offline**: 07/11 mostra Transporte com os três blocos;
  - **largura**: nenhuma rolagem lateral, nem com o menu de chips.

**Checkpoint**: Início → cidade → dia com seções, nas duas larguras.

---

## Phase 5: User Story 3 - Atração com o descritivo à vista (Priority: P2)

**Goal**: na atração, título → descritivo completo → informações práticas → ações, sem "Ler mais".

**Independent Test**: Grand Central (31/10) e Tower of Terror (09/11) com todo o texto visível sem
toque.

### Tests for User Story 3

- [X] T024 [P] [US3] Atualizar `tests/components/step-detail.test.tsx`:
  - não existe `details.read-more`;
  - a ordem no DOM é `h1` → `.step-description` (com todos os textos sem rótulo do lugar) → `.step-practical` (horário, endereço, ingresso, mapa) → ações;
  - uma atração sem texto não renderiza `.step-description`.

### Implementation for User Story 3

- [X] T025 [US3] Reordenar `src/pages/StepDetail.tsx`:
  1. foto com crédito;
  2. `header` com horário pequeno e `h1`;
  3. `section.step-description`, com os textos do lugar e as orientações do evento, sem `<details>`;
  4. `section.step-practical`, com fila e acesso, endereço, ingresso, como chegar, `LinkButtons` e motorista;
  5. Feito/Pular/Desfazer;
  6. a navegação anterior/seguinte.

  Remover o CSS `.read-more`.
- [X] T026 [US3] E2E em `tests/e2e/us-mobile.spec.ts` (US3), nos dois projetos: em `#/dia/2026-10-31/ny3-2026-10-31-04`, o 1º parágrafo do descritivo está no viewport sem rolar a partir do título, não existe "Ler mais", e "Abrir no mapa" fica depois do descritivo. Atualizar o caso "Ler mais recolhido" de `tests/e2e/us-companion.spec.ts`.

**Checkpoint**: todas as user stories funcionam.

---

## Phase 6: Polimento e entrega

- [X] T027 Passar os cards restantes ao padrão `CardLink`: o detalhe e a lista do Bairro (`src/pages/Nearby.tsx`), `PointCard` do guia (`src/components/PointCard.tsx`) e os cards de `src/pages/Itineraries.tsx`. Conferir com um teste em `tests/components/card-link.test.tsx` que nenhum `article`/`.click-card` das telas principais tem mais de um link fora dos controles `above-link`.
- [X] T028 Gerar o relatório de dados em `scripts/build-content.ts`: o resumo do console imprime a contagem de `dataReview`, e o script escreve `specs/009-mobile-first-navigation/data-review.md` com a tabela por dia (lugar, tipo, o que falta). Não inventar nada: só listar.
- [X] T029 [P] Acessibilidade em `tests/e2e/us-notebook-a11y.spec.ts`:
  - **viewports**: 360 × 780 e 402 × 874, em vez de 390;
  - **telas**: troca a lista para Início, Cidade, Dia (01/11, 09/11, 07/11, 19/11), Bairro, Atração, Exibição e Motorista;
  - **contraste**: mantém as medições nos 3 temas;
  - **alvos**: ≥ 44 px em `.card-link`, `.stop-check`, `.stop-expand`, os chips do menu e `.round-btn`;
  - **largura**: sem rolagem lateral;
  - **cabeçalho**: dentro da área segura, com o topo do cabeçalho ≥ `env(safe-area-inset-top)`, checado com `getComputedStyle`.

  Remover os casos que dependiam do Início antigo em `tests/e2e/us-companion-a11y.spec.ts`.
- [X] T030 [P] Atualizar `README.md`: a seção "Como o app se usa na viagem" passa a descrever Início (só cidades), Cidade (dias), Dia (menu de seções) e Atração, os endereços diretos (`#/guia`, `#/full/<cidade>/documento`, `#/creditos`, `#/exibicao`) e as decisões Q1/Q2/Q3 da 009.
- [X] T031 Limpar componentes, CSS e testes sem uso depois da reestruturação:
  - **componentes**: `NextStepCard` reduzido aos helpers usados; `ProgressRing` e `Chip` se sem uso;
  - **CSS**: `.now-*`, `.later*`, `.free-banner`, `.cover-panel`, `.pill-tabs` e `.tab-bar`, conferidos com o script de classes sem uso da 008.

  Rodar `npm run typecheck` e o teste `design-terms`.
- [X] T032 Rodar o CI completo: `npm run typecheck && npm test && npm run content:strict && npm run build && npm run budget && npm run e2e`.
  - Conferir o snapshot de NY intacto e o JS inicial < 100 KB.
  - Gerar capturas a 360 × 780 e 402 × 874 de Início, Cidade (NY), Dia (01/11, 09/11) e Atração em `specs/009-mobile-first-navigation/screens/`.
- [X] T033 Escrever `specs/009-mobile-first-navigation/report.md` (FR-022):
  - as mudanças por página (Início, Cidade, Dia, Atração, Bairro, telas removidas, endereços diretos);
  - a confirmação dos testes a 360 px e 402 px, com os nomes dos testes e o resultado;
  - o link para `data-review.md` com os dados a revisar.

  Marcar as tarefas no tasks.md.
- [X] T034 Com autorização do usuário, commitar a feature 009. Sem autorização, só informar que está pronta.

---

## Dependencies & Execution Order

- **Setup (T001–T002)**: T002 é livre.
- **Foundational (T003–T009)**: depende do Setup. Ordem: T003 → T004 → T005 → T006 → T007; T008 → T009.
- **US1 (T010–T016)**: depende da fase 2. Ordem: T012 → (T013 ∥ T014 ∥ T015) → T016.
- **US2 (T017–T023)**: depende da fase 2 e de T012, que define o padrão de card nos cards de bairro. Ordem: (T019 ∥ T020) → T021 → T022 → T023.
- **US3 (T024–T026)**: depende da fase 2; independe de US1 e US2.
- **Polimento (T027–T034)**:
  - T027 depois de US1 e US2;
  - T028, T029 e T030 em paralelo;
  - T031 → T032 → T033;
  - T034 por último, com autorização.

### Parallel Opportunities

- T002 é livre.
- T008 ∥ T004–T007 (arquivos diferentes); T009 depois de T008.
- US1: T010 ∥ T011.
- US2: T017 ∥ T018 ∥ T019 ∥ T020.
- US3 inteira em paralelo com US2.
- Polimento: T028 ∥ T029 ∥ T030.

## Parallel Example: User Story 2

```text
Task: "T019 SectionMenu em src/components/SectionMenu.tsx"
Task: "T020 DayPlaceCard em src/components/DayPlaceCard.tsx"
Task: "T017 Testes do dia em tests/components/day.test.tsx"
Task: "T018 Testes de Orlando em tests/components/orlando-day.test.tsx"
```

## Implementation Strategy

### MVP First (US1 + US2)

1. Fundação: cabeçalho fixo, sem barra de baixo, `CardLink`, rotas e `daySections`.
2. US1: Início e Cidade enxutos, com cards clicáveis.
3. US2: o dia com o menu de seções.

**Prazo**: o embarque é em 31/10. US1 e US2 são o uso na viagem; US3 e o polimento vêm em seguida.

### Incremental Delivery

1. Navegação (US1).
2. Dia (US2).
3. Atração (US3).
4. Polimento, relatório e dados a revisar.

## Notes

- Q1 = B: sem "Agora" e sem "Reservar hoje". O que fica fora dos menus continua por endereço direto
  (`#/guia`, `#/full/<cidade>/documento`, `#/creditos`, `#/exibicao`).
- Q2 = B: as dicas da cidade ficam só no documento completo.
- Q3 = A: sem barra de baixo.
