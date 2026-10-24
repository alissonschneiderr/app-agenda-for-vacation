# Feature Specification: Redesign da UI como guia de viagem

**Feature Branch**: `003-travel-guide-redesign`

**Created**: 2026-10-21

**Status**: Draft

**Input**: User description: "Prompt — Redesign da UI do App de Viagem" (texto completo no histórico do `/speckit-specify`; requisitos incorporados abaixo).

## Contexto: o que já existe

O app já existe (features 001 e 002) e esta feature **não cria outro projeto nem troca tecnologia,
arquitetura ou fonte de dados**. Hoje ele tem:

- **Guia** por cidade (Nova York, Orlando, Miami): 78 pontos com foto real e crédito, lista/mapa,
  filtro, busca e detalhe do ponto; **Favoritos**; **Roteiros** criados pelo casal.
- **Nova York**: roteiro FULL hora a hora de 31/10 a 06/11 (207 atividades com horário, duração,
  endereço, prioridade, refeições, lojas, locais de séries, deslocamentos, fontes), marcação
  feita/pulada, próxima atividade, documento imprimível.
- **Orlando e Miami**: 12 roteiros sugeridos simples, um por dia de passeio, com a lista ordenada de
  pontos do guia, **sem horários**; o casal pode editá-los.
- Dias de locomoção (07/11, 18/11, 21/11) sem roteiro.
- Tudo funciona offline; favoritos, roteiros e marcações ficam só no aparelho.

O redesign reorganiza essa experiência em torno dos **três destinos e dos dias da viagem**, com
estética de guia de viagem editorial, e estende a marcação de "feito" a todas as atividades das três
cidades.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Navegar pelos destinos e pelos dias (Priority: P1)

O casal abre o app e escolhe Nova York, Orlando ou Miami. Cada destino tem uma página própria com
foto de destaque, nome, período da visita, resumo do roteiro, progresso e a lista de dias. Dentro do
destino, o casal pula de um dia para outro sem voltar à tela inicial e vê, em cada dia, as
atividades em ordem (timeline com horários quando houver).

**Why this priority**: É a estrutura central pedida: o roteiro organizado por destino e por dia.
Sem ela, as outras histórias não têm onde morar.

**Independent Test**: Abrir cada um dos três destinos, conferir foto, período e lista de dias;
abrir um dia de Nova York (com horários) e um de Orlando (sem horários) e navegar para o dia seguinte
sem voltar à tela inicial.

**Acceptance Scenarios**:

1. **Given** o app aberto, **When** o casal escolhe um destino na navegação principal, **Then** vê a
   página do destino com foto de destaque, nome, período da visita (ex.: "31/10 a 06/11"), resumo
   do roteiro (dias, atividades, compromissos) e progresso.
2. **Given** a página de um destino, **When** o casal escolhe um dia, **Then** vê a seção do dia
   com data, dia da semana, posição no período (ex.: "Dia 3 de 7") e as atividades em ordem.
3. **Given** um dia de Nova York, **When** exibido, **Then** as atividades aparecem numa timeline
   vertical com horário de início, duração, nome, foto (quando houver), local/endereço e categoria.
4. **Given** um dia de Orlando ou Miami, **When** exibido, **Then** as atividades aparecem na ordem
   do roteiro, sem horários inventados.
5. **Given** um dia qualquer, **When** o casal usa a navegação de dias, **Then** vai para o dia
   anterior ou seguinte (inclusive de outro destino, na virada de cidade) sem voltar à tela inicial.
6. **Given** um dia de locomoção, **When** exibido, **Then** aparece identificado como deslocamento
   entre cidades, sem atividades inventadas.
7. **Given** a data atual dentro da viagem, **When** o casal abre o app, **Then** há acesso direto
   ao dia de hoje e à próxima atividade.

---

### User Story 2 - Marcar atividades como feitas e acompanhar o progresso (Priority: P1)

Na lista do dia, cada atividade tem um controle explícito Feito/Pendente. Ao tocar, o estado muda na
hora, com indicação visual que não depende só de cor, e o progresso do dia, da cidade e da viagem se
atualiza. As concluídas continuam visíveis.

**Why this priority**: O casal marcou como essencial; é o que torna o app útil durante a viagem.

**Independent Test**: Marcar duas atividades de Orlando como feitas na lista do dia, conferir os
contadores do dia, de Orlando e da viagem; fechar e reabrir o app (inclusive offline) e conferir
que tudo continua marcado; desmarcar uma e ver os contadores voltarem.

**Acceptance Scenarios**:

1. **Given** uma atividade pendente na lista do dia, **When** o casal toca no controle, **Then** ela
   passa a "Feito" imediatamente, com ícone de check e texto/estado acessível, e continua na lista.
2. **Given** uma atividade feita, **When** o casal toca de novo, **Then** ela volta a "Pendente".
3. **Given** qualquer marcação, **When** feita, **Then** os progressos do dia, da cidade e da viagem
   refletem os estados reais (feitas / total) imediatamente.
4. **Given** atividades marcadas, **When** o casal navega entre dias e destinos, fecha e reabre o app
   ou fica offline, **Then** as marcações permanecem.
5. **Given** as marcações feitas antes do redesign no roteiro FULL de Nova York, **When** o app é
   atualizado, **Then** elas continuam valendo.
6. **Given** atividades de Orlando e Miami (vindas dos roteiros sugeridos ou criados pelo casal),
   **When** exibidas, **Then** também podem ser marcadas como feitas.

---

### User Story 3 - Ver os detalhes de uma atividade (Priority: P2)

Ao tocar numa atividade, o casal abre uma visualização detalhada, em blocos: fotos, descrição, por
que está no roteiro, informações importantes (ingressos, reservas, horários, regras, restrições),
logística (endereço, como chegar, deslocamento até a próxima), tempo previsto e observações. Seções
sem conteúdo não aparecem. Dali também é possível marcar como feita.

**Why this priority**: Necessário para consultar tudo durante a viagem, mas a lista do dia (US1/US2)
já cobre o uso rápido.

**Independent Test**: Abrir uma atividade de Nova York com refeição (deve mostrar "o que pedir" e
"por que vale a pena"), uma atração do guia (deve mostrar fotos com crédito) e uma atividade sem
dados de ingresso (o bloco de ingressos não aparece).

**Acceptance Scenarios**:

1. **Given** uma atividade que corresponde a um ponto do guia com fotos, **When** aberta, **Then**
   mostra as fotos com proporção consistente e crédito.
2. **Given** uma atividade com descrição, motivo (ex.: "por que vale a pena"), ingressos, fontes e
   horário de funcionamento, **When** aberta, **Then** cada informação aparece no bloco correspondente.
3. **Given** uma atividade com deslocamento planejado até a próxima, **When** aberta, **Then** o
   bloco de logística mostra o meio, o tempo e o destino seguinte, além do endereço e do "como chegar".
4. **Given** uma atividade sem algum dado (ex.: sem foto, sem ingresso), **When** aberta, **Then** a
   seção correspondente não aparece (ou aparece um estado vazio discreto), sem informação inventada.
5. **Given** a visualização de detalhes, **When** o casal marca como feita e volta, **Then** a lista
   do dia mostra o novo estado.

---

### User Story 4 - Guia visual premium no celular e no desktop (Priority: P2)

A interface tem aparência de guia de viagem editorial: fotos grandes e relevantes, tipografia
elegante, hierarquia clara entre destino, dia e atividade, paleta sóbria e microinterações
discretas. No celular, o essencial (próxima atividade, horário, endereço, marcar feito) fica a um
toque; no desktop, o espaço é aproveitado (ex.: dias e atividade lado a lado).

**Why this priority**: Requisito explícito de experiência, mas a função (US1–US3) vem antes.

**Independent Test**: Usar o app em largura de celular (≈ 390 px) e de desktop (≥ 1280 px): sem
rolagem horizontal, controles com área de toque ≥ 44 px, textos legíveis, e o desktop exibindo mais
de uma coluna.

**Acceptance Scenarios**:

1. **Given** um celular, **When** o casal usa qualquer tela, **Then** não há rolagem horizontal,
   tabelas largas ou controles menores que 44 × 44 px.
2. **Given** um desktop, **When** o casal abre um destino, **Then** a navegação de dias e o conteúdo
   do dia aparecem lado a lado.
3. **Given** qualquer tela, **When** exibida em modo claro ou escuro do sistema, **Then** o contraste
   do texto atende ao nível AA.
4. **Given** o sistema com "reduzir movimento" ativado, **When** o casal marca atividades ou navega,
   **Then** as animações são suprimidas.

---

### Edge Cases

- **Destino sem roteiro em um dia** (dia de locomoção ou dia sem roteiro sugerido): o dia aparece
  como "Dia de locomoção" ou "Sem atividades planejadas", com atalho para o guia da cidade.
- **Dia com vários roteiros** (ex.: sugerido + criado pelo casal na mesma data): todos aparecem na
  seção do dia, cada um como um grupo, na ordem em que existem; o progresso soma todos.
- **Ponto removido do guia** que está num roteiro: a atividade aparece com o nome salvo e o selo
  "indisponível"; continua marcável.
- **Atividade de Nova York marcada como "pulada"** antes do redesign: continua aparecendo como pulada
  (não conta como feita) e pode ser trocada para Feito ou Pendente.
- **Mesmo ponto em dois roteiros**: cada ocorrência tem sua própria marcação (fazer a Magic Kingdom
  em um dia não marca outro dia).
- **Deslocamentos do roteiro FULL**: aparecem entre as atividades, mas não contam no progresso.
- **Atividade sem foto**: mostra a categoria com ícone, sem imagem genérica ou aleatória.
- **Primeiro acesso offline sem conteúdo**: mantém a mensagem atual de conectar uma vez.
- **Armazenamento cheio ao marcar**: a marcação não muda e aparece o aviso atual de armazenamento.

## Requirements *(mandatory)*

### Functional Requirements

**Navegação**

- **FR-001**: A navegação principal MUST dar acesso direto aos três destinos (Nova York, Orlando,
  Miami) em qualquer tela, além do acesso ao guia/busca, aos favoritos e aos roteiros do casal que
  já existem.
- **FR-002**: Cada destino MUST ter uma página própria com: foto de destaque do próprio destino,
  nome, período da visita calculado do calendário da viagem, resumo (nº de dias, nº de atividades,
  compromissos com ingresso, se houver), progresso da cidade e a lista dos dias.
- **FR-003**: A navegação entre dias MUST permitir ir ao dia anterior/seguinte e escolher qualquer
  dia do destino sem voltar à tela inicial, atravessando para o destino seguinte na virada de cidade.
- **FR-004**: Quando a data atual (fuso de Nova York) estiver dentro da viagem, MUST haver acesso
  direto ao dia de hoje e destaque da próxima atividade pendente.

**Roteiro por dia**

- **FR-005**: Cada dia MUST aparecer como seção própria com data, dia da semana, posição no período
  ("Dia N de M") e cidade, ou "Dia de locomoção X → Y".
- **FR-006**: As atividades de cada dia MUST aparecer na ordem do roteiro; quando houver horários,
  numa timeline vertical com horário de início e duração destacados; sem horários, em lista ordenada
  sem horários inventados.
- **FR-007**: Cada atividade na lista MUST mostrar, quando a informação existir: nome, foto (do ponto
  do guia correspondente), horário e duração, local/endereço, categoria (atração, restaurante,
  compras, série/filme, transporte, entretenimento/compromisso, descanso/hotel), status Feito/
  Pendente com controle de alternância e acesso aos detalhes.
- **FR-008**: Atividades do mesmo período ou região MAY ser agrupadas visualmente (ex.: manhã,
  tarde, noite), sem mudar a ordem nem a estrutura do roteiro.
- **FR-009**: Deslocamentos MUST aparecer de forma compacta entre as atividades que ligam, e MUST
  NOT ter controle de conclusão nem contar no progresso.

**Detalhes**

- **FR-010**: Cada atividade MUST ter uma visualização detalhada com blocos: fotos, descrição,
  "por que está no roteiro", informações importantes (ingressos/reservas, horários de funcionamento,
  regras, recomendações, restrições, fontes), logística (endereço, como chegar, deslocamento até a
  próxima atividade), tempo previsto e observações do planejamento.
- **FR-011**: Blocos sem conteúdo MUST ser omitidos; o app MUST NOT exibir dados inventados para
  preencher campos vazios.
- **FR-012**: A visualização detalhada MUST ter o mesmo controle Feito/Pendente da lista.

**Conclusão e progresso**

- **FR-013**: Toda atividade das três cidades (exceto deslocamentos) MUST ter um controle explícito
  que alterna entre "Feito" e "Pendente", atualizando a interface imediatamente.
- **FR-014**: O estado "Feito" MUST ser identificável sem depender só de cor (ícone de check e texto
  ou rótulo acessível que anuncie o estado).
- **FR-015**: Atividades feitas MUST continuar visíveis na lista.
- **FR-016**: O app MUST mostrar progresso da viagem, de cada cidade e de cada dia, como "feitas /
  total" e barra de progresso, calculados dos estados reais.
- **FR-017**: Os estados MUST persistir no mecanismo de armazenamento já usado pelo app (no aparelho,
  offline, sem perda ao fechar e reabrir), preservando as marcações já existentes do roteiro FULL.
- **FR-018**: A marcação "pulada" existente no roteiro FULL MUST ser preservada: atividades puladas
  aparecem como tal, não contam como feitas, e podem ser trocadas para Feito ou Pendente.

**Visual e responsividade**

- **FR-019**: A interface MUST seguir uma direção editorial: fotos grandes e relevantes (somente
  fotos reais dos pontos do guia), tipografia legível com hierarquia clara, paleta neutra com uma cor
  de destaque, bordas e sombras sutis, sem gradientes chamativos nem cards aninhados em excesso.
- **FR-020**: Em celular, MUST NOT haver rolagem horizontal, e todos os controles MUST ter área de
  toque ≥ 44 × 44 px; em desktop (≥ 1024 px), a página do destino MUST usar mais de uma coluna.
- **FR-021**: Texto e controles MUST atender contraste AA em modo claro e escuro; animações MUST ser
  curtas (≤ 200 ms) e desativadas quando o sistema pede movimento reduzido.
- **FR-022**: A interface MUST NOT ter botões ou controles decorativos sem comportamento.

**Preservação**

- **FR-023**: Todas as funcionalidades existentes MUST continuar disponíveis: guia por cidade com
  lista/mapa, filtro e busca; detalhe do ponto; favoritos; roteiros do casal (criar, editar, ordenar,
  excluir); roteiro FULL com próxima atividade; documento imprimível; créditos; funcionamento offline.
- **FR-024**: Os dados existentes (conteúdo, favoritos, roteiros, marcações) MUST ser preservados;
  nenhum conteúdo real MUST ser substituído por dados de demonstração.
- **FR-025**: Os links e rotas existentes MUST continuar abrindo a tela correspondente (ou
  redirecionar para a nova equivalente).

### Key Entities

- **Destino**: cidade da viagem; nome, período (do calendário da viagem), foto de destaque (foto real
  de um ponto representativo do guia), dias.
- **Dia da viagem**: data, dia da semana, posição no período, cidade ou locomoção; contém zero ou mais
  grupos de atividades (roteiro FULL ou roteiros do casal/sugeridos daquela data).
- **Atividade exibida**: visão unificada de uma atividade do roteiro FULL ou de um item de roteiro
  do casal: nome, categoria, horário/duração (se houver), local, foto (se houver ponto do guia),
  detalhes disponíveis, estado.
- **Estado de conclusão**: Pendente, Feito (ou Pulada, herdado do roteiro FULL), por atividade
  exibida, com data/hora da marcação; guardado no aparelho.
- **Progresso**: feitas / total por dia, cidade e viagem, derivado dos estados.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Do app aberto, o casal chega ao dia de hoje de qualquer destino em no máximo 2 toques,
  e entre dois dias quaisquer do mesmo destino em no máximo 2 toques.
- **SC-002**: Marcar ou desmarcar uma atividade leva 1 toque na lista do dia e a mudança aparece em
  menos de 100 ms.
- **SC-003**: Os contadores de progresso (dia, cidade, viagem) batem 100% com o número de atividades
  marcadas em testes automatizados de marcação e desmarcação.
- **SC-004**: 100% das marcações sobrevivem a fechar/reabrir o app e a navegar entre destinos, com e
  sem internet; 100% das marcações anteriores do roteiro FULL continuam valendo.
- **SC-005**: 0 casos de rolagem horizontal e 0 controles com área de toque < 44 px em largura de
  390 px; layout de múltiplas colunas em ≥ 1024 px.
- **SC-006**: 0 imagens que não sejam fotos dos pontos do guia; 0 campos com informação inventada.
- **SC-007**: Todos os testes automatizados existentes das features 001 e 002 (ajustados apenas a
  seletores e textos de interface) continuam passando.
- **SC-008**: Contraste AA em 100% dos textos nas telas novas (modo claro e escuro).

## Assumptions

- **Fotos de destaque dos destinos** vêm das fotos reais já existentes no guia (ex.: Central Park ou
  Times Square para Nova York, Magic Kingdom para Orlando, South Beach para Miami), com crédito; não
  serão baixadas imagens novas sem relação com o roteiro.
- **Fotos das atividades** existem só quando a atividade corresponde a um ponto do guia (todas as de
  Orlando e Miami; parte das de Nova York). Restaurantes, lojas e locais de séries de Nova York sem
  ponto no guia aparecem com o ícone da categoria.
- **Orlando e Miami** continuam com os roteiros simples (sem horários, sem "por que" além da
  descrição do ponto e das notas do dia); um roteiro FULL dessas cidades está fora do escopo.
- **Marcação em Orlando e Miami**: cada item de roteiro (sugerido ou do casal) ganha sua própria
  marcação; editar o roteiro (remover o item) remove a marcação daquele item.
- **Controle principal** é Feito/Pendente; a opção "pular" do roteiro FULL continua disponível nos
  detalhes, para não perder funcionalidade.
- **Agrupamento** por período do dia (manhã / tarde / noite) é usado só quando há horários.
- **Tipografia**: fontes do sistema ou empacotadas no app (precisam funcionar offline); nenhuma
  dependência de serviço externo de fontes.
- **Escopo técnico**: mesma PWA, mesma fonte de dados e mesmo armazenamento; mudanças de formato de
  dados só para guardar as novas marcações, com migração sem perda.
