# Feature Specification: Roteiro de Orlando (doc do Alisson)

**Feature Branch**: `007-orlando-itinerary-doc`

**Created**: 2026-10-24

**Status**: Draft

**Input**: User description: "adicione esse roteiro para Orlando https://claude.ai/artifact/8Kpkn6F6biqtqEYQuq1dyL"
(doc "Roteiro Orlando – Novembro 2026", de @Alisson, revisão 26 de 24/10/2026; chamado abaixo de **"o doc"**).

## Contexto

Hoje Orlando (07/11 a 18/11) só tem os roteiros sugeridos do guia, sem horários. O casal escreveu um
roteiro de parques num doc e quer que ele seja o roteiro de Orlando do app, como a feature 005 fez
com Nova York.

| Dia | Programa no doc | Parque |
|---|---|---|
| 07/11 (sáb) | Chegada: carro no MCO, mercado, jantar leve | – |
| 08/11 (dom) | Magic Kingdom | 8h às 18h |
| 09/11 (seg) | Hollywood Studios, com Multi Pass e Fantasmic | 9h às 21h |
| 10/11 (ter) | EPCOT, com Multi Pass, Single Pass e Luminous | 9h às 21h |
| 11/11 (qua) | Folga (Veterans Day): manhã livre, Vineland Premium Outlets | – |
| 12/11 (qui) | Animal Kingdom | 8h às 18h |
| 13/11 (sex) | Folga: Kennedy Space Center, Cocoa Beach, Disney Springs à noite | – |
| 14/11 (sáb) | Epic Universe | 10h às 19h |
| 15/11 (dom) | Universal Studios | 10h às 19h |
| 16/11 (seg) | Folga: manhã livre, outlet ou Mall at Millenia, International Drive | – |
| 17/11 (ter) | Islands of Adventure | 9h às 18h |
| 18/11 (qua) | "Viagem de volta": check-out e devolução do carro no MCO | – |

**Como o doc é organizado** (diferente do doc de Nova York):

- seções iniciais "Decisões já tomadas e aplicadas" e "Resumo da viagem" (tabela dos 12 dias);
- cada dia (`Dia N (sáb 07/11): Título`) tem resumo, "Mapa do dia" e a chegada ao estacionamento
  com horário. Alguns dias têm também uma linha "🎟️ Reservar…";
- dentro do dia há **uma região por parque** (`📍 Magic Kingdom`), com link de fotos e texto;
- a lista "Atrações (no roteiro)" traz itens com horário:
  `8h10 — 🛶 Jungle Cruise · fila ~5 min (Adventureland). Texto. [📷 fotos]`.
  A área do parque vem entre parênteses, e alguns itens dizem como entrar: "Multi Pass", "fila
  normal", "Single Pass", "Single rider disponível";
- depois da lista vêm:
  - avisos "⚠️ Fechado" / "⚠️ Fora do roteiro";
  - a rota alternativa ("Sem Multi Pass:", "Sem fura-fila:") ou "Para aliviar:";
  - a lista "Onde comer no <parque> (lista)": nome e área, sem preço nem fila;
- no fim do dia: "🏨 ~18h – volta ao hotel" e "🌙 Noite: …";
- nos dias de folga há regiões sem atrações ("📍 Manhã livre", outlets) e o deslocamento "🚗" entre
  regiões;
- seções finais:
  - "O que reservar com antecedência": tabela de 6 itens, regra dos ingressos e checklist de 6 itens;
  - "Partida (qua 18/11) e dicas práticas";
  - "Como as rotas foram calculadas";
  - "Fontes".

**Cópia usada**: revisão 26 de 24/10/2026. Tem 515 linhas, 75 itens com horário (7 deles são
almoço), 81 links de fotos e 10 links de mapa.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Seguir o dia de parque na ordem do doc (Priority: P1)

O casal abre um dia de Orlando, em "Agora" ou em "Dia", e vê o roteiro do doc:
- o resumo, o mapa do dia e a chegada ao estacionamento;
- o que reservar no dia;
- as atrações na ordem e nos horários do doc, cada uma com fila, área e forma de entrar;
- a volta ao hotel e a noite.

"Agora" mostra a próxima atração. Cada atração tem Feito/Pendente e conta no progresso.

**Why this priority**: É o pedido: este deve ser o roteiro de Orlando.

**Independent Test**: Abrir cada dia de parque e conferir os itens com horário, a ordem e a volta ao
hotel com o doc.

**Acceptance Scenarios**:

1. **Given** o dia 08/11, **When** o casal o abre, **Then** vê a chegada ao estacionamento às 06h50
   e as atrações do Magic Kingdom na ordem do doc (Jungle Cruise 8h10 … Seven Dwarfs Mine Train
   15h30). Cada uma mostra a fila e a área.
2. **Given** o dia 09/11 às 12h30, **When** o casal abre "Agora", **Then** o próximo passo é Mickey
   & Minnie's Runaway Railway às 13h00, indicado como Multi Pass.
3. **Given** um item "Almoço", **When** exibido, **Then** aparece como intervalo, sem Feito/Pendente
   e fora do progresso.
4. **Given** um bloco com intervalo de horário (por exemplo, "14h30–20h00 — Shows e tempo livre" ou
   "10h00–14h50 — Festival of the Lion King, trilhas e almoço"), **When** exibido, **Then** mostra
   início e fim.
5. **Given** um dia com "⚠️ Fechado" (por exemplo, Tiana's Bayou Adventure em 08/11), **When**
   aberto, **Then** o aviso aparece entre os avisos do dia.
6. **Given** marcações feitas nos roteiros sugeridos de Orlando, **When** o roteiro é trocado,
   **Then** nenhuma delas marca um item do roteiro novo.
7. **Given** o app sem internet, **When** o casal abre qualquer dia de Orlando, **Then** o roteiro
   inteiro está disponível.

---

### User Story 2 - Dias de folga e "Por perto" (Priority: P1)

Nos dias de folga (11, 13 e 16/11), o casal vê as regiões do doc na ordem, com os deslocamentos.
Em qualquer dia, o casal consulta em "Por perto" a lista "Onde comer" do parque ou os mercados.
Exemplos de regiões: manhã livre, outlet, Kennedy Space Center, Cocoa Beach, Disney Springs.

**Why this priority**: São 4 dos 12 dias, e "Onde comer" é o que o casal procura na hora do almoço.

**Independent Test**: Abrir 13/11 e conferir Kennedy Space Center (4 itens com horário), o
deslocamento para Cocoa Beach, Cocoa Beach, a volta ao hotel e a noite na Disney Springs. Abrir
"Por perto" em 08/11 e conferir as 5 opções de comida do Magic Kingdom.

**Acceptance Scenarios**:

1. **Given** o dia 13/11, **When** aberto, **Then** mostra, nesta ordem:
   - a saída às 08h00;
   - Kennedy Space Center, com Space Shuttle Atlantis 9h00, KSC Bus Tour 10h30, almoço 13h00 e
     Gateway e Rocket Garden 14h00;
   - o deslocamento para Cocoa Beach;
   - Cocoa Beach;
   - a volta às ~18h;
   - a noite na Disney Springs.
2. **Given** o dia 11/11, **When** aberto, **Then** mostra a manhã livre, o Vineland Premium Outlets
   com compras das ~14h às 18h e a alternativa Kennedy Space Center como nota.
3. **Given** "Por perto" num dia de parque, **When** aberto, **Then** lista as opções de "Onde comer"
   do doc com nome e área, sem Feito/Pendente.
4. **Given** um lugar do doc que também é ponto do guia (os parques, Disney Springs, CityWalk,
   Kennedy Space Center, ICON Park, outlets, Mall at Millenia), **When** aberto, **Then** mostra as
   fotos do guia, com crédito.

---

### User Story 3 - Reservas, chegada, partida e doc completo (Priority: P2)

Antes e durante a viagem, o casal consulta:
- "O que reservar com antecedência": as datas do Multi Pass, a regra dos ingressos e o checklist;
- a chegada de 07/11 e a partida de 18/11;
- as dicas práticas e "Como as rotas foram calculadas";
- o doc inteiro, para ler.

**Why this priority**: É importante para a preparação. Dois itens têm data fixa: o Multi Pass do
Hollywood Studios em 06/11 e o do EPCOT em 07/11. O uso diário é coberto por US1 e US2.

**Independent Test**: Abrir o documento completo de Orlando sem internet e conferir todas as seções
na ordem. Conferir na tela "Viagem" os 6 itens a reservar.

**Acceptance Scenarios**:

1. **Given** a tela "Viagem", **When** aberta, **Then** lista os 6 itens a reservar de Orlando, com
   quando reservar, custo e dia de uso, ao lado dos de Nova York.
2. **Given** "Agora" em 06/11, **When** aberto, **Then** lembra de comprar o Multi Pass do Hollywood
   Studios. Em 07/11, lembra do Multi Pass do EPCOT e do Single Pass opcional.
3. **Given** o dia 07/11 (locomoção Nova York → Orlando), **When** aberto, **Then** o bloco "A
   chegada" traz o conteúdo do Dia 1 do doc:
   - retirar o carro no MCO;
   - as compras básicas e os mercados;
   - o jantar leve.
4. **Given** o dia 18/11, **When** aberto, **Then** "Antes de sair" traz o check-out com folga e a
   devolução do carro no MCO, e "A viagem" diz "De trem para Miami". A frase do voo internacional
   não aparece nesses blocos (Q1).
5. **Given** o documento completo de Orlando, **When** aberto, **Then** mostra todas as seções do
   doc na ordem, com tabelas legíveis no celular.

---

### Edge Cases

- **Horário com "ou"**: "12h15 ou 13h15 — Grinchmas Who-liday Spectacular" aparece com o texto do
  doc e é ordenado pelo primeiro horário.
- **Horário aproximado** ("~18h – volta ao hotel", "~20h45"): o "~" é mantido.
- **Dois itens quase no mesmo horário**: o desfile às 17h30 e o Minion Mayhem às 17h35 (15/11)
  ficam na ordem do doc.
- **Item opcional**: o desfile Festival of Fantasy (opcional) e o Single Pass do Guardians (opcional)
  mostram "opcional" como no doc.
- **Rota alternativa** ("Sem Multi Pass:", "Sem fura-fila:", "Para aliviar:"): aparece como nota da
  região, sem Feito/Pendente. Não troca a rota principal.
- **Dia 1 no doc, mas dia de locomoção no app**: o 07/11 é o dia em que o casal sai de Nova York. O
  conteúdo do Dia 1 vai para o bloco "A chegada", que hoje diz "Sem orientações no roteiro".
- **Região sem atrações** ("📍 Manhã livre", "📍 Cocoa Beach", "📍 Orlando International Premium
  Outlets ou Mall at Millenia"): aparece como região com texto. Compras com horário aproximado
  ("tarde, ~14h às 18h") viram passo de compras.
- **Noite com link de fotos** (Disney Springs em 13/11, International Drive em 16/11): a noite mostra
  o link.
- **Tipo de dia**: o tipo de cada dia de Orlando hoje não bate com o doc. Por exemplo, 08/11
  (Magic Kingdom) está como passeio e 16/11 (folga) como parque. O tipo passa a seguir o doc:
  - dia de parque: 08, 09, 10, 12, 14, 15 e 17/11;
  - passeio: 11, 13 e 16/11;
  - 07 e 18/11 continuam locomoção.
- **Doc editado depois da cópia**: o app continua com a cópia que tem até ser atualizado (FR-019).

## Requirements *(mandatory)*

### Functional Requirements

**Substituição**

- **FR-001**: O roteiro de Orlando de 08/11 a 17/11 MUST vir inteiro do doc. Os roteiros sugeridos
  de Orlando MUST NOT aparecer mais nos dias da viagem. Os pontos do guia de Orlando continuam no
  guia.
- **FR-002**: Os textos do doc MUST ser mantidos sem reescrita: descrições, filas, áreas, formas de
  entrada, avisos e notas. Só são permitidos ajustes de formatação.
- **FR-003**: Marcações feitas nos roteiros sugeridos de Orlando MUST NOT marcar itens do roteiro
  novo. O progresso de Orlando recomeça do zero.

**Dia**

- **FR-004**: Cada dia de Orlando MUST mostrar, nesta ordem:
  1. o resumo e o link "Mapa do dia";
  2. os avisos do dia, que são a linha "Reservar…", "⚠️ Fechado" e "⚠️ Fora do roteiro";
  3. a chegada ao estacionamento ou a saída;
  4. as regiões na ordem do doc;
  5. a volta ao hotel e a noite.
- **FR-005**: Cada atração com horário MUST mostrar:
  - o horário, o ícone e o nome;
  - a fila estimada;
  - a área do parque;
  - a forma de entrar, quando o doc trouxer ("Multi Pass", "Single Pass", "fila normal", "Single
    rider disponível");
  - o texto e o link de fotos.
- **FR-006**: Cada atração com horário MUST ter Feito/Pendente e contar no progresso. Os itens
  abaixo MUST NOT contar:
  - chegada ao estacionamento, saída, deslocamento e volta ao hotel;
  - "Almoço";
  - "tempo livre".
- **FR-007**: Os horários MUST aparecer como no doc, preservando "~", intervalos ("–") e "ou".
- **FR-008**: A rota alternativa e o "Para aliviar" de cada parque MUST aparecer como nota da região.

**Lugares**

- **FR-009**: As listas "Onde comer" e "Mercados" MUST aparecer em "Por perto" e na região, como
  lista de consulta, sem Feito/Pendente e fora do progresso (mesma regra da feature 005).
- **FR-010**: Todo link "📷 fotos" e "Mapa do dia" do doc MUST estar no app e abrir exatamente o link
  do doc. Sem internet, o app avisa.
- **FR-011**: Quando um lugar ou região do doc corresponder a um ponto do guia de Orlando, o app MUST
  mostrar as fotos do guia, com crédito. O app MUST NOT mostrar fotos de outros lugares.
- **FR-012**: Cada região e cada atração com horário MUST ter foto offline do próprio lugar, com
  autor, licença livre e link da fonte, como a feature 006 fez em Nova York (Q2 = A). A foto do guia
  vale quando for do mesmo lugar. Os almoços e os intervalos não precisam de foto. A meta é ≥ 90% de
  cobertura (SC-010); o que ficar sem foto MUST ser listado.

**Chegada, partida e reservas**

- **FR-013**: O bloco "A chegada" de 07/11 MUST trazer o Dia 1 do doc: os dois itens de chegada, os
  mercados e a noite.
- **FR-014**: O 18/11 MUST continuar como dia de locomoção Orlando → Miami, **de trem** (Q1, dito
  pelo casal). Os três blocos do dia são:
  - "Antes de sair": o check-out com folga e a devolução do carro no MCO, como no doc;
  - "A viagem": "De trem para Miami". O doc não traz estação nem horário, e o app MUST NOT
    inventá-los;
  - "A chegada": continua como está hoje para Miami.

  A frase do doc sobre voo internacional ("chegue ao aeroporto 3h antes") MUST NOT aparecer nos
  blocos do dia, porque não vale para o trem. Ela continua no documento completo, que reproduz o doc
  inteiro.
- **FR-015**: A tabela "O que reservar com antecedência" MUST virar itens a reservar de Orlando na
  tela "Viagem", com os 6 itens:
  - quando reservar;
  - custo;
  - dia de uso.

  A regra dos ingressos e o checklist de 6 itens também aparecem.
- **FR-016**: Os dois Multi Pass, com data fixa de compra (06/11 e 07/11), MUST aparecer em "Agora"
  nesses dias.

**Documento completo e tipo de dia**

- **FR-017**: O documento completo de Orlando MUST trazer todas as seções do doc na ordem, com
  links e tabelas: Decisões, Resumo, os 11 dias, O que reservar, Partida e dicas, Como as rotas
  foram calculadas e Fontes.
- **FR-018**: O tipo de cada dia de Orlando MUST seguir o doc:
  - dia de parque: 08, 09, 10, 12, 14, 15 e 17/11;
  - passeio: 11, 13 e 16/11.

**Preservação e atualização**

- **FR-019**: Atualizar o roteiro a partir de uma nova versão do doc MUST ser um passo único e
  documentado, com a mesma conferência automática de Nova York. A conferência verifica que estão no
  app, na ordem:
  - todos os itens com horário;
  - todas as opções de comida;
  - todos os links;
  - todas as seções.

  Ela MUST apontar o que faltar.
- **FR-020**: Nova York, Miami, o guia, as telas da feature 006 e o funcionamento offline MUST
  continuar como estão.

### Key Entities

- **Roteiro de Orlando (cópia do doc)**: título, autor, data da cópia, seções gerais, 11 dias de
  Orlando (08 a 17/11), conteúdo de chegada (Dia 1) e partida.
- **Dia**: data, título, resumo, mapa do dia, chegada ao estacionamento, avisos (reservar, fechado),
  regiões, volta ao hotel, noite.
- **Região**: parque ou lugar, com link de fotos, texto, atrações, nota de rota alternativa e lista
  "Onde comer".
- **Atração**: horário (início, fim ou "ou", aproximado), ícone, nome, fila, área do parque, forma de
  entrar, texto, link de fotos, se é opcional.
- **Item a reservar**: item, quando reservar, custo, dia de uso.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos 75 itens com horário do doc aparecem no app, no dia, na região e na ordem do
  doc. Os 7 almoços e "Shows e tempo livre" não contam no progresso; os outros 67 contam, mais as 2
  tardes de compras com horário (11 e 16/11).
- **SC-002**: 100% das opções de "Onde comer" e dos mercados aparecem no dia certo.
- **SC-003**: 100% dos links do doc estão no app e abrem o destino exato: 81 de fotos, 10 mapas do
  dia e as fontes.
- **SC-004**: 100% das seções do doc aparecem no documento completo de Orlando, na ordem.
- **SC-005**: 0 roteiros sugeridos nos dias de Orlando; 0 marcações antigas aplicadas a itens novos.
- **SC-006**: Com o app sem internet, o casal abre qualquer dia, região ou lugar de Orlando.
- **SC-007**: Em "Agora", num dia de parque, a próxima atração aparece com horário, fila e forma de
  entrar, sem nenhum toque.
- **SC-008**: O casal confirma, numa revisão lado a lado, que o app reproduz o doc sem perda de
  informação.
- **SC-009**: Nova York, Miami e as demais telas continuam passando em todos os testes existentes.
- **SC-010**: ≥ 90% das regiões e das atrações com horário de Orlando têm foto offline do próprio
  lugar, com crédito.

## Assumptions

- **O doc é a fonte de verdade.** Não haverá nova pesquisa de filas, horários ou preços. Os avisos
  do doc ("confira no app", "confirme se o seu ingresso…") aparecem como estão.
- **O app usa a cópia de 24/10/2026 (revisão 26).** Se o casal editar o doc, basta pedir a
  atualização (FR-019). O app não sincroniza sozinho, porque precisa funcionar offline.
- **Hotel.** O doc não diz qual é o hotel em Orlando. "Volta ao hotel" aparece sem endereço, e o
  "Mostrar ao motorista" dessa volta não é oferecido.
- **Mesmo formato de Nova York.** O roteiro usa as telas da feature 006 ("Agora", "Dia", "Por perto",
  "Viagem") e o mesmo caminho de conteúdo da feature 005. O leitor do doc precisa aceitar o formato
  de Orlando:
  - cabeçalho do dia abreviado ("sáb 07/11");
  - item no formato "horário — ícone nome · fila (área)";
  - "Onde comer" sem preço;
  - intervalos com "–" e horários com "ou".
- **Lista sem preço.** "Onde comer" em Orlando só tem nome e área. A legenda de preço de Nova York
  não aparece em Orlando.
- **Trem para Miami (Q1).** O meio de transporte foi informado pelo casal; não está no doc. Estação,
  horário e bilhete do trem não estão em nenhuma fonte do app e ficam de fora até o casal informar.
- **Fotos (Q2).** As fotos vêm de fontes de licença livre, como em Nova York. Atração sem foto livre
  do próprio lugar fica sem foto, nunca com a foto de outro lugar.
- **Roteiros sugeridos.** Os roteiros sugeridos de Orlando (por exemplo, os de 10/11 e 17/11)
  continuam guardados, mas saem dos dias da viagem, como os de Nova York na feature 005.
