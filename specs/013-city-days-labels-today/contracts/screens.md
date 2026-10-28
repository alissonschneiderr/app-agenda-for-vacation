# Contrato de telas — feature 013

## Cidade (`#/cidade/<cidade>`)

- Cards em ordem crescente, como hoje.
- **Card do dia**:
  - chip "19/11" (antes "Dia 20");
  - eyebrow "Quinta-feira" (antes "quinta, 19/11");
  - título, resumo, progresso e foto sem mudança.
  - O `aria-label` do card continua "quinta, 19/11: …" (leitor de tela).
- **Ao abrir**: se hoje (data local do aparelho) está entre o primeiro e o último dia da cidade, a
  página já rola até o card de hoje, que fica como o primeiro visível logo abaixo do cabeçalho.
  Senão, a página começa no topo.

## Dia (`#/dia/<data>`)

- Cabeçalho: "01/11 · SoHo · Nolita…" (antes "Dia 2 · …").
- Capa: eyebrow "01/11" (antes "Dia 2") e chip "Domingo" (antes "dom, 01/11").
- "Bairros": só bairros de verdade. O item some do menu quando não há nenhum (dias de parque de
  Orlando, 19/11). Em 18/11 a seção mostra South Beach (Art Deco District), corrigindo a lista
  vazia.
- Linha do tempo: "Manhã livre" sem o alfinete de lugar. As paradas de parques, museus e outlets
  continuam como estão.
- Restaurantes, lojas e curiosidades: cabeçalhos de grupo sem mudança (Q2 = A).

## Página do grupo (`#/perto/<data>/<grupo>`)

- O selo "📍 Bairro" só aparece em bairros. Em Magic Kingdom, Central Park ou Sawgrass Mills a capa
  mostra só o nome.
