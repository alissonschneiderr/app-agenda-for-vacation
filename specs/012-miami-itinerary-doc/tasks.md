# Tasks: Roteiro de Miami do casal (18 a 20/11), na mesma estrutura de Nova York e Orlando

**Input**: Design documents from `specs/012-miami-itinerary-doc/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/screens.md, quickstart.md

**Tests**: obrigatórios (constituição, Princípio II). Em cada história, o teste vem antes da
implementação e deve falhar primeiro.

**Comandos**: prefixar com `export PATH=/opt/homebrew/opt/node@24/bin:$PATH`. Depois de mudar o
conteúdo, rodar `npm run content` antes dos testes.

**Branch**: `main`, a pedido do usuário.

**Decisões**:
- **Q1 = A**: o 18/11 é dia de viagem e também tem a tarde em South Beach como dia comum. O 07/11 de
  Orlando não muda.
- **Q2 = B**: os roteiros sugeridos de Miami são apagados.

**E2e mobile**: os projetos `mobile-360` e `mobile-402` só rodam arquivos `tests/e2e/us-mobile*.spec.ts`.
Por isso o e2e de Miami se chama `tests/e2e/us-mobile-miami.spec.ts`.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup

- [ ] T001 Conferir a base na `main`: `npm run typecheck && npm test` verdes e working tree limpa. Se aparecerem cópias com sufixo " 2" (sincronização do iCloud), remover só as idênticas ao original, como feito no `/speckit-plan`.

---

## Phase 2: Foundational (bloqueia todas as histórias)

**Purpose**: o roteiro de Miami no formato do leitor, com o build passando.

- [ ] T002 Gerar `content/full/miami/roteiro.md` a partir do documento do Claude Docs (id `cf6a3771-c1ec-4a9e-ac9b-6aec7e653833`, rev. 15), conforme R2 de `research.md`:
  - ler o corpo da aba pelo conector (XML com listas aninhadas) e converter com um script descartável no scratchpad, que não fica no repositório;
  - preservar listas e sub-listas, negrito, itálico, links com URL original e tabelas em pipe;
  - ajustes de formato:
    - a linha combinada "**15h30 – almoço tardio** … e **16h30 – check-in** …" de 18/11 vira duas linhas de logística antes de "Atrações";
    - as "pausa livre" ficam como item livre;
    - "**Sobre as fotos:**" sai;
  - conferir a conversão contra `specs/012-miami-itinerary-doc/source/roteiro-miami-2026-10-27-rev15.md`, com o mesmo texto, palavra por palavra (sem contar a marcação).
- [ ] T003 Criar `content/full/miami/meta.json` conforme `data-model.md`:
  - `id`/`cityId` `miami`;
  - `title` "Roteiro Miami — 18 a 20 de novembro";
  - `travelers` "Casal";
  - `idPrefix` "mia1";
  - `stepsUseAreaPoint` true;
  - **sem** `arrivalDay` e **sem** `departure`;
  - `commitments`, `checklist`, `practicalTips` e `excluded` vazios;
  - `updatedAt` "2026-10-27".

  Criar `doc-photos.json`, `photo-credits.json` e `point-links.json` com `{}`.
- [ ] T004 Criar `tests/content/miami-doc-real.test.ts`, no molde de `tests/content/orlando-doc-real.test.ts` e contando no texto de `content/full/miami/roteiro.md` (deve falhar antes de T005):
  - sem erros de leitura nem de fidelidade (`docErrors` sem itens de `miami`);
  - dias `['2026-11-18','2026-11-19','2026-11-20']`, com os títulos do documento;
  - itens com horário de cada dia no app, na ordem e com o horário do texto (SC-001);
  - restaurantes e cafés por dia: 4, 5 e 6 (SC-002);
  - todos os links 📷 e de mapa do texto acessíveis no app (SC-003);
  - todas as seções "##" no documento completo, na ordem (SC-004);
  - grupos por dia iguais aos "### 📍" e "### 🌙" do texto.
- [ ] T005 Rodar `npm run content` e `npm run content:strict` e corrigir só problemas de formato do `roteiro.md` (R2), sem mudar conteúdo. Se uma construção do documento não couber no leitor, registrar em `research.md` e tratar na história certa: a chegada no dia é a US2 e a tabela de reservas é a US3. As partes de T004 que não dependem da US2 e da US3 devem passar.

**Checkpoint**: o build lê o roteiro de Miami sem erros.

---

## Phase 3: User Story 1 - Os 3 dias de Miami, iguais aos de NY e Orlando (Priority: P1) 🎯 MVP

**Goal**: 18, 19 e 20/11 com Paradas, Restaurantes e Cafés, Brechós e Lojas, Curiosidades, Bairros, Transporte e atrações com descritivo. Os roteiros sugeridos de Miami somem (Q2 = B).

**Independent Test**: `#/cidade/miami` e os 3 dias a 360 e 402 px, offline, com os horários e lugares do documento.

### Tests for User Story 1

- [ ] T006 [P] [US1] Criar `tests/components/miami-day.test.tsx` (deve falhar). Esperado:
  - 18/11: Paradas `Lummus Park`, `Pôr do sol`, `Ocean Drive`, `Española Way`; `#comer` com 4 cards sob "South Beach (Art Deco District)"; `#curiosidades` com "The Carlyle" e "728 Ocean Drive";
  - 19/11: Paradas `Simon Guest Services…`, `The Colonnade Outlets`, `Ala principal`; `#comer` com 5; `#lojas` com 5 categorias; `#transporte` com o Uber (50–70 min);
  - 20/11: Paradas Praia, Mais praia, Beachwalk, South Pointe; `#comer` com 6, incluindo "Joe's Stone Crab" com "OpenTable"; sem `#transporte`;
  - a atração Lummus Park de 18/11 com o descritivo do documento e "Grátis", sem "Ler mais".
- [ ] T007 [P] [US1] Em `tests/unit/user-store-migration.test.ts`, testar a limpeza (R5, deve falhar):
  - um estado com um roteiro `origin: 'suggested'`, `sourceId: 'sug-2026-11-19'` e um roteiro do casal (`origin: 'user'`), carregado com conteúdo sem sugeridos, fica só com o do casal;
  - os `seededIds` se mantêm.
- [ ] T008 [P] [US1] Criar `tests/e2e/us-mobile-miami.spec.ts`, describe "US1 (012) – Miami":
  - `#/cidade/miami` com 4 cards de dia;
  - tocar no card de 19/11 abre o dia, com Sawgrass e as 5 categorias em "Brechós e Lojas";
  - offline, `#/dia/2026-11-20` com South Pointe e Joe's Stone Crab;
  - `#/roteiros` sem "South Beach e Art Deco" nem "Vizcaya, Little Havana e Wynwood";
  - sem rolagem lateral (helpers `tapCenter` e `noSideScroll` iguais aos de `us-mobile.spec.ts`).

### Implementation for User Story 1

- [ ] T009 [US1] Em `content/trip.json`, trocar `dayKinds["2026-11-19"]` para `"walk"` e `dayKinds["2026-11-20"]` para `"beach"` (R4).
- [ ] T010 [US1] Apagar os sugeridos de Miami:
  - em `content/itineraries.json`, a lista fica vazia (`[]`); conferir que `scripts/content-schema.ts` aceita lista vazia e, se não, permitir;
  - em `src/storage/user-store.ts`, ao carregar o estado, remover os roteiros com `origin === 'suggested'` cujo `sourceId` não está mais em `content.suggestedItineraries`.

  O roteiro do casal nunca é tocado.
- [ ] T011 [US1] Ligar as regiões aos pontos do guia em `content/full/miami/point-links.json`, só quando o nome bate (R8): "South Beach (Art Deco District)" → `mia-art-deco`; "South Pointe Park" → `mia-south-pointe`; "Lincoln Road" → `mia-lincoln-road`, se virar região. Preencher `content/full/miami/doc-photos.json` com arquivos do Wikimedia Commons para as regiões e atrações. Rodar `npm run photos -- --doc --city miami`. Listar o que ficou sem foto em `specs/012-miami-itinerary-doc/photos-missing.md`.
- [ ] T012 [US1] Ajustar os testes que dependiam dos sugeridos de Miami:
  - `tests/components/day.test.tsx` ("19/11 só Paradas", com `seedSuggested`): passa a esperar o roteiro do documento;
  - `tests/unit/notebook.test.ts`:
    - seções de 19/11;
    - `shoppingSlice` de "Lincoln Road" de 19/11 (o roteiro antigo some): trocar pelo caso de 19/11 sem região de compras;
  - os testes que só testam a lógica de semear (`tests/unit/seed.test.ts`, `tests/components/itineraries.test.tsx`, `tests/e2e/us3-itineraries.spec.ts`) passam a usar a fixture `tests/fixtures/content.ts` com um sugerido de exemplo, em vez do conteúdo real;
  - conferir também `tests/unit/trip-view.test.ts`, `tests/content/content-rules.test.ts`, `tests/components/city.test.tsx`, `tests/components/transition.test.tsx` e `tests/e2e/us1-guide.spec.ts`;
  - cada mudança de expectativa ganha um comentário "feature 012".
- [ ] T013 [US1] Rodar `npm run content`, `npm test` e o e2e de T008. T006, T007 e T008 devem passar. As partes de 18/11 ligadas a "Transporte / A chegada" ficam para a US2.

**Checkpoint**: Miami com os 3 dias do casal; nenhum sugerido antigo.

---

## Phase 4: User Story 2 - A chegada de trem em Miami no 18/11 (Priority: P1)

**Goal**: 18/11 com "Antes de sair" e "A viagem" (Orlando, como hoje) e "A chegada" de Miami (14h21 MiamiCentral, 4 traslados, Kasa La Flora) em Transporte, mais a tarde em South Beach. O 07/11 de Orlando não muda.

**Independent Test**: `#/dia/2026-11-18`, com Transporte com os 3 blocos e as outras seções da tarde; `#/dia/2026-11-07` igual a antes.

### Tests for User Story 2

- [ ] T014 [P] [US2] Em `tests/unit/doc-parser.test.ts`, com fixture curta (deve falhar):
  - um "## Dia 1 (quarta, 18/11): …" sem `arrivalDay`, com "### 🚆 Chegada e traslado" (itens em negrito com horário + parágrafos de opções) seguido de "### 📍 South Beach…";
  - `arrivals['2026-11-18'].items` são os itens com horário ("14h21 – chegada na MiamiCentral", "~15h15 – Kasa La Flora");
  - `arrivals[...].html` tem as opções de traslado;
  - o dia tem a área "South Beach…" e as paradas dela;
  - um doc com `arrivalDay` continua mandando o dia inteiro para `arrivals`, como em Orlando.
- [ ] T015 [P] [US2] Em `tests/components/miami-day.test.tsx`:
  - 18/11 com `#transporte` contendo "1. Antes de sair", "2. A viagem", "3. A chegada", "MiamiCentral", "Uber", "Metrobus 120" e "Kasa La Flora";
  - menu com Paradas, Restaurantes e Cafés, Curiosidades, Bairros e Transporte;
  - em `tests/components/orlando-day.test.tsx`, 07/11 sem mudança (os testes atuais continuam passando).

  Em `tests/e2e/us-mobile-miami.spec.ts`, offline: `#/dia/2026-11-18` com "A chegada" visível em Transporte e o chip "Paradas" no menu.

### Implementation for User Story 2

- [ ] T016 [US2] Em `scripts/doc-parser.ts`, implementar R3: num dia **sem** `opts.arrivalDay`, separar a seção "### 🚆 …Chegada…" ou "### ✈️ …Chegada…" do resto do dia:
  - os itens em negrito com horário viram `arrivals[date].items`, reaproveitando `parseArrival`;
  - o resto da seção vira `arrivals[date].html`;
  - a seção não vira área nem passos;
  - as regras de fidelidade D1–D5 não contam essa seção duas vezes.

  Ajustar `content/full/miami/roteiro.md` só se o formato exigir.
- [ ] T017 [US2] Rodar `npm run content` e os testes de T014 e T015, que devem passar. Conferir que `content:strict` está sem erros e que os testes de Orlando continuam verdes.

**Checkpoint**: 18/11 completo; Orlando intacto.

---

## Phase 5: User Story 3 - Preparação e dicas de Miami (Priority: P2)

**Goal**: 6 reservas com data de uso, dicas de Miami por categoria, checklist de praia com 7 itens e documento completo com todas as seções.

**Independent Test**: `#/full/miami/documento` com as seções, as reservas e o checklist.

### Tests for User Story 3

- [ ] T018 [P] [US3] Em `tests/unit/doc-parser.test.ts`, fixture com a tabela `Data | Item | Situação` (deve falhar): `checklist` com `what` = Item, `note` = Situação e `forDate` vindo de dd/mm ("Antes de embarcar" → sem `forDate`). A tabela de Orlando (`Item | Quando reservar | Custo | Dia de uso`) não muda.
- [ ] T019 [P] [US3] Em `tests/content/miami-doc-real.test.ts`:
  - 6 reservas, com `forDate` `['2026-11-18','2026-11-19','2026-11-19','2026-11-20','2026-11-18', undefined]` na ordem do documento;
  - as dicas de Miami cobrem as seções de "🧳 Dicas práticas" (Transporte, Clima, Gorjetas, Impostos e compras, Segurança, O que levar para a praia, Outros), cada uma com o texto do documento;
  - "O que levar para a praia" com 7 itens marcáveis;
  - Estratégia, Thanksgiving, Hospedagem, a legenda de preço, Resumo e Fontes no documento completo.

### Implementation for User Story 3

- [ ] T020 [US3] Em `scripts/doc-parser.ts`, reconhecer a tabela de reservas `Data | Item | Situação` (R6), ao lado da de Orlando. Conferir as dicas e o checklist de praia pelo caminho atual (`sectionTips`, listas `- [ ]`). Se uma seção não virar dica, ajustar só a categoria (`tipCategory`), sem reescrever texto. Rodar T018 e T019, que devem passar.
- [ ] T021 [US3] Conferir as "Dicas" de cada dia de Miami (regra da 010, `dayTips`). Só aparecem avisos que o documento põe no próprio dia. Se o documento não tiver aviso de dia, a seção não aparece, e isso fica registrado no relatório, sem aviso criado.

**Checkpoint**: todas as histórias completas.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T022 [P] Escrever `specs/012-miami-itinerary-doc/data-review.md` a partir de `dataReview` e da leitura do roteiro:
  - as 5 categorias de lojas da Sawgrass, sem endereço por loja;
  - lugares sem endereço (Praça de alimentação, Pura Vida);
  - preços "de mercado" (Joe's);
  - o tipo "a pé" do dia de compras (R4);
  - o que ficou sem foto.
- [ ] T023 [P] Atualizar o `README.md`: seção "Roteiro de Miami" no molde das de NY e Orlando (dias, decisões Q1/Q2, documento em `#/full/miami/documento`). Tirar a menção aos roteiros sugeridos de Miami, se houver.
- [ ] T024 Remover código e dados sem uso depois da Q2:
  - conferir com a varredura de exports da 009;
  - a lógica de semear sugeridos fica, porque é genérica e testada com fixture;
  - fotos ou pontos usados só pelos sugeridos ficam no guia.
- [ ] T025 Rodar o CI completo: `npm run typecheck && npm test && npm run content:strict && npm run build && npm run budget && npm run e2e`.
  - Conferir o snapshot de NY intacto e o JS inicial < 100 KB.
  - Gerar capturas a 360 × 780 e 402 × 874 em `specs/012-miami-itinerary-doc/screens/`: `#/cidade/miami`, dias 18/11, 19/11 e 20/11, e a atração Lummus Park.
- [ ] T026 Escrever `specs/012-miami-itinerary-doc/report.md`:
  - o que entrou por dia;
  - o 18/11 (Q1 = A);
  - os sugeridos apagados (Q2 = B);
  - as contagens conferidas (SC-001 a SC-006);
  - o link para `data-review.md` e `photos-missing.md`;
  - os testes a 360 e 402 px.

  Marcar as tarefas no `tasks.md`.
- [ ] T027 Com autorização do usuário, commitar a feature 012 na `main`. Sem autorização, só informar que está pronta.

---

## Dependencies & Execution Order

- **Setup (T001)** → **Foundational (T002–T005)** → histórias.
- **US1 (T006–T013)**: depende da Foundational. É o MVP.
- **US2 (T014–T017)**: depende da Foundational. Pode vir antes ou depois da US1. O T015 completa o arquivo `miami-day.test.tsx` criado no T006.
- **US3 (T018–T021)**: depende da Foundational. O T018 e o T014 mexem em `tests/unit/doc-parser.test.ts`, e o T016 e o T020 em `scripts/doc-parser.ts`, então rodam em sequência.
- **Polish**: T022 ∥ T023 → T024 → T025 → T026 → T027.

### Parallel Opportunities

- US1: T006 ∥ T007 ∥ T008.
- US2: T014 ∥ T015.
- US3: T018 ∥ T019.
- Polish: T022 ∥ T023.
- Os testes de histórias diferentes podem ser escritos em paralelo, menos os que dividem arquivo
  (ver acima).

## Parallel Example: User Story 1

```text
T006 [US1] tests/components/miami-day.test.tsx
T007 [US1] tests/unit/user-store-migration.test.ts
T008 [US1] tests/e2e/us-mobile-miami.spec.ts
```

## Implementation Strategy

1. **MVP**: Setup, Foundational e US1 (T001–T013). Os 3 dias de Miami entram no app e os sugeridos saem. Validar a 360 e 402 px.
2. US2: a chegada no 18/11.
3. US3: reservas, dicas, checklist e documento completo.
4. Polish: revisão de dados, README, CI, capturas, relatório e commit com autorização.
