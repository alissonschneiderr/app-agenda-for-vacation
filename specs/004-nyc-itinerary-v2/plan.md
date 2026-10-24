# Implementation Plan: Roteiro de Nova York v2 (roteiro do Alisson)

**Branch**: `004-nyc-itinerary-v2` | **Date**: 2026-10-21 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-nyc-itinerary-v2/spec.md`

## Summary

O documento do casal passa a ser **o próprio arquivo-fonte** do roteiro de Nova York: ele é salvo
sem alterações em `content/full/nova-york/roteiro.md`, e o build o converte em (1) dias e atividades no
formato que as telas da feature 003 já usam e (2) as seções gerais em HTML para o documento do app. Uma
correção futura é feita no Markdown e vale para agenda e documento ao mesmo tempo. Os 7 arquivos de dia
antigos saem; as atividades novas ganham IDs novos (`nyv2-…`), então as marcações antigas não se
aplicam; o MJ passa para 05/11 e a chegada ao Garden para 18h50. Regras de validação da feature 002
que contradizem o documento deixam de bloquear.

## Technical Context

**Language/Version**: TypeScript 7, Node.js 24 (inalterado)

**Primary Dependencies**: as atuais (Preact 11, Leaflet, vite-plugin-pwa). **Nova dependência só de
build**: `marked` (dev) — lexer de Markdown para ler o documento e gerar HTML das seções. Nada novo no
bundle do app.

**Storage**: conteúdo em `content/full/nova-york/` (`roteiro.md` + `meta.json` + `point-links.json`),
convertido para `public/data/content.json` no build (pré-cacheado). Estado do usuário inalterado (v2);
marcações antigas ficam órfãs e são ignoradas.

**Testing**: Vitest (parser do documento com trechos-fixture e com o documento real: contagens por dia,
28 refeições com 5 campos, todos os links do Maps), componentes ajustados aos campos novos, Playwright
(dias, detalhes com Maps, documento, 05/11 com MJ, offline).

**Target Platform**: igual (PWA).

**Project Type**: aplicação web (PWA) estática existente.

**Performance Goals**: inalterados; o HTML das seções gerais (~60 KB) entra no `content.json`.

**Constraints**: fidelidade ao documento (FR-003, SC-001–SC-004); offline; prazo 30/10/2026.

**Scale/Scope**: 7 dias, ~110 linhas de horário, 28 lugares de comida, ~30 locações, ~15 lojas do dia,
~20 atrações, 24 + 15 lugares extras, ~200 links do Google Maps.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio / Regra | Como o plano atende | Status |
|---|---|---|
| I. Offline-first | Conteúdo convertido no build e pré-cacheado; links do Maps avisam quando offline | ✅ |
| I. Falha explícita do que exige rede | Botão "Abrir no Google Maps" offline mostra aviso + endereço (padrão do "Como chegar") | ✅ |
| II. Testes por user story | Parser (unidade), componentes, E2E por story (ver quickstart) | ✅ |
| II. Domínio testado | Parser com fixtures de cada tipo de bloco + verificações contra o documento real | ✅ |
| II. Teste sem rede | E2E offline para dia, detalhe e documento | ✅ |
| III. Menor solução | Documento como fonte única (sem reescrever à mão 110 linhas em JSON) | ✅ |
| III. Dependências justificadas | `marked` (dev): lexer Markdown robusto para tabelas/listas/links; escrever um parser de tabelas GFM à mão é mais código e mais risco | ✅ |
| III. Abstrações justificadas | `scripts/nyc-doc-parser.ts` (ver Complexity Tracking) | ✅ |
| Fluxo Spec Kit | Branch `004-nyc-itinerary-v2` a partir da `003` (após o commit da 003) | ✅ |

**Resultado**: aprovado. Re-checagem pós-design: mantido.

## Project Structure

### Documentation (this feature)

```text
specs/004-nyc-itinerary-v2/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── document-format.md   # como o roteiro.md é lido (blocos reconhecidos, regras)
│   └── validation-rules.md  # regras F mantidas, removidas e novas
└── tasks.md
```

### Source Code (repository root)

```text
content/full/nova-york/
├── roteiro.md            # NOVO: o documento, sem alterações de conteúdo
├── meta.json             # ALTERADO: MJ em 05/11 (chegada 18h30); Knicks chegada 18h50
├── point-links.json      # NOVO: nome do lugar no documento → ponto do guia (fotos)
└── 2026-10-31.json …     # REMOVIDOS (7 arquivos)

scripts/
├── nyc-doc-parser.ts     # NOVO: roteiro.md → dias, lugares, seções HTML
├── full-itinerary-schema.ts  # ALTERADO: campos novos; regras conforme validation-rules.md
└── build-content.ts      # ALTERADO: usa o parser quando houver roteiro.md

src/
├── content/types.ts      # ALTERADO: Activity.how/optional/approx/places; FullItinerary.docHtml/dayNotes
├── domain/trip-view.ts   # ALTERADO: expõe lugares, "como ir", opcional, notas do dia
├── components/
│   ├── PlaceCard.tsx     # NOVO: bloco de lugar (comida/loja/locação/atração) + Maps
│   ├── MapsButton.tsx    # NOVO: abre o link do documento; offline avisa
│   └── ActivityRow.tsx   # ALTERADO: "como ir", opcional, "~"
├── pages/
│   ├── Destination.tsx   # ALTERADO: seções do dia do documento (onde comer, locações, compras, atrações, plano B, notas)
│   ├── ActivityDetail.tsx# ALTERADO: lugares vinculados com todos os campos
│   └── FullDocument.tsx  # ALTERADO: renderiza o documento (HTML gerado) com impressão
└── styles/base.css       # ALTERADO: tipografia do documento, tabelas responsivas

tests/
├── unit/nyc-doc-parser.test.ts
├── content/nyc-doc-real.test.ts
├── components/place-card.test.tsx
└── e2e/us-nyc-v2.spec.ts (+ ajustes nos E2E de NY existentes)
```

**Structure Decision**: o Markdown do casal é a fonte; o parser roda no build e entrega o mesmo
`FullItinerary` que as telas já consomem, acrescido de campos opcionais.

## Complexity Tracking

| Item | Por que é necessário | Alternativa mais simples rejeitada porque |
|---|---|---|
| Parser do documento (`nyc-doc-parser.ts`) | Mantém o documento como fonte única e fiel (FR-003): correções futuras no texto valem sem retrabalho | Transcrever à mão ~110 linhas e ~100 lugares para JSON: alto risco de erro/omissão, duas fontes que divergem |
| Dependência de build `marked` | Tabelas GFM, listas aninhadas, links e escapes (`\~`) corretos | Parser próprio de Markdown: mais código e casos de borda |
