# Research — feature 010

Levantamento feito com o conteúdo real do app (`assembleContent()` + `dayView` para os 22 dias).

## R1 — De onde vem o bairro de cada item (FR-001, FR-002, FR-019)

- **Decision**: o bairro de um restaurante, loja ou curiosidade é o grupo do roteiro
  (`DayArea`) cujo `placeIds` contém o item. A ordem dos grupos é a ordem de `view.areas`. Um
  item que esteja em `view.places` mas em nenhum grupo vai para "Outros". Um item em dois grupos
  fica no primeiro e entra no relatório.
- **Rationale**: o roteiro já organiza tudo assim. `dayPlaces` já percorre os grupos nessa ordem.
  Nada é deduzido de endereço.
- **Levantamento**: hoje, 100% dos lugares `food`, `shop` e `screen` estão em algum grupo. Nenhum
  está em dois grupos. "Outros" não aparece em nenhum dia.
- **Alternatives considered**: deduzir o bairro pelo endereço (geocodificação ou texto). Rejeitada:
  inventa dado e depende de rede.

## R2 — Cabeçalho de grupos que não são bairros (FR-007, Q2 = A)

- **Decision**: o cabeçalho é `area.name` exatamente como está no roteiro. Os grupos com
  `kind` diferente de `bairro` (`noite`, `chegada`, `ideias`) e as regiões nomeadas por um ponto
  entram na lista de revisão do relatório.
- **Casos atuais**:
  - 02/11: "Noite: Knicks x Nets no Madison Square Garden (19h30)" (3 restaurantes);
  - 05/11: "Noite: MJ The Musical (19h00, Neil Simon Theatre)" (5);
  - 06/11: "Noite: jantar no Harlem" (4) e "Empire State e arredores (Midtown South)" (4 + 1
    curiosidade);
  - parques de Orlando (Magic Kingdom, Hollywood Studios, EPCOT, Animal Kingdom, Epic Universe,
    Universal Studios Florida, Islands of Adventure). São `kind: bairro` e não precisam de revisão.
- **Alternatives considered**: B ("Outros") e C (extrair "Harlem"). Ficam para o usuário, se
  quiser trocar.

## R3 — "Transporte" relevante (FR-008 a FR-011, Q1 = A)

- **Decision**: uma nova função `isRelevantMove(text)` no domínio. Um trecho é relevante quando
  o texto de instrução (`how`, ou o texto do `transfer`) cita um modo que não é a pé: metrô, linha,
  trem, AirTrain, ferry, barco, barca, táxi, Uber, carro, monotrilho, ônibus ou Skyliner.
  - Trechos sem nenhum modo saem da seção. Exemplos: "o parque abre às 9h…", "Contem com 45 a 90
    minutos entre imigração e malas", "até o MoMA… (~15 min)".
  - Trechos só a pé também saem.
  - Na seção, só os trechos relevantes aparecem.
  - O "Mapa do dia" só aparece dentro da seção e sozinho não a mantém.
  - Dias de troca de cidade mantêm os blocos (sem mudança).
- **Rationale**: `modeOf` (`src/domain/now.ts`) devolve `walk` para "monotrilho" e "carro", e
  seria errado alterá-lo, porque ele escolhe o ícone. A nova função é pequena, testável e não muda
  os ícones.
- **Resultado esperado** (do levantamento):

  | Dia | Transporte | Trechos que ficam |
  |---|---|---|
  | 31/10 | **sai** | nenhum: chegada sem modo, check-in, saída a pé |
  | 01/11 | fica | metrô 6 até Bleecker St |
  | 02/11 | fica | metrô E até o WTC |
  | 03/11 | fica | metrô E e troca para o B até 81 St |
  | 04/11 | fica | metrô 6 até Brooklyn Bridge; NYC Ferry até Williamsburg |
  | 05/11 | fica | táxi ou metrô 7 até Hudson Yards |
  | 06/11 | fica | metrô 6 até a 33 St |
  | 07/11, 18/11, 21/11 | ficam se houver blocos | blocos de troca de cidade |
  | 08/11 | fica | monotrilho ou barca do estacionamento |
  | 09/11, 10/11, 12/11, 14/11, 15/11, 17/11 | **saem** | só o horário do parque |
  | 11/11, 16/11 | **saem** | só tinham o "Mapa do dia" (FR-011) — corrigido na implementação |
  | 13/11 | fica | ~1h de carro até o KSC; carro até Cocoa Beach |
  | 19/11, 20/11 | já não tinham | — |

  A lista final do relatório sai do próprio código (R6).
- **Alternatives considered**: usar o `dayKind` ("A pé") do dia, que é a opção B. Rejeitada por
  Q1 = A.

## R4 — "Dicas" específicas × genéricas (FR-015 a FR-017)

- **Decision**: uma nova função `isGenericTip(html)` no domínio. Uma dica é genérica quando:
  - não traz nenhum marcador específico (data, hora, dia da semana, número, nome próprio em
    destaque, ou as palavras fechado, reserva, reservar, maratona, horário, feriado, chuva,
    frio, calor, segurança, ingresso, fila virtual, Multi Pass);
  - **e** cai num padrão genérico: andar a pé, sapatos confortáveis, aproveitem, hidratem-se,
    levem água, protetor sem contexto.

  Na dúvida, a dica fica, porque cortar uma dica útil é pior que manter uma óbvia. A dica nunca é
  reescrita. O corte é da dica inteira.
- **Levantamento**: as 10 dicas atuais têm marcadores específicos. Nenhuma é cortada e nenhum dia
  perde "Dicas". Os testes usam dicas genéricas de fixture para provar o corte.
- **Alternatives considered**: cortar frases dentro de uma dica. Rejeitada: alteraria o texto do
  roteiro. Marcar à mão no conteúdo também foi rejeitada: hoje não há o que marcar.

## R5 — Cabeçalho de bairro preso (FR-004, SC-005)

- **Decision**: cada grupo é um `<section>` com um `<h3 class="hood-group-head">` em
  `position: sticky`, com `top` igual ao cabeçalho + menu + safe area. O sticky vale dentro do
  próprio `<section>`, então o cabeçalho solta quando o grupo acaba.
  - Fundo opaco (`--paper`) e altura ≥ 44 px.
  - O `scroll-margin-top` das seções continua como na 009.
- **Rationale**: só CSS, sem JS e sem dependência nova.
- **Alternatives considered**: IntersectionObserver para trocar um rótulo fixo. Mais código, sem
  ganho.

## R6 — Relatório gerado a partir do código (FR-018, FR-019)

- **Decision**: uma nova função `sectionReview(content, state)` no domínio. Ela devolve, por dia:
  - as seções que existiam pela regra da 009 e saíram pela regra da 010 ("Transporte", "Dicas");
  - os trechos de transporte descartados;
  - as dicas cortadas;
  - os grupos que não são `bairro`;
  - os itens em "Outros" ou em dois grupos.

  O `report.md` é escrito a partir dela, como o `data-review.md` da 009.
- **Rationale**: evita lista feita à mão divergente do app, e os testes conferem os números.

## R7 — Atração de compras (FR-012 a FR-014)

- **Decision**: o detalhe do passo (`StepDetail`) mostra o grupo do seu bairro quando:
  - `a.category === 'shopping'`;
  - `a.areaId` existe;
  - o grupo do bairro tem lojas.

  As lojas vêm de `dayPlaceGroups(view, 'shop')`, a mesma função da seção "Brechós e Lojas",
  renderizadas com o mesmo `DayPlaceCard`. O atalho "Ver todas as lojas do dia" leva a
  `#/dia/<data>?secao=lojas`, e o Dia rola até `#lojas` ao abrir com `secao` na query (usa o
  `useQuery` da 009).
- **Casos atuais**:

  | Atração | Grupo | Lojas |
  |---|---|---|
  | Compras no SoHo | SoHo | 5 |
  | Compras na Elizabeth e na Mott Street | Nolita | 4 |
  | Compras no Lower East Side | Lower East Side | 3 |
  | Compras no East Village | East Village | 5 |
  | Compras na Bedford Avenue | Williamsburg | 5 |
  | Compras (tarde), 11/11 e 16/11 | outlets de Orlando | 0 — sem bloco |
  | Lincoln Road | sem grupo | sem bloco |

- **Alternatives considered**: link direto `#lojas`. Não funciona entre rotas no roteador por
  hash.

## R8 — "Curiosidades" no menu do dia (FR-005)

- **Decision**: uma nova seção `curiosidades` (lugares `kind: 'screen'`), entre `lojas` e
  `bairros`, com ícone `film`.
  - O card usa `DayPlaceCard`, com o texto `works` (filme ou série) como resumo quando não houver
    descrição.
  - O link vai para `#/perto/<data>/<grupo>/<id>`, como os outros.
- **Levantamento**: há curiosidades em 31/10, 01/11, 02/11, 03/11, 04/11 e 06/11.
