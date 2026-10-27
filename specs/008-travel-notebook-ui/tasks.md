---

description: "Task list for feature 008 — Visual e estrutura de caderno de viagem, com muitas fotos"
---

# Tasks: Visual e estrutura de "caderno de viagem", com muitas fotos

**Input**: Design documents from `/specs/008-travel-notebook-ui/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/screens.md,
contracts/tips-content.md, quickstart.md, design-reference/

**Tests**: Incluídos (constituição, Princípio II): domínio (`notebook.ts`), dicas e D7, termos do
design (SC-002), cobertura de fotos (SC-003), componentes por story e E2E com offline e
acessibilidade nos 3 temas.

**Organization**: por user story (US1–US4 da spec).

**Ambiente**:
- `export PATH=/opt/homebrew/opt/node@24/bin:$PATH`.
- O sed do macOS não aceita `\|`; para substituições múltiplas, use python.
- A Wikimedia limita requisições: use pausas e só baixe o que for necessário.

**Regras que valem para todas as tarefas**:
- Nenhum texto do design no app (FR-008). Os termos proibidos estão em SC-002.
- Nenhum dado inventado nas abas Dicas e Transporte (FR-007, D7).
- Foto só do próprio lugar, com crédito (FR-013).
- Contraste ≥ 7:1 no essencial, alvos ≥ 48 px (44 px nos chips), sem rolagem lateral a 390 px e
  letra base ≥ 17 px (FR-014).
- Nunca atualizar o snapshot de NY (`tests/unit/__snapshots__/nyc-snapshot.test.ts.snap`).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência pendente)
- **[Story]**: US1–US4

---

## Phase 1: Setup

- [X] T001 Com autorização do usuário, criar a branch `008-travel-notebook-ui` a partir de `007-orlando-itinerary-doc` e commitar as specs da 008. Antes, confirmar `npm run typecheck && npm test && npm run content:strict` verdes. Sem autorização, seguir na branch atual e registrar a pendência no relatório final.
- [X] T002 [P] Baixar uma vez as fontes do design em WOFF2, recorte latino, do Google Fonts (CSS2 API → arquivos `fonts.gstatic.com`): Fraunces 600 → `public/fonts/fraunces-600.woff2`; Inter 400 → `public/fonts/inter-400.woff2`; Inter 600 → `public/fonts/inter-600.woff2`. Salvar a licença em `public/fonts/OFL.txt`. Conferir que cada arquivo tem menos de 60 KB e registrar origem e licença em `public/fonts/README.md`.
- [X] T003 [P] Adicionar `country` às 3 cidades de `content/trip.json` (valor "Estados Unidos") e torná-lo obrigatório em `scripts/content-schema.ts`, com teste em `tests/content/content-rules.test.ts`. Ajustar `tests/fixtures/content.ts` e o tipo `City` em `src/content/types.ts`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**⚠️ CRITICAL**: nenhuma user story começa antes desta fase.

- [X] T004 Reescrever os tokens e a base de `src/styles/base.css` conforme research.md R2:
  - **fontes**: `@font-face` para as 3 fontes, com `font-display: swap`;
  - **tokens claros**: `--paper #faf8f5`, `--card #fffdfa`, `--ink #241d19`, `--muted #5b4f47`, `--accent #a3401f`, `--tip-bg #f4ece3`, `--ok #2f6b3a`;
  - **degradês por cidade** (`--cover-nova-york`, `--cover-orlando`, `--cover-miami`);
  - **tipografia**: títulos em Fraunces 600, texto em Inter com base de 17 px, rótulos em caixa alta com `letter-spacing`;
  - **temas**: versão escura em `@media (prefers-color-scheme: dark)`, `[data-contrast='high']` com branco e preto puros e véu mais forte;
  - **compatibilidade**: manter as classes que as telas atuais ainda usam até a fase de polimento.

  Confirmar no build que as fontes entram no precache, ajustando `globPatterns` em `vite.config.ts` se for preciso.
- [X] T005 [P] Acrescentar a `src/components/Icon.tsx` os ícones em traço do design, no mesmo estilo dos que já existem: `lightbulb`, `train`, `route`, `wallet`, `sun`, `phone`, `queue`, `sparkle`, `check-small`. Ícone sem uso é removido no polimento.
- [X] T006 [P] Criar os componentes de base do design, cada um com teste em `tests/components/notebook-base.test.tsx`:
  - **`src/components/Cover.tsx`**:
    - foto com `object-fit: cover`, véu linear escuro (15%→75%) e conteúdo em branco;
    - sem foto, degradê da cidade com o ícone em traço;
    - `loading="lazy"` quando `lazy`;
    - crédito da foto acessível (`title` / link para créditos);
  - **`src/components/ProgressRing.tsx`**: anel com `role="progressbar"`, `aria-valuenow` e rótulo; tamanho compacto (cabeçalho) e grande (capa);
  - **`src/components/Chip.tsx`**: variantes `accent` (caixa alta), `type` (cor por categoria), `pace` e `tag`; alvo ≥ 44 px quando clicável;
  - **`src/components/PillTabs.tsx`**: abas em pílula roláveis, com `role="tablist"` e links reais (a aba fica no endereço);
  - **`src/components/SectionTitle.tsx`**: ícone em quadrado arredondado, título serifado e linha de apoio;
  - **`src/components/PageHeader.tsx`**: voltar redondo, rótulo pequeno, título serifado e anel compacto.
- [X] T007 Criar `src/domain/notebook.ts` com os modelos de data-model.md, como funções puras sobre `dayView`/`destinationView`/`dayKind`:
  - `tripCover(content, state, today)`;
  - `cityCard(content, state, cityId)` (serve também para a capa);
  - `dayCard(content, state, date)` (serve também para a capa);
  - `stopThumb(step)`;
  - `neighborhoods(content, state, cityId)`;
  - `transportView(content)`.

  Regras de foto (research R3):
  - **cidade**: `heroPointId`;
  - **dia**: 1ª região com foto, depois 1º passo com foto, depois a cidade;
  - **parada**: lugar, depois ponto, senão `undefined`. A cidade nunca empresta foto a uma parada.

  `people` = 2 quando `travelers` é "Casal". `nights` = depart − arrive. `roadmapDays` exclui os dias `transit`.
- [X] T008 [P] Testes em `tests/unit/notebook.test.ts` com o conteúdo real (`assembleContent`):
  - `tripCover` em 2026-10-27 → `daysLeft` 4, `people` 2, período de 31/10 a 21/11 e 3 cidades;
  - `cityCard('nova-york')` → `nights` 7, `roadmapDays` 7, foto do Central Park e frase igual ao `summary` do ponto de destaque;
  - `cityCard('orlando')` → `nights` 11;
  - `dayCard('2026-11-01')` → foto de SoHo e "DIA 2";
  - `dayCard('2026-11-07')` → rota "Nova York → Orlando";
  - `stopThumb` de um passo sem foto → `undefined`, nunca a foto da cidade;
  - `neighborhoods('orlando')` → regiões `bairro` na ordem dos dias;
  - `transportView` → `between` com 07/11, 18/11 e 21/11.
- [X] T009 Extrair as dicas dos docs em `scripts/doc-parser.ts` conforme `contracts/tips-content.md`:
  - `tips: Tip[]` no `ParsedDoc`, com:
    - `id` `tip:<cidade>:<n>`;
    - `category` ∈ `'clima' | 'dinheiro' | 'reservas' | 'transporte' | 'apps' | 'filas' | 'outros'`;
    - `title` sem emoji inicial;
    - `html` do doc sem reescrita;
    - `source` com o título da seção `##`;
  - **regra D7** em `checkFidelity`: o texto sem marcação de cada dica existe na seção de origem.

  Acrescentar `tips` aos tipos (`src/content/types.ts`), ao schema (`scripts/full-itinerary-schema.ts`) e a `scripts/build-content.ts`, passando o `cityId` ao leitor. A saída de NY do snapshot não pode mudar: as dicas ficam fora do objeto do snapshot, ou só são geradas quando a opção `tipsCityId` vem.
- [X] T010 [P] Testes:
  - em `tests/unit/doc-parser.test.ts`: fixtures das duas formas (NY por `###`; Orlando por itens `**Rótulo:**`), a categoria por palavra-chave e o D7 acusando uma dica alterada;
  - em `tests/content/tips-real.test.ts`: NY com 6 dicas e Orlando com 7 (as categorias de `contracts/tips-content.md`), nenhuma dica com "voo internacional", e cada `html` sem marcação contido na seção do `roteiro.md`.
- [X] T011 Reestruturar as rotas em `src/app.tsx` e a barra em `src/components/TabBar.tsx` conforme `contracts/screens.md`:
  - **barra**: Início (`#/`), Dicas (`#/dicas`), Transporte (`#/transporte`). Início ativo em `/`, `/cidade`, `/dia`, `/perto`, `/guia`, `/ponto`, `/full`, `/creditos`, `/favoritos` e `/roteiros`. A barra some em `/motorista`;
  - **rotas novas**: `/cidade/:cityId`, `/cidade/:cityId/:aba`, `/dicas`, `/transporte`, `/guia/:cityId`. Até as telas existirem, cada uma aponta para um esqueleto com `PageHeader`;
  - **redirecionamentos** em `redirectFor`: `#/viagem` → `#/`; `#/dia` → hoje ou o 1º dia; `#/perto` → região atual de hoje, ou `#/` fora da viagem;
  - **guia**: os links internos que levavam a `#/cidade/:id` (`src/pages/Home.tsx`, `PointDetail.tsx`, `Day.tsx`, `Nearby.tsx`) passam para `#/guia/:id`.

  Testes em `tests/unit/router-redirects.test.ts`.
- [X] T012 [P] Teste dos termos do design em `tests/content/design-terms.test.ts` (SC-002): nenhum de "Lisboa", "Coimbra", "Sintra", "Portugal", "Caderno de Viagem" e "fado" (sem distinguir caixa) no `content.json` gerado nem nos arquivos de `src/`.

**Checkpoint**: `npm run typecheck && npm test && npm run content:strict` verdes; o snapshot de NY
continua igual; a navegação nova existe, com esqueletos.

---

## Phase 3: User Story 1 - Dia com capa, "Sobre este dia" e paradas com fotos (Priority: P1) 🎯 MVP

**Goal**: a página do dia do design, com:
- a capa com foto;
- "Sobre este dia" (resumo, avisos, como circular, regiões);
- as paradas em cartões com miniatura e círculo de marcar, expansíveis;
- a marca "agora";
- os dias de locomoção em caixas.

**Independent Test**: 01/11 às 13h30 e 09/11 com `?agora=`, comparados com
`design-reference/04-dia.jpg`, conferindo cada passo e a foto.

### Tests for User Story 1

- [X] T013 [P] [US1] Testes em `tests/components/day.test.tsx`, reescrito para a nova página e com o conteúdo real de `setupReal`:
  - **01/11 13h30**:
    - a capa tem a foto de SoHo, "DOMINGO, 01/11", "DIA 2" e o título;
    - "Sobre este dia" tem o resumo e "2 avisos";
    - "agora · 13h30" aparece antes do cartão de Mott Street;
  - **cartões**: cada parada marcável é um cartão com miniatura (`img` quando houver foto), horário, nome, chip de tipo e o círculo (`role="checkbox"`);
  - **intervalos e deslocamentos**: como linhas sem checkbox;
  - **09/11**: Tower of Terror mostra "~5 min" e "Multi Pass"; o almoço é uma linha;
  - **expandir**: mostra o resumo e os links Detalhes (`#/dia/…/<id>`), Motorista e "Ver onde comer perto" (`#/perto/<data>/<área>`);
  - **07/11**: os três blocos em caixas, com a rota na capa.
- [X] T014 [P] [US1] Atualizar `tests/components/orlando-day.test.tsx` às novas classes e estrutura, mantendo os mesmos fatos:
  - a ordem do Epic Universe;
  - 13/11 com KSC → deslocamento → Cocoa Beach → volta → Disney Springs;
  - 11/11 com compras marcáveis e a nota;
  - o almoço sem checkbox.

### Implementation for User Story 1

- [X] T015 [P] [US1] Criar `src/components/StopCard.tsx` (contrato "Paradas do dia"). O cartão tem:
  - miniatura de 72 px com foto (`stopThumb`) ou quadro com o ícone do tipo;
  - horário (`TimeCell`);
  - nome serifado com até 2 linhas;
  - chip de tipo;
  - duração ou intervalo;
  - linha `stepSub` (área, fila, Multi Pass, opcional);
  - o `DoneToggle` à direita;
  - o botão de expandir (`aria-expanded`). Expandido, mostra o resumo e as ações Detalhes, Motorista (só com endereço) e "Ver onde comer perto" (só com região que tem opções).

  Os intervalos e deslocamentos continuam pelos ramos `free`/`transit` de `TimelineRow`, restilizados como linhas discretas.
- [X] T016 [US1] Reescrever `src/pages/Day.tsx` conforme o contrato "Dia":
  - `PageHeader` (voltar para `#/cidade/<cidade>`);
  - `Cover` com `dayCard`;
  - seção "Sobre este dia": resumo, `DayAlerts` em modo lista com "Entendi", "Como circular hoje" (passos `transit` com `how`, os `transfer` das regiões e o link "Mapa do dia") e as regiões em `Chip` com link para o bairro;
  - seção "Paradas do dia" com `StopCard`s, a marca "agora" (`nowIndex`) e as linhas de intervalo e deslocamento;
  - nos dias de locomoção, `TransitionBlocks` restilizado e `ReserveToday` acima.

  Manter deslizar, anterior/seguinte, "Voltar para hoje" e o `UndoToast` (`useMarkWithUndo`) ao marcar no círculo.
- [X] T017 [US1] Restilizar `src/components/TransitionBlocks.tsx`, `src/components/DayAlerts.tsx` e `src/components/TimelineRow.tsx` (linhas discretas) com as caixas do design: fundo `--tip-bg`, borda à esquerda no acento e listas com "✓" para itens feitos. Sem mudar o texto nem o comportamento.
- [X] T018 [US1] Restilizar `src/pages/StepDetail.tsx`:
  - `Cover` com a foto do passo e o crédito;
  - título serifado;
  - caixas no estilo do design para horário, fila, como entrar, como chegar e ingresso;
  - `LinkButtons` e Motorista mantidos.

  Conferir `tests/components/step-detail.test.tsx` e ajustá-lo só às classes novas.
- [X] T019 [US1] E2E em `tests/e2e/us-notebook.spec.ts` (US1), com `openInstalled` e `?agora=`:
  - **01/11 13h30, offline (`goOffline`)**: a capa tem foto e as paradas têm miniaturas;
  - **círculo de Mott Street**: marca → o contador da capa sobe → "Desfazer" volta;
  - **09/11**: Tower of Terror com "Multi Pass";
  - **07/11**: os três blocos;
  - **deslizar**: troca o dia.

  Adaptar os casos de dia de `tests/e2e/us-companion.spec.ts` e `tests/e2e/us-orlando.spec.ts` às novas classes, sem perder fatos.

**Checkpoint**: a página do dia está completa e testável sozinha (acesso direto por `#/dia/<data>`).

---

## Phase 4: User Story 2 - Início com "Agora", capa da viagem e cartões de cidade (Priority: P1)

**Goal**: a primeira tela do design com a capa da viagem, mais o cartão "Agora" sem toque durante a
viagem, "Reservar hoje", Destinos, Destaques e Consulta.

**Independent Test**: 27/10, 01/11 13h30 e 07/11 9h, comparados com
`design-reference/01-inicio.jpg`.

### Tests for User Story 2

- [X] T020 [P] [US2] Testes em `tests/components/start.test.tsx` (substitui `now.test.tsx` e a parte "Viagem" de `trip-overview.test.tsx`; os fatos dos dois arquivos continuam cobertos):
  - **27/10**:
    - a capa tem "FALTAM 4 DIAS", "2 PESSOAS", "31/10 a 21/11", "3 cidades" e o anel;
    - não há "Agora";
    - os ingressos aparecem em Destaques;
  - **01/11 13h30**:
    - "Agora" mostra Mott Street 13h40 com foto, como chegar, Feito/Pular, Motorista e "Abrir o dia";
    - Feito avança para Doyers Street, e Desfazer volta;
    - o aviso do dia aparece como banner com "Entendi";
  - **06/11**: "Reservar hoje" com o Multi Pass do Hollywood Studios;
  - **07/11**: "Agora" mostra o 1º item pendente dos blocos e "Reservar hoje" com o EPCOT;
  - **Destinos**: 3 cartões na ordem, cada um com foto, país, noites, datas, dias de roteiro, contador e "Ver roteiro ›" para `#/cidade/<id>`;
  - **Consulta**: "Documento de Nova York", "Documento de Orlando", "Guia de pontos" (`#/guia`), "Créditos das fotos" e o alto contraste, que persiste;
  - **viagem concluída** (22/11): o resumo do progresso aparece.

### Implementation for User Story 2

- [X] T021 [P] [US2] Criar `src/components/CityCard.tsx`:
  - cabeçalho `Cover` com a foto da cidade, o país, a etiqueta "n NOITES" e o nome;
  - corpo com as datas e os dias de roteiro (ícone de calendário), a frase (2 linhas), o contador "feitos de total" com barra e o link "Ver roteiro ›".
- [X] T022 [US2] Restilizar `src/components/NextStepCard.tsx` como o cartão "Agora" do design:
  - foto grande com `Cover`;
  - horário e nome serifado;
  - a região e a linha de fila/acesso;
  - "como chegar" recolhível;
  - os botões Feito (primário, no acento), Pular, Motorista e Detalhes, mais o link "Abrir o dia ›".

  Manter as mesmas props e os mesmos `aria-label`, de que os testes dependem.
- [X] T023 [US2] Criar `src/pages/Start.tsx` (Início) conforme o contrato:
  - cabeçalho;
  - `Cover` da viagem (`tripCover`), compacta durante a viagem;
  - durante a viagem:
    - nos dias normais: "Agora" (lógica de `Now.tsx`: `nextStep`, `howToGet`, `currentArea`, a faixa "Ver onde comer" no intervalo livre, "Dia concluído" com "Ver amanhã") e `DayAlerts` em banner;
    - nos dias de locomoção: o 1º item pendente de `departures`/`arrivals` com o `DoneToggle` e "Abrir o dia";
  - `ReserveToday`;
  - `SectionTitle` "Destinos" com `CityCard`s;
  - "Destaques" (compromissos comprados e itens com `forDate`, agrupados por cidade, com o link para a regra);
  - "Consulta" (documentos, guia, créditos, alto contraste);
  - **depois da viagem**: o resumo da viagem.

  Remover `src/pages/Now.tsx` e `src/pages/TripOverview.tsx` depois de migrar tudo.
- [X] T024 [US2] Garantir o FR-016: a 390 × 844, em 01/11 13h30, o cartão "Agora" inteiro fica na 1ª tela, com a capa compacta. Ajustar `src/styles/base.css`.
- [X] T025 [US2] E2E em `tests/e2e/us-notebook.spec.ts` (US2):
  - 27/10 com a capa e os Destinos;
  - 01/11 13h30, offline, com "Agora" sem toque e o cartão inteiro no viewport de 390 × 844 (`toBeInViewport({ ratio: 1 })`);
  - Feito e Desfazer;
  - 06/11 com "Reservar hoje".

  Adaptar os casos de "Agora" e "Viagem" de `tests/e2e/us-companion.spec.ts` e `tests/e2e/us-orlando.spec.ts`.

**Checkpoint**: Início e Dia funcionam juntos (MVP do uso na viagem).

---

## Phase 5: User Story 3 - Página da cidade com abas Roteiro, Dicas, Transporte e Bairros (Priority: P2)

**Goal**: a cidade do design com capa, tags e as 4 abas; o bairro como página de região.

**Independent Test**: Nova York e Orlando nas 4 abas e Miami com as abas vazias, comparados com
`design-reference/02-cidade-roteiro.jpg` e `03-cidade-bairros.jpg`.

### Tests for User Story 3

- [X] T026 [P] [US3] Testes em `tests/components/city.test.tsx`:
  - **Nova York**:
    - a capa tem a foto, "ESTADOS UNIDOS", as datas, "7 NOITES", a frase do ponto de destaque, a chegada e a saída, e o anel;
    - as tags incluem "Knicks x Nets" e "MJ The Musical";
    - Roteiro tem 8 cartões de dia: 7 de roteiro mais 07/11 de locomoção;
  - **Orlando**: Bairros mostra os cartões com foto na ordem, e o cartão de Magic Kingdom tem "Comer (5)" e leva a `#/perto/2026-11-08/magic-kingdom`;
  - **abas Dicas e Transporte de NY**: cada cartão vem de `tips` (com a cidade);
  - **Miami**: Roteiro mostra 19 e 20/11 pelos roteiros sugeridos; Dicas, Transporte e Bairros mostram "Sem informações no roteiro desta cidade.";
  - **endereço**: a aba fica no endereço (`#/cidade/orlando/bairros`).
- [X] T027 [P] [US3] Atualizar `tests/components/nearby.test.tsx` à página do bairro:
  - a capa tem foto, "BAIRRO" e o nome;
  - as tags com contagem e o filtro 🍰;
  - as opções com miniatura;
  - o detalhe com mapa e motorista;
  - as notas na caixa de dica.

### Implementation for User Story 3

- [X] T028 [P] [US3] Criar `src/components/DayCard.tsx`:
  - cabeçalho `Cover` com a foto do dia, o rótulo da data, o título (2 linhas) e a etiqueta "DIA n";
  - corpo com o chip do tipo de dia (a pé, parque, praia, viagem), "n paradas", o resumo (2 linhas), o contador com barra e "Abrir dia ›".
- [X] T029 [P] [US3] Criar `src/components/NeighborhoodCard.tsx`:
  - cabeçalho `Cover` com a foto da região, o rótulo "BAIRRO", o nome e a data;
  - corpo com a frase (`intro`), as tags com contagem (Comer, Doces, Lojas, Locações) e um link para `#/perto/<data>/<área>`.
- [X] T030 [P] [US3] Criar `src/components/TipCard.tsx`:
  - ícone da categoria num quadrado, o chip da categoria e o chip da cidade;
  - o título serifado e o HTML do doc em `.doc-html`, com listas estilizadas com "✓" e tabelas roláveis.
- [X] T031 [US3] Criar `src/pages/City.tsx` conforme o contrato "Cidade": `PageHeader`, `Cover` grande (`cityCard`), as tags, `PillTabs`, e as abas:
  - **Roteiro**: `DayCard` de todas as datas da cidade, incluindo as de locomoção;
  - **Dicas**: `TipCard`s da cidade, ou o texto de vazio;
  - **Transporte**: "Na cidade" com dicas `transporte`, a área `chegada` e os dias de locomoção da cidade, ou o texto de vazio;
  - **Bairros**: `NeighborhoodCard`s, ou o texto de vazio.
- [X] T032 [US3] Restilizar `src/pages/Nearby.tsx` como página do bairro:
  - `Cover` com a foto da região;
  - "BAIRRO" e o nome;
  - a frase;
  - as tags e filtros (`Chip`);
  - as opções com miniatura (`PlaceCard` short com foto);
  - as notas em caixa de dica;
  - o detalhe da opção como hoje.

  Ajustar `src/components/PlaceCard.tsx` ao estilo de cartão do design.
- [X] T033 [US3] E2E em `tests/e2e/us-notebook.spec.ts` (US3):
  - Início → cartão de Orlando → aba Bairros → Magic Kingdom → "Comer (5)" → Casey's Corner, offline;
  - Nova York → aba Roteiro → "Abrir dia ›" de 01/11.

**Checkpoint**: Início → Cidade → Dia → Bairro navegável, como no design.

---

## Phase 6: User Story 4 - Abas Dicas e Transporte da viagem (Priority: P3)

**Goal**: as abas de baixo com as dicas por categoria e o transporte entre e dentro das cidades,
tudo dos docs.

**Independent Test**: `#/dicas` e `#/transporte` comparados com `05-dicas.jpg` e
`06-transporte.jpg`. Cada cartão tem origem num doc ou nos dados da viagem.

### Tests for User Story 4

- [X] T034 [P] [US4] Testes em `tests/components/tips-transport.test.tsx`:
  - **Dicas**:
    - as seções seguem a ordem das categorias (`reservas`, `transporte`, `clima`, `dinheiro`, `apps`, `filas`, `outros`), e só aparecem as que têm dicas;
    - cada cartão tem o chip da cidade;
    - as gorjetas de NY e de Orlando aparecem separadas, com o texto do doc;
  - **Transporte**:
    - "Entre as cidades" tem 3 cartões:
      - 07/11 "Nova York → Orlando", com os itens da partida de NY e da chegada a Orlando, marcáveis;
      - 18/11 "Orlando → Miami", com "De trem para Miami";
      - 21/11 "Fim da viagem";
    - "Na cidade" tem "Metrô e ônibus (OMNY)" de NY e "Estacionamento" de Orlando;
    - não aparece "voo internacional".

### Implementation for User Story 4

- [X] T035 [US4] Criar `src/pages/Tips.tsx` (`#/dicas`) com `Cover` (rótulo "Dicas"), seções por categoria (`SectionTitle` com ícone e rótulo em caixa alta) e `TipCard`s de todas as cidades.
- [X] T036 [US4] Criar `src/pages/Transport.tsx` (`#/transporte`) com:
  - `Cover` (rótulo "Transporte");
  - "Entre as cidades": um cartão por item de `transportView().between`, com uma tabela curta (rota e data em rótulo de caixa alta + valor), os itens marcáveis (mesmo componente `Items` de `TransitionBlocks`) e o link "Abrir o dia";
  - "Na cidade": `TipCard`s de categoria `transporte` e a chegada (área `chegada` do 1º dia, com link para o dia).
- [X] T037 [US4] E2E em `tests/e2e/us-notebook.spec.ts` (US4): `#/dicas` e `#/transporte` offline, com as contagens de T034, e marcar e desmarcar um item de 07/11 em Transporte, com a mesma marca vista no dia 07/11.

**Checkpoint**: todas as user stories funcionam.

---

## Phase 7: Polimento e telas restantes

- [X] T038 Restilizar as telas restantes com os componentes e tokens do design, sem mudar o comportamento:
  - `src/pages/Driver.tsx` (manter tela cheia, alto contraste e endereço ≥ 40 px);
  - `src/pages/Home.tsx` (guia: renomear para `src/pages/Guide.tsx`; rota `#/guia/:cityId`);
  - `src/pages/PointDetail.tsx`, `src/pages/FullDocument.tsx`, `src/pages/Credits.tsx`, `src/pages/Favorites.tsx`, `src/pages/Itineraries.tsx`, `src/pages/ItineraryDetail.tsx`;
  - `src/components/PointCard.tsx`, `src/components/OfflineBanner.tsx`, `src/components/UndoToast.tsx`.

  Ajustar os testes de componente que dependem só de classes.
- [X] T039 Limpar `src/styles/base.css`: remover as classes que nenhuma tela usa mais (por exemplo, `.tab-bar` antiga, `.now-*` e `.trip-overview`), verificando com `grep` em `src/`. Remover também os ícones e componentes sem uso (`Now`, `TripOverview` e o que sobrar). Rodar `npm run typecheck`.
- [X] T040 [P] Teste de cobertura de fotos nos cartões em `tests/content/notebook-photos.test.ts` (SC-003):
  - com `stopThumb`, ≥ 90% das paradas marcáveis de NY e de Orlando têm miniatura com foto;
  - com `cityCard`, `dayCard` e `neighborhoods`, ≥ 90% das capas e cartões de cidade, dia e bairro de NY e Orlando têm foto.

  Se ficar abaixo, listar o que falta em `specs/008-travel-notebook-ui/photos-missing.md` e, só se necessário, buscar fotos com `npm run photos -- --doc --city <cidade>`, com pausas.
- [X] T041 [P] Acessibilidade em `tests/e2e/us-notebook-a11y.spec.ts`, nos temas claro, escuro e alto contraste:
  - **telas**: Início (antes e durante), Cidade (as 4 abas de NY), Dia (01/11 e 09/11), Bairro, Dicas, Transporte, Detalhe e Motorista;
  - **contraste ≥ 7:1** em horário, nome, títulos e texto sobre `Cover`, medido contra o véu;
  - **alvos** ≥ 48 px (44 px nos chips);
  - **sem rolagem lateral** a 390 px.

  Substituir os casos equivalentes de `tests/e2e/us-companion-a11y.spec.ts`.
- [X] T042 [P] Atualizar `README.md`: a seção "Como o app se usa na viagem" passa a descrever Início, Cidade, Dia, Bairro, Dicas, Transporte, as fontes offline (origem e licença) e a regra D7 das dicas.
- [X] T043 Rodar o CI completo: `npm run typecheck && npm test && npm run content:strict && npm run build && npm run budget && npm run e2e`.
  - Conferir o JS inicial < 100 KB e o conteúdo ≤ 40 MB.
  - Conferir o snapshot de NY intacto e o SC-002 sem termos do design.
  - Fazer a revisão lado a lado de `quickstart.md`, gerando capturas a 390 × 844 das telas novas em `specs/008-travel-notebook-ui/screens/` para o casal comparar com `design-reference/`.
  - Marcar os itens no tasks.md.
- [X] T044 Com autorização do usuário, commitar a feature 008. Sem autorização, só informar que está pronta para commit.

---

## Dependencies & Execution Order

- **Setup (T001–T003)**: T002 e T003 em paralelo.
- **Foundational (T004–T012)**: depende do Setup e bloqueia as stories. Ordem:
  - T004 → (T005 ∥ T006 ∥ T007) → T008;
  - T009 → T010;
  - T011;
  - T012 é livre.
- **US1 (T013–T019)**: depende da fase 2.
- **US2 (T020–T025)**: depende da fase 2. O cartão "Agora" (T022) usa a `Cover`, e o Início liga ao Dia (US1), mas é testável sozinho.
- **US3 (T026–T033)**: depende da fase 2. Os cartões de dia levam ao Dia (US1); as abas Dicas e Transporte usam as `tips` (T009).
- **US4 (T034–T037)**: depende da fase 2 (T009) e de `TipCard` (T030). Fazer T030 antes, ou mover T030 para cá se US3 ainda não tiver começado.
- **Polimento (T038–T044)**: T038 → T039. T040, T041 e T042 em paralelo. T043 vem depois de tudo, e T044 por último, com autorização.

### Parallel Opportunities

- T002 ∥ T003.
- T005 ∥ T006 ∥ T007.
- T008 ∥ T010 ∥ T012.
- US1: T013 ∥ T014 ∥ T015.
- US2: T020 ∥ T021.
- US3: T026 ∥ T027 ∥ T028 ∥ T029 ∥ T030.
- Polimento: T040 ∥ T041 ∥ T042.

## Parallel Example: User Story 3

```text
Task: "T028 DayCard em src/components/DayCard.tsx"
Task: "T029 NeighborhoodCard em src/components/NeighborhoodCard.tsx"
Task: "T030 TipCard em src/components/TipCard.tsx"
Task: "T026 Testes da cidade em tests/components/city.test.tsx"
```

## Implementation Strategy

### MVP First (US1 + US2)

1. Setup e Foundational: tokens, fontes, componentes de base, `notebook.ts`, dicas e rotas.
2. US1: a página do Dia. Validar 01/11 e 09/11.
3. US2: o Início com "Agora". Validar 27/10, 01/11 e 07/11.

**Prazo**: o embarque é em 31/10. Se o tempo apertar, US1 e US2 vão para o celular primeiro (é o uso
na viagem), e US3, US4 e o polimento vêm em seguida. As telas antigas continuam acessíveis pelos
endereços até serem trocadas.

### Incremental Delivery

1. Dia (US1).
2. Início (US2).
3. Cidade e Bairro (US3).
4. Dicas e Transporte (US4).
5. Telas restantes e polimento.

## Notes

- O design é só referência visual; nada do texto dele entra no app.
- Fotos: só do próprio lugar, com crédito. Sem foto, degradê com ícone.
- Nenhum texto novo em Dicas e Transporte: tudo passa pela regra D7.
