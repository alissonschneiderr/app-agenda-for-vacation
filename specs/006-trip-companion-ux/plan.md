# Implementation Plan: Guia de bolso da viagem (nova experiência do app)

**Branch**: `006-trip-companion-ux` | **Date**: 2026-10-22 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-trip-companion-ux/spec.md`

## Summary

A navegação e as telas são refeitas em torno de quatro abas: **Agora**, **Dia**, **Por perto** e
**Viagem**.

O conteúdo continua vindo do mesmo pipeline:
- Nova York: o doc da feature 005;
- Orlando e Miami: os pontos sugeridos por dia.

O que muda:
- **Domínio novo** (`src/domain/now.ts`): próximo passo, marca "agora", região atual, "como chegar"
  e tipo de dia, sobre a visão de dia que já existe (`trip-view`).
- **Leitor do doc**: entrega também os avisos do dia separados e a partida como itens marcáveis.
- **Fotos offline** (Q2): o script de fotos ganha um modo "roteiro" e baixa da Wikimedia Commons uma
  foto por região e por passo com horário, em tamanho menor.
- **Fora da navegação** (Q3): favoritos e "Meus roteiros"; o guia fica em "Viagem".
- **Tipografia e contraste revistos**: texto principal com 17 px, alvos de toque com 48 px, contraste
  7:1 no essencial, e um modo de alto contraste para o sol.

## Technical Context

**Language/Version**: TypeScript 7, Node.js 24 (inalterado).

**Primary Dependencies**: as atuais (Preact 11, Leaflet, vite-plugin-pwa; `sharp` e `marked` só no
build). Nenhuma dependência nova. O gesto de deslizar entre dias é feito com Pointer Events, sem
biblioteca.

**Storage**:
- conteúdo pré-cacheado, como hoje;
- `UserState` v2 inalterado: as marcações dos itens de transição usam a mesma `activityMarks`, com a
  chave `tr:<data>:<n>`;
- preferências do aparelho em `localStorage` (`ctha:prefs`): avisos lidos e alto contraste. Ler e
  gravar sempre protegido; sem esse armazenamento, o app só volta ao padrão.

**Testing**: Vitest para:
- domínio `now.ts`: próximo passo, marca agora, região atual, como chegar e tipo de dia, com relógio
  fixo;
- leitor: avisos e partida;
- componentes: cartão Agora, linha do tempo, Por perto, Motorista, Transição.

Playwright para:
- um cenário por story, incluindo offline;
- contraste do essencial e alvos de 48 px.

**Target Platform**: PWA no celular (390 × 844 de referência). O desktop continua funcionando.

**Performance Goals**:
- "Agora" desenhada em menos de 1 s depois de abrir, com o conteúdo já em cache;
- JS inicial abaixo de 100 KB gzip (limite atual);
- pacote offline abaixo de 40 MB (hoje 14,8 MB; as ~100 fotos novas, de ~90 KB, somam ~9 MB).

**Constraints**: offline (FR-024); 2 toques (FR-003); nenhuma ação definitiva (FR-020); prazo
30/10/2026.

**Scale/Scope**:
- 4 abas, 3 telas de apoio (detalhe, motorista, transição), 1 modo de exibição (alto contraste);
- 26 dias, 3 cidades;
- ~100 fotos novas.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio / Regra | Como o plano atende | Status |
|---|---|---|
| I. Offline-first | Todas as telas usam o conteúdo em cache; as fotos novas são pré-cacheadas; mapas e fotos externas avisam e oferecem "Mostrar ao motorista" | ✅ |
| I. Falha explícita | Botões que precisam de rede mostram aviso + alternativa offline | ✅ |
| II. Testes por user story | E2E por story com cenário offline; unidade para o domínio com relógio fixo | ✅ |
| II. Domínio testado | `now.ts` é puro (conteúdo + estado + relógio → resultado) | ✅ |
| III. Simplicidade | Sem dependências novas; reuso de `trip-view`, `PlaceCard`, `LinkButtons` e do script de fotos; telas antigas substituídas, não mantidas em paralelo | ✅ |
| III. Abstrações justificadas | `now.ts` concentra as regras de "agora", testáveis sem tela | ✅ |
| Dados só de fontes reais | Fotos só da Commons/Wikipédia com licença livre e crédito; sem foto fiel → ícone (FR-026) | ✅ |
| Fluxo Spec Kit | Commits das features 003–005 antes, com autorização | ✅ |

**Resultado**: aprovado. Re-checagem pós-design: mantido.

## Project Structure

### Documentation (this feature)

```text
specs/006-trip-companion-ux/
├── plan.md · research.md · data-model.md · quickstart.md
├── contracts/
│   ├── routes.md          # rotas novas, redirecionamentos das antigas
│   └── ui-screens.md      # o que cada tela mostra, em que ordem, e os estados
└── tasks.md
```

### Source Code (repository root)

```text
content/
├── trip.json                         # ALTERADO: dayKinds (tipo de cada dia)
└── full/nova-york/doc-photos.json    # NOVO: nome do lugar no doc → arquivo da Commons

scripts/
├── fetch-photos.ts      # ALTERADO: modo "roteiro" (doc-photos.json → public/photos/doc/, 900 px)
├── nyc-doc-parser.ts    # ALTERADO: avisos do dia separados; partida em itens
└── build-content.ts     # ALTERADO: fotos do roteiro, dayKinds

src/
├── domain/now.ts        # NOVO: próximo passo, marca agora, região atual, como chegar, tipo de dia
├── storage/prefs.ts     # NOVO: avisos lidos, alto contraste (localStorage, protegido)
├── pages/
│   ├── Now.tsx          # NOVO: aba Agora (inclui antes/depois da viagem e transição)
│   ├── Day.tsx          # NOVO: aba Dia (substitui Destination.tsx)
│   ├── Nearby.tsx       # NOVO: aba Por perto
│   ├── TripOverview.tsx # NOVO: aba Viagem (substitui Trip.tsx)
│   ├── StepDetail.tsx   # ALTERADO a partir de ActivityDetail.tsx
│   └── Driver.tsx       # NOVO: Mostrar ao motorista
├── components/
│   ├── TabBar.tsx       # NOVO: substitui BottomNav/TopNav
│   ├── NextStepCard.tsx · TimelineRow.tsx · DayAlerts.tsx · TransitionBlocks.tsx · UndoToast.tsx  # NOVOS
│   └── PlaceCard.tsx · LinkButtons.tsx  # ALTERADOS (cartão curto + "Mostrar ao motorista")
└── styles/base.css      # ALTERADO: escala de tipo, 48 px, contraste, modo sol

tests/ (unit/now, unit/prefs, unit/nyc-doc-parser, components/*, e2e/us-companion-*.spec.ts)
```

**Structure Decision**:
- as abas novas substituem `Trip`, `Destination` e `BottomNav`;
- `ActivityDetail` evolui para `StepDetail`;
- `Home` (guia), `PointDetail` e `FullDocument` continuam, acessados por "Viagem";
- `Favorites` e `Itineraries` saem da navegação, com as rotas mantidas para não perder dados.

## Complexity Tracking

| Item | Por que é necessário | Alternativa mais simples rejeitada porque |
|---|---|---|
| `src/domain/now.ts` | O "agora" depende de fuso, horários sem fim, intervalos livres e marcações; precisa de testes com relógio fixo | Calcular dentro das telas: regras repetidas em Agora, Dia e Por perto, sem teste |
| `ctha:prefs` separado do `UserState` | Avisos lidos e alto contraste são preferências do aparelho, não dados da viagem | Pôr no `UserState`: exigiria migração v3 e misturaria preferência com progresso |
| Fotos do roteiro (~100) | Q2: reconhecer o lugar sem internet | Só links: não funcionam offline |
