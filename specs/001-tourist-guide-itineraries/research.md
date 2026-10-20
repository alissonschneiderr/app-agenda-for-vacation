# Research: Guia de Pontos Turísticos e Roteiros Salvos

Todas as incógnitas do Technical Context estão resolvidas abaixo.

## R1. Arquitetura: PWA estática sem backend

- **Decision**: Site estático (HTML/JS/CSS + JSON + imagens) gerado no build, sem servidor de API.
- **Rationale**: Conteúdo é fixo para uma viagem e produzido antes do embarque; dados do usuário
  ficam só no aparelho (FR-017). Um backend não teria função e adicionaria custo, risco e prazo.
- **Alternatives considered**: CMS headless (desnecessário para um autor e conteúdo fixo);
  backend próprio com API (sem requisito que o justifique).

## R2. Framework de UI e dependências

- **Decision**: Preact 11, TypeScript 7, Vite 8, com um roteador por hash próprio (`src/lib/router.ts`,
  ~50 linhas). *Atualizado na implementação*: o preact-iso foi descartado porque só faz roteamento por
  caminho, e o contrato de rotas exige `#/…` para funcionar em hospedagem estática e offline.
- **Rationale**: Componentes facilitam ~8 telas com estado local e testes com Testing Library;
  Preact tem ~4 KB, mantendo o bundle pequeno para a PWA.
- **Alternatives considered**: JS puro (mais código manual de renderização e mais difícil de
  testar); React (mesmo modelo, ~10x maior); Svelte/SvelteKit (bom, mas SSR/roteamento do kit é
  além do necessário).

Justificativa de cada dependência (Princípio III):

| Dependência | Tipo | Por que a plataforma nativa não basta |
|---|---|---|
| preact | runtime | Renderização declarativa e testável das telas |
| leaflet | runtime | Mapa interativo com marcadores; não há mapa nativo na web |
| vite | dev | Build/dev server com TS sem configuração |
| tsx | dev | Executar os scripts TypeScript de conteúdo/fotos sem etapa de compilação |
| @types/leaflet, @types/node | dev | Tipos para Leaflet e para os scripts Node |
| @preact/preset-vite | dev | JSX/aliases do Preact no Vite (plugin oficial) |
| vite-plugin-pwa | dev | Gera Service Worker (Workbox) e manifest com precache confiável |
| typescript | dev | Tipos para conteúdo e dados do usuário |
| vitest, @testing-library/preact, jsdom | dev | Testes unitários e de componente (Princípio II) |
| @playwright/test | dev | E2E reais com Service Worker e simulação offline |
| zod | dev | Validação do conteúdo no build/teste (não vai para o bundle) |
| sharp | dev | Redimensionar e converter fotos para WebP no script |

## R3. Offline e Service Worker

- **Decision**: `vite-plugin-pwa` com `generateSW`, `registerType: 'autoUpdate'`; precache de
  todo o app, `data/content.json` e `photos/*.webp` (`maximumFileSizeToCacheInBytes` ajustado).
  Tiles do mapa com `StaleWhileRevalidate` em cache de runtime limitado (ex.: 2.000 tiles, 30 dias).
- **Rationale**: Satisfaz FR-012/FR-013 sem lógica própria; atualização automática quando houver
  conexão atende FR-016.
- **Alternatives considered**: SW escrito à mão (mais código e risco); cache sob demanda das fotos
  (falharia offline para pontos nunca abertos).
- **Nota iOS**: no iPhone, a PWA instalada na tela inicial tem armazenamento separado do Safari e
  não sofre a remoção de 7 dias. O conteúdo é baixado ao abrir pela primeira vez **pelo ícone**;
  o quickstart inclui esse passo.

## R4. Armazenamento dos dados do usuário

- **Decision**: `localStorage`, chave única `ctha:user:v1` com um JSON versionado
  ([contracts/user-storage.md](./contracts/user-storage.md)); `navigator.storage.persist()` na
  primeira execução.
- **Rationale**: Volume ínfimo (dezenas de roteiros/favoritos, < 50 KB); API síncrona elimina
  janelas de perda de dados ao fechar o app; simples de testar.
- **Alternatives considered**: IndexedDB (assíncrono e mais complexo, sem ganho neste volume);
  OPFS (exagero).

## R5. Mapa e tiles

- **Decision**: Leaflet com tiles do OpenStreetMap e atribuição obrigatória.
- **Rationale**: Gratuito, sem chave de API. Sem prefetch em massa (proibido pela política de uso
  do OSM); só tiles vistos ficam em cache. Atende a premissa "mapa offline completo fora do escopo".
- **Alternatives considered**: Google Maps/Mapbox (chave, cobrança, termos que restringem cache);
  mapas vetoriais offline (PMTiles) — viável, mas mais trabalho que o prazo comporta.

## R6. "Como chegar"

- **Decision**: Link `https://www.google.com/maps/dir/?api=1&destination=<lat>,<lng>` aberto em
  nova aba; offline, botão mostra aviso de que a navegação precisa de internet.
- **Rationale**: Universal link abre o app Google Maps (iOS/Android) ou o site; sem integração.
- **Alternatives considered**: `maps.apple.com` (só bom no iOS); esquema `geo:` (inconsistente no
  iOS).

## R7. Horário de funcionamento e fuso

- **Decision**: Calcular "aberto agora" com `Intl.DateTimeFormat` em `America/New_York`
  (todas as cidades) a partir de horários semanais + exceções por data no conteúdo.
- **Rationale**: Corrige automaticamente o fim do horário de verão em 01/11/2026 (edge case) e
  ignora o fuso do aparelho (FR-004). Sem biblioteca de datas.
- **Alternatives considered**: date-fns-tz/Luxon (dependência desnecessária).

## R8. Busca e filtros

- **Decision**: Filtro em memória: `normalize('NFD')` + remoção de diacríticos + `toLowerCase()`,
  correspondência por substring no nome.
- **Rationale**: ~150 itens; instantâneo, funciona offline (FR-002).
- **Alternatives considered**: Fuse.js/lunr (busca difusa não exigida).

## R9. Reordenação de roteiros

- **Decision**: Botões "subir"/"descer" por item (e "mover para o topo").
- **Rationale**: Acessível, confiável em toque, trivial de testar.
- **Alternatives considered**: drag-and-drop (bibliotecas extras e problemas em mobile).

## R10. Roteiros sugeridos e atualizações de conteúdo

- **Decision**: Na primeira execução, cada roteiro sugerido é copiado para os dados do usuário com
  `origin: "suggested"` e `sourceId`; os IDs já semeados ficam registrados em `seededIds`. Novas
  versões do conteúdo só semeiam IDs nunca semeados; nunca sobrescrevem (FR-025). Favoritos e itens
  guardam `pointId` + snapshot do nome para exibir pontos removidos como "indisponível".
- **Rationale**: Edições do usuário são sempre preservadas; regras simples e testáveis.
- **Alternatives considered**: mesclar alterações do conteúdo nos roteiros editados (complexo e
  surpreendente para o usuário).

## R11. Produção do conteúdo

- **Decision**: Claude pesquisa (sites oficiais e fontes públicas) e escreve os JSON em
  `content/`, com `verifiedAt` e `officialUrl` por ponto. Fotos: cada ponto em `content/points/*.json`
  traz `photos: [{ ref, alt }]`, onde `ref` é `File:<arquivo da Commons>` ou `wiki:<artigo da
  Wikipédia>` (foto principal livre do artigo). `scripts/fetch-photos.ts` resolve o `ref` pela API,
  aceita só licenças livres, gera WebP de 1200 px e grava autor/licença/URL em
  `content/photo-credits.json`. `scripts/build-content.ts` junta tudo e valida com Zod; o modo
  `--strict` (usado no CI) também exige completude (19 roteiros, 7 parques, foto por ponto, 40 MB),
  para que o build não fique vermelho enquanto o conteúdo é escrito (análise F1).
- **Rationale**: Créditos extraídos automaticamente da fonte evitam erros de licença; validação no
  build garante completude.
- **Alternatives considered**: fotos de bancos como Unsplash (créditos manuais, licença própria);
  imagens geradas (sem ferramenta disponível e não são fotos reais).
- **Distribuição dos roteiros de Orlando** (10 dias): 4 parques Disney + 3 Universal + 3 dias
  livres (ex.: Disney Springs/compras, Kennedy Space Center, descanso/outlets), sem parques em dias
  consecutivos de muita caminhada quando possível. Ordem final sujeita à revisão do usuário.

## R12. Hospedagem e CI

- **Decision**: GitHub Pages publicado por GitHub Actions; o mesmo workflow roda tipos, unidade,
  validação de conteúdo e E2E antes do deploy.
- **Rationale**: Gratuito, HTTPS (exigido para Service Worker), integrado ao repositório.
- **Alternatives considered**: Netlify/Cloudflare Pages (equivalentes; ficam como plano B).
- **Pendência operacional**: o repositório precisa estar no GitHub (ainda não há remote).
