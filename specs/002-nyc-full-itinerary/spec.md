# Feature Specification: Roteiro FULL de Nova York

**Feature Branch**: `002-nyc-full-itinerary`

**Created**: 2026-10-20

**Status**: Draft

**Input**: User description: "PROMPT MESTRE — ROTEIRO FULL DE NOVA YORK 2026" (texto completo no histórico do `/speckit-specify`; os requisitos estão incorporados abaixo).

## Contexto

A feature 001 entregou um guia com pontos turísticos e 7 roteiros sugeridos simples para Nova York
(lista de pontos por dia). Esta feature substitui esses 7 roteiros por um **roteiro FULL
personalizado** para o casal: agenda hora a hora, com refeições, compras, locais de séries,
deslocamentos, compromissos com ingresso comprado, prioridades, alternativas e informações
práticas, pronto para ser executado durante a viagem sem nova pesquisa.

**Dados fixos da viagem** (não devem ser perguntados de novo):

- Viajantes: um casal. Período em Nova York: 31/10/2026 a 06/11/2026 (7 dias de passeio).
- Chegada: aeroporto JFK, 31/10 por volta das 6h30.
- Hotel: POD 51, 230 East 51st Street, New York, NY 10022 (Midtown East, Manhattan).
- Início preferencial dos passeios: 10h.
- Compromissos inegociáveis: Knicks x Nets no Madison Square Garden (4 Penn Plaza) em 02/11 às
  19h30; *MJ The Musical* no Neil Simon Theatre (250 West 52nd Street) em 04/11 às 19h.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Seguir a agenda do dia (Priority: P1)

Durante a viagem, o casal abre o roteiro do dia e vê, em ordem, cada atividade com horário
aproximado, endereço, duração, descrição, prioridade (essencial, importante ou opcional), como
chegar a partir da atividade anterior e o que precisa de ingresso ou reserva. Os compromissos com
ingresso comprado aparecem destacados e protegidos por margem de chegada.

**Why this priority**: É o objetivo central do pedido: um roteiro executável dia a dia sem refazer
pesquisa. Sozinho já entrega a viagem planejada.

**Independent Test**: Abrir o dia 02/11 e conferir que a agenda vai do início do dia até o jogo,
com horários sem sobreposição, deslocamento até o Madison Square Garden e chegada antes das 19h30.

**Acceptance Scenarios**:

1. **Given** o roteiro de 31/10, **When** o casal o abre, **Then** a agenda começa com o
   desembarque no JFK (imigração, bagagem), o deslocamento até o POD 51 e a guarda de malas ou
   check-in, antes das atividades da cidade.
2. **Given** qualquer dia, **When** o casal o abre, **Then** vê data, região principal, objetivo do
   dia e a sequência de atividades com horário de início, duração, endereço e prioridade.
3. **Given** o dia 02/11, **When** o casal o abre, **Then** o jogo Knicks x Nets aparece às 19h30
   como compromisso fixo, com a sugestão de chegada antecipada e o deslocamento até a arena, e
   nenhuma atividade anterior termina depois do horário de saída necessário.
4. **Given** o dia 04/11, **When** o casal o abre, **Then** *MJ The Musical* aparece às 19h como
   compromisso fixo e não há outro espetáculo naquela noite.
5. **Given** uma atividade, **When** o casal a abre, **Then** vê como chegar desde a atividade
   anterior (a pé, metrô ou outro meio), com tempo estimado.
6. **Given** o fim do dia, **When** o casal consulta o roteiro, **Then** vê a estratégia de
   retorno ao hotel.
7. **Given** o casal está offline, **When** abre qualquer dia, **Then** toda a agenda e os
   detalhes estão disponíveis.

---

### User Story 2 - Comer e comprar bem no caminho (Priority: P2)

Para cada dia, o casal encontra opções concretas de café da manhã, almoço (12h–14h), lanche
(~16h) e jantar perto do trajeto, com o que pedir e por que o lugar vale a pena, e lojas
independentes, brechós e vintage nos bairros visitados, respeitando suas restrições.

**Why this priority**: Gastronomia e compras locais são parte importante da experiência pedida,
mas dependem da agenda (US1) para ficar no lugar certo do dia.

**Independent Test**: Revisar todas as sugestões de comida dos 7 dias e verificar que nenhuma é
de frutos do mar, ostras ou steakhouse; revisar as lojas e verificar que B&H e Tiffany não
aparecem.

**Acceptance Scenarios**:

1. **Given** qualquer dia, **When** o casal consulta as refeições, **Then** há sugestão para café
   da manhã, almoço, lanche e jantar, cada uma com o prato/produto recomendado e o motivo.
2. **Given** as sugestões gastronômicas, **When** revisadas, **Then** nenhuma recomenda ostras,
   frutos do mar ou steakhouse, e cada refeição fica próxima da atividade anterior ou seguinte.
3. **Given** os dias com SoHo, NoLita ou Lower East Side, **When** o casal consulta compras,
   **Then** há brechós, lojas vintage e boutiques independentes reais, com endereço.
4. **Given** todas as sugestões de compras, **When** revisadas, **Then** B&H Photo Video e Tiffany
   & Co. não aparecem, e a Apple Store só aparece com justificativa concreta e localização
   conveniente.

---

### User Story 3 - Visitar locais de séries e filmes (Priority: P3)

Ao explorar os bairros, o casal encontra locais reais associados a séries e filmes de Nova York
(Friends, Seinfeld, Sex and the City, Todo Mundo Odeia o Chris, entre outras), sabendo o endereço,
a ligação com a obra, se é ambientação ou locação de filmagem e se dá para entrar ou só ver por
fora.

**Why this priority**: É um interesse forte do casal, mas deve se encaixar nos bairros já
visitados, sem desvios grandes.

**Independent Test**: Conferir que cada local de série tem endereço real, explicação da ligação,
indicação "ambientação" ou "locação de filmagem" e indicação "visita interna" ou "só externa".

**Acceptance Scenarios**:

1. **Given** um local de série no roteiro, **When** o casal o abre, **Then** vê obra, endereço,
   associação com a obra, tipo (ambientação ou locação de filmagem) e acesso (interno ou só
   externo).
2. **Given** *Todo Mundo Odeia o Chris*, **When** o casal consulta, **Then** o roteiro explica que
   a série é ambientada no Brooklyn da infância de Chris Rock e não apresenta como visitável em
   Nova York nenhum cenário fictício ou filmado em outro lugar.
3. **Given** os locais de séries, **When** revisados, **Then** cada um está no mesmo bairro ou
   trajeto de outras atividades do dia.

---

**Acompanhamento (US1)**: durante o dia o casal marca atividades como feitas ou puladas, e o app
destaca a próxima. Cenários adicionais:

8. **Given** uma atividade, **When** o casal a marca como feita ou pulada, **Then** a marcação
   fica visível, persiste ao fechar o app (inclusive offline) e pode ser desfeita.
9. **Given** o dia atual, **When** o casal abre o roteiro, **Then** a próxima atividade não
   marcada aparece destacada.

---

### User Story 4 - Planos B e checklist da viagem (Priority: P4)

O casal consulta alternativas para chuva, cansaço ou fechamento em cada dia, e um fechamento da
viagem com checklist de ingressos e reservas, endereços organizados por dia, orientações práticas
e justificativas para atrações que ficaram de fora.

**Why this priority**: Torna o roteiro robusto a imprevistos e facilita a preparação antes do
embarque, mas não é necessário para seguir o dia normal.

**Independent Test**: Conferir que todo dia tem ao menos uma alternativa e que o checklist lista
todos os itens marcados como "precisa de ingresso/reserva" nos 7 dias.

**Acceptance Scenarios**:

1. **Given** qualquer dia, **When** o casal consulta alternativas, **Then** há ao menos uma opção
   para chuva e uma para cansaço ou fechamento, com o que substituir.
2. **Given** o checklist de ingressos e reservas, **When** comparado às atividades, **Then** contém
   todas as que exigem compra ou reserva antecipada, com a data limite recomendada.
3. **Given** a seção de atrações não incluídas, **When** consultada, **Then** cada exclusão tem
   uma justificativa (ex.: fora de temporada, desvio grande, baixo valor para o perfil).

---

### Edge Cases

- **Chegada atrasada ou imigração longa em 31/10**: o dia tem margem e indica quais atividades
  cortar primeiro (as opcionais).
- **Halloween (31/10)**: o roteiro considera a Village Halloween Parade e os desvios de trânsito
  e metrô na região da 6th Avenue à noite.
- **Maratona de Nova York (01/11)**: o dia evita o percurso e as interdições (incluindo Central
  Park e 1st/5th Avenues) e considera multidões e mudanças no transporte.
- **Fim do horário de verão (madrugada de 01/11)**: horários do dia 01/11 em diante já no horário
  padrão.
- **Coney Island em novembro**: o parque de diversões e parte das atrações estão fora de
  temporada; se incluído, o roteiro diz o que está aberto ou justifica a exclusão.
- **Informação não confirmada**: horário, preço ou funcionamento que não puder ser confirmado em
  fonte atual aparece explicitamente como "não confirmado", nunca como fato.
- **Atividade atrasada no dia de compromisso**: o roteiro indica o horário-limite para sair rumo
  ao Madison Square Garden (02/11) e ao Neil Simon Theatre (04/11).
- **Estabelecimento fechado no dia da semana planejado**: a sugestão não é feita para um dia em
  que o local não abre.

## Requirements *(mandatory)*

### Functional Requirements

**Estrutura do roteiro**

- **FR-001**: O roteiro MUST cobrir os 7 dias de 31/10/2026 a 06/11/2026, em ordem cronológica.
- **FR-002**: Cada dia MUST ter data, região principal, objetivo do dia, sequência de atividades
  com horário aproximado de início e duração, estratégia de retorno ao hotel e alternativas.
- **FR-003**: Cada atividade MUST ter: título, tipo (atração, refeição, compras, local de série,
  deslocamento, descanso, compromisso), horário aproximado, duração estimada, endereço (quando
  houver local físico), descrição da experiência, prioridade (essencial, importante ou opcional) e
  indicação de ingresso/reserva necessário.
- **FR-004**: As atividades de um dia MUST NOT se sobrepor no tempo e MUST incluir o deslocamento
  entre locais distintos, com meio de transporte e tempo estimado.
- **FR-005**: As atividades MUST começar às 10h ou depois, exceto em 31/10 (chegada) e quando um
  horário anterior for justificado no próprio roteiro (ex.: evitar fila).
- **FR-006**: Todos os deslocamentos MUST partir do hotel POD 51 (230 East 51st Street) no início
  do dia e terminar nele, a menos que o dia diga outra coisa.

**Compromissos e datas especiais**

- **FR-007**: Os compromissos de 02/11 (Knicks x Nets, 19h30, Madison Square Garden) e 04/11
  (*MJ The Musical*, 19h, Neil Simon Theatre) MUST aparecer como compromissos fixos, com horário
  sugerido de chegada antecipada e horário-limite de saída da atividade anterior.
- **FR-008**: O dia 04/11 MUST NOT conter outro espetáculo; nenhuma atividade de 02/11 e 04/11 MUST
  terminar depois do horário-limite de saída para o compromisso.
- **FR-009**: O dia 31/10 MUST incluir desembarque, imigração e bagagem no JFK, deslocamento até o
  hotel com opções de transporte e tempos, e guarda de malas ou check-in.
- **FR-010**: O roteiro MUST considerar Halloween e a Village Halloween Parade (31/10), a Maratona
  de Nova York e o fim do horário de verão (01/11) e a sazonalidade de Coney Island, indicando os
  impactos em cada dia afetado.
- **FR-011**: Antes das atividades noturnas, o roteiro MUST indicar quando é conveniente voltar ao
  hotel para descansar.

**Gastronomia**

- **FR-012**: Cada dia MUST ter sugestões de café da manhã, almoço (entre 12h e 14h), lanche ou
  café (por volta das 16h) e jantar, cada uma com estabelecimento real, endereço, o que pedir e por
  que vale a pena.
- **FR-013**: As sugestões MUST NOT incluir ostras, frutos do mar ou steakhouses, e MUST NOT
  priorizar restaurantes caros sem justificativa nem lugares escolhidos só por viralização.
- **FR-014**: Cada refeição MUST ficar próxima do trajeto do dia (sem grandes desvios).
- **FR-015**: A seleção MUST priorizar comida típica e estabelecimentos históricos de Nova York,
  usando como referência (sem obrigação de incluir todos) Katz's, Joe's Pizza, Lombardi's, Russ &
  Daughters, Prince Street Pizza, Nathan's, Junior's, Tom's Restaurant, Sylvia's, Levain e Shake
  Shack.

**Compras**

- **FR-016**: O roteiro MUST sugerir brechós, lojas vintage, de segunda mão, boutiques
  independentes e pequenos designers reais, com endereço, com atenção especial a SoHo, NoLita e
  Lower East Side.
- **FR-017**: O roteiro MUST NOT ser centrado em grifes de luxo e MUST NOT incluir B&H Photo Video
  nem Tiffany & Co.; a Apple Store só pode aparecer com justificativa e localização conveniente.

**Séries e filmes**

- **FR-018**: O roteiro MUST integrar locais reais de séries e filmes aos bairros visitados,
  priorizando as obras listadas pelo casal (Todo Mundo Odeia o Chris, Friends, Seinfeld, Sex and
  the City, How I Met Your Mother, 30 Rock, The King of Queens, The Nanny, Gossip Girl, Mad About
  You, Law & Order, Brooklyn Nine-Nine, The Jeffersons, Taxi, Only Murders in the Building) e
  podendo incluir outras relevantes.
- **FR-019**: Cada local de série MUST informar obra, endereço real, associação com a obra, se é
  ambientação ou locação de filmagem e se a visita é interna ou só externa.
- **FR-020**: O roteiro MUST NOT apresentar cenários de estúdio, estabelecimentos fictícios ou
  locais filmados fora de Nova York como visitáveis na cidade; para *Todo Mundo Odeia o Chris*,
  MUST distinguir a ambientação (Brooklyn) das locações reais de filmagem.

**Confiabilidade e informações práticas**

- **FR-021**: Horários, preços, eventos e funcionamento MUST ser verificados em fontes atuais e
  confiáveis para as datas de 2026; cada informação desse tipo MUST indicar a fonte e a data da
  verificação, ou ser marcada como "não confirmado".
- **FR-022**: O roteiro MUST NOT inventar horários, preços, disponibilidade ou funcionamento.
- **FR-023**: Cada dia MUST ter alternativas para chuva e para cansaço ou fechamento.
- **FR-024**: O roteiro MUST terminar com: checklist de ingressos e reservas (com data limite
  recomendada), endereços organizados por dia, orientações práticas (transporte, pagamento,
  segurança, clima) e justificativas para atrações não incluídas.

**Entrega e uso no app** (Constituição, Princípio I)

- **FR-025**: O roteiro FULL MUST estar disponível de duas formas, com o mesmo conteúdo: (a) dentro
  do app, como agenda por dia; e (b) como documento completo, legível do início ao fim e imprimível
  ou exportável em PDF, com todas as seções de FR-002 a FR-024.
- **FR-025a**: Qualquer correção no conteúdo MUST aparecer igual no app e no documento (uma única
  fonte), para que as duas versões nunca divirjam.
- **FR-026**: Tudo o que estiver no app MUST funcionar offline, como o restante do guia.
- **FR-027**: Durante a viagem, o casal MUST poder marcar cada atividade como "feita" ou "pulada" e
  desfazer a marcação; horários e atividades MUST NOT ser editáveis. As marcações MUST funcionar
  offline e ficar só no aparelho, como favoritos e roteiros.
- **FR-027a**: Ao abrir o dia atual, o app MUST destacar a próxima atividade não marcada.
- **FR-028**: Os 7 roteiros sugeridos simples de Nova York da feature 001 MUST ser substituídos
  pelo roteiro FULL, sem afetar Orlando, Miami, favoritos e roteiros criados pelo casal.

### Key Entities

- **Viagem em Nova York**: período, viajantes, hotel-base (nome, endereço), aeroporto e horário de
  chegada.
- **Compromisso fixo**: evento com ingresso comprado; data, horário, local, endereço, chegada
  antecipada sugerida, horário-limite de saída.
- **Dia do roteiro**: data, região principal, objetivo, atividades em ordem, retorno ao hotel,
  alternativas (chuva, cansaço/fechamento), impactos de eventos da data.
- **Atividade**: tipo, título, horário aproximado, duração, endereço, descrição, prioridade,
  ingresso/reserva (sim/não, como, preço), deslocamento desde a anterior (meio, tempo), status da
  informação (confirmado com fonte e data, ou não confirmado). Pode referenciar um ponto do guia.
- **Sugestão gastronômica**: refeição do dia, estabelecimento, endereço, o que pedir, por que vale
  a pena, faixa de preço.
- **Loja**: nome, tipo (brechó, vintage, independente, designer local, tecnologia), endereço,
  bairro, por que visitar.
- **Local de série/filme**: obra, endereço, associação, tipo (ambientação ou locação), acesso
  (interno ou só externo).
- **Marcação de atividade**: atividade, estado (feita ou pulada), data/hora da marcação; só no
  aparelho.
- **Item do checklist**: o que comprar/reservar, para qual dia, data limite recomendada, link.
- **Atração não incluída**: nome e justificativa.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos 7 dias têm agenda completa (objetivo, atividades com horário, duração,
  endereço e prioridade, 4 refeições, retorno ao hotel e ao menos 2 alternativas).
- **SC-002**: 0 sobreposições de horário e 0 atividades sem deslocamento quando o local muda, em
  todos os dias.
- **SC-003**: Nos dias 02/11 e 04/11, a agenda prevê chegada ao local do compromisso com pelo menos
  30 minutos de antecedência.
- **SC-004**: 0 sugestões que violem restrições (ostras, frutos do mar, steakhouses, B&H, Tiffany,
  outro espetáculo em 04/11).
- **SC-005**: 100% dos horários, preços e funcionamentos citados têm fonte e data de verificação,
  ou estão marcados como "não confirmado".
- **SC-006**: 100% dos locais de séries têm endereço real, tipo (ambientação/locação) e acesso
  (interno/externo).
- **SC-007**: Nenhuma refeição ou local de série exige mais de 20 minutos de desvio do trajeto do
  dia.
- **SC-008**: O casal consegue, em menos de 10 segundos, abrir o dia atual e ver qual é a próxima
  atividade, com ou sem internet.
- **SC-010**: O documento completo contém 100% do conteúdo da agenda do app (mesmos dias,
  atividades, refeições, lojas, locais de séries, alternativas e checklist) e pode ser impresso
  ou salvo em PDF.
- **SC-009**: Na revisão do casal antes do embarque, todos os itens do checklist de ingressos e
  reservas podem ser comprados/reservados só com as informações do roteiro.

## Assumptions

- O roteiro é produzido pelo Claude com pesquisa em fontes atuais e públicas antes da viagem, e o
  app só exibe (decisão herdada da feature 001: conteúdo curado, sem geração no aparelho e sem
  serviço online); o casal revisa antes do embarque.
- O escopo desta feature é só Nova York; Orlando e Miami ficam com os roteiros simples da feature
  001 e podem ganhar versões FULL em features futuras com a mesma estrutura.
- 07/11 é dia de locomoção para Orlando (feature 001) e não faz parte do roteiro FULL.
- Os horários dos compromissos (19h30 em 02/11 e 19h em 04/11) são definitivos e não são
  revalidados.
- Ritmo: programação intensa mas realista, com caminhadas quando agregam valor; não há restrições
  de mobilidade.
- Orçamento: moderado; atrações pagas entram quando a experiência justifica.
- O casal usa metrô e ônibus com cartão por aproximação (OMNY) e táxi/aplicativo quando fizer
  sentido; preços de transporte entram como faixa.
- Horário local é o de Nova York, já considerando o fim do horário de verão em 01/11/2026.
- Os pontos do guia da feature 001 continuam existindo; atividades do roteiro FULL podem apontar
  para eles, e novos pontos (restaurantes, lojas, locais de séries) podem ser adicionados ao guia.
