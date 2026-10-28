# Feature Specification: Bairros de verdade, data no rótulo do dia e cidade aberta no dia de hoje

**Feature Branch**: `013-city-days-labels-today` (trabalho na `main`, a pedido do usuário)

**Created**: 2026-10-28

**Status**: Draft

**Decisões** (usuário: "Q1: A; Q2: A"):
- **Q1 = A**: "bairro de verdade" é só bairro. Saem de "Bairros" os parques urbanos, os parques
  temáticos, o tempo livre, os museus, a ponte e os outlets.
- **Q2 = A**: os cabeçalhos de grupo de "Restaurantes e Cafés", "Brechós e Lojas" e "Curiosidades"
  (feature 010) continuam com o nome do grupo do roteiro. A mudança vale só para "Bairros".

**Input**: User description: "Preciso de alguns ajustes na tela de roteiro de viagem. Faça as alterações
abaixo sem mudar nada além do que está descrito" — quatro pontos:

1. a lista de bairros só com bairros de verdade, sem parques nem "Manhã livre" ou outro tempo livre;
2. o rótulo "Dia 19" vira a data "19/11";
3. o subtítulo "Quarta-feira, 19/11" vira só "Quarta-feira";
4. ao abrir uma cidade durante o período dela, a lista já aparece no dia de hoje.

"Hoje" é a data local do aparelho, comparando só a data, sem horário.

## Contexto

Os "bairros" de cada dia vêm dos grupos do roteiro do casal ("### 📍 …"). Hoje aparecem como bairro
(levantamento do app):

| Tipo | Itens |
|---|---|
| Bairros de verdade | Midtown, SoHo, Nolita, Chinatown, Little Italy, Lower East Side, East Village, Financial District, Greenwich Village, West Village, Upper West Side, Upper East Side, Brooklyn Heights, DUMBO, Williamsburg, Hudson Yards, Chelsea, Meatpacking District, Empire State e arredores (Midtown South), Cocoa Beach |
| Parques urbanos | Central Park, Brooklyn Bridge Park, High Line, Lummus Park e a praia de South Beach |
| Parques temáticos | Magic Kingdom, Hollywood Studios, EPCOT, Animal Kingdom, Epic Universe, Universal Studios Florida, Islands of Adventure |
| Tempo livre | Manhã livre (11/11, 13/11, 16/11) |
| Outros que não são bairro | Museu de História Natural, MET – Metropolitan Museum of Art, MoMA, Ponte do Brooklyn, Orlando Vineland Premium Outlets, Orlando International Premium Outlets ou Mall at Millenia, Sawgrass Mills |

Prospect Park, citado no pedido, não está em nenhum roteiro hoje.

O rótulo "Dia N" (número do dia na viagem) aparece em três lugares:
- no card do dia, na lista da cidade;
- no cabeçalho da página do dia ("Dia 2 · SoHo · Nolita…");
- na capa do dia.

O subtítulo "dia da semana, data" aparece no card do dia ("QUARTA, 18/11") e na capa do dia
("dom, 01/11").

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A cidade abre no dia de hoje durante a viagem (Priority: P1)

Durante a estada numa cidade, o casal abre a cidade e o primeiro dia visível já é o de hoje. Os dias
anteriores ficam acima e aparecem ao rolar para cima.

**Why this priority**: É o uso mais frequente na viagem ("o que tem hoje?") e poupa rolagem todo dia.

**Independent Test**: Com a data do aparelho dentro do período de Nova York (ex.: 02/11), abrir
Nova York a 360 e 402 px. O card de 02/11 é o primeiro visível logo abaixo do cabeçalho. Rolando
para cima aparecem 01/11 e 31/10.

**Acceptance Scenarios**:

1. **Given** hoje = 02/11 (Nova York vai de 31/10 a 07/11), **When** o casal abre Nova York,
   **Then** a lista está em ordem crescente e a tela já começa no card de 02/11, o primeiro visível
   abaixo do cabeçalho. 31/10 e 01/11 aparecem ao rolar para cima.
2. **Given** hoje = 28/10 (antes de Nova York), **When** o casal abre Nova York, **Then** a lista
   começa no primeiro dia (31/10), como hoje.
3. **Given** hoje = 10/11 (depois de Nova York), **When** o casal abre Nova York, **Then** a lista
   começa no primeiro dia (31/10).
4. **Given** hoje = 07/11 (dia de troca: último dia de Nova York e primeiro de Orlando), **When** o
   casal abre Nova York ou Orlando, **Then** cada uma começa no card de 07/11.
5. **Given** a cidade aberta no dia de hoje, **When** o casal rola para cima, abre um dia e volta,
   **Then** a lista não "pula" de novo para hoje no meio da leitura. O posicionamento acontece ao
   abrir a cidade.

---

### User Story 2 - A data no lugar de "Dia N" e só o dia da semana no subtítulo (Priority: P2)

O casal vê a data (19/11) como rótulo principal de cada dia, no lugar de "Dia 19". O subtítulo
mostra só o dia da semana (Quarta-feira), sem repetir a data.

**Why this priority**: Na viagem, o casal pensa em datas, não no número do dia.

**Independent Test**: Abrir a cidade e um dia e conferir os três lugares onde hoje aparece "Dia N"
e os dois onde aparece "dia da semana, data".

**Acceptance Scenarios**:

1. **Given** o card de 19/11 na lista de Miami, **When** o casal o vê, **Then** o rótulo é "19/11"
   (não "Dia 20") e o subtítulo é "Quinta-feira" (não "quinta, 19/11").
2. **Given** a página do dia 01/11, **When** o casal a abre, **Then**:
   - o cabeçalho mostra "01/11 · SoHo · Nolita…", não "Dia 2 · …";
   - a capa mostra "01/11" no lugar de "Dia 2";
   - a capa mostra "Domingo" no lugar de "dom, 01/11".
3. **Given** qualquer outro lugar com data por extenso (ex.: "Dia anterior, sábado, 31/10" nos
   botões de troca de dia, títulos de roteiros, Transporte), **Then** nada muda.

---

### User Story 3 - Só bairros de verdade em "Bairros" (Priority: P2)

A seção "Bairros" do dia e a lista de bairros da cidade mostram só bairros. Parques e tempo livre
("Manhã livre") não aparecem como bairro. Continuam no dia como paradas e lugares.

**Why this priority**: Corrige uma informação errada ("Central Park" como bairro, "Manhã livre"
como bairro).

**Independent Test**: Conferir a seção "Bairros" de 03/11 (sem Central Park), de 11/11 (sem "Manhã
livre") e de 08/11. Conferir que Central Park e "Manhã livre" continuam nas Paradas.

**Acceptance Scenarios**:

1. **Given** o dia 03/11, **When** o casal abre "Bairros", **Then** vê Upper West Side e Upper
   East Side, e não vê Central Park. As paradas do Central Park continuam em "Paradas".
2. **Given** o dia 11/11, **When** o casal abre "Bairros", **Then** não há "Manhã livre". O bloco
   "Manhã livre" continua na linha do tempo, sem rótulo de bairro.
3. **Given** um dia em que nenhum grupo é bairro, **When** o casal abre o dia, **Then** o item
   "Bairros" não aparece no menu (regra da 009: seção só com conteúdo).
4. **Given** um museu (MoMA, MET, Museu de História Natural), a Ponte do Brooklyn ou um outlet
   (Vineland, International, Sawgrass Mills) (Q1 = A), **When** o casal abre "Bairros", **Then**
   ele não aparece como bairro. Continua nas Paradas e nos lugares do dia.
5. **Given** os dias de parque em Orlando (08, 09, 10, 12, 14, 15 e 17/11) e o 19/11 (Sawgrass),
   **When** o casal abre o dia, **Then** não há item "Bairros" no menu.

### Edge Cases

- **Dia de troca de cidade** (07/11, 18/11): pertence às duas cidades. Hoje = 07/11 posiciona as
  duas listas nesse card.
- **Dia 21/11** (só partida): hoje = 21/11 posiciona Miami no card de 21/11.
- **Fuso.** "Hoje" é a data local do aparelho, sem horário. Na viagem, o aparelho estará no fuso de
  Nova York e da Flórida (o mesmo). Antes da viagem, no Brasil, a data do aparelho decide.
- **Simulação para revisar** (`?agora=AAAA-MM-DDTHH:MM`): continua valendo, como data do aparelho
  simulada.
- **Lista mais curta que a tela.** Se não houver espaço para pôr o card de hoje no topo (ex.: Miami
  com 4 dias), a tela rola o máximo possível e o card de hoje fica visível.
- **Agrupamento dos lugares por grupo (feature 010).** Os cabeçalhos de "Restaurantes e Cafés",
  "Brechós e Lojas" e "Curiosidades" continuam com o nome do grupo do roteiro (Q2 = A). Exemplo:
  "Casey's Corner" continua sob "Magic Kingdom".

## Requirements *(mandatory)*

### Functional Requirements

**Posição inicial da cidade (US1)**

- **FR-001**: A lista de dias da cidade MUST continuar em ordem crescente de data.
- **FR-002**: Se a data local do aparelho (só a data) estiver entre o primeiro e o último dia da
  cidade, inclusive, a tela MUST abrir posicionada no card de hoje, como primeiro item visível logo
  abaixo do cabeçalho fixo. Os dias anteriores ficam acessíveis rolando para cima.
- **FR-003**: Se a data for anterior ao primeiro dia ou posterior ao último, a cidade MUST abrir no
  topo, a partir do primeiro dia, como hoje.
- **FR-004**: O posicionamento MUST acontecer só ao abrir a cidade. Ao voltar de um dia para a
  cidade, vale a mesma regra, sem saltos enquanto o casal rola.

**Rótulos do dia (US2)**

- **FR-005**: O rótulo "Dia N" MUST virar a data no formato DD/MM nos três lugares:
  - card do dia na cidade;
  - cabeçalho da página do dia;
  - capa do dia.
- **FR-006**: O subtítulo "dia da semana, data" MUST virar só o dia da semana, por extenso e com
  inicial maiúscula ("Quarta-feira"), no card do dia e na capa do dia.
- **FR-007**: Nenhum outro texto de data MUST mudar: botões de dia anterior e próximo, nomes para
  leitores de tela, Transporte, roteiros, documento completo.

**Bairros (US3)**

- **FR-008**: A seção "Bairros" do dia (e a contagem que decide se o item aparece no menu) MUST
  mostrar só os grupos que são bairros de verdade (Q1 = A). O que não é bairro continua no dia como
  paradas e lugares. Os cabeçalhos de grupo de "Restaurantes e Cafés", "Brechós e Lojas" e
  "Curiosidades" não mudam (Q2 = A).
- **FR-009**: "Manhã livre", "Tarde livre" e qualquer rótulo de tempo livre MUST deixar de ser
  tratado como bairro. O período aparece na linha do tempo sem rótulo de bairro.
- **FR-010**: Nada é deduzido de endereço nem de conhecimento externo. A classificação de cada grupo
  (bairro ou não) MUST ser explícita e conferida por teste, com a lista do Contexto como referência.

**Geral**

- **FR-011**: Nada além do descrito MUST mudar: conteúdo, ordem dos dias, outras telas. Os testes
  MUST passar a 360 × 780 e 402 × 874, também offline.

### Key Entities

- **Grupo do dia**: o "### 📍" do roteiro, com o nome e se é bairro de verdade ou não (parque,
  tempo livre, outro).
- **Card do dia**: data (DD/MM) como rótulo, dia da semana por extenso como subtítulo.
- **Hoje**: a data local do aparelho, sem horário.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% das aberturas de uma cidade durante o período dela, o card de hoje é o
  primeiro visível abaixo do cabeçalho, nas duas larguras (360 e 402 px).
- **SC-002**: Antes e depois do período, 100% das aberturas começam no primeiro dia.
- **SC-003**: Nenhum "Dia N" aparece no card, no cabeçalho nem na capa do dia. Os 22 dias mostram
  DD/MM.
- **SC-004**: 0 parques e 0 "Manhã livre" em "Bairros", em todos os dias. As paradas desses grupos
  continuam no dia, com a mesma contagem de antes.
- **SC-005**: Nenhuma outra tela muda (conferido pelos testes atuais, que continuam passando).

## Assumptions

- **Dia da semana**: por extenso e com inicial maiúscula, como no exemplo do pedido ("Quarta-feira").
- **"Hoje"**: a data local do aparelho, como pedido. Hoje o app usa o fuso de Nova York para a viagem
  toda. Para esta regra vale o aparelho, e na viagem os dois coincidem.
- **"Abrir a cidade"**: entrar na página da cidade pelo Início ou voltando de um dia.
- **Prospect Park** não está nos roteiros. A regra vale para ele se um dia entrar.
