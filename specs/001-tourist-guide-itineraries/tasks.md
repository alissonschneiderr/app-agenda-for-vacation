---

description: "Task list for feature 001 — Guia de Pontos Turísticos e Roteiros Salvos"
---

# Tasks: Guia de Pontos Turísticos e Roteiros Salvos

**Input**: Design documents from `/specs/001-tourist-guide-itineraries/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Incluídos. A constituição (Princípio II) exige testes automatizados por user story,
testes unitários de domínio/armazenamento e ao menos um teste sem rede por fluxo offline. TDD
estrito não é exigido; os testes de cada story devem estar verdes antes de concluir a story.

**Organization**: Tarefas agrupadas por user story. Prazo: tudo pronto e instalado até 30/10/2026.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: US1, US2, US3 conforme spec.md
- Caminhos relativos à raiz do repositório (projeto único, ver plan.md)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inicializar o projeto, ferramentas, CI e deploy

- [X] T001 Fazer o commit inicial do scaffold (`.specify/`, `.claude/`, `specs/`) em `main` e criar a branch `001-tourist-guide-itineraries` (requer autorização do usuário; ver Notes); adicionar `.gitignore` com `node_modules/`, `dist/`, `test-results/`, `playwright-report/`, `public/data/` em .gitignore — Commit inicial em `main` (0eb9dc7) e branch `001-tourist-guide-itineraries` criados em 20/10.
- [X] T002 Criar package.json (`"type": "module"`, `"private": true`, Node 24) com scripts `dev`, `build` (`npm run content && vite build`), `preview`, `typecheck` (`tsc --noEmit`), `test` (`vitest run`), `e2e` (`playwright test`), `content` (`tsx scripts/build-content.ts`), `photos` (`tsx scripts/fetch-photos.ts`) em package.json
- [X] T003 Instalar dependências de runtime `preact`, `preact-iso`, `leaflet` e de desenvolvimento `vite`, `@preact/preset-vite`, `vite-plugin-pwa`, `typescript`, `@types/leaflet`, `vitest`, `jsdom`, `@testing-library/preact`, `@playwright/test`, `zod`, `sharp`, `tsx` (nenhuma outra sem justificativa em research.md R2) em package.json — *Na implementação*: `preact-iso` substituído por roteador por hash próprio (ver research.md R2); adicionados `@types/node`.
- [X] T004 [P] Criar tsconfig.json com `strict: true`, `jsx: "react-jsx"`, `jsxImportSource: "preact"`, `moduleResolution: "bundler"`, incluindo `src`, `tests`, `scripts`
- [X] T005 [P] Criar vitest.config.ts com ambiente `jsdom` para `tests/unit`, `tests/components`, `tests/content` e preset do Preact
- [X] T006 [P] Criar playwright.config.ts com projetos `chromium` (Pixel 7) e `webkit` (iPhone 14), `webServer` = `npm run build && npm run preview`, `baseURL` do preview, `serviceWorkers: "allow"`, testes em tests/e2e/ — *Na implementação*: só o projeto `chromium`; o iPhone fica para a validação manual (T066), por limitação do Playwright com Service Worker no WebKit.
- [X] T007 [P] Criar index.html (`lang="pt-BR"`, viewport, theme-color), src/main.tsx (monta `<App/>`) e src/styles/base.css mobile-first (tokens de cor, tipografia, layout com barra inferior, área segura do iPhone)
- [X] T008 [P] Criar workflow .github/workflows/ci.yml: em push/PR roda `npm ci`, `typecheck`, `test`, `content`, `build`, `npx playwright install --with-deps chromium webkit`, `e2e`; em push na `main`, publica `dist/` no GitHub Pages (`actions/upload-pages-artifact` + `actions/deploy-pages`); configurar `base` do Vite para o caminho do repositório no Pages

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Tipos de conteúdo, pipeline de conteúdo, regras da viagem, armazenamento do usuário,
PWA e casca do app

**⚠️ CRITICAL**: Nenhuma user story começa antes desta fase

- [X] T009 Definir tipos TypeScript `City`, `TripLeg`, `Category`, `Point`, `WeeklyHours`, `Photo`, `SuggestedItinerary`, `Content` exatamente como data-model.md (ex.: `status: "active" | "temporarily-closed"`, `openingHours` = WeeklyHours | `"24h"` | `"see-official"`, `close` pode ser menor que `open`) em src/content/types.ts
- [X] T010 [P] Definir tipos `UserState` (`schemaVersion: 1`, `seededIds`, `favorites`, `itineraries`), `Favorite`, `Itinerary` (`name` "1–60 caracteres, não vazio após trim"; `date` "se definida, deve estar entre 2026-10-31 e 2026-11-21"; `origin: "suggested" | "user"`; `sourceId` "só se origin = suggested") e `ItineraryItem` conforme contracts/user-storage.md em src/storage/types.ts
- [X] T011 Criar schemas Zod espelhando src/content/types.ts e as regras 1–7 de contracts/content-schema.md ("Regras que fazem o build falhar"), incluindo lista de licenças permitidas (CC0, Public Domain, CC BY, CC BY-SA) e limite de 40 MB, em scripts/content-schema.ts
- [X] T012 [P] Criar content/trip.json com as 3 cidades (`timeZone: "America/New_York"`, `center`) e os trechos NY 2026-10-31→2026-11-07, Orlando 2026-11-07→2026-11-18, Miami 2026-11-18→2026-11-21; e content/categories.json com `museu`, `parque-tematico`, `parque`, `monumento`, `mirante`, `compras`, `praia`, `bairro` (nomes em português)
- [X] T013 Implementar scripts/build-content.ts: lê content/trip.json, content/categories.json, content/points/*.json, content/itineraries.json e metadados de fotos; valida com scripts/content-schema.ts; imprime erros legíveis com o id do ponto/roteiro e sai com código 1; grava public/data/content.json com `version` = timestamp ISO (arquivos ausentes de pontos/roteiros contam como listas vazias até serem criados)
- [X] T014 [P] Escrever testes das regras de conteúdo (cada uma das regras 1–7 com fixture inválida mínima + o conteúdo real em content/ passando) em tests/content/content-rules.test.ts
- [X] T015 [P] Escrever testes unitários de src/domain/trip.ts cobrindo todas as datas de 2026-10-30 a 2026-11-22: dia de passeio vs. locomoção (07/11, 18/11, 21/11), origem/destino, 19 dias de passeio, cidade do dia ("locomoção → destino (21/11 → Miami); fora do período → Nova York"), e "hoje" calculado em America/New_York perto da meia-noite, em tests/unit/trip.test.ts
- [X] T016 Implementar src/domain/trip.ts: `todayInTripZone(now)`, `isTravelDay`, `travelLeg(date)` → {origin, destination|null}, `sightseeingDays()`, `cityForDate(date)` conforme data-model.md
- [X] T017 [P] Escrever testes de src/storage/user-store.ts: estado vazio quando a chave `ctha:user:v1` não existe; JSON corrompido salvo em `ctha:user:corrupt:<timestamp>` e reinício vazio com flag de aviso; `QuotaExceededError` mantém o estado anterior e retorna erro; escrita síncrona a cada `save`; em tests/unit/user-store.test.ts
- [X] T018 Implementar src/storage/user-store.ts (único módulo que acessa `localStorage`): `load()`, `save(state)` síncrono, tratamento de corrupção e quota conforme contracts/user-storage.md, e um hook `useUserState()` que expõe estado + `update(fn)` com rollback em falha
- [X] T019 Implementar src/content/load.ts: busca `data/content.json` (relativo ao `base`), mantém em memória, expõe `useContent()` com estados `loading | ready | unavailable`, e índices `pointsById`, `pointsByCity`
- [X] T020 Configurar vite-plugin-pwa em vite.config.ts: `registerType: "autoUpdate"`, manifest pt-BR (`name`, `short_name`, `display: "standalone"`, `start_url`, ícones 192/512/maskable em public/icons/), `globPatterns` incluindo `**/*.{js,css,html,svg,png,webp,json}`, `maximumFileSizeToCacheInBytes` ≥ 5 MB, runtime cache `StaleWhileRevalidate` para `tile.openstreetmap.org` com expiração 2.000 entradas/30 dias
- [X] T021 [P] Criar ícones da PWA (192, 512, maskable e apple-touch-icon) em public/icons/
- [X] T022 [P] Implementar src/components/OfflineBanner.tsx (escuta `online`/`offline`, mostra "Você está offline." em todas as telas) e o indicador "Guia disponível offline" quando o Service Worker termina o precache, em src/components/OfflineBanner.tsx
- [X] T023 Implementar src/app.tsx: roteamento por hash (`#/`, `#/cidade/:cityId`, `#/ponto/:pointId`, `#/favoritos`, `#/roteiros`, `#/roteiros/:id`, `#/creditos`, conforme contracts/routes.md) com preact-iso e lazy loading por página, barra inferior src/components/BottomNav.tsx (Guia · Favoritos · Roteiros), OfflineBanner, e tela "Conecte-se à internet uma vez para baixar o guia." quando `useContent()` = `unavailable` — *Na implementação*: roteador próprio em src/lib/router.ts, sem lazy loading (bundle inicial de 17 KB gzip).
- [X] T024 Em src/main.tsx, chamar `navigator.storage.persist()` na primeira execução (ignorando ausência da API) e registrar o Service Worker

**Checkpoint**: `npm run typecheck && npm test && npm run build` passam; app vazio abre e instala

---

## Phase 3: User Story 1 - Explorar pontos turísticos (Priority: P1) 🎯 MVP

**Goal**: Guia das 3 cidades em lista e mapa, com filtro, busca, detalhe completo, "como chegar",
créditos das fotos e funcionamento offline.

**Independent Test**: Abrir o app, filtrar por "Museu", abrir um museu e conferir todas as
informações; desligar a rede, recarregar e reabrir o mesmo ponto (quickstart.md, linhas US1).

### Tests for User Story 1

- [X] T025 [P] [US1] Testes unitários de src/domain/opening-hours.ts: aberto/fechado nas bordas (16:59/17:01), horário que cruza meia-noite, `exceptions` por data e `"closed"`, `"24h"`, `"see-official"` → `unknown`, e transição do fim do horário de verão (2026-11-01 01:00–02:00 em America/New_York) independente do fuso do processo (rodar com `TZ=America/Sao_Paulo`), em tests/unit/opening-hours.test.ts
- [X] T026 [P] [US1] Testes unitários de src/domain/search.ts: busca por substring ignorando caixa e acentos ("Museu" ≈ "museu", "Sao" ≈ "São"), filtro por categoria, combinação dos dois, lista vazia, em tests/unit/search.test.ts
- [X] T027 [P] [US1] Testes de componente da Home (cidade padrão por data via relógio falso, troca de cidade, filtro, busca, "Nenhum ponto encontrado." + "Limpar filtros", aviso de dia de locomoção) com conteúdo fixture em tests/components/home.test.tsx
- [X] T028 [P] [US1] Testes de componente do detalhe (todos os campos de FR-003, crédito da foto, aberto/fechado, aviso "Informações verificadas em {data}", recomendação de confirmar no site oficial, "Como chegar" online e offline com "A navegação precisa de internet. Endereço: {endereço}.") em tests/components/point-detail.test.tsx
- [X] T029 [P] [US1] Testes E2E em tests/e2e/us1-guide.spec.ts: relógio em 2026-11-03 → Nova York; 2026-11-07 → Orlando com aviso NY → Orlando; filtro + busca "metropolitan"; carregar online → `context.setOffline(true)` → recarregar → lista, busca, detalhe e foto funcionam e a barra offline aparece

### Implementation for User Story 1

- [X] T030 [P] [US1] Implementar src/domain/opening-hours.ts: `openStatus(point, now)` → `open | closed | unknown` e `todayHoursLabel(point, now)` usando `Intl.DateTimeFormat` com `timeZone` da cidade, sem biblioteca de datas
- [X] T031 [P] [US1] Implementar src/domain/search.ts: `normalize` (NFD + remoção de diacríticos + minúsculas) e `filterPoints(points, {cityId, categoryId?, query?})`, ordenando por nome
- [X] T032 [P] [US1] Implementar src/components/CityPicker.tsx (3 cidades, destaca a cidade do dia) e src/components/CategoryFilter.tsx (chips de categoria com "Todas")
- [X] T033 [P] [US1] Implementar src/components/PointCard.tsx (foto miniatura, nome, categoria, resumo, selo aberto/fechado) e src/components/PointList.tsx (lista + estado vazio com "Limpar filtros")
- [X] T034 [US1] Implementar src/components/PointMap.tsx com Leaflet: tiles OSM com atribuição, marcadores com popup linkando para `#/ponto/:id`, suporte a marcadores numerados (para US3), botão "Minha localização" que só pede permissão ao toque e segue funcionando se negada (FR-006), e mensagem quando tiles não carregam offline
- [X] T035 [US1] Implementar src/pages/Home.tsx para `#/` e `#/cidade/:cityId`: cidade padrão = `cityForDate(todayInTripZone(now))`, faixa "Hoje: dia de locomoção {origem} → {destino}" em dias de locomoção, alternância Lista/Mapa, busca e filtro (depende de T016, T031–T034)
- [X] T036 [P] [US1] Implementar src/components/DirectionsButton.tsx: abre `https://www.google.com/maps/dir/?api=1&destination=<lat>,<lng>` em nova aba; offline mostra "A navegação precisa de internet. Endereço: {endereço}."
- [X] T037 [US1] Implementar src/pages/PointDetail.tsx para `#/ponto/:pointId`: galeria de fotos com crédito (autor, licença com link), nome, cidade, categoria, descrição, endereço, mapa pequeno, horário do dia + status, preço, link do site oficial, "Informações verificadas em {data}" (destacado offline) e "Confirme horário e preço no site oficial antes da visita", DirectionsButton; espaço reservado para os botões de US2/US3; ponto inexistente → mensagem "Ponto não encontrado"
- [X] T038 [P] [US1] Implementar src/pages/Credits.tsx para `#/creditos`: todas as fotos agrupadas por ponto com autor, licença e link de origem, e atribuição do OpenStreetMap; link para créditos no rodapé do detalhe
- [X] T039 [US1] Implementar scripts/fetch-photos.ts: lê content/photos.json (`{ pointId: ["File:..."] }`), consulta a API da Wikimedia Commons (`action=query&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=1200`) com User-Agent identificável, baixa, converte com sharp para WebP 1200 px de largura (qualidade ~75), grava public/photos/<pointId>-<n>.webp e content/photo-credits.json com `author` (sem HTML), `license`, `licenseUrl`, `sourceUrl`; rejeita licenças fora da lista permitida; idempotente (pula arquivos existentes) — *Na implementação*: refs das fotos ficam nos próprios pontos (`photos[].ref`) e os créditos em content/photo-credits.json.
- [X] T040 [P] [US1] Pesquisar e escrever o conteúdo de Nova York (~40–50 pontos cobrindo os 7 dias de passeio, ex.: Midtown, Central Park, museus, Lower Manhattan, Brooklyn, mirantes), em português, com endereço, coordenadas, horário semanal, preço, `officialUrl` e `verifiedAt`, consultando sites oficiais, em content/points/nova-york.json
- [X] T041 [P] [US1] Pesquisar e escrever o conteúdo de Orlando (~35–45 pontos, obrigatoriamente os 7 parques de FR-024 — Magic Kingdom, EPCOT, Hollywood Studios, Animal Kingdom, Universal Studios Florida, Islands of Adventure, Epic Universe — como pontos `parque-tematico` com destaques na descrição, mais Disney Springs, CityWalk, Kennedy Space Center, outlets e outros) em content/points/orlando.json
- [X] T042 [P] [US1] Pesquisar e escrever o conteúdo de Miami (~15–25 pontos, ex.: South Beach, Art Deco District, Wynwood, Little Havana, Vizcaya, Bayside) em content/points/miami.json
- [X] T043 [US1] Selecionar 1–2 fotos com licença livre na Wikimedia Commons para cada ponto de T040–T042 e listar em content/photos.json com `alt` em português nos pontos; rodar `npm run photos` e `npm run content` até passar (SC-008: "100% dos pontos têm ao menos uma foto com crédito, endereço, horário, preço e data de verificação preenchidos"); commitar public/photos/ — 78 pontos (NY 41, Orlando 20, Miami 17), 78 fotos, 14,5 MB.

**Checkpoint**: US1 completa; T025–T029 verdes; app publicado já serve como guia offline

---

## Phase 4: User Story 2 - Salvar pontos favoritos (Priority: P2)

**Goal**: Favoritar/desfavoritar pontos e ver a lista de favoritos, tudo offline e sem perda.

**Independent Test**: Favoritar 3 pontos, desligar a rede, abrir Favoritos e conferir os 3 com
detalhe completo (quickstart.md, linha US2).

### Tests for User Story 2

- [X] T044 [P] [US2] Testes unitários de src/domain/favorites.ts: `toggleFavorite` adiciona com `pointName` snapshot e `savedAt`, remove se já existe, `pointId` "único na lista", `isFavorite`, favorito de ponto ausente do conteúdo marcado como indisponível, em tests/unit/favorites.test.ts
- [X] T045 [P] [US2] Teste de componente da lista de favoritos (lista, estado vazio, selo "indisponível", remover) em tests/components/favorites.test.tsx
- [X] T046 [P] [US2] Testes E2E em tests/e2e/us2-favorites.spec.ts: favoritar 3 pontos offline → recarregar offline → os 3 aparecem em `#/favoritos` com detalhe e foto; desfavoritar remove; favoritos persistem após voltar online

### Implementation for User Story 2

- [X] T047 [P] [US2] Implementar src/domain/favorites.ts (`toggleFavorite`, `isFavorite`, `resolveFavorites(state, content)` → itens com `available: boolean`), funções puras sobre `UserState`
- [X] T048 [US2] Implementar src/components/FavoriteButton.tsx (estado visível favoritado/não favoritado, `aria-pressed`, erro "Não foi possível salvar: armazenamento cheio") usando `useUserState()` e incluí-lo em src/pages/PointDetail.tsx e src/components/PointCard.tsx
- [X] T049 [US2] Implementar src/pages/Favorites.tsx para `#/favoritos`: lista de favoritos com PointCard, ordenada por `savedAt` desc, indisponíveis com `pointName` e selo, botão remover, estado vazio explicando como favoritar

**Checkpoint**: US1 e US2 funcionam de forma independente; T044–T046 verdes

---

## Phase 5: User Story 3 - Montar e usar roteiros (Priority: P3)

**Goal**: Criar, editar, reordenar e consultar roteiros por dia da viagem, com 19 roteiros
sugeridos já incluídos, tudo offline.

**Independent Test**: Criar um roteiro com 4 pontos, reordenar, desligar a rede e percorrer na
ordem; conferir os 19 sugeridos agrupados por dia (quickstart.md, linhas US3).

### Tests for User Story 3

- [X] T050 [P] [US3] Testes unitários de src/domain/itineraries.ts: `create` (nome "1–60 caracteres, não vazio após trim"; data "entre 2026-10-31 e 2026-11-21" ou null), `rename`, `setDate`, `delete`, `addPoint` com erro `DUPLICATE` e aviso `OTHER_CITY` (cidade do ponto ≠ cidade do dia; em locomoção aceita origem e destino; sem data não avisa), `removePoint`, `moveUp`/`moveDown`/`moveToTop` nas bordas, `updatedAt` atualizado, `groupByDate` cronológico com "Sem dia" por último e rótulo de locomoção, em tests/unit/itineraries.test.ts
- [X] T051 [P] [US3] Testes unitários de `seedSuggested`: primeira execução cria 19 roteiros `origin: "suggested"` com `sourceId`; rodar de novo não duplica; roteiro sugerido editado ou excluído não é recriado nem sobrescrito por conteúdo novo; só ids nunca semeados entram; em tests/unit/seed.test.ts
- [X] T052 [P] [US3] Testes de componente das telas de roteiros (agrupamento por dia, criar com nome/dia, confirmar exclusão, reordenar, aviso de outra cidade, "Este ponto já está neste roteiro.") em tests/components/itineraries.test.tsx
- [X] T053 [P] [US3] Testes E2E em tests/e2e/us3-itineraries.spec.ts: primeira abertura mostra 19 sugeridos e nenhum em 07/11, 18/11, 21/11; offline editar um sugerido e recarregar mantém edição; servir `content.json` com `version` nova e reabrir não altera o roteiro editado; adicionar ponto de Miami a roteiro de NY pede confirmação; ponto duplicado é recusado

### Implementation for User Story 3

- [X] T054 [US3] Implementar src/domain/itineraries.ts com todas as operações de data-model.md ("Operações"), puras sobre `UserState`, gerando `id` com `crypto.randomUUID()`
- [X] T055 [US3] Implementar `seedSuggested(content, state)` em src/domain/itineraries.ts conforme research.md R10 e chamá-lo ao carregar o conteúdo em src/storage/user-store.ts (gravando `seededIds` na mesma escrita)
- [X] T056 [US3] Implementar src/pages/Itineraries.tsx para `#/roteiros`: grupos por dia com cabeçalho "{dia da semana}, {dd/mm} · {cidade}" ou "· Locomoção {origem} → {destino}", grupo "Sem dia" por último, selo "Sugerido", botão "Novo roteiro" com nome e dia opcional (inclusive dias de locomoção)
- [X] T057 [US3] Implementar src/pages/ItineraryDetail.tsx para `#/roteiros/:id`: cidade do dia ou aviso de locomoção, notas do sugerido, lista numerada com PointCard e botões subir/descer/topo/remover, alternância para PointMap com marcadores numerados, renomear, mudar dia, excluir com confirmação; itens indisponíveis com selo
- [X] T058 [US3] Implementar src/components/AddToItinerary.tsx (folha/diálogo no detalhe do ponto): escolher roteiro existente ou criar novo; recusar duplicata com "Este ponto já está neste roteiro."; confirmar `OTHER_CITY` com "Este ponto fica em {cidade}, e este roteiro é de {cidade do dia}. Adicionar mesmo assim?"; incluir em src/pages/PointDetail.tsx
- [X] T059 [US3] Escrever os 19 roteiros sugeridos em content/itineraries.json (ids `sug-YYYY-MM-DD`): 7 em Nova York (31/10–06/11) agrupando pontos próximos por dia, 10 em Orlando (08/11–17/11) com um dia para cada parque de FR-024 — evitando parques grandes em muitos dias seguidos quando possível — e 3 dias de outros passeios, 2 em Miami (19/11–20/11); `notes` com dicas do dia em português; adicionar a content/points/*.json e content/photos.json qualquer ponto faltante; rodar `npm run photos && npm run content` até passar (FR-023, FR-024, FR-026)

**Checkpoint**: As 3 stories funcionam; T050–T053 verdes

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Qualidade, desempenho, publicação e validação final antes de 30/10/2026

- [X] T060 [P] Revisão de acessibilidade: `alt` em todas as fotos, rótulos em botões de ícone, foco visível, contraste AA, alvos de toque ≥ 44 px em src/components/ e src/pages/ — alt em todas as fotos, rótulos em botões de ícone, foco visível e alvos ≥ 44 px; contraste não foi medido com ferramenta.
- [X] T061 [P] Adicionar verificação de orçamento ao build: JS inicial < 100 KB gzip e `public/data` + `public/photos` ≤ 40 MB, falhando o CI se ultrapassar, em scripts/check-budget.ts e .github/workflows/ci.yml
- [X] T062 [P] Escrever README.md: o que é o app, comandos de quickstart.md, como editar conteúdo e fotos, como publicar e instalar no celular
- [ ] T063 Criar o repositório no GitHub (usuário fornece a URL), configurar Pages com "GitHub Actions", abrir PR da branch com CI verde e fazer merge para publicar (requer autorização do usuário) — registrar a URL publicada em README.md
- [ ] T064 Rodar toda a seção "Cenários automatizados" de quickstart.md contra a URL publicada e medir SC-005 (lista/detalhe < 2 s com conteúdo salvo) em um celular intermediário; registrar resultado em specs/001-tourist-guide-itineraries/quickstart.md — **Parcial**: cenários automatizados passam localmente (14 E2E); falta rodar contra a URL publicada e medir SC-005 em celular.
- [ ] T065 Revisão de conteúdo pelo usuário (28–29/10): conferir os 19 roteiros e horários/preços dos pontos dos roteiros; aplicar correções em content/ e republicar, seguindo "Revisão de conteúdo" de specs/001-tourist-guide-itineraries/quickstart.md
- [ ] T066 Validação manual final em cada celular (30/10): instalar, abrir pelo ícone, aguardar "Guia disponível offline", modo avião, fechar e reabrir, executar passos 5–7 de "Validação manual final" em specs/001-tourist-guide-itineraries/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências; T001 primeiro (precisa de autorização para commit)
- **Foundational (Phase 2)**: depende do Setup; bloqueia todas as stories
- **US1 (Phase 3)**: depende da Phase 2
- **US2 (Phase 4)**: depende da Phase 2; integra-se ao detalhe/card de US1 (T037, T033), mas seus testes usam fixtures próprias
- **US3 (Phase 5)**: depende da Phase 2; reutiliza PointCard/PointMap/PointDetail de US1 e o conteúdo de T040–T043
- **Polish (Phase 6)**: depende das três stories (prazo exige todas)

### Dependências internas relevantes

- T009 → T011 → T013 → T014; T009 → T019
- T010 → T017/T018; T016 depende de T009
- T030–T034 → T035; T030, T036 → T037
- T039 → T043; T040–T042 → T043 → T059
- T047 → T048 → T049
- T054 → T055 → T056/T057/T058

### Parallel Opportunities

- Setup: T004–T008 em paralelo após T002–T003
- Foundational: T010, T012, T014, T015, T017, T021, T022 em paralelo
- US1: todos os testes T025–T029; implementação T030–T033, T036, T038; conteúdo T040–T042 (independente do código)
- US2: T044–T047
- US3: T050–T053
- **Conteúdo e código em paralelo**: T040–T042 podem começar logo após T012/T011, enquanto as telas são construídas

---

## Parallel Example: User Story 1

```bash
# Testes de US1 juntos:
Task: "Testes unitários de opening-hours em tests/unit/opening-hours.test.ts"
Task: "Testes unitários de search em tests/unit/search.test.ts"
Task: "Testes E2E de US1 em tests/e2e/us1-guide.spec.ts"

# Conteúdo das 3 cidades juntos (independente do código):
Task: "Conteúdo de Nova York em content/points/nova-york.json"
Task: "Conteúdo de Orlando em content/points/orlando.json"
Task: "Conteúdo de Miami em content/points/miami.json"
```

---

## Implementation Strategy

### Ordem de entrega (prazo 30/10/2026, sem corte de escopo)

1. 19–20/10: Phase 1 + Phase 2 → casca da PWA publicada e instalável
2. 21–23/10: US1 (código) + conteúdo de NY → **validar US1 isoladamente** (MVP interno)
3. 23–24/10: US2 + conteúdo de Orlando e Miami + fotos
4. 25–27/10: US3 + 19 roteiros sugeridos
5. 27–28/10: Polish (T060–T064)
6. 28–29/10: revisão de conteúdo pelo usuário (T065)
7. 30/10: validação nos celulares (T066)

US1 é o MVP: se algo atrasar, já existe um guia offline utilizável; mas o compromisso é entregar
as três stories antes do embarque.

---

## Notes

- T001 e T063 envolvem commit, push e publicação: só executar com autorização explícita do usuário.
- T040–T042 e T059 exigem pesquisa na web; registrar `verifiedAt` com a data da consulta e
  nunca inventar horário/preço — sem fonte, usar `"see-official"` e preço "Consulte o site oficial".
- Commitar após cada tarefa ou grupo lógico; CI deve permanecer verde.
- [P] = arquivos diferentes, sem dependência pendente.
