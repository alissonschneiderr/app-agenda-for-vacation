# Tasks: O app instalado no Galaxy S24 Ultra e no iPhone 17, offline e com atualização avisada

**Input**: Design documents from `specs/014-installable-phone-app/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/screens.md, quickstart.md

**Tests**: obrigatórios (constituição, Princípio II). Em cada história, o teste vem antes da
implementação e deve falhar primeiro.

**Comandos**: prefixar com `export PATH=/opt/homebrew/opt/node@24/bin:$PATH`.

**Branch**: `main`, a pedido do usuário.

**Decisões**:
- **Q1 = A**: internet só para atualizações e links externos.
- **Q2 = C**: repositório público + GitHub Pages.

**E2e mobile**: os projetos `mobile-360` e `mobile-402` rodam só `tests/e2e/us-mobile*.spec.ts`.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup

- [X] T001 Conferir a base na `main`: `npm run typecheck && npm test` verdes e working tree limpa. Remover só as cópias " 2" do iCloud que sejam idênticas ao original ou vazias.

---

## Phase 2: Foundational (bloqueia as histórias)

**Purpose**: versão do build e estado do Service Worker, usados pela US1, US2 e US3.

- [X] T002 Em `vite.config.ts`, definir `__APP_VERSION__` (R3):
  - formato `"AAAA-MM-DD · <sha7>"`, com a data UTC do build;
  - sha de `process.env.GITHUB_SHA` ou de `git rev-parse --short HEAD`, e `"dev"` se não houver git.

  Declarar o tipo em `src/vite-env.d.ts` (ou no `.d.ts` que já existe).
- [X] T003 Em `src/lib/pwa.ts`, criar estado e ganchos:
  - `updateReady` com `setUpdateReady(fn)`, `useUpdateReady()` e `applyUpdate()` (chama a função de atualização guardada);
  - `persisted` com `usePersisted()`, que lê `navigator.storage?.persisted?.()` e, sem suporte, devolve `false`.

  Testes em `tests/unit/pwa.test.ts`: o estado muda e os ouvintes recebem.

**Checkpoint**: versão disponível no código; estados de PWA prontos.

---

## Phase 3: User Story 1 - Instalar uma vez e usar como app (Priority: P1) 🎯 MVP

**Goal**: instalável nos dois sistemas, com tela cheia, tela de abertura, cores do visual atual, áreas seguras, dica de instalação no iPhone e o endereço público no ar.

**Independent Test**: manifest e metas conferidos no build; e2e com áreas seguras simuladas; dica do iPhone; o endereço do Pages responde.

### Tests for User Story 1

- [X] T004 [P] [US1] Em `tests/unit/manifest.test.ts`, após `npm run build`, ler `dist/manifest.webmanifest` e `dist/index.html` (deve falhar):
  - `display: "standalone"`, `short_name: "Guia Viagem"`, `theme_color: "#8a3214"`, `background_color: "#faf8f5"`, ícones 192, 512 e maskable;
  - `index.html` com `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style` = `black-translucent`, `apple-mobile-web-app-title` = `Guia Viagem`, `theme-color` claro e escuro;
  - `apple-touch-startup-image` com `media` para 402 × 874 @3 e 440 × 956 @3, e os PNGs existem em `dist/splash/`.
- [X] T005 [P] [US1] Em `tests/components/install-hint.test.tsx` (deve falhar):
  - com `navigator.userAgent` de iPhone e não instalado, a dica "Instale: toque em Compartilhar e depois em Adicionar à Tela de Início" aparece;
  - "×" a fecha e grava `installHintDismissed: true` nas preferências; ao montar de novo, não aparece;
  - com `navigator.standalone === true` ou user agent de Android, não aparece.
- [X] T006 [P] [US1] Em `tests/e2e/us-mobile-install.spec.ts`, describe "US1 (014)", nos projetos `mobile-360` e `mobile-402`:
  - injetar `:root { --safe-top: 59px; --safe-bottom: 34px; }`, os valores do iPhone 17;
  - em `#/`, `#/cidade/nova-york`, `#/dia/2026-11-01` e `#/exibicao`, nenhum elemento `a, button, [role="checkbox"]` visível começa acima de 59 px com a página no topo;
  - rolando até o fim, nenhum termina abaixo de `innerHeight - 34`;
  - sem rolagem lateral.

### Implementation for User Story 1

- [X] T007 [US1] Em `vite.config.ts`, no manifest:
  - `theme_color: '#8a3214'` e `background_color: '#faf8f5'`;
  - manter `name`, `short_name`, `display`, `start_url`, `scope` e os ícones;
  - incluir `splash/*.png` em `includeAssets`.
- [X] T008 [US1] Criar `scripts/splash.ts` (sharp): gerar `public/splash/iphone-1206x2622.png` (iPhone 17) e `public/splash/iphone-1320x2868.png` (Pro Max e Air), com fundo `#faf8f5` e `public/icons/icon-512.png` centralizado a 30% da largura. Adicionar o script `"splash": "tsx scripts/splash.ts"` ao `package.json`, rodar uma vez e commitar os PNGs.
- [X] T009 [US1] Em `index.html`:
  - `<meta name="apple-mobile-web-app-capable" content="yes">`;
  - `apple-mobile-web-app-status-bar-style` = `black-translucent` e `apple-mobile-web-app-title` = `Guia Viagem`;
  - `<meta name="theme-color" content="#faf8f5" media="(prefers-color-scheme: light)">` e a versão escura com a cor de `--paper` do modo escuro (`#1a1512`);
  - os dois `<link rel="apple-touch-startup-image">` com `media="(device-width: 402px) and (device-height: 874px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"` e o de 440 × 956.
- [X] T010 [US1] Criar `src/components/InstallHint.tsx` (R8): iOS e não instalado e não dispensado → faixa com o texto e "×". Em `src/storage/prefs.ts`, campo `installHintDismissed?: boolean`. Montar em `src/app.tsx`.
- [X] T011 [US1] Em `src/styles/base.css`:
  - `.page` com `padding-bottom: calc(var(--safe-bottom) + 24px)`;
  - estilo de `.install-hint`, fixo no rodapé acima da área segura, fundo `--surface`, borda e altura mínima de 44 px no botão.

  Rodar T004, T005 e T006, que devem passar.

**Checkpoint**: app instalável, com cara de app e áreas seguras.

---

## Phase 4: User Story 2 - Atualizações com aviso, sem perder dados (Priority: P1)

**Goal**: o app não recarrega sozinho. Aparece o aviso "Nova versão disponível — atualizar", a busca roda a cada 60 min e ao voltar para o app, e a versão aparece em "Exibição" (com acesso pelo ⚙ no Início).

**Independent Test**: dois builds com versões diferentes; o aviso aparece, "atualizar" troca a versão e as marcas continuam.

### Tests for User Story 2

- [X] T012 [P] [US2] Em `tests/components/update-banner.test.tsx` (deve falhar):
  - com `setUpdateReady(fn)`, aparece `role="status"` com "Nova versão disponível" e o botão "atualizar";
  - tocar chama `fn(true)`;
  - "×" (nome "Fechar aviso") esconde, e um novo `setUpdateReady` na mesma sessão não reabre;
  - sem versão nova, nada aparece.
- [X] T013 [P] [US2] Em `tests/components/display.test.tsx` e `tests/components/start.test.tsx` (devem falhar):
  - "Exibição" mostra `Versão ${__APP_VERSION__}`;
  - "Armazenamento: persistente ✓" ou "Armazenamento: comum — instale o app na tela inicial para o sistema não apagar os dados", conforme `usePersisted`;
  - o Início tem o link "Exibição e versão" (`href="#/exibicao"`, 44 × 44) e continua com 3 cards de cidade.
- [X] T014 [P] [US2] Em `tests/e2e/us-mobile-install.spec.ts`, describe "US2 (014)":
  - build A instalado (Service Worker ativo), com uma marca de feito gravada;
  - um novo build B, com `__APP_VERSION__` diferente, no mesmo `dist` (`page.route` servindo o `sw.js` do build B, ou o servidor de preview com rebuild);
  - recarregar a página: em até 60 s aparece "Nova versão disponível", e a página não recarrega sozinha (marcador `window.__marker` continua);
  - "atualizar" leva à versão B (em "Exibição") e a marca continua.

### Implementation for User Story 2

- [X] T015 [US2] Em `vite.config.ts`, `registerType: 'prompt'`. Em `src/main.tsx`:
  - `registerSW({ immediate: true, onNeedRefresh: () => setUpdateReady(updateSW), onOfflineReady, onRegisteredSW(url, r) { … } })`;
  - em `onRegisteredSW`, `setInterval(() => r?.update().catch(() => {}), 60 * 60_000)` e, em `visibilitychange` (visível), `r?.update()` no máximo a cada 10 min.
- [X] T016 [US2] Criar `src/components/UpdateBanner.tsx` (contrato) e montar em `src/app.tsx`. CSS em `src/styles/base.css` com `.update-banner` fixo no rodapé, acima de `--safe-bottom`, e o mesmo visual de `.install-hint`. Se os dois aparecerem, o de atualização fica acima.
- [X] T017 [US2] Em `src/pages/Display.tsx`, as linhas de versão, armazenamento e offline (`useOfflineState`). Em `src/pages/Start.tsx`, o botão-ícone ⚙ no cabeçalho `.start-head` (`aria-label="Exibição e versão"`, `href="#/exibicao"`). Rodar T012, T013 e T014, que devem passar.

**Checkpoint**: atualização avisada e versão conferível.

---

## Phase 5: User Story 3 - Offline primeiro, com dados persistentes (Priority: P1)

**Goal**: dados do casal no IndexedDB (migrados do `localStorage`), armazenamento persistente pedido e links externos que avisam sem internet.

**Independent Test**: estado antigo no `localStorage` → abre → está no IndexedDB e o `localStorage` foi limpo; modo avião abre tudo; link externo offline mostra o aviso.

### Tests for User Story 3

- [X] T018 [P] [US3] Em `tests/unit/persistent-storage.test.ts`, com o adaptador `KvBackend` em memória (deve falhar):
  - `PersistentStorage` implementa `getItem`, `setItem` e `removeItem` de forma síncrona sobre o `Map`, e grava no backend;
  - `openPersistentStorage({ backend, legacy })` com o backend vazio e o `legacy` (um `Storage` falso) com `ctha:user:v1` e `ctha:prefs` copia, relê, confere e só então remove do `legacy`;
  - se a gravação falhar no meio, nada é removido do `legacy`, e o storage devolvido é o `legacy`;
  - com o backend já preenchido, o `legacy` é ignorado (idempotente);
  - chaves fora de `ctha:` não são migradas.
- [X] T019 [P] [US3] Em `tests/components/offline-links.test.tsx` (deve falhar):
  - com `navigator.onLine = false`, um clique em `<a href="https://www.google.com/maps/…" target="_blank">` é cancelado (`defaultPrevented`) e aparece `role="status"` com "Sem internet agora — tente de novo quando tiver conexão";
  - com `onLine = true`, o clique segue;
  - links internos (`#/dia/…`) nunca são bloqueados.
- [X] T020 [P] [US3] Em `tests/e2e/us-mobile-install.spec.ts`, describe "US3 (014)":
  - **migração**: antes de abrir, `localStorage['ctha:user:v1']` com uma marca de feito (`addInitScript`, só na primeira carga); ao abrir, a marca aparece no dia; o IndexedDB `ctha`/`kv` tem a chave e o `localStorage` não;
  - **offline**: `goOffline`, reabrir, navegar por `#/cidade/miami`, `#/dia/2026-11-19` e `#/dia/2026-11-01`, com conteúdo e fotos (`img.cover-img` carregada);
  - tocar em "Abrir no mapa" mostra "Sem internet agora…" e a URL não muda.

### Implementation for User Story 3

- [X] T021 [US3] Criar `src/storage/persistent.ts` (R4):
  - interface `KvBackend { getAll(): Promise<Record<string,string>>; set(k,v): Promise<void>; delete(k): Promise<void> }`;
  - `indexedDbBackend()` com o banco `ctha` e o store `kv`;
  - classe `PersistentStorage` (Map + gravação no backend; um erro de gravação vai para `onWriteError`);
  - `openPersistentStorage({ backend?, legacy? })`, com migração das chaves `ctha:*` e queda para o `legacy` se o IndexedDB faltar ou falhar.
- [X] T022 [US3] Ligar o storage persistente:
  - em `src/main.tsx`, `const storage = await openPersistentStorage({ legacy: localStorage })` antes do `render`, depois `navigator.storage?.persist?.()`;
  - `src/storage/user-store.ts` (`getUserStore`) e `src/storage/prefs.ts` passam a usar esse storage (função `setAppStorage(storage)` chamada no boot);
  - `src/lib/pwa.ts` (`ctha:offline-ready`) também;
  - nos testes, o padrão continua sendo o `localStorage` do jsdom, porque sem `setAppStorage` vale o `window.localStorage`.
- [X] T023 [US3] Criar `src/lib/offline-links.ts`: `installOfflineLinks(root = document)`, uma delegação de clique em `a[href^="http"]` de outra origem quando `!navigator.onLine` → `preventDefault` + aviso. Montar em `src/app.tsx`, com o componente de aviso (`OfflineToast`) ou reaproveitando o `UndoToast`. Rodar T018, T019 e T020, que devem passar.

**Checkpoint**: todas as histórias completas.

---

## Phase 6: Polish & Publicação

- [X] T024 Rodar a suíte inteira e ajustar o que depender da cor antiga (`#0f4c81`) ou do recarregamento automático, com o comentário "feature 014". Conferir o snapshot de NY intacto.
- [X] T025 [P] Atualizar o `README.md`, seção "Publicar e instalar", com o conteúdo de `quickstart.md`: o endereço `https://alissonschneiderr.github.io/app-agenda-for-vacation/`, como instalar (Android e iPhone), publicar, confirmar a versão nos dois celulares e testar offline.
- [X] T026 Rodar o CI completo: `npm run typecheck && npm test && npm run content:strict && npm run build && npm run budget && npm run e2e`. Gerar capturas a 402 × 874 com as áreas seguras simuladas em `specs/014-installable-phone-app/screens/`: Início com ⚙, aviso de atualização, dica do iPhone, "Exibição" e o aviso sem internet.
- [X] T027 Antes de tornar público, procurar segredos no histórico: `git log -p --all | grep -nEi "(api[_-]?key|secret|token|password|BEGIN (RSA|OPENSSH) PRIVATE KEY|ghp_|github_pat_)"`. Revisar cada ocorrência. Se houver segredo real, **parar** e avisar o usuário.
- [X] T028 Publicar (Q2 = C, já decidido pelo usuário):
  1. commitar a feature;
  2. `gh repo edit alissonschneiderr/app-agenda-for-vacation --visibility public --accept-visibility-change-consequences`;
  3. `gh api -X POST repos/alissonschneiderr/app-agenda-for-vacation/pages -f build_type=workflow` (se já existir, `PUT` com o mesmo campo);
  4. `git push`;
  5. `gh run watch` até o `deploy` ficar verde;
  6. conferir `curl -sI https://alissonschneiderr.github.io/app-agenda-for-vacation/` (200) e o `manifest.webmanifest` publicado.
- [X] T029 Escrever `specs/014-installable-phone-app/report.md`:
  - o que mudou;
  - por que PWA;
  - o endereço;
  - o passo a passo de instalação, publicação, confirmação e teste offline;
  - os testes;
  - o que só o casal pode conferir nos aparelhos reais.

  Marcar as tarefas no `tasks.md`, commitar e fazer push.

---

## Dependencies & Execution Order

- T001 → Foundational (T002–T003) → histórias.
- **US1 (T004–T011)**: depende de T002 (versão no build). MVP.
- **US2 (T012–T017)**: depende de T002 e T003. `vite.config.ts` e `src/app.tsx` são tocados por US1 e US2, então as implementações rodam em sequência.
- **US3 (T018–T023)**: depende de T003. `src/main.tsx` e `src/app.tsx` também são tocados por US2, então roda em sequência.
- **Polish**: T024 → T025 ∥ T026 → T027 → T028 → T029.

### Parallel Opportunities

- US1: T004 ∥ T005 ∥ T006.
- US2: T012 ∥ T013 ∥ T014. O T014 divide o arquivo com T006 e T020: escrever em blocos separados, em sequência.
- US3: T018 ∥ T019.
- Os testes das três histórias podem ser escritos antes de qualquer implementação.

## Parallel Example: User Story 3

```text
T018 [US3] tests/unit/persistent-storage.test.ts
T019 [US3] tests/components/offline-links.test.tsx
```

## Implementation Strategy

1. **MVP**: Setup, Foundational e US1. O app instalável e com cara de app já pode ser publicado.
2. US2: aviso de atualização e versão.
3. US3: IndexedDB com migração e links offline.
4. Polish: README, CI, conferência de segredos, publicação (repositório público + Pages) e relatório.
