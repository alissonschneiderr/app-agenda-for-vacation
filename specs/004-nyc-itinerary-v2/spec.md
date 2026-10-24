# Feature Specification: Roteiro de Nova York v2 (roteiro do Alisson)

**Feature Branch**: `004-nyc-itinerary-v2`

**Created**: 2026-10-21

**Status**: Draft

**Input**: User description: "Substitua o roteiro de Nova York por esse: # Roteiro Nova York — 31/10 a 06/11" (documento completo, datado de 20/10/2026, no histórico do `/speckit-specify`; ele é a fonte de verdade desta feature e é chamado abaixo de **"o documento"**).

## Contexto

Hoje o app tem um roteiro FULL de Nova York (feature 002, 207 atividades) exibido nas telas de destino
(feature 003). O casal escreveu um roteiro novo, já pesquisado e com fontes, e quer que ele **substitua
integralmente** o atual. O documento traz, além dos 7 dias:

- alertas e datas (maratona e fim do horário de verão em 01/11, Met fechado na quarta 04/11);
- museus com horários e dia de visita; eventos fixados; trajeto JFK → Pod 51;
- ingressos a comprar antes;
- 28 lugares de comida com nível (🏆 ícone / ⭐ referência / 📍 conveniência), "por que é icônico",
  "por que neste dia/horário", "o que pedir", "preço e fila" e link do Google Maps;
- por dia: tabela de horários, onde comer, locações de filmes e séries (com dica de foto), compras
  (estilo, faixa de preço, por que vale) e atrações (com ingresso ou grátis), cada lugar com link do
  Google Maps;
- partida em 07/11 (voo às 14h do LaGuardia);
- listas extras: "Não saia de NY sem provar" (24 lugares) e "Brechós e marcas autorais extras" (15 lojas);
- dicas práticas, plano B para chuva (geral e por dia), conferência final e fontes consultadas.

**Diferenças em relação ao roteiro atual que afetam regras já existentes**:

1. O documento coloca **MJ The Musical em 05/11 (quinta)**; o roteiro atual e o pedido da feature 002
   tinham 04/11 (quarta). **Decidido (Q1)**: vale **05/11**, como no documento; o compromisso de 04/11
   é corrigido para 05/11.
2. O documento inclui itens que a feature 002 proibia: Keens **Steakhouse** (02/11), **Grand Central
   Oyster Bar** com ostras (05/11), har gow de **camarão** no Nom Wah, salmão defumado e whitefish no
   Ess-a-Bagel, e a vitrine da **Tiffany & Co.** como parada de foto (03/11). **Decidido (Q2)**: o
   documento prevalece; as restrições alimentares e de lojas da feature 002 deixam de valer.
3. Os horários de lanche do documento variam de 14h55 a 17h05 (a regra atual exige 15h30–16h30), a
   chegada ao Madison Square Garden é às 18h50 (o roteiro atual usava 18h45) e o documento usa links do
   Google Maps em vez de fotos.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Usar o roteiro novo dia a dia (Priority: P1)

O casal abre Nova York no app e encontra exatamente o roteiro do documento: para cada dia de 31/10 a
06/11, a sequência de horários, deslocamentos ("como ir"), refeições, atrações, compras e locações, com
os compromissos fixos destacados e o controle Feito/Pendente em cada atividade.

**Why this priority**: É o pedido central: substituir o roteiro. Sem isso nada mais importa.

**Independent Test**: Abrir cada dia de Nova York e comparar, linha a linha, com a tabela de horários
do documento (horário, programa, como ir).

**Acceptance Scenarios**:

1. **Given** o dia 31/10, **When** o casal o abre, **Then** vê as 16 linhas da tabela do documento na
   mesma ordem e horários (do pouso no JFK às 06h30 à volta ao hotel às 20h35–21h05), com o "como ir"
   de cada uma.
2. **Given** qualquer dia de 01/11 a 06/11, **When** aberto, **Then** a sequência e os horários batem
   com a tabela do documento daquele dia.
3. **Given** o dia do jogo (02/11), **When** aberto, **Then** Knicks x Nets aparece às 19h30 como
   compromisso fixo, com chegada ao Madison Square Garden às 18h50.
4. **Given** o dia do musical, **When** aberto, **Then** MJ The Musical aparece às 19h como
   compromisso fixo, com chegada ao Neil Simon Theatre às 18h30.
5. **Given** atividades marcadas como feitas no roteiro antigo, **When** o roteiro é substituído,
   **Then** essas marcações não são aplicadas por engano a atividades diferentes do roteiro novo.
6. **Given** os dias, **When** o casal usa o app offline, **Then** todo o roteiro novo está disponível.

---

### User Story 2 - Consultar os detalhes de cada lugar como no documento (Priority: P1)

Ao abrir um lugar (restaurante, café, atração, loja ou locação), o casal vê os textos do documento: nível
(🏆/⭐/📍), por que é icônico, por que neste dia/horário, o que pedir, preço e fila (comida); estilo,
faixa de preço e por que vale (compras); obra, cena e dica de foto (locações); ingresso ou grátis
(atrações) — e um botão que abre o lugar no Google Maps.

**Why this priority**: O valor do documento está nesses textos; o casal vai consultá-los na rua.

**Independent Test**: Abrir o Keens (02/11), a Kith (05/11) e o prédio de Friends (06/11) e conferir
que cada campo do documento aparece e que o link do Maps abre a busca certa.

**Acceptance Scenarios**:

1. **Given** um lugar de comida, **When** aberto, **Then** mostra nível, por que é icônico, por que
   neste dia/horário, o que pedir e preço e fila, com o texto do documento.
2. **Given** uma loja, **When** aberta, **Then** mostra bairro (quando houver), estilo, faixa de preço e
   por que vale.
3. **Given** uma locação, **When** aberta, **Then** mostra as obras e cenas associadas e a dica de foto.
4. **Given** qualquer lugar com link no documento, **When** o casal toca em "Abrir no Google Maps",
   **Then** o link do documento é aberto (fora do app, com internet).
5. **Given** um lugar que também existe no guia do app, **When** aberto, **Then** mostra também as fotos
   e os dados do guia; sem correspondência, não aparece foto inventada.
6. **Given** um lugar com observação de risco no documento (ex.: "confiram no Maps se o quiosque segue
   aberto", "vejam no Maps qual loja está aberta"), **When** aberto, **Then** a observação aparece em
   destaque.

---

### User Story 3 - Preparação, extras e imprevistos (Priority: P2)

Antes e durante a viagem, o casal consulta as seções gerais do documento: alertas e datas, museus,
eventos fixados, JFK → hotel, ingressos a comprar, lista de comidas, partida em 07/11, "Não saia de NY
sem provar", brechós e marcas extras, dicas práticas, plano B para chuva (geral e por dia), conferência
final e fontes.

**Why this priority**: Importante para preparar e para os imprevistos, mas o uso diário é a US1/US2.

**Independent Test**: Abrir o documento completo no app e conferir que todas as seções do documento
original estão lá, com as tabelas e os links.

**Acceptance Scenarios**:

1. **Given** o documento completo no app, **When** o casal o percorre, **Then** encontra todas as
   seções do documento original, na mesma ordem, com tabelas legíveis no celular.
2. **Given** um dia com plano B no documento (01/11, 03/11, 04/11, 06/11), **When** aberto, **Then** a
   troca sugerida para chuva aparece no próprio dia.
3. **Given** o dia 07/11 (locomoção para Orlando), **When** aberto, **Then** mostra as orientações de
   partida (check-out, táxi para o LaGuardia, alternativa, véspera).
4. **Given** a lista de ingressos a comprar, **When** consultada, **Then** contém Top of the Rock
   (31/10, 14h15), MoMA (02/11, 10h30), The Met (03/11, 14h30), AMNH (04/11, 10h30) e os dois
   compromissos já comprados.
5. **Given** as listas "Não saia de NY sem provar" e "Brechós extras", **When** consultadas, **Then**
   mostram bairro, lugar, por que ir/estilo, preço (lojas) e link do Maps.

---

### Edge Cases

- **Linha da tabela sem horário de término** (ex.: "09h00 Deixar malas", "17h45 Saída para o jantar",
  "~22h15 Volta"): aparece com o horário de início e sem duração inventada.
- **Horários aproximados** ("~22h00", "~16h50"): o "~" é preservado na exibição.
- **Linhas opcionais** ("Opcional: prédio de Holly Golightly", MoMA PS1, desvio dos Caça-Fantasmas,
  Beacon's Closet): aparecem identificadas como opcionais e não contam como pendência obrigatória.
- **Alternativas dentro de uma linha** ("táxi (~25 min) ou linha F"): ambas aparecem no "como ir".
- **Lugar com dois endereços** (Ess-a-Bagel 770 e 831 Third Ave): os dois links aparecem.
- **Lugar citado em mais de uma seção** (ex.: Magnolia como comida e como locação de Sex and the City):
  as informações das duas seções aparecem juntas no detalhe.
- **Data do MJ**: confirmada como 05/11 (Q1); nenhum resquício do compromisso em 04/11 pode ficar no
  app (checklist, dia 04/11, tela Viagem).
- **Marcações antigas**: atividades do roteiro antigo deixam de existir; suas marcações não podem virar
  "feito" em atividades novas (IDs novos).
- **Sem internet**: os links do Google Maps não abrem; o app avisa que o Maps precisa de conexão e
  mostra o endereço.

## Requirements *(mandatory)*

### Functional Requirements

**Substituição**

- **FR-001**: O roteiro de Nova York (31/10 a 06/11) MUST ser substituído integralmente pelo conteúdo
  do documento; nenhuma atividade do roteiro anterior MUST permanecer.
- **FR-002**: Para cada dia, as atividades MUST seguir a tabela de horários do documento: mesma ordem,
  mesmos horários de início e fim (quando houver), mesmo programa e mesmo "como ir".
- **FR-003**: Os textos do documento (descrições, motivos, o que pedir, preço e fila, dicas de foto,
  dicas do desfile, destaques dos museus, avisos de segurança) MUST ser mantidos sem reescrita de
  conteúdo; só são permitidos ajustes de formatação para caber na tela.
- **FR-004**: As marcações feitas/puladas do roteiro anterior MUST NOT ser associadas a atividades do
  roteiro novo; o progresso de Nova York recomeça do zero.

**Compromissos e eventos**

- **FR-005**: Knicks x Nets MUST aparecer em 02/11 às 19h30, com chegada ao Madison Square Garden às
  18h50.
- **FR-006**: MJ The Musical MUST aparecer em **05/11** às 19h no Neil Simon Theatre, com chegada às
  18h30; nenhum outro espetáculo na mesma noite. O compromisso registrado para 04/11 MUST ser corrigido.
- **FR-007**: Os alertas de 31/10 (desfile de Halloween) e 01/11 (maratona e fim do horário de verão)
  MUST aparecer nos respectivos dias, com o texto do documento.

**Lugares**

- **FR-008**: Cada lugar de comida MUST exibir nível (🏆/⭐/📍), por que é icônico, por que neste
  dia/horário, o que pedir e preço e fila.
- **FR-009**: Cada loja MUST exibir estilo, faixa de preço, por que vale e bairro (quando houver).
- **FR-010**: Cada locação MUST exibir obra(s), a cena associada e a dica de foto.
- **FR-011**: Cada atração MUST indicar se tem ingresso (com horário) ou é grátis.
- **FR-012**: Todo lugar com link do Google Maps no documento MUST ter um botão "Abrir no Google Maps"
  com aquele link; quando houver dois links, os dois.
- **FR-013**: Quando um lugar do documento corresponder a um ponto do guia, o detalhe MUST mostrar
  também as fotos (com crédito) e os dados do guia; o app MUST NOT exibir fotos de outros lugares.
- **FR-014**: Os lugares do documento MUST entrar como estão, incluindo Keens Steakhouse, Grand Central
  Oyster Bar, os pedidos com camarão e peixe e a parada na Tiffany & Co.; as restrições alimentares e de
  lojas da feature 002 (e a regra automática que as aplicava) deixam de valer.

**Seções gerais**

- **FR-015**: O app MUST disponibilizar, na ordem do documento, as seções: antes de tudo (datas,
  alertas, maratona, horário de verão, museus, eventos fixados, JFK → Pod 51, ingressos a comprar,
  gratuitos, sobre as fotos), lugares de comida escolhidos (tabela, ícones cobertos, trocas), os 7
  dias, partida 07/11, "Não saia de NY sem provar", brechós e marcas extras, dicas práticas, plano B
  para chuva, conferência final e fontes consultadas.
- **FR-016**: O plano B por dia do documento MUST aparecer também no respectivo dia; o plano B geral,
  na seção de dicas.
- **FR-017**: As orientações de partida MUST aparecer no dia 07/11 (dia de locomoção) e no documento.
- **FR-018**: O checklist de ingressos MUST conter os itens da tabela "Ingressos para comprar antes"
  do documento.
- **FR-019**: As fontes consultadas MUST aparecer como links no documento do app.

**Preservação**

- **FR-020**: Orlando, Miami, guia, favoritos, roteiros do casal, marcações de Orlando/Miami, navegação
  da feature 003 e funcionamento offline MUST continuar como estão.
- **FR-021**: As regras automáticas de validação do roteiro (feature 002) MUST ser ajustadas ao
  documento: continuam valendo as estruturais (7 dias em ordem, horários sem sobreposição, compromissos
  presentes com chegada ≥ 30 min antes, identificadores únicos); as que contradizem o documento
  (janela fixa de lanche, desvio máximo de 20 min, "começa e termina no hotel" em todas as linhas,
  exigência de fonte por informação, termos proibidos de comida e lojas, Apple Store com justificativa)
  deixam de bloquear.

### Key Entities

- **Roteiro de NY v2**: título, autor e data do documento, seções gerais, 7 dias, partida, listas
  extras, fontes.
- **Linha do dia**: horário de início, horário de fim (opcional, pode ser aproximado), programa,
  "como ir", tipo (comida, atração, compras, locação, deslocamento, descanso, compromisso), opcional
  (sim/não).
- **Lugar**: nome, endereço(s), link(s) do Google Maps, ponto do guia correspondente (opcional) e
  campos por tipo — comida (refeição, nível, por que é icônico, por que neste dia/horário, o que pedir,
  preço e fila), loja (bairro, estilo, faixa de preço, por que vale), locação (obras, cena, dica de
  foto), atração (ingresso/grátis, observação).
- **Seção geral**: título e conteúdo (texto, listas e tabelas) na ordem do documento.
- **Lugar extra**: bairro, nome, por que ir (ou estilo e preço), link do Maps.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das linhas das 7 tabelas de horários do documento aparecem no app, na mesma ordem e
  com os mesmos horários.
- **SC-002**: 100% dos 28 lugares de comida exibem os cinco campos do documento (nível, por que é
  icônico, por que neste dia/horário, o que pedir, preço e fila).
- **SC-003**: 100% dos links do Google Maps do documento estão no app e abrem a busca correspondente.
- **SC-004**: 100% das seções gerais do documento estão no documento do app, na mesma ordem.
- **SC-005**: 0 atividades do roteiro anterior restantes em Nova York e 0 marcações antigas aplicadas
  a atividades novas.
- **SC-006**: O casal confirma, numa revisão lado a lado, que o app reproduz o documento sem perda de
  informação.
- **SC-007**: Orlando, Miami e as demais telas continuam passando em todos os testes automatizados
  existentes.

## Assumptions

- O documento é a **fonte de verdade**: não será feita nova pesquisa de horários ou preços; as fontes
  consultadas pelo casal aparecem como estão. Informações que o próprio documento manda conferir
  ("confiram no Maps…") ficam com esse aviso.
- O hotel continua sendo o Pod 51 (230 E 51st St) e o calendário da viagem não muda (07/11 é o dia de
  locomoção para Orlando).
- As fotos continuam vindo só do guia do app (fotos reais com crédito); para lugares sem foto no guia,
  o link do Google Maps cumpre o papel de "ver fotos", como o próprio documento propõe.
- Linhas da tabela sem horário de término ganham duração apenas para exibição quando o fim puder ser
  deduzido do início da linha seguinte; caso contrário, aparecem só com o início.
- "Não saia de NY sem provar" e "Brechós extras" são listas de consulta, sem horário e sem controle de
  Feito/Pendente.
- O formato de exibição (telas de destino, dia, detalhes e documento) é o da feature 003; esta feature
  troca o conteúdo e acrescenta os campos novos (nível, Maps, dica de foto, opcional).
