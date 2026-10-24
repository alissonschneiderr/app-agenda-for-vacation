# Data Model: Redesign da UI como guia de viagem

Nenhuma entidade persistida nova. Só um campo de conteúdo novo (`City.heroPointId`) e tipos de
**visão** derivados em memória por `src/domain/trip-view.ts`.

## Conteúdo (alteração)

| Entidade | Campo novo | Regras |
|---|---|---|
| City | `heroPointId: string` | ponto existente, da mesma cidade, com ≥ 1 foto (validado no build) |

## Dados do usuário (sem mudança de formato)

`UserState` v2 (feature 002). `activityMarks` passa a guardar também itens de roteiro:

| Origem da atividade | Chave em `activityMarks` | Exemplo |
|---|---|---|
| Roteiro FULL (NY) | `Activity.id` | `ny-2026-11-02-09` |
| Item de roteiro (sugerido ou do casal) | `it:<itineraryId>:<pointId>` | `it:3f1c…:orl-magic-kingdom` |

Estados: `done`, `skipped` (só FULL, via detalhes) ou ausente (= pendente).

**Transições na lista** (`toggleDone`): ausente → `done`; `skipped` → `done`; `done` → ausente.
**Limpeza**: `removePoint(itinerary, pointId)` remove `it:<id>:<pointId>`; `deleteItinerary(id)`
remove todas as `it:<id>:*`.

## Visões (derivadas)

### DestinationView

| Campo | Origem |
|---|---|
| cityId, name | `City` |
| hero | `Point(heroPointId).photos[0]` |
| period | primeiro e último dia do trecho da cidade (`TripLeg.arrive` … `depart`) |
| days | `TripDayView[]` das datas do trecho, incluindo dias de locomoção de chegada/saída |
| commitments | `FullItinerary.commitments` da cidade |
| progress | soma dos `days[].progress` |

### TripDayView

| Campo | Origem / regra |
|---|---|
| date, weekday, label | `formatDayLabel`, `dayInfo` |
| index, count | posição "Dia N de M" dentro do destino |
| kind | `sightseeing` \| `travel` (origem → destino) |
| groups | `{ title, source: 'full' \| 'itinerary', itineraryId?, notes?, activities }[]`: o dia FULL (se houver) primeiro, depois os roteiros do usuário com a mesma data, na ordem de criação |
| progress | `{ done, total }` sobre atividades com `trackable = true` |
| hasTimes | `true` se alguma atividade tem `start` |

### DayActivityView

| Campo | FULL | Item de roteiro |
|---|---|---|
| key | `Activity.id` | `it:<itineraryId>:<pointId>` |
| title | `Activity.title` | `Point.name` (ou `pointName` salvo se o ponto sumiu) |
| category | de `Activity.type` (+ `meal`/`shop`/`screen`) | de `Point.categoryId` |
| start, durationMin | do FULL | ausentes (não inventar) |
| place / address | `Activity.place` | `Point.address`, `Point.location` |
| photo | `Point(pointId).photos` se houver `pointId` | `Point.photos` |
| trackable | `false` para `transit` | `true` |
| unavailable | — | `true` se o ponto não existe mais |
| source | referência ao `Activity` original | referência ao `Point` e às `notes` do sugerido |

**Categorias exibidas** (rótulo + ícone): Atração, Restaurante, Compras, Série/filme, Transporte,
Compromisso, Descanso/hotel; para pontos do guia, a categoria do guia (Museu, Parque temático,
Praia…).

### Progresso

`progress(day) = { done: nº de trackable com mark 'done', total: nº de trackable }`;
cidade = soma dos dias da cidade; viagem = soma das três cidades. Atividades `skipped` contam no
total e não em `done`.
