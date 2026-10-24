# Feature Specification: Roteiro de Nova York por bairros (doc do Alisson)

**Feature Branch**: `005-nyc-itinerary-doc`

**Created**: 2026-10-22

**Status**: Draft

**Input**: User description: "esse deve ser o roteiro de Nova York https://claude.ai/artifact/TXXKEvKnZEz3dDym8srgfv"
(doc "Roteiro Nova York · 31/10 a 06/11", de @Alisson, versão de 22/10/2026; chamado abaixo de **"o doc"**).

## Contexto

A feature 004 colocou no app o documento anterior do casal (tabelas de horário por dia). O casal
reescreveu o roteiro num doc novo, organizado **por bairro**, e quer que ele seja o roteiro de Nova
York do app. O doc novo muda a ordem dos dias e o formato:

| Dia | Programa no doc |
|---|---|
| 31/10 (sáb) | Chegada pelo JFK · Midtown · Top of the Rock 15h · Village Halloween Parade · Times Square à noite |
| 01/11 (dom) | SoHo · Nolita · Chinatown · Little Italy · Lower East Side (Tenement Museum) · East Village |
| 02/11 (seg) | Financial District · Tribeca a pé · Greenwich Village · West Village · **Knicks x Nets 19h30** |
| 03/11 (ter) | Museu de História Natural · Upper West Side · Central Park · MET 15h · Upper East Side |
| 04/11 (qua) | Ponte do Brooklyn · Brooklyn Heights · DUMBO · Brooklyn Bridge Park · ferry · Williamsburg |
| 05/11 (qui) | MoMA · Hudson Yards (Vessel) · High Line · Chelsea · Meatpacking · **MJ The Musical 19h** |
| 06/11 (sex) | Dia livre: Empire State 12h · tarde livre (ideias) · jantar no Harlem |
| 07/11 (sáb) | Partida: saída do hotel às 11h, voo às 14h no LaGuardia |

**Como o doc é organizado** (diferente do anterior):

- cada dia tem resumo, link "Mapa do dia" e um horário de saída do hotel;
- dentro do dia, uma seção por **bairro**, com link de fotos, texto do bairro e quatro listas:
  1. **Atrações (no roteiro)**: itens com horário, ícone, links "📷 fotos" e "Mapa", e texto;
  2. **Lojas**: tipo · estilo · faixa de preço (💵 a 💵💵💵💵) e texto;
  3. **Onde comer e tomar café**: opções marcadas ☕ (café coado), 🏆 (ícone) ou 🍰 (doce), com o que pedir, preço e fila;
  4. **Locações no caminho**: obra, cena e dica de foto;
- entre bairros, uma linha "🚶 Deslocamento"; no fim do dia, "🏨 volta ao hotel";
- "pausa livre" e "jantar livre" no lugar de refeições com horário marcado;
- seções finais: partida, dicas práticas (tabela "O que comprar antes", metrô, clima, gorjetas, imposto, outros) e fontes.

**Como o app usa o doc**: o doc é um documento vivo do Claude Docs; o app funciona offline. Por isso
o app usa uma **cópia do doc** tirada numa data conhecida. Esta feature parte da cópia de 22/10/2026,
com 931 linhas, 85 links de fotos, 160 links de mapa e 75 itens com horário.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Seguir o dia por bairros (Priority: P1)

O casal abre um dia de Nova York e vê o roteiro como está no doc. Primeiro o resumo, o mapa do dia e
a saída do hotel. Depois cada bairro na ordem, com os horários das atrações e o deslocamento até o
próximo bairro. No fim, a volta ao hotel e a noite. Cada atração com horário tem o controle
Feito/Pendente.

**Why this priority**: É o pedido: este deve ser o roteiro de Nova York.

**Independent Test**: Abrir cada dia e conferir, bairro a bairro, que os itens com horário, os
deslocamentos e a volta ao hotel batem com o doc.

**Acceptance Scenarios**:

1. **Given** o dia 01/11, **When** o casal o abre, **Then** vê os seis bairros na ordem do doc (SoHo,
   Nolita, Chinatown, Little Italy, Lower East Side, East Village), cada um com as atrações nos
   horários do doc e o deslocamento até o próximo.
2. **Given** o dia 02/11, **When** aberto, **Then** o Knicks x Nets aparece às 19h30 no Madison
   Square Garden, com chegada às 18h30 e saída do hotel às 18h.
3. **Given** o dia 05/11, **When** aberto, **Then** o MJ The Musical aparece às 19h no Neil Simon
   Theatre, com chegada às 18h30.
4. **Given** o dia 06/11, **When** aberto, **Then** mostra o Empire State às 12h, a tarde livre com
   as 5 ideias do doc e o jantar no Harlem.
5. **Given** um item "pausa livre" ou "jantar livre", **When** exibido, **Then** aparece como
   intervalo, sem Feito/Pendente.
6. **Given** marcações feitas no roteiro anterior (feature 004), **When** o roteiro é trocado,
   **Then** nenhuma delas marca um item do roteiro novo.
7. **Given** o app sem internet, **When** o casal abre qualquer dia, **Then** o roteiro inteiro está
   disponível.

---

### User Story 2 - Escolher onde comer, comprar e fotografar em cada bairro (Priority: P1)

Em cada bairro, o casal consulta as listas do doc:
- onde comer e tomar café, com o tipo (☕ / 🏆 / 🍰), o que pedir, o preço e a fila;
- lojas, com tipo, estilo e preço;
- locações de filmes e séries, com a dica de foto.

Cada lugar tem os botões "Ver fotos" e "Abrir no mapa", que abrem os links do doc.

**Why this priority**: O doc troca refeições com horário por listas de opções por bairro; sem elas o
casal não sabe onde comer na "pausa livre".

**Independent Test**: Abrir o bairro Chinatown (01/11) e conferir as 6 opções de comida, o aviso
"Nenhuma cafeteria no estilo La Cabra" e os links de mapa de cada uma.

**Acceptance Scenarios**:

1. **Given** um bairro com opções de comida, **When** aberto, **Then** cada opção mostra o tipo
   (☕/🏆/🍰), o nome, o endereço quando houver, o texto do doc, o preço e o link de mapa.
2. **Given** um bairro com lojas, **When** aberto, **Then** cada loja mostra o tipo, o estilo, a
   faixa de preço e o texto do doc.
3. **Given** uma locação, **When** aberta, **Then** mostra a obra, a cena e a dica de foto.
4. **Given** um lugar com link "📷 fotos" e/ou "Mapa" no doc, **When** o casal toca no botão, **Then**
   abre exatamente o link do doc; sem internet, o app avisa e mostra o endereço.
5. **Given** um aviso do doc no bairro (por exemplo, "Nenhuma cafeteria no estilo La Cabra neste
   bairro" ou "os cafés de Little Italy são tradicionais"), **When** o bairro é aberto, **Then** o
   aviso aparece.
6. **Given** um lugar que também está no guia do app, **When** aberto, **Then** mostra também as fotos
   do guia, com crédito.

---

### User Story 3 - Preparação, partida e consulta do doc completo (Priority: P2)

Antes e durante a viagem, o casal consulta:
- a seção "Sugestões" e o aviso da maratona;
- a tabela "O que comprar antes", como checklist;
- as dicas práticas e a partida de 07/11;
- as fontes;
- o doc inteiro, para ler ou imprimir.

**Why this priority**: Importante para a preparação; o uso diário é US1/US2.

**Independent Test**: Abrir o documento completo no app sem internet e conferir todas as seções do
doc na ordem; conferir que o checklist tem os 8 itens da tabela.

**Acceptance Scenarios**:

1. **Given** o documento completo no app, **When** aberto, **Then** mostra todas as seções do doc na
   ordem, com tabelas legíveis no celular.
2. **Given** a tela da viagem, **When** aberta, **Then** lista os itens de "O que comprar antes" com
   data, atração e situação, cada um ligado ao item do dia quando houver.
3. **Given** o dia 07/11, **When** aberto, **Then** mostra a nota de partida (check-out, saída às 11h,
   táxi ao LaGuardia, último café).
4. **Given** o dia 31/10, **When** aberto, **Then** mostra a chegada pelo JFK (pouso 06h30, táxi
   recomendado, alternativa econômica, Pod 51 por volta das 9h).

---

### Edge Cases

- **Horário de intervalo** ("11h15 às 12h30 — Compras no SoHo"): o item mostra início e fim.
- **Horário aproximado** ("\~12h00 — pausa livre", "\~22h30 — Times Square"): mostrado com "~".
- **Item sem horário**: dicas, "Como chegar", "Antecedência", "Volta", "Plano B" e "Onde assistir"
  aparecem como notas do item ou do dia, sem Feito/Pendente.
- **Bairro sem lista de atrações** ("📍 Museu de História Natural", "📍 MET", "📍 Ponte do Brooklyn",
  "📍 High Line"): os itens com horário vêm direto sob o bairro.
- **Lista de comida que avisa que não há opção** ("Nenhum ícone ou referência neste bairro"): o aviso
  aparece no lugar da lista.
- **Lugar repetido em dias diferentes** (Joe's Pizza, Halal Guys, Keens, Junior's, Black Fox,
  Devoción): cada dia mostra a versão do doc daquele dia.
- **Item de locação que também é atração** (Prédio de Friends, Casa da Carrie): o item do roteiro
  mostra também a locação.
- **Divergência dentro do doc**: o Tenement Museum aparece às 16h15 no dia, mas a tabela "O que
  comprar antes" diz "tour das 15h30". **Decidido (Q1)**: vale **16h15**; no checklist do app o item
  aparece como "Tenement Museum, tour das 16h15", e o resto da linha fica como está no doc.
- **Doc editado depois da cópia**: o app continua com a cópia que tem até ser atualizado (ver
  Assumptions).

## Requirements *(mandatory)*

### Functional Requirements

**Substituição**

- **FR-001**: O roteiro de Nova York de 31/10 a 06/11 MUST ser substituído inteiro pelo conteúdo do
  doc. Nada do roteiro da feature 004 MUST permanecer.
- **FR-002**: Os textos do doc MUST ser mantidos sem reescrita. Os textos são: descrições, o que
  pedir, preço e fila, dicas, avisos e notas. Só são permitidos ajustes de formatação.
- **FR-003**: As marcações feitas/puladas do roteiro anterior MUST NOT marcar itens do roteiro novo.
  O progresso de Nova York recomeça do zero.

**Dia e bairros**

- **FR-004**: Cada dia MUST mostrar, nesta ordem:
  1. o resumo e o link "Mapa do dia";
  2. os avisos do dia (maratona, funcionamento dos museus);
  3. a saída do hotel;
  4. os bairros na ordem do doc;
  5. a volta ao hotel e a noite.
- **FR-005**: Cada bairro MUST mostrar, nesta ordem:
  1. o nome e o link de fotos;
  2. o texto;
  3. as atrações com horário;
  4. as lojas, as opções de comida e as locações;
  5. o deslocamento até o próximo bairro.
- **FR-006**: Cada atração com horário MUST ter Feito/Pendente e contar no progresso. Saída,
  deslocamento, volta ao hotel, "pausa livre", "jantar livre", "tarde livre" e "tempo livre" MUST NOT
  contar.
- **FR-007**: Os horários MUST aparecer como no doc, preservando "~" e intervalos ("às").

**Lugares**

- **FR-008**: Cada opção de comida MUST mostrar:
  - o tipo (☕ café coado, 🏆 ícone, 🍰 doce) e o nome;
  - o endereço ou referência, quando o doc trouxer;
  - o texto do doc e o preço em 💵;
  - a observação de fila;
  - o link de mapa.
- **FR-009**: Cada loja MUST mostrar o nome, o endereço quando houver, o tipo, o estilo, a faixa de
  preço, o texto e o link de mapa.
- **FR-010**: Cada locação MUST mostrar o lugar, a obra, a cena e a dica de foto.
- **FR-011**: Todo link "📷 fotos" e "Mapa" do doc MUST estar no app como botão que abre exatamente o
  link do doc. Sem internet, o botão avisa e mostra o endereço.
- **FR-012**: Quando um lugar do doc corresponder a um ponto do guia, o app MUST mostrar também as
  fotos do guia, com crédito. O app MUST NOT mostrar fotos de outros lugares.
- **FR-013**: Os restaurantes de cada bairro MUST aparecer como lista de consulta, sem Feito/Pendente e
  fora do progresso (Q2). O progresso conta só as atrações com horário.

**Compromissos e partida**

- **FR-014**: Os compromissos MUST seguir o doc:
  - Knicks x Nets: 02/11, 19h30, chegada às 18h30;
  - MJ The Musical: 05/11, 19h, chegada às 18h30.
- **FR-015**: A nota de partida MUST aparecer no dia 07/11, e a chegada pelo JFK no começo de 31/10.

**Seções gerais**

- **FR-016**: O documento completo do app MUST trazer todas as seções do doc na ordem, com links e
  tabelas:
  - Sugestões;
  - os 7 dias;
  - Partida;
  - Dicas práticas e suas subseções;
  - Fontes consultadas.
- **FR-017**: A tabela "O que comprar antes" MUST virar o checklist de ingressos da viagem, com os 8
  itens. O Tenement Museum aparece com o tour das 16h15 (Q1). Os já garantidos (Knicks x Nets e MJ) e os gratuitos ficam como nota.
- **FR-018**: A legenda de preço do doc MUST estar disponível onde os preços aparecem: até USD 20,
  USD 20–40, USD 40–80, acima de USD 80, por pessoa.

**Preservação e atualização**

- **FR-019**: Orlando, Miami, guia, favoritos, roteiros do casal, as telas da feature 003 e o
  funcionamento offline MUST continuar como estão.
- **FR-020**: A conferência automática MUST garantir que o app reproduz a cópia do doc:
  - todos os itens com horário, na ordem;
  - todas as opções de comida, lojas e locações;
  - todos os links de fotos e mapa;
  - todas as seções.

  A conferência MUST apontar o que faltar.
- **FR-021**: Atualizar o roteiro a partir de uma nova versão do doc MUST ser um passo único e
  documentado, sem retrabalho manual do conteúdo.

### Key Entities

- **Roteiro de NY (cópia do doc)**: título, autor, data da cópia, seções gerais, 7 dias, partida.
- **Dia**: data, título (bairros do dia), resumo, link do mapa do dia, avisos, saída do hotel,
  bairros, volta ao hotel, noite, ideias (no dia livre).
- **Bairro**: nome, link de fotos, texto, itens do roteiro, lojas, opções de comida, locações, avisos,
  deslocamento até o próximo.
- **Item do roteiro**: horário (início, fim opcional, aproximado), ícone/tipo, nome, links de fotos e
  mapa, texto, observação de ingresso. Também diz se conta como atividade ou é intervalo/logística.
- **Lugar** (comida, loja ou locação): nome, endereço, tipo, nível (☕/🏆/🍰), estilo, preço em 💵,
  texto, fila, links, obra, cena e dica de foto.
- **Item a comprar antes**: data, atração, situação.
- **Compromisso**: Knicks x Nets e MJ The Musical (data, hora, chegada).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos 75 itens com horário do doc aparecem no app, no dia, no bairro e na ordem do
  doc.
- **SC-002**: 100% das opções de comida, lojas e locações do doc aparecem no bairro certo, com todos
  os campos do doc.
- **SC-003**: 100% dos links do doc estão no app e abrem o destino exato: 85 de fotos e 160 de mapa,
  além dos mapas do dia e das fontes.
- **SC-004**: 100% das seções do doc aparecem no documento completo do app, na ordem.
- **SC-005**: 0 itens do roteiro anterior em Nova York; 0 marcações antigas aplicadas a itens novos.
- **SC-006**: Com o app sem internet, o casal abre qualquer dia, bairro ou lugar de Nova York.
- **SC-007**: O casal confirma, numa revisão lado a lado, que o app reproduz o doc sem perda de
  informação.
- **SC-008**: Orlando, Miami e as demais telas continuam passando em todos os testes existentes.

## Assumptions

- **O doc é a fonte de verdade.** Não haverá nova pesquisa de horários e preços. Os avisos do doc
  ("confiram o horário", "confirmem a forma de pagamento") aparecem como estão.
- **O app usa a cópia de 22/10/2026 (versão 57 do doc).** Se o casal editar o doc depois, basta pedir
  a atualização: uma nova cópia passa pela mesma conferência (FR-021). O app não sincroniza sozinho,
  porque precisa funcionar offline.
- **Fotos.** O doc usa links de busca de imagens ("📷 fotos"), que precisam de internet. As fotos
  offline vêm só do guia do app.
- **Restrições alimentares e de lojas da feature 002** continuam suspensas, como decidido na feature
  004 (Q2). O doc inclui steakhouses e camarão.
- **Hotel e calendário não mudam.** O hotel continua o Pod 51 (230 E 51st St), e 07/11 continua dia de
  locomoção para Orlando.
- **Telas.** O formato é o da feature 003 (destino, dia, detalhe, documento). Esta feature troca o
  conteúdo e organiza o dia por bairros.
