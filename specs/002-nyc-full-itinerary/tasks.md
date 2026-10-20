---

description: "Task list for feature 002 — Roteiro FULL de Nova York"
---

# Tasks: Roteiro FULL de Nova York

**Input**: Design documents from `/specs/002-nyc-full-itinerary/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Incluídos — a constituição (Princípio II) exige testes por user story, testes de domínio e
armazenamento, e teste sem rede para cada fluxo offline.

**Organization**: Tarefas por user story. Prazo: instalado até 30/10/2026. A base de código é a da
feature 001 (branch `002-nyc-full-itinerary`).

**Ajuste de estrutura em relação ao plan.md**: o conteúdo fica em uma pasta, um arquivo por dia,
para que os 7 dias possam ser escritos em paralelo sem conflito:
`content/full/nova-york/meta.json` (base, chegada, compromissos, checklist, orientações, exclusões)
e `content/full/nova-york/<AAAA-MM-DD>.json` (um `FullDay` cada). O build junta tudo em um único
`FullItinerary` (continua sendo uma fonte só para app e documento, FR-025a).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência pendente)
- **[Story]**: US1–US4 conforme spec.md

## Phase 1: Setup

- [X] T001 Criar content/full/nova-york/meta.json com `id: "nova-york"`, `cityId: "nova-york"`, `title: "Roteiro FULL de Nova York"`, `travelers: "Casal"`, `base` = { name "POD 51", address "230 East 51st Street, New York, NY 10022", location }, `arrival` = { airport "JFK", date "2026-10-31", time "06:30" }, `commitments` = [ { id "knicks-nets", date "2026-11-02", time "19:30", arriveBy "18:45" (≤ time − 30 min), title "New York Knicks x Brooklyn Nets", place Madison Square Garden, "4 Penn Plaza, New York, NY 10001" }, { id "mj-musical", date "2026-11-04", time "19:00", arriveBy "18:15", title "MJ The Musical", place Neil Simon Theatre, "250 West 52nd Street, New York, NY 10019" } ], e `checklist`, `practicalTips`, `excluded` vazios

---

## Phase 2: Foundational (Blocking Prerequisites)

**⚠️ CRITICAL**: Nenhuma user story começa antes desta fase

- [X] T002 Adicionar em src/content/types.ts os tipos de data-model.md: `FullItinerary`, `Place` ({ name, address, location? }), `Commitment`, `FullDay` ({ date, region, goal, events: string[], activities, returnToHotel, alternatives }), `Activity` (type `'attraction' | 'meal' | 'shopping' | 'screen' | 'transit' | 'rest' | 'commitment' | 'hotel'`, priority `'essential' | 'important' | 'optional'`, `start` HH:MM, `durationMin` > 0, `booking` { required, how?, price? }, `facts`, `pointId?`, `meal?`, `shop?`, `screen?`, `transit?`, `earlyReason?`, `commitmentId?`), `Fact` (`{ text, status: 'confirmed', source, checkedAt }` | `{ text, status: 'unconfirmed', note }`), `Meal` (kind `'breakfast' | 'lunch' | 'snack' | 'dinner'`, order, why, priceRange), `Shop` (kind `'thrift' | 'vintage' | 'independent' | 'designer' | 'tech'`, why, justification?), `ScreenLocation` (work, kind `'setting' | 'filming' | 'both'`, access `'inside' | 'outside'`, association, address), `Transit` (mode `'walk' | 'subway' | 'bus' | 'taxi' | 'airtrain' | 'ferry'`, from, to, minutes, lines?, cost?), `Alternative` (when `'rain' | 'tired' | 'closed'`, text), `ChecklistItem` ({ what, forDate, deadline, link?, activityId? }); e `fullItineraries: FullItinerary[]` em `Content`
- [X] T003 [P] Em src/storage/types.ts, `UserState` passa a `schemaVersion: 2` com `activityMarks: Record<string, { state: 'done' | 'skipped'; at: string }>`; manter o tipo v1 para a migração
- [X] T004 Criar scripts/full-itinerary-schema.ts: schema Zod espelhando T002 e função `validateFullItinerary(it, { strict, pointIds })` implementando as regras F1–F19 de contracts/full-itinerary-content.md; sempre: F1, F4, F5, F6, F12, F14, F16, F19; só no strict: F2, F3, F7, F8, F9, F10, F11, F13, F15, F17, F18. Mensagens com data e id da atividade. Termos proibidos (F12, sem diferenciar maiúsculas/acentos): ostra, oyster, frutos do mar, seafood, lobster, lagosta, camarão, shrimp, steakhouse, "B&H", Tiffany
- [X] T005 [P] Escrever tests/content/full-itinerary-rules.test.ts: para cada regra F1–F19, uma fixture mínima inválida que falha com a mensagem esperada, e uma fixture completa válida (7 dias) que passa no strict; casos de borda: atividade que termina exatamente no início da próxima (válido), compromisso com chegada 29 min antes (inválido), almoço às 11:59 (inválido), "Apple Store" sem justificativa (inválido)
- [X] T006 Em scripts/content-schema.ts, trocar a regra de 19 roteiros sugeridos por: no strict, cada dia de passeio coberto por um roteiro sugerido **ou** por um dia de `fullItineraries`, nunca os dois; atualizar tests/content/content-rules.test.ts (regras 5 e 6 e o teste do conteúdo real)
- [X] T007 Em scripts/build-content.ts, ler content/full/<cidade>/meta.json + arquivos `AAAA-MM-DD.json`, montar `fullItineraries` (dias em ordem de data), validar com T004 (passando `strict` e os ids de pontos) e incluir no `public/data/content.json`; imprimir "roteiro FULL: N dias, M atividades"
- [X] T008 Remover de content/itineraries.json os 7 roteiros sugeridos de Nova York (sug-2026-10-31 a sug-2026-11-06) (FR-028) e ajustar tests/e2e/us3-itineraries.spec.ts (12 sugeridos; cabeçalhos começam em domingo, 08/11)
- [X] T009 [P] Escrever tests/unit/user-store-migration.test.ts: estado v1 válido (com favoritos e roteiros) carrega como v2 com `activityMarks: {}` sem perder nada; `schemaVersion` 3 ou desconhecido → tratado como corrompido; estado v2 carrega igual
- [X] T010 Implementar a migração v1 → v2 em src/storage/user-store.ts (`emptyState()` passa a v2; `loadState` migra v1; a migração é gravada na próxima escrita) conforme contracts/user-storage-v2.md; atualizar tests/unit/user-store.test.ts e fixtures que usam `schemaVersion: 1`
- [X] T011 [P] Escrever tests/unit/full-itinerary.test.ts: `markActivity`/`unmarkActivity` (sem marca → done/skipped; done ↔ skipped; desfazer); `nextActivity(day, marks, now)` = primeira sem marca cujo fim ≥ agora no dia atual em America/New_York, senão a primeira sem marca, e `null` em outro dia; `leaveBy(day, commitment)` = início da `transit` que chega ao compromisso; `dayProgress` (feitas, puladas, total sem `transit`); `endTime(activity)`
- [X] T012 Implementar src/domain/full-itinerary.ts com as funções de T011 (puras, sobre `FullDay` e `UserState`)
- [X] T013 Criar tests/fixtures/full-itinerary.ts: `FullItinerary` mínimo válido no strict (7 dias, compromissos, 4 refeições por dia, alternativas, checklist) para os testes de componente e de regras
- [X] T014 Registrar em src/app.tsx as rotas `#/full/nova-york`, `#/full/nova-york/documento` (antes da rota com `:date`) e `#/full/nova-york/:date`, com `key` por data, apontando para páginas vazias src/pages/FullOverview.tsx, src/pages/FullDocument.tsx e src/pages/FullDay.tsx

**Checkpoint**: `npm run typecheck && npm test && npm run content` passam; rotas abrem vazias

---

## Phase 3: User Story 1 - Seguir a agenda do dia (Priority: P1) 🎯 MVP

**Goal**: Agenda hora a hora dos 7 dias, compromissos protegidos, deslocamentos, retorno ao hotel,
marcação feita/pulada e próxima atividade, offline.

**Independent Test**: Abrir 02/11 e conferir agenda sem sobreposição até o jogo, com deslocamento
ao Madison Square Garden e chegada antes das 19h30; marcar atividades offline e recarregar.

### Tests for User Story 1

- [X] T015 [P] [US1] Testes de componente em tests/components/full-day.test.tsx com a fixture T013: cabeçalho (data, região, objetivo, eventos), atividades em ordem com horário, duração, prioridade ("Essencial/Importante/Opcional"), endereço e descrição; linha de deslocamento entre locais; compromisso com "Ingresso comprado · chegar até {arriveBy} · sair da atividade anterior até {hh:mm}"; destaque "Agora / a seguir" com relógio falso; botões Feita/Pulada/Desfazer gravando no store; retorno ao hotel; navegação dia anterior/seguinte
- [X] T016 [P] [US1] Testes E2E em tests/e2e/us-full-itinerary.spec.ts (parte US1): relógio 2026-11-02 15:00 NY → `#/full/nova-york/2026-11-02` mostra o jogo às 19h30 destacado; 31/10 começa no JFK e leva ao POD 51; offline marcar uma feita e uma pulada → recarregar → marcas mantidas e "a seguir" avança; desfazer; `#/roteiros` mostra os dias de NY como roteiro FULL e Orlando/Miami inalterados

### Implementation for User Story 1

- [X] T017 [P] [US1] Criar src/components/InfoSource.tsx: para `Fact` confirmado, "Fonte: {domínio} · verificado em {dd/mm}" com link; para não confirmado, "Não confirmado: {nota}" com estilo de aviso
- [X] T018 [P] [US1] Criar src/components/ActivityCard.tsx: horário–fim, duração, título, selo de prioridade, endereço (com DirectionsButton quando houver `location`), descrição, ingresso/reserva ("Precisa de ingresso/reserva: {how} · {price}"), lista de `facts` com InfoSource, link "Ver no guia" se `pointId`, estado de marcação e botões Feita/Pulada/Desfazer (usando `useUserState` e T012; erro de quota com a mensagem padrão); variante compacta para `transit` ("🚶/🚇/🚕 {mode} · {minutes} min · {lines} · {cost}"); variante destacada para `commitment`
- [X] T019 [US1] Implementar src/pages/FullDay.tsx (`#/full/nova-york/:date`): cabeçalho com data (formatDayLabel), região, objetivo e eventos da data; linha do tempo com ActivityCard; compromisso com `arriveBy` e `leaveBy`; destaque da próxima (T012) com rolagem até ela ao abrir o dia atual; alternância Lista/Mapa (PointMap com marcadores numerados das atividades com `location`); "Volta ao hotel" com `returnToHotel`; links dia anterior/seguinte; data inválida → "Dia não encontrado"
- [X] T020 [US1] Implementar src/pages/FullOverview.tsx (`#/full/nova-york`): cartões por dia (data, região, objetivo, compromisso do dia se houver, progresso "X de Y feitas"), botão "Hoje" quando a data atual (NY) está no período, os 2 compromissos fixos e link para o documento
- [X] T021 [US1] Em src/pages/Itineraries.tsx, mostrar para 31/10–06/11 um cartão "Roteiro FULL · {região}" levando a `#/full/nova-york/{data}` dentro do grupo do dia; e em src/pages/Home.tsx, quando a cidade for Nova York e a data atual estiver no roteiro FULL, um atalho "Roteiro de hoje"
- [X] T022 [P] [US1] Escrever content/full/nova-york/2026-10-31.json (sábado): JFK às 06:30 → imigração/bagagem (margem para atraso, F10) → `transit` táxi tarifa fixa (alternativa AirTrain + metrô nas `facts`/descrição, valores de research.md R7) → POD 51 guardar malas/check-in (horário de check-in verificado) → descanso → passeio em Midtown a partir de ~11h com as 4 refeições → noite opcional na Village Halloween Parade (19h, 6th Ave de Canal St à 15th St; impacto no trânsito) → retorno ao hotel; `events` com Halloween; ≥ 1 alternativa de chuva e de cansaço; cortes recomendados se o voo atrasar
- [X] T023 [P] [US1] Escrever content/full/nova-york/2026-11-01.json (domingo, Maratona de NY e fim do horário de verão): evitar 1st Ave, 5th Ave e Central Park até a tarde (interdições ~7h–17h); região sugerida Lower Manhattan / Lower East Side / Brooklyn; transporte considerando a maratona; `events` com maratona e mudança de horário; 4 refeições, compras, locais de séries no trajeto, alternativas
- [X] T024 [P] [US1] Escrever content/full/nova-york/2026-11-02.json (segunda): dia que termina no jogo Knicks x Nets (Madison Square Garden, 19h30); atividade `commitment` com `start` ≤ 18:45 e `transit` até a arena com `leaveBy`; parada no hotel para descanso se conveniente; jantar antes do jogo perto do MSG (sem steakhouse); retorno ao hotel após o jogo (~22h30)
- [X] T025 [P] [US1] Escrever content/full/nova-york/2026-11-03.json (terça): região a escolher pela eficiência geográfica considerando as atrações e bairros ainda não cobertos; 4 refeições, compras, séries, alternativas
- [X] T026 [P] [US1] Escrever content/full/nova-york/2026-11-04.json (quarta): dia que termina em *MJ The Musical* (Neil Simon Theatre, 250 W 52nd St, 19h); `commitment` com `start` ≤ 18:15; nenhum outro espetáculo (F9); jantar cedo ou lanche reforçado perto do teatro; o teatro fica a ~20 min a pé do hotel — usar isso no retorno
- [X] T027 [P] [US1] Escrever content/full/nova-york/2026-11-05.json (quinta): região a escolher (ex.: Brooklyn, Harlem ou Upper West Side), integrando referências gastronômicas e de séries da região; 4 refeições, compras, alternativas; Coney Island só como opcional e com status "não confirmado" para os brinquedos (research.md R6)
- [X] T028 [P] [US1] Escrever content/full/nova-york/2026-11-06.json (sexta, último dia): região restante, compras finais, organização para a viagem a Orlando em 07/11 (lembrete nas `events`/descrição), 4 refeições, alternativas
- [X] T029 [US1] Revisar os 7 dias em conjunto: sem repetir atrações/restaurantes, cobertura equilibrada de Manhattan e Brooklyn (e outros bairros se valer a pena), referências gastronômicas da spec distribuídas (Katz's, Joe's, Lombardi's, Russ & Daughters, Prince Street, Nathan's, Junior's, Tom's, Sylvia's, Levain, Shake Shack — não obrigatórias), lojas de SoHo/NoLita/LES presentes; rodar `npm run content:strict` até passar — 7 dias, 207 atividades; `content:strict` passa. Fette Sau (fechado) substituído; 36 informações confirmadas com fonte e 18 marcadas como "não confirmado".

**Checkpoint**: US1 completa; T015–T016 verdes; agenda dos 7 dias navegável offline

---

## Phase 4: User Story 2 - Comer e comprar bem no caminho (Priority: P2)

**Goal**: Refeições e lojas exibidas com o que pedir, por que ir, faixa de preço e tipo de loja.

**Independent Test**: Revisar as refeições e lojas dos 7 dias: 4 refeições por dia, nenhuma
violação de restrição (garantido também pela regra F12 no build), lojas com tipo e endereço.

### Tests for User Story 2

- [X] T030 [P] [US2] Testes de componente em tests/components/full-meals-shops.test.tsx: refeição mostra tipo ("Café da manhã/Almoço/Lanche/Jantar"), "O que pedir", "Por que vale a pena" e faixa de preço; loja mostra tipo ("Brechó/Vintage/Independente/Designer local/Tecnologia"), motivo e justificativa quando houver; seção "Onde comer hoje" lista as 4 refeições do dia

### Implementation for User Story 2

- [X] T031 [US2] Em src/components/ActivityCard.tsx, renderizar os blocos `meal` e `shop` (rótulos de T030)
- [X] T032 [US2] Em src/pages/FullDay.tsx, adicionar o resumo "Onde comer hoje" (4 refeições com horário e link para a atividade) e "Compras no caminho" (lojas do dia)

**Checkpoint**: US1 e US2 funcionam; T030 verde

---

## Phase 5: User Story 3 - Visitar locais de séries e filmes (Priority: P3)

**Goal**: Locais de séries com obra, endereço, associação, tipo e acesso, integrados aos bairros.

**Independent Test**: Cada local de série mostra "{obra} · {Ambientação | Locação de filmagem} ·
{Dá para entrar | Só por fora}", endereço e associação.

### Tests for User Story 3

- [X] T033 [P] [US3] Testes de componente em tests/components/full-screen.test.tsx: rótulos de tipo e acesso, endereço, associação; atividade com várias obras lista todas; *Todo Mundo Odeia o Chris* aparece como "Ambientação" com a nota sobre onde foi gravada

### Implementation for User Story 3

- [X] T034 [US3] Em src/components/ActivityCard.tsx, renderizar `screen` (lista de ScreenLocation com os rótulos de T033)
- [X] T035 [US3] Verificar com fonte, nos 7 arquivos de dia, cada ScreenLocation (endereço real, ambientação vs locação, acesso); para *Todo Mundo Odeia o Chris*, pesquisar onde a série foi gravada e registrar na `association` sem apresentar endereço de filmagem não comprovado (FR-020); rodar `npm run content:strict`

**Checkpoint**: US1–US3 funcionam; T033 verde

---

## Phase 6: User Story 4 - Planos B, checklist e documento (Priority: P4)

**Goal**: Alternativas por dia, checklist de ingressos e reservas, orientações, exclusões e o
documento completo imprimível.

**Independent Test**: Todo dia tem alternativa de chuva e de cansaço/fechamento; o checklist tem
todos os itens com reserva; o documento offline mostra tudo e chama a impressão.

### Tests for User Story 4

- [X] T036 [P] [US4] Testes de componente em tests/components/full-document.test.tsx: documento renderiza capa (viagem, hotel, compromissos), os 7 dias completos, checklist (com data-limite), endereços por dia, orientações práticas e "Atrações não incluídas" com motivo; botão "Imprimir / salvar PDF" chama `window.print`
- [X] T037 [P] [US4] Testes E2E em tests/e2e/us-full-itinerary.spec.ts (parte US4): offline → `#/full/nova-york/documento` contém os 7 cabeçalhos de dia e o checklist; emulação de mídia `print` esconde a barra inferior e os botões

### Implementation for User Story 4

- [X] T038 [US4] Preencher em content/full/nova-york/meta.json: `checklist` (todo `booking.required` dos 7 dias + itens gerais como seguro-viagem e cartão por aproximação, com `deadline` e link), `practicalTips` (transporte/OMNY com teto semanal, táxi do JFK, pagamento e gorjeta, segurança, clima de novembro, horário de verão), `excluded` (ex.: Coney Island brinquedos, B&H, Tiffany, outro espetáculo em 04/11, atrações sem tempo útil, com motivo); `npm run content:strict` (F18)
- [X] T039 [US4] Em src/pages/FullDay.tsx, seção "Se chover / se cansar / se estiver fechado" com as alternativas do dia
- [X] T040 [US4] Implementar src/pages/FullDocument.tsx (`#/full/nova-york/documento`): capa, índice dos dias, cada dia completo (reutilizando ActivityCard em modo somente leitura, sem botões de marcação), checklist, endereços por dia (gerados das atividades com `place`), orientações, exclusões, botão "Imprimir / salvar PDF"
- [X] T041 [US4] Em src/styles/base.css, `@media print`: esconder `.bottom-nav`, banners e botões; cada dia com `break-before: page`; links com URL por extenso (`a[href^="http"]::after`); fundo branco e tipografia legível

**Checkpoint**: As 4 stories funcionam; T036–T037 verdes

---

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T042 [P] Atualizar a documentação da 001 afetada: specs/001-tourist-guide-itineraries/contracts/content-schema.md (regra 5 nova) e quickstart.md (12 sugeridos + roteiro FULL de NY)
- [X] T043 [P] Atualizar README.md: seção "Roteiro FULL" (onde editar, como validar, como imprimir)
- [X] T044 Rodar a sequência do CI (`typecheck`, `test`, `content:strict`, `build`, `budget`, `e2e`) e conferir o orçamento (JS inicial < 100 KB gzip, conteúdo ≤ 40 MB)
- [ ] T045 Revisão visual no celular (Pixel 7 no Playwright e, se possível, aparelho real): agenda, documento e PDF (cada dia em página nova) — **Parcial**: revisão no Pixel 7 (Playwright) feita; falta aparelho real e PDF.
- [ ] T046 Commit na branch `002-nyc-full-itinerary` e, quando houver remote (001 T063), PR com CI verde — **Parcial**: commit local feito; PR depende do remote (001 T063).
- [ ] T047 Revisão do casal (28–29/10) seguindo "Revisão do casal" em specs/002-nyc-full-itinerary/quickstart.md; aplicar correções em content/full/nova-york/ e revalidar
- [ ] T048 Validação final no celular (30/10) seguindo "Validação manual" em specs/002-nyc-full-itinerary/quickstart.md, junto com a 001 T066

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)** → **Foundational (Phase 2)** → US1 → US2/US3/US4 → Polish
- US2, US3 e US4 dependem do ActivityCard e da FullDay de US1 (T018, T019) e do conteúdo dos dias
  (T022–T028); entre si são independentes, exceto que T031, T034 alteram o mesmo arquivo
  (ActivityCard) e T032, T039 alteram FullDay → executar em sequência

### Dependências internas relevantes

- T002 → T004 → T005, T007; T002 → T012, T013
- T003 → T009/T010; T010 → T011/T012 (marcações usam v2)
- T006 depende de T007 (ids e dias do FULL) e de T008
- T017, T018 → T019 → T020, T021
- T022–T028 → T029 → T035, T038
- T040 depende de T031, T034, T039 (reutiliza os blocos)

### Parallel Opportunities

- Phase 2: T003, T005, T009, T011 em paralelo
- US1: T015, T016, T017, T018 em paralelo; **os 7 dias de conteúdo (T022–T028) em paralelo**,
  inclusive enquanto as telas são construídas
- US2/US3/US4: os testes T030, T033, T036, T037 em paralelo
- Polish: T042, T043

---

## Parallel Example: User Story 1

```bash
# Conteúdo dos 7 dias em paralelo (arquivos separados):
Task: "Escrever content/full/nova-york/2026-10-31.json"
Task: "Escrever content/full/nova-york/2026-11-01.json"
…
Task: "Escrever content/full/nova-york/2026-11-06.json"

# Componentes e testes em paralelo:
Task: "InfoSource em src/components/InfoSource.tsx"
Task: "ActivityCard em src/components/ActivityCard.tsx"
Task: "Testes de componente em tests/components/full-day.test.tsx"
```

---

## Implementation Strategy

1. Phase 1 + 2 (20–21/10): tipos, regras F1–F19, migração v2, rotas
2. US1 (21–24/10): telas da agenda e o conteúdo dos 7 dias (o maior esforço: pesquisa com fontes)
3. US2, US3, US4 (24–25/10): blocos de refeição, loja, série, alternativas, checklist e documento
4. Polish (26–27/10), revisão do casal (28–29/10), validação no celular (30/10)

**MVP**: US1 — com ela o casal já tem a agenda completa no celular, porque o conteúdo de cada dia
inclui refeições, lojas e séries desde T022–T028; US2–US4 melhoram a apresentação e fecham o
documento.

---

## Notes

- Todo horário, preço ou funcionamento citado precisa de `Fact` com fonte e data, ou "não
  confirmado" (FR-021/F16). Nunca inventar.
- T046 envolve commit/push: confirmar com o usuário antes do push e do PR.
- [P] = arquivos diferentes, sem dependência pendente.
