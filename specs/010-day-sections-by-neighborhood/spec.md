# Feature Specification: Seções do dia agrupadas por bairro, Transporte e Dicas só quando relevantes

**Feature Branch**: `010-day-sections-by-neighborhood`

**Created**: 2026-10-27

**Status**: Draft

**Decisões** (padrão recomendado, adotado no `/speckit-plan` sem resposta explícita; o usuário pode
trocar antes da implementação):
- **Q1 = A**: "Transporte" fica só com os trechos que não são a pé; trechos a pé saem da seção.
- **Q2 = A**: o cabeçalho do grupo é o nome do grupo como está no roteiro (ex.: "Noite: jantar no
  Harlem", "Magic Kingdom").

**Input**: User description: "Preciso de mais um conjunto de ajustes no site/app de roteiro de
viagem. Mantenha todo o conteúdo e a estrutura já implementados (app first, cards clicáveis, menus
dentro de cada dia que só aparecem quando há conteúdo) e altere apenas o que está descrito abaixo"
— quatro pontos:

1. "Transporte" só quando o deslocamento não for a pé e houver dicas relevantes;
2. "Restaurantes e Cafés", "Curiosidades" e "Lojas e Brechós" agrupados por bairro;
3. atrações de compras com o recorte das lojas e brechós da região;
4. "Dicas" só com o que muda o planejamento.

Ao terminar: listar por dia as seções removidas e as dicas cortadas, confirmar o agrupamento por
bairro em todos os dias, sinalizar itens de bairro incerto e testar de novo a 360 px e 402 px.

## Contexto

A feature 009 levou para dentro de cada dia um menu de seções. Hoje o dia tem:
- Paradas;
- Restaurantes e Cafés;
- Brechós e Lojas;
- Bairros;
- Transporte;
- Dicas.

Cada seção só aparece quando o dia tem conteúdo para ela. Os restaurantes e as lojas aparecem numa
lista corrida, sem divisão por bairro. As "Curiosidades" (locações de filmes e séries e lugares
ligados a histórias) existem só na página do bairro, não no dia.

O que o conteúdo atual mostra (levantado do próprio app):

- **Bairro dos itens.** No roteiro, cada restaurante, loja e curiosidade já pertence a um grupo do
  dia. Muitos grupos são bairros (SoHo, Nolita, Chinatown…). Outros não são:
  - parques de Orlando (Magic Kingdom, EPCOT…);
  - blocos da noite (ex.: "Noite: jantar no Harlem", "Noite: MJ The Musical (19h00, Neil Simon
    Theatre)", "Noite: Knicks x Nets no Madison Square Garden (19h30)");
  - regiões descritas por um ponto ("Empire State e arredores (Midtown South)").
- **Transporte.**
  - Todos os dias de Nova York estão marcados como "A pé", mas quase todos começam com metrô
    (linha 6, linha E, troca para a B) ou têm ferry ou táxi.
  - Os deslocamentos entre bairros são quase todos a pé ("5 minutos a pé pela Prince Street").
  - Em Orlando, alguns dias de parque têm em "Transporte" só o horário do parque. Isso não é
    deslocamento.
- **Dicas.** São 10 no total. Todas são específicas: Maratona e horário de inverno, horários do
  Museu de História Natural e do MET, atrações fechadas, reservas de Multi Pass e fila virtual,
  ingresso Park-to-Park. Nenhuma é genérica, então a limpeza não deve cortar nenhuma. A regra vale
  para o futuro e o relatório precisa dizer isso claramente.
- **Atrações de compras.** "Compras no SoHo", "Compras na Elizabeth e na Mott Street", "Compras no
  Lower East Side", "Compras no East Village" e "Compras na Bedford Avenue" estão ligadas a um
  bairro que tem lojas no roteiro. As compras dos outlets de Orlando e a Lincoln Road (Miami) não
  têm lojas listadas.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Comer, comprar e curiosidades separados por bairro (Priority: P1)

No dia 01/11, o casal abre "Restaurantes e Cafés" e vê os lugares divididos pelos bairros do dia, na
ordem do roteiro: SoHo, Nolita, Chinatown, Little Italy, Lower East Side, East Village. Cada
cabeçalho é só o nome do bairro. Ao rolar um grupo, o nome do bairro fica preso no topo, logo
abaixo do menu do dia. O mesmo vale para "Curiosidades" e "Brechós e Lojas".

**Why this priority**: É a mudança que mais ajuda na rua ("estamos em Nolita, onde comer aqui?") e
vale para todos os dias com restaurantes, lojas ou curiosidades.

**Independent Test**: Abrir 01/11, 02/11 e 04/11 a 360 px e 402 px. Conferir:
- os grupos na ordem dos bairros do roteiro;
- nenhum bairro repetido;
- cabeçalhos sem descrição;
- o cabeçalho preso durante a rolagem do grupo.

**Acceptance Scenarios**:

1. **Given** o dia 01/11, **When** o casal abre "Restaurantes e Cafés", **Then** vê 6 grupos na
   ordem SoHo, Nolita, Chinatown, Little Italy, Lower East Side e East Village. Os grupos somam os
   mesmos 24 lugares de hoje e nenhum bairro aparece duas vezes.
2. **Given** o dia 01/11, **When** o casal abre "Brechós e Lojas", **Then** vê 4 grupos: SoHo,
   Nolita, Lower East Side e East Village. Os grupos somam as 17 lojas de hoje.
3. **Given** um dia com curiosidades (ex.: 01/11, 02/11, 03/11), **When** o casal abre o menu,
   **Then** existe o item "Curiosidades", com os lugares agrupados por bairro. Num dia sem
   curiosidades (ex.: 05/11), o item não aparece.
4. **Given** um cabeçalho de bairro, **When** o casal o lê, **Then** só vê o nome do bairro, sem
   frase, história, foto ou contagem. Essas informações ficam só em "Bairros".
5. **Given** a rolagem dentro de um grupo no celular, **When** o grupo ocupa mais que a tela,
   **Then** o nome do bairro fica visível no topo, abaixo do menu do dia, até o próximo grupo
   começar.
6. **Given** um item sem bairro identificável, **When** a seção é montada, **Then** o item vai
   para o grupo "Outros", no final. "Outros" só existe se tiver itens.

---

### User Story 2 - "Transporte" só com o que ajuda a se deslocar (Priority: P2)

O casal só vê "Transporte" num dia quando há deslocamento que não é a pé, com informação útil
(linha, estação, ferry, táxi ou carro, tempo de trajeto, preço, app de pagamento). Em dias sem
isso, o item some do menu.

**Why this priority**: Tira ruído do menu nos dias em que a seção não ajuda. Depende da regra de
"a pé" (ver FR-004).

**Independent Test**: Para cada dia da viagem, conferir se "Transporte" aparece ou não, de acordo
com a regra, e se o conteúdo é só de deslocamentos não a pé.

**Acceptance Scenarios**:

1. **Given** um dia cujo único conteúdo de "Transporte" seria o horário de abertura do parque
   (ex.: 09/11), **When** o casal abre o dia, **Then** o item "Transporte" não aparece. O horário
   continua na parada correspondente.
2. **Given** um dia com metrô, ferry, táxi ou carro descritos no roteiro (ex.: 04/11, com o NYC
   Ferry), **When** o casal abre "Transporte", **Then** vê esses deslocamentos.
3. **Given** um deslocamento a pé ("5 minutos a pé pela Prince Street"), **When** a seção é
   montada, **Then** ele não aparece em "Transporte". Continua no roteiro, nas paradas.
4. **Given** um dia de troca de cidade (07/11, 18/11, 21/11), **When** há blocos de partida,
   viagem ou chegada, **Then** "Transporte" continua com esses blocos, como hoje.

---

### User Story 3 - Atração de compras com as lojas da região (Priority: P2)

Ao abrir "Compras no SoHo", o casal vê as lojas e brechós que o roteiro recomenda no SoHo:
- o nome;
- o que vale a pena ali (estilo, faixa de preço, destaque);
- o link para o mapa.

Há um atalho para "Brechós e Lojas" do dia, que continua com a lista completa.

**Why this priority**: Responde "o que tem pra comprar aqui?" sem sair da atração. Usa os mesmos
dados da seção do dia, então não há divergência.

**Independent Test**: Abrir "Compras no SoHo" (01/11) e "Compras na Bedford Avenue" (04/11).
Conferir que as lojas são as mesmas e têm o mesmo texto que o grupo SoHo ou Williamsburg em
"Brechós e Lojas" do dia, e que o atalho leva à seção.

**Acceptance Scenarios**:

1. **Given** "Compras no SoHo", **When** o casal abre a atração, **Then** vê as 5 lojas do SoHo
   com nome, descrição curta do roteiro, faixa de preço quando houver e "Abrir no mapa" quando
   houver link.
2. **Given** a mesma loja na atração e em "Brechós e Lojas", **When** o casal compara, **Then** o
   texto é idêntico.
3. **Given** a atração de compras, **When** o casal toca em "Ver todas as lojas do dia",
   **Then** chega à seção "Brechós e Lojas" do dia.
4. **Given** uma atração de compras sem lojas listadas no roteiro (outlets de Orlando, Lincoln
   Road), **When** o casal abre a atração, **Then** não aparece bloco de lojas vazio nem
   "sem informações".

---

### User Story 4 - "Dicas" só com o que muda o planejamento (Priority: P3)

"Dicas" mostra só avisos específicos:
- eventos na cidade;
- mudança de horário;
- funcionamento;
- reservas;
- feriados;
- clima;
- segurança;
- atrações fechadas.

Dicas genéricas ("caminhem a pé", "usem sapatos confortáveis", "aproveitem") não aparecem. O dia que
ficar sem dicas perde a seção e o item do menu.

**Why this priority**: Com o conteúdo atual, nenhuma dica é cortada (todas as 10 são
específicas). A regra protege conteúdo futuro e o relatório confirma o resultado.

**Independent Test**: Conferir que os dias 01/11, 03/11, 08/11, 09/11, 10/11, 12/11, 14/11, 15/11
e 17/11 continuam com "Dicas" e que nenhum outro dia ganhou a seção.

**Acceptance Scenarios**:

1. **Given** a dica da Maratona e do horário de inverno (01/11), **When** o casal abre "Dicas",
   **Then** a dica aparece inteira.
2. **Given** uma dica genérica no roteiro (caso futuro), **When** o conteúdo é montado, **Then**
   ela não aparece em "Dicas" e entra na lista de dicas cortadas para revisão.
3. **Given** um dia cujas dicas foram todas cortadas, **When** o casal abre o dia, **Then** não há
   item "Dicas" no menu.

---

### Edge Cases

- **Cabeçalho que não é um bairro.** Parques de Orlando, blocos "Noite: …" e regiões nomeadas por
  um ponto. Ver FR-007.
- **Mesmo lugar em dois grupos.** Hoje não acontece. Se acontecer, o lugar fica só no primeiro
  bairro, na ordem do roteiro, e entra na lista de revisão.
- **Dia com um único bairro** (ex.: os parques de Orlando). O grupo aparece com o cabeçalho, e o
  comportamento é o mesmo.
- **Cabeçalho preso e menu preso.** O cabeçalho do bairro fica logo abaixo do menu do dia, sem
  cobrir o primeiro card do grupo.
- **Seção com uma única seção no dia.** Mesma regra da 009: o menu não aparece, mas os grupos
  aparecem.
- **Atração de compras com o mesmo bairro em mais de uma atração.** Cada atração mostra as lojas
  do seu bairro.

## Requirements *(mandatory)*

### Functional Requirements

**Agrupamento por bairro**

- **FR-001**: "Restaurantes e Cafés", "Curiosidades" e "Brechós e Lojas" MUST mostrar os itens
  agrupados por bairro. Cada grupo tem um cabeçalho só com o nome do bairro.
- **FR-002**: A ordem dos grupos MUST seguir a ordem dos bairros no roteiro do dia. Cada bairro
  MUST aparecer uma única vez por seção, com todos os seus itens.
- **FR-003**: Itens sem bairro identificável MUST ir para o grupo "Outros", no fim da seção. O
  grupo só existe se tiver itens.
- **FR-004**: No celular, o cabeçalho do bairro MUST ficar preso abaixo do menu do dia enquanto o
  grupo estiver na tela.
- **FR-005**: O menu do dia MUST ganhar o item "Curiosidades", entre "Brechós e Lojas" e "Bairros".
  O item segue a regra de só aparecer quando houver conteúdo. Os cards de curiosidade abrem o
  detalhe do lugar, como os outros cards.
- **FR-006**: A informação do bairro (frase, história, foto, contagens) MUST continuar só em
  "Bairros". Os cabeçalhos dos grupos não repetem essas informações.
- **FR-007** (Q2 = A): Grupos do roteiro que não são bairros MUST usar como cabeçalho o nome do
  grupo como está no roteiro, sem alteração. Exemplos: parques de Orlando ("Magic Kingdom"),
  blocos da noite ("Noite: jantar no Harlem") e regiões ("Empire State e arredores (Midtown
  South)"). Esses cabeçalhos entram no relatório para revisão.

**Transporte**

- **FR-008**: "Transporte" MUST mostrar só deslocamentos que não são a pé e têm informação
  específica: linha, estação, ferry, táxi ou carro, tempo de trajeto, preço, forma de pagamento,
  monotrilho ou barca. Deslocamentos a pé e informações que não são de deslocamento (ex.: só o
  horário do parque) MUST ficar de fora. Continuam nas paradas.
- **FR-009** (Q1 = A): A seção e o item do menu MUST sumir quando não sobrar nenhum deslocamento
  depois da regra FR-008. Um dia marcado "A pé" que tem um trecho de metrô, ferry, táxi ou carro
  (ex.: 01/11, com o metrô 6 até Bleecker St) mantém "Transporte" só com esses trechos.
- **FR-010**: Nos dias de troca de cidade, os blocos de partida, viagem e chegada MUST continuar
  em "Transporte", como na 009.
- **FR-011**: O "Mapa do dia" sozinho MUST NOT manter a seção "Transporte".

**Atrações de compras**

- **FR-012**: A página de uma atração de compras ligada a um bairro MUST mostrar as lojas e
  brechós desse bairro no dia: nome, descrição curta do roteiro (estilo e destaque), faixa de preço
  quando houver e "Abrir no mapa" quando houver link.
- **FR-013**: A atração e a seção "Brechós e Lojas" MUST usar a mesma fonte, com texto idêntico
  para a mesma loja.
- **FR-014**: A atração MUST ter um atalho para a seção "Brechós e Lojas" do dia. Sem lojas no
  bairro, nem o bloco nem o atalho aparecem.

**Dicas**

- **FR-015**: "Dicas" MUST mostrar só avisos específicos que mudam o planejamento: eventos e
  fechamento de ruas, mudança de horário, funcionamento, reserva, feriado, clima, segurança e
  atrações fechadas ou fora do ingresso.
- **FR-016**: Dicas genéricas MUST ser cortadas. Exemplos: andar a pé, sapatos confortáveis,
  "aproveitem", hidratação sem contexto. O critério MUST ser aplicado a cada dica inteira e nunca
  reescreve o texto do roteiro.
- **FR-017**: Um dia sem dicas depois do corte MUST perder a seção e o item do menu.

**Entrega e dados**

- **FR-018**: O relatório MUST listar, por dia:
  - as seções removidas ("Transporte" e "Dicas");
  - as dicas cortadas, com o texto;
  - a confirmação de que "Restaurantes e Cafés", "Curiosidades" e "Brechós e Lojas" estão
    agrupadas por bairro em todos os dias que têm essas seções.
- **FR-019**: Itens com bairro incerto MUST ser listados para revisão, sem palpite. Exemplos: um
  lugar ligado a um bloco da noite, ou a dois grupos.
- **FR-020**: Todo o conteúdo e a estrutura da 009 MUST continuar como estão:
  - textos e atrações;
  - cards inteiros clicáveis;
  - o menu que só mostra seções com conteúdo;
  - o cabeçalho fixo.

  Os testes MUST passar a 360 × 780 e 402 × 874.

### Key Entities

- **Grupo de bairro**: nome do bairro (cabeçalho) e os itens da seção naquele bairro, na ordem do
  roteiro. Existe por seção e por dia.
- **Deslocamento relevante**: um trecho do dia com modo diferente de "a pé" e informação
  específica. Vem do roteiro. É a base para decidir se "Transporte" aparece.
- **Dica**: um aviso do dia, classificado como específico (fica) ou genérico (sai e entra na lista
  de revisão).
- **Recorte de compras**: as lojas e brechós do bairro de uma atração de compras, os mesmos
  itens de "Brechós e Lojas".

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos dias com restaurantes, lojas ou curiosidades, as seções aparecem
  agrupadas por bairro na ordem do roteiro, sem bairro repetido. O total de itens é igual ao de
  antes (ex.: 01/11 com 24 restaurantes e cafés e 17 lojas).
- **SC-002**: Nenhum dia mostra "Transporte" só com trechos a pé, só com horário de parque ou só
  com o mapa do dia.
- **SC-003**: A loja de uma atração de compras tem o mesmo texto em 100% dos casos na atração e em
  "Brechós e Lojas".
- **SC-004**: Nenhuma dica genérica aparece em "Dicas", e as 10 dicas específicas de hoje
  continuam visíveis.
- **SC-005**: A 360 px e 402 px, nenhuma tela tem rolagem lateral. Os alvos de toque têm pelo
  menos 44 px. Durante a rolagem de um grupo, o cabeçalho do bairro fica visível sem cobrir o
  primeiro card.
- **SC-006**: O relatório lista por dia as seções removidas, as dicas cortadas e os itens de bairro
  incerto. Nenhum item muda de bairro por palpite.

## Assumptions

- **Nome das seções.** O pedido escreve "Lojas e Brechós". É a mesma seção que hoje se chama
  "Brechós e Lojas". O rótulo atual fica, para não mudar o que já foi aprovado na 009.
- **Bairro de cada item.** É o grupo do roteiro em que o item está. Nenhum bairro é deduzido de
  endereço ou de conhecimento externo.
- **Ordem dos bairros.** É a ordem dos grupos no roteiro do dia.
- **Dicas.** São os avisos do dia, como definido na 009 (Q2 = B). As dicas gerais da cidade
  continuam só no documento completo e não entram nesta limpeza.
- **Curiosidades.** São os lugares que o roteiro marca como locação ou cenário (hoje mostrados na
  página do bairro com esse nome).
- **Atração de compras.** É um passo da categoria "compras" ligado a um bairro do dia.
