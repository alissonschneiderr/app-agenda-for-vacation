# Relatório da feature 014 — app instalado nos dois celulares, offline e com atualização avisada

Decisões:
- **Q1 = A**: internet só para atualizações e links externos.
- **Q2 = C**: repositório público + GitHub Pages.

## Por que PWA (e não Capacitor)

No iPhone, um app nativo sem a conta paga da Apple (US$ 99/ano) **expira em 7 dias**, e a viagem tem
22. Mesmo com a conta paga, cada versão passaria por TestFlight ou reinstalação. No Android, cada
versão exigiria reinstalar o APK. O PWA instala uma vez e se atualiza sozinho nos dois celulares, sem
custo e sem dependência nova.

## O que mudou

| Pedido | Como ficou |
|---|---|
| Ícone, tela cheia, nome | O manifest (`pwa-manifest.ts`) tem `display: standalone` e "Guia Viagem", com as cores do visual atual (papel `#faf8f5`, tijolo `#8a3214`) no lugar do azul antigo. No iPhone: `apple-mobile-web-app-capable`, barra de status translúcida e título "Guia Viagem". |
| Tela de abertura | Android: gerada pelo Chrome com o ícone e o fundo papel. iPhone: `public/splash/` gerado por `npm run splash` (ícone sobre papel) para o iPhone 17 (402 × 874 @3) e o Pro Max/Air (440 × 956 @3). |
| Áreas seguras | O fim de cada tela e os avisos ficam acima do indicador de início e da barra do Android; o cabeçalho fica abaixo da Dynamic Island. Testado com os valores do iPhone 17 simulados. |
| Dica de instalação | Só no Safari do iPhone, fora do app instalado: "Instale: toque em Compartilhar e depois em Adicionar à Tela de Início", com "×", e não volta depois de fechada. |
| Atualização sem reinstalar | O app deixou de recarregar sozinho. Com versão nova pronta aparece "Nova versão disponível — atualizar". O app procura versão nova ao abrir, a cada 60 min e ao voltar para ele. "×" adia a troca para a próxima abertura. |
| Conferir a versão | ⚙ no Início → Exibição: "Versão AAAA-MM-DD · commit", "Armazenamento: persistente ✓" e "Disponível offline ✓". |
| Dados sem perda | Marcas, roteiros próprios e preferências estão no **IndexedDB** (`src/storage/persistent.ts`), com um espelho em memória que mantém a mesma interface de antes. Cada mudança tem uma **cópia de segurança síncrona** no localStorage até o IndexedDB confirmar, então fechar o app logo depois de marcar não perde nada. A versão antiga é migrada uma vez, conferida e, se falhar, desfeita sem perda. |
| Armazenamento persistente | `navigator.storage.persist()` é pedido no boot e o resultado aparece em Exibição. |
| Sem internet | Tocar em "Abrir no mapa", "Ver fotos" ou num site oficial mostra "Sem internet agora — tente de novo quando tiver conexão" e o link não abre. O resto do app continua normal. |

## Encontrado e corrigido no caminho

A primeira versão do armazenamento gravava no IndexedDB só de forma assíncrona. A suíte e2e mostrou
**5 casos de marca ou favorito perdidos** ao recarregar logo depois de gravar, que é o "marcar e
fechar o app". A cópia de segurança síncrona resolveu os 5, e há testes novos para a gravação
interrompida.

## Testes

- CI completo verde:
  - 387 testes unitários e de componentes;
  - 78 e2e (`chromium`, `mobile-360`, `mobile-402`);
  - JS inicial com 39,0 KB gzip;
  - snapshot de NY intacto.
- Novos testes:
  - manifest e metas do iPhone, com os PNGs de abertura;
  - dica de instalação;
  - aviso de versão nova;
  - Exibição;
  - armazenamento (espelho, migração, falha no meio, gravação interrompida);
  - links sem internet.
- E2e a 360 e 402 px:
  - áreas seguras do iPhone 17;
  - **dois builds reais** (A → B): o aviso aparece, a página não recarrega sozinha, "atualizar" troca
    a versão e a marca continua;
  - **migração real** do localStorage para o IndexedDB;
  - modo offline;
  - mapa sem internet.
- Capturas a 402 × 874 com as áreas seguras em [`screens/`](screens/): Início com a dica e o ⚙,
  Exibição, aviso de versão nova e aviso sem internet.
- Conferência de segredos no histórico: nenhum segredo real. Os achados foram só texto, como a loja
  "Victoria's Secret" e modelos do Spec Kit.

## Publicação (T028)

O app está no ar em **https://alissonschneiderr.github.io/app-agenda-for-vacation/**: o repositório é
público (Q2 = C) e o GitHub Pages publica pelo CI.

- O usuário tornou o repositório público e ligou o Pages. O sistema de permissões do Claude Code
  bloqueia essa ação para o agente.
- **Duas correções antes do primeiro deploy verde:**
  - o e2e de versão nova falhava só no Linux do CI, porque matar o `npx` deixava o servidor A no ar;
    agora o vite roda direto;
  - o CI publicaria o `dist` do E2E, construído na raiz, e o app não carregaria em
    `/app-agenda-for-vacation/`; agora há um build próprio para o Pages antes do upload.
- **Conferido no endereço publicado:**
  - página, manifest, Service Worker, conteúdo, telas de abertura, JS e CSS respondem 200;
  - 3 cidades e nenhum erro de JS;
  - Exibição mostra "Versão 2026-10-28 · dfd2035";
  - **offline**: Miami, 01/11 e 19/11 abrem com fotos.
- A primeira abertura baixa o guia inteiro (com as fotos) em cerca de 30 s. Até lá aparece "Salvando
  o guia para usar offline…".
- Com o repositório público, o e-mail dos commits também fica visível (padrão do GitHub).

## O que só vocês podem conferir nos aparelhos

O guia completo está no README, seção "Publicar e instalar".
1. Instalar no Galaxy S24 Ultra (Chrome) e no iPhone 17 (Safari).
2. Ver a tela de abertura, a tela cheia e nada sob a Dynamic Island nem sob a barra do Android.
3. Em ⚙ → Exibição: "Armazenamento: persistente ✓" e a mesma versão nos dois.
4. Modo avião: tudo abre e "Abrir no mapa" avisa.
5. Na próxima publicação: o aviso aparece e "atualizar" troca a versão.
