# Feature Specification: Guia de Pontos Turísticos e Roteiros Salvos

**Feature Branch**: `001-tourist-guide-itineraries`

**Created**: 2026-10-19

**Status**: Draft

**Input**: User description: "guia de pontos turisticos e roteiros salvos"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Explorar pontos turísticos (Priority: P1)

O turista abre o app e vê os pontos turísticos da cidade em que está segundo o calendário da
viagem (Nova York, Orlando ou Miami), em lista e em mapa, podendo trocar para outra das três
cidades a qualquer momento. Ele pode filtrar
por categoria (ex.: museus, parques, monumentos, mirantes), buscar pelo nome e abrir um ponto
para ver os detalhes: descrição, fotos, endereço, horário de funcionamento, preço de entrada e
como chegar.

**Why this priority**: É o núcleo do produto. Sem o guia não há o que salvar nem com o que montar
roteiros, e sozinho ele já entrega valor a quem está decidindo o que visitar.

**Independent Test**: Abrir o app, filtrar por "museus", abrir um museu e confirmar que todas as
informações de detalhe aparecem; depois desligar a rede e reabrir o mesmo ponto.

**Acceptance Scenarios**:

1. **Given** a data atual está dentro de um trecho da viagem (ex.: 03/11, Nova York), **When** a
   tela inicial carrega, **Then** os pontos turísticos dessa cidade aparecem em lista e podem
   ser vistos no mapa.
2. **Given** o turista está vendo uma cidade, **When** seleciona outra das três cidades, **Then**
   a lista e o mapa passam a mostrar os pontos da cidade escolhida.
3. **Given** a lista de pontos, **When** o turista seleciona uma categoria, **Then** apenas os
   pontos daquela categoria são exibidos.
4. **Given** a lista de pontos, **When** o turista busca por parte do nome de um ponto, **Then**
   os pontos cujo nome contém o termo são exibidos.
5. **Given** o turista abre um ponto, **When** a tela de detalhe carrega, **Then** ela mostra
   nome, cidade, categoria, descrição, ao menos uma foto, endereço, horário de funcionamento e
   preço.
6. **Given** um ponto já visitado anteriormente no app, **When** o turista está offline e abre
   esse ponto, **Then** os detalhes são exibidos com um aviso de que pode estar desatualizado.
7. **Given** o turista está no detalhe de um ponto, **When** escolhe "como chegar", **Then** a
   localização do ponto é aberta em um app de mapas/navegação do aparelho.

---

### User Story 2 - Salvar pontos favoritos (Priority: P2)

O turista marca pontos que lhe interessam como favoritos e depois os encontra numa lista de
favoritos, que fica disponível mesmo sem internet.

**Why this priority**: É a forma mais simples de o turista "levar consigo" o que quer visitar e
garante o uso offline exigido pela constituição, antes mesmo de existir roteiro.

**Independent Test**: Favoritar três pontos, desligar a rede, abrir a lista de favoritos e
confirmar que os três aparecem com todos os detalhes.

**Acceptance Scenarios**:

1. **Given** o detalhe de um ponto, **When** o turista toca em "favoritar", **Then** o ponto passa
   a constar na lista de favoritos e o estado de favorito fica visível no ponto.
2. **Given** um ponto favoritado, **When** o turista toca em "desfavoritar", **Then** o ponto sai
   da lista de favoritos.
3. **Given** pontos favoritados, **When** o turista está offline, **Then** a lista de favoritos e
   o detalhe completo de cada favorito (incluindo ao menos uma foto) continuam disponíveis.
4. **Given** o turista favorita um ponto estando offline, **When** a conexão volta, **Then** o
   favorito continua salvo, sem perda.

---

### User Story 3 - Montar e usar roteiros (Priority: P3)

O turista cria um roteiro (ex.: "Sábado em Midtown"), opcionalmente o associa a um dia da
viagem, adiciona pontos turísticos a ele, ordena os pontos na sequência em que pretende
visitá-los e consulta o roteiro durante o passeio, inclusive sem internet. Pode ter vários
roteiros, renomeá-los e excluí-los. Ao associar um roteiro a um dia, o app indica a cidade daquele
dia e, nos dias de locomoção, deixa claro que é um dia de deslocamento entre cidades.

O app já vem com um roteiro sugerido para cada dia de passeio da viagem (todos os dias exceto os
de locomoção), que o turista pode seguir como está ou editar livremente.

**Why this priority**: Agrega mais valor que os favoritos (planejamento do dia), mas depende do
guia e é mais complexo; os favoritos já cobrem o caso mínimo de "guardar o que quero ver".

**Independent Test**: Criar um roteiro com quatro pontos, reordená-los, desligar a rede e
percorrer o roteiro abrindo cada ponto na ordem definida.

**Acceptance Scenarios**:

1. **Given** o turista está na área de roteiros, **When** cria um roteiro informando um nome,
   **Then** um roteiro vazio com esse nome passa a existir.
2. **Given** o detalhe de um ponto, **When** o turista escolhe "adicionar ao roteiro" e seleciona
   um roteiro (ou cria um novo), **Then** o ponto é incluído ao final daquele roteiro.
3. **Given** um roteiro com vários pontos, **When** o turista altera a ordem, **Then** a nova
   ordem é mantida ao reabrir o roteiro.
4. **Given** um roteiro, **When** o turista o abre, **Then** vê os pontos na ordem definida e pode
   vê-los no mapa, com indicação da sequência.
5. **Given** um roteiro, **When** o turista remove um ponto, renomeia ou exclui o roteiro,
   **Then** a mudança é aplicada; a exclusão pede confirmação antes.
6. **Given** roteiros salvos, **When** o turista está offline, **Then** pode abrir, consultar e
   editar seus roteiros e o detalhe de cada ponto neles; as edições são preservadas.
7. **Given** o turista associa um roteiro ao dia 10/11, **When** abre o roteiro, **Then** vê
   "Orlando" como cidade do dia, e os roteiros aparecem agrupados por dia da viagem.
8. **Given** o turista associa um roteiro ao dia 07/11, **When** abre o roteiro, **Then** o app
   indica "Dia de locomoção: Nova York → Orlando" e permite incluir pontos de qualquer uma das
   duas cidades.
9. **Given** um roteiro associado a um dia de Nova York, **When** o turista adiciona um ponto de
   Miami, **Then** o app avisa que o ponto é de outra cidade, mas permite a inclusão se ele
   confirmar.
10. **Given** o primeiro uso do app, **When** o turista abre a área de roteiros, **Then** encontra
    um roteiro sugerido para cada dia de passeio (31/10 a 06/11, 08/11 a 17/11, 19/11 e 20/11) e
    nenhum roteiro nos dias de locomoção.
11. **Given** um roteiro sugerido, **When** o turista o edita (reordena, remove ou adiciona
    pontos), **Then** as mudanças são mantidas como em qualquer outro roteiro, inclusive após
    atualizações do conteúdo do guia.
12. **Given** um dia de locomoção, **When** o turista quiser, **Then** pode criar um roteiro
    próprio para aquele dia.

---

### Edge Cases

- Busca ou filtro sem resultados: o app informa que nada foi encontrado e oferece limpar os
  filtros.
- Primeiro acesso já sem internet (nada em cache): o app explica que é preciso conexão uma vez
  para baixar o guia, em vez de mostrar tela vazia ou erro técnico.
- Ponto turístico removido ou fechado definitivamente depois de favoritado ou incluído em roteiro:
  ele continua visível no favorito/roteiro, marcado como indisponível, até o turista removê-lo.
- Ponto adicionado a um roteiro em que já está: o app avisa e não duplica.
- Horário de funcionamento indicando que o ponto está fechado no momento: o detalhe destaca isso.
- Fotos não baixadas enquanto offline: o detalhe mostra o texto completo e um marcador no lugar
  da foto.
- Turista nega a permissão de localização: lista e mapa continuam funcionando, apenas sem a
  posição do usuário.
- Data atual fora do período da viagem (antes de 31/10 ou depois de 21/11): o app abre na
  primeira cidade da viagem (Nova York) e o turista escolhe a cidade manualmente.
- Dia de locomoção (07/11, 18/11, 21/11): a tela inicial mostra a cidade de destino do dia,
  indicando que é dia de deslocamento; em 21/11 (último dia, saindo de Miami) mostra Miami.
- Fim do horário de verão nos EUA em 01/11/2026, durante a estadia em Nova York: o cálculo de
  "aberto agora" MUST continuar correto antes e depois da mudança.
- Armazenamento do aparelho cheio: o app avisa que não conseguiu salvar o conteúdo para uso
  offline, sem perder favoritos ou roteiros já salvos.

## Requirements *(mandatory)*

### Functional Requirements

**Guia**

- **FR-001**: O sistema MUST exibir os pontos turísticos de Nova York, Orlando e Miami em lista e
  em mapa, uma cidade por vez, permitindo ao turista trocar de cidade a qualquer momento.
- **FR-002**: O sistema MUST permitir filtrar pontos por categoria e buscar pelo nome,
  ignorando maiúsculas/minúsculas e acentos.
- **FR-003**: O detalhe de um ponto MUST conter: nome, categoria, descrição, ao menos uma foto,
  endereço, localização no mapa, horário de funcionamento, preço de entrada (ou "gratuito"),
  link para o site oficial (quando existir) e a data em que as informações foram verificadas.
- **FR-003a**: Toda foto MUST ser uma foto real com licença que permita o uso, e o app MUST
  exibir o crédito (autor e licença) de cada foto.
- **FR-003b**: O detalhe MUST recomendar confirmar horário e preço no site oficial antes da
  visita, já que podem mudar.
- **FR-004**: O sistema MUST indicar no detalhe se o ponto está aberto ou fechado no momento,
  com base no horário de funcionamento e no horário local da cidade (não no fuso do aparelho).
- **FR-005**: O sistema MUST oferecer "como chegar", abrindo a localização do ponto em um app de
  mapas/navegação disponível no aparelho.
- **FR-006**: Quando o turista consentir em compartilhar a localização, o sistema MUST mostrar
  sua posição no mapa; sem consentimento, todas as demais funções MUST continuar disponíveis.
- **FR-007**: O conteúdo do guia e a interface MUST estar em português; nomes próprios dos
  pontos e endereços MUST ser mantidos no original (ex.: "Central Park", "5th Ave").

**Favoritos**

- **FR-008**: O turista MUST poder favoritar e desfavoritar qualquer ponto, e ver todos os seus
  favoritos em uma lista.

**Roteiros**

- **FR-009**: O turista MUST poder criar, renomear e excluir roteiros; a exclusão MUST pedir
  confirmação.
- **FR-010**: O turista MUST poder adicionar pontos a um roteiro, removê-los e reordená-los; um
  mesmo ponto não pode aparecer duas vezes no mesmo roteiro.
- **FR-011**: O sistema MUST exibir os pontos de um roteiro na ordem definida, em lista e no mapa
  com a numeração da sequência.

**Offline e persistência** (Constituição, Princípio I)

- **FR-012**: Após o primeiro carregamento com conexão, a lista de pontos, a busca, os filtros e
  o texto de detalhe de todos os pontos MUST funcionar offline.
- **FR-013**: Favoritos, roteiros e o detalhe completo (incluindo ao menos uma foto) de todos os
  pontos favoritados ou em roteiros MUST estar disponíveis offline. Como o volume é pequeno, o
  app MUST baixar todo o conteúdo do guia, inclusive fotos, para uso offline na instalação.
- **FR-014**: Favoritar, desfavoritar e editar roteiros MUST funcionar offline, e as mudanças
  MUST ser preservadas sem perda ao fechar e reabrir o app e quando a conexão voltar.
- **FR-015**: O sistema MUST indicar visualmente quando está offline e quando o conteúdo exibido
  pode estar desatualizado.
- **FR-016**: O sistema MUST atualizar o conteúdo do guia automaticamente quando houver conexão,
  sem apagar favoritos ou roteiros.
- **FR-017**: Favoritos e roteiros MUST ser armazenados apenas no aparelho do turista, sem conta
  nem login, e MUST NOT ser enviados a nenhum servidor.

**Viagem e cidades**

- **FR-018**: O sistema MUST conhecer o calendário da viagem: Nova York de 31/10/2026 a
  07/11/2026, Orlando de 07/11/2026 a 18/11/2026 e Miami de 18/11/2026 a 21/11/2026, sendo
  07/11, 18/11 e 21/11 dias de locomoção.
- **FR-019**: Ao abrir o app, o sistema MUST selecionar automaticamente a cidade correspondente à
  data atual no horário local da viagem; em dias de locomoção, a cidade de destino (em 21/11,
  Miami); fora do período, Nova York.
- **FR-020**: O turista MUST poder associar um roteiro a um dia da viagem (ou deixá-lo sem dia);
  o sistema MUST exibir a cidade daquele dia e identificar os dias de locomoção com as cidades de
  origem e destino.
- **FR-021**: A lista de roteiros MUST poder ser vista agrupada por dia da viagem, em ordem
  cronológica, com os roteiros sem dia em um grupo separado.
- **FR-022**: Ao adicionar a um roteiro associado a um dia um ponto de cidade diferente da(s)
  cidade(s) daquele dia, o sistema MUST avisar e pedir confirmação.

**Conteúdo da viagem**

- **FR-023**: O app MUST vir com um roteiro sugerido para cada um dos 19 dias de passeio: 7 em
  Nova York (31/10 a 06/11), 10 em Orlando (08/11 a 17/11) e 2 em Miami (19/11 e 20/11). Dias de
  locomoção MUST NOT ter roteiro sugerido.
- **FR-024**: Os roteiros de Orlando MUST incluir um dia para cada parque: Magic Kingdom, EPCOT,
  Hollywood Studios, Animal Kingdom, Universal Studios Florida, Islands of Adventure e Epic
  Universe; os 3 dias restantes ficam com outros passeios da cidade.
- **FR-025**: Roteiros sugeridos MUST ser editáveis como qualquer roteiro, e atualizações do
  conteúdo do guia MUST NOT sobrescrever edições feitas pelo turista.
- **FR-026**: Todo ponto que aparece em um roteiro sugerido MUST existir no guia com o detalhe
  completo exigido pelo FR-003.

### Key Entities

- **Cidade**: Nova York, Orlando ou Miami. Atributos: nome, fuso horário local.
- **Trecho da Viagem**: período em uma cidade. Atributos: cidade, data de chegada, data de saída.
  Os dias de chegada/saída que coincidem entre trechos (e o último dia) são dias de locomoção.
- **Ponto Turístico**: lugar visitável de uma cidade. Atributos: cidade, nome, categoria,
  descrição, fotos,
  endereço, localização geográfica, horário de funcionamento por dia da semana, preço, situação
  (ativo, fechado temporariamente, indisponível).
- **Categoria**: agrupamento de pontos (ex.: museu, parque, monumento, mirante). Um ponto
  pertence a uma categoria.
- **Favorito**: marcação de um ponto pelo turista, com data em que foi salvo.
- **Roteiro**: lista nomeada e ordenada de pontos criada pelo turista. Atributos: nome, dia da
  viagem (opcional), origem (sugerido pelo app ou criado pelo turista), data de criação, data da
  última alteração, sequência de pontos.
- **Crédito de Foto**: autor, licença e link de origem de cada foto de um ponto.
- **Item de Roteiro**: a presença de um ponto em um roteiro, com sua posição na sequência.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um turista de primeira viagem encontra um ponto específico e abre seu detalhe em
  menos de 30 segundos.
- **SC-002**: Um turista cria um roteiro com 5 pontos em menos de 3 minutos.
- **SC-003**: 100% dos favoritos e roteiros, e o detalhe dos pontos neles, abrem sem conexão
  após terem sido salvos com conexão.
- **SC-004**: Nenhum favorito ou edição de roteiro feita offline é perdida ao voltar a conexão
  (0 perdas nos testes de reconexão).
- **SC-005**: Com conteúdo já salvo, a lista de pontos e o detalhe de um ponto aparecem em menos
  de 2 segundos, com ou sem conexão, em um celular intermediário.
- **SC-006**: 90% dos turistas em teste de usabilidade conseguem montar e consultar um roteiro na
  primeira tentativa, sem ajuda.
- **SC-007**: As três user stories e todo o conteúdo (pontos, fotos e os 19 roteiros sugeridos)
  estão disponíveis e instalados no aparelho até 30/10/2026, véspera do embarque.
- **SC-008**: 100% dos pontos têm ao menos uma foto com crédito, endereço, horário, preço e data
  de verificação preenchidos.

## Assumptions

- Prazo: tudo (P1, P2 e P3 e o conteúdo) precisa estar pronto antes do embarque em 31/10/2026.
  As prioridades indicam a ordem de construção, não um corte de escopo.
- O conteúdo (textos em português, horários, preços, endereços e os roteiros sugeridos) é
  produzido pelo Claude com pesquisa em fontes públicas e revisado pelo usuário; as fotos são
  fotos reais de bancos com licença livre (ex.: Wikimedia Commons), com crédito.
- Horários e preços são uma referência com data de verificação; o turista confirma no site
  oficial. Atualizar o conteúdo durante a viagem não é obrigatório.
- Cada parque temático é um único ponto turístico; atrações individuais dentro dos parques, filas
  e reservas de atrações estão fora do escopo (os destaques aparecem na descrição do parque).
- A hospedagem em cada cidade não é conhecida; os roteiros sugeridos agrupam pontos próximos entre
  si, sem partir de um endereço de hospedagem.
- Ingressos dos parques já são responsabilidade do turista; o app não vende nem armazena
  ingressos.
- O volume é de cerca de 100 a 150 pontos somando as três cidades, o que permite manter todo o
  conteúdo (incluindo fotos) disponível offline.
- O calendário da viagem (cidades e datas) é fixo nesta versão; editar ou cadastrar outras
  viagens está fora do escopo. As três cidades estão no mesmo fuso (horário do leste dos EUA).
- Nos dias de locomoção, transporte entre cidades (voos, trens, carro) não é tratado por esta
  feature.
- Mapa offline completo da cidade está fora do escopo: offline, a lista, os detalhes e a ordem do
  roteiro funcionam, e o mapa mostra apenas as áreas já carregadas.
- Navegação passo a passo, otimização automática de rota, compartilhamento de roteiros,
  avaliações e comentários de usuários estão fora do escopo.
- Preço é informado como texto simples (ex.: "R$ 30 / meia R$ 15 / gratuito às terças"), sem
  compra de ingressos.
- O app é uma PWA mobile-first, conforme as Restrições de Plataforma da constituição.
- Como favoritos e roteiros ficam só no aparelho, trocar de aparelho, usar outro navegador ou
  limpar os dados do navegador faz perdê-los; sincronização, backup e compartilhamento de
  roteiros entre pessoas estão fora do escopo desta versão.
- Não há conta de usuário nem coleta de dados pessoais; a localização, quando autorizada, é usada
  apenas no próprio aparelho para mostrar a posição no mapa.
