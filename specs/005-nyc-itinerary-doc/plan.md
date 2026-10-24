# Implementation Plan: Roteiro de Nova York por bairros (doc do Alisson)

**Branch**: `005-nyc-itinerary-doc` | **Date**: 2026-10-22 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-nyc-itinerary-doc/spec.md`

## Summary

Vale o mesmo princípio da feature 004: a exportação Markdown do doc é o próprio arquivo-fonte. Ela
substitui `content/full/nova-york/roteiro.md` sem edição, e o build a converte no que as telas usam.

O que muda é o leitor, porque o doc novo é organizado por **bairro** (`###`) e não por tabelas de
horário:

- os itens com horário (listas e linhas de logística) viram atividades;
- as listas de comida, lojas e locações viram lugares do bairro;
- cada `### 🌙 Noite` vira uma atividade;
- cada `##` vira uma seção do documento completo.

A tela do dia passa a mostrar os bairros em vez de Manhã/Tarde/Noite. A conferência D1–D5 compara o
app com o texto do doc. Atualizar o roteiro depois é exportar o doc de novo e rodar
`npm run content:strict`.

## Technical Context

**Language/Version**: TypeScript 7, Node.js 24 (inalterado).

**Primary Dependencies**: as atuais. `marked` (dev, desde a 004) continua lendo o Markdown. Nenhuma
dependência nova.

**Storage**: `content/full/nova-york/`:
- `roteiro.md`: a exportação do doc, cópia de 22/10, versão 57;
- `meta.json`: compromissos; a chegada ao Knicks passa para 18:30; ajustes declarados;
- `point-links.json`: atualizado.

Estado do usuário inalterado. As marcações `nyv2-…` e `ny-…` ficam órfãs.

**Testing**: Vitest para:
- o leitor, com trechos-fixture de cada bloco;
- o doc real, com contagens independentes;
- os componentes de bairro.

Playwright para os bairros de um dia, um restaurante com mapa e fotos, o checklist, as noites e o
modo offline.

**Target Platform / Project Type**: PWA estática existente.

**Constraints**: fidelidade ao doc (FR-002, SC-001–SC-004); offline (SC-006); prazo 30/10/2026.

**Scale/Scope**:
- 7 dias, 39 seções `###`, 75 itens com horário + 16 linhas de logística com horário, 6 noites/especiais;
- ~120 lugares de comida, lojas e locações;
- 85 links de fotos e 160 de mapa.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio / Regra | Como o plano atende | Status |
|---|---|---|
| I. Offline-first | Cópia do doc convertida no build e pré-cacheada; links de fotos e mapa avisam quando offline | ✅ |
| I. Falha explícita do que exige rede | "Ver fotos" e "Abrir no mapa" offline mostram aviso + endereço | ✅ |
| II. Testes por user story | Leitor (unidade), doc real (conteúdo), componentes, E2E por story com cenário offline | ✅ |
| III. Menor solução | Um leitor só, para o formato atual; o da 004 é substituído, não mantido em paralelo | ✅ |
| III. Dependências | Nenhuma nova | ✅ |
| Fluxo Spec Kit | Commits das features 003 e 004 antes, com autorização | ✅ |

**Resultado**: aprovado. Re-checagem pós-design: mantido.

## Project Structure

### Documentation (this feature)

```text
specs/005-nyc-itinerary-doc/
├── plan.md · research.md · data-model.md · quickstart.md
├── contracts/
│   ├── document-format.md     # como cada bloco do doc é lido
│   └── validation-rules.md    # regras F mantidas/removidas + D1–D5
├── source/roteiro-2026-10-22-v57.md   # cópia de referência usada na spec
└── tasks.md
```

### Source Code (repository root)

```text
content/full/nova-york/
├── roteiro.md            # SUBSTITUÍDO pela exportação do doc (sem edição)
├── meta.json             # ALTERADO: Knicks chegada 18:30; checklistOverrides (Q1)
└── point-links.json      # ALTERADO: nomes do doc novo → pontos do guia

scripts/
├── nyc-doc-parser.ts     # REESCRITO para o formato por bairros
├── full-itinerary-schema.ts  # ALTERADO: tipo 'free', áreas, photoUrls; F10/F11/F8 conforme contrato
└── build-content.ts      # ALTERADO: aplica checklistOverrides; imprime o resumo novo

src/
├── content/types.ts      # ALTERADO: DayArea, Activity.areaId, tipo 'free', DocPlace.photoUrls/price/queue
├── domain/trip-view.ts   # ALTERADO: 'free' não conta; dia com áreas
├── components/
│   ├── LinkButtons.tsx   # NOVO (substitui MapsButton): "Ver fotos" + "Abrir no mapa", offline com aviso
│   ├── PlaceCard.tsx     # ALTERADO: preço/fila, nível ☕🏆🍰, fotos
│   └── AreaSection.tsx   # NOVO: um bairro (cabeçalho, itens, listas, notas, deslocamento)
├── pages/Destination.tsx # ALTERADO: dia por bairros quando houver áreas
├── pages/ActivityDetail.tsx # ALTERADO: bairro de origem, fotos
└── styles/base.css       # ALTERADO: bairro, listas

tests/ (unit/nyc-doc-parser, content/nyc-doc-real, components/area-section, e2e/us-nyc-doc)
```

**Structure Decision**: mesmo pipeline da 004 (Markdown → build → `content.json`). O leitor e a tela
do dia passam a trabalhar com bairros. O resto é reaproveitado: `PlaceCard`, documento completo,
checklist, Feito/Pendente e progresso.

## Complexity Tracking

| Item | Por que é necessário | Alternativa mais simples rejeitada porque |
|---|---|---|
| Reescrever o leitor | O formato mudou (bairros e listas no lugar de tabelas) | Transcrever ~200 itens à mão: erro, perda de fidelidade e retrabalho a cada edição do doc |
| `checklistOverrides` no meta | Aplicar a decisão Q1 (Tenement 16h15) sem editar a cópia do doc | Editar o `roteiro.md`: quebraria a regra "cópia sem edição" e se perderia na próxima exportação |
