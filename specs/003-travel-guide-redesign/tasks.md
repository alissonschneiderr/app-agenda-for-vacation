---

description: "Task list for feature 003 — Redesign da UI como guia de viagem"
---

# Tasks: Redesign da UI como guia de viagem

**Input**: Design documents from `/specs/003-travel-guide-redesign/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Incluídos (constituição, Princípio II): unidade para o domínio novo, componente para as
telas novas, E2E por user story com cenário offline; os testes existentes das features 001/002 são
ajustados só em seletores/textos (SC-007).

**Organization**: Tarefas por user story. Base: branch `003-travel-guide-redesign` criada a partir
da `002-nyc-full-itinerary`. Prazo: instalado até 30/10/2026.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência pendente)
- **[Story]**: US1–US4 conforme spec.md

## Phase 1: Setup

- [X] T001 Criar a branch `003-travel-guide-redesign` a partir de `002-nyc-full-itinerary` (após commit dos documentos da 003; requer autorização do usuário) e confirmar que `npm run typecheck && npm test && npm run content:strict` passam antes de qualquer mudança — Branch criada localmente; commits aguardam autorização (T037).
- [X] T002 [P] Adicionar `heroPointId` em content/trip.json (`nova-york`: `ny-central-park`, `orlando`: `orl-magic-kingdom`, `miami`: `mia-south-beach`), o campo `heroPointId: string` em `City` em src/content/types.ts e em tests/fixtures/content.ts
- [X] T003 Em scripts/content-schema.ts, exigir `heroPointId` no schema da cidade e validar "ponto existente, da mesma cidade, com ≥ 1 foto" (strict); acrescentar casos em tests/content/content-rules.test.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Visão unificada por destino/dia, chaves de conclusão, toggle, progresso, tokens visuais
e rotas — usados por todas as histórias.

**⚠️ CRITICAL**: Nenhuma user story começa antes desta fase

- [X] T004 [P] Escrever tests/unit/trip-view.test.ts com as fixtures de tests/fixtures/content.ts e tests/fixtures/full-itinerary.ts: `destinationView` de cada cidade (período = trecho da viagem, `hero` = foto do `heroPointId`, dias incluindo os de locomoção de chegada/saída, "Dia N de M"); `dayView` combinando o dia FULL e os roteiros do usuário da mesma data (FULL primeiro, depois roteiros por `createdAt`); `DayActivityView` de FULL (`key` = id, categoria, horário, foto via `pointId`, `trackable: false` para `transit`) e de item de roteiro (`key` = `it:<itineraryId>:<pointId>`, sem horário, foto do ponto, `unavailable` se o ponto sumiu); `progress` por dia/cidade/viagem com `done`, `skipped` (conta no total, não em done) e deslocamentos excluídos
- [X] T005 Implementar src/domain/trip-view.ts conforme data-model.md: tipos `DestinationView`, `TripDayView`, `DayActivityView`, `Category`; funções `destinationView(content, state, cityId)`, `dayView(content, state, date)`, `allTripDays(content)`, `adjacentDay(content, date, ±1)` (atravessa cidades), `progress*`, `activityKeyForItem(itineraryId, pointId)`, `findActivity(content, state, date, key)`, `nextPendingActivity(content, state, now)` (fuso America/New_York)
- [X] T006 [P] Escrever testes em tests/unit/full-itinerary.test.ts para `toggleDone`: "ausente → done; skipped → done; done → ausente" e em tests/unit/itineraries.test.ts para a limpeza: "removePoint remove `it:<id>:<pointId>`; deleteItinerary remove todas as `it:<id>:*`"
- [X] T007 Implementar `toggleDone(state, key, now)` em src/domain/full-itinerary.ts e a limpeza de marcas em `removePoint` e `deleteItinerary` de src/domain/itineraries.ts (as funções passam a receber/retornar `UserState` completo como hoje; manter as assinaturas usadas pelas telas existentes)
- [X] T008 [P] Criar src/components/Icon.tsx com ícones SVG inline (traço 1.75, 24 px, `aria-hidden` por padrão): check, circle, clock, pin, walk, subway, taxi, ferry, food, bag, film, ticket, bed, star, map, calendar, plane, chevron-left, chevron-right, camera, info, external
- [X] T009 Atualizar src/styles/base.css com os tokens editoriais de research.md R5 (paleta clara/escura, `--font-serif: ui-serif, "New York", Georgia, serif`, `--font-sans: system-ui, …`, escala 14/16/18/22/28/36, raio 14 px, sombra sutil), `@media (prefers-reduced-motion: reduce)` zerando transições, e layout base mobile-first com breakpoint `min-width: 1024px`; conferir contraste AA dos pares texto/fundo e destaque/fundo (claro e escuro) e registrar os valores no comentário do arquivo — Contraste medido e registrado no topo de base.css; véu da foto ajustado para 55% (45% não passava AA em texto pequeno).
- [X] T010 Em src/app.tsx, adicionar as rotas de contracts/routes.md: `#/` → `Trip`, `#/destino/:cityId`, `#/destino/:cityId/:date`, `#/destino/:cityId/:date/:key` (chave via `decodeURIComponent`), `#/guia` → tela do guia atual (Home); manter `#/cidade/:cityId` e as demais; redirecionar `#/full/nova-york` e `#/full/nova-york/:date` com `location.replace` para `#/destino/nova-york[/:date]`; criar páginas vazias src/pages/Trip.tsx, src/pages/Destination.tsx, src/pages/ActivityDetail.tsx

**Checkpoint**: `npm run typecheck && npm test` passam; rotas novas abrem vazias; rotas antigas funcionam/redirecionam

---

## Phase 3: User Story 1 - Navegar pelos destinos e pelos dias (Priority: P1) 🎯 MVP

**Goal**: Viagem → Destino → Dia, com hero, período, resumo, dias, timeline (NY) e lista (Orlando/
Miami), navegação entre dias atravessando cidades e atalho para hoje.

**Independent Test**: Abrir os três destinos; abrir 02/11 (NY, com horários) e 09/11 (Orlando, sem
horários); "Próximo dia" no último dia de NY leva a 07/11 (locomoção).

### Tests for User Story 1

- [X] T011 [P] [US1] Testes de componente em tests/components/destination.test.tsx: página do destino mostra hero (alt da foto do ponto), nome, período "31/10 a 06/11" (NY) / "07/11 a 18/11" (Orlando), resumo (nº de dias, atividades, compromissos), lista de dias com "Hoje" no dia atual; dia de NY mostra timeline com horários e duração; dia de Orlando mostra lista sem horários; dia de locomoção mostra "Dia de locomoção Nova York → Orlando"; "Próximo dia" no último dia da cidade aponta para o dia seguinte da viagem
- [X] T012 [P] [US1] Testes E2E em tests/e2e/us-travel-guide.spec.ts (parte US1): `#/` → tocar "Orlando" na navegação → página com "07/11 a 18/11"; `#/destino/nova-york/2026-11-02` mostra o jogo às 19:30; `#/destino/orlando/2026-11-09` sem horários; navegar do 06/11 para 07/11 por "Próximo dia"; `#/full/nova-york/2026-11-02` redireciona; tudo também com `setOffline(true)` após instalado

### Implementation for User Story 1

- [X] T013 [P] [US1] Criar src/components/DayNav.tsx: lista de dias do destino (data curta, dia da semana, "x/y" de progresso, rótulo "Hoje", ícone de locomoção), item ativo com `aria-current="page"`; no celular, faixa rolável de chips (toque ≥ 44 px, sem rolagem horizontal da página — só da faixa); no desktop, coluna lateral
- [X] T014 [P] [US1] Criar src/components/ActivityRow.tsx conforme contracts/ui-components.md (horário + duração quando houver, miniatura 4:3 do ponto ou ícone da categoria, título, rótulo/ícone de categoria, local em uma linha, selos "Ingresso comprado"/"Reserva necessária"/"Indisponível", área clicável que leva a `#/destino/:city/:date/:key`, espaço reservado à direita para o DoneToggle de US2) e a variante compacta de deslocamento (ícone, meio, minutos, linhas, sem toggle)
- [X] T015 [US1] Implementar src/pages/Destination.tsx: hero (foto `heroPointId` 16:9, véu sólido 45% para contraste, crédito), nome, período, resumo, DayNav, e o dia selecionado (padrão: hoje se estiver no período, senão o primeiro dia) com cabeçalho (data, dia da semana, "Dia N de M", cidade/locomoção, eventos da data), grupos de atividades (título do grupo: "Roteiro FULL" ou nome do roteiro; `notes` do sugerido), timeline com agrupamento Manhã/Tarde/Noite quando `hasTimes`, lista ordenada sem horários caso contrário, estado vazio "Sem atividades planejadas" com link para o guia da cidade, e botões "Dia anterior"/"Próximo dia" via `adjacentDay`; layout ≥ 1024 px em grid `280px 1fr`
- [X] T016 [US1] Implementar src/pages/Trip.tsx (`#/`): título da viagem e período total, bloco "Hoje" (durante a viagem: cidade/locomoção do dia e próxima atividade pendente com link; antes: contagem de dias para o embarque; depois: resumo), três cartões de destino (foto, nome, período, nº de dias), compromissos com ingresso, e links para Guia, Favoritos, Meus roteiros e Documento do roteiro de NY
- [X] T017 [US1] Reescrever src/components/BottomNav.tsx (celular: Viagem · Nova York · Orlando · Miami · Guia, ícones de Icon.tsx, ativo com ícone preenchido + negrito + `aria-current`) e criar src/components/TopNav.tsx (desktop ≥ 1024 px: mesmos itens + Favoritos e Meus roteiros); renderizar ambos em src/app.tsx e esconder um ou outro por CSS
- [X] T018 [US1] Ajustar src/pages/Home.tsx para funcionar em `#/guia` (cidade padrão = cidade do dia) com links no topo para Favoritos e Meus roteiros; trocar o atalho "Roteiro de hoje" para apontar para `#/destino/<cidade>/<hoje>`; em src/pages/Itineraries.tsx, os cartões "Roteiro FULL" passam a apontar para `#/destino/nova-york/<data>`
- [X] T019 [US1] Ajustar os E2E existentes para as rotas novas sem mudar o que testam: tests/e2e/helpers.ts e tests/e2e/us1-guide.spec.ts (guia em `#/guia`), tests/e2e/us-full-itinerary.spec.ts (`#/destino/nova-york/…` e seletores da nova linha de atividade), tests/e2e/us3-itineraries.spec.ts (link "Roteiro FULL" para `#/destino/…`); e os testes de componente afetados em tests/components/

**Checkpoint**: US1 navegável nos três destinos; T011–T012 verdes; E2E antigos verdes

---

## Phase 4: User Story 2 - Marcar como feito e acompanhar o progresso (Priority: P1)

**Goal**: Toggle Feito/Pendente em toda atividade (lista e detalhes), progresso real por dia/cidade/
viagem, persistência e compatibilidade com as marcas existentes.

**Independent Test**: Marcar 2 itens de Orlando na lista; conferir contadores do dia, de Orlando e
da viagem; recarregar offline; desmarcar um.

### Tests for User Story 2

- [X] T020 [P] [US2] Testes de componente em tests/components/done-toggle.test.tsx: `role="checkbox"`, `aria-checked`, texto visível "Feito"/"Pendente"/"Pulada", rótulo acessível "Marcar {título} como feito", alternância chamando o store, falha de quota mantém o estado e mostra o alerta padrão; ProgressBar com `role="progressbar"` e `aria-valuenow`/`aria-valuemax` corretos e sem barra quando total = 0
- [X] T021 [P] [US2] Testes E2E em tests/e2e/us-travel-guide.spec.ts (parte US2): em `#/destino/orlando/2026-11-10` marcar 2 itens → "Feito" visível nos itens e contadores do dia, de Orlando (página do destino) e da viagem (`#/`) +2; desmarcar 1 → −1; offline + recarregar + trocar de destino → marcas mantidas; `localStorage` com estado v2 contendo marcas FULL `done` e `skipped` → aparecem como Feito e Pulada; remover um item marcado em `#/roteiros/:id` → contador recalculado

### Implementation for User Story 2

- [X] T022 [P] [US2] Criar src/components/DoneToggle.tsx conforme contracts/ui-components.md (botão `role="checkbox"`, ícone check/círculo + texto, 44 px, transição de 150 ms respeitando reduced motion, `toggleDone` via `useUserState().update`, alerta de quota)
- [X] T023 [P] [US2] Criar src/components/ProgressBar.tsx conforme contracts/ui-components.md ("x de y" + barra; escopo no rótulo acessível)
- [X] T024 [US2] Integrar DoneToggle em src/components/ActivityRow.tsx (sem abrir os detalhes ao tocar) e o estado visual de feita (check + título atenuado, continua visível) e de próxima ("A seguir", dia atual, via `nextPendingActivity`)
- [X] T025 [US2] Integrar ProgressBar em src/pages/Destination.tsx (cidade e dia), src/components/DayNav.tsx ("x/y" por dia) e src/pages/Trip.tsx (viagem e por destino), sempre calculados por src/domain/trip-view.ts
- [X] T026 [US2] Garantir que src/pages/FullDocument.tsx e src/pages/ItineraryDetail.tsx continuam funcionando com a limpeza de marcas (T007) e que src/pages/FullDay.tsx, agora redirecionado, não é mais referenciado por links internos; remover código morto de FullDay/FullOverview apenas se não houver mais rotas que os usem (manter `useFullItinerary` usado pelo documento) — FullDay/FullOverview removidos; alternativas, "Onde comer hoje" e mapa do dia (002) portados para Destination; `fullItineraryOf` em content/load.ts.

**Checkpoint**: US1 + US2 funcionando; T020–T021 verdes

---

## Phase 5: User Story 3 - Ver os detalhes de uma atividade (Priority: P2)

**Goal**: Página da atividade com blocos (fotos, sobre, por que, o que pedir, informações
importantes, logística, tempo, observações), sem dados inventados, com toggle e "Pular".

**Independent Test**: Abrir uma refeição de NY (blocos "Por que está no roteiro" e "O que pedir",
sem fotos), a Magic Kingdom em Orlando (fotos com crédito, preço/horário do ponto, "Como chegar") e
uma atividade sem ingresso (bloco ausente).

### Tests for User Story 3

- [X] T027 [P] [US3] Testes de componente em tests/components/activity-detail.test.tsx: blocos presentes/omitidos conforme os dados (refeição FULL, atração FULL com `pointId`, item de roteiro de Orlando, item indisponível); bloco de logística mostra o deslocamento até a próxima atividade; DoneToggle e "Pular" (só FULL) atualizam o store; navegação anterior/próxima dentro do dia; chave inexistente → "Atividade não encontrada"

### Implementation for User Story 3

- [X] T028 [US3] Implementar src/pages/ActivityDetail.tsx com os blocos 1–10 de contracts/ui-components.md, reaproveitando PointPhoto (galeria com crédito), InfoSource (fatos), DirectionsButton, PointMap (pequeno) e os textos de refeição/loja/série de src/components/ActivityCard.tsx (extrair em funções/componentes exportados se necessário, sem mudar o documento imprimível); layout ≥ 1024 px com fotos à esquerda e blocos à direita
- [X] T029 [US3] Adicionar o controle "Pular" (FULL) em src/pages/ActivityDetail.tsx usando `markActivity(…, 'skipped')` e "Desfazer" (`unmarkActivity`), preservando FR-018

**Checkpoint**: US1–US3 funcionando; T027 verde

---

## Phase 6: User Story 4 - Guia visual premium no celular e no desktop (Priority: P2)

**Goal**: Estética editorial consistente em todas as telas (novas e existentes), desktop em duas
colunas, sem rolagem horizontal, toque ≥ 44 px, contraste AA, motion reduzido.

**Independent Test**: E2E em 390 px e 1280 px medindo rolagem horizontal, tamanho dos alvos e layout
de duas colunas; screenshots claro/escuro.

### Tests for User Story 4

- [X] T030 [P] [US4] Testes E2E em tests/e2e/us-travel-guide.spec.ts (parte US4): em 390 × 844, para `#/`, `#/destino/{cada cidade}/{um dia}`, uma atividade, `#/guia`, `#/favoritos`, `#/roteiros`: `document.documentElement.scrollWidth <= clientWidth` e todos os `button, a, [role=checkbox]` visíveis com caixa ≥ 44 × 44 (exceto links dentro de texto corrido); em 1280 × 800, a página do destino tem DayNav e conteúdo lado a lado; com `reducedMotion: 'reduce'`, a transição computada do DoneToggle é `0s`

### Implementation for User Story 4

- [X] T031 [US4] Aplicar o estilo editorial às telas existentes em src/styles/base.css e nos componentes (src/pages/Home.tsx, src/pages/PointDetail.tsx, src/pages/Favorites.tsx, src/pages/Itineraries.tsx, src/pages/ItineraryDetail.tsx, src/pages/Credits.tsx, src/pages/FullDocument.tsx, src/components/PointCard.tsx, src/components/Filters.tsx, src/components/OfflineBanner.tsx): títulos em serifa, cards sem bordas pesadas, chips e botões nos novos tokens, sem alterar comportamento
- [X] T032 [US4] Revisar o CSS para os alvos de toque ≥ 44 px e ausência de rolagem horizontal apontados por T030 (ex.: chips de categoria, links de rodapé, ícones do mapa) em src/styles/base.css — Chips e botões do Guia passaram de 40 px para 44 px (apontado pelo E2E).
- [X] T033 [US4] Microinterações discretas em src/styles/base.css: check do DoneToggle (escala 0.9 → 1 em 150 ms), destaque do item ativo do DayNav, transição de opacidade ao trocar de dia; todas desligadas em `prefers-reduced-motion`

**Checkpoint**: As 4 histórias funcionam; T030 verde

---

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T034 [P] Atualizar README.md (navegação nova: Viagem, destinos, dias, detalhes; onde ficam guia/favoritos/roteiros/documento) e specs/001-tourist-guide-itineraries/contracts/routes.md / specs/002-nyc-full-itinerary/contracts/routes.md com nota de redirecionamento para as rotas da 003
- [X] T035 Rodar a sequência do CI (`typecheck`, `test`, `content:strict`, `build`, `budget`, `e2e`) e conferir o orçamento (JS inicial < 100 KB gzip)
- [X] T036 Revisão visual: screenshots em 390 px e 1280 px, claro e escuro, das telas listadas em specs/003-travel-guide-redesign/quickstart.md ("Revisão visual"); corrigir o que estiver ilegível, desalinhado ou parecendo dashboard genérico — Screenshots 390/1280, claro/escuro; ajustes: crédito da foto em uma linha, detalhes sem foto em coluna única.
- [ ] T037 Commit na branch `003-travel-guide-redesign` (requer autorização) e, quando houver remote, PR com CI verde — **Parcial**: commit feito em 24/10/2026 (branch `007-orlando-itinerary-doc`); PR depende do remote (001 T063)
- [ ] T038 Validação no celular do casal junto com 001 T066 e 002 T048 (30/10): navegar destinos e dias em modo avião, marcar e desmarcar, abrir detalhes

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (T001–T003) → Foundational (T004–T010) → US1 → US2 → US3 → US4 → Polish
- US2 depende de ActivityRow/Destination/Trip (US1); US3 depende das rotas (T010) e de ActivityRow
  para chegar à página, mas sua página é independente; US4 aplica estilo sobre tudo

### Dependências internas relevantes

- T002 → T003; T002 → T005 (hero)
- T004 → T005; T006 → T007; T005, T007 → US1/US2
- T008, T009 → T013, T014, T017, T022
- T010 → T015, T016, T028
- T013, T014 → T015; T015, T016 → T024, T025
- T022 → T024, T028; T023 → T025
- T015, T016, T017, T018 → T019

### Parallel Opportunities

- Setup: T002 em paralelo com T001
- Foundational: T004, T006, T008 em paralelo; T009 em paralelo com T005/T007
- US1: T011, T012, T013, T014 em paralelo
- US2: T020, T021, T022, T023 em paralelo
- US3: T027 em paralelo com o fim de US2
- US4: T030 em paralelo com T031

---

## Parallel Example: User Story 1

```bash
Task: "Testes de componente do destino em tests/components/destination.test.tsx"
Task: "E2E de navegação em tests/e2e/us-travel-guide.spec.ts"
Task: "DayNav em src/components/DayNav.tsx"
Task: "ActivityRow em src/components/ActivityRow.tsx"
```

---

## Implementation Strategy

1. Setup + Foundational (21–22/10): `trip-view`, chaves, toggle, tokens, rotas
2. US1 + US2 (22–24/10): as duas P1 juntas formam o MVP — navegar por destino/dia e marcar feito
3. US3 (24/10): detalhes em blocos
4. US4 (24–25/10): acabamento visual em todas as telas
5. Polish (26–27/10), revisão do casal (28–29/10), instalação (30/10)

**MVP**: US1 + US2 (as duas prioridades P1 da spec).

---

## Notes

- Nada de dados inventados: campos ausentes omitem o bloco (FR-011); fotos só dos pontos do guia.
- Nenhuma dependência nova; nada de fontes ou ícones externos (offline).
- T001 e T037 envolvem git: só com autorização do usuário.
