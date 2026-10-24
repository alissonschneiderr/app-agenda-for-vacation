---

description: "Task list for feature 006 — Guia de bolso da viagem"
---

# Tasks: Guia de bolso da viagem (nova experiência do app)

**Input**: Design documents from `/specs/006-trip-companion-ux/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/routes.md,
contracts/ui-screens.md, quickstart.md

**Tests**: Incluídos (constituição, Princípio II): domínio com relógio fixo, componentes e E2E por story
com cenário offline, contraste e alvos de toque.

**Organization**: por user story (US1–US5 da spec).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência pendente)
- **[Story]**: US1–US5

## Phase 1: Setup

- [X] T001 Com autorização do usuário, commitar as features 003, 004 e 005 (um commit por feature) e criar a branch `006-trip-companion-ux`. Antes, confirmar `npm run typecheck && npm test && npm run content:strict` verdes. — commits feitos em 24/10/2026, na branch `007-orlando-itinerary-doc` (um commit de specs por feature e um de implementação para 003–007)
- [X] T002 [P] Adicionar `dayKinds` em content/trip.json conforme research.md R5, com `'walk' | 'beach' | 'park' | 'transit'`:

  | Datas | Tipo |
  |---|---|
  | NY 2026-10-31 a 2026-11-06 | `walk` |
  | 2026-11-07, 2026-11-18, 2026-11-21 | `transit` |
  | Orlando 08/11 (Disney Springs), 11/11 (Kennedy), 14/11 (Winter Park) | `walk` |
  | Orlando 09, 10, 12, 13, 15, 16 e 17/11 (parques) | `park` |
  | Miami 19/11 (South Beach) | `beach` |
  | Miami 20/11 | `walk` |

  Validar em scripts/content-schema.ts que toda data de `tripDates` tem tipo; sem tipo, o build falha. Atualizar tests/fixtures/content.ts e tests/content/content-rules.test.ts.

---

## Phase 2: Foundational (Blocking Prerequisites)

**⚠️ CRITICAL**: Nenhuma user story começa antes desta fase.

- [X] T003 Atualizar os tipos em src/content/types.ts conforme data-model.md:
  - `TripContent.dayKinds`;
  - `FullDay.alerts?: { id: string; html: string }[]`, com id `al:<data>:<n>`;
  - `FullItinerary.departures?: Record<DateStr, { id: string; label: string; text: string; block: 'before' | 'trip' }[]>`, com id `tr:<data>:<n>`;
  - `photo?: Photo` em `DocPlace` e em `DayArea`.
- [X] T004 [P] Testes em tests/unit/nyc-doc-parser.test.ts para o leitor:
  - **avisos do dia**: cada parágrafo ou lista antes do primeiro `###` (exceto resumo, mapa do dia e saída) vira um aviso com id `al:2026-11-01:1`…;
  - **partida**: cada item `**Rótulo:** texto` da seção "Partida" vira `{ id: 'tr:2026-11-07:n', label, text, block }`, com `block: 'before'` para rótulos com "Check-out"/"Último café" e `'trip'` para os demais.
- [X] T005 Implementar T004 em scripts/nyc-doc-parser.ts:
  - `alerts` no `FullDay`;
  - `departures` no resultado;
  - `dayNotes` passa a conter só a partida (os avisos saem dele).

  Ajustar scripts/full-itinerary-schema.ts e scripts/build-content.ts.
- [X] T006 [P] Testes em tests/unit/now.test.ts, com relógio fixo e o conteúdo de fixture com áreas, cobrindo `src/domain/now.ts` conforme data-model.md:
  - `nextStep`:
    - pula transit/free e itens feitos/pulados;
    - usa o fim explícito; senão, o início do passo seguinte; senão, início + 15 min;
    - devolve `null` com o dia concluído;
  - `upcoming(n=3)`;
  - `nowIndex`: só no dia de hoje, no fuso `America/New_York`, incluindo 01/11 depois do fim do horário de verão;
  - `currentArea`;
  - `howToGet`, na ordem de R3:
    1. o deslocamento com horário logo antes;
    2. o `transfer` da área anterior;
    3. a saída do hotel;
  - `dayKind`;
  - `tripPhase`: before/during/after.
- [X] T007 Implementar src/domain/now.ts (funções puras sobre `TripDayView` + `UserState` + `Date`), reaproveitando `zonedNow`, `dayView` e `progressOf` de src/domain/trip-view.ts e src/domain/opening-hours.ts. Incluir `nowFromUrl()`: `?agora=AAAA-MM-DDTHH:MM` interpretado no fuso da viagem, para a revisão do casal (quickstart.md).
- [X] T008 [P] Criar src/storage/prefs.ts:
  - formato `{ readAlerts: string[]; highContrast: boolean }` em `localStorage['ctha:prefs']`;
  - toda leitura e gravação dentro de `try/catch`; sem armazenamento, valores padrão;
  - hook `usePrefs()`;
  - testes em tests/unit/prefs.test.ts, incluindo `localStorage` que lança exceção.
- [X] T009 Atualizar src/app.tsx e src/lib/router.ts com as rotas de contracts/routes.md e os redirecionamentos. Criar src/components/TabBar.tsx:
  - 4 abas "Agora · Dia · Por perto · Viagem", com ícone + rótulo e altura de 56 px;
  - fixa embaixo no celular, coluna lateral em ≥ 1024 px;
  - aba ativa marcada com `aria-current="page"`.

  Remover src/components/BottomNav.tsx (e TopNav) e os links para Favoritos/Meus roteiros. Atualizar tests/e2e/helpers.ts se necessário.
- [X] T010 Escala de tipo e contraste em src/styles/base.css (research.md R8):
  - base 17 px; horários e nomes de 20 a 22 px; cartão Agora de 26 a 28 px;
  - `--muted` com contraste ≥ 7:1 sobre `--bg`/`--surface` nos dois temas;
  - alvos de toque ≥ 48 px;
  - `:root[data-contrast="high"]` com preto/branco puros e bordas de 2 px.

**Checkpoint**: `npm run typecheck && npm test && npm run content:strict` verdes; o app abre nas 4 abas, mesmo com telas provisórias.

---

## Phase 3: User Story 1 - "Agora": o próximo passo em 2 segundos (Priority: P1) 🎯 MVP

**Goal**: Abrir o app e ver o próximo passo do dia de hoje com como chegar, ações e "Mostrar ao motorista".

**Independent Test**: `?agora=2026-11-01T13:30` → cartão "13h40 · Mott Street · Chinatown" sem tocar em nada.

### Tests for User Story 1

- [X] T011 [P] [US1] Testes de componente em tests/components/now.test.tsx:
  - o cartão mostra horário, nome, região, como chegar e 🎟️;
  - "Feito" avança e "Desfazer" volta;
  - intervalo livre mostra "Ver onde comer";
  - noite com evento mostra as orientações;
  - dia concluído mostra a prévia de amanhã;
  - antes da viagem mostra a contagem e os ingressos pendentes;
  - faixa de aviso: "Entendi" grava `readAlerts`, e o aviso não volta.
- [X] T012 [P] [US1] E2E em tests/e2e/us-companion-now.spec.ts:
  - US1 do quickstart.md;
  - "Motorista" com endereço ≥ 40 px (`getComputedStyle`);
  - tudo também offline.

### Implementation for User Story 1

- [X] T013 [P] [US1] Criar src/components/NextStepCard.tsx conforme contracts/ui-screens.md ("Agora", item 3):
  - foto 16:9 ou ícone;
  - horário e nome ≥ 26 px;
  - região;
  - 🎟️;
  - "Como chegar" (2 linhas + "mais");
  - ações Feito · Pular · Motorista · Detalhes.
- [X] T014 [P] [US1] Criar src/components/UndoToast.tsx:
  - aviso inferior "Feito · Desfazer" (ou "Pulado · Desfazer") por 6 s;
  - `role="status"`;
  - desfazer chama `unmarkActivity`.
- [X] T015 [P] [US1] Criar src/components/DayAlerts.tsx:
  - modo "faixa" (1 aviso não lido, "Entendi", "Ver todos");
  - modo "lista recolhida" ("N avisos para hoje"), usando `usePrefs`.
- [X] T016 [US1] Criar src/pages/Now.tsx:
  - cabeçalho (cidade, "Dia N de M", tema, progresso);
  - DayAlerts (faixa);
  - NextStepCard;
  - "Depois" (2–3 linhas);
  - atalho "Comer em <região>" para `#/perto`;
  - os estados de contracts/ui-screens.md: antes, depois, concluído, intervalo, noite e transição (a transição só usa o componente da US5 quando ele existir).
- [X] T017 [US1] Criar src/pages/Driver.tsx (`#/motorista/:date/:key`):
  - nome ≥ 32 px e endereço ≥ 40 px, em alto contraste;
  - "New York, NY" quando o endereço não traz cidade;
  - toque em qualquer lugar ou voltar fecha a tela;
  - Wake Lock quando disponível, protegido.
- [X] T018 [US1] Remover src/pages/Trip.tsx e mover para `Now`/`TripOverview` o que ainda for usado. Atualizar tests/components/* que dependiam de `Trip`.

**Checkpoint**: US1 completa; T011–T012 verdes

---

## Phase 4: User Story 2 - "Dia": a linha do tempo de relance (Priority: P1)

**Goal**: Linha do tempo compacta com regiões, conectores, intervalos, noite e marca "agora"; deslizar troca de dia.

**Independent Test**: `#/dia/2026-11-01` em 390 px mostra ≥ 8 passos na dobra, sem restaurantes na linha.

### Tests for User Story 2

- [X] T019 [P] [US2] Testes de componente em tests/components/day.test.tsx:
  - divisórias de região com "Opções (N)";
  - conector de deslocamento (toque expande);
  - intervalo livre;
  - marca "agora" só no dia de hoje;
  - nenhum `PlaceCard` na linha do tempo;
  - tipos `beach` (blocos Manhã/Tarde/Pôr do sol) e `park` (áreas);
  - dia passado sem destaque de atraso.
- [X] T020 [P] [US2] E2E em tests/e2e/us-companion-day.spec.ts:
  - ≥ 8 linhas de passo dentro de 844 px;
  - deslizar (`page.mouse` com arraste horizontal) para 02/11;
  - "Hoje" volta;
  - offline.

### Implementation for User Story 2

- [X] T021 [P] [US2] Criar src/components/TimelineRow.tsx com as variantes:
  - passo: horário 20 px tabular · nome 20 px · 🎟️ · DoneToggle;
  - conector;
  - intervalo;
  - noite;
  - marca "agora".
- [X] T022 [US2] Criar src/pages/Day.tsx:
  - cabeçalho fixo ◀ ▶ com "Hoje" e progresso;
  - DayAlerts recolhido;
  - linha do tempo por tipo de dia (`walk`, `beach`, `park`, `transit`);
  - gesto de deslizar com Pointer Events (limiar de 60 px e predominância horizontal), com animação desligada em `prefers-reduced-motion`.

  Substitui src/pages/Destination.tsx (remover) e src/components/AreaSection.tsx (remover; as listas vão para Por perto).
- [X] T023 [US2] Ajustar src/components/DayNav.tsx, ou remover se o cabeçalho de Day.tsx o substituir. Atualizar tests/components/destination.test.tsx → tests/components/day.test.tsx e tests/components/area-section.test.tsx (remover ou migrar para Por perto).

**Checkpoint**: US1 e US2 completas; T019–T020 verdes

---

## Phase 5: User Story 3 - "Por perto" (Priority: P1)

**Goal**: Opções da região atual em Comer (☕/🏆/🍰), Lojas e Curiosidades, com seletor de região.

**Independent Test**: `?agora=2026-11-01T13:40` → `#/perto` mostra Chinatown com 6 opções em Comer; filtro 🍰 mostra 2.

### Tests for User Story 3

- [X] T024 [P] [US3] Testes de componente em tests/components/nearby.test.tsx:
  - região inicial = `currentArea`;
  - chips trocam de região;
  - grupos com contagem;
  - filtro ☕/🏆/🍰;
  - cartão curto com ≤ 4 linhas de conteúdo (nível, nome, preço, pedido/estilo, fila);
  - avisos da região acima da lista;
  - curiosidade com obra e dica de foto.
- [X] T025 [P] [US3] E2E em tests/e2e/us-companion-nearby.spec.ts: cenário US3 do quickstart.md + detalhe da opção com "Abrir no mapa" e "Motorista" + offline.

### Implementation for User Story 3

- [X] T026 [US3] Em src/components/PlaceCard.tsx:
  - criar a variante `short`: nível, nome, preço com legenda, 1 linha de "Peçam…" ou estilo, fila;
  - a variante completa ganha "Mostrar ao motorista".
- [X] T027 [US3] Criar src/pages/Nearby.tsx (`#/perto[/:date/:areaId[/:placeId]]`):
  - chips de região;
  - abas segmentadas Comer · Lojas · Curiosidades;
  - filtro de comida;
  - cartões curtos;
  - detalhe da opção.

**Checkpoint**: US1–US3 completas (MVP); T024–T025 verdes

---

## Phase 6: User Story 4 - Detalhes, fotos e história (Priority: P2)

**Goal**: Detalhe com fotos offline, essencial e ações na dobra e "Ler mais" recolhido; fotos livres para cada região e passo (Q2).

**Independent Test**: Detalhe de "Grand Central Terminal" com foto, horário e botões na dobra, e "Ler mais" recolhido; ≥ 90% das regiões e passos de NY com foto.

### Tests for User Story 4

- [X] T028 [P] [US4] Testes de componente em tests/components/step-detail.test.tsx:
  - ordem dos blocos de FR-016;
  - "Ler mais" recolhido por padrão;
  - evento com blocos "Como chegar", "Antecedência" e "Volta";
  - sem foto → ícone + "Ver fotos", sem imagem de outro lugar.
- [X] T029 [P] [US4] Teste de conteúdo em tests/content/doc-photos.test.ts:
  - toda entrada de content/full/nova-york/doc-photos.json corresponde a um nome de região ou de passo do doc;
  - toda foto tem crédito com licença permitida (`ALLOWED_LICENSE`);
  - cobertura ≥ 90% das regiões `bairro` e dos passos marcáveis.

### Implementation for User Story 4

- [X] T030 [US4] Estender scripts/fetch-photos.ts com o modo `--doc`:
  - lê content/full/nova-york/doc-photos.json (`File:…` ou `wiki:…`);
  - gera WebP de 900 px em public/photos/doc/<slug>.webp;
  - grava os créditos em content/full/nova-york/photo-credits.json;
  - registra os sem foto em specs/006-trip-companion-ux/photos-missing.md.

  No build (scripts/build-content.ts), preencher `photo` de `DocPlace`/`DayArea`: primeiro doc-photos; senão, o ponto do guia ligado.
- [X] T031 [US4] Montar content/full/nova-york/doc-photos.json:
  - para cada região `bairro` e cada passo marcável sem foto do guia, buscar na Wikimedia Commons uma foto livre do próprio lugar;
  - conferir visualmente cada uma (abrir a imagem) antes de incluir;
  - rodar `npm run photos -- --doc`.
- [X] T032 [US4] Criar src/pages/StepDetail.tsx a partir de src/pages/ActivityDetail.tsx (remover este), com a ordem de FR-016:
  1. fotos com crédito;
  2. horário e nome;
  3. aviso;
  4. "Como chegar" (instrução de `howToGet`, "Abrir no mapa", "Motorista");
  5. Feito/Pular;
  6. orientações do evento;
  7. "Ler mais" (`<details>`) com o contexto;
  8. "Ver mais fotos".

**Checkpoint**: US4 completa; T028–T029 verdes

---

## Phase 7: User Story 5 - Viagem e dias de transição (Priority: P2)

**Goal**: Visão geral das cidades com "vocês estão aqui", progresso, compras, consulta e exibição; transição em três blocos.

**Independent Test**: `?agora=2026-11-03T10:00` → `#/viagem` com NY marcada "dia 4 de 8"; 07/11 com três blocos marcáveis.

### Tests for User Story 5

- [X] T033 [P] [US5] Testes de componente em tests/components/trip-overview.test.tsx e tests/components/transition.test.tsx:
  - 3 cidades em ordem com datas e dias;
  - marcador;
  - progresso por cidade e total;
  - "Para comprar antes" e "Ingressos comprados";
  - links Dicas, Documento, Guia e Créditos;
  - alto contraste liga `data-contrast` e persiste;
  - transição com "Antes de sair", "A viagem" e "A chegada";
  - itens marcáveis e desfazíveis;
  - bloco vazio diz "Sem orientações no roteiro".
- [X] T034 [P] [US5] E2E em tests/e2e/us-companion-trip.spec.ts: cenários US5 do quickstart.md + guia acessível por Viagem + offline.

### Implementation for User Story 5

- [X] T035 [P] [US5] Criar src/components/TransitionBlocks.tsx. Os blocos vêm de `departures[date]` (before/trip) e do primeiro dia da cidade seguinte (chegada); as chaves `tr:<data>:<n>` usam `markActivity`/`unmarkActivity`.
- [X] T036 [US5] Criar src/pages/TripOverview.tsx (`#/viagem`):
  - linha das cidades, com pontos de dia por tipo e progresso;
  - "vocês estão aqui";
  - progresso total;
  - checklist e compromissos;
  - consulta: Dicas práticas, Documento completo, Guia de pontos, Créditos;
  - "Exibição": alto contraste.
- [X] T037 [US5] Usar TransitionBlocks em src/pages/Now.tsx e src/pages/Day.tsx para dias `transit`.

**Checkpoint**: Todas as histórias funcionam

---

## Phase 8: Polish & Cross-Cutting Concerns

- [X] T038 [P] E2E transversal em tests/e2e/us-companion-a11y.spec.ts:
  - contraste ≥ 7:1 de horário, nome e endereço nos temas claro, escuro e alto contraste;
  - alvos ≥ 48 px em Agora, Dia, Por perto e Viagem a 390 px;
  - sem rolagem horizontal;
  - qualquer informação de 01/11 a ≤ 2 toques (SC-002).
- [X] T039 Remover E2E obsoletos ou migrá-los para as rotas novas (tests/e2e/us-travel-guide.spec.ts, us-full-itinerary.spec.ts, us-nyc-doc.spec.ts, us2-favorites.spec.ts, us3-itineraries.spec.ts), mantendo a cobertura de: conteúdo de NY, Orlando/Miami, offline, marcações e redirecionamentos.
- [X] T040 [P] Atualizar README.md (navegação nova, `?agora=` para simular, `npm run photos -- --doc`) e specs/003-travel-guide-redesign/contracts/routes.md com nota apontando para a 006.
- [X] T041 Rodar a sequência do CI (`typecheck`, `test`, `content:strict`, `build`, `budget`, `e2e`).
- [X] T042 Revisão visual a 390 px e 1280 px, claro/escuro/alto contraste:
  - Agora em 01/11 13h30;
  - Dia 01/11;
  - Por perto Chinatown;
  - detalhe Grand Central;
  - Motorista;
  - Viagem;
  - 07/11.
- [ ] T043 Commit na branch `006-trip-companion-ux` (com autorização) e revisão do casal com `?agora=` num dia simulado e em 07/11 (SC-008). — **Parcial**: commit feito em 24/10/2026 (branch `007-orlando-itinerary-doc`); falta a revisão do casal

---

## Dependencies & Execution Order

- Setup (T001–T002) → Foundational (T003–T010) → US1 → US2 → US3 → US4 → US5 → Polish
- T003 → T005, T007; T004 → T005; T006 → T007; T009 depende de T007/T008 para as telas provisórias
- US1: T011/T012 ∥ T013/T014/T015 → T016 → T017 → T018
- US2: T019/T020 ∥ T021 → T022 → T023
- US3: T024/T025 ∥ T026 → T027
- US4: T028/T029 ∥ T030 → T031 → T032
- US5: T033/T034 ∥ T035 → T036 → T037
- US4 (fotos) pode começar logo após a fase 2, em paralelo com US1–US3

### Parallel Opportunities

- T002; T004, T006, T008
- US1: T011, T012, T013, T014, T015
- US2: T019, T020, T021
- US3: T024, T025
- US4: T028, T029 (e T030/T031 em paralelo com as telas)
- US5: T033, T034, T035
- Polish: T038, T040

---

## Parallel Example: User Story 1

```bash
Task: "Testes de componente em tests/components/now.test.tsx"
Task: "NextStepCard em src/components/NextStepCard.tsx"
Task: "UndoToast em src/components/UndoToast.tsx"
Task: "DayAlerts em src/components/DayAlerts.tsx"
```

---

## Implementation Strategy

1. Setup + Foundational: tipos de dia, avisos/partida no leitor, domínio `now.ts`, preferências, abas, escala de tipo.
2. **MVP = US1 + US2 + US3** (P1): Agora, Dia e Por perto — o uso na rua.
3. US4: detalhe e fotos offline (pode correr em paralelo desde a fase 2).
4. US5: Viagem e transição.
5. Polish: acessibilidade, migração de E2E, revisão visual e do casal, commit.

---

## Notes

- Nenhuma foto de outro lugar: na dúvida, fica sem foto e vai para photos-missing.md (FR-026).
- Nenhum alerta de atraso nem recálculo de horários (Q1).
- T001 e T043 envolvem git: só com autorização do usuário.
