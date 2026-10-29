# Feature Specification: Previsão do tempo no dia e no Início

**Feature Branch**: `017-weather-forecast` (trabalho na `main`, a pedido do usuário)

**Created**: 2026-10-29

**Status**: Draft

**Decisões** (usuário: "Q1: Hoje + 4 dias na página inicial; Q2: A"):
- **Q1**: a faixa do Início mostra **hoje e os 4 dias seguintes** (5 dias), ao pé da letra. Dia fora da
  viagem aparece com a data e "fora da viagem", sem previsão (não há cidade do roteiro para ele).
- **Q2 = A**: dia ainda fora do alcance da previsão mostra "Previsão a partir de DD/MM".

**Input**: User description: "Adicione uma feature de previsão do tempo, dentro de cada dia, mostre um box para o dia e
na página incial mostre o dia atual + 5 dias no futuro"

## Contexto

O app é offline-first. Hoje o clima aparece só como texto fixo nas dicas dos roteiros ("Clima no início
de novembro" em NY, "Clima em meados de novembro" em Orlando, "Clima no fim de novembro" em Miami). Uma
previsão de verdade vem de um serviço de meteorologia pela internet; serviços gratuitos dão previsão
para cerca de 7 a 16 dias à frente. A viagem vai de 31/10 a 21/11, e hoje é 29/10.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Previsão no dia (Priority: P1)

Na página de cada dia, um box "Tempo" mostra a previsão daquele dia na cidade do dia: ícone e descrição
(ex.: "Parcialmente nublado"), máxima e mínima em °C e a chance de chuva.

**Why this priority**: É o que ajuda a decidir roupa, guarda-chuva e a ordem das paradas.

**Independent Test**: Abrir o dia 01/11 com internet e ver o box com o tempo de Nova York para 01/11;
abrir de novo sem internet e ver a mesma previsão com "atualizada em …".

**Acceptance Scenarios**:

1. **Given** um dia da viagem dentro do alcance da previsão, **When** o casal abre o dia, **Then** o box
   mostra ícone, descrição, máxima, mínima e chance de chuva da cidade do dia.
2. **Given** um dia de troca de cidade (07/11, 18/11), **When** o casal abre o dia, **Then** o box mostra
   as duas cidades, a de saída e a de chegada.
3. **Given** a previsão já foi carregada uma vez, **When** o casal abre o dia sem internet, **Then** o
   box mostra a última previsão salva e "atualizada em DD/MM às HHhMM".
4. **Given** um dia ainda fora do alcance da previsão, **When** o casal o abre, **Then** o box mostra
   "Previsão a partir de DD/MM" (a data em que o dia entra no alcance da previsão) (Q2 = A).

---

### User Story 2 - Hoje e os próximos 4 dias no Início (Priority: P2)

No Início, acima dos cards das cidades, uma faixa mostra 5 dias: hoje e os 4 seguintes (Q1), cada um
com o dia (DD/MM), ícone, máxima e mínima. Tocar num dia da viagem abre a página daquele dia.

**Why this priority**: Visão rápida da semana, sem abrir dia por dia.

**Independent Test**: Abrir o Início em 03/11 e ver 03/11 a 07/11 com o tempo de Nova York (e o 07/11
com as duas cidades); tocar em 04/11 e cair no dia 04/11.

**Acceptance Scenarios**:

1. **Given** um dia durante a viagem, **When** o casal abre o Início, **Then** a faixa mostra hoje e os 4
   dias seguintes, cada um com o tempo da cidade do roteiro naquele dia.
2. **Given** hoje é 29/10 (antes da viagem), **When** o casal abre o Início, **Then** a faixa mostra
   29/10 e 30/10 com "fora da viagem" e 31/10, 01/11 e 02/11 com o tempo de Nova York. Em 19/11, o
   mesmo para 22/11 e 23/11, depois da viagem.
3. **Given** a faixa, **When** o casal toca num dia da viagem, **Then** abre a página daquele dia.
4. **Given** sem internet, **When** o casal abre o Início, **Then** a faixa mostra a última previsão salva
   com "atualizada em …"; sem nenhuma salva, a faixa diz "Previsão disponível com internet".

### Edge Cases

- **Nunca carregou e está sem internet**: o box e a faixa dizem "Previsão disponível com internet"; o
  resto da página funciona normalmente.
- **Previsão antiga** (salva há mais de 24 h): continua visível, com "atualizada em …" em destaque.
- **Dia que já passou**: o box não aparece (não há o que prever).
- **Serviço de previsão fora do ar**: igual a sem internet, sem página de erro.
- **Leitor de tela**: cada dia é lido como "Domingo, 01/11, Nova York: parcialmente nublado, máxima 14,
  mínima 8 graus, 20% de chance de chuva".
- **Contraste alto e telas de 360 px**: a faixa de 5 dias cabe sem rolagem lateral (ou rola só ela, na
  horizontal, com os 6 dias alcançáveis).
- **Snapshot de Nova York** e conteúdo do roteiro não mudam; as dicas de clima continuam como estão.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A página de cada dia da viagem, de hoje em diante, MUST ter o box "Tempo" com ícone,
  descrição em português, máxima e mínima em °C e chance de chuva, para a cidade do roteiro naquele
  dia.
- **FR-002**: Em dia de troca de cidade, o box MUST mostrar as duas cidades.
- **FR-003** (Q1): O Início MUST ter uma faixa com hoje e os 4 dias seguintes (5 dias), cada um com
  DD/MM, ícone, máxima e mínima; tocar num dia da viagem MUST abrir aquele dia.
- **FR-004**: A previsão MUST ser buscada quando houver internet e salva no aparelho; sem internet, o
  app MUST mostrar a última salva, com "atualizada em DD/MM às HHhMM".
- **FR-005**: Sem previsão salva e sem internet, o app MUST mostrar "Previsão disponível com internet",
  sem erro e sem travar o resto da tela.
- **FR-006**: A previsão MUST se atualizar sozinha ao abrir o app com internet, no máximo a cada 3 horas.
- **FR-007** (Q2 = A): Dia da viagem ainda fora do alcance da previsão MUST mostrar "Previsão a partir
  de DD/MM", sem número inventado nem média histórica.
- **FR-008** (Q1): Na faixa do Início, dia fora da viagem MUST aparecer com DD/MM e "fora da viagem",
  sem previsão e sem link.
- **FR-009**: O pedido ao serviço de previsão MUST levar só a localização das cidades da viagem (não a
  do aparelho) e nenhum dado do casal.
- **FR-010**: Box e faixa MUST funcionar a 360 × 780 e 402 × 874, no tema claro, escuro e de alto
  contraste.

### Key Entities

- **Previsão de um dia numa cidade**: data, cidade, condição (ícone e descrição), máxima, mínima, chance
  de chuva.
- **Previsão salva**: as previsões das três cidades e o momento em que foram buscadas.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Com internet, o box do dia e a faixa do Início aparecem preenchidos em até 3 segundos
  depois de abrir a tela.
- **SC-002**: Sem internet, 100% das telas com previsão salva mostram a previsão e a hora em que foi
  atualizada; 0 telas de erro.
- **SC-003**: Em 100% dos dias, a previsão é da cidade do roteiro daquele dia (as duas nos dias de
  troca).
- **SC-004**: A faixa do Início mostra exatamente 5 dias (hoje + 4), e cada dia da viagem nela abre o
  dia certo.

## Assumptions

- Temperaturas em °C e textos em português.
- A previsão vem de um serviço público e gratuito, sem cadastro e sem custo.
- Coordenadas das cidades são as do centro de cada uma (Manhattan, Orlando, Miami Beach), já ligadas ao
  roteiro; não há previsão por bairro.
- O box fica perto do topo do dia (depois da capa e do resumo), sem empurrar as paradas para longe.
- As dicas de clima dos roteiros continuam; o box não as substitui.
