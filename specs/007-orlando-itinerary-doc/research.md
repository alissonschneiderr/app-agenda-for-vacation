# Research: Roteiro de Orlando (feature 007)

Decisões técnicas para levar o doc de Orlando ao app pelo mesmo caminho do doc de Nova York
(feature 005). Base: a cópia `source/roteiro-2026-10-24-rev26.md` e o código atual
(`scripts/nyc-doc-parser.ts`, `scripts/build-content.ts`, `src/domain/trip-view.ts`).

## R1. Um leitor só para os dois docs

- **Decision**: estender `scripts/nyc-doc-parser.ts` (renomeado para `scripts/doc-parser.ts`) para
  aceitar também o formato de Orlando. Uma pasta `content/full/orlando/` com `meta.json` e
  `roteiro.md` entra no build sem mudanças em `readFullItineraries()`, que já percorre
  `content/full/*`.
- **Rationale**: os dois docs têm a mesma estrutura de base (`##` dia, `###` região, listas em negrito,
  links de fotos). As diferenças são pontuais (R2–R8). Um leitor só mantém a conferência D1–D5 igual
  nas duas cidades e cumpre FR-019.
- **Alternatives considered**: um leitor separado para Orlando, que duplicaria ~400 linhas e a
  conferência; transcrever os 75 itens em JSON à mão, que perde fidelidade e o passo único de
  atualização.
- **Guarda de regressão**: o `content.json` de Nova York MUST sair idêntico ao de antes da mudança.
  Isso vale para ids, títulos, horários, lugares e áreas, e é conferido por um teste de snapshot da
  saída do leitor para o `roteiro.md` de NY.

## R2. Diferenças de formato que o leitor precisa aceitar

| Ponto | Nova York | Orlando | Regra nova |
|---|---|---|---|
| Cabeçalho do dia | `Dia 1 (sábado, 31/10): …` | `Dia 2 (dom 08/11): …` | dia da semana com ou sem vírgula: `\((?:[^)]*?[\s,])?(\d{2})\/(\d{2})\)` |
| Partida | `Partida (sábado, 07/11)` | `Partida (qua 18/11) e dicas práticas` | mesma regra de data |
| Hora | sempre 2 dígitos (`09h40`) | 1 ou 2 (`8h10`, `12h40`) | `\d{1,2}h(\d{2})?`, normalizado para `HH:MM` |
| Intervalo | `às`, `–` | `–`, `ou` (`12h15 ou 13h15`) | `ou` aceito; o início é o 1º horário, sem fim (não é intervalo) |
| Logística | `09h40 – saída:` | `06h50 – chegada ao estacionamento:` | título aceito: `saída`, `volta` e `chegada ao` |
| Volta ao hotel | parágrafo `🏨 **…**` | cabeçalho `### 🏨 ~18h – volta ao hotel` | `###` com 🏨 vira passo de logística, não região; o corpo vira `how` |
| Deslocamento | parágrafo `🚶 **…**` | cabeçalho `### 🚗 Deslocamento … (~20 min de carro)` | `###` com 🚗 vira `transfer` da região anterior |
| Ícone do item | 5 ícones conhecidos | um emoji qualquer (🛶, 🚂, 🏴‍☠️…) | o primeiro emoji (sequência pictográfica, com ZWJ/VS16) sai do título para `icon`; 🛍️/🎬 continuam definindo o tipo |
| Detalhe do item | sublista | na mesma linha: `· fila ~5 min (Adventureland). Texto. [📷 fotos]` | R3 |
| Noite | sempre com horário (evento) | quase sempre sem horário ("descanso") | noite sem horário vira região só com notas, sem passo e sem erro; D1 só conta noites com horário |
| Comida | `☕/🏆/🍰 **Nome** — texto 💵 · fila` | `Nome (área)` | R4 |
| Mercados | – | `**🛍️ Mercados (lista):**` | lista de lojas simples (R4) |
| Avisos | antes do 1º bairro | `**⚠️ Fechado:**` / `**⚠️ Fora do roteiro:**` dentro da região; `**🎟️ Reservar…**` antes da 1ª região | parágrafo `**⚠️…**` em região também vira aviso do dia (FR-004) |
| Compras | `🛍️` em item com horário | parágrafo `**🛍️ Compras (tarde, ~14h às 18h):** texto` | parágrafo de compras com horário vira passo `shopping` (FR-006, SC-001) |
| Tabela de reservas | colunas `Data · Atração · Situação` | `Item · Quando reservar · Custo · Dia de uso` | R6 |

## R3. Linha de atração de parque

- **Decision**: em `**HORA — ícone Nome** resto`, o resto é dividido assim:
  1. o trecho entre o início e o primeiro `. ` (ou o fim), se começar com `·`, é a meta. Os
     segmentos separados por ` · ` são: o 1º com "min" vira `queue` ("fila ~5 min", "~10 min com
     Single Pass (ou ~65 min na fila normal)"), e os outros viram `access` ("Multi Pass", "fila
     normal"). Um parêntese no fim da meta é a `land` ("Adventureland", "Super Nintendo World; entre
     na fila antes das 19h");
  2. o restante, sem os links, é o texto (`fields`), sem reescrita. "Single rider disponível."
     continua no texto;
  3. o link `📷 fotos` vai para `photoUrls`.

  Cada atração ganha um `DocPlace` `kind: 'attraction'`, ligado ao passo. Isso dá à atração a foto
  (R7), o detalhe e o "Ver fotos".
- **Extras**:
  - item com `(opcional` no resto → `optional: true`. O progresso já trata opcional, que só conta
    quando feito;
  - título que começa com "Almoço" → tipo `free`. É intervalo, sem Feito/Pendente, e a faixa "Ver
    onde comer" já existe para `free`;
  - "Shows e tempo livre" já é `free` pela regra atual.
- **Rationale**: atende FR-005/FR-006 sem mexer nos itens de Nova York, que usam sublista.
- **Alternatives considered**: guardar o resto inteiro como `how`, que perde fila, área e forma de
  entrar como campos e impede mostrá-los no cartão "Agora" (SC-007).

## R4. Listas "Onde comer" e "Mercados" sem marcador

- **Decision**: na lista de comida, um item sem ☕/🏆/🍰 e sem negrito vira `food` com
  `name` = texto antes do parêntese final e `fields[0]` = conteúdo do parêntese ("Frontierland",
  "Main Street, cachorro-quente"). Sem parêntese final, o item inteiro é o nome ("Butterbeer em
  Hogsmeade"). `**🛍️ Mercados (lista):**` abre lista `shop` com o mesmo tratamento.
- **Rationale**: FR-009. Não há preço nem fila no doc de Orlando, então esses campos ficam vazios. A
  legenda de preço não aparece.

## R5. Dia 1 (07/11) e partida (18/11) nos dias de locomoção

- **Decision (chegada)**: `meta.json` de Orlando declara `arrivalDay: "2026-11-07"`. A seção desse dia
  não vira `FullDay`, porque 07/11 continua dia de locomoção e o F3 "dia sem atividades" não se
  aplica. Ela vira:
  - `arrivals["2026-11-07"].items`: os itens da lista de `### ✈️ Chegada`, marcáveis, com ids
    `tr:2026-11-07:c1`, `c2`;
  - `arrivals["2026-11-07"].html`: o resto da seção (Mercados e Noite), em HTML.

  O bloco "A chegada" mostra os dois. A conferência confere o número de itens da Chegada.
- **Decision (partida)**: o texto da partida de Orlando é um parágrafo só, que mistura o que vale
  (check-out, carro) e o que não vale para o trem (voo internacional). A lista "Dicas práticas" está
  na mesma seção. Por isso `meta.json` declara `departure`:

  ```json
  "departure": {
    "date": "2026-11-18",
    "before": [{ "label": "Check-out e carro", "quote": "faça o check-out com folga e devolva o carro no aeroporto (MCO)" }],
    "trip": [{ "label": "De trem para Miami", "source": "casal, Q1 da feature 007" }]
  }
  ```

  - cada `quote` MUST ser trecho literal da seção Partida do doc; senão, erro de build, como em
    `checklistOverrides`;
  - itens `trip` sem `quote` precisam de `source`, que registra que a informação veio do casal e não
    do doc;
  - com `departure` declarado, o leitor não transforma a lista da seção em itens e não grava
    `dayNotes[18/11]`. Assim a frase do voo internacional fica só no documento completo (FR-014).
- **Rationale**: aplica a Q1 sem editar a cópia do doc, e cada texto mostrado continua rastreável até
  o doc ou até a decisão do casal.
- **Alternatives considered**:
  - editar `roteiro.md`, que quebra a regra de cópia sem edição;
  - mostrar a partida inteira, que contradiz a Q1;
  - separar o parágrafo por frases automaticamente, que é frágil e esconde a decisão.

## R6. Itens a reservar e lembrete em "Agora"

- **Decision**: a tabela com cabeçalho `Item | Quando reservar | Custo | Dia de uso` vira
  `checklist`:
  - `what` = Item, `when` = Quando reservar, `note` = Custo;
  - `forDate` = data de "Dia de uso";
  - `deadline` = data de "Quando reservar", quando houver (06/11, 07/11).

  O lado de NY continua como está.
  - Cada item ganha `id` `ck:<cidade>:<n>`.
  - Em "Agora", durante a viagem, os itens com `deadline` = hoje aparecem numa faixa "Reservar hoje"
    com Feito. A marca usa o `id` e fica fora do progresso.
  - "Viagem" lista os itens de todas as cidades, agrupados por cidade, e liga para a seção do doc
    "O que reservar com antecedência", onde estão a regra dos ingressos e o checklist (FR-015).
- **Rationale**: FR-015/FR-016 com o tipo `ChecklistItem` que já existe; só `id` é novo.
- **Alternatives considered**: transformar o checklist "- [ ]" do doc em itens marcáveis. Não foi
  pedido, e o doc completo já mostra o checklist.

## R7. Fotos offline (Q2 = A)

- **Decision**:
  - `content/full/orlando/doc-photos.json` traz nome no doc → `File:` ou `wiki:` do Wikimedia
    Commons, igual a NY;
  - `npm run photos -- --doc` passa a percorrer todas as cidades em `content/full/*/doc-photos.json`;
  - as fotos de Orlando vão para `public/photos/doc/orlando/`. As de NY ficam onde estão, para não
    renomear arquivos já cacheados;
  - os parques e lugares ligados ao guia (`point-links.json`) usam a foto do guia quando não houver
    foto própria (`attachDocPhotos`, sem mudança);
  - os itens sem foto livre do próprio lugar vão para `photos-missing.md`.
- **Orçamento**: ~67 fotos × ~80 KB ≈ 5 MB, que leva o conteúdo de 18,8 para ~25 MB. O limite é 40 MB
  (`MAX_TOTAL_BYTES`), sem mudança.
- **Rationale**: mesma regra e mesma conferência de licença da feature 006 (`ALLOWED_LICENSE`, autor,
  link da fonte).
- **Risco**: atrações de 2025–2026 (Epic Universe, Soarin' Across America, Rock 'n' Roller com os
  Muppets) podem não ter foto livre. A meta é ≥ 90% (SC-010). A busca no Commons é feita item a item,
  e as fotos de outro lugar são rejeitadas, como na 006.

## R8. Mapa e "Mostrar ao motorista" dentro do parque

- **Decision**: um passo dentro de uma região ligada a um ponto do guia (por exemplo, "Magic
  Kingdom" → `orl-magic-kingdom`) herda o `pointId` da região quando não tem o seu. Com isso,
  "Abrir no mapa" e "Mostrar ao motorista" apontam para o parque, com o endereço do guia, e não para
  "Jungle Cruise" como texto de busca.
- **Rationale**: dentro do parque o casal anda; o motorista só importa para chegar ao parque. Sem
  isso, `stepAddress` cairia no título da atração.
- **Volta ao hotel**: o doc não diz qual é o hotel, então `base` fica opcional no `meta.json` e a
  volta ao hotel não oferece motorista (Assumptions da spec).

## R9. Roteiros sugeridos de Orlando

- **Decision**: em `dayView`, um dia com `FullDay` deixa de mostrar os roteiros de `origin:
  'suggested'`. Os roteiros continuam guardados no estado do casal, como decidido na 006 (Q3). Os
  roteiros criados pelo casal (`origin: 'user'`), se existirem, continuam aparecendo.
- **Rationale**: FR-001/FR-003 e SC-005. As marcas `it:…` antigas deixam de contar porque os itens
  saem da visão do dia. Nada é apagado.
- **Efeito**: Miami (19 e 20/11) continua com os sugeridos, porque não tem `FullDay`.

## R10. Validação por cidade

- **Decision**: as regras que hoje assumem Nova York passam a depender do itinerário:
  - F2: as datas esperadas vêm de um mapa por id: `nova-york` → `NY_DATES`; `orlando` → 08 a
    17/11;
  - F10 (JFK → Pod 51) só para `nova-york`;
  - o id das atividades usa o prefixo de `meta.idPrefix`: NY continua `ny3`, Orlando usa `orl1`.

  O schema passa a aceitar:
  - `base` e `arrival.time` opcionais;
  - `arrivals`;
  - `departure` no meta;
  - `ChecklistItem.id`;
  - ids `tr:<data>:c<n>`.
- **Tipo de dia**: `content/trip.json` `dayKinds` de Orlando segue o doc (FR-018). A regra de que
  todo dia tem tipo continua.

## R11. Rotas e telas

- **Decision**:
  - `#/full/:cityId/documento[/:section]` substitui as duas rotas fixas de NY. A rota antiga continua
    funcionando porque `nova-york` é um `cityId`;
  - `FullDocument` passa a receber o `cityId`;
  - "Viagem → Consulta" mostra "Documento completo" e "Dicas práticas" de cada cidade com roteiro;
  - o redirecionamento `#/full/nova-york/:date` continua só para NY.
- **Telas de dia**: nenhuma tela nova. `TimelineRow` e `NextStepCard` passam a mostrar fila, área e
  forma de entrar quando o lugar do passo tiver esses campos (contrato em `contracts/ui.md`).
