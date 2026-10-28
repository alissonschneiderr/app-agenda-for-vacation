# Feature Specification: Sem contagens nem percentuais de progresso — só o check de feito/não feito

**Feature Branch**: `015-remove-progress-counts` (trabalho na `main`, a pedido do usuário)

**Created**: 2026-10-28

**Status**: Draft

**Decisão** (usuário: "Q1: B"): saem o progresso e as **contagens de coisas** ("16 paradas", "Opções
(8)", "Comer (6)", "Comer 5 · Lojas 3", "Ver todos (3)"). Ficam "7 noites", "7 dias de roteiro" e
"3 destinos", que são informação da viagem e não contagem de itens.

**Input**: User description: "remova tudo que for referente a contagem e percentual, pode manter o check de
feito/nao feito, mas remova o tracking progress de tudo"

## Contexto

Levantamento do que o app mostra hoje.

**Progresso (o "tracking")**

| Onde | O quê |
|---|---|
| Cabeçalho da cidade e do dia | anel com o percentual ("0%") |
| Card da cidade (Início) | "0 de 69 feitas" + barra |
| Card do dia (cidade) | "0/4 feitas" + barra |
| Leitor de tela | "Nova York: 0 de 69 feitas" (anel e barras) |

**Quantidades de itens (outras contagens)**

| Onde | O quê |
|---|---|
| Card do dia e capa do dia | "16 paradas" |
| Linha do tempo do dia | "Opções (8)", o atalho para os lugares do grupo |
| Página do grupo ("Por perto") | abas "Comer (6)", "Lojas (5)", "Curiosidades (2)" |
| Cards de bairro (seção "Bairros") | "Comer 5 · Lojas 3 · Locações 1" |
| Avisos do dia | "Ver todos (3)" |
| Card e capa da cidade | "7 noites", "7 dias de roteiro" |
| Início | "3 destinos" |

O check de feito/não feito de cada parada (o círculo) e o "Feito / Pular" da página da atração
continuam.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sem acompanhamento de progresso (Priority: P1)

O casal usa o app para consultar e marcar paradas, sem ver quanto falta. Não há anel com
percentual, nem barras, nem "X de Y feitas" em lugar nenhum. O check de feito/não feito continua em
cada parada.

**Why this priority**: É o pedido central.

**Independent Test**: Abrir o Início, uma cidade, um dia e uma atração. Conferir que não há
percentual, barra de progresso nem "feitas". Marcar e desmarcar uma parada.

**Acceptance Scenarios**:

1. **Given** o Início, **When** o casal o abre, **Then** os cards das cidades não têm "X de Y
   feitas" nem barra.
2. **Given** a cidade e o dia, **When** o casal os abre, **Then** o cabeçalho não tem o anel com
   percentual e os cards dos dias não têm "X/Y feitas" nem barra.
3. **Given** uma parada, **When** o casal toca no círculo, **Then** ela fica marcada como feita.
   Tocando de novo, volta a não feita. A marca continua salva como antes.
4. **Given** a página da atração, **When** o casal a abre, **Then** "Feito" e "Pular" continuam.

---

### User Story 2 - Sem as outras contagens (Priority: P2)

Os rótulos e atalhos mostram só o nome, sem a quantidade. Cada atalho continua levando ao mesmo
lugar.

**Why this priority**: Completa o pedido ("tudo que for referente a contagem"), sem tirar a duração
da viagem (Q1 = B).

**Independent Test**: Abrir o dia 01/11, a página de um grupo (SoHo), a seção "Bairros" e os avisos
de um dia. Conferir que os rótulos não têm número de itens e que "7 noites" e "7 dias de roteiro"
continuam na cidade.

**Acceptance Scenarios**:

1. **Given** o card e a capa do dia, **When** o casal os vê, **Then** não há "16 paradas". O tipo
   do dia ("a pé", "parque"…) continua.
2. **Given** a linha do tempo do dia, **When** um grupo tem lugares, **Then** o atalho mostra
   "Opções", sem "(8)", e leva ao mesmo lugar.
3. **Given** a página de um grupo, **When** o casal a abre, **Then** as abas mostram "Comer",
   "Lojas" e "Curiosidades", sem números.
4. **Given** os cards da seção "Bairros", **When** o casal os vê, **Then** não há "Comer 5 · Lojas
   3". A foto, o nome, a data e a frase do bairro continuam.
5. **Given** os avisos do dia com o atalho "Ver todos", **When** o casal os vê, **Then** o atalho
   mostra "Ver todos", sem "(3)".
6. **Given** a cidade e o Início, **When** o casal os abre, **Then** "7 noites", "7 dias de roteiro"
   e "3 destinos" continuam.

### Edge Cases

- **Marcas já feitas**: continuam salvas e aparecem marcadas no check. Só deixam de virar número ou
  percentual.
- **Leitor de tela**: nenhum "X de Y feitas" é anunciado. O check continua com o nome "Marcar …
  como feito/pendente".
- **Snapshot de Nova York** e conteúdo do roteiro não mudam.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O app MUST NOT mostrar percentual de progresso em lugar nenhum (anel do cabeçalho da
  cidade e do dia).
- **FR-002**: O app MUST NOT mostrar contagem de feitas ("X de Y feitas", "X/Y feitas") nem barra de
  progresso, nos cards da cidade e do dia ou em qualquer outra tela.
- **FR-003**: O check de feito/não feito de cada parada e o "Feito" / "Pular" da atração MUST
  continuar funcionando e salvando como hoje.
- **FR-004** (Q1 = B): As contagens de itens MUST sair. Só o número sai; o rótulo e o atalho
  ficam:
  - "N paradas" do card e da capa do dia;
  - "(N)" de "Opções (N)" na linha do tempo;
  - "(N)" das abas "Comer", "Lojas" e "Curiosidades" da página do grupo;
  - "Comer N · Lojas N · Locações N" dos cards de bairro;
  - "(N)" de "Ver todos (N)" nos avisos.
- **FR-004a** (Q1 = B): "N noites", "N dias de roteiro" e "N destinos" MUST continuar.
- **FR-005**: O que fica sem uso depois da remoção (cálculo de progresso exibido, componentes de
  anel e barra) MUST sair do app (constituição III), sem mudar o que é salvo no aparelho.
- **FR-006**: O resto do app MUST continuar como está. Os testes MUST passar a 360 × 780 e
  402 × 874.

### Key Entities

- **Marca de feito**: o check de cada parada, salvo no aparelho como hoje. Só deixa de alimentar
  números.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0 percentuais, 0 barras de progresso e 0 textos "feitas" em todas as telas.
- **SC-001a**: 0 contagens de itens nas telas: "paradas", "(N)" em atalhos e abas, e números nos
  cards de bairro. "noites", "dias de roteiro" e "destinos" continuam.
- **SC-002**: 100% das paradas marcáveis continuam com o check, e marcar ou desmarcar continua salvo
  depois de reabrir o app.
- **SC-003**: Nenhuma outra tela muda além do descrito (os testes atuais continuam passando, com só
  as expectativas de progresso e contagem ajustadas).

## Assumptions

- "Tracking progress" é o acompanhamento de quanto foi feito: percentual, barras, "X de Y feitas".
- O cabeçalho da cidade e do dia fica sem o anel, e o título usa o espaço.
- As marcas salvas no aparelho não mudam de formato.
