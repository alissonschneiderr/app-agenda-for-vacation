# Research — feature 013

## R1 — O que é "bairro de verdade" (US3, Q1 = A)

- **Situação**: um grupo do roteiro é "bairro" quando `area.kind === 'bairro'`. O leitor dá esse
  tipo a todo "### 📍". A seção "Bairros" do dia (`neighborhoods()` em `src/domain/notebook.ts`) e
  a contagem do menu (`daySections`, `bairros`) usam esse tipo.
- **Decision**: uma classificação **explícita, por roteiro**, com um campo novo `notNeighborhoods` no
  `meta.json` de cada cidade, que lista os nomes dos grupos que não são bairro. Também uma regra
  geral para tempo livre (`/^(manhã|tarde|noite) livre|tempo livre/i`).
  - A função de domínio `isNeighborhood(area, itinerary)` é a única fonte da regra.
  - `neighborhoods()` e a contagem `bairros` passam a usá-la.
  - O `kind` da área **não muda**. Assim, a linha do tempo, a noite, os cabeçalhos de grupo da 010
    (Q2 = A) e o relatório da 010 continuam iguais.
- **Listas** (do levantamento da spec):
  - `nova-york`: Museu de História Natural, Central Park, MET – Metropolitan Museum of Art, Ponte
    do Brooklyn, Brooklyn Bridge Park, MoMA, High Line;
  - `orlando`: Magic Kingdom, Hollywood Studios, EPCOT, Animal Kingdom, Epic Universe, Universal
    Studios Florida, Islands of Adventure, Orlando Vineland Premium Outlets, Orlando International
    Premium Outlets ou Mall at Millenia ("Manhã livre" sai pela regra geral);
  - `miami`: Sawgrass Mills, Lummus Park e a praia de South Beach.
  - Ficam como bairro: Midtown, SoHo, Nolita, Chinatown, Little Italy, Lower East Side, East
    Village, Financial District, Greenwich Village, West Village, Upper West Side, Upper East Side,
    Brooklyn Heights, DUMBO, Williamsburg, Hudson Yards, Chelsea, Meatpacking District, Empire State
    e arredores (Midtown South), Cocoa Beach, South Beach (Art Deco District).
- **Validação no build**: um nome de `notNeighborhoods` que não existe em nenhum grupo do roteiro é
  erro de conteúdo. Assim a lista não apodrece quando o roteiro muda.
- **Rationale**: nada é deduzido (FR-010). A decisão fica no conteúdo, revisável, e um teste confere
  a lista completa.
- **Alternatives considered**:
  - deduzir pelo nome ("Park", "Museum") ou pelo ponto do guia: rejeitada, porque erra (Lummus Park,
    High Line) e inventa;
  - um `kind` novo na área: rejeitada, porque mexe na linha do tempo e na 010, contra "nada além".

## R2 — Tempo livre sem rótulo de bairro (FR-009)

- Na linha do tempo do dia, o cabeçalho de grupo mostra um alfinete e o nome ("📍 MANHÃ LIVRE").
- **Decision**: para tempo livre, o cabeçalho continua com o nome (é o período), mas **sem o ícone
  de alfinete**, porque não é lugar. Grupos que não são bairro, mas são lugar (Central Park, Magic
  Kingdom), mantêm o alfinete, já que continuam sendo atividade e local do dia.
- Na página do grupo (`#/perto/...`), o selo "📍 Bairro" só aparece quando o grupo é bairro.

## R3 — Bairros do 18/11 (bug achado no plano)

- `neighborhoods()` pula os dias de viagem (`dayKind === 'transit'`), mas a contagem do menu não
  pula. No 18/11 (Miami, feature 012), o menu mostra "Bairros" e a seção fica vazia.
- **Decision**: `neighborhoods()` passa a incluir os dias de viagem que têm grupos do roteiro. A
  contagem e a lista usam a mesma função (`isNeighborhood`). Há um teste que reproduz o bug
  (constituição II). Resultado: o 18/11 mostra South Beach (Art Deco District) em "Bairros".

## R4 — Rótulos do dia (US2)

- **Situação**:
  - "Dia N": `DayCard` (chip), `Day.tsx` (título do `PageHeader` e o `eyebrow` da capa);
  - "dia da semana, data": `DayCard` (eyebrow, `formatDayLabel`) e `Day.tsx` (chip da capa,
    `formatDayLabel` encurtado).
- **Decision**: duas funções novas em `src/domain/trip.ts`:
  - `formatDayMonth(date)` → "19/11";
  - `formatWeekday(date)` → "Quinta-feira" (por extenso, inicial maiúscula). Os nomes vêm de uma
    lista fixa em português, sem depender do `Intl` do aparelho, igual a `formatDayLabel`.

  As outras datas (botões de dia anterior e próximo, `aria-label` dos cards, Transporte, roteiros,
  documento) continuam com `formatDayLabel` (FR-007).
- O `dayNumber` sai das telas. Fica no modelo só se algum teste ou tela ainda usar; se não, sai
  (constituição III).

## R5 — Cidade aberta no dia de hoje (US1)

- **"Hoje"**: a data local do aparelho, sem horário. Função nova `deviceToday(now)` em
  `src/domain/trip.ts`, com `getFullYear()`, `getMonth()` e `getDate()` do `Date`. Com `?agora=`, o
  relógio simulado (`nowFromUrl`) vale como "agora" do aparelho.
- **Regra**: `todayInCity(dates, today)` devolve a data se `dates[0] <= today <= dates.at(-1)`;
  senão, `undefined`. As datas da cidade são `destinationDates` (chegada a partida, inclusive).
- **Rolagem**: na página da cidade (`src/pages/City.tsx`), ao montar, se houver data de hoje, o card
  de hoje recebe `scrollIntoView({ block: 'start' })`. Um `scroll-margin-top` igual à altura do
  cabeçalho fixo (como as seções do dia) deixa o card como primeiro visível. Sem data de hoje, a
  página fica no topo, como já é (o roteador volta ao topo ao trocar de tela).
- **Sem saltos (FR-004)**: o efeito roda só ao montar a página da cidade. Rolar não dispara de novo.
  Voltar de um dia monta a página de novo e aplica a mesma regra.
- **Alternatives considered**: reordenar a lista começando em hoje. Rejeitada, porque o pedido manda
  manter a ordem crescente.
