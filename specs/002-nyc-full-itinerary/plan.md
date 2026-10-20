# Implementation Plan: Roteiro FULL de Nova York

**Branch**: `002-nyc-full-itinerary` | **Date**: 2026-10-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-nyc-full-itinerary/spec.md`

## Summary

Substituir os 7 roteiros simples de Nova York da feature 001 por um roteiro FULL hora a hora
(31/10–06/11/2026) para o casal hospedado no POD 51, com refeições, compras, locais de séries,
deslocamentos, compromissos fixos (Knicks 02/11 19h30; *MJ* 04/11 19h), prioridades, alternativas e
checklist. O conteúdo é pesquisado e escrito pelo Claude num único arquivo-fonte
(`content/full/nova-york.json`), validado no build por regras automáticas (sobreposição de horário,
margem dos compromissos, restrições alimentares e de lojas, fontes das informações). O app exibe esse
conteúdo de duas formas a partir da mesma fonte: agenda por dia (com marcação feita/pulada e
destaque da próxima atividade) e um documento completo imprimível/PDF. Tudo offline, sem backend,
sem novas dependências.

## Technical Context

**Language/Version**: TypeScript 7, Node.js 24 (mesma base da feature 001)

**Primary Dependencies**: as da feature 001 (Preact 11, Leaflet, vite-plugin-pwa). **Nenhuma
dependência nova**: o documento usa a impressão nativa do navegador (`window.print()` +
`@media print`).

**Storage**: conteúdo em `content/full/nova-york.json`, incorporado ao `public/data/content.json`
no build (pré-cacheado). Marcações feita/pulada no `localStorage`, no estado do usuário, que passa
para `schemaVersion: 2` com migração testada a partir da v1.

**Testing**: Vitest (regras de validação, marcações, próxima atividade, migração, componentes) e
Playwright (agenda offline, marcação persistente, documento completo).

**Target Platform**: igual à 001 (PWA; Safari iOS 17+, Chrome Android, desktop). Impressão/PDF pelo
menu do navegador (no iPhone: Compartilhar → Imprimir → gesto de zoom para PDF, ou "Salvar em
Arquivos").

**Project Type**: extensão da aplicação web (PWA) estática existente.

**Performance Goals**: abrir o dia atual e ver a próxima atividade em < 10 s (SC-008) — na prática
< 2 s com conteúdo em cache; JS inicial continua < 100 KB gzip.

**Constraints**: 100% offline (Princípio I); dados do usuário só no aparelho; nenhuma informação
de horário/preço sem fonte ou marca "não confirmado" (FR-021); prazo de embarque 31/10/2026.

**Scale/Scope**: 7 dias, ~12–18 atividades por dia (≈ 100 atividades), ~28 refeições, ~15–25 lojas,
~20–30 locais de séries, ~15 itens de checklist; 3 telas novas.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio / Regra | Como o plano atende | Status |
|---|---|---|
| I. Spec declara fluxos offline | FR-026, FR-027 | ✅ |
| I. Fluxos essenciais offline | Roteiro FULL dentro do `content.json` pré-cacheado; documento é uma rota do app | ✅ |
| I. Dados criados offline não se perdem | Marcações gravadas de forma síncrona no `localStorage` (mesmo store da 001) | ✅ |
| I. Indicar offline/desatualizado | Banner offline existente + fonte e data em cada informação verificável | ✅ |
| I. Falha explícita do que exige rede | Links de "Como chegar" e de reserva avisam quando offline (componente existente) | ✅ |
| II. Testes por user story | Unidade + componente + E2E para US1–US4 (ver quickstart) | ✅ |
| II. Testes de domínio/armazenamento | Regras do roteiro, próxima atividade, marcações, migração v1→v2 | ✅ |
| II. Teste sem rede por fluxo offline | E2E: agenda, marcação e documento com `setOffline(true)` | ✅ |
| II. CI verde | `content:strict` passa a validar o roteiro FULL; mesmo workflow | ✅ |
| III. Menor solução | Sem dependência nova; documento = página do app com CSS de impressão; sem gerador de PDF | ✅ |
| III. Dependências justificadas | Nenhuma nova | ✅ |
| III. Abstrações justificadas | Nenhuma camada nova; módulo de domínio `full-itinerary.ts` no padrão de `domain/` | ✅ |
| Plataforma PWA mobile-first | Agenda mobile-first; documento também legível no celular | ✅ |
| Fluxo Spec Kit / branch / PR | Branch `002-nyc-full-itinerary` (após o commit da 001, pendente de autorização) | ✅ |

**Impacto na feature 001** (não é violação, mas exige ajuste explícito): a regra de conteúdo
"exatamente 19 roteiros sugeridos" (001 FR-023, contrato de conteúdo regra 5) passa a ser "cada dia
de passeio é coberto por um roteiro sugerido **ou** por um dia de roteiro FULL". Os 7 sugeridos de
Nova York saem de `content/itineraries.json` (002 FR-028).

**Resultado**: aprovado. Re-checagem pós-design: mantido, sem violações.

## Project Structure

### Documentation (this feature)

```text
specs/002-nyc-full-itinerary/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── full-itinerary-content.md   # formato de content/full/*.json e regras de validação
│   ├── user-storage-v2.md          # marcações feita/pulada e migração v1→v2
│   └── routes.md                   # telas novas
└── tasks.md                        # /speckit-tasks
```

### Source Code (repository root)

```text
content/
├── full/
│   └── nova-york.json          # NOVO: fonte única do roteiro FULL (app + documento)
└── itineraries.json            # ALTERADO: sem os 7 sugeridos de Nova York

scripts/
├── full-itinerary-schema.ts    # NOVO: schema Zod + regras (FR-004–FR-024, SC-001–SC-007)
├── content-schema.ts           # ALTERADO: regra de cobertura dos dias (sugerido OU FULL)
└── build-content.ts            # ALTERADO: inclui fullItineraries no content.json

src/
├── content/types.ts            # ALTERADO: tipos FullItinerary, FullDay, Activity…
├── domain/full-itinerary.ts    # NOVO: próxima atividade, horário-limite, resumo do checklist
├── storage/types.ts            # ALTERADO: UserState v2 (activityMarks)
├── storage/user-store.ts       # ALTERADO: migração v1→v2
├── pages/
│   ├── FullOverview.tsx        # NOVO: #/full/nova-york
│   ├── FullDay.tsx             # NOVO: #/full/nova-york/:date
│   ├── FullDocument.tsx        # NOVO: #/full/nova-york/documento
│   └── Itineraries.tsx         # ALTERADO: dias de NY apontam para o roteiro FULL
├── components/
│   ├── ActivityCard.tsx        # NOVO: atividade com marcação, deslocamento, fonte
│   └── InfoSource.tsx          # NOVO: "Fonte: … · verificado em …" / "não confirmado"
└── styles/base.css             # ALTERADO: estilos da agenda e @media print

tests/
├── unit/full-itinerary.test.ts, user-store-migration.test.ts
├── content/full-itinerary-rules.test.ts
├── components/full-day.test.tsx, full-document.test.tsx
└── e2e/us-full-itinerary.spec.ts
```

**Structure Decision**: mesma estrutura da 001. O roteiro FULL é conteúdo editorial em `content/`,
validado por script no build, e exibido por 3 páginas novas. App e documento leem o mesmo objeto
(FR-025a).

## Cronograma (prazo: instalado até 30/10/2026)

| Datas | Entrega |
|---|---|
| 20–21/10 | Tipos, schema e regras de validação com testes; migração v1→v2; casca das 3 telas |
| 21–24/10 | Pesquisa e redação do roteiro FULL (7 dias), com fontes; validação strict passando |
| 24–25/10 | Agenda (US1), refeições/compras (US2), séries (US3), planos B e checklist (US4); documento |
| 26–27/10 | E2E offline, revisão visual no celular, impressão/PDF |
| 28–29/10 | Revisão do casal (junto com a revisão da 001) e correções |
| 30/10 | Instalação e teste em modo avião |

## Complexity Tracking

Sem violações da constituição; nada a justificar.
