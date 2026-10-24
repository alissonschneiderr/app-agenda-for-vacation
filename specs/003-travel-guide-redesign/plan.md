# Implementation Plan: Redesign da UI como guia de viagem

**Branch**: `003-travel-guide-redesign` | **Date**: 2026-10-21 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-travel-guide-redesign/spec.md`

## Summary

Reorganizar a PWA existente em torno de **destinos → dias → atividades**, com visual editorial, sem
trocar stack, dados ou armazenamento. Uma camada de domínio nova (`trip-view`) unifica as duas fontes
de atividades que já existem — o roteiro FULL de Nova York (feature 002) e os roteiros datados de
Orlando/Miami e do casal (feature 001) — numa visão única por dia, com chave de conclusão estável e
progresso por dia/cidade/viagem. Três telas novas (Viagem, Destino com dias, Atividade) substituem a
entrada atual; guia, favoritos, roteiros, documento e créditos continuam acessíveis, e as rotas
antigas redirecionam. As marcações reutilizam o mapa `activityMarks` já persistido (estado v2), sem
mudança de formato. Nenhuma dependência nova.

## Technical Context

**Language/Version**: TypeScript 7, Node.js 24 (inalterado)

**Primary Dependencies**: Preact 11, Leaflet, vite-plugin-pwa (inalterados). **Nenhuma nova**:
ícones como SVG inline próprios; tipografia com fontes do sistema (serifada para títulos, sem
serifa para texto), que funcionam offline sem baixar nada.

**Storage**: `localStorage`, chave `ctha:user:v1`, estado v2 (inalterado). Marcações de itens de
roteiro usam o mesmo `activityMarks`, com chave `it:<itineraryId>:<pointId>`; nenhuma migração.
Conteúdo: `content/trip.json` ganha `heroPointId` por cidade (foto de destaque = foto real de um
ponto do guia).

**Testing**: Vitest (domínio `trip-view`, progresso, chaves de marcação, limpeza ao editar
roteiros, componentes novos), Playwright (fluxos US1–US4 em 390 px e 1280 px, offline,
persistência); testes existentes ajustados só em seletores/textos.

**Target Platform**: igual (PWA; Safari iOS 17+, Chrome Android, desktop).

**Project Type**: aplicação web (PWA) estática existente.

**Performance Goals**: marcação visível em < 100 ms (SC-002, atualização síncrona do store);
JS inicial continua < 100 KB gzip; foto de destaque com `loading="eager"` só na página do destino
e `lazy` nas listas.

**Constraints**: offline (Princípio I); sem dados inventados (FR-011); sem rolagem horizontal e
toque ≥ 44 px (FR-020); contraste AA claro/escuro; `prefers-reduced-motion` (FR-021); rotas
antigas preservadas (FR-025); prazo de embarque 31/10/2026.

**Scale/Scope**: 3 destinos, 22 datas (19 de passeio + 3 de locomoção), ≈ 207 atividades em NY +
≈ 33 itens em Orlando/Miami; 3 telas novas, ~6 componentes novos, ~5 telas ajustadas.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio / Regra | Como o plano atende | Status |
|---|---|---|
| I. Offline-first | Mesma fonte (`content.json` pré-cacheado) e mesmo store; nenhuma fonte/fonte tipográfica/ícone externo | ✅ |
| I. Dados criados offline não se perdem | Marcações gravadas de forma síncrona no store existente | ✅ |
| I. Indicar offline | Banner existente mantido em todas as telas | ✅ |
| II. Testes por user story | Unidade + componente + E2E para US1–US4 (ver quickstart) | ✅ |
| II. Domínio e armazenamento testados | `trip-view` (unificação, chaves, progresso), limpeza de marcas ao editar roteiros | ✅ |
| II. Teste sem rede por fluxo offline | E2E: navegar destinos/dias e marcar com `setOffline(true)` | ✅ |
| II. CI verde | Mesmo workflow; testes antigos ajustados apenas em seletores | ✅ |
| III. Menor solução | Visão derivada em memória (sem novo armazenamento), CSS próprio, SVG inline, sem lib de UI/ícones/fontes | ✅ |
| III. Dependências justificadas | Nenhuma nova | ✅ |
| III. Abstrações justificadas | `domain/trip-view.ts` é a única camada nova; justificada em Complexity Tracking | ✅ |
| Plataforma PWA mobile-first | Layout mobile-first com breakpoint de 1024 px para desktop | ✅ |
| Fluxo Spec Kit | Branch `003-travel-guide-redesign` a partir da `002` | ✅ |

**Resultado**: aprovado. Re-checagem pós-design: mantido.

## Project Structure

### Documentation (this feature)

```text
specs/003-travel-guide-redesign/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── routes.md          # rotas novas, redirecionamentos e navegação
│   └── ui-components.md   # contrato visual/acessível dos componentes novos
└── tasks.md               # /speckit-tasks
```

### Source Code (repository root)

```text
content/trip.json                 # ALTERADO: heroPointId por cidade

scripts/content-schema.ts         # ALTERADO: valida heroPointId (existe e é da cidade)

src/
├── content/types.ts              # ALTERADO: City.heroPointId
├── domain/
│   ├── trip-view.ts              # NOVO: dias por destino, atividades unificadas, chaves, progresso
│   ├── full-itinerary.ts         # ALTERADO: toggleDone (feito ↔ pendente)
│   └── itineraries.ts            # ALTERADO: remover item/roteiro limpa as marcas it:…
├── components/
│   ├── Icon.tsx                  # NOVO: ~16 ícones SVG inline (categorias, check, navegação)
│   ├── DoneToggle.tsx            # NOVO: controle Feito/Pendente (checkbox acessível)
│   ├── ProgressBar.tsx           # NOVO: "x de y" + barra (role="progressbar")
│   ├── ActivityRow.tsx           # NOVO: item da timeline/lista (foto, hora, categoria, toggle)
│   ├── DayNav.tsx                # NOVO: seletor de dias (chips no celular, coluna no desktop)
│   ├── TopNav.tsx / BottomNav.tsx# ALTERADO: Viagem · Nova York · Orlando · Miami · Guia
│   └── ActivityCard.tsx          # REUSO: blocos de refeição/loja/série/fontes nos detalhes
├── pages/
│   ├── Trip.tsx                  # NOVO: #/ — capa da viagem, hoje, destinos, progresso geral
│   ├── Destination.tsx           # NOVO: #/destino/:cityId[/:date] — hero, resumo, dias, timeline
│   ├── ActivityDetail.tsx        # NOVO: #/destino/:cityId/:date/:key — detalhes em blocos
│   ├── Home.tsx                  # ALTERADO: vira a tela do Guia em #/guia (e #/cidade/:id)
│   ├── FullDay.tsx, FullOverview # ALTERADO: redirecionam para as telas novas
│   └── demais                    # ALTERADO só no estilo
└── styles/base.css               # ALTERADO: tokens editoriais, tipografia, layout desktop, motion

tests/
├── unit/trip-view.test.ts
├── components/destination.test.tsx, activity-detail.test.tsx, done-toggle.test.tsx
└── e2e/us-travel-guide.spec.ts (+ ajustes de seletores nos E2E existentes)
```

**Structure Decision**: mesma estrutura; o redesign é uma camada de apresentação nova sobre o domínio
existente, mais uma função de domínio que monta a visão por destino/dia.

## Cronograma

| Datas | Entrega |
|---|---|
| 21–22/10 | `trip-view` + testes; chaves e limpeza de marcas; heroPointId; rotas e redirecionamentos |
| 22–24/10 | Telas Viagem, Destino (dias, timeline, progresso) e Atividade; DoneToggle; navegação |
| 24–25/10 | Estilo editorial, desktop 2 colunas, modo escuro, motion; ajustes dos testes antigos |
| 26–27/10 | E2E 390/1280 px, offline; revisão visual com screenshots |
| 28–30/10 | Revisão do casal junto com 001/002; instalação |

## Complexity Tracking

| Item | Por que é necessário | Alternativa mais simples rejeitada porque |
|---|---|---|
| `domain/trip-view.ts` (visão unificada) | As atividades vêm de duas fontes com formatos diferentes (roteiro FULL e roteiros do casal); telas, progresso e marcação precisam de um formato só | Tratar as duas fontes em cada tela duplicaria a lógica de ordenação, chaves e progresso em 3 telas e no cálculo da viagem |
