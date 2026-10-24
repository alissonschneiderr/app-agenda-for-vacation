# Research: Redesign da UI como guia de viagem

Levantamento do app existente (pedido explícito do usuário: "inspecione antes de alterar") e
decisões de desenho.

## R0. Estado atual (inspeção do código)

| Aspecto | Como está hoje |
|---|---|
| Framework | Preact 11 + TypeScript, Vite, PWA (vite-plugin-pwa), roteador por hash próprio (`src/lib/router.ts`) |
| Rotas | `#/` e `#/cidade/:id` (guia), `#/ponto/:id`, `#/favoritos`, `#/roteiros`, `#/roteiros/:id`, `#/creditos`, `#/full/nova-york`, `#/full/nova-york/:date`, `#/full/nova-york/documento` |
| Dados | `public/data/content.json` gerado de `content/`: cidades, trechos da viagem, 78 pontos com fotos, 12 roteiros sugeridos (Orlando/Miami), roteiro FULL de NY (7 dias) |
| Roteiros por dia | NY: `FullDay.activities` (horário, duração, tipo, place, meal/shop/screen/transit, facts, pointId). Orlando/Miami: `Itinerary` do usuário (semeado dos sugeridos) com `date` e `items[{pointId, pointName}]`, sem horário |
| Imagens | Só nos pontos do guia (`Point.photos`, WebP locais com crédito). Atividades de NY ligam a pontos via `pointId` opcional |
| Conclusão | `UserState.activityMarks: Record<id, {state: 'done'|'skipped', at}>`, só para atividades FULL |
| Componentes reaproveitáveis | `ActivityCard` (blocos de refeição/loja/série/fontes), `PointPhoto`, `DirectionsButton`, `PointMap`, `InfoSource`, `FavoriteButton`, `OfflineBanner`, `DayLabel` |
| Estilo | `src/styles/base.css`, tokens de cor em `:root` com modo escuro, mobile-first |

## R1. Visão unificada por dia

- **Decision**: `domain/trip-view.ts` com funções puras que produzem `DestinationView` →
  `TripDayView[]` → `DayActivityView[]`, combinando o dia FULL (se houver) e os roteiros do usuário
  com a mesma data. Chave de conclusão: `id` da atividade FULL; `it:<itineraryId>:<pointId>` para
  itens de roteiro.
- **Rationale**: as telas e o progresso trabalham com um formato; as fontes continuam intactas
  (FR-024).
- **Alternatives considered**: converter os roteiros de Orlando/Miami para o formato FULL no conteúdo
  (exigiria inventar horários — proibido por FR-011); duplicar a lógica por tela.

## R2. Conclusão e "pulada"

- **Decision**: `toggleDone(state, key)`: sem marca ou `skipped` → `done`; `done` → sem marca
  (pendente). "Pular" continua nos detalhes das atividades FULL (FR-018). Remover item/roteiro apaga
  as chaves `it:` correspondentes.
- **Rationale**: controle binário na lista (pedido do usuário), sem perder a função existente; sem
  marcas órfãs.
- **Alternatives considered**: remover "pulada" (perderia funcionalidade); estado de três vias no
  checkbox (confuso).

## R3. Rotas e redirecionamentos

- **Decision**: `#/` → Viagem; `#/destino/:cityId` e `#/destino/:cityId/:date`;
  `#/destino/:cityId/:date/:key` para detalhes; guia em `#/guia` (e `#/cidade/:id` continua); 
  `#/full/nova-york` → `#/destino/nova-york`; `#/full/nova-york/:date` → `#/destino/nova-york/:date`;
  `#/full/nova-york/documento` mantido. Ver [contracts/routes.md](./contracts/routes.md).
- **Rationale**: FR-025 (links antigos funcionam) e navegação centrada nos destinos.
- **Alternatives considered**: manter `#/` como guia (destinos ficariam a dois toques, contra SC-001).

## R4. Detalhes: página dedicada

- **Decision**: página dedicada (rota própria) em vez de modal/drawer.
- **Rationale**: o roteador por hash já funciona com voltar do navegador/gesto do iPhone; modais
  exigiriam gerenciar foco e histórico manualmente; link direto para uma atividade fica possível.
- **Alternatives considered**: drawer lateral no desktop (mais código, mesmo conteúdo).

## R5. Direção visual

- **Decision**:
  - Tipografia: títulos em serifa do sistema (`ui-serif, "New York", Georgia, serif` — no iPhone
    usa a "New York" da Apple), texto em `system-ui`; escala 14/16/18/22/28/36 px.
  - Paleta: fundo marfim `#FAF8F4` / grafite `#121417` no escuro; texto `#1D1F23` / `#ECEAE6`;
    destaque único azul-petróleo `#0E5E6F` (escuro: `#5FB3C4`); verde de conclusão `#2E7D4F` com
    ícone de check (não depende de cor).
  - Cards sem borda pesada: fundo levemente elevado, raio 14 px, sombra `0 1px 2px rgb(0 0 0 / .06)`.
  - Fotos: proporção 16:9 no hero e 4:3 nas atividades, `object-fit: cover`, com crédito.
  - Movimento: transições de 150 ms (opacidade/escala do check), desligadas com
    `prefers-reduced-motion`.
- **Rationale**: editorial e legível, zero download de fontes (offline), contraste AA verificável.
- **Alternatives considered**: Google Fonts / fontes empacotadas (peso extra e licença; o sistema já
  oferece serifas boas em iOS/Android/desktop); biblioteca de componentes (dependência sem ganho).

## R6. Fotos de destaque

- **Decision**: `heroPointId` em `content/trip.json`: NY `ny-central-park`, Orlando
  `orl-magic-kingdom`, Miami `mia-south-beach`, validados no build (ponto existe, é da cidade e tem
  foto).
- **Rationale**: fotos reais já licenciadas e pré-cacheadas; nenhuma imagem nova (SC-006).

## R7. Layout desktop

- **Decision**: ≥ 1024 px: página do destino em grid `280px 1fr` (coluna de dias fixa + conteúdo do
  dia); detalhes da atividade com fotos à esquerda e blocos à direita; navegação no topo em vez da
  barra inferior.
- **Rationale**: FR-020 e "aproveitar o espaço" sem criar telas diferentes.
