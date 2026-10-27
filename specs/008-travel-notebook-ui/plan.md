# Implementation Plan: Visual e estrutura de "caderno de viagem", com muitas fotos

**Branch**: `008-travel-notebook-ui` | **Date**: 2026-10-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/008-travel-notebook-ui/spec.md`

## Summary

O app passa a ter a estrutura e o visual do design de referência (Q1 = B):
- **Início**: capa da viagem, "Agora", Destinos, Destaques e Consulta;
- **Cidade**: abas Roteiro, Dicas, Transporte e Bairros;
- **Dia**: capa, "Sobre este dia" e paradas em cartões;
- **Bairro**;
- abas **Dicas** e **Transporte**;
- barra de baixo com Início, Dicas e Transporte.

A paleta é quente, com Fraunces e Inter offline. Cada degradê do design vira a foto real do lugar,
com um véu escuro por cima.

Nenhum dado de roteiro muda. Duas adições ao conteúdo:
- **dicas**, extraídas dos docs do casal sem reescrita e conferidas pela regra D7;
- **`country`** em cada cidade.

As funções das features 006 e 007 são realocadas, não reescritas: próximo passo, Feito, Pular e
Desfazer, marca "agora", motorista, transição, "Reservar hoje", documento e guia. As funções de
domínio continuam as mesmas.

## Technical Context

**Language/Version**: TypeScript 7, Node.js 24 (inalterado).

**Primary Dependencies**: Preact (runtime), `marked`, `zod` e `sharp` (dev). Nenhuma dependência
nova. As fontes Fraunces e Inter entram como arquivos WOFF2 com licença OFL, sem pacote (R1).

**Storage**: o estado do usuário não muda. Mudanças no conteúdo:
- `content/trip.json` ganha `country`;
- `FullItinerary.tips` é gerado no build;
- as fontes ficam em `public/fonts/`.

**Testing**:
- Vitest para:
  - o domínio novo (`notebook.ts`: modelos de capa e de cartões);
  - a extração das dicas e a regra D7;
  - os componentes das telas novas;
  - os termos do design (SC-002);
  - a cobertura de fotos (SC-003).
- Playwright para:
  - os fluxos das stories;
  - os redirecionamentos;
  - o modo offline com as fontes;
  - a acessibilidade nos temas claro, escuro e alto contraste.
- Os testes de página das features 006 e 007 são adaptados às novas telas, cobrindo as mesmas
  funções.

**Target Platform / Project Type**: PWA estática que já existe (Safari iOS e Chrome Android).

**Performance Goals**:
- JS inicial < 100 KB gzip (hoje 33 KB);
- conteúdo ≤ 40 MB (hoje 24,3 MB, mais ~120 KB de fontes);
- troca de tela imediata;
- fotos fora da tela carregam ao rolar (`loading="lazy"`).

**Constraints**:
- nenhum texto do design (FR-008);
- nenhum dado inventado nas abas Dicas e Transporte (FR-007, D7);
- offline (FR-015);
- os mínimos de acessibilidade da 006 (FR-014);
- a viagem começa em 31/10/2026 (hoje é 27/10).

**Scale/Scope**:
- 6 telas novas ou redesenhadas (Início, Cidade, Dia, Bairro, Dicas, Transporte);
- 7 telas restilizadas: detalhe, motorista, guia, ponto, documento, créditos e roteiros do casal;
- ~13 dicas;
- 3 cidades, 22 dias e ~80 regiões.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio / Regra | Como o plano atende | Status |
|---|---|---|
| I. Offline-first | Fontes, ícones e fotos no precache; nada novo depende de rede; "Ver fotos" e mapa continuam avisando offline | ✅ |
| I. Falha explícita | Aba sem dado diz "Sem informações no roteiro desta cidade."; sem foto, degradê com ícone | ✅ |
| II. Testes por user story | US1 Dia, US2 Início, US3 Cidade, US4 Dicas/Transporte: componentes + E2E com cenário offline; D7 e SC-002 automáticos | ✅ |
| II. Regressão | As funções da 006/007 continuam testadas na nova estrutura; snapshot de NY intocado | ✅ |
| III. Menor solução | Reaproveita o domínio (`trip-view`, `now`, `full-itinerary`); só acrescenta `notebook.ts` (modelos de tela) e componentes de apresentação | ✅ |
| III. Dependências | Nenhuma nova. As fontes são assets com licença (~120 KB), justificadas em R1 | ✅ |
| Restrições de plataforma | Mobile-first, PWA, Safari iOS e Chrome Android | ✅ |
| Fluxo Spec Kit | specify → plan → tasks → implement; commits só com autorização | ✅ |

**Resultado**: aprovado. Re-checagem pós-design: mantido (ver Complexity Tracking).

## Project Structure

### Documentation (this feature)

```text
specs/008-travel-notebook-ui/
├── spec.md · plan.md · research.md · data-model.md · quickstart.md
├── contracts/
│   ├── screens.md         # telas, blocos, rotas, redirecionamentos
│   └── tips-content.md    # origem e categorias das dicas; regra D7
├── design-reference/      # capturas do design (só visual)
├── checklists/requirements.md
└── tasks.md               # /speckit-tasks
```

### Source Code (repository root)

```text
public/fonts/                     # NOVO: fraunces-600.woff2, inter-400.woff2, inter-600.woff2, OFL.txt
content/trip.json                 # ALTERADO: country por cidade
scripts/
├── doc-parser.ts                 # ALTERADO: extrai dicas (R6) + regra D7
├── content-schema.ts             # ALTERADO: country obrigatório
├── full-itinerary-schema.ts      # ALTERADO: tips
└── build-content.ts              # ALTERADO: tips no FullItinerary; resumo no console
src/
├── content/types.ts              # ALTERADO: City.country, Tip, FullItinerary.tips
├── domain/notebook.ts            # NOVO: TripCover, CityCard/Cover, DayCard/Cover, StopCard, NeighborhoodCard, TransportView
├── components/
│   ├── Cover.tsx                 # NOVO: capa/cabeçalho com foto + véu ou degradê + ícone
│   ├── ProgressRing.tsx          # NOVO: anel de progresso
│   ├── Chip.tsx                  # NOVO: chips (destaque, tipo, ritmo, tag)
│   ├── PillTabs.tsx              # NOVO: abas em pílula
│   ├── SectionTitle.tsx          # NOVO: título serifado com ícone
│   ├── CityCard.tsx · DayCard.tsx · StopCard.tsx · NeighborhoodCard.tsx · TipCard.tsx   # NOVOS
│   ├── TabBar.tsx                # ALTERADO: Início · Dicas · Transporte
│   ├── NextStepCard.tsx          # ALTERADO: estilo do design (cartão "Agora")
│   ├── TransitionBlocks.tsx · ReserveToday.tsx · DayAlerts.tsx · PlaceCard.tsx   # ALTERADOS: estilo
│   └── Icon.tsx                  # ALTERADO: ícones do design (lâmpada, trem, casa, bússola…)
├── pages/
│   ├── Home.tsx → Guide.tsx      # o guia da 001 (rota #/guia, #/guia/:cityId)
│   ├── Start.tsx                 # NOVO: Início (substitui Now + TripOverview)
│   ├── City.tsx                  # NOVO: cidade com abas
│   ├── Day.tsx                   # REESCRITO: capa, Sobre este dia, Paradas
│   ├── Nearby.tsx                # ALTERADO: página do bairro
│   ├── Tips.tsx · Transport.tsx  # NOVOS
│   └── StepDetail.tsx · Driver.tsx · PointDetail.tsx · FullDocument.tsx · Credits.tsx · …   # restilizados
├── app.tsx                       # ALTERADO: rotas e redirecionamentos (contracts/screens.md)
└── styles/base.css               # REESCRITO: tokens do design, temas claro/escuro/alto contraste
tests/
├── unit/notebook.test.ts · unit/doc-parser.test.ts (dicas, D7)
├── content/tips-real.test.ts · content/design-terms.test.ts
├── components/start · city · day · tips-transport · (adaptados: now, trip-overview, nearby, step-detail…)
└── e2e/us-notebook.spec.ts · us-notebook-a11y.spec.ts (adaptados: us-companion, us-orlando)
```

**Structure Decision**: o pipeline de conteúdo e o domínio continuam. Muda a camada de
apresentação: telas novas que compõem os modelos de `notebook.ts` e um conjunto pequeno de
componentes do design. As páginas `Now` e `TripOverview` são substituídas por `Start`. As funções
delas (próximo passo, reservas, progresso, consulta) passam para o Início, como na tabela do FR-005.

## Complexity Tracking

| Item | Por que é necessário | Alternativa mais simples rejeitada porque |
|---|---|---|
| Telas novas (Início, Cidade, Dicas, Transporte) e rotas | Q1 = B: o casal escolheu a estrutura do design | Só restilizar (opção A) foi a opção não escolhida |
| Extração de dicas do doc + D7 | As abas Dicas e Transporte precisam de conteúdo sem inventar | Escrever as dicas à mão viola "não inventar" e o pedido de ignorar os textos do design |
| Fontes como assets (~120 KB) | O tom editorial do design depende da serifada; offline exige arquivos locais | Fonte do sistema perde o design; fonte remota quebra offline |
| `notebook.ts` | Concentra as regras de capa, foto e cartões, testáveis sem tela | Calcular dentro de cada página duplicaria as regras de foto e progresso |
