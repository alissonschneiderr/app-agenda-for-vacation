# Feature Specification: Tirar o Kennedy Space Center do roteiro de Orlando (13/11 com horário livre)

**Feature Branch**: `011-remove-kennedy-space-center`

**Created**: 2026-10-27

**Status**: Draft

**Decisões**:
- **Q1**: Cocoa Beach fica e ganha mais tempo. A manhã é livre e a tarde inteira vai para a praia.
- **Q2**: só remover as outras menções ao KSC. O roteiro já tem os dois grandes outlets de Orlando
  (Vineland Premium Outlets em 11/11, International Premium Outlets em 16/11), então nenhum outlet
  é acrescentado.

**Input**: User description: "remova Kennedy Space Center do roteiro de Orlando e mantenha livre no
horário". Respostas: "Q1: de mais tempo para Coco Beach; Q2: se tiver um outlet importante que não
esteja contemplado, adicione, senão só remova"

## Contexto

Hoje o dia 13/11 (sexta, "Dia 7: Folga · Kennedy Space Center + Disney Springs") do roteiro de
Orlando é:

| Horário | O quê |
|---|---|
| 08h00 | saída: ~1h de carro até o Kennedy Space Center |
| 9h00–15h30 | Kennedy Space Center: Space Shuttle Atlantis, Bus Tour e Apollo/Saturn V Center, almoço no complexo, Gateway e Rocket Garden; aviso sobre lançamento de foguete |
| — | deslocamento para Cocoa Beach (~20 min de carro, a partir do KSC) |
| ~16h | Cocoa Beach (píer e Ron Jon Surf Shop) |
| ~18h | volta ao hotel (~1h de carro) |
| noite | Disney Springs (abertura do Natal) |

O roteiro também cita o Kennedy Space Center em outros pontos:
- no título e na frase do dia;
- no "Mapa do dia" (rota KSC → Cocoa Beach → Disney Springs);
- em 11/11, como "Alternativa ao outlet";
- na tabela de reservas ("Ingresso Kennedy Space Center");
- no checklist ("Comprar o ingresso do Kennedy Space Center").

O guia de pontos de Orlando (fora do roteiro) também tem o Kennedy Space Center.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 13/11 sem o Kennedy Space Center, com o horário livre (Priority: P1)

O casal abre o dia 13/11 e não vê mais o Kennedy Space Center nem as atrações dele. O dia fica:

| Horário | O quê |
|---|---|
| manhã | **Manhã livre**, no formato de 11/11 e 16/11 |
| ~12h | saída: ~1h de carro até Cocoa Beach |
| ~13h às ~17h | **Cocoa Beach**, com o mesmo texto do roteiro (píer, Ron Jon Surf Shop) e mais tempo |
| ~17h | volta ao hotel (~1h de carro) |
| noite | Disney Springs, como hoje |

**Why this priority**: É o pedido.

**Independent Test**: Abrir `#/dia/2026-11-13` a 360 e 402 px e conferir:
- nenhuma menção ao Kennedy Space Center no dia;
- a "Manhã livre" no horário que era do KSC;
- Cocoa Beach com a tarde inteira (~13h às ~17h);
- Disney Springs presente;
- nenhum item do KSC contando no progresso do dia.

**Acceptance Scenarios**:

1. **Given** o dia 13/11, **When** o casal abre o dia, **Then** não há parada, foto, atração,
   aviso, mapa ou transporte do Kennedy Space Center.
2. **Given** o horário que era do KSC, **When** o casal olha as paradas, **Then** vê um bloco de
   horário livre no lugar, sem atividades marcáveis inventadas.
3. **Given** o cabeçalho e o card do dia na lista de Orlando, **When** o casal os lê, **Then** o
   título não cita mais o Kennedy Space Center.
4. **Given** o documento completo de Orlando (`#/full/orlando/documento`), **When** o casal o lê,
   **Then** o dia 13/11 aparece igual ao app, sem o KSC.

---

### User Story 2 - Nenhuma pendência do KSC na preparação (Priority: P2)

A tabela de reservas e o checklist não pedem mais para comprar o ingresso do Kennedy Space
Center.

**Why this priority**: Evita comprar um ingresso que não vai ser usado.

**Independent Test**: No documento completo, a tabela de reservas e o checklist não têm o KSC.

**Acceptance Scenarios**:

1. **Given** a tabela "Quando reservar", **When** o casal a lê, **Then** não há linha do
   Kennedy Space Center.
2. **Given** o checklist, **When** o casal o lê, **Then** não há "Comprar o ingresso do Kennedy
   Space Center".

### Edge Cases

- **Transporte de 13/11.** A seção mostra a ida de carro até Cocoa Beach (~1h), pela regra da
  010.
- **Marcações já feitas.** Uma atração do KSC que o casal tenha marcado como feita deixa de
  existir. A marca fica guardada sem efeito e não aparece em lugar nenhum.
- **Fotos do KSC.** Deixam de ser usadas no roteiro. Continuam no guia de pontos, que não muda.
- **Snapshot de Nova York.** Não muda.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O roteiro de Orlando MUST deixar de ter, em 13/11, o bloco do Kennedy Space Center
  Visitor Complex. Isso inclui:
  - a saída de carro até ele;
  - as quatro atrações e o almoço no complexo;
  - o aviso de lançamento de foguete;
  - a menção "compre o ingresso".
- **FR-002**: O horário que era do KSC MUST virar um bloco de horário livre, no formato das
  manhãs livres do roteiro, sem atividades novas. O texto é só do que o roteiro já diz (folga ou
  descanso). Nenhuma sugestão é inventada.
- **FR-003**: O título do dia, a frase de abertura e o "Mapa do dia" de 13/11 MUST deixar de
  citar o Kennedy Space Center. O mapa passa a ir só pelos destinos que ficam.
- **FR-004** (Q1): Cocoa Beach MUST continuar em 13/11, com mais tempo: ~13h às ~17h.
  - A ida sai do hotel por volta das 12h, de carro (~1h, o mesmo tempo que o roteiro dá para a
    volta).
  - O texto de Cocoa Beach é o do roteiro. Só o horário muda: "Bom para o fim da tarde, por volta
    das 16h" vira o horário novo.
  - Nenhuma atividade nova é acrescentada.
  - A volta ao hotel passa para ~17h, a tempo da Disney Springs.
- **FR-005** (Q2): As outras menções ao KSC no roteiro MUST sair:
  - a "Alternativa ao outlet" de 11/11;
  - a linha da tabela de reservas;
  - o item do checklist.

  Nenhum outlet é acrescentado, porque os dois grandes de Orlando já estão no roteiro
  (Orlando Vineland Premium Outlets em 11/11 e Orlando International Premium Outlets em 16/11).
- **FR-006**: O Kennedy Space Center MUST continuar no guia de pontos de Orlando (`#/guia`). O
  pedido é sobre o roteiro.
- **FR-007**: O resto do roteiro de Orlando e todo o app MUST continuar como estão. Isso inclui:
  - Disney Springs à noite;
  - os outros dias;
  - a estrutura das features 009 e 010 (seções do dia, Transporte só com trechos relevantes).

  Os testes MUST passar a 360 × 780 e 402 × 874.

### Key Entities

- **Dia 13/11 do roteiro de Orlando**: título, frase, mapa, paradas (horário livre, Cocoa Beach
  conforme FR-004, volta ao hotel, Disney Springs) e transporte.
- **Preparação**: tabela de reservas e checklist do documento de Orlando.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A busca por "Kennedy" e "KSC" no roteiro de Orlando dá 0 resultados.
- **SC-002**: O dia 13/11 tem exatamente 1 "Manhã livre", Cocoa Beach com ~4h (~13h às ~17h)
  e 0 paradas vindas do KSC.
- **SC-003**: O guia de pontos continua com o Kennedy Space Center (1 resultado em `#/guia`).
- **SC-004**: Nenhuma outra data do roteiro muda (comparação dia a dia antes e depois), exceto
  13/11 e a linha da alternativa em 11/11.
- **SC-005**: Os testes passam a 360 px e 402 px, sem rolagem lateral, também offline.

## Assumptions

- A mudança é feita no texto do roteiro de Orlando que o app lê
  (`content/full/orlando/roteiro.md`), que é a fonte do dia e do documento completo. Assim, app e
  documento nunca divergem.
- "Mantenha livre no horário" + "dê mais tempo para Cocoa Beach": a manhã que era do KSC fica
  livre ("Manhã livre", padrão do roteiro) e a tarde passa para Cocoa Beach.
- Os horários (~12h saída, ~13h às ~17h praia, ~17h volta) seguem os tempos de carro que o
  roteiro já dá. Nenhum dado novo sobre Cocoa Beach é acrescentado.
- A Disney Springs à noite continua.
- O guia de pontos (fora do roteiro) não muda.
