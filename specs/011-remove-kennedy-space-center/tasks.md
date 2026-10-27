# Tasks: Tirar o Kennedy Space Center do roteiro de Orlando (13/11 com horário livre)

**Input**: Design documents from `specs/011-remove-kennedy-space-center/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/screens.md, quickstart.md

**Tests**: obrigatórios (constituição, Princípio II). Cada teste vem antes da mudança de conteúdo e
deve falhar primeiro.

**Comandos**: prefixar com `export PATH=/opt/homebrew/opt/node@24/bin:$PATH`. Depois de mudar o
conteúdo, rodar `npm run content` antes dos testes.

**Decisões**:
- **Q1**: Cocoa Beach fica, com a tarde inteira (~13h às ~17h).
- **Q2**: só remover as outras menções. Nenhum outlet novo: os dois grandes já estão no roteiro.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup

- [X] T001 Com autorização do usuário, commitar a feature 010 na branch `010-day-sections-by-neighborhood` e criar a branch `011-remove-kennedy-space-center` a partir dela. Sem autorização, seguir na branch atual e registrar a pendência.
- [X] T002 Conferir a base: `npm run typecheck && npm test` verdes antes de mudar o conteúdo.

---

## Phase 2: Foundational

Nada bloqueante: o trabalho é só de conteúdo e testes.

---

## Phase 3: User Story 1 - 13/11 sem o KSC, com manhã livre e mais tempo em Cocoa Beach (Priority: P1) 🎯 MVP

**Goal**: o dia 13/11 fica "Manhã livre → (carro ~1h) → Cocoa Beach ~13h às ~17h → volta ~17h → Disney Springs".

**Independent Test**: `#/dia/2026-11-13` a 360 e 402 px, offline, conferindo:
- nenhum "Kennedy" na página;
- grupos `['Manhã livre', 'Cocoa Beach', 'Noite: Disney Springs']`;
- Transporte com 1 trecho de carro.

### Tests for User Story 1

- [X] T003 [P] [US1] Em `tests/components/orlando-day.test.tsx`, substituir o teste "13/11: KSC → deslocamento → Cocoa Beach → volta → Disney Springs" por "13/11: Manhã livre → carro → Cocoa Beach (~13h às ~17h) → volta → Disney Springs" (deve falhar):
  - os nomes dos grupos, na ordem `['Manhã livre', 'Cocoa Beach', 'Noite: Disney Springs']`;
  - o texto do dia não contém "Kennedy" nem "KSC";
  - "Deslocamento para Cocoa Beach" aparece antes de "Cocoa Beach" e cita "~1h de carro";
  - o texto de Cocoa Beach contém "13h" e "17h";
  - nenhuma parada com "Atlantis", "Rocket Garden" ou "Bus Tour".
- [X] T004 [P] [US1] Em `tests/unit/notebook.test.ts`, mudar a expectativa de `dayMoves(13/11)` de 2 para 1 trecho, que contém "Cocoa Beach" e "carro". 13/11 continua com a seção `transporte`. Deve falhar.
- [X] T005 [P] [US1] Em `tests/e2e/us-orlando.spec.ts`, o teste "13/11, também offline" passa a esperar `.tl-area-name` = `['Manhã livre', 'Cocoa Beach', 'Noite: Disney Springs']` e `page.getByText(/Kennedy/)` com 0 ocorrências. Renomear o título do teste.
- [X] T006 [P] [US1] Em `tests/content/orlando-doc-real.test.ts`, acrescentar (deve falhar):
  - o `roteiro.md` de Orlando lido do disco não casa `/kennedy|\bksc\b/i`;
  - o título do dia 13/11 é "Folga · Cocoa Beach + Disney Springs";
  - `content/points/orlando.json` continua com `orl-kennedy-space-center` (SC-003).

### Implementation for User Story 1

- [X] T007 [US1] Em `content/full/orlando/roteiro.md`, reescrever a seção "## Dia 7 (sex 13/11)" conforme R2 de `research.md`:
  - **título**: "## Dia 7 (sex 13/11): Folga · Cocoa Beach + Disney Springs";
  - **frase**: "Manhã livre e a tarde inteira na praia, em Cocoa Beach. À noite, a Disney Springs abre a temporada de Natal.";
  - **mapa**: `[Cocoa Beach → Disney Springs](https://www.google.com/maps/dir/Cocoa+Beach+Pier/Disney+Springs)`;
  - **"### 📍 Manhã livre"** com "- Piscina e descanso, sem programação até a saída para a praia.";
  - **"### 🚗 Deslocamento para Cocoa Beach (\~1h de carro, saída por volta das 12h)"**;
  - **"### 📍 Cocoa Beach"** com o mesmo link de fotos e a mesma frase. Trocar só "Bom para o fim da tarde, por volta das 16h." por "Tarde inteira na praia, das \~13h às \~17h.";
  - **"### 🏨 \~17h – volta ao hotel (\~1h de carro)"**;
  - "### 🌙 Noite: Disney Springs" sem mudança.

  Apagar a saída das 08h00, o bloco "### 📍 Kennedy Space Center Visitor Complex" inteiro (atrações, almoço, lançamento de foguete) e o antigo deslocamento de 20 min.
- [X] T008 [US1] Remover as 3 fotos do KSC:
  - em `content/full/orlando/doc-photos.json` e `content/full/orlando/photo-credits.json`, as chaves "Space Shuttle Atlantis", "KSC Bus Tour e Apollo/Saturn V Center" e "Gateway e Rocket Garden";
  - em `public/photos/doc/orlando/`, os arquivos `space-shuttle-atlantis.webp`, `ksc-bus-tour-e-apollo-saturn-v-center.webp` e `gateway-e-rocket-garden.webp`.

  Em `content/full/orlando/point-links.json`, remover "Kennedy Space Center Visitor Complex". Não mexer em `content/points/orlando.json`.
- [X] T009 [US1] Rodar `npm run content` e `npm run content:strict`. Rodar T003–T006, que devem passar. Se o build acusar foto ou ligação órfã, corrigir em T008.

**Checkpoint**: 13/11 novo no app e no documento.

---

## Phase 4: User Story 2 - Nenhuma pendência do KSC na preparação (Priority: P2)

**Goal**: reservas, checklist e a alternativa de 11/11 sem o KSC.

**Independent Test**: documento completo sem "Kennedy" na tabela de reservas e no checklist; 11/11 sem "Alternativa ao outlet".

### Tests for User Story 2

- [X] T010 [P] [US2] Em `tests/content/orlando-doc-real.test.ts`, mudar a expectativa das datas do checklist para `['2026-11-09', '2026-11-10', '2026-11-10', '2026-11-14', '2026-11-12']`. Acrescentar (deve falhar):
  - nenhuma reserva com "Kennedy";
  - nenhuma linha "Alternativa ao outlet" no 11/11;
  - a frase das reservas começa por "Três itens se compram antes".

### Implementation for User Story 2

- [X] T011 [US2] Em `content/full/orlando/roteiro.md`:
  - apagar a linha "**Alternativa ao outlet:** Kennedy Space Center (\~1h de carro), que pode estar mais cheio pelo feriado." e a linha em branco que sobrar;
  - apagar a linha "| Ingresso Kennedy Space Center | … | 13/11 |" da tabela de reservas;
  - apagar "- [ ] Comprar o ingresso do Kennedy Space Center";
  - trocar "Quatro itens se compram antes" por "Três itens se compram antes".

  Rodar `npm run content`. T010 deve passar.

**Checkpoint**: o roteiro de Orlando não tem mais o KSC.

---

## Phase 5: Polish & Cross-Cutting Concerns

- [X] T012 Rodar o CI completo: `npm run typecheck && npm test && npm run content:strict && npm run build && npm run budget && npm run e2e`.
  - Conferir que o snapshot de NY está intacto.
  - Conferir que `grep -i "kennedy\|ksc" content/full/orlando/roteiro.md` não acha nada.
  - Gerar capturas a 360 × 780 e 402 × 874 de `#/dia/2026-11-13` em `specs/011-remove-kennedy-space-center/screens/`.
- [X] T013 Escrever `specs/011-remove-kennedy-space-center/report.md`:
  - o antes e depois do 13/11;
  - as 3 menções removidas;
  - a confirmação de que nenhum outlet foi acrescentado e por quê;
  - as fotos removidas;
  - o resultado dos testes a 360 e 402 px.

  Marcar as tarefas no `tasks.md`.
- [X] T014 Com autorização do usuário, commitar a feature 011. Sem autorização, só informar que está pronta.

---

## Dependencies & Execution Order

- T001 → T002 → US1 → US2 → Polish.
- **US1**: T003–T006 em paralelo (arquivos diferentes; T006 e T010 dividem o arquivo, então T010 vem depois). Em seguida T007 → T008 → T009.
- **US2**: depende só do Setup. T011 mexe no mesmo `roteiro.md` que T007, então vem depois de T007.
- **Polish**: T012 → T013 → T014.

### Parallel Opportunities

- T003 ∥ T004 ∥ T005 ∥ T006.
- T008 (arquivos de foto e link) pode rodar junto com T011 (`roteiro.md`), depois de T007.

## Parallel Example: User Story 1

```text
T003 [US1] tests/components/orlando-day.test.tsx
T004 [US1] tests/unit/notebook.test.ts
T005 [US1] tests/e2e/us-orlando.spec.ts
T006 [US1] tests/content/orlando-doc-real.test.ts
```

## Implementation Strategy

1. **MVP**: US1, o dia 13/11 novo (T003–T009). Validar a 360 e 402 px.
2. US2: a limpeza da preparação (T010–T011).
3. Polish: CI, capturas, relatório e commit com autorização.
