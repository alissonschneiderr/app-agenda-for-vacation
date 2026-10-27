# Implementation Plan: Roteiro de Miami do casal (18 a 20/11), na mesma estrutura de Nova York e Orlando

**Branch**: `main` (a pedido do usuário) | **Date**: 2026-10-27 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/012-miami-itinerary-doc/spec.md`

## Summary

O documento "Roteiro Miami — 18 a 20 de novembro" entra no app como terceiro roteiro do casal,
em `content/full/miami/`, no mesmo formato e com o mesmo leitor de NY e Orlando. Assim, os dias de
Miami ganham toda a experiência das features 009 a 011.

O 18/11 continua dia de viagem e ganha a tarde em South Beach como dia comum (Q1 = A). Para isso,
o leitor aprende a separar só a seção "### 🚆 Chegada…" para o bloco "A chegada"; Orlando não muda.

Os roteiros sugeridos antigos de Miami são apagados do conteúdo e do aparelho (Q2 = B). O leitor
também aprende a tabela de reservas de Miami. As fotos vêm do Wikimedia, como na 007. Detalhes em
[research.md](research.md).

## Technical Context

**Language/Version**: TypeScript 5 (strict), Node 24 (build do conteúdo e script de fotos)

**Primary Dependencies**: as atuais (Preact, Vite, vite-plugin-pwa, marked no leitor); **nenhuma
dependência nova**

**Storage**:
- conteúdo estático gerado no build (`content/full/miami/` → `content.json`);
- estado do aparelho em localStorage, com uma limpeza dos sugeridos sem fonte (R5).

**Testing**:
- Vitest:
  - conteúdo real contra a cópia do documento;
  - leitor com fixture;
  - estado;
  - componentes.
- Playwright: `chromium`, `mobile-360` e `mobile-402`.

**Target Platform**: PWA offline, Safari iOS e Chrome Android, 360 × 780 e 402 × 874

**Project Type**: app web de página única (PWA)

**Performance Goals**: JS inicial < 100 KB gzip (hoje 36,5 KB). O conteúdo e as fotos de Miami
somam cerca de 20–30 webp ao precache, dentro do orçamento (`npm run budget`).

**Constraints**:
- não inventar dados (o roteiro é a cópia fiel do documento; ver R2, R7);
- NY e Orlando sem mudança;
- snapshot de NY intacto;
- offline-first.

**Scale/Scope**:
- 3 dias;
- 4 grupos;
- 11 paradas marcáveis;
- 15 entradas de restaurantes e cafés;
- 5 categorias de lojas;
- 2 locações;
- 6 reservas;
- 1 checklist de praia com 7 itens;
- cerca de 8 seções de dicas.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Situação |
|---|---|
| I. Offline-first | ✅ O roteiro e as fotos entram no precache. Os e2e de 18, 19 e 20/11 rodam offline. |
| II. Testes obrigatórios | ✅ Testes de conteúdo real contra a cópia do documento (SC-001 a SC-004, SC-006). Testes do leitor com fixture (chegada no dia, tabela de reservas). Teste de estado para a limpeza dos sugeridos. Componentes dos 3 dias. E2e a 360 e 402 px. |
| III. Simplicidade | ✅ Reaproveita o leitor, as telas e o fluxo de fotos. Só duas regras novas no leitor, pequenas e testadas, e uma limpeza no estado. A lógica de sugeridos sem conteúdo fica para a revisão de código morto (T final). |
| Plataforma mobile-first | ✅ Sem tela nova. E2e nas duas larguras. |

Pós-design: sem violações.

## Project Structure

### Documentation (this feature)

```text
specs/012-miami-itinerary-doc/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/screens.md
├── checklists/requirements.md
├── source/roteiro-miami-2026-10-27-rev15.md   # cópia do documento (fonte)
├── photos-missing.md                          # na implementação
├── data-review.md                             # na implementação
└── tasks.md                                   # /speckit-tasks
```

### Source Code (repository root)

```text
content/
├── full/miami/            # novo: roteiro.md, meta.json, doc-photos.json, photo-credits.json, point-links.json
├── itineraries.json       # sem os 2 sugeridos de Miami (Q2 = B)
└── trip.json              # dayKinds 19/11 = walk, 20/11 = beach
public/photos/doc/miami/   # novo: fotos do roteiro (Wikimedia, com crédito)

scripts/
└── doc-parser.ts          # chegada dentro de um dia comum (R3); tabela de reservas Data|Item|Situação (R6)

src/
└── storage/user-store.ts  # remove sugeridos cuja fonte sumiu (R5)

tests/
├── content/miami-doc-real.test.ts   # novo: app × cópia do documento
├── unit/doc-parser.test.ts          # chegada no dia + tabela de Miami (fixture)
├── unit/user-store.test.ts          # limpeza dos sugeridos
├── components/miami-day.test.tsx    # novo: 18, 19 e 20/11
├── e2e/us-miami.spec.ts             # novo: 18–20/11 offline, 360 e 402 px
└── (ajustes)                        # testes que semeavam os sugeridos de 19/11 e 20/11
```

**Structure Decision**: o projeto único de sempre. Miami entra como conteúdo. O código muda só no
leitor (duas regras) e no estado (uma limpeza).

## Complexity Tracking

Sem violações a justificar.
