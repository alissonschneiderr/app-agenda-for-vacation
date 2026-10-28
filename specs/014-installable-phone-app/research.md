# Research — feature 014

## R1 — PWA, não Capacitor

- **Decision**: continuar PWA (manifest + Service Worker), publicado em HTTPS no GitHub Pages
  (Q2 = C).
- **Rationale**:
  - No iPhone, um app nativo (Capacitor) sem a conta paga da Apple expira em 7 dias; a viagem tem
    22.
  - Mesmo com a conta paga, cada versão passaria por TestFlight ou reinstalação.
  - No Android, cada versão exigiria reinstalar o APK.
  - O PWA instala uma vez e se atualiza sozinho nos dois sistemas, sem custo e sem dependência nova.
- **Alternatives considered**:
  - Capacitor: rejeitado pelos motivos acima.
  - TWA (Trusted Web Activity) no Android: é o mesmo PWA dentro de um APK; não ajuda o iPhone e
    exige publicar ou reinstalar o APK.

## R2 — Atualização com aviso, sem recarregar sozinha (FR-005 a FR-007)

- **Hoje**: `registerType: 'autoUpdate'` no `vite.config.ts`. O Service Worker novo assume e o app
  recarrega sozinho.
- **Decision**:
  - `registerType: 'prompt'`, com o `registerSW` do `virtual:pwa-register` (que já é usado em
    `src/main.tsx`).
  - `onNeedRefresh` liga um estado `updateReady`.
  - Um componente `UpdateBanner` mostra "Nova versão disponível — atualizar" (botão) e "×" (fechar).
  - "atualizar" chama `updateSW(true)`: o SW novo assume e a página recarrega na mesma rota, porque
    a rota fica no hash.
  - Fechar só esconde o aviso. O SW novo fica esperando e assume na próxima abertura, quando todas
    as abas do app tiverem sido fechadas (comportamento padrão do Service Worker).
- **Busca de versão** (FR-007):
  - ao abrir (o registro já busca);
  - `registration.update()` a cada 60 min com o app aberto;
  - ao voltar para o app (`visibilitychange` → visível), no máximo 1 vez a cada 10 min;
  - sem internet: a busca falha em silêncio (`catch`).
- **Dados** (FR-009): a atualização troca só os arquivos do app (cache do Service Worker). Os dados
  do casal ficam no IndexedDB (R4), que o Service Worker não toca.

## R3 — Versão visível (FR-008)

- **Decision**: o `vite.config.ts` define `__APP_VERSION__` no build, com a data UTC
  (`AAAA-MM-DD`) e os 7 primeiros caracteres do commit:
  - no CI vem de `GITHUB_SHA`;
  - localmente, de `git rev-parse --short HEAD`;
  - sem git, fica `dev`.
- Aparece em "Exibição" ("Versão 2026-11-02 · 3fe96f6"), e o aviso de atualização não precisa
  dela.
- **Acesso à "Exibição" no app instalado**: o app instalado não tem barra de endereço, e a 009 tirou
  todos os links da tela. **Decision**: um botão de ícone discreto (engrenagem, 44 × 44 px, nome
  acessível "Exibição e versão") no cabeçalho do Início. O Início continua só com as 3 cidades,
  porque o botão fica no cabeçalho, não vira seção.

## R4 — Dados do casal no IndexedDB, com migração (FR-011)

- **Hoje**:
  - estado do casal (marcas, roteiros, favoritos) em `localStorage` (`ctha:user:v1`), lido e
    gravado de forma síncrona pelo `createUserStore(storage: Storage)`;
  - preferências (`src/storage/prefs.ts`) também em `localStorage`.
- **Decision**: um `PersistentStorage` em `src/storage/persistent.ts`.
  - Implementa a mesma interface `Storage` (`getItem`, `setItem`, `removeItem`) sobre um `Map` em
    memória, carregado do IndexedDB antes da primeira tela.
  - Cada `setItem` e `removeItem` atualiza o `Map` na hora e grava no IndexedDB em seguida (banco
    `ctha`, store `kv`).
  - O `createUserStore` e o `prefs` passam a recebê-lo no lugar do `localStorage`, sem mudar a
    lógica deles.
- **Boot** (`src/main.tsx`): `await openPersistentStorage()` antes do `render`.
  - Se o IndexedDB estiver vazio e o `localStorage` tiver chaves `ctha:*`, **migra**: copia cada
    chave para o IndexedDB, relê e compara.
  - Só se a cópia bater, apaga as chaves do `localStorage`. Se falhar, segue com o `localStorage`
    (sem perder nada) e tenta de novo na próxima abertura.
- **Sem IndexedDB** (navegação privada antiga, erro): usa o `localStorage` como hoje.
- **Erro de gravação** no IndexedDB: a mensagem de erro de salvar que já existe
  (`SAVE_ERROR_MESSAGE`).
- **Testes**: o jsdom não tem IndexedDB. A lógica de migração e de espelho é testada com um
  adaptador em memória (interface `KvBackend`), sem dependência nova. O caminho real com IndexedDB é
  testado no e2e (Chromium).
- **Rationale**: pedido explícito (IndexedDB e `persist()`). O espelho em memória evita reescrever
  todo o app para leitura assíncrona.
- **Alternatives considered**:
  - `idb-keyval`: seria dependência nova para cerca de 30 linhas.
  - Store assíncrono em todas as telas: muito invasivo, contra "nada além".

## R5 — Armazenamento persistente (FR-011, US3 cenário 2)

- **Hoje**: `navigator.storage.persist()` já é chamado em `src/main.tsx`.
- **Decision**: chamar depois da migração e mostrar em "Exibição" o resultado de
  `navigator.storage.persisted()`:
  - "Armazenamento: persistente ✓";
  - ou "Armazenamento: comum — instale o app na tela inicial para o sistema não apagar os dados".
- **iOS**: o Safari só garante a permanência dos dados para o app instalado na tela inicial. Daí a
  dica de instalação (R8).

## R6 — Tela de abertura e cor de tema (FR-001, FR-002)

- **Android**: o Chrome monta a tela de abertura com `name`, `background_color` e o ícone de 512 px
  do manifest. **Decision**: `theme_color` e `background_color` passam às cores do visual atual,
  `#faf8f5` (papel) e `#8a3214` (tijolo), em vez do azul antigo `#0f4c81`. Também o
  `<meta name="theme-color">`, com uma versão para o modo escuro.
- **iOS**: o Safari só mostra a tela de abertura com `<link rel="apple-touch-startup-image">` para o
  tamanho exato da tela. **Decision**: um script de build (`scripts/splash.ts`, com o `sharp` que já
  é dependência de desenvolvimento) gera PNGs com o ícone centralizado sobre o fundo papel para:
  - iPhone 17 (1206 × 2622, 402 × 874 @3x);
  - iPhone 17 Pro Max e Air (1320 × 2868), como reserva.

  Ficam em `public/splash/`, com as `media` queries no `index.html`.
- **iOS, tela cheia**:
  - `<meta name="apple-mobile-web-app-capable" content="yes">`;
  - `apple-mobile-web-app-status-bar-style` = `black-translucent` (o conteúdo vai até o topo e as
    áreas seguras que já existem cuidam da Dynamic Island);
  - `apple-mobile-web-app-title` = "Guia Viagem".
- **Ícones**: os atuais (`public/icons`) ficam. Um ícone novo não faz parte do pedido.

## R7 — Áreas seguras (FR-003)

- Já existem `viewport-fit=cover`, `--safe-top` e `--safe-bottom` com `env(safe-area-inset-*)`, o
  cabeçalho fixo com `padding-top: var(--safe-top)` e as margens laterais.
- **Decision**: conferir e completar o fim das páginas (`padding-bottom` com `--safe-bottom`) e o
  aviso de atualização (fica acima do indicador de início).
- **Teste e2e**: com `env()` simulado por CSS de teste (`--safe-top: 59px`, `--safe-bottom: 34px`,
  os valores do iPhone 17), nenhum botão fica nessas faixas.

## R8 — Dica de instalação no iPhone (FR-004)

- **Decision**: o componente `InstallHint` aparece só quando há as três condições:
  - iOS (iPhone ou iPad no user agent, ou `MacIntel` com toque);
  - não instalado (`navigator.standalone !== true` e não `display-mode: standalone`);
  - não dispensado antes (preferência guardada).

  Texto: "Instale: toque em Compartilhar e depois em Adicionar à Tela de Início", com "×". No
  Android não aparece, porque o Chrome oferece "Instalar app" sozinho.

## R9 — Links de internet sem conexão (FR-012, FR-013)

- **Situação**: as funções de internet são links externos (`a[href^="http"]`, abertos em nova aba
  ou no app de mapas) e os mapas do Leaflet (tiles com cache).
- **Decision**: uma delegação global de clique (como a do card clicável da 009).
  - Se `navigator.onLine === false` e o link é externo (`http` e origem diferente da do app), o
    clique é cancelado.
  - Aparece um aviso curto e acessível (`role="status"`), "Sem internet agora — tente de novo quando
    tiver conexão", que some em 4 s.
  - O link para o Google Maps no modo motorista segue a mesma regra.
  - O mapa interativo sem tiles mostra o fundo vazio e os marcadores, que o app já trata.

## R10 — Publicação (FR-014, Q2 = C)

- **Hoje**: o CI (`.github/workflows/ci.yml`) testa e publica no Pages com
  `BASE_PATH=/<repositório>/`. O job `deploy` falhou porque o Pages não está ligado num repositório
  privado.
- **Decision** (na implementação, com o usuário já de acordo, Q2 = C):
  1. `gh repo edit --visibility public --accept-visibility-change-consequences`;
  2. ligar o Pages com fonte GitHub Actions (`gh api -X POST repos/{dono}/{repo}/pages -f
     build_type=workflow`);
  3. push da `main` e conferir o deploy em
     `https://alissonschneiderr.github.io/app-agenda-for-vacation/`.
- **Antes de tornar público**: conferir que não há segredo no histórico (tokens, chaves). O
  repositório só tem conteúdo e código, mas é verificado com um grep de padrões comuns.
