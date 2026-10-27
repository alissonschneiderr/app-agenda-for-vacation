# Feature Specification: Navegação mobile first — Início só com destinos, dia como centro da viagem

**Feature Branch**: `009-mobile-first-navigation`

**Created**: 2026-10-27

**Status**: Draft

**Decisões**:
- **Q1 = B**: "Agora", "Reservar hoje", os ingressos e a Consulta saem do app.
- **Q2 = B**: "Dicas" do dia mostra só os avisos daquele dia.
- **Q3 = A**: a barra de baixo sai.

**Input**: User description: "Preciso que você faça os seguintes ajustes no site/app de roteiro de
viagem. Mantenha todo o conteúdo existente (textos, atrações, dias, endereços) e altere apenas
estrutura, navegação e layout" — seis pontos:

1. App first / mobile first;
2. cards inteiramente clicáveis;
3. página inicial só com os destinos;
4. página da cidade só com os dias;
5. dicas, transporte, bairros, "Restaurantes e Cafés" e "Brechós e Lojas" dentro de cada dia, só
   quando houver conteúdo;
6. descritivo da atração em destaque, sem "Leia mais".

Ao terminar: listar as mudanças por página, confirmar os testes a 360 px e 402 px e sinalizar dados
pouco claros em vez de inventar.

## Contexto

A feature 008 deu ao app a estrutura e o visual do design de referência:
- **Início** com capa da viagem, "Agora", "Reservar hoje", Destinos, Destaques e Consulta;
- **Cidade** com capa, linha de tags e as abas Roteiro, Dicas, Transporte e Bairros;
- **Dia** com capa, "Sobre este dia" e as paradas;
- abas de baixo **Início**, **Dicas** e **Transporte**.

Esta feature enxuga a navegação para o uso no celular:
- o Início vira só a lista de destinos;
- a cidade vira só a lista de dias;
- o dia passa a reunir tudo o que diz respeito a ele, num menu de seções que só mostra o que tem
  conteúdo.

O conteúdo (textos, atrações, dias, endereços, fotos) não muda.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Do Início ao dia em três toques, com cards inteiros clicáveis (Priority: P1)

O casal abre o app e vê só os 3 destinos, em cards grandes, um embaixo do outro.

1. Tocar em qualquer ponto de um card abre a cidade.
2. A cidade mostra só a lista de dias, também em cards inteiros clicáveis.
3. Tocar em um dia abre o dia.

Toda tela tem um cabeçalho fixo e enxuto, com "voltar".

**Why this priority**: É a navegação principal; todo o resto depende dela.

**Independent Test**: A 360 px e a 402 px, ir do Início a um dia tocando no meio dos cards (não em
links). Conferir que não há rolagem lateral e que o "voltar" refaz o caminho.

**Acceptance Scenarios**:

1. **Given** o Início, **When** aberto, **Then** mostra só o cabeçalho e os 3 cards de cidade (Nova
   York, Orlando, Miami), sem capa da viagem, sem seções extras e sem rodapé com conteúdo.
2. **Given** um card de cidade, **When** o casal toca em qualquer ponto dele (foto, nome, datas),
   **Then** abre a página da cidade. O card tem um único link e mostra foco visível no teclado e
   feedback ao toque.
3. **Given** a página da cidade, **When** aberta, **Then**:
   - mostra o cabeçalho com "voltar" e a lista de dias em cards verticais clicáveis;
   - não tem a linha de tags/eventos;
   - não tem as abas Dicas, Transporte e Bairros.
4. **Given** qualquer tela a 360 × 780 ou a 402 × 874, **When** aberta, **Then**:
   - não há rolagem lateral;
   - todos os alvos de toque têm pelo menos 44 × 44 px;
   - o texto corrido tem pelo menos 16 px;
   - nada fica sob o entalhe nem sob a barra do sistema.

---

### User Story 2 - O dia com menu de seções só com o que existe (Priority: P1)

A página do dia traz, além das paradas, um menu de seções que fica preso no topo e rola junto. O menu
mostra só as seções com conteúdo naquele dia:

| Seção | Conteúdo |
|---|---|
| **Paradas** | os passos do dia |
| **Restaurantes e Cafés** | as opções de comida e café das regiões do dia |
| **Brechós e Lojas** | as lojas das regiões do dia |
| **Bairros** | as regiões do dia |
| **Transporte** | deslocamentos do dia, chegada/partida nos dias de viagem |
| **Dicas** | avisos e dicas que valem para o dia |

Tocar num item leva à seção.

**Why this priority**: A cidade deixa de ter Dicas, Transporte e Bairros. Sem o dia reunir esse
conteúdo, ele ficaria inacessível.

**Independent Test**: Abrir 01/11 (Nova York, bairros com comida e lojas), 09/11 (parque em Orlando,
com comida e sem lojas) e 19/11 (Miami, só roteiro sugerido). Conferir que cada menu tem só as seções
com conteúdo e que cada seção traz os itens do roteiro.

**Acceptance Scenarios**:

1. **Given** o dia 01/11, **When** aberto, **Then**:
   - o menu tem Paradas, Restaurantes e Cafés, Brechós e Lojas, Bairros, Transporte e Dicas;
   - "Restaurantes e Cafés" lista todas as opções de comida e café das regiões do dia, cada uma com
     nome, região ou endereço, descrição curta e link de mapa quando o roteiro tiver.
2. **Given** o dia 09/11, **When** aberto, **Then** o menu não tem "Brechós e Lojas", porque o
   roteiro não traz lojas nesse dia. Nenhuma seção diz "sem informações".
3. **Given** o dia 19/11 (Miami), **When** aberto, **Then** o menu só tem as seções com conteúdo (por
   exemplo, só Paradas).
4. **Given** um toque em "Brechós e Lojas", **When** o casal rola de volta, **Then** o menu continua
   preso no topo e indica a seção atual.
5. **Given** um card de restaurante ou loja, **When** o casal toca em qualquer ponto dele, **Then**
   abre o detalhe do lugar, com o mesmo conteúdo de hoje.

---

### User Story 3 - Atração com o descritivo à vista (Priority: P2)

A página de uma atração mostra, nesta ordem:
1. o título;
2. o descritivo completo do roteiro, sem "Leia mais";
3. as informações práticas: horário, endereço, ingresso e mapa;
4. as ações.

**Why this priority**: Melhora a leitura; o uso diário passa pelo dia.

**Independent Test**: Abrir Grand Central (31/10) e Tower of Terror (09/11) e conferir que todo o
texto do roteiro está visível sem tocar em nada, antes das informações práticas.

**Acceptance Scenarios**:

1. **Given** a atração Grand Central Terminal, **When** aberta, **Then**:
   - o título vem primeiro;
   - logo abaixo vem o descritivo inteiro do roteiro, sem "Leia mais";
   - depois vêm horário, endereço, ingresso e "Abrir no mapa".
2. **Given** uma atração sem descritivo no roteiro, **When** aberta, **Then** a seção do descritivo
   não aparece vazia.

---

### Edge Cases

- **Dia de viagem entre cidades** (07/11, 18/11, 21/11): o menu tem Transporte, com os três blocos,
  e Dicas, quando houver avisos. Paradas, comida e lojas só aparecem se houver.
- **Mesma loja ou restaurante em duas regiões do dia**: aparece uma vez, na primeira região.
- **Lugar sem endereço nem mapa**: aparece com nome e descrição; nada é inventado. Fica listado no
  relatório de dados a revisar.
- **Item cuja categoria não é clara** (comida ou loja?): segue a classificação que o roteiro já dá. O
  que o roteiro não classifica fica listado no relatório de dados a revisar.
- **Endereços antigos** (`#/cidade/<cidade>/dicas`, `/transporte`, `/bairros`, `#/dicas`,
  `#/transporte`, `#/perto/...`): levam à tela equivalente (a cidade, o dia ou a seção do dia), sem
  erro.
- **Desktop**: a mesma coluna do celular, centralizada, com largura máxima.

## Requirements *(mandatory)*

### Functional Requirements

**Princípios mobile first**

- **FR-001**: Todas as telas MUST ter uma coluna, rolagem só vertical e nenhuma rolagem lateral a
  360 px e a 402 px de largura.
- **FR-002**: Alvos de toque MUST ter pelo menos 44 × 44 px. O texto corrido MUST ter pelo menos 16 px.
- **FR-003**: As telas MUST respeitar as áreas seguras do aparelho (entalhe e barra inferior).
- **FR-004**: Cada tela, exceto o Início, MUST ter um cabeçalho fixo e enxuto, com "voltar" e o título.
- **FR-005**: No desktop, o app MUST mostrar a mesma coluna do celular, centralizada e com largura
  máxima. Não há layout separado.

**Cards clicáveis**

- **FR-006**: Todos os cards MUST ser clicáveis em toda a área: destinos, dias, paradas, regiões,
  restaurantes, lojas, dicas com destino e dias de viagem. Cada card tem um único link e foco visível
  no teclado, com feedback visual ao toque.
- **FR-007**: Controles dentro do card, como o círculo de marcar uma parada, MUST continuar
  funcionando sem abrir o link. Tocar fora deles abre o card.
- **FR-008**: Os textos "Ver mais", "Ver roteiro", "Abrir dia" e semelhantes MUST sair ou virar só um
  indicador visual (›).

**Início**

- **FR-009**: O Início MUST mostrar só os cards das 3 cidades, grandes e verticais, sem as outras
  seções: capa da viagem, Agora, Reservar hoje, Destaques, Consulta e rodapé.
- **FR-009a** (Q1 = B):
  - "Agora" (o cartão do próximo passo) e "Reservar hoje" MUST sair do app.
  - Os ingressos comprados continuam como paradas nos dias deles, porque fazem parte do roteiro.
  - As telas da Consulta não ficam mais em nenhum menu, mas MUST continuar funcionando pelo endereço
    direto e offline: documento de cada cidade, guia de pontos, créditos das fotos e o liga/desliga do
    alto contraste.
  - O crédito de cada foto MUST continuar junto da foto (autor e licença), já que a lista de créditos
    sai dos menus.

**Cidade**

- **FR-010**: A página da cidade MUST mostrar só o cabeçalho, uma capa curta da cidade (foto, nome e
  datas) e a lista de dias em cards. A linha de tags e as abas Dicas, Transporte e Bairros saem.

**Dia**

- **FR-011**: A página do dia MUST ter um menu de seções preso no topo, com chips roláveis que levam
  a cada seção e indicam a seção atual. O menu mostra só as seções com conteúdo naquele dia:
  - Paradas;
  - Restaurantes e Cafés;
  - Brechós e Lojas;
  - Bairros;
  - Transporte;
  - Dicas.
- **FR-012**: "Restaurantes e Cafés" MUST listar todas as opções de comida e café das regiões do dia.
  Cada uma tem nome, região ou endereço, descrição curta e link de mapa quando houver, com o texto do
  roteiro.
- **FR-013**: "Brechós e Lojas" MUST listar todas as lojas e brechós das regiões do dia, com a mesma
  estrutura e na ordem do roteiro. Só entram lugares que o roteiro já cita.
- **FR-014**: "Bairros" MUST listar as regiões do dia em cards clicáveis, que abrem a região.
- **FR-015**: "Transporte" MUST trazer o que o roteiro diz sobre circular naquele dia:
  - saída e deslocamentos;
  - mapa do dia;
  - nos dias de viagem, os três blocos (antes de sair, a viagem, a chegada).
- **FR-016**: "Dicas" MUST trazer só os avisos daquele dia (Q2 = B). As dicas práticas da cidade
  (gorjetas, clima, metrô, o que reservar) ficam só no documento completo da cidade.
- **FR-017**: Nenhuma seção MUST aparecer vazia ou com "sem informações". Sem conteúdo, o item não
  entra no menu.

**Atração**

- **FR-018**: A página da atração MUST mostrar, nesta ordem:
  1. título;
  2. descritivo completo do roteiro, sem "Leia mais";
  3. informações práticas (horário, endereço, ingresso, mapa);
  4. ações.

**Navegação geral**

- **FR-019**: A barra de baixo (Início, Dicas, Transporte) MUST sair (Q3 = A). A navegação fica no
  cabeçalho fixo com "voltar". As telas Dicas e Transporte da viagem deixam de existir.
- **FR-020**: Endereços antigos MUST levar à tela equivalente, sem erro.
- **FR-021**: Conteúdo, funcionamento offline e marcações do casal MUST continuar como estão.

**Entrega**

- **FR-022**: A entrega MUST incluir um relatório com:
  - as mudanças por página;
  - a confirmação dos testes a 360 px e a 402 px;
  - a lista de dados a revisar: restaurantes, lojas ou dicas sem região, endereço, mapa ou categoria
    clara.

### Key Entities

- **Seção do dia**: tipo (Paradas, Restaurantes e Cafés, Brechós e Lojas, Bairros, Transporte,
  Dicas), itens e se aparece (tem conteúdo).
- **Card clicável**: destino, dia, parada, região, lugar; um único link, com indicador ›.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A 360 × 780 e a 402 × 874, 0 telas com rolagem lateral e 0 alvos de toque menores que
  44 × 44 px.
- **SC-002**: Do Início a qualquer dia: 2 toques (cidade, dia), em qualquer ponto dos cards.
- **SC-003**: 100% dos cards são clicáveis em toda a área, com um único link cada.
- **SC-004**: 0 seções vazias ou com "sem informações" nos menus dos 22 dias.
- **SC-005**: 100% das opções de comida e lojas do roteiro aparecem em "Restaurantes e Cafés" ou
  "Brechós e Lojas" do dia certo. Nenhum lugar aparece fora do roteiro.
- **SC-006**: Em 100% das atrações, o descritivo completo aparece sem toque, logo abaixo do título.
- **SC-007**: Os testes das funções que continuam (marcar, desfazer, motorista, offline, alto
  contraste) seguem passando, adaptados à nova navegação. As funções removidas (Agora, Reservar hoje,
  abas Dicas e Transporte) saem dos testes.

## Assumptions

- **Conteúdo não muda**: só estrutura, navegação e layout. Os textos continuam vindo do roteiro e do
  guia.
- **Larguras de referência**: 360 px (Galaxy S24) e 402 px (iPhone 17). A largura de 390 px usada até
  aqui continua coberta.
- **Restaurantes e lojas** são os lugares que o roteiro já classifica como comida (☕/🏆/🍰,
  "Onde comer") e como lojas ("Lojas", "Mercados"). Os mercados de Orlando entram em "Brechós e
  Lojas", como lojas citadas no roteiro.
- **Capa da cidade**: fica uma capa curta (foto, nome, datas) para identificar a cidade, porque o
  pedido diz "basicamente a lista de dias".
- **Consequências das decisões**:
  - sem "Agora", o app não abre mais no próximo passo; o casal chega ao dia de hoje por Início →
    cidade → dia;
  - sem a Consulta nos menus, o documento completo (onde ficam as dicas práticas, Q2) fica só pelo
    endereço `#/full/<cidade>/documento`;
  - o modo sol (alto contraste) fica no estado em que estiver salvo; para trocar, há o endereço
    direto.
- **"Sobre este dia"**: o resumo do dia continua no topo do dia. Avisos, deslocamentos e regiões
  passam para as seções Dicas, Transporte e Bairros do menu.
