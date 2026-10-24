---

description: "Task list for feature 004 — Roteiro de Nova York v2"
---

# Tasks: Roteiro de Nova York v2 (roteiro do Alisson)

**Input**: Design documents from `/specs/004-nyc-itinerary-v2/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Incluídos (constituição, Princípio II): parser com fixtures e contra o documento real,
componentes e E2E por story com cenário offline.

**Organization**: Tarefas por user story. O documento do casal (texto completo no histórico do
`/speckit-specify` da 004) é a fonte; ele é salvo **sem alterações de conteúdo**.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência pendente)
- **[Story]**: US1–US3 conforme spec.md

## Phase 1: Setup

- [X] T001 Com autorização do usuário, commitar a feature 003 na branch `003-travel-guide-redesign` e criar a branch `004-nyc-itinerary-v2` a partir dela; confirmar `npm run typecheck && npm test && npm run content:strict` verdes — commits feitos em 24/10/2026, na branch `007-orlando-itinerary-doc` (um commit de specs por feature e um de implementação para 003–007)
- [X] T002 [P] Instalar `marked` como devDependency em package.json (só usado em scripts/, nunca importado em src/) e registrar a justificativa na tabela R2 de specs/001-tourist-guide-itineraries/research.md
- [X] T003 [P] Salvar o documento do usuário, exatamente como enviado (títulos, tabelas, links, emojis e escapes `\~` preservados), em content/full/nova-york/roteiro.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**⚠️ CRITICAL**: Nenhuma user story começa antes desta fase

- [X] T004 Estender os tipos em src/content/types.ts conforme data-model.md: `Activity` ganha `how?: string`, `optional?: boolean`, `approx?: boolean`, `inferredDuration?: boolean`, `places?: PlaceRef[]`; novo `Place` (`kind: 'food' | 'shop' | 'screen' | 'attraction'`, `name`, `address?`, `mapsUrls: { label: string; url: string }[]`, `level?`, `fields: { label: string; text: string }[]`, `works?`, `photoTip?`, `access?`, `pointId?`); `FullDay` ganha `summary?` e `places?: Place[]`; `FullItinerary` ganha `source?: { title; author; date }`, `docHtml?: { id; title; html }[]`, `dayNotes?: Record<DateStr, { html: string }>`, `extras?: { mustTry: ExtraPlace[]; shops: ExtraPlace[] }`; `ChecklistItem.deadline` passa a opcional; `ExtraPlace = { area, name, why, price?, mapsUrl }`
- [X] T005 [P] Escrever tests/unit/nyc-doc-parser.test.ts com trechos-fixture do formato de contracts/document-format.md: cabeçalho de dia `## 02/11 (segunda) — …`; tabela `Horário | Programa | Como ir` com `HHhMM–HHhMM`, `HHhMM` sozinho (duração inferida até a próxima linha, `inferredDuration: true`), `\~HHhMM` (`approx: true`) e `19h30–\~22h00`; classificação das linhas (`**Café:**`→breakfast, `**Almoço:**`→lunch, `**Café da tarde:**`→snack, `**Jantar:**`→dinner, `Volta/Ida/Saída/Táxi/Pouso`→transit, `**Descanso no hotel**`→rest, `Opcional:`→optional, Knicks/MJ→commitment); bloco de "Onde comer" com nível e os 5 campos e dois links; item de locação com obras e "Foto:"; bloco de compras; item de atração; notas do dia; seções gerais em HTML; tabelas extras; plano B por dia; tabela de ingressos
- [X] T006 Implementar scripts/nyc-doc-parser.ts: `parseNycDoc(markdown, { pointLinks, commitments })` usando `marked.lexer`, retornando `{ days: FullDay[], docHtml, dayNotes, extras, checklist, alternativesByDate, source }`; IDs `nyv2-AAAA-MM-DD-NN`; ligação linha↔lugares por nome normalizado (refeição: prefixo do nome após o rótulo; demais: nome do lugar contido no Programa); `pointId` via `pointLinks`; o ano das datas vem da viagem (2026)
- [X] T007 [P] Criar content/full/nova-york/point-links.json ligando nomes de lugares do documento a pontos do guia existentes (ex.: "Grand Central Terminal"→`ny-grand-central`, "Top of the Rock"→`ny-top-of-the-rock`, "St. Patrick's Cathedral"→`ny-st-patricks`, "Bryant Park"→`ny-bryant-park`, "New York Public Library"→`ny-public-library`, "Staten Island Ferry"→`ny-staten-island-ferry`, "Oculus"→`ny-oculus`, "Ponte do Brooklyn"→`ny-brooklyn-bridge`, "MoMA"→`ny-moma`, "The Met"→`ny-met`, "Museu de História Natural"→`ny-amnh`, "Central Park"→`ny-central-park`, "High Line"→`ny-high-line`, "Little Island"→`ny-little-island`, "Chelsea Market"→`ny-chelsea-market`, "Washington Square Park"→`ny-washington-square`, "Roosevelt Island Tram"→`ny-roosevelt-tram`, "Empire State Building"→`ny-empire-state`, "Flatiron Building"→`ny-flatiron`, "Times Square"→`ny-times-square`, "Madison Square Garden" sem ponto)
- [X] T008 Atualizar content/full/nova-york/meta.json: `knicks-nets` com `arriveBy: "18:50"`; `mj-musical` com `date: "2026-11-05"` e `arriveBy: "18:30"`; remover `checklist`, `practicalTips` e `excluded` (passam a vir do documento); remover os arquivos content/full/nova-york/2026-10-31.json a 2026-11-06.json
- [X] T009 Ajustar scripts/full-itinerary-schema.ts às regras de specs/004-nyc-itinerary-v2/contracts/validation-rules.md (aceitar ids `nyv2-…`, campos novos; manter F1–F4, F8 ajustada, F9 em 05/11, F10, F11 sem janela, F15 ajustada, F19; remover F5, F6, F7, F12, F13, F14, F16, F17; F18 = checklist do documento) e acrescentar D1–D4 de contracts/document-format.md (comparando com contagens tiradas do próprio Markdown); atualizar tests/content/full-itinerary-rules.test.ts e tests/fixtures/full-itinerary.ts (removendo os casos das regras retiradas e cobrindo as ajustadas)
- [X] T010 Em scripts/build-content.ts, quando existir content/full/<cidade>/roteiro.md, montar o `FullItinerary` com `parseNycDoc` + meta.json + point-links.json (ignorando arquivos de dia JSON) e validar; imprimir "roteiro FULL nova-york: 7 dias, N atividades, 28 refeições, M links do Maps"

**Checkpoint**: `npm run content:strict` passa com o documento real; testes de unidade verdes

---

## Phase 3: User Story 1 - Usar o roteiro novo dia a dia (Priority: P1) 🎯 MVP

**Goal**: Os 7 dias com as linhas, horários e "como ir" do documento, compromissos corretos, marcações
antigas sem efeito, offline.

**Independent Test**: Comparar cada dia no app com a tabela do documento; 02/11 Knicks 18h50/19h30;
05/11 MJ 18h30/19h; progresso de NY zerado.

### Tests for User Story 1

- [X] T011 [P] [US1] Escrever tests/content/nyc-doc-real.test.ts sobre content/full/nova-york/roteiro.md: para cada dia, as linhas do app (`start`, `title`, `how`) batem com as linhas da tabela do documento lidas de forma independente (split simples de linhas `| … |`); 28 refeições; todos os links `google.com/maps` do documento presentes no resultado; todos os `##` do documento representados; MJ em 2026-11-05
- [X] T012 [P] [US1] Testes E2E em tests/e2e/us-nyc-v2.spec.ts (parte US1): `#/destino/nova-york/2026-10-31` com 16 linhas e "Village Halloween Parade" às 18:45; 02/11 com o jogo às 19:30 e a chegada às 18:50; 05/11 com MJ às 19:00 e 04/11 sem MJ; estado com marcas `ny-2026-…` → nenhuma linha marcada e progresso de NY "0 de"; tudo também offline

### Implementation for User Story 1

- [X] T013 [US1] Atualizar src/components/ActivityRow.tsx: mostrar "Como ir" (texto do documento) em linha secundária, selo "Opcional", horário com "~" quando `approx`, ocultar duração quando `inferredDuration`; linhas `transit` do documento (Volta/Ida/Saída/Táxi) usam a variante compacta com o texto do Programa e do "Como ir"
- [X] T014 [US1] Atualizar src/pages/Destination.tsx: resumo do dia (`summary`) no cabeçalho; compromissos vindos do meta (MJ em 05/11); notas do dia (`dayNotes[data].html`) num bloco "Dicas do dia"; plano B do documento (quando houver) no bloco de alternativas; dia 07/11 mostra as orientações de partida
- [X] T015 [US1] Ajustar src/domain/trip-view.ts para expor `how`, `optional`, `approx`, `inferredDuration` e `places` em `DayActivityView`, e `dayNotes`/`summary`/`places` em `TripDayView`; linhas opcionais contam no total do progresso só quando marcadas (não ficam como pendência obrigatória)
- [X] T016 [US1] Atualizar E2E de NY afetados (tests/e2e/us-full-itinerary.spec.ts, tests/e2e/us-travel-guide.spec.ts) para o conteúdo novo (títulos, ids `nyv2-…`, MJ em 05/11), sem mudar o que verificam; e os testes de componente que usam o roteiro real

**Checkpoint**: US1 completa; T011–T012 verdes

---

## Phase 4: User Story 2 - Detalhes de cada lugar como no documento (Priority: P1)

**Goal**: Cada lugar mostra os campos do documento e "Abrir no Google Maps"; fotos do guia quando houver.

**Independent Test**: Keens (02/11), Kith (05/11), prédio de Friends (06/11), Ess-a-Bagel (dois links).

### Tests for User Story 2

- [X] T017 [P] [US2] Testes de componente em tests/components/place-card.test.tsx: lugar de comida mostra nível e os 5 campos na ordem do documento; loja mostra bairro, estilo, faixa de preço, por que vale; locação mostra obras e "Foto: …"; atração mostra acesso; botões "Abrir no Google Maps" com os `href` exatos (dois para o Ess-a-Bagel); offline mostra "O Google Maps precisa de internet. Endereço: …"
- [X] T018 [P] [US2] Testes E2E em tests/e2e/us-nyc-v2.spec.ts (parte US2): abrir a linha do Keens em 02/11 e conferir "Por que é icônico", "O que pedir" e o link do Maps; abrir a linha de Grand Central em 31/10 e ver fotos do guia com crédito

### Implementation for User Story 2

- [X] T019 [P] [US2] Criar src/components/MapsButton.tsx: link externo para a URL do documento (`target="_blank"`, `rel="noopener"`), rótulo "Abrir no Google Maps" (ou o rótulo do link quando houver mais de um, ex.: "770 Third Ave"); offline mostra aviso + endereço (mesmo padrão do DirectionsButton)
- [X] T020 [P] [US2] Criar src/components/PlaceCard.tsx: cabeçalho (nome, nível/emoji, endereço), `fields` na ordem do documento como lista de rótulo + texto, obras e dica de foto (locações), acesso (atrações), avisos do texto que contêm "confiram"/"vejam no Maps" destacados, MapsButton(s)
- [X] T021 [US2] Atualizar src/pages/ActivityDetail.tsx: blocos "Lugares desta atividade" com PlaceCard para cada `places`; fotos do guia quando houver `pointId`; "Como ir" no bloco de logística; manter Feito/Pendente
- [X] T022 [US2] Em src/pages/Destination.tsx, seções do dia na ordem do documento — "Onde comer", "Locações de filmes e séries", "Compras do dia", "Atrações do dia" — listando todos os `places` do dia (inclusive os não ligados a linhas) com PlaceCard compacto e link para a linha quando houver

**Checkpoint**: US1 e US2 completas; T017–T018 verdes

---

## Phase 5: User Story 3 - Preparação, extras e imprevistos (Priority: P2)

**Goal**: Documento completo no app, extras, partida, checklist.

**Independent Test**: Percorrer o documento no app e conferir todas as seções; 07/11 com partida.

### Tests for User Story 3

- [X] T023 [P] [US3] Testes E2E em tests/e2e/us-nyc-v2.spec.ts (parte US3): offline `#/full/nova-york/documento` mostra, na ordem, os títulos de todas as seções `##` do documento, a tabela de comida com 28 linhas e "Fontes consultadas" com links; em 390 px, sem rolagem horizontal da página (tabelas roláveis dentro do próprio bloco); `#/destino/orlando/2026-11-07` mostra "voo às 14h00 do LaGuardia"

### Implementation for User Story 3

- [X] T024 [US3] Reescrever src/pages/FullDocument.tsx para renderizar `docHtml` em ordem (HTML gerado no build a partir do conteúdo próprio do app), com índice das seções, botão "Imprimir / salvar PDF" e links externos abrindo em nova aba; manter o comportamento atual para cidades sem `docHtml`
- [X] T025 [US3] Em src/styles/base.css, estilos do documento: tabelas com `overflow-x: auto` no contêiner, cabeçalhos editoriais, listas de tarefas (`[x]`) legíveis, impressão com quebra por dia
- [X] T026 [US3] Em src/pages/Trip.tsx e src/pages/Destination.tsx (NY), atalhos para "Não saia de NY sem provar" e "Brechós extras" (âncoras no documento) e o checklist de ingressos a partir de `checklist`

**Checkpoint**: As 3 histórias funcionam; T023 verde

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T027 [P] Atualizar README.md (seção "Roteiro FULL de Nova York": a fonte agora é `roteiro.md`; como editar e validar) e specs/002-nyc-full-itinerary/contracts/full-itinerary-content.md com nota apontando para a 004
- [X] T028 Rodar a sequência do CI (`typecheck`, `test`, `content:strict`, `build`, `budget`, `e2e`)
- [X] T029 Revisão visual (390 px e 1280 px) de um dia, de um detalhe de restaurante e do documento; corrigir problemas de leitura
- [ ] T030 Commit na branch `004-nyc-itinerary-v2` (com autorização) e revisão lado a lado pelo casal (SC-006) — **Parcial**: commit feito em 24/10/2026 (branch `007-orlando-itinerary-doc`); falta a revisão do casal

---

## Dependencies & Execution Order

- Setup (T001–T003) → Foundational (T004–T010) → US1 → US2 → US3 → Polish
- T004 → T006 → T009 → T010; T005 → T006; T003, T007, T008 → T010
- US1: T011/T012 em paralelo; T015 → T013 → T014; T016 depois de T014
- US2: T019, T020 em paralelo → T021, T022
- US3: T024 → T025; T026 depois de T022 e T024

### Parallel Opportunities

- T002, T003; T005, T007
- US1: T011, T012
- US2: T017, T018, T019, T020
- US3: T023 em paralelo com T024

---

## Parallel Example: User Story 2

```bash
Task: "Testes de PlaceCard em tests/components/place-card.test.tsx"
Task: "MapsButton em src/components/MapsButton.tsx"
Task: "PlaceCard em src/components/PlaceCard.tsx"
```

---

## Implementation Strategy

1. Setup + Foundational: documento salvo, parser com testes, conteúdo validado
2. **MVP = US1 + US2** (ambas P1): agenda nova e detalhes dos lugares com Maps
3. US3: documento completo, extras e partida
4. Polish, revisão do casal e commit

---

## Notes

- Nunca reescrever o conteúdo do documento; só formatação para a tela (FR-003).
- T001 e T030 envolvem git: só com autorização do usuário.
