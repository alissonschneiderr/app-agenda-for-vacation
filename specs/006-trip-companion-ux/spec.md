# Feature Specification: Guia de bolso da viagem (nova experiência do app)

**Feature Branch**: `006-trip-companion-ux`

**Created**: 2026-10-22

**Status**: Draft

**Input**: User description: "altere o layout e experiencia do aplicativo para algo proximo a: Desenhe a
melhor experiência possível para um aplicativo de roteiro de viagem usado no celular, durante a
viagem, sem internet…" (brief completo no histórico do `/speckit-specify` da 006; o roteiro de Nova
York da feature 005 é o exemplo de formato de conteúdo).

## Contexto

Hoje o app foi construído em camadas:
- o guia de pontos turísticos (001);
- roteiros hora a hora (002 e 004);
- telas de destino e dia (003);
- o dia de Nova York por bairros (005).

O conteúdo de Nova York já tem o formato que o brief descreve: dias com tema, regiões em ordem, itens
com horário, opções sem horário, avisos, contexto e links de fotos e mapa.

O casal agora quer que o app seja, acima de tudo, um **guia de bolso calmo para usar na rua**:
- abrir e saber, em 2 segundos, o que fazer agora, o que vem depois e como chegar;
- uma mão só e letra grande;
- funcionar sem internet;
- uma experiência que se adapta ao tipo de dia.

Esta feature redesenha a navegação e as telas em torno desse uso. O conteúdo continua o mesmo
(feature 005 para Nova York).

## A experiência proposta (visão geral)

**Quatro lugares, sempre a um toque, numa barra inferior:**

| Aba | Para quê | Abre em |
|---|---|---|
| **Agora** | O que fazer agora, o que vem depois, como chegar | o dia de hoje, na cidade certa |
| **Dia** | A linha do tempo do dia, de relance | hoje; desliza para outros dias |
| **Por perto** | Opções da região atual: comer, lojas, curiosidades | a região onde o casal está |
| **Viagem** | Cidades, dias, progresso, avisos gerais, dicas | a visão geral |

**Antes da viagem** (antes de 31/10), "Agora" mostra a contagem regressiva, o primeiro dia e os
ingressos que faltam comprar.

**Depois da viagem**, "Agora" mostra o resumo do que foi feito.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - "Agora": o próximo passo em 2 segundos (Priority: P1)

O casal abre o app na rua e cai direto no dia de hoje, na cidade certa, com um cartão grande para o
próximo passo. O cartão mostra:
- o horário e o nome;
- a região;
- a foto, para reconhecer o lugar;
- como chegar a partir do passo anterior: modo, duração e instrução do roteiro;
- o aviso pontual que importa agora (ingresso com horário, fila, fecha cedo).

Abaixo do cartão, os 2–3 passos seguintes em linha. Com um toque, o casal:
- marca "Feito" ou "Pular" (com "Desfazer");
- abre "Como chegar";
- abre "Mostrar ao motorista";
- abre os detalhes.

**Why this priority**: É a promessa central do brief: saber, em 2 segundos, o que fazer agora.

**Independent Test**: Com o relógio em 01/11 às 13h30 em Nova York, abrir o app e ver, sem tocar em
nada, o cartão "Chinatown · 13h40 · Mott Street", com a instrução de deslocamento e a foto.

**Acceptance Scenarios**:

1. **Given** um dia de viagem em andamento, **When** o app é aberto, **Then** aparece a aba "Agora"
   com o próximo passo pendente do dia de hoje: horário, nome, região, foto, como chegar e aviso
   pontual, quando houver.
2. **Given** o cartão do próximo passo, **When** o casal toca em "Feito" ou "Pular", **Then** o cartão
   passa para o passo seguinte. Aparece "Desfazer" por alguns segundos, e a ação também pode ser
   desfeita depois, no próprio item.
3. **Given** um passo com endereço, **When** o casal toca em "Mostrar ao motorista", **Then** aparece
   uma tela cheia, com o nome do lugar e o endereço em letras muito grandes e alto contraste,
   legível a um braço de distância, sem nenhum outro elemento.
4. **Given** um aviso do dia inteiro (maratona fechando ruas, horário de verão, pôr do sol), **When**
   o casal abre "Agora", **Then** o aviso aparece numa faixa discreta, que se recolhe ao ser lida e
   não volta a aparecer naquele dia.
5. **Given** o próximo passo é uma pausa livre ou uma janela de compras, **When** exibido, **Then** o
   cartão oferece ir direto para "Por perto", com as opções da região.
6. **Given** um dia sem passos pendentes, **When** o casal abre "Agora", **Then** vê o fechamento do
   dia (progresso, o que ficou pulado) e a prévia de amanhã.
7. **Given** o dia atrasou em relação ao plano, **When** o casal abre "Agora" ou "Dia", **Then** o app
   não fala de atraso nem muda horários (Q1): mostra a marca "agora" na linha do tempo e o próximo
   passo pendente. O casal decide o que pular.

---

### User Story 2 - "Dia": a linha do tempo de relance (Priority: P1)

O casal vê o dia inteiro numa linha do tempo compacta:
- uma linha por passo (horário + nome);
- divisórias para cada região, com o nome e a foto pequena;
- os deslocamentos como conectores finos entre os passos;
- pausas livres como intervalos;
- a noite (evento ou jantar) destacada;
- uma marca "agora" que mostra onde o dia está.

Feitos e pulados ficam visivelmente diferentes. O progresso do dia fica no topo. Deslizar para os
lados troca de dia. Um toque num passo abre os detalhes. As opções sem horário não aparecem
misturadas na linha do tempo; cada região tem um atalho para as suas opções.

**Why this priority**: Entender o dia de relance é o segundo uso mais frequente, depois de "Agora".

**Independent Test**: Abrir 01/11 num celular de 390 px e ver os 6 bairros e os primeiros passos da
manhã na primeira tela, sem cartões de restaurante entre eles.

**Acceptance Scenarios**:

1. **Given** um dia, **When** a aba "Dia" é aberta, **Then** cada passo ocupa uma linha com horário e
   nome. Na primeira tela de um celular cabem pelo menos 8 passos.
2. **Given** um deslocamento do roteiro, **When** exibido, **Then** aparece entre os passos como
   conector, com modo, duração e instrução resumida; um toque mostra a instrução completa.
3. **Given** um dia, **When** exibido, **Then** os avisos do dia ficam no topo, e os avisos pontuais
   aparecem só como um ícone no passo a que se referem.
4. **Given** a aba "Dia", **When** o casal desliza para a esquerda ou a direita (ou toca nas setas),
   **Then** vê o dia seguinte ou o anterior, atravessando cidades. "Hoje" está sempre a um toque.
5. **Given** um dia passado, **When** aberto, **Then** mostra o que foi feito e pulado, sem marcar
   nada como "atrasado".

---

### User Story 3 - "Por perto": decidir onde comer e o que ver na região (Priority: P1)

Na hora da fome ou de uma pausa, o casal toca em "Por perto" e vê as opções da **região atual** (a do
próximo passo), em três grupos:
1. **Comer**: ☕ cafés, 🏆 clássicos, 🍰 doces;
2. **Lojas**;
3. **Curiosidades**: locações de filmes, pontos curiosos.

Cada opção é um cartão curto: nome, tipo, faixa de preço, o que pedir e quando a fila é menor. O
resto fica a um toque. Um seletor no topo troca de região (as do dia, em ordem).

**Why this priority**: O brief separa explicitamente o que fazer (linha do tempo) das opções para
escolher na hora; sem isso, as listas atrapalham a linha do tempo.

**Independent Test**: Às 13h40 de 01/11, tocar em "Por perto" e ver Chinatown com as 6 opções de comida
e o aviso "Nenhuma cafeteria no estilo La Cabra".

**Acceptance Scenarios**:

1. **Given** o dia em andamento, **When** o casal abre "Por perto", **Then** a região mostrada é a do
   próximo passo pendente, e é possível trocar para outra região do dia com um toque.
2. **Given** uma região com opções de comida, **When** exibida, **Then** um filtro de um toque mostra
   só cafés, só clássicos ou só doces.
3. **Given** uma opção, **When** tocada, **Then** abre os detalhes (texto completo, fila, preço,
   "Abrir no mapa", "Mostrar ao motorista").
4. **Given** uma curiosidade de filme ou série, **When** exibida, **Then** mostra a obra e a dica de
   onde tirar a foto.

---

### User Story 4 - Detalhes: reconhecer, chegar e, com tempo, ler a história (Priority: P2)

O detalhe de um passo ou opção mostra, nesta ordem:
1. foto ou fotos de referência no topo;
2. horário e nome;
3. aviso pontual;
4. "Como chegar": a instrução do roteiro, "Abrir no mapa" (com internet) e "Mostrar ao motorista";
5. "Feito"/"Pular";
6. e só então o contexto ("reparem em…", a história), recolhido em "Ler mais".

**Why this priority**: Atende "reconhecer pelas fotos", "como chegar" e "contexto sem atrapalhar",
mas é acessado a partir das telas P1.

**Independent Test**: Abrir "Grand Central Terminal" e ver a foto, o horário, os botões e o
contexto recolhido, tudo sem rolar.

**Acceptance Scenarios**:

1. **Given** um passo, **When** o detalhe é aberto, **Then** foto, horário, nome, aviso e os botões
   de ação ficam na primeira tela; o contexto fica recolhido em "Ler mais".
2. **Given** uma região ou um passo com horário, **When** aberto, **Then** mostra uma foto
   offline do próprio lugar, com crédito (Q2). Se não existir uma foto livre fiel do lugar, mostra um
   bloco com ícone e "Ver fotos" (que precisa de internet), sem imagem de outro lugar.
3. **Given** um evento com orientações próprias (desfile, jogo, musical), **When** aberto, **Then**
   "Onde ficar", "Como chegar", "Antecedência" e "Como sair" aparecem como blocos curtos e
   rotulados.

---

### User Story 5 - Visão geral da viagem e dias de transição (Priority: P2)

A aba "Viagem" mostra a viagem como uma linha:
- Nova York (31/10–07/11) → Orlando (07/11–18/11) → Miami (18/11–21/11);
- os dias de cada cidade como pontos, com o tipo de dia (a pé, praia, parque, viagem) e o progresso;
- um marcador "vocês estão aqui".

Na mesma aba ficam:
- os ingressos a comprar antes;
- os compromissos com ingresso comprado;
- as dicas práticas (metrô, gorjeta, imposto, clima);
- o documento completo.

Os **dias de transição** têm uma tela própria, em três blocos:
1. **Antes de sair**: check-out, último café, malas.
2. **A viagem**: horário de saída, como ir ao aeroporto ou estrada, terminal, voo.
3. **A chegada**: como chegar ao hotel, check-in, primeiro passo na cidade nova.

Cada bloco tem itens que podem ser marcados.

**Why this priority**: Importante para orientação e para os dias de mudança, mas usado poucas vezes
por dia.

**Independent Test**: Abrir "Viagem" em 03/11 e ver o marcador em Nova York, dia 4 de 8; abrir 07/11
e ver os três blocos da transição para Orlando.

**Acceptance Scenarios**:

1. **Given** a aba "Viagem", **When** aberta, **Then** mostra as 3 cidades em ordem, com datas e
   número de dias, o marcador do dia atual e o progresso por cidade e da viagem.
2. **Given** um dia de transição, **When** aberto em "Agora" ou "Dia", **Then** aparece a tela de
   transição com os três blocos, e o próximo item em destaque.
3. **Given** o casal toca num dia futuro na "Viagem", **When** o dia abre, **Then** pode ser lido como
   prévia (sem destaque de "agora"); "Voltar para hoje" fica a um toque.

---

### Edge Cases

- **Antes da viagem**: "Agora" mostra contagem regressiva, ingressos pendentes e a prévia do primeiro
  dia.
- **Depois da viagem**: "Agora" mostra o resumo da viagem.
- **Dia sem conteúdo com horário** (Orlando e Miami ainda têm só listas de pontos, sem horário):
  - "Agora" mostra a lista do dia como "o que ver hoje";
  - "Dia" mostra a lista sem horários e sem marca "agora".
- **Passo sem horário de fim**: a marca "agora" usa o início do passo seguinte.
- **Fuso horário**: "hoje" e "agora" seguem o fuso da cidade do dia, não o do celular.
- **Horário de verão (01/11)**: os horários do roteiro valem como hora local.
- **Sem internet**: tudo funciona, menos "Abrir no mapa" e "Ver fotos", que avisam e oferecem "Mostrar
  ao motorista" com o endereço.
- **Tudo marcado sem querer**: qualquer marcação pode ser desfeita; não há ação definitiva.
- **Dois passos no mesmo horário** (ex.: compras intercaladas com atrações): a ordem do roteiro
  prevalece.
- **Leitura no sol e à noite**: o tema escuro segue o sistema, e há um modo de alto contraste.

## Requirements *(mandatory)*

### Functional Requirements

**Navegação**

- **FR-001**: O app MUST ter quatro abas fixas na parte de baixo, ao alcance do polegar: "Agora", "Dia",
  "Por perto" e "Viagem".
- **FR-002**: Ao abrir, o app MUST mostrar "Agora" no dia de hoje, na cidade do dia, sem passos
  intermediários.
- **FR-003**: Qualquer informação do dia MUST estar a no máximo 2 toques a partir de "Agora" ou "Dia".
- **FR-004**: O guia de pontos turísticos MUST continuar disponível como consulta dentro de
  "Viagem". Favoritos e "Meus roteiros" MUST sair da navegação (Q3). Os pontos sugeridos de Orlando e
  Miami continuam aparecendo nos dias dessas cidades. Os dados já salvos não são apagados.

**Agora**

- **FR-005**: O cartão do próximo passo MUST mostrar:
  - horário e nome;
  - região;
  - foto (quando houver);
  - como chegar a partir do passo anterior;
  - aviso pontual (quando houver);
  - ações "Feito", "Pular", "Como chegar" e "Mostrar ao motorista".
- **FR-006**: Abaixo do cartão MUST aparecer os 2–3 passos seguintes, em uma linha cada.
- **FR-007**: "Próximo passo" = o primeiro passo pendente do dia cujo horário (ou janela) ainda não
  terminou; sem nenhum assim, o primeiro pendente.
- **FR-008**: Avisos do dia inteiro MUST aparecer numa faixa recolhível, um por vez. Um aviso já lido
  MUST NOT voltar a abrir sozinho no mesmo dia.
- **FR-009**: Quando o dia atrasa, o app MUST NOT exibir alertas de atraso nem recalcular horários
  (Q1). A marca "agora" na linha do tempo e o próximo passo pendente bastam.

**Dia**

- **FR-010**: A linha do tempo MUST mostrar:
  - uma linha por passo;
  - divisórias de região;
  - conectores de deslocamento;
  - intervalos livres;
  - o evento da noite;
  - a marca "agora" (só no dia de hoje).
- **FR-011**: Opções sem horário (comer, lojas, curiosidades) MUST NOT aparecer dentro da linha do
  tempo. Cada região MUST ter um atalho para as suas opções em "Por perto".
- **FR-012**: Deslizar para os lados MUST trocar de dia, com setas como alternativa; "Hoje" MUST estar
  sempre visível quando o dia exibido não for hoje.
- **FR-013**: A linha do tempo MUST se adaptar ao tipo de dia:
  - **a pé por regiões**: regiões e deslocamentos;
  - **praia**: blocos de manhã, tarde e pôr do sol;
  - **parque temático**: áreas do parque, com espaço para tempos de fila;
  - **transição**: três blocos (FR-019).

**Por perto**

- **FR-014**: "Por perto" MUST abrir na região do próximo passo e permitir trocar para qualquer região
  do dia com um toque.
- **FR-015**: As opções MUST vir em três grupos:
  1. Comer, com filtro ☕/🏆/🍰;
  2. Lojas;
  3. Curiosidades.

  Cada opção MUST aparecer como cartão curto: nome, tipo, preço, o que pedir ou estilo, fila.

**Detalhes**

- **FR-016**: O detalhe MUST mostrar, nesta ordem:
  1. fotos;
  2. horário e nome;
  3. aviso;
  4. como chegar;
  5. ações;
  6. orientações de evento;
  7. contexto (recolhido em "Ler mais");
  8. links.
- **FR-017**: "Mostrar ao motorista" MUST abrir uma tela cheia com nome e endereço em letras muito
  grandes, alto contraste, sem outros elementos, e voltar com um toque ou com o gesto de voltar.

**Viagem e transição**

- **FR-018**: "Viagem" MUST mostrar:
  - as cidades em ordem, com datas e dias;
  - o marcador "vocês estão aqui";
  - o progresso por cidade e total;
  - os ingressos a comprar;
  - os compromissos;
  - as dicas práticas;
  - o documento completo.
- **FR-019**: O dia de transição MUST aparecer em três blocos ("Antes de sair", "A viagem", "A
  chegada"), com itens que podem ser marcados, a partir do conteúdo disponível. Em 07/11 são a
  partida de Nova York (doc) e a chegada a Orlando.

**Marcações e progresso**

- **FR-020**: Toda marcação (feito ou pulado) MUST poder ser desfeita: por "Desfazer" logo após a ação
  e, a qualquer momento, no próprio item.
- **FR-021**: O progresso MUST aparecer no topo do dia, por cidade e da viagem. Pulados contam como
  decididos, não como feitos.

**Leitura e uso com uma mão**

- **FR-022**: Texto principal com no mínimo 17 px; horários e nomes com no mínimo 20 px. Alvos de
  toque com no mínimo 48 px. As ações principais ficam na metade de baixo da tela.
- **FR-023**: Tema claro e escuro seguindo o sistema, mais uma opção de alto contraste para o sol.
  Contraste mínimo de 7:1 no essencial: horário, nome e endereço.
- **FR-024**: Tudo MUST funcionar sem internet, exceto abrir mapas e fotos externas, que avisam e
  oferecem "Mostrar ao motorista".
- **FR-025**: As marcações feitas até agora (features 003 e 005) MUST ser preservadas.

**Fotos**

- **FR-026**: Cada região e cada passo com horário do roteiro de Nova York MUST ter uma foto offline
  do próprio lugar, de fonte livre, com autor, licença e link (Q2). A foto MUST mostrar exatamente
  aquele lugar; sem foto fiel, vale o bloco com ícone (US4, cenário 2). A lista do que ficou sem foto
  MUST ser registrada para revisão do casal.

### Key Entities

- **Viagem**: cidades em ordem, datas, progresso.
- **Dia**: data, cidade, tema, tipo (a pé, praia, parque, transição), avisos do dia, regiões em ordem.
- **Região**: nome, foto, contexto, passos com horário, opções sem horário (comer, lojas, curiosidades).
- **Passo**: horário (início e fim opcional), nome, tipo, como chegar, aviso pontual, fotos,
  contexto, orientações de evento, estado (pendente, feito, pulado).
- **Opção**: grupo (comer, lojas, curiosidades), nível (☕/🏆/🍰), preço, o que pedir ou estilo, fila,
  obra e dica de foto, links.
- **Aviso**: escopo (dia ou passo), texto, estado (lido ou não).
- **Bloco de transição**: antes de sair, a viagem, a chegada, com itens marcáveis.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em teste com o relógio no meio de um dia, uma pessoa identifica o próximo passo, o
  horário e como chegar em até 2 segundos depois de abrir o app, sem tocar em nada.
- **SC-002**: Qualquer informação de um dia é alcançada com no máximo 2 toques a partir de "Agora" ou
  "Dia" (verificado para todos os tipos de conteúdo do dia 01/11).
- **SC-003**: Num celular de 390 × 844 px, a primeira tela de "Dia" mostra pelo menos 8 passos e todas
  as regiões até a hora atual.
- **SC-004**: Em "Por perto", as opções de comida da região atual aparecem com 1 toque a partir de
  qualquer aba.
- **SC-005**: 100% das ações de marcação podem ser desfeitas.
- **SC-006**: O essencial (horário, nome, endereço) tem contraste mínimo de 7:1 nos dois temas, e todos
  os alvos de toque têm pelo menos 48 px.
- **SC-007**: Com o celular sem internet, 100% das telas e conteúdos do roteiro abrem.
- **SC-009**: Pelo menos 90% das regiões e dos passos com horário de Nova York têm foto offline do
  próprio lugar, com crédito; o restante fica listado.
- **SC-008**: Na revisão do casal, num dia simulado (manhã, deslocamento, almoço, tarde, volta ao
  hotel, noite) e num dia de transição, eles concluem as tarefas do brief sem ajuda.

## Assumptions

- **O conteúdo vem do roteiro existente.** Nova York usa o doc da feature 005. Orlando e Miami usam
  o que existe hoje (listas de pontos por dia, sem horário) até ganharem um doc no mesmo formato.
- **Tipo de cada dia.** É indicado no conteúdo (um campo por data), não deduzido. Nova York: a pé por
  regiões; 07/11, 18/11 e 21/11: transição.
- **Avisos.** "Agora", "Dia" e as faixas são avisos dentro do app, sem notificações do sistema.
- **Clima e pôr do sol.** Vêm do texto do roteiro (o doc traz os dois); não há previsão do tempo ao
  vivo.
- **"Como chegar".** Sem internet, é a instrução do roteiro (modo, duração, linha) mais "Mostrar ao
  motorista". Com internet, há também "Abrir no mapa".
- **Telas mantidas.** O documento completo, o checklist de ingressos e o guia de pontos (consulta)
  continuam, acessados por "Viagem". Favoritos e "Meus roteiros" saem da navegação, mas os dados
  ficam salvos (Q3).
- **Peso das fotos.** As ~120 fotos novas acrescentam cerca de 10–15 MB ao pacote offline, dentro
  do limite atual de 40 MB.
- **Marcação.** Continua igual (feito, pulado, desfazer); os dados salvos são compatíveis.
