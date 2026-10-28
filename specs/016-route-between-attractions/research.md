# Research: Rota entre dois lugares do roteiro

Sem NEEDS CLARIFICATION: Q1 = C e Q2 = B fecharam o escopo. As decisões abaixo saem do código e do
conteúdo atual (`dist/data/content.json`).

## R1 — A lista é uma tela do app (rota de hash), não um pop-up

- **Decision**: "Rota até…" é um link para `#/rota/<data>/<chave>`, onde `<chave>` é a chave do passo
  ou o id do lugar — o mesmo par que "Motorista" usa (`#/motorista/<data>/<chave>`, `driverTarget`).
  "Ver outros dias" e "Inverter" são filtros na query (`?outros=1`, `?inv=1`), como `?g=` em "Por
  perto". Fechar = "Voltar" do cabeçalho (`history.back()`).
- **Rationale**: o botão voltar do celular fecha a lista sem lógica extra; funciona offline; é o padrão
  do app (Motorista, Por perto); fácil de testar por URL.
- **Alternatives considered**: `<dialog>` modal — o voltar do Android sairia da página da atração, e o
  `showModal` não existe no jsdom dos testes; folha deslizante — mais CSS e foco preso à mão.

## R2 — O local de cada lugar é o mesmo do "Abrir no mapa"

- **Decision**: o texto de busca do link de mapa do roteiro (`mapsQuery(mapsUrls[0].url)`, todos os
  187 links são `maps/search/?api=1&query=…`). Passo sem lugar com mapa, mas com ponto do guia
  (`location`): `lat,lng`, como o "Como chegar" (`DirectionsButton`). Sem nenhum dos dois: o lugar não
  tem o botão e não entra na lista.
- **Rationale**: FR-003 e "nunca inventar dados": nada de geocodificação nem endereço deduzido.
- **Números de hoje**: 146 passos com check; 141 com local (74 pelo link do lugar, 67 pelo ponto); 5
  sem local ("Compras no SoHo" e outros passos de compras genéricos de NY), que ficam sem o botão.
  310 lugares do roteiro; 187 com link de mapa entram.

## R3 — Link da rota

- **Decision**: `https://www.google.com/maps/dir/?api=1&origin=<origem>&destination=<destino>`, com
  `encodeURIComponent`; sem `travelmode` (FR-005). Abre em nova aba (`target="_blank" rel="noopener"`),
  como os outros links de mapa; no celular o sistema abre o app do Google Maps.
- **Rationale**: é a URL documentada de rotas do Google Maps ("Maps URLs"), já usada pelo app em
  `directionsUrl`.
- **Alternatives considered**: o formato `maps/dir/A/B` dos links do roteiro — não documentado como
  API estável.

## R4 — O que entra na lista e em que ordem

- **Decision** (`routeSpots`, novo em `src/domain/route.ts`):
  - **Do dia** (Q1 = C): "Paradas" — passos com check e com local, em ordem do roteiro, com o horário
    (`timeLabel` ou `start`); depois "Restaurantes e Cafés", "Brechós e Lojas", "Curiosidades" — os
    lugares do dia com link de mapa, na ordem de `dayPlaceGroups` (mesmos nomes das seções do dia).
  - **Outros dias** (`?outros=1`): os mesmos blocos para cada outro dia da cidade, sob o título DD/MM e
    o dia da semana; os dias de troca de cidade entram na cidade dona do roteiro do dia (regra da
    feature 013, `owner`).
  - Sem o lugar de origem e sem repetidos: a chave de repetição é o texto do local (dois passos no
    mesmo parque aparecem uma vez — fica o primeiro).
- **Rationale**: FR-002, FR-002a; usa os agrupamentos que o casal já conhece.

## R5 — Onde o botão aparece

- **Decision**:
  - página da atração (`StepDetail`), na linha de "Abrir no mapa" / "Como chegar" / "Motorista";
  - detalhe do lugar (`PlaceCard` em `#/perto/<data>/<área>/<id>`), ao lado de "Abrir no mapa";
  - cards de restaurantes, lojas e curiosidades do dia (`DayPlaceCard`), ao lado do link "Abrir no
    mapa" (mesmo estilo `nb-link above-link`, para o toque não abrir o card).
  - Só aparece com local conhecido e com pelo menos outro lugar na cidade (FR-001).
- **Rationale**: Q2 = B — todos os lugares que têm "Abrir no mapa".

## R6 — Sem internet

- **Decision**: a tela da lista abre offline (é do app). Sem internet, cada opção vira botão que mostra
  "A rota precisa de internet. De: <origem>. Até: <destino>." (`role="alert"`), como `LinkButtons` faz
  com `useOnline`.
- **Rationale**: FR-006; a delegação genérica de `offline-links.ts` mostraria só "Sem internet agora",
  sem os endereços.

## R7 — Testes

- **Decision**: unit de `routeSpots`/`routeUrl` com o conteúdo real (dia 01/11, 08/11, 19/11 e dia de
  troca 07/11); componentes da tela da rota (lista, inverter, outros dias, offline) e dos botões; e2e
  `tests/e2e/us-mobile-route.spec.ts` nos projetos `mobile-360` e `mobile-402` (abrir, escolher,
  conferir o `href`, sem rolagem lateral, offline).
