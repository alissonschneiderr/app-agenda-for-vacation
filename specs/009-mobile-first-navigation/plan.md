# Implementation Plan: Navegação mobile first

**Branch**: `009-mobile-first-navigation` | **Date**: 2026-10-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/009-mobile-first-navigation/spec.md`

## Summary

Enxugar a navegação das telas da feature 008 para o uso no celular:
- **Início**: só os 3 cards de cidade;
- **Cidade**: só a capa curta e os cards de dia;
- **Dia**: menu de seções preso no topo (Paradas, Restaurantes e Cafés, Brechós e Lojas, Bairros,
  Transporte, Dicas), só com o que tem conteúdo;
- **Atração**: descritivo completo antes das informações práticas;
- **cards**: todos clicáveis em toda a área (stretched link);
- **cabeçalho**: fixo com voltar e áreas seguras;
- **barra de baixo**: sai.

Saem também "Agora", "Reservar hoje", Destaques, Consulta e as páginas Dicas e Transporte da viagem
(Q1 = B, Q3 = A). Guia, documento, créditos e a nova `#/exibicao` (alto contraste) continuam por
endereço direto. O conteúdo não muda.

## Technical Context

**Language/Version**: TypeScript 7, Node.js 24 (inalterado).

**Primary Dependencies**: Preact (runtime); nenhuma nova. O IntersectionObserver usado no menu do dia
é nativo do navegador.

**Storage**: sem mudança. Conteúdo e estado do usuário seguem iguais. As marcas `ck:` ficam sem tela.

**Testing**:
- Vitest para:
  - `daySections` e `dayPlaces` (domínio);
  - as páginas Início, Cidade, Dia e Atração;
  - os redirecionamentos.
- Playwright a 360 × 780 e a 402 × 874 para:
  - a navegação por toque no meio dos cards;
  - rolagem lateral e alvos;
  - menus sem seções vazias;
  - descritivo visível;
  - offline;
  - acessibilidade nos 3 temas.
- Saem os testes de "Agora", "Reservar hoje", Tips, Transport e das abas da cidade.

**Target Platform / Project Type**: PWA existente, mobile first.

**Performance Goals**: JS inicial < 100 KB gzip (hoje 39 KB, deve cair com as telas removidas);
conteúdo ≤ 40 MB.

**Constraints**:
- não mudar o conteúdo;
- não inventar dados;
- offline;
- acessibilidade da 006/008;
- viagem em 31/10.

**Scale/Scope**:
- 4 telas reestruturadas (Início, Cidade, Dia, Atração);
- 6 seções por dia;
- 22 dias;
- ~3 telas e componentes removidos.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio / Regra | Como o plano atende | Status |
|---|---|---|
| I. Offline-first | Nada novo depende de rede; telas continuam no precache | ✅ |
| I. Falha explícita | Seções sem conteúdo não aparecem (pedido); links de mapa continuam avisando offline | ✅ |
| II. Testes por user story | US1 navegação + larguras; US2 menu do dia + seções; US3 atração. Componentes e E2E com offline | ✅ |
| III. Menor solução | Remove telas e componentes sem uso; um padrão único de card; um menu com âncoras em vez de abas | ✅ |
| III. Dependências | Nenhuma | ✅ |
| Fluxo Spec Kit | specify → plan → tasks → implement; commits só com autorização (008 e 009 pendentes) | ✅ |

**Resultado**: aprovado. Re-checagem pós-design: mantido.

## Project Structure

### Documentation (this feature)

```text
specs/009-mobile-first-navigation/
├── spec.md · plan.md · research.md · data-model.md · quickstart.md
├── contracts/screens.md
├── checklists/requirements.md
├── data-review.md      # gerado na implementação (FR-022)
├── report.md           # relatório da entrega (FR-022)
└── tasks.md            # /speckit-tasks
```

### Source Code (repository root)

```text
index.html                         # ALTERADO: viewport-fit=cover
src/
├── domain/notebook.ts             # ALTERADO: daySections, dayPlaces, dataReview
├── components/
│   ├── CardLink.tsx               # NOVO: card com link esticado, seta › e :active
│   ├── CityCard.tsx · DayCard.tsx · NeighborhoodCard.tsx · PlaceCard.tsx (short)   # ALTERADOS: padrão CardLink
│   ├── StopCard.tsx               # ALTERADO: card inteiro abre o detalhe; círculo e seta acima do link
│   ├── SectionMenu.tsx            # NOVO: chips com âncoras presos no topo + seção atual
│   ├── PageHeader.tsx             # ALTERADO: fixo, áreas seguras, 1 linha
│   ├── TabBar.tsx · ReserveToday.tsx · PillTabs.tsx · TipCard.tsx   # REMOVIDOS (se sem uso)
│   └── NextStepCard.tsx           # REDUZIDO aos helpers usados por motorista e dia
├── pages/
│   ├── Start.tsx                  # REESCRITO: só os cards de cidade
│   ├── City.tsx                   # REESCRITO: capa curta + dias
│   ├── Day.tsx                    # ALTERADO: menu de seções e seções novas
│   ├── StepDetail.tsx             # ALTERADO: ordem título → descritivo → práticas; sem "Ler mais"
│   ├── Display.tsx                # NOVO: #/exibicao (alto contraste)
│   ├── Now.tsx · Tips.tsx · Transport.tsx   # REMOVIDOS (stepHref/driverHref vão para src/lib/links.ts)
├── app.tsx                        # ALTERADO: rotas, redirecionamentos, sem barra de baixo
└── styles/base.css                # ALTERADO: card clicável, cabeçalho fixo, menu do dia, áreas seguras, coluna 520 px
scripts/build-content.ts           # ALTERADO: escreve data-review.md (lugares sem endereço/mapa)
tests/ (unit/notebook, components/start|city|day|step-detail, e2e/us-mobile*.spec.ts; removidos os de Agora/Tips/Transport/abas)
```

**Structure Decision**: o domínio e os componentes de cartão da 008 continuam. Muda a composição das
telas: menos telas, mais conteúdo no dia, um padrão único de card clicável.

## Complexity Tracking

| Item | Por que é necessário | Alternativa mais simples rejeitada porque |
|---|---|---|
| `SectionMenu` com IntersectionObserver | Marcar a seção atual enquanto a página rola (pedido: menu que funcione bem no celular) | Só âncoras, sem indicar a seção, deixa o casal sem saber onde está numa página longa (01/11 tem 24 restaurantes e 17 lojas) |
| `#/exibicao` | Q1 = B pede alto contraste "só pelo endereço direto"; sem rota, ele deixaria de existir | Remover o modo sol quebraria a feature 006 (FR-023) e o FR-021 desta spec |
