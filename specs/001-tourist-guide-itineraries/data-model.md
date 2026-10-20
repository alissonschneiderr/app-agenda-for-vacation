# Data Model: Guia de Pontos Turísticos e Roteiros Salvos

Dois grupos de dados, com ciclos de vida diferentes:

- **Conteúdo** (somente leitura no app, versionado no repositório): City, TripLeg, Category,
  Point, Photo, SuggestedItinerary. Formato: [contracts/content-schema.md](./contracts/content-schema.md).
- **Dados do usuário** (só no aparelho): Favorite, Itinerary, ItineraryItem. Formato:
  [contracts/user-storage.md](./contracts/user-storage.md).

## Conteúdo

### City

| Campo | Tipo | Regras |
|---|---|---|
| id | `"nova-york" \| "orlando" \| "miami"` | único |
| name | string | "Nova York", "Orlando", "Miami" |
| timeZone | string | `America/New_York` para as três |
| center | {lat, lng} | centro inicial do mapa |

### TripLeg (Trecho da Viagem)

| Campo | Tipo | Regras |
|---|---|---|
| cityId | City.id | |
| arrive | data `YYYY-MM-DD` | |
| depart | data `YYYY-MM-DD` | `depart > arrive` |

Trechos: NY 2026-10-31→2026-11-07; Orlando 2026-11-07→2026-11-18; Miami 2026-11-18→2026-11-21.

**Regras derivadas** (`domain/trip.ts`):
- **Dia de locomoção**: data que é `depart` de um trecho (07/11, 18/11, 21/11). Origem = cidade do
  trecho que sai; destino = cidade do trecho seguinte (21/11 não tem destino; app mostra Miami).
- **Dia de passeio**: datas `arrive ≤ d < depart` que não são dia de locomoção — 19 dias.
- **Cidade do dia** (FR-019): dia de passeio → cidade do trecho; locomoção → destino (21/11 →
  Miami); fora do período → Nova York. "Hoje" é calculado em `America/New_York`.

### Category

| Campo | Tipo | Regras |
|---|---|---|
| id | string | ex.: `museu`, `parque-tematico`, `parque`, `monumento`, `mirante`, `compras`, `praia`, `bairro` |
| name | string | rótulo em português |

### Point (Ponto Turístico)

| Campo | Tipo | Regras |
|---|---|---|
| id | string slug | único global, ex.: `ny-central-park` |
| cityId | City.id | obrigatório |
| categoryId | Category.id | obrigatório |
| name | string | nome original (FR-007) |
| summary | string | 1 frase, para a lista |
| description | string | português, 1–4 parágrafos |
| address | string | original |
| location | {lat, lng} | dentro da área da cidade |
| openingHours | WeeklyHours | ver abaixo; pode ser "24h" ou "consultar" |
| price | string | texto livre, ex.: "US$ 30 / gratuito às sextas 17h–19h" |
| officialUrl | url \| null | |
| photos | Photo[] | **≥ 1** (FR-003, SC-008) |
| status | `"active" \| "temporarily-closed"` | |
| verifiedAt | data `YYYY-MM-DD` | obrigatória |

**WeeklyHours**: `{ mon..sun: [ {open: "HH:MM", close: "HH:MM"} ] , exceptions?: { "YYYY-MM-DD": [...] | "closed" } }` ou
`"24h"` ou `"see-official"`. `close` pode passar da meia-noite (`close < open`).

**Estado "aberto agora"** (`domain/opening-hours.ts`): `open` | `closed` | `unknown`
(`see-official`), calculado com a hora atual em `City.timeZone`.

### Photo

| Campo | Tipo | Regras |
|---|---|---|
| src | caminho | `photos/<pointId>-<n>.webp` |
| alt | string | descrição em português |
| author | string | da Commons |
| license | string | ex.: "CC BY-SA 4.0" |
| licenseUrl | url | |
| sourceUrl | url | página do arquivo na Commons |

### SuggestedItinerary

| Campo | Tipo | Regras |
|---|---|---|
| id | string | ex.: `sug-2026-11-08` |
| date | data | deve ser **dia de passeio** |
| title | string | ex.: "Magic Kingdom" |
| notes | string? | dicas do dia |
| pointIds | Point.id[] | ≥ 1, sem repetição, todos existentes (FR-026) |

Regras globais de conteúdo (validadas no build, `tests/content/`): exatamente 19 sugeridos, um por
dia de passeio, nenhum em dia de locomoção (FR-023); os 7 parques de FR-024 aparecem, cada um em um
dia diferente de Orlando; todo `pointIds[]` existe e é da cidade do dia.

## Dados do usuário

### Favorite

| Campo | Tipo | Regras |
|---|---|---|
| pointId | string | único na lista |
| pointName | string | snapshot para exibir se o ponto sumir |
| savedAt | ISO datetime | |

### Itinerary (Roteiro)

| Campo | Tipo | Regras |
|---|---|---|
| id | string (uuid) | |
| name | string | 1–60 caracteres, não vazio após trim |
| date | data \| null | se definida, deve estar entre 2026-10-31 e 2026-11-21 |
| origin | `"suggested" \| "user"` | |
| sourceId | SuggestedItinerary.id \| null | só se `origin = suggested` |
| items | ItineraryItem[] | ordem = sequência |
| createdAt, updatedAt | ISO datetime | `updatedAt` muda a cada edição |

### ItineraryItem

| Campo | Tipo | Regras |
|---|---|---|
| pointId | string | **sem duplicatas no mesmo roteiro** (FR-010) |
| pointName | string | snapshot |

**Operações** (`domain/itineraries.ts`, todas puras e testadas): `create(name, date?)`, `rename`,
`setDate`, `delete` (UI confirma), `addPoint` (erro `DUPLICATE`; aviso `OTHER_CITY` quando a cidade
do ponto não é a do dia nem origem/destino em locomoção — FR-022), `removePoint`, `moveUp`,
`moveDown`, `moveToTop`, `groupByDate` (cronológico; sem data por último — FR-021),
`seedSuggested(content, state)` (R10).

**Ponto indisponível**: `pointId` ausente do conteúdo atual → item/favorito exibido com
`pointName` e selo "indisponível"; pode ser removido.
