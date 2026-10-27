# Feature Specification: Roteiro de Miami do casal (18 a 20/11), na mesma estrutura de Nova York e Orlando

**Feature Branch**: `012-miami-itinerary-doc`

**Created**: 2026-10-27

**Status**: Draft

**Decisões** (respostas do usuário: "Q1: A (mantenha Orlando normal, mas em Miami coloque algo para
fazer no dia); Q2: B"):
- **Q1 = A**: o 18/11 continua dia de viagem, com os blocos da troca de cidade em "Transporte",
  **e** ganha a tarde em South Beach como um dia normal (Paradas, Restaurantes e Cafés,
  Curiosidades), para o casal ter o que fazer em Miami. O 07/11 de Orlando não muda.
- **Q2 = B**: os roteiros sugeridos antigos de Miami (19/11 e 20/11) são apagados do app.

**Input**: User description: "crie um roteiro para Miami considerando a mesma estrutura e experiencia
que existe até agora e esse conteúdo https://claude.ai/artifact/ScXNeLYpYs3Qc5Lar7UzFC#a5158904-6cf2"

**Fonte**: o documento "Roteiro Miami — 18 a 20 de novembro" (rev. 15, 27/10/2026). Uma cópia do
texto, lida por inteiro, está em `source/roteiro-miami-2026-10-27-rev15.md`.

## Contexto

Hoje Miami é a única cidade sem roteiro do casal no app:
- os dias 19/11 e 20/11 mostram os "roteiros sugeridos" antigos (feature 001), montados com os
  pontos do guia;
- o 18/11 é só o dia de viagem Orlando → Miami (trem), sem a chegada;
- o 21/11 é a volta para casa.

O documento novo tem a mesma forma dos roteiros de Nova York e Orlando:

| Dia | Conteúdo do documento |
|---|---|
| **18/11 (qua)**: Chegada · South Beach · Ocean Drive | chegada na MiamiCentral às 14h21 e 4 formas de traslado (Uber/Lyft, táxi, Metrobus 120, shuttle Brightline); hotel Kasa La Flora; grupo "South Beach (Art Deco District)" com almoço tardio, Lummus Park 17h, pôr do sol 17h30, Ocean Drive 18h, Española Way 19h30; 4 restaurantes; 2 locações de filme (The Carlyle, 728 Ocean Drive); volta ~21h30 |
| **19/11 (qui)**: Compras na Sawgrass Mills | café 8h, Uber 9h (50–70 min); tabela comparando 5 lugares de compra; grupo "Sawgrass Mills" com Simon Guest Services 10h, The Colonnade 10h15, pausa 12h30, ala principal 13h30; lojas por categoria; 5 restaurantes; dicas para economizar; volta ~18h; noite; Plano B (Dolphin Mall + Lincoln Road) |
| **20/11 (sex)**: Praia · South Pointe · Joe's Stone Crab | café 8h, saída a pé 9h; grupo "Lummus Park e a praia de South Beach" com tabela de trechos, praia 9h, pausa 12h30, mais praia 14h, Beachwalk 16h30, South Pointe 17h; 6 restaurantes (Joe's Stone Crab às 18h, com reserva); noite na Ocean Drive; volta ~22h30 |
| Dicas práticas | reservas (6 itens com data), transporte, clima, gorjetas, impostos, segurança, o que levar para a praia (checklist), outros |
| Resumo | custo estimado por dia e as fontes consultadas |

O documento também tem a estratégia da viagem, o aviso do Thanksgiving (26/11) e da Black Friday
antecipada, a hospedagem e a legenda de preço (💵 a 💵💵💵💵).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Os 3 dias de Miami do casal, iguais aos de NY e Orlando (Priority: P1)

O casal abre Miami e vê os dias 18, 19 e 20/11 com o roteiro deles. Cada dia segue a experiência
das features 009 e 010:
- capa com foto;
- menu de seções só com o que existe;
- Paradas marcáveis com horário;
- Restaurantes e Cafés e Brechós e Lojas agrupados pelos grupos do roteiro;
- Curiosidades com as locações de filme;
- Transporte só com Uber, táxi, trem ou ônibus;
- Dicas só com o que muda o planejamento;
- atrações com o descritivo completo.

**Why this priority**: É o pedido. Sem isso, Miami continua com os roteiros sugeridos genéricos.

**Independent Test**: Abrir `#/cidade/miami` e os 3 dias a 360 e 402 px, também offline,
conferindo:
- os horários e a ordem do documento;
- os restaurantes nos dias certos;
- as locações em Curiosidades;
- nenhum dado fora do documento.

**Acceptance Scenarios**:

1. **Given** a cidade Miami, **When** o casal a abre, **Then** vê os dias 18/11, 19/11, 20/11 e
   21/11, com os títulos do documento ("Chegada · South Beach · Ocean Drive", "Compras na Sawgrass
   Mills", "Praia · South Pointe · Joe's Stone Crab").
2. **Given** o dia 18/11, **When** o casal abre "Paradas", **Then** vê Lummus Park 17h00, Pôr do
   sol 17h30, Ocean Drive 18h00 e Española Way 19h30, cada um marcável, com foto e descritivo.
3. **Given** o dia 18/11, **When** o casal abre "Restaurantes e Cafés", **Then** vê Puerto Sagua,
   Havana 1957, Il Pastaiolo e Oh Mexico sob "South Beach (Art Deco District)", cada um com o
   mapa do documento. **And** "Curiosidades" mostra The Carlyle e 728 Ocean Drive.
4. **Given** o dia 19/11, **When** o casal abre o dia, **Then**:
   - as Paradas são Simon Guest Services 10h00, The Colonnade Outlets 10h15 e Ala principal 13h30;
   - Transporte mostra o Uber até a Sawgrass (50–70 min, USD 50–80) e a volta;
   - Brechós e Lojas mostra as lojas por categoria (Esporte, Roupas e jeans, Lojas de departamento,
     Garimpo barato, Beleza e casa).
5. **Given** o dia 20/11, **When** o casal abre o dia, **Then**:
   - as Paradas são Praia 9h00, Mais praia 14h00, Beachwalk 16h30 e South Pointe Park 17h00;
   - Joe's Stone Crab aparece em Restaurantes e Cafés com "Reservem pelo OpenTable";
   - a noite na Ocean Drive aparece como bloco da noite.
6. **Given** uma atração (ex.: Lummus Park), **When** o casal a abre, **Then** vê título,
   descritivo completo do documento e informações práticas (mapa, "Grátis"), sem "Ler mais".
7. **Given** o celular sem rede, **When** o casal abre qualquer dia de Miami, **Then** tudo
   aparece igual, com as fotos baixadas.

---

### User Story 2 - A chegada de trem em Miami no dia 18/11 (Priority: P1)

No dia 18/11, o casal vê a saída de Orlando, a viagem de trem e a chegada em Miami com as opções
de traslado. Depois vê a tarde em South Beach.

**Why this priority**: É o dia mais confuso da viagem (trem, malas, hotel) e o documento traz
todas as opções.

**Independent Test**: `#/dia/2026-11-18` conferindo:
- os blocos da troca de cidade;
- os 4 traslados com tempo e preço;
- o hotel com check-in às 16h;
- a tarde em South Beach.

**Acceptance Scenarios**:

1. **Given** o dia 18/11, **When** o casal abre "Transporte", **Then** vê a saída de Orlando
   (check-out e carro, trem — como hoje) e a chegada na MiamiCentral às 14h21 com:
   - Uber/Lyft (recomendado, 20–30 min, USD 20–35);
   - táxi (USD 30–40);
   - Metrobus 120 (~USD 2,25);
   - o aviso do shuttle da Brightline.
2. **Given** a chegada, **When** o casal a lê, **Then** vê "~15h15 – Kasa La Flora", com o
   endereço 1238 Collins Ave, check-in às 16h e o hotel guardando as malas.
3. **Given** o dia 18/11 (Q1 = A), **When** o casal o abre, **Then** o menu tem Paradas,
   Restaurantes e Cafés, Curiosidades e Transporte (mais Bairros e Dicas, se houver):
   - a troca de cidade fica em Transporte;
   - a tarde em South Beach fica nas outras seções, com cards, fotos e marcação.
4. **Given** o dia 07/11 de Orlando, **When** o casal o abre, **Then** ele continua exatamente como
   hoje.

---

### User Story 3 - Preparação e dicas de Miami (Priority: P2)

O casal encontra as reservas a fazer, as dicas de Miami e o checklist de praia.

**Why this priority**: As reservas têm data, por exemplo o Joe's Stone Crab pelo OpenTable a partir
de ~6/11, antes de a viagem chegar a Miami.

**Independent Test**: No documento completo de Miami e nos dias, conferir as reservas, as dicas e o
checklist.

**Acceptance Scenarios**:

1. **Given** o documento completo de Miami (`#/full/miami/documento`), **When** o casal o abre,
   **Then** vê todas as seções do documento, na ordem: estratégia, Thanksgiving, hospedagem, os 3
   dias, Dicas práticas e Resumo com as fontes.
2. **Given** as reservas, **When** o casal as vê, **Then** há 6 itens com a data de uso: Havana
   1957 (18/11), Simon VIP Club (19/11), horários dos shoppings (19/11), Joe's Stone Crab (20/11),
   shuttle Brightline (18/11) e cota da Receita (antes de embarcar).
3. **Given** a seção "Dicas" de um dia, **When** há aviso específico, **Then** ele aparece. Exemplo:
   em 20/11, a reserva do Joe's e o movimento da sexta antes do Thanksgiving. Dicas genéricas ficam
   de fora, pela regra da feature 010.
4. **Given** "O que levar para a praia", **When** o casal o abre, **Then** são 7 itens marcáveis.

### Edge Cases

- **Roteiros sugeridos antigos de 19/11 e 20/11.** São apagados (FR-010). Se o casal tiver marcado
  algo neles, as marcas ficam guardadas sem efeito.
- **"Plano B" de 19/11** (Dolphin Mall + Lincoln Road) e a **tabela comparativa de shoppings**.
  Aparecem como texto do dia, não como paradas marcáveis, porque são alternativas.
- **"Sobre as fotos"** é um aviso do próprio documento ("não consegue embutir imagens"). Não se
  aplica ao app, que mostra fotos.
- **Preços e horários** (Uber, cadeiras, Joe's) são estimativas do documento. Aparecem como estão,
  sem conferência nova.
- **Lugar sem endereço** ("Praça de alimentação da Sawgrass", "Pura Vida"). Aparece com o link de
  mapa do documento e vai para a lista de revisão se faltar algo.
- **Pôr do sol** (18/11, 17h30) é uma parada sem lugar próprio; usa o mapa que o documento dá
  (Lummus Park, rua 12).
- **21/11** continua só com a partida para casa. O documento diz que o dia "não entra no roteiro".
- **Snapshot de Nova York** e o roteiro de Orlando não mudam.

## Requirements *(mandatory)*

### Functional Requirements

**Conteúdo**

- **FR-001**: O app MUST ter o roteiro de Miami do casal com os 3 dias do documento (18, 19 e
  20/11), com os horários, títulos, descrições, preços e links como estão no documento. Nada é
  inventado ou reescrito, além de ajustes de formato iguais aos feitos nos roteiros de NY e
  Orlando.
- **FR-002**: Cada "### 📍" e "### 🌙" do documento MUST virar um grupo do dia, na ordem. As
  atrações com horário MUST virar paradas marcáveis com o horário do documento. "Pausa livre" e
  almoço ficam fora do progresso, como em Orlando.
- **FR-003**: Os restaurantes e cafés ("☕🏆🍰 Onde comer…") MUST aparecer em "Restaurantes e
  Cafés" do dia certo, sob o grupo do documento, com nome, endereço, descrição, preço (💵) e mapa.
- **FR-004**: As lojas da Sawgrass Mills MUST aparecer em "Brechós e Lojas" de 19/11. O documento
  as lista como 5 categorias de marcas, não como lojas com endereço. Ver FR-012.
- **FR-005**: As locações de filme ("🎬 Locações na Ocean Drive") MUST aparecer em "Curiosidades"
  de 18/11, com o filme.
- **FR-006** (Q1 = A): O 18/11 MUST continuar dia de viagem, com Orlando → Miami em "Transporte"
  (saída de Orlando, trem, chegada na MiamiCentral com os 4 traslados e o hotel). Ele MUST também
  ter a tarde em South Beach como num dia comum:
  - Paradas marcáveis;
  - Restaurantes e Cafés;
  - Curiosidades;
  - Bairros.

  O 07/11 de Orlando não muda.
- **FR-007**: As reservas ("O que reservar ou confirmar antes") MUST entrar na lista de reservas
  com a data de uso. "O que levar para a praia" MUST ser um checklist marcável.
- **FR-008**: As dicas práticas MUST entrar como dicas de Miami, no documento completo. As de
  categoria específica (clima, segurança, gorjetas, impostos, transporte) entram como nos outros
  roteiros. O aviso do Thanksgiving e a estratégia ficam no começo do documento completo.
- **FR-009**: O documento completo de Miami MUST existir em `#/full/miami/documento`, com todas
  as seções na ordem. Ele fica acessível como os de NY e Orlando.
- **FR-010** (Q2 = B): Os roteiros sugeridos antigos de Miami (19/11 e 20/11, feature 001) MUST
  ser apagados do app. Somem do dia e de `#/roteiros`. Roteiros criados pelo próprio casal não
  são tocados. Os pontos do guia de Miami continuam.

**Fotos e dados**

- **FR-011**: Cada grupo e atração com nome de lugar MUST ter foto offline de fonte livre, com
  crédito, como nos roteiros de NY e Orlando. O que ficar sem foto vai para uma lista
  `photos-missing.md`, sem foto inventada.
- **FR-012**: Dados pouco claros MUST ir para uma lista de revisão, sem preencher por conta
  própria. Exemplos: lojas citadas só como marca, lugares sem endereço, preços "de mercado".

**Experiência**

- **FR-013**: Os dias de Miami MUST seguir as features 009, 010 e 011:
  - cards inteiros clicáveis;
  - menu de seções só com conteúdo;
  - agrupamento por grupo do roteiro, com o nome preso no topo;
  - Transporte só com trechos não a pé;
  - Dicas sem dicas genéricas;
  - Paradas mesmo em dia sem nada a marcar.
- **FR-014**: O tipo de cada dia MUST seguir o documento: 18/11 continua dia de viagem, 19/11 é
  dia de compras com Uber, 20/11 é dia de praia a pé. Hoje 19/11 está como "praia" e 20/11 como
  "a pé", invertidos em relação ao documento.
- **FR-015**: Tudo MUST funcionar offline e passar nos testes a 360 × 780 e 402 × 874.

### Key Entities

- **Roteiro de Miami**: os 3 dias, os grupos, as paradas, os lugares, as reservas, o checklist,
  as dicas e o texto completo, vindos do documento do casal.
- **Dia de chegada (18/11)**: troca de cidade (Orlando → Miami) mais a tarde em Miami.
- **Lista de revisão de Miami**: os itens que o documento não deixa claros.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos itens com horário dos 3 dias aparecem no app, na ordem e com o horário do
  documento. A contagem é conferida por teste contra a cópia do documento.
- **SC-002**: 100% dos restaurantes e cafés do documento (15 entradas nos 3 dias) aparecem no dia
  certo, com o mapa do documento.
- **SC-003**: 100% dos links de fotos (📷) e de mapa do documento ficam acessíveis no app.
- **SC-004**: O documento completo de Miami tem todas as seções "##" do documento, na ordem.
- **SC-005**: Os 3 dias abrem offline a 360 px e 402 px, sem rolagem lateral e com alvos ≥ 44 px.
- **SC-006**: Nenhum dado fora do documento: cada lugar, horário e preço do app pode ser achado na
  cópia do documento.

## Assumptions

- **Fonte.** O documento do Claude Docs é a fonte da verdade nesta feature. O app guarda uma cópia
  (como em NY e Orlando), e mudanças futuras no documento só entram com uma nova atualização.
- **Formato.** O roteiro entra no mesmo formato dos roteiros de NY e Orlando. O texto do documento
  é convertido para esse formato sem mudar o conteúdo.
- **Fora do app.** O aviso "Sobre as fotos" não entra (é sobre o documento, não sobre o app). A
  legenda de preço entra no documento completo.
- **Cidade.** Miami continua com o nome, o país e o ponto de destaque atuais. O guia de pontos de
  Miami não muda.
- **Viagem e saída.** A saída de Orlando em 18/11 (check-out, carro, trem) e a partida de 21/11
  continuam como estão.
