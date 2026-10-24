---

description: "Task list for feature 007 — Roteiro de Orlando (doc do Alisson)"
---

# Tasks: Roteiro de Orlando (doc do Alisson)

**Input**: Design documents from `/specs/007-orlando-itinerary-doc/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/document-format.md,
contracts/ui.md, quickstart.md

**Tests**: Incluídos (constituição, Princípio II): leitor com fixtures e snapshot de NY, doc real,
domínio, componentes e E2E por story com cenário offline.

**Organization**: por user story (US1–US3 da spec).

**Ambiente**: `export PATH=/opt/homebrew/opt/node@24/bin:$PATH`. Testes com `TZ=America/Sao_Paulo`
(já no script). O sed do macOS não aceita `\|`; para substituições múltiplas, usar python.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência pendente)
- **[Story]**: US1–US3

---

## Phase 1: Setup

- [X] T001 Com autorização do usuário, commitar as features 003, 004, 005 e 006 (um commit por feature) e criar a branch `007-orlando-itinerary-doc`. Antes, confirmar `npm run typecheck && npm test && npm run content:strict` verdes. Sem autorização, seguir na branch atual e registrar a pendência no relatório final. — commits feitos em 24/10/2026, na branch `007-orlando-itinerary-doc` (um commit de specs por feature e um de implementação para 003–007)
- [X] T002 Gerar o snapshot de regressão de Nova York **antes de qualquer mudança no leitor**:
  - em tests/unit/nyc-snapshot.test.ts, rodar `parseNycDoc` sobre content/full/nova-york/roteiro.md com o `meta.json` e o `point-links.json` atuais;
  - gravar `expect(doc).toMatchSnapshot()` em tests/unit/__snapshots__/;
  - o snapshot cobre dias, atividades (ids `ny3-…`, títulos, `start`, `timeLabel`, `type`), lugares, áreas, alertas, `docHtml`, `checklist` e `departures`;
  - rodar uma vez para criar o arquivo e conferir que o snapshot foi escrito.
- [X] T003 [P] Criar content/full/orlando/roteiro.md com uma cópia exata de specs/007-orlando-itinerary-doc/source/roteiro-2026-10-24-rev26.md, sem edição. Conferir com `cmp`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**⚠️ CRITICAL**: nenhuma user story começa antes desta fase. Ao fim dela, `npm run content:strict`
gera Orlando de 08 a 17/11 e o snapshot de NY continua igual.

- [X] T004 Renomear scripts/nyc-doc-parser.ts para scripts/doc-parser.ts com `git mv` e atualizar os imports:
  - scripts/build-content.ts;
  - tests/unit/nyc-doc-parser.test.ts, renomeado com `git mv` para tests/unit/doc-parser.test.ts;
  - tests/content/nyc-doc-real.test.ts;
  - tests/unit/nyc-snapshot.test.ts.

  Manter o nome exportado `parseNycDoc` e acrescentar o alias `parseDoc`. Rodar `npm test` e confirmar que o snapshot está igual.
- [X] T005 Atualizar os tipos em src/content/types.ts conforme data-model.md:
  - `FullItinerary.base?` (agora opcional) e `arrival.time?` (agora opcional);
  - `FullItinerary.idPrefix?: string`, `arrivalDay?: DateStr`;
  - `departure?: { date: DateStr; before: DepItem[]; trip: DepItem[] }`, com `DepItem = { label: string; quote?: string; source?: string }`;
  - `arrivals?: Record<DateStr, { items: DepartureItem[]; html?: string }>`;
  - `DepartureItem.block: 'before' | 'trip' | 'arrival'`;
  - `ChecklistItem.id?: string` (`ck:<cidade>:<n>`);
  - `DocPlace.land?: string`.

  Corrigir com `npm run typecheck` os usos de `base` e `arrival.time` que assumiam valor presente (`grep -rn "\.base\b\|arrival\.time" src scripts`).
- [X] T006 Atualizar scripts/full-itinerary-schema.ts conforme research.md R10:
  - `base` e `arrival.time` opcionais;
  - `idPrefix` com regex `^[a-z]+[0-9]*$`;
  - `arrivalDay`, `departure` (cada `DepItem` exige `quote` ou `source`) e `arrivals`;
  - ids de chegada e partida com `^tr:\d{4}-\d{2}-\d{2}:c?\d+$`;
  - `block` com `'arrival'`;
  - `checklist[].id` com `^ck:[a-z-]+:\d+$`;
  - `docPlace.land`.

  Trocar `NY_DATES` por um mapa `EXPECTED_DATES` por `id` (`nova-york` → 31/10 a 06/11; `orlando` → 2026-11-08 a 2026-11-17) usado em F2. Restringir F10 (JFK → POD 51) a `it.id === 'nova-york'`.
- [X] T007 [P] Escrever em tests/unit/doc-parser.test.ts testes com fixtures mínimas em Markdown para cada regra nova de contracts/document-format.md:
  - **cabeçalhos:**
    - `## Dia 2 (dom 08/11): Magic Kingdom` → data 2026-11-08, região "Magic Kingdom";
    - `## ✈️ Partida (qua 18/11) e dicas práticas` → reconhecida como partida;
  - **horários:**
    - `8h10` → `08:10`;
    - `12h15 ou 13h15` → `start` 12:15, sem `end`, `timeLabel` intacto;
    - `14h30–20h00` → fim 20:00;
  - **logística:** `**06h50 – chegada ao estacionamento:** texto` → `transit` com `how` = texto;
  - **`### 🏨 \~18h – volta ao hotel`** + parágrafo → atividade `transit` "volta ao hotel", `timeLabel` "~18h", `how` = parágrafo, sem área nova;
  - **`### 🚗 Deslocamento para Cocoa Beach (\~20 min de carro)`** → `transfer` da área anterior, sem área nova;
  - **linha de atração (R3)**, para `**10h00 — 🛗 Tower of Terror** · \~5 min · Multi Pass. Elevador… [📷 fotos](u)`:
    - `icon` 🛗 e título "Tower of Terror";
    - lugar `attraction` com `queue` "~5 min", `access` "Multi Pass" e `fields[0]` "Elevador…";
    - `photoUrls` [u];
  - **parque com área**: `· fila \~5 min (Adventureland). Texto` → `land` "Adventureland";
  - **ícone com ZWJ**: 🏴‍☠️ e 👨‍🚀 saem do título;
  - **"(opcional"** → `optional: true`;
  - **almoço**: "Almoço", "Almoço (cedo)", "Almoço / Food & Wine" → `type: 'free'`, sem lugar;
  - **compras**: parágrafo `**🛍️ Compras (tarde, \~14h às 18h):** texto` → `shopping` com `timeLabel` "~14h às 18h";
  - **avisos**: `**⚠️ Fechado:** …` dentro de área e `**🎟️ Reservar…**` antes da área → `alerts`;
  - **noite sem horário**: `### 🌙 Noite: descanso` → área `noite` com `notesHtml`, sem atividade e sem erro;
  - **Onde comer**: `- Casey's Corner (Main Street, cachorro-quente)` → `food` "Casey's Corner", `fields[0]` "Main Street, cachorro-quente"; `- Butterbeer em Hogsmeade` → nome inteiro;
  - **Mercados**: `**🛍️ Mercados (lista):**` + `- Publix` → `shop` "Publix";
  - **ids**: com opção `idPrefix: 'orl1'` → `orl1-2026-11-08-01`; sem a opção → `ny3-…`.
- [X] T008 Implementar T007 em scripts/doc-parser.ts seguindo research.md R2–R4 e R8:
  - `T` com `\d{1,2}h`, `TIME_LABEL` com `ou`, `hhmm` com padding;
  - `logisticsLine` aceita `chegada ao`;
  - cabeçalhos `###` com 🏨 e 🚗;
  - ícone por emoji genérico (`/^\p{Extended_Pictographic}(?:️|‍\p{Extended_Pictographic}️?)*\s*/u`), com 🛍️/🎬 definindo o tipo como hoje;
  - meta da linha de atração: `queue`, `access` e `land`;
  - "Almoço" → `free`;
  - "(opcional" → `optional`;
  - parágrafo de compras com horário;
  - `**⚠️…**` na área → `alerts` do dia;
  - noite sem horário → só notas;
  - itens simples em "Onde comer" e "Mercados";
  - opção `idPrefix` (padrão `ny3`);
  - passo sem `pointId` herda o `pointId` da sua área, via `pointLinks[area.name]`.

  **Condição de parada**: `npm test -- nyc-snapshot` MUST continuar igual. Se uma regra mudar a saída de NY, restringi-la (por exemplo, emoji genérico só quando o título não começa com um dos 5 ícones de NY) até o snapshot voltar a bater. Nunca atualizar o snapshot.
- [X] T009 Atualizar `checkFidelity` em scripts/doc-parser.ts conforme a tabela D1–D6 de contracts/document-format.md:
  - **D1** conta `- **H…h` com hora de 1 ou 2 dígitos, as linhas de logística, os `### 🏨` com horário, os parágrafos "🛍️ Compras (…h…)" e as noites com horário;
  - **D4** ignora `###` com 🏨/🚗.

  Testes em tests/unit/doc-parser.test.ts: uma fixture com um item a menos no app acusa D1, e o doc real de NY continua sem erros.
- [X] T010 Criar content/full/orlando/meta.json:
  - `id`/`cityId` `orlando`, `title` "Roteiro Orlando – Novembro 2026", `travelers` "Casal", `idPrefix` "orl1";
  - `arrival` `{ "airport": "MCO", "date": "2026-11-07" }`, **sem `base`**;
  - `arrivalDay` "2026-11-07";
  - `departure` exatamente como em research.md R5, com o `quote` "faça o check-out com folga e devolva o carro no aeroporto (MCO)" e o item `trip` "De trem para Miami" com `source` "casal, Q1 da feature 007";
  - `commitments`, `practicalTips` e `excluded` vazios, `checklist` vazio (vem do doc), `updatedAt` "2026-10-24".

  Criar também content/full/orlando/point-links.json, só para nomes que existem no doc (região ou lugar) e com ids que existem em content/points/orlando.json:
  - Magic Kingdom → orl-magic-kingdom;
  - Hollywood Studios → orl-hollywood-studios;
  - EPCOT → orl-epcot;
  - Animal Kingdom → orl-animal-kingdom;
  - Epic Universe → orl-epic-universe;
  - Universal Studios Florida → orl-universal-studios;
  - Islands of Adventure → orl-islands-of-adventure;
  - Kennedy Space Center Visitor Complex → orl-kennedy-space-center;
  - Orlando Vineland Premium Outlets → orl-vineland-outlets;
  - "Orlando International Premium Outlets ou Mall at Millenia" → orl-international-outlets.
- [X] T011 Atualizar scripts/build-content.ts (`readFullItineraries`):
  - passar `idPrefix`;
  - para `arrivalDay`, tirar a seção do dia de `doc.days` e gerar `arrivals[date]` (R5):
    - os itens da lista de `### ✈️ Chegada` viram `{ id: 'tr:<data>:c<n>', label: <texto do item>, text: '', block: 'arrival' }`;
    - o HTML do resto da seção (Mercados, Noite) vira `html`;
  - para `departure`, gerar `departures[date]` a partir de `before`/`trip` (ids `tr:<data>:<n>` em sequência; `text` = `quote` ou vazio), sem gravar `dayNotes[date]`;
  - acrescentar o erro D6 para cada `quote` que não está literalmente na seção Partida e para cada item sem `quote` nem `source`;
  - **checklist (R6):** a tabela com cabeçalho `Item | Quando reservar | Custo | Dia de uso` vira itens com:
    - `what` = Item, `when` = Quando reservar, `note` = Custo;
    - `forDate` e `deadline` com as datas `dd/mm` das colunas;
    - `id` `ck:orlando:<n>`.

    A tabela de NY (cabeçalho `Atração`) continua igual; os ids `ck:nova-york:<n>` podem ser acrescentados, porque o snapshot cobre só a saída do leitor.
  - o resumo do console passa a imprimir também as chegadas e partidas.

  Rodar `npm run content:strict` até zerar os erros, sem editar roteiro.md.
- [X] T012 [P] Corrigir `dayKinds` de Orlando em content/trip.json conforme data-model.md:
  - `park`: 08, 09, 10, 12, 14, 15 e 17/11;
  - `walk`: 11, 13 e 16/11;
  - `transit`: 07 e 18/11 (sem mudança).
- [X] T013 [P] Teste do doc real em tests/content/orlando-doc-real.test.ts, com contagens tiradas do texto e não do leitor (contracts/document-format.md, "Esperado para a cópia rev. 26"):
  - 10 dias, de 2026-11-08 a 2026-11-17;
  - 75 itens com horário + 18 logísticas + 2 compras;
  - 69 marcáveis;
  - 29 lugares de comida;
  - 81 links de fotos e 10 `mapUrl`;
  - todas as seções `##` em `docHtml`, na ordem;
  - `arrivals['2026-11-07'].items.length === 2` com os 3 mercados no `html`;
  - `departures['2026-11-18']` com 2 itens, nenhum contendo "voo internacional";
  - nenhum `dayNotes['2026-11-18']`;
  - `checklist` com 6 itens e `deadline` 2026-11-06 / 2026-11-07 nos três itens do Multi Pass e do Single Pass;
  - `docErrors` vazio.

**Checkpoint**: `npm run typecheck && npm test && npm run content:strict` verdes; o snapshot de NY
continua igual.

---

## Phase 3: User Story 1 - Seguir o dia de parque na ordem do doc (Priority: P1) 🎯 MVP

**Goal**: em "Agora" e "Dia", cada dia de parque mostra:
- a chegada ao estacionamento e os avisos;
- as atrações na ordem do doc, com fila, área e forma de entrar;
- os almoços como intervalo;
- a volta ao hotel.

Os sugeridos de Orlando somem.

**Independent Test**: abrir 08/11 e 09/11, conferir a ordem e os campos com o doc, e conferir "Agora"
em 09/11 às 12h30 (Runaway Railway 13h00 · Multi Pass).

### Tests for User Story 1

- [X] T014 [P] [US1] Testes em tests/unit/trip-view.test.ts:
  - em 2026-11-10, com o estado semeado por `seedSuggested`, `dayView` não tem grupo `itinerary` de origem `suggested` (FR-001, SC-005);
  - o progresso de 08/11 conta só os passos `orl1-…` marcáveis; uma marca `it:…` antiga não altera o progresso;
  - em 2026-11-19 (Miami) os sugeridos continuam;
  - `DayActivityView` de Tower of Terror (09/11) tem `queue` "~5 min", `access` "Multi Pass" e `pointId` `orl-hollywood-studios`.
- [X] T015 [P] [US1] Testes de componente em tests/components/orlando-day.test.tsx:
  - "Dia" 08/11: a primeira linha é a chegada ao estacionamento 06h50, depois Jungle Cruise 8h10 com "fila ~5 min" e "Adventureland";
  - "Almoço" 11h15 aparece como intervalo (`.tl-free`), sem caixa de marcar;
  - o aviso "Tiana's Bayou Adventure" está na lista de avisos;
  - "Agora" em 2026-11-09T12:30 (hora de Nova York) tem cartão `Próximo passo: Mickey & Minnie's Runaway Railway` com "13h00" e "Multi Pass", e a faixa do almoço oferece "Ver onde comer";
  - um item opcional (Festival of Fantasy) mostra "opcional".

### Implementation for User Story 1

- [X] T016 [US1] Em src/domain/trip-view.ts:
  - `dayView` deixa de incluir itinerários com `origin === 'suggested'` quando há `fullDay` na data (research R9);
  - `fromFull` preenche `queue`, `land` e `access` a partir do primeiro lugar do passo;
  - as fotos do ponto herdado (`pointId` da região) não substituem a foto própria da atração.

  `stepPhoto` em src/components/NextStepCard.tsx continua: foto do lugar, depois a do ponto, depois a da área.
- [X] T017 [US1] Mostrar fila, área e forma de entrar conforme contracts/ui.md:
  - em src/components/TimelineRow.tsx, na linha de meta: `land` · `queue`, mais a etiqueta "Multi Pass"/"Single Pass" quando `access` contiver esse termo;
  - em src/components/NextStepCard.tsx: `queue` · `access`, mais `land`;
  - em src/pages/StepDetail.tsx: os três campos com rótulo.

  Os passos de NY não têm esses campos e MUST ficar como estão. Estilos em src/styles/base.css respeitam contraste ≥ 7:1 e não criam rolagem lateral a 390 px.
- [X] T018 [US1] Atualizar os testes que usavam Orlando como exemplo de dia sem horários e sugeridos:
  - tests/components/day.test.tsx ("Orlando como lista") e o teste e2e "Orlando: dia sem horários vira lista…" em tests/e2e/us-companion.spec.ts passam a usar Miami em 2026-11-19 ("Ver o guia de Miami");
  - conferir tests/components/trip-overview.test.tsx: "segunda, 09/11, parque" continua válido, e o novo tipo de 08/11 é "parque".
- [X] T019 [US1] E2E em tests/e2e/us-orlando.spec.ts (US1), com `openInstalled` e `?agora=`:
  - `/?agora=2026-11-08T08:00#/`: o cartão é Jungle Cruise 8h10, com "fila ~5 min" e "Adventureland";
  - `/?agora=2026-11-09T12:30#/`: Runaway Railway 13h00 · Multi Pass;
  - Feito + Desfazer funcionam num passo `orl1-`;
  - com `goOffline`, `#/dia/2026-11-14` mostra as 10 atrações do Epic Universe na ordem do doc.

**Checkpoint**: US1 funciona e é testável sozinha.

---

## Phase 4: User Story 2 - Dias de folga e "Por perto" (Priority: P1)

**Goal**:
- os dias 11, 13 e 16/11 mostram as regiões na ordem do doc, com deslocamentos e compras;
- "Por perto" lista "Onde comer" do parque;
- os parques e lugares do guia mostram a foto do guia.

**Independent Test**: abrir 13/11 (KSC → Cocoa Beach → volta → Disney Springs) e "Por perto" em
08/11 (5 opções do Magic Kingdom).

### Tests for User Story 2

- [X] T020 [P] [US2] Testes de componente em tests/components/orlando-day.test.tsx:
  - "Dia" 13/11 mostra as áreas "Kennedy Space Center Visitor Complex", "Cocoa Beach" e "Noite: Disney Springs", nessa ordem;
  - o deslocamento "Deslocamento para Cocoa Beach (~20 min de carro)" aparece entre KSC e Cocoa Beach;
  - os 4 itens do KSC têm os horários 9h00, 10h30, 13h00 e 14h00, sendo o almoço um intervalo;
  - "Dia" 11/11 tem o passo de compras "~14h às 18h" marcável e a nota "Alternativa ao outlet";
  - em "Por perto" 2026-11-08, Magic Kingdom tem `Comer (5)` e cada opção mostra nome e área, sem preço nem caixa de marcar;
  - a área Magic Kingdom tem foto (do guia, com crédito).

### Implementation for User Story 2

- [X] T021 [US2] Ajustar src/pages/Nearby.tsx e src/components/PlaceCard.tsx para lugares sem `level`, `price` nem `queue`, mostrando nome + `fields[0]`. A legenda de preço só aparece se algum lugar da área tiver `price`. Garantir que os lugares `attraction` não entram em "Comer". Conferir que "Opções (n)" na linha do tempo (src/pages/Day.tsx) conta só comida e lojas.
- [X] T022 [US2] E2E em tests/e2e/us-orlando.spec.ts (US2):
  - `#/dia/2026-11-13` com a sequência KSC → deslocamento → Cocoa Beach → volta → Disney Springs, também offline;
  - `/?agora=2026-11-08T12:00#/perto`: `Comer (5)` e o detalhe de "Casey's Corner".

**Checkpoint**: US1 e US2 funcionam juntas.

---

## Phase 5: User Story 3 - Reservas, chegada, partida e doc completo (Priority: P2)

**Goal**:
- "Agora" lembra os Multi Pass em 06 e 07/11;
- 07/11 mostra a chegada do doc;
- 18/11 mostra a partida conforme Q1;
- "Viagem" lista as reservas de Orlando;
- o documento completo existe por cidade.

**Independent Test**: os cenários 06/11, 07/11, 18/11, `#/viagem` e `#/full/orlando/documento` do
quickstart.md, offline.

### Tests for User Story 3

- [X] T023 [P] [US3] Testes em tests/components/reserve-today.test.tsx:
  - em 2026-11-06, a seção `Reservar hoje` lista o Multi Pass Hollywood Studios com quando e custo;
  - Feito marca `ck:orlando:1` e Desfazer desmarca;
  - em 2026-11-07, lista o Multi Pass EPCOT e o Single Pass;
  - em 2026-11-08 a seção não aparece;
  - a marca não altera `tripProgress`.
- [X] T024 [P] [US3] Atualizar tests/components/trip-overview.test.tsx:
  - **`TransitionBlocks` em 07/11:** "A chegada" tem 2 itens marcáveis ("Retirar o carro no aeroporto (MCO)…" e "Compras básicas…") e mostra "Publix";
  - **`TransitionBlocks` em 18/11:**
    - "Antes de sair" tem "faça o check-out com folga e devolva o carro no aeroporto (MCO)";
    - "A viagem" tem "De trem para Miami";
    - o texto "voo internacional" não aparece em nenhum lugar do componente;
    - não há "Orientações completas do roteiro";
    - "A chegada" continua "Sem orientações no roteiro.";
  - **`TripOverview`:** a seção de reservas tem o grupo Orlando com 6 itens e um link para a seção "O que reservar com antecedência" do documento de Orlando; "Consulta" tem "Documento de Nova York" e "Documento de Orlando".
- [X] T025 [P] [US3] Teste em tests/components/full-document.test.tsx: `FullDocument` com `cityId="orlando"` mostra as 17 seções `##` do doc na ordem, e a de NY continua com 10.

### Implementation for User Story 3

- [X] T026 [US3] Criar src/components/ReserveToday.tsx (contracts/ui.md, "Agora: reservas do dia"):
  - itens de `checklist` de todas as cidades com `deadline === hoje`, numa seção `aria-label="Reservar hoje"`;
  - cada item mostra `what`, `when` e `note`, mais um `DoneToggle` com `activityKey = id`;
  - usar em src/pages/Now.tsx nos dias normais (acima do `NextStepCard`) e nos de locomoção (acima de `TransitionBlocks`).

  As marcas `ck:` não entram em progresso (`progressOf` só vê os passos do dia; conferir).
- [X] T027 [US3] Atualizar src/components/TransitionBlocks.tsx:
  - "A chegada" usa `arrivals[date]` de qualquer itinerário: itens marcáveis (mesmo componente `Items`) e `html` em `.doc-html`, mantendo a prévia do 1º dia;
  - sem `arrivals`, continua "Sem orientações no roteiro.";
  - "Antes de sair"/"A viagem" continuam lendo `departures`;
  - "Orientações completas" só quando houver `dayNotes[date]`.
- [X] T028 [US3] Rotas e documento por cidade (research R11):
  - em src/app.tsx, `#/full/:cityId/documento` e `#/full/:cityId/documento/:section` substituem as duas rotas fixas de NY;
  - `#/full/nova-york/:date` continua redirecionando e MUST NOT capturar `documento`;
  - src/pages/FullDocument.tsx recebe `cityId`, usa `content.fullItineraries.find(f => f.cityId === cityId)` e troca os links fixos `#/destino/nova-york…` por `#/dia/<data>` e `#/viagem`;
  - cidade sem roteiro → mensagem "Sem roteiro para esta cidade.".
- [X] T029 [US3] Atualizar src/pages/TripOverview.tsx:
  - "Para comprar antes" agrupado por cidade, com todos os itinerários e todos os itens com `forDate`;
  - Orlando mostra `when` · `what` · `note` e o dia de uso, mais o link "Regra dos ingressos e checklist" para `#/full/orlando/documento/<id da seção "O que reservar com antecedência">`;
  - "Consulta" com "Documento de <cidade>" e "Dicas práticas" por cidade com roteiro. Em Orlando, "Dicas práticas" aponta para a seção "Partida (qua 18/11) e dicas práticas".
- [X] T030 [US3] E2E em tests/e2e/us-orlando.spec.ts (US3), offline (`goOffline`):
  - `/?agora=2026-11-06T09:00#/` → "Reservar hoje" com o Multi Pass Hollywood Studios;
  - `/?agora=2026-11-07T09:00#/` → "Reservar hoje" com EPCOT, e "A chegada" com 2 itens marcáveis;
  - `/?agora=2026-11-18T09:00#/` → "De trem para Miami" e nenhuma ocorrência de "voo internacional";
  - `#/full/orlando/documento` → 17 seções.

**Checkpoint**: todas as user stories funcionam.

---

## Phase 6: Fotos offline (Q2 = A) e polimento

- [X] T031 Generalizar `mainDoc` em scripts/fetch-photos.ts:
  - percorrer `content/full/*/doc-photos.json`;
  - NY continua em `public/photos/doc/<slug>.webp`;
  - as outras cidades vão para `public/photos/doc/<cidade>/<slug>.webp`;
  - créditos em `content/full/<cidade>/photo-credits.json`;
  - mesma regra de licença (`ALLOWED_LICENSE`), autor, link da fonte e WebP de 900 px q66.

  Rodar `npm run photos -- --doc` e conferir que os arquivos de NY não mudaram (`git status public/photos/doc`).
- [X] T032 Criar content/full/orlando/doc-photos.json com uma referência `File:` ou `wiki:` do Wikimedia Commons para cada atração com horário que não seja almoço nem intervalo, e para cada região sem ponto do guia (Cocoa Beach, Manhã livre fica sem foto). As chaves são os nomes exatos do doc.
  - Buscar no Commons item a item.
  - Rejeitar foto de outro lugar ou de outra versão da atração: por exemplo, Disneyland em vez de Walt Disney World, ou Universal Hollywood em vez de Orlando.
  - Rodar `npm run photos -- --doc` e conferir visualmente cada foto baixada (Read na imagem), substituindo as erradas.
- [X] T033 Generalizar tests/content/doc-photos.test.ts para todas as cidades em `content/full/*`:
  - mesmas três verificações;
  - cobertura ≥ 90% por cidade (SC-010).

  Escrever specs/007-orlando-itinerary-doc/photos-missing.md com o que ficou sem foto e o motivo.
- [X] T034 [P] Acessibilidade em tests/e2e/us-companion-a11y.spec.ts: incluir `/?agora=2026-11-09T12:30#/` e `#/dia/2026-11-09` nas verificações de contraste ≥ 7:1, alvos ≥ 44/48 px e rolagem lateral a 390 px.
- [X] T035 [P] Atualizar README.md com a seção "Atualizar o roteiro de Orlando" (exportar o doc, substituir content/full/orlando/roteiro.md sem editar e rodar `npm run content:strict`) e com as decisões Q1/Q2 da 007.
- [X] T036 Rodar o CI completo: `npm run typecheck && npm test && npm run content:strict && npm run build && npm run budget && npm run e2e`.
  - Conferir conteúdo ≤ 40 MB e JS inicial < 100 KB.
  - Conferir que o snapshot de NY não foi atualizado (`git diff --stat tests/unit/__snapshots__` vazio desde T002).
  - Rodar os cenários de quickstart.md.
  - Marcar os itens no tasks.md.
- [X] T037 Com autorização do usuário, commitar a feature 007. Sem autorização, só informar que está pronta para commit. — commits feitos em 24/10/2026, na branch `007-orlando-itinerary-doc` (um commit de specs por feature e um de implementação para 003–007)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (T001–T003)**: T002 MUST vir antes de qualquer mudança em scripts/nyc-doc-parser.ts.
- **Foundational (T004–T013)**: depende do Setup e bloqueia todas as stories. A ordem é T004 → T005 →
  T006 → (T007 ∥ T013) → T008 → T009 → T010 → T011. T012 pode rodar a qualquer momento.
- **US1 (T014–T019)**: depende da fase 2.
- **US2 (T020–T022)**: depende da fase 2. Pode correr junto com US1, mas T021 toca componentes
  vizinhos dos de T017, então fazer T017 primeiro evita conflito em src/styles/base.css.
- **US3 (T023–T030)**: depende da fase 2; independe de US1/US2.
- **Fotos e polimento (T031–T037)**: T031 → T032 → T033. T034 e T035 são livres. T036 vem depois de
  tudo, e T037 por último, com autorização.

### Within Each User Story

Primeiro os testes, que devem falhar, e depois a implementação. Os E2E vêm no fim da story.

### Parallel Opportunities

- T003 ∥ T002.
- T007 ∥ T013 (arquivos de teste diferentes).
- T012 ∥ qualquer tarefa da fase 2.
- US1: T014 ∥ T015.
- US3: T023 ∥ T024 ∥ T025.
- Polimento: T034 ∥ T035.

## Parallel Example: User Story 3

```text
Task: "T023 Testes de ReserveToday em tests/components/reserve-today.test.tsx"
Task: "T024 Testes de TransitionBlocks/TripOverview em tests/components/trip-overview.test.tsx"
Task: "T025 Teste de FullDocument por cidade em tests/components/full-document.test.tsx"
```

## Implementation Strategy

### MVP First (User Story 1)

1. Setup, com o snapshot de NY antes de tudo.
2. Foundational: Orlando gerado pelo build e conferido D1–D6.
3. US1: dias de parque em "Agora" e "Dia". Validar em 08 e 09/11.

### Incremental Delivery

1. US1 → dias de parque (MVP, cobre 7 dos 12 dias).
2. US2 → dias de folga e "Por perto".
3. US3 → reservas (06/11 é o primeiro prazo), chegada, partida e documentos.
4. Fotos (Q2) e polimento.

**Prazo**: o Multi Pass do Hollywood Studios é comprado em 06/11. US3, ou pelo menos T026, precisa
estar no aparelho antes disso. A viagem começa em 31/10.

## Notes

- Não editar content/full/orlando/roteiro.md; toda decisão fica em meta.json (Q1 → `departure`).
- Não inventar dados: o doc não traz o hotel em Orlando nem estação ou horário do trem, e o app não
  os mostra.
- Nunca atualizar o snapshot de NY para fazer um teste passar.
