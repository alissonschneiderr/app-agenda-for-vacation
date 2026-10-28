# Feature Specification: Rota entre duas atrações do roteiro

**Feature Branch**: `016-route-between-attractions` (trabalho na `main`, a pedido do usuário)

**Created**: 2026-10-28

**Status**: Draft

**Decisões** (usuário: "Q1: C; Q2: B"):
- **Q1 = C**: a lista mostra os lugares do mesmo dia; "Ver outros dias" mostra os dos outros dias da
  cidade, um toque a mais.
- **Q2 = B**: restaurantes, lojas e curiosidades também têm o botão e também entram na lista, como
  origem e como destino.

**Input**: User description: "adicione uma feature para o usuário poder selecionar duas atrações do roteiro e traçar uma rota
entre elas, voce pode adicionar ao lado do Ver no Mapa, porém o usuário ai escolhe a outra atração do roteiro e
redireciona para a rota do Google Maps"

## Contexto

Hoje a página de uma atração (ao tocar numa parada do dia) tem os botões "Ver fotos", "Abrir no mapa" e
"Motorista". "Abrir no mapa" mostra só o lugar. Para saber como ir de uma atração a outra, o casal precisa
abrir o Google Maps e digitar os dois lugares.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Rota da atração atual até outra do roteiro (Priority: P1)

Na página de uma atração, ao lado de "Abrir no mapa", há o botão "Rota até…". O casal toca nele, vê a
lista das outras atrações do roteiro e escolhe uma. O Google Maps abre com a rota já traçada: da
atração atual até a escolhida.

**Why this priority**: É o pedido inteiro.

**Independent Test**: Abrir a atração "Mott Street" (01/11), tocar em "Rota até…", escolher outra
atração do dia e conferir que o Google Maps abre com origem Mott Street e destino a escolhida.

**Acceptance Scenarios**:

1. **Given** a página de uma atração com local conhecido, **When** o casal a abre, **Then** o botão
   "Rota até…" aparece ao lado de "Abrir no mapa".
2. **Given** o casal tocou em "Rota até…", **When** a lista abre, **Then** ela mostra as outras
   atrações do mesmo dia (Q1 = C), cada uma com o nome e o horário do roteiro, sem a atração atual.
   Restaurantes, lojas e curiosidades do dia vêm em seguida, agrupados (Q2 = B).
6. **Given** a lista aberta, **When** o casal toca em "Ver outros dias", **Then** aparecem os lugares
   dos outros dias da mesma cidade, agrupados por dia (data DD/MM), em ordem do roteiro.
3. **Given** a lista aberta, **When** o casal escolhe uma atração, **Then** o Google Maps abre com a
   rota da atração atual (origem) até a escolhida (destino).
4. **Given** a lista aberta, **When** o casal desiste (fechar ou voltar), **Then** a lista fecha e
   nada abre.
5. **Given** a lista aberta, **When** o casal quer o caminho inverso, **Then** um botão "Inverter"
   troca origem e destino antes de abrir a rota.

---

### User Story 2 - Rota também a partir de restaurantes, lojas e curiosidades (Priority: P2)

Os cards de restaurantes, lojas e curiosidades (que têm "Abrir no mapa") também têm "Rota até…", e
esses lugares também entram na lista como destino (Q2 = B).

**Why this priority**: Amplia o uso (ex.: do restaurante do almoço até a próxima atração), mas o pedido
fala de atrações.

**Independent Test**: Num card de restaurante do dia 01/11, tocar em "Rota até…" e escolher uma
atração; conferir a rota no Google Maps.

**Acceptance Scenarios**:

1. **Given** o card de um restaurante, loja ou curiosidade com local conhecido, **When** o casal toca
   em "Rota até…", **Then** a mesma lista abre e a rota sai desse lugar até o escolhido.
2. **Given** a lista aberta a partir de uma atração, **When** o casal escolhe um restaurante, **Then**
   o Google Maps abre com a rota da atração até o restaurante.

### Edge Cases

- **Sem internet**: o botão continua visível. Ao escolher o destino, o app avisa que a rota precisa de
  internet e mostra os endereços dos dois lugares, como o "Abrir no mapa" faz hoje.
- **Atração sem local conhecido** (sem endereço nem link de mapa, ex.: "Manhã livre"): não tem o botão
  e não aparece na lista.
- **Dia com um só lugar**: a lista do dia fica vazia com a frase "Nenhum outro lugar neste dia" e o
  "Ver outros dias" aberto; se a cidade não tiver nenhum outro lugar, o botão não aparece.
- **Dia de troca de cidade** (07/11, 18/11): "Ver outros dias" mostra os dias da cidade a que o lugar
  pertence.
- **Mesmo lugar em dois passos** (ex.: entrada e saída do mesmo parque): aparece uma vez só na lista.
- **Leitor de tela**: a lista é anunciada como diálogo com título "Rota a partir de <atração>"; cada
  opção diz nome e horário.
- **Snapshot de Nova York** e conteúdo do roteiro não mudam.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A página da atração MUST ter o botão "Rota até…" ao lado de "Abrir no mapa" quando a
  atração tem local conhecido e há pelo menos outro lugar com local conhecido na cidade.
- **FR-002** (Q1 = C): "Rota até…" MUST abrir uma lista de escolha com os lugares do mesmo dia:
  primeiro as atrações, em ordem do roteiro, com nome e horário; depois restaurantes, lojas e
  curiosidades, agrupados por tipo, com o nome. Sem o lugar atual e sem repetidos.
- **FR-002a** (Q1 = C): A lista MUST ter "Ver outros dias", que mostra os lugares dos outros dias da
  mesma cidade, agrupados por dia (DD/MM), na mesma ordem.
- **FR-003**: Escolher um lugar MUST abrir a rota no Google Maps com origem no lugar atual e destino no
  escolhido, usando o mesmo local que o "Abrir no mapa" de cada um usa.
- **FR-004**: A lista MUST ter "Inverter" (troca origem e destino) e uma forma de fechar sem abrir nada.
- **FR-005**: O meio de transporte MUST ficar a cargo do Google Maps (o casal escolhe lá: a pé, metrô,
  carro).
- **FR-006**: Sem internet, escolher o destino MUST mostrar o aviso "A rota precisa de internet" com os
  endereços dos dois lugares, sem abrir página de erro.
- **FR-007**: Nada é salvo no aparelho: a escolha vale só para aquela rota.
- **FR-008**: A lista MUST funcionar a 360 × 780 e 402 × 874, com alvos de toque de pelo menos 44 px e
  sem rolagem lateral.
- **FR-009** (Q2 = B): restaurantes, lojas e curiosidades com local conhecido MUST ter o mesmo botão
  "Rota até…" ao lado de "Abrir no mapa" nos seus cards, e MUST entrar na lista como destino.

### Key Entities

- **Lugar com local**: atração, restaurante, loja ou curiosidade do roteiro com nome e endereço ou link
  de mapa — o mesmo usado em "Abrir no mapa".
- **Rota**: par origem → destino, aberto no Google Maps; não é guardado.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Da página de uma atração (ou card de um lugar) até a rota aberta no Google Maps em 2
  toques para um lugar do mesmo dia ("Rota até…" e o lugar) e 3 para outro dia.
- **SC-002**: 100% das atrações, restaurantes, lojas e curiosidades com local conhecido têm o botão
  (quando há outro lugar para escolher), e 0 lugares sem local o têm.
- **SC-003**: Em 100% das rotas abertas, origem e destino são os lugares escolhidos (conferido nos links
  de todos os lugares de um dia de cada cidade).
- **SC-004**: Sem internet, 0 páginas de erro: sempre o aviso com os endereços.

## Assumptions

- "Ver no Mapa" do pedido é o botão "Abrir no mapa" da página da atração.
- A atração atual é a origem por padrão (é onde o casal está ou de onde vai sair); "Inverter" cobre o
  caso contrário.
- Não entra "Minha localização" como origem: o pedido é entre duas atrações, e o "Abrir no mapa" já
  leva ao lugar a partir de onde o casal estiver.
- A rota abre no Google Maps (app, se instalado; senão, o site), como os outros links de mapa.
- Nenhum dado novo é inventado: o local de cada lugar vem do roteiro (endereço ou link de mapa que já
  existe).
