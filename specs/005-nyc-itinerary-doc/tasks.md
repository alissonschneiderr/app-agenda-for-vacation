---

description: "Task list for feature 005 — Roteiro de Nova York por bairros"
---

# Tasks: Roteiro de Nova York por bairros (doc do Alisson)

**Input**: Design documents from `/specs/005-nyc-itinerary-doc/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Incluídos (constituição, Princípio II): leitor com fixtures, doc real com contagens
independentes, componentes e E2E por story com cenário offline.

**Organization**: por user story. A fonte é a exportação do doc
(`specs/005-nyc-itinerary-doc/source/roteiro-2026-10-22-v57.md`), copiada **sem edição**.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência pendente)
- **[Story]**: US1–US3 conforme spec.md

## Phase 1: Setup

- [X] T001 Com autorização do usuário, commitar as features 003 e 004 (branch `003-travel-guide-redesign`) e criar a branch `005-nyc-itinerary-doc`; confirmar `npm run typecheck && npm test && npm run content:strict` verdes antes de começar — commits feitos em 24/10/2026, na branch `007-orlando-itinerary-doc` (um commit de specs por feature e um de implementação para 003–007)
- [X] T002 Substituir content/full/nova-york/roteiro.md pelo conteúdo exato de specs/005-nyc-itinerary-doc/source/roteiro-2026-10-22-v57.md (cópia byte a byte; conferir com `cmp`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**⚠️ CRITICAL**: Nenhuma user story começa antes desta fase

- [X] T003 Atualizar src/content/types.ts conforme data-model.md:
  - `ActivityType` ganha `'free'`;
  - `Activity` ganha `areaId?: string | null`;
  - novo `DayArea` = `{ id; kind: 'bairro' | 'chegada' | 'noite' | 'ideias'; name; photoUrls: {label;url}[]; intro?; activityIds: string[]; placeIds: string[]; notesHtml? }`;
  - `FullDay` ganha `mapUrl?` e `areas?: DayArea[]`;
  - `DocPlace` ganha `photoUrls: {label;url}[]`, `price?`, `queue?`, e `level` passa a aceitar `'☕' | '🏆' | '🍰'`;
  - `ChecklistItem` mantém `what`, `forDate?`, `when?`, `note?`, `activityId?`;
  - `FullItinerary` ganha `checklistOverrides?: { find: string; replace: string }[]`.
- [X] T004 [P] Escrever tests/unit/nyc-doc-parser.test.ts (substitui o da 004), com um trecho-fixture em Markdown que tenha todos os blocos de contracts/document-format.md:
  - **estrutura do dia:**
    - dia `## Dia 2 (domingo, 01/11): A · B`, com resumo, `🗺️ **Mapa do dia:**` e `**09h40 – saída:**`;
    - aviso `**⚠️ …**` no topo do dia.
  - **área e itens com horário:**
    - área `### 📍 SoHo`, com `[📷 ver fotos…]`, texto e `**Atrações (no roteiro):**`;
    - item `- **10h30 — 🏛️ Nome** 🎟️ *nota*` com subitens de links e texto;
    - item de intervalo `**11h15 às 12h30 — 🛍️ Compras…**`;
    - item `**\~12h00 — pausa livre**`, que deve virar `free`;
    - item `**09h45 – saída a pé**`, que deve virar `transit`.
  - **listas de lugares:**
    - lista `**🛍️ Lojas…**`, com tipo · estilo · 💵 · texto e `[Mapa]`;
    - lista `**☕🏆🍰 Onde comer…**`, com itens ☕/🏆/🍰, preço e fila, e um item sem o padrão de preço, que deve manter o texto inteiro;
    - parágrafo em itálico `*☕ Nenhuma cafeteria…*`, que deve virar aviso da área;
    - lista `**🎬 Locações no caminho**`, com "Foto:";
    - parágrafo `🎬 **Locação no caminho:** **Nome** — …`.
  - **logística:**
    - `🚶 **Deslocamento…**` sem horário;
    - `🛥️`/`🚕` com horário entre parênteses;
    - `🏨 **\~19h30 – volta ao hotel:**`.
  - **noites:**
    - `### 🌙 Noite: Knicks x Nets … (19h30)`, que deve virar `commitment`;
    - `### 🌙 Noite: Desfile`, sem horário no título e com "sai às **19h**";
    - parágrafo `🌙 **Noite: jantar livre…**`, que deve virar `free`.
  - **seções finais:**
    - `### 💡 Ideias…`;
    - `## ✈️ Partida (sábado, 07/11)`;
    - tabela `Data | Atração | Situação` com `checklistOverrides`;
    - seções gerais em HTML.
  - **regras:** D1–D5 acusando cada tipo de falta.
- [X] T005 Reescrever scripts/nyc-doc-parser.ts para o formato por bairros, conforme contracts/document-format.md:
  - assinatura `parseNycDoc(markdown, { year, pointLinks, commitments, checklistOverrides })`, que retorna `{ doc: { title, byline, days, docHtml, dayNotes, checklist }, errors }`;
  - ids `ny3-AAAA-MM-DD-NN`;
  - horários (`HHhMM`, `HHh`, `\~`, `às`, `–`, `até`) preservados em `timeLabel`;
  - item com 🎟️ → `booking.required` + `how` = nota;
  - ligação de atividade ↔ lugar `attraction` próprio ↔ `pointId` via `pointLinks`;
  - checklist ligado à atividade pela data + nome ou horário;
  - `checkFidelity(markdown, doc)` com D1–D5 contados direto no texto.
- [X] T006 [P] Atualizar content/full/nova-york/point-links.json com os nomes de atração do doc novo, ligados só a pontos do guia que mostram o próprio lugar:
  - Grand Central Terminal → ny-grand-central;
  - Biblioteca Pública de Nova York (Stephen A. Schwarzman Building) → ny-public-library;
  - Bryant Park → ny-bryant-park;
  - 5th Avenue, da rua 42 à 50 → ny-fifth-avenue;
  - Catedral de St. Patrick → ny-st-patricks;
  - Rockefeller Center / Top of the Rock → ny-top-of-the-rock;
  - Times Square → ny-times-square;
  - Distrito Histórico de Ferro Fundido (Greene Street) → ny-soho;
  - Mott Street → ny-chinatown;
  - Memorial do 11 de Setembro → ny-911-memorial;
  - Oculus → ny-oculus;
  - Wall Street, Bolsa de Valores e Federal Hall / Touro de Wall Street (Charging Bull) → ny-wall-street;
  - Washington Square Park e o arco → ny-washington-square;
  - American Museum of Natural History → ny-amnh;
  - Strawberry Fields / The Mall / Bethesda Terrace e a fonte / Bow Bridge / Belvedere Castle → ny-central-park;
  - The Metropolitan Museum of Art → ny-met;
  - Ponte do Brooklyn, a pé, saindo de Manhattan → ny-brooklyn-bridge;
  - Foto da Manhattan Bridge na Washington Street → ny-dumbo;
  - Pebble Beach / Vista do skyline (Empire Fulton Ferry e Pier 1) → ny-brooklyn-bridge-park;
  - MoMA – Museum of Modern Art → ny-moma;
  - Vessel → ny-hudson-yards;
  - High Line, da rua 30 até a rua 23 → ny-high-line;
  - Chelsea Market (75 9th Ave) → ny-chelsea-market;
  - Little Island → ny-little-island;
  - Empire State Building → ny-empire-state.
- [X] T007 [P] Atualizar content/full/nova-york/meta.json:
  - `knicks-nets.arriveBy = "18:30"` (o doc diz "Cheguem por volta das 18h30");
  - `mj-musical` em 2026-11-05 19:00, `arriveBy 18:30`;
  - `checklistOverrides: [{ "find": "Tenement Museum, tour das 15h30", "replace": "Tenement Museum, tour das 16h15" }]` (Q1).
- [X] T008 Ajustar scripts/full-itinerary-schema.ts às regras de specs/005-nyc-itinerary-doc/contracts/validation-rules.md:
  - schema com áreas, tipo `free`, `photoUrls`, `price` e `queue`;
  - F4 só entre atividades com fim explícito;
  - F8 sem exigir linha "Chegada ao…";
  - F10 pela primeira área citar JFK e haver linha até o Pod 51;
  - F11 removida;
  - F18 por 🎟️.

  Atualizar também tests/content/full-itinerary-rules.test.ts e tests/fixtures/full-itinerary.ts.
- [X] T009 Em scripts/build-content.ts, passar `checklistOverrides` ao leitor e incluir `areas` e `mapUrl`. Imprimir "roteiro FULL nova-york: 7 dias, N áreas, N atividades (N com Feito/Pendente), N lugares, N links de fotos, N links de mapa".

**Checkpoint**: `npm run content:strict` passa com o doc real; testes de unidade verdes

---

## Phase 3: User Story 1 - Seguir o dia por bairros (Priority: P1) 🎯 MVP

**Goal**: Cada dia mostra os bairros na ordem do doc, com itens com horário, logística e noites; Feito/Pendente só nas atividades.

**Independent Test**: 01/11 com os 6 bairros na ordem; 02/11 Knicks 19h30 / chegar até 18h30; pausa livre sem Feito/Pendente; marcas antigas sem efeito.

### Tests for User Story 1

- [X] T010 [P] [US1] Escrever tests/content/nyc-doc-real.test.ts (substitui o da 004) sobre content/full/nova-york/roteiro.md, com contagens feitas por expressões simples sobre o texto, sem usar o leitor:
  - os 7 dias;
  - os `###` de cada dia na ordem, iguais aos nomes das áreas;
  - as 75 linhas de lista com horário + as 16 de logística com horário, na ordem e com o mesmo `timeLabel`;
  - nenhum id `ny-`/`nyv2-`;
  - Knicks 18:30 e MJ 05/11;
  - os 8 itens do checklist, com Tenement 16h15;
  - os 85 links de fotos e os 160 de mapa presentes;
  - todas as seções `##`.
- [X] T011 [P] [US1] Testes E2E em tests/e2e/us-nyc-doc.spec.ts (parte US1):
  - `#/destino/nova-york/2026-11-01` mostra os títulos dos bairros na ordem SoHo, Nolita, Chinatown, Little Italy, Lower East Side, East Village;
  - 02/11 mostra "Knicks x Nets · 19:30 · chegar até 18:30";
  - 05/11 mostra MJ, e 04/11 não;
  - "pausa livre" de 31/10 aparece sem checkbox;
  - estado com marcas `ny-2026-…` e `nyv2-2026-…` → "Nova York: 0 de";
  - tudo também offline.

### Implementation for User Story 1

- [X] T012 [US1] Atualizar src/domain/trip-view.ts:
  - `trackable` = não é `transit` nem `free`;
  - `DayActivityView` ganha `areaId`;
  - `TripDayView` ganha `areas` (com as atividades resolvidas por área) e `mapUrl`;
  - `nextPendingActivity` ignora `free`;
  - atualizar tests/unit/trip-view.test.ts para cobrir `free`.
- [X] T013 [P] [US1] Criar src/components/AreaSection.tsx. Um bairro tem:
  - cabeçalho com ícone pelo `kind`, nome e "Ver fotos" (LinkButtons);
  - `intro`;
  - lista de atividades (ActivityRow; `free` como linha de intervalo, sem DoneToggle);
  - as listas de lugares (US2);
  - `notesHtml` em bloco "Avisos e dicas";
  - os itens de logística ao fim (TransitLine).
- [X] T014 [US1] Atualizar src/components/ActivityRow.tsx para renderizar `free` como linha de intervalo (ícone de relógio, horário, título, sem DoneToggle e sem link).
- [X] T015 [US1] Atualizar src/pages/Destination.tsx para dias com `areas`:
  - resumo, botão "Mapa do dia" (LinkButtons com `mapUrl`) e notas do dia (`notesHtml` do topo);
  - a saída do hotel;
  - uma AreaSection por área, na ordem, no lugar dos blocos Manhã/Tarde/Noite e das seções de lugares da 004;
  - dias sem áreas (Orlando/Miami) continuam como estão.
- [X] T016 [US1] Atualizar os E2E de NY afetados (tests/e2e/us-full-itinerary.spec.ts, tests/e2e/us-travel-guide.spec.ts) e remover tests/e2e/us-nyc-v2.spec.ts (conteúdo da 004), mantendo o que cada teste verifica com o conteúdo novo.

**Checkpoint**: US1 completa; T010–T011 verdes

---

## Phase 4: User Story 2 - Onde comer, comprar e fotografar (Priority: P1)

**Goal**: Cada bairro mostra lojas, comida (☕/🏆/🍰) e locações com os campos do doc, "Ver fotos" e "Abrir no mapa"; restaurantes sem Feito/Pendente (Q2).

**Independent Test**: Chinatown (01/11) com 6 opções de comida + aviso; links exatos; offline com aviso.

### Tests for User Story 2

- [X] T017 [P] [US2] Testes de componente em tests/components/area-section.test.tsx:
  - bairro com 2 lojas, 3 opções de comida (☕, 🏆, 🍰), 1 locação e 1 aviso mostra cada campo do doc: nível, nome, endereço, texto, preço, fila, tipo, estilo, obra e dica de foto;
  - "Ver fotos" e "Abrir no mapa" com os `href` exatos;
  - nenhum DoneToggle nos lugares;
  - offline: aviso + endereço.

  Atualizar tests/components/place-card.test.tsx para `LinkButtons`.
- [X] T018 [P] [US2] Testes E2E em tests/e2e/us-nyc-doc.spec.ts (parte US2):
  - Chinatown com 6 itens em "Onde comer" e o aviso "Nenhuma cafeteria no estilo La Cabra neste bairro.";
  - o Nom Wah com o link de mapa exato;
  - abrir "Grand Central Terminal" (31/10) mostra fotos do guia com crédito e os botões do doc.

### Implementation for User Story 2

- [X] T019 [P] [US2] Criar src/components/LinkButtons.tsx (substitui src/components/MapsButton.tsx; atualizar imports):
  - botões "Ver fotos" (`photoUrls`) e "Abrir no mapa" (`mapsUrls`), com o rótulo do link quando houver mais de um;
  - links externos em nova aba;
  - offline, aviso "precisa de internet" + endereço.
- [X] T020 [US2] Atualizar src/components/PlaceCard.tsx:
  - nível ☕ (café coado), 🏆 (ícone da cidade) e 🍰 (doce) com rótulo;
  - preço com a legenda (FR-018: "💵 até USD 20 · 💵💵 USD 20–40 · 💵💵💵 USD 40–80 · 💵💵💵💵 acima de USD 80, por pessoa") em `title`/texto auxiliar;
  - fila;
  - tipo e estilo para lojas;
  - campos rotulados;
  - LinkButtons.
- [X] T021 [US2] Em src/components/AreaSection.tsx, listar os lugares da área em "Lojas", "Onde comer e tomar café" e "Locações no caminho", com PlaceCard compacto, na ordem do doc, e os avisos da lista logo acima dela.
- [X] T022 [US2] Atualizar src/pages/ActivityDetail.tsx:
  - o lugar `attraction` da atividade mostra texto, nota 🎟️ e LinkButtons;
  - mostrar o bairro de origem ("em SoHo") com link de volta para a área no dia;
  - "Como ir"/logística quando houver.

**Checkpoint**: US1 e US2 completas; T017–T018 verdes

---

## Phase 5: User Story 3 - Preparação, partida e doc completo (Priority: P2)

**Goal**: Documento completo, checklist "O que comprar antes", chegada e partida.

**Independent Test**: Documento offline com todas as seções; 8 itens no checklist com Tenement 16h15; 07/11 com a partida.

### Tests for User Story 3

- [X] T023 [P] [US3] Testes E2E em tests/e2e/us-nyc-doc.spec.ts (parte US3):
  - `#/full/nova-york/documento` offline mostra todos os `##` na ordem, sem rolagem horizontal;
  - a tela Viagem lista 8 itens em "Ingressos para comprar antes", com "Tenement Museum, tour das 16h15";
  - `#/destino/orlando/2026-11-07` mostra "Saiam do hotel às 11h00";
  - 31/10 mostra a área "Chegada: JFK → Pod 51".

### Implementation for User Story 3

- [X] T024 [US3] Ajustar src/pages/Trip.tsx:
  - a lista "Ingressos para comprar antes" passa a usar as colunas Data · Atração · Situação, com link para a atividade quando houver;
  - os atalhos dos extras da 004 saem (o doc novo não tem essas seções);
  - entra um atalho para "Dicas práticas" do documento.
- [X] T025 [US3] Verificar src/pages/FullDocument.tsx com o doc novo (títulos com emoji, listas aninhadas, tabela de compras) e ajustar src/styles/base.css onde necessário (listas aninhadas, tabela de 3 colunas no celular).

**Checkpoint**: As 3 histórias funcionam; T023 verde

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T026 [P] Atualizar README.md (seção "Roteiro de Nova York": fonte = exportação do doc; como atualizar, conforme quickstart.md) e adicionar uma nota em specs/004-nyc-itinerary-v2/contracts/document-format.md apontando para a 005.
- [X] T027 Estilos de bairro em src/styles/base.css: cabeçalho do bairro, separação visual entre bairros, linha `free`, listas de lugares compactas, alvos de toque ≥ 44 px.
- [X] T028 Rodar a sequência do CI (`typecheck`, `test`, `content:strict`, `build`, `budget`, `e2e`).
- [X] T029 Revisão visual em 390 px e 1280 px: um dia com vários bairros (01/11), o detalhe de um restaurante e o documento. Corrigir rolagem horizontal, texto cortado e contraste.
- [ ] T030 Commit na branch `005-nyc-itinerary-doc` (com autorização) e revisão lado a lado com o doc pelo casal (SC-007). — **Parcial**: commit feito em 24/10/2026 (branch `007-orlando-itinerary-doc`); falta a revisão do casal

---

## Dependencies & Execution Order

- Setup (T001–T002) → Foundational (T003–T009) → US1 → US2 → US3 → Polish
- T003 → T005 → T008 → T009; T004 → T005; T006, T007 → T009
- US1: T010, T011 em paralelo; T012 → T014 → T013 → T015; T016 depois de T015
- US2: T019 → T020 → T021; T022 depois de T020; T017/T018 em paralelo
- US3: T024, T025 independentes entre si (dependem de T009)

### Parallel Opportunities

- T004, T006, T007
- US1: T010, T011, T013
- US2: T017, T018, T019
- US3: T023 em paralelo com T024/T025
- Polish: T026

---

## Parallel Example: User Story 2

```bash
Task: "Testes de componente em tests/components/area-section.test.tsx"
Task: "E2E de lugares em tests/e2e/us-nyc-doc.spec.ts"
Task: "LinkButtons em src/components/LinkButtons.tsx"
```

---

## Implementation Strategy

1. Setup + Foundational: cópia do doc no lugar, leitor com testes, conteúdo validado (D1–D5)
2. **MVP = US1 + US2** (ambas P1): dia por bairros e os lugares de cada bairro
3. US3: documento, checklist, chegada e partida
4. Polish, revisão do casal e commit

---

## Notes

- Nunca editar a cópia do doc; decisões sobre o conteúdo vão em `meta.json` (`checklistOverrides`).
- T001 e T030 envolvem git: só com autorização do usuário.
