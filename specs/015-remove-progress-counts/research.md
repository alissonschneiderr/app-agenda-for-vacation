# Research: Sem contagens nem percentuais de progresso

Não há NEEDS CLARIFICATION: o pedido é de remoção e Q1 = B fechou o escopo. As decisões abaixo
saem do levantamento do código.

## R1 — Cabeçalho sem o anel

- **Decision**: `PageHeader` perde as props `progress` e `scope`; `ProgressRing.tsx` é apagado. A
  grade do cabeçalho (`48px minmax(0,1fr) auto`) fica: sem o terceiro filho, a coluna `auto` tem
  largura 0 e o título ocupa o espaço. O Início usa a mesma grade com o ⚙ e não muda.
- **Rationale**: o anel só aparece na cidade e no dia; tirar a prop evita uso futuro por engano.
- **Alternatives considered**: esconder o anel por CSS — deixaria o cálculo e o `role="progressbar"`
  no leitor de tela (contra FR-001 e o edge case de leitor de tela).

## R2 — Cards da cidade e do dia sem "feitas" e barra

- **Decision**: saem o `.nb-count` e o `.nb-bar` de `CityCard` e `DayCard`; `ProgressBar.tsx` (só
  usado por um teste) é apagado. O CSS `.progress*`, `.ring*`, `.nb-count` e `.nb-bar` sai.
- **Rationale**: FR-002 e FR-005 (constituição III).
- **Alternatives considered**: manter `ProgressBar` "para depois" — código morto.

## R3 — Contagens de itens (Q1 = B)

- **Decision**:
  - `DayCard` e a capa do dia: sai o "N paradas"; o chip do tipo do dia fica.
  - `AreaLine` (dia): "Opções", com o mesmo link.
  - `Nearby`: abas "Comer", "Lojas", "Curiosidades", com os mesmos links.
  - `NeighborhoodCard`: a linha de chips "Comer N · Doces N · Lojas N · Locações N" sai inteira.
    Foto, data, nome e frase ficam.
  - `DayAlerts` (faixa): "Ver todos", com o mesmo link e a mesma condição (mais de um aviso).
- **Rationale**: só o número sai; o rótulo e o atalho ficam (FR-004).
- **Alternatives considered**: manter os chips do bairro sem número ("Comer · Lojas") — viraria uma
  informação nova ("tem comida aqui") que o pedido não trouxe; o card já leva à página do grupo.

## R4 — "N avisos" da lista de avisos

- **Decision**: o resumo recolhido da lista de avisos ("1 aviso", "3 avisos", seção Dicas do dia)
  passa a "Avisos do dia".
- **Rationale**: é contagem de itens, como "Ver todos (3)", e o pedido é "tudo que for referente a
  contagem". Não estava na tabela da spec; entra pela FR-004 e fica registrado aqui.
- **Alternatives considered**: manter — deixaria uma contagem na tela, contra SC-001a.

## R5 — O que sai do domínio

- **Decision**:
  - `trip-view.ts`: saem `Progress`, `progressOf`, `sumProgress`, `tripProgress`, e os campos
    `TripDayView.progress`, `DestinationView.progress` e `activityCount`.
  - `notebook.ts`: saem `TripCover.progress`, `CityCard.progress`, `DayCard.progress`,
    `DayCard.stops` e `NeighborhoodCard.counts`.
  - `full-itinerary.ts`: sai `dayProgress` (sem uso no app). `trackable` fica (define quem tem check).
  - `daySections().count` fica: não é mostrado, só decide se a seção existe.
  - `trackable` em cada atividade e `activityMarks` ficam: são o check.
- **Rationale**: FR-005 — cálculo exibido que fica sem uso sai; o que é salvo não muda.
- **Alternatives considered**: deixar os cálculos no domínio — código e testes que ninguém usa.

## R6 — Testes

- **Decision**: os testes de progresso (anel, barra, `tripProgress`, `dayProgress`, `d.stops`) saem;
  os de tela trocam a expectativa ("Opções" em vez de "Opções (8)" etc.). Um e2e novo nos projetos
  `mobile-360` e `mobile-402` varre Início, cidade, dia, grupo e atração procurando "%", "feitas",
  "paradas", `role="progressbar"` e `/\(\d+\)/`, e marca uma parada, recarrega e confere a marca.
- **Rationale**: SC-001, SC-001a, SC-002 e FR-006.
- **Alternatives considered**: só testes de componente — não pegariam um número esquecido em outra
  tela.
