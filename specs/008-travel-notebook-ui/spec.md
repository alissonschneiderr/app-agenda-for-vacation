# Feature Specification: Visual e estrutura de "caderno de viagem", com muitas fotos

**Feature Branch**: `008-travel-notebook-ui`

**Created**: 2026-10-27

**Status**: Draft

**Input**: User description: "A UI deve seguir esse design:
https://enter.converge.ai/project/5ad199cf4df44c96a5e40d373f7fd805?layout=chat-preview&chat_id=398dd906-28ce-4ac3-a556-02f0ae7dfc19&surface=preview;
os textos do website devem ser totalmente ignorados, somente os informados aqui devem ser
considerados; na UI informada não existem fotos das atrações, você deve seguir a instrução já
informada de adicionar bastante fotos."

**Decisão (Q1 = B)**: seguir o design no visual **e na estrutura de telas**.

## Contexto

O casal indicou um design de referência (chamado abaixo de **"o design"**). O link do editor pede
login. Por isso, o design foi estudado pelo preview público do mesmo projeto, no celular
(390 × 844), em 27/10/2026. As capturas estão em `design-reference/`.

**Do design valem o visual e a organização das telas. Os textos do design não entram no app**:
destinos (Lisboa, Coimbra), datas, preços, roteiros, dicas e frases. O conteúdo continua sendo o dos
roteiros do casal (Nova York e Orlando), do guia de pontos e dos dados da viagem que o app já tem.

### Estrutura de telas do design (adotada)

| Tela do design | No app |
|---|---|
| **Início**: capa da viagem, seção "Destinos" com um cartão por cidade e uma seção de destaques | Capa da viagem do casal; durante a viagem, o cartão "Agora" (próximo passo) logo abaixo da capa; "Destinos" com Nova York, Orlando e Miami; "Destaques" = ingressos comprados e itens a reservar |
| **Cidade**: capa da cidade, frase, tags e abas em pílula (Roteiro, Dicas, Transporte, Bairros) | Mesma estrutura, com o conteúdo da cidade vindo do roteiro e do guia |
| **Dia**: capa do dia, caixa "Sobre este dia", "Paradas do dia" em cartões marcáveis | Mesma estrutura, com os passos do roteiro, as regiões e as opções por perto |
| **Dicas** (aba de baixo): dicas por categoria, com caixas de lista | Dicas práticas dos docs do casal, por cidade e categoria |
| **Transporte** (aba de baixo): entre cidades e na cidade, em cartões com tabelas curtas | Dias de viagem entre cidades e "como circular" de cada cidade, só com o que está nos docs |
| **Barra de baixo**: Início · Dicas · Transporte | Mesma barra, com os mesmos três itens |

### Linguagem visual do design (sem os textos)

| Elemento | Como é no design |
|---|---|
| Tom geral | Fundo claro e quente (papel), texto marrom-escuro, um acento terracota |
| Tipografia | Títulos numa serifada editorial; texto corrido numa sem-serifa limpa; rótulos pequenos em caixa alta com espaçamento |
| Cartão de capa | Bloco grande com cantos bem arredondados e fundo escuro em degradê, com ícone em traço ao fundo. Mostra rótulo em caixa alta, título grande, subtítulo, chips e um quadro translúcido com anel de progresso e barra |
| Cartões de destino e de dia | Cabeçalho em degradê com rótulo, título serifado e etiqueta ("DIA 7", "3 NOITES"); corpo claro com metadados, resumo de 2 linhas, contador com barra e link "Abrir dia ›" no acento |
| Chips | Pílulas pequenas: destaques em caixa alta no acento, tipo de parada colorido, ritmo e tags neutras |
| Cabeçalho de página | Botão de voltar redondo, rótulo pequeno + título serifado e anel de progresso compacto |
| Abas internas | Barra em pílula, rolável, com ícone + rótulo |
| Seções | Título serifado com ícone num quadrado arredondado e linha de apoio |
| Paradas | Cartões empilhados: horário, nome serifado, chip de tipo, duração, resumo, círculo de marcar e seta para expandir |
| Caixas | Dica com lâmpada e borda à esquerda no acento; listas com "✓" verde; tabelas curtas de rótulo em caixa alta + valor |
| Barra de baixo | Ícones em traço + rótulos; o item ativo fica no acento, com um traço em cima |

**Fotos (pedido do casal):** o design não tem fotos. Neste app, **cada cabeçalho em degradê do
design mostra a foto real do lugar**, com um véu escuro para manter a leitura. Cada parada tem
miniatura com foto. Valem as fotos offline das features 001, 006 e 007, só do próprio lugar e com
crédito.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Dia com capa, "Sobre este dia" e paradas com fotos (Priority: P1)

O casal abre um dia e vê a tela do dia do design:
- capa com a foto do lugar, a data, "DIA n", o título, chips (tipo de dia, número de paradas) e o
  progresso;
- caixa "Sobre este dia": o resumo do roteiro, os avisos, como circular hoje (saída, deslocamentos,
  mapa do dia) e as regiões do dia em chips;
- "Paradas do dia": cada passo é um cartão com miniatura da foto, horário, nome, chip de tipo, fila
  e área quando houver, e o círculo de marcar.

Tocar no cartão expande o resumo e as ações: Detalhes, Mostrar ao motorista, Ver onde comer perto.
Os intervalos e deslocamentos ficam como linhas discretas entre os cartões. A marca "agora" continua
no ponto certo do dia de hoje.

**Why this priority**: É a tela usada o dia todo na viagem e onde a maioria das fotos aparece.

**Independent Test**: Abrir 01/11 (Nova York) e 09/11 (Orlando) com `?agora=`. Comparar com
`design-reference/04-dia.jpg` e conferir todos os passos do dia, com foto quando houver.

**Acceptance Scenarios**:

1. **Given** 01/11 às 13h30, **When** o casal abre o dia, **Then**:
   - a capa mostra a foto de SoHo, "DOMINGO, 01/11", "DIA 2" e o título do roteiro;
   - "Sobre este dia" traz o resumo e os 2 avisos do doc;
   - a marca "agora · 13h30" aparece antes de Mott Street.
2. **Given** 09/11, **When** o casal abre o dia, **Then** cada atração é um cartão com miniatura,
   horário, nome, chip "Atração", fila e "Multi Pass" quando houver. Os almoços aparecem como linha
   discreta.
3. **Given** o círculo de uma parada, **When** o casal toca, **Then** ela fica feita, o contador da
   capa sobe e "Desfazer" aparece por alguns segundos.
4. **Given** um cartão expandido, **When** o casal toca "Mostrar ao motorista", **Then** abre a tela
   do motorista da feature 006.
5. **Given** um dia de viagem entre cidades (07/11, 18/11, 21/11), **When** aberto, **Then** a capa
   mostra a rota e os três blocos (antes de sair, a viagem, a chegada) aparecem como caixas do
   design.
6. **Given** o app sem internet, **When** o casal abre qualquer dia, **Then** fontes, ícones e fotos
   aparecem como com internet.

---

### User Story 2 - Início com "Agora", capa da viagem e cartões de cidade (Priority: P1)

O app abre no **Início**:
- a capa da viagem, com foto, os dias que faltam, as pessoas, o período, as cidades e o anel de
  progresso;
- **durante a viagem**, o cartão "Agora" logo abaixo da capa. Ele traz o próximo passo de hoje com
  foto, horário, como chegar e Feito/Pular, e um link "Abrir o dia". Em dias de viagem entre
  cidades, traz o primeiro item pendente dos três blocos. Em 06/11 e 07/11 também aparece "Reservar
  hoje";
- "Destinos": um cartão por cidade, com foto, país, noites, datas, dias de roteiro, resumo, contador
  e "Ver roteiro ›";
- "Destaques": ingressos comprados (Knicks x Nets, MJ The Musical) e itens a reservar, com data;
- no fim, uma seção de consulta: documento de cada cidade, guia de pontos, créditos das fotos e alto
  contraste.

**Why this priority**: É a primeira tela. Com a estrutura do design, o próximo passo, que a feature
006 garantia sem nenhum toque, passa a morar aqui.

**Independent Test**: Abrir o app em 27/10 (antes da viagem), em 01/11 às 13h30 e em 07/11 às 9h.
Comparar com `design-reference/01-inicio.jpg` e conferir o cartão "Agora".

**Acceptance Scenarios**:

1. **Given** 27/10, **When** o app abre, **Then** a capa mostra:
   - "FALTAM 4 DIAS" e "2 PESSOAS";
   - o período de 31/10 a 21/11 e as 3 cidades;
   - o progresso;
   - sem cartão "Agora".
2. **Given** 01/11 às 13h30, **When** o app abre, **Then** o cartão "Agora" mostra Mott Street às
   13h40, com foto, como chegar e Feito/Pular, sem nenhum toque.
3. **Given** "Destinos", **When** exibido, **Then** há 3 cartões na ordem da viagem, cada um com a
   foto da cidade e o contador real; tocar abre a página da cidade.
4. **Given** 06/11, **When** o app abre, **Then** "Reservar hoje" mostra o Multi Pass do Hollywood
   Studios.

---

### User Story 3 - Página da cidade com abas Roteiro, Dicas, Transporte e Bairros (Priority: P2)

A página da cidade segue o design:
- capa da cidade com foto, país, datas, noites, chegada e saída (do roteiro) e progresso;
- tags da cidade: os destaques do roteiro, como os compromissos com ingresso e as principais
  regiões;
- abas em pílula:
  - **Roteiro**: um cartão por dia, com foto, data, "DIA n", título, tipo de dia, número de paradas,
    resumo, contador e "Abrir dia ›";
  - **Dicas**: as dicas práticas do doc daquela cidade, em caixas;
  - **Transporte**: chegada, partida e como circular naquela cidade, do doc;
  - **Bairros**: as regiões do roteiro como cartões de bairro, com foto, frase, tags (Comer, Doces,
    Lojas…), uma dica quando o doc tiver e as opções por perto.

**Why this priority**: Organiza a viagem por cidade, como no design; o uso diário passa pelo Início e
pelo Dia.

**Independent Test**: Abrir Nova York e Orlando e percorrer as 4 abas. Comparar com
`design-reference/02-cidade-roteiro.jpg` e `03-cidade-bairros.jpg`.

**Acceptance Scenarios**:

1. **Given** Nova York, **When** a aba Roteiro é aberta, **Then** há 7 cartões de dia (31/10 a
   06/11), cada um com a foto da primeira região do dia.
2. **Given** Orlando, **When** a aba Bairros é aberta, **Then** cada parque e região do roteiro é um
   cartão com foto, e tocar abre as opções de comer e lojas daquela região.
3. **Given** Miami, **When** as abas são abertas, **Then** Roteiro mostra os dias com os roteiros
   sugeridos. Dicas, Transporte e Bairros dizem "Sem informações no roteiro desta cidade" quando não
   houver dado.

---

### User Story 4 - Abas Dicas e Transporte da viagem (Priority: P3)

As abas de baixo reúnem, para a viagem inteira:
- **Dicas**: dicas práticas de cada cidade, agrupadas por categoria:
  - clima;
  - dinheiro (gorjetas, imposto);
  - reservas e ingressos (o que comprar ou reservar antes);
  - apps;
  - outros.

  Cada dica é um cartão do design, com ícone, categoria, título, texto e lista com "✓";
- **Transporte**:
  - **entre as cidades**: os três dias de viagem e o que o roteiro diz de cada um, como o voo de NY
    e o trem para Miami;
  - **na cidade**: o que os docs dizem sobre metrô, táxi, carro e estacionamento.

**Why this priority**: Consulta, como no design; não é usada a todo momento.

**Independent Test**: Abrir Dicas e Transporte e conferir que cada cartão vem de um trecho dos docs
do casal (ou dos dados da viagem), sem texto do design e sem dado inventado.

**Acceptance Scenarios**:

1. **Given** Dicas, **When** aberta, **Then** cada cartão mostra a cidade de origem e o texto do doc
   sem reescrita, por exemplo as gorjetas de Nova York e as de Orlando.
2. **Given** Transporte, **When** aberta, **Then**:
   - "Entre as cidades" mostra 07/11 (NY → Orlando, com os itens da partida de NY e da chegada a
     Orlando), 18/11 ("De trem para Miami") e 21/11 (fim da viagem);
   - "Na cidade" mostra o metrô e OMNY de Nova York e o estacionamento de Orlando, como no doc.

---

### Edge Cases

- **Sem foto do lugar**: o cabeçalho usa o degradê do design com o ícone em traço. Nunca uma foto
  de outro lugar.
- **Foto clara sob texto branco**: um véu escuro garante contraste ≥ 7:1 nos textos essenciais
  (título, horário) e ≥ 4,5:1 nos demais.
- **Alto contraste (modo sol)**: o visual vira uma versão de contraste máximo, com o véu mais forte
  e o acento escurecido.
- **Tema escuro do celular**: a paleta do design ganha uma versão escura, com o mesmo contraste
  mínimo.
- **Endereços antigos**: os links das features anteriores redirecionam para a tela equivalente.
  Exemplos: `#/dia/…`, `#/perto/…`, `#/viagem`, `#/guia` e `#/full/…/documento`.
- **Cidade sem dado para uma aba** (Miami: dicas, transporte, bairros): a aba diz "Sem informações
  no roteiro desta cidade". Não usa texto inventado nem texto do design.
- **Nomes longos**: quebram em até 2 linhas no cartão, sem rolagem lateral a 390 px.
- **Primeira abertura sem internet**: as fontes do design vêm com o app instalado. Se ainda não
  estiverem salvas, o texto aparece com a fonte do sistema.
- **Muitas fotos numa tela** (dia com 11 paradas; aba Bairros): as fotos fora da tela só carregam
  ao rolar, e a rolagem continua fluida.

## Requirements *(mandatory)*

### Functional Requirements

**Estrutura (Q1 = B)**

- **FR-001**: A barra de baixo MUST ter os itens **Início**, **Dicas** e **Transporte**, no estilo
  do design.
- **FR-002**: O **Início** MUST mostrar, nesta ordem:
  1. a capa da viagem;
  2. durante a viagem, o cartão "Agora" e "Reservar hoje" quando houver;
  3. "Destinos";
  4. "Destaques";
  5. consulta: documentos, guia, créditos, alto contraste.
- **FR-003**: A **página da cidade** MUST ter a capa da cidade, as tags e as abas Roteiro, Dicas,
  Transporte e Bairros.
- **FR-004**: A **página do dia** MUST ter:
  - a capa do dia;
  - "Sobre este dia" (resumo, avisos, como circular hoje, regiões);
  - "Paradas do dia" com os passos do roteiro em cartões marcáveis.

  Os dias de viagem entre cidades mostram os três blocos da feature 006.
- **FR-005**: As funções das features 006 e 007 MUST continuar disponíveis na nova estrutura:

  | Função | Onde fica |
  |---|---|
  | Próximo passo sem toque | Cartão "Agora" no Início |
  | Feito, Pular e Desfazer | Cartão "Agora" e paradas do dia |
  | Marca "agora" | Página do dia |
  | Como chegar | Cartão "Agora" e paradas do dia |
  | Motorista | Cartão expandido e detalhe do passo |
  | Detalhe do passo | A partir do cartão expandido |
  | Por perto | Aba Bairros e "Ver onde comer perto" no cartão expandido |
  | Avisos do dia | "Sobre este dia" |
  | Reservar hoje | Início |
  | Dias de transição | Página do dia |
  | Documentos e guia de pontos | Consulta no Início |
  | Alto contraste | Consulta no Início |

- **FR-006**: Os endereços das telas antigas MUST continuar funcionando, levando à tela
  equivalente.
- **FR-007**: As abas **Dicas** e **Transporte** (da viagem e da cidade) MUST mostrar só conteúdo
  que já existe no app:
  - dicas práticas, metrô, partida e o que reservar, dos docs do casal;
  - os dias de viagem;
  - o "De trem para Miami" decidido pelo casal.

  Os textos aparecem sem reescrita, cada um com a cidade de origem. Sem dado, a aba diz "Sem
  informações no roteiro desta cidade".
- **FR-008**: Nenhum texto do design MUST aparecer no app: destinos, datas, preços, frases, dicas e
  nomes de seção próprios do design. Os rótulos de interface do design ("Início", "Destinos", "Abrir
  dia", "Paradas do dia" etc.) podem ser usados, porque são estrutura, não conteúdo.

**Visual**

- **FR-009**: Todas as telas do app MUST seguir a linguagem visual do design descrita no Contexto.
  Isso inclui o guia de pontos, o documento completo e os créditos. Nenhuma tela fica no visual
  antigo.
- **FR-010**: A tela do motorista MUST continuar em tela cheia e de alto contraste, com o endereço
  grande, como na feature 006.

**Fotos**

- **FR-011**: Todo cabeçalho em degradê do design MUST mostrar a foto real do lugar, quando houver:
  - capa da viagem;
  - capa e cartão de cada cidade;
  - capa e cartão de cada dia;
  - cartão de cada bairro ou região;
  - cartão "Agora";
  - detalhe do passo.
- **FR-012**: Cada parada do dia MUST ter miniatura com a foto do próprio lugar, quando houver. Cada
  opção de comida ou loja com foto também mostra a miniatura.
- **FR-013**: As fotos MUST ser só do próprio lugar, com crédito acessível (autor, licença, fonte).
  Sem foto, vale o degradê com ícone do design.

**Acessibilidade e offline**

- **FR-014**: Os mínimos da feature 006 MUST continuar:
  - contraste ≥ 7:1 no essencial;
  - alvos de toque ≥ 48 px (44 px nos chips);
  - sem rolagem lateral a 390 px;
  - letra base de pelo menos 17 px;
  - alto contraste;
  - tema escuro.
- **FR-015**: Fontes, ícones e estilos do design MUST funcionar sem internet depois da primeira
  abertura, como o resto do app.
- **FR-016**: A primeira tela da página do dia MUST mostrar, a 390 × 844, a capa, "Sobre este dia"
  (recolhido) e a 1ª parada inteira; as demais seguem com uma rolagem curta. O cartão "Agora" do
  Início MUST ficar inteiro na primeira tela, sem rolar, durante a viagem.
  *Ajuste na implementação (27/10/2026)*: a meta inicial de ≥ 3 paradas não cabe com a capa com foto e
  "Sobre este dia" na ordem do design; medido em 01, 09, 13 e 14/11, cabe 1 parada inteira e o começo
  da seguinte.

### Key Entities

- **Capa**: rótulo, título, subtítulo, chips, progresso e foto (ou degradê com ícone).
- **Cartão de destino**: cidade, país, noites, datas, dias de roteiro, resumo, progresso e foto.
- **Cartão de dia**: data, número do dia, título, tipo de dia, paradas, resumo, progresso e foto.
- **Cartão de parada**: horário, nome, tipo, duração, fila, área, resumo, marca, miniatura e ações.
- **Cartão de bairro**: nome, frase, tags, dica, foto e opções por perto.
- **Cartão de dica / transporte**: cidade de origem, categoria, título, texto do doc, lista e
  tabela curta.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Numa revisão lado a lado com as capturas do design, o casal reconhece a mesma estrutura
  e o mesmo estilo em 100% das telas. Nenhuma tela fica no visual antigo.
- **SC-002**: 0 textos do design aparecem no app, verificado por busca dos termos próprios do
  design: "Lisboa", "Coimbra", "Sintra", "Portugal", "Caderno de Viagem" e "fado".
- **SC-003**: Paradas e capas com foto:
  - em "Paradas do dia", ≥ 90% das paradas marcáveis de Nova York e de Orlando mostram miniatura
    com foto do próprio lugar;
  - as capas e os cartões de cidade, dia e bairro de Nova York e Orlando têm foto em ≥ 90% dos casos.
- **SC-004**: Durante a viagem, o próximo passo aparece no Início sem nenhum toque. Qualquer
  informação de um dia fica a ≤ 3 toques do Início.
- **SC-005**: Os testes de acessibilidade da feature 006 continuam passando em todas as telas, nos
  temas claro, escuro e alto contraste.
- **SC-006**: Com o app sem internet, todas as telas aparecem com as fontes, ícones e fotos do
  design.
- **SC-007**: Todas as funções das features 006 e 007 continuam cobertas por testes, adaptados à
  nova estrutura. Os endereços antigos levam à tela equivalente.
- **SC-008**: 100% dos textos das abas Dicas e Transporte vêm dos docs do casal ou dos dados da
  viagem. A conferência automática acusa qualquer texto sem origem.

## Assumptions

- **Q1 = B**: o design vale no visual e na estrutura de telas; seus textos e dados são ignorados.
  Os rótulos de interface do design podem ser usados.
- **O design foi lido pelo preview público** do mesmo projeto, porque o link do editor exige login.
- **O próximo passo continua sem toque.** O design não tem a tela "Agora". Para não perder a regra
  da feature 006, o cartão "Agora" fica no Início, logo abaixo da capa, durante a viagem.
- **"Destaques"** do Início = ingressos comprados e itens a reservar, que já existem no app. Nenhum
  texto novo.
- **Tags da cidade** = compromissos com ingresso e principais regiões do roteiro, sem frases novas.
  A frase da cidade é o resumo do ponto de destaque no guia.
- **Fotos.** Valem as fotos offline já existentes (features 001, 006 e 007), com crédito e só do
  próprio lugar. Novas fotos só se faltar capa de cidade, dia ou bairro para o SC-003.
- **Fontes.** As fontes do design são livres e passam a ser parte do app (offline), com custo de
  tamanho registrado no plano.
- **Conteúdo e dados** das features 001 a 007 não mudam: só a forma de mostrar.
- **Ordem do dia.** A primeira tela do dia passa a mostrar a capa, "Sobre este dia" e a 1ª parada
  inteira, em vez de 8 linhas compactas. A densidade da feature 006 dá lugar à capa com foto do design
  (FR-016, ajustado na implementação).
