# Implementation Plan: Roteiro de Orlando (doc do Alisson)

**Branch**: `007-orlando-itinerary-doc` | **Date**: 2026-10-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/007-orlando-itinerary-doc/spec.md`

## Summary

O plano segue o caminho da feature 005: a exportação Markdown do doc entra sem edição em
`content/full/orlando/roteiro.md`, e o build a converte no que as telas usam. O leitor de Nova York
passa a aceitar também o formato de Orlando:
- hora com 1 dígito, "ou", `###` de volta ao hotel e de deslocamento;
- atrações com fila, área e forma de entrar na mesma linha;
- listas simples de comida e de mercados.

A saída de Nova York precisa continuar idêntica, garantida por um snapshot.

Os dias de locomoção recebem o Dia 1 do doc (chegada) e a partida. A partida passa por uma
declaração no `meta.json` que cita o doc e aplica a Q1: trem para Miami, sem a frase do voo. Os
roteiros sugeridos saem dos dias de Orlando. "Agora" ganha a seção "Reservar hoje" para os Multi
Pass. O documento completo e a "Viagem" passam a ser por cidade. As fotos offline de cada atração
seguem a 006 (Q2 = A).

## Technical Context

**Language/Version**: TypeScript 7, Node.js 24 (inalterado).

**Primary Dependencies**: as atuais (Preact, `marked` em dev, `zod` em dev). Nenhuma dependência
nova.

**Storage**: `content/full/orlando/` com:
- `roteiro.md`, `meta.json`, `point-links.json`, `doc-photos.json`, `photo-credits.json`;
- fotos em `public/photos/doc/orlando/`.

`content/trip.json` tem os `dayKinds` de Orlando corrigidos. O estado do usuário não muda de formato
(`data-model.md`).

**Testing**:
- Vitest:
  - o leitor, com fixtures dos blocos novos e o snapshot de NY;
  - o doc real de Orlando, com contagens independentes;
  - as regras de validação;
  - `dayView` sem sugeridos;
  - os componentes (passo com fila/acesso, "Reservar hoje", blocos de locomoção, Viagem).
- Playwright: os cenários do `quickstart.md`, offline incluído.
- Os testes atuais que usam Orlando como exemplo de dia sem horários passam a usar Miami.

**Target Platform / Project Type**: PWA estática existente.

**Performance Goals**: conteúdo ≤ 40 MB (hoje 18,8 MB, ~25 MB depois); JS inicial < 100 KB gzip
(hoje 32,2 KB).

**Constraints**:
- fidelidade ao doc (FR-002, D1–D6);
- offline (SC-006);
- não inventar dados: hotel e trem sem detalhes;
- prazo: a viagem começa em 31/10 e Orlando em 07/11.

**Scale/Scope**:
- 10 dias de parque/folga, 1 chegada, 1 partida;
- 75 itens com horário, 18 linhas de logística, 2 compras;
- 32 lugares de comida e mercado;
- 81 links de fotos, 10 mapas do dia;
- ~67 fotos novas.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio / Regra | Como o plano atende | Status |
|---|---|---|
| I. Offline-first | Roteiro e fotos entram no `content.json` e no precache; "Ver fotos" e mapa avisam offline | ✅ |
| I. Falha explícita | Sem hotel no doc: sem botão de motorista para a volta, em vez de endereço inventado | ✅ |
| II. Testes por user story | US1: leitor + doc real + "Agora"/Dia (unidade e E2E). US2: dias de folga + "Por perto" (componente e E2E). US3: reservas, chegada/partida, documento (componente e E2E offline) | ✅ |
| II. Regressão | Snapshot da saída de NY antes de mexer no leitor; testes atuais de NY intactos | ✅ |
| III. Menor solução | Um leitor estendido; declarações pequenas no `meta.json` (`arrivalDay`, `departure`, `idPrefix`) em vez de casos especiais no código | ✅ |
| III. Dependências | Nenhuma nova | ✅ |
| Fluxo Spec Kit | specify → plan → tasks → implement; commits só com autorização (003–007 pendentes) | ✅ |

**Resultado**: aprovado. Re-checagem pós-design: mantido. Ver Complexity Tracking para as duas
declarações novas.

## Project Structure

### Documentation (this feature)

```text
specs/007-orlando-itinerary-doc/
├── spec.md · plan.md · research.md · data-model.md · quickstart.md
├── contracts/
│   ├── document-format.md   # leitura do doc de Orlando + D1–D6
│   └── ui.md                # o que muda nas telas da 006
├── source/roteiro-2026-10-24-rev26.md
├── checklists/requirements.md
└── tasks.md                 # /speckit-tasks
```

### Source Code (repository root)

```text
content/
├── full/orlando/                 # NOVO: roteiro.md, meta.json, point-links.json, doc-photos.json, photo-credits.json
└── trip.json                     # ALTERADO: dayKinds de Orlando

scripts/
├── doc-parser.ts                 # RENOMEADO de nyc-doc-parser.ts e ESTENDIDO (R2–R6); D1–D6
├── build-content.ts              # ALTERADO: idPrefix, arrivalDay, departure, arrivals
├── full-itinerary-schema.ts      # ALTERADO: base/arrival.time opcionais, arrivals, ids tr:…:cN, ck:…, F2/F10 por cidade
└── fetch-photos.ts               # ALTERADO: --doc percorre content/full/*; Orlando em photos/doc/orlando/

src/
├── content/types.ts              # ALTERADO: arrivals, DepartureItem.block 'arrival', ChecklistItem.id, DocPlace.land, meta opcionais
├── domain/trip-view.ts           # ALTERADO: sem sugeridos em dia com FullDay; queue/land/access; pointId da região
├── components/
│   ├── TimelineRow.tsx           # ALTERADO: fila, área, acesso
│   ├── NextStepCard.tsx          # ALTERADO: fila, área, acesso
│   ├── TransitionBlocks.tsx      # ALTERADO: chegada com itens e HTML
│   └── ReserveToday.tsx          # NOVO: "Reservar hoje"
├── pages/
│   ├── Now.tsx                   # ALTERADO: ReserveToday (dias normais e de locomoção)
│   ├── StepDetail.tsx            # ALTERADO: fila, área, acesso
│   ├── TripOverview.tsx          # ALTERADO: reservas e consulta por cidade
│   └── FullDocument.tsx          # ALTERADO: por cidade
└── app.tsx                       # ALTERADO: #/full/:cityId/documento[/:section]

tests/
├── unit/doc-parser.test.ts       # RENOMEADO + fixtures de Orlando + snapshot de NY
├── content/orlando-doc-real.test.ts   # NOVO
├── content/doc-photos.test.ts    # ALTERADO: por cidade
├── components/…                  # reserve-today, transition, step com fila; Orlando → Miami onde era "dia sem horários"
└── e2e/us-orlando.spec.ts        # NOVO
```

**Structure Decision**: o pipeline Markdown → build → `content.json` não muda. Orlando entra como
mais uma pasta em `content/full/`. O código passa a ler a cidade dos dados em vez de assumir Nova
York. Isso vale para o documento, a "Viagem", as regras F2/F10 e o prefixo dos ids.

## Complexity Tracking

| Item | Por que é necessário | Alternativa mais simples rejeitada porque |
|---|---|---|
| `meta.departure` com `quote` conferido | Aplicar a Q1: mostrar só o que vale para o trem e acrescentar "De trem para Miami", que é dado do casal | Editar a cópia do doc quebra a regra "sem edição"; mostrar a partida inteira contradiz a Q1 |
| `meta.arrivalDay` | O Dia 1 do doc cai num dia de locomoção do app, que não é um `FullDay` | Tratar 07/11 como dia de Orlando quebraria os três blocos da 006 e o F3 |
| Snapshot da saída de NY | O leitor é compartilhado; qualquer mudança de id de NY órfãs as marcas do casal | Testes pontuais não pegam mudanças de id, título ou ordem em 7 dias |
