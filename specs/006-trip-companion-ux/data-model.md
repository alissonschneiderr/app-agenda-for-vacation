# Data Model: Guia de bolso da viagem

Reaproveita o modelo das features 003–005. Abaixo, só o que muda ou é derivado.

## Conteúdo (build)

### TripContent (`content/trip.json`)

| Campo | Tipo | Regra |
|---|---|---|
| dayKinds | `Record<DateStr, 'walk' \| 'beach' \| 'park' \| 'transit'>` | toda data da viagem tem tipo; o build falha se faltar |

### FullDay (feature 005, novos campos)

| Campo | Tipo | Origem |
|---|---|---|
| alerts | `{ id: 'al:<data>:<n>'; html: string }[]` | blocos antes do primeiro `###` do dia (exceto resumo, mapa e saída) |

### FullItinerary (novo campo)

| Campo | Tipo | Origem |
|---|---|---|
| departures | `Record<DateStr, { id: 'tr:<data>:<n>'; label: string; text: string; block: 'before' \| 'trip' }[]>` | itens da seção "Partida" do doc |

### DocPlace / DayArea (novo campo)

| Campo | Tipo | Regra |
|---|---|---|
| photo | `Photo?` (src, alt, author, license, licenseUrl, sourceUrl) | da Commons via `doc-photos.json` ou do ponto do guia ligado; nunca de outro lugar |

### doc-photos.json (`content/full/nova-york/`)

`Record<nome no doc, 'File:…' | 'wiki:…'>`. Créditos gerados em `content/full/nova-york/photo-credits.json`.

## Derivado (domínio `now.ts`, sem persistência)

| Nome | Definição |
|---|---|
| `nextStep(day, state, now)` | primeiro passo marcável pendente cujo fim não passou; senão, o primeiro pendente; senão, `null` (dia concluído) |
| `upcoming(day, state, now, n=3)` | os n passos marcáveis pendentes depois do próximo |
| `nowIndex(day, now)` | posição da marca "agora" na linha do tempo (só no dia de hoje) |
| `currentArea(day, state, now)` | área do próximo passo; sem passo, a última área do dia |
| `howToGet(day, step)` | instrução do roteiro (R3) |
| `dayKind(content, date)` | `trip.dayKinds[date]` |
| `tripPhase(content, now)` | `'before' \| 'during' \| 'after'` |

## Preferências do aparelho (`localStorage` `ctha:prefs`)

`{ readAlerts: string[]; highContrast: boolean }`. Lido e gravado com `try/catch`; sem armazenamento,
o app usa os valores padrão (`[]`, `false`).

## Estado do usuário

`UserState` v2 inalterado. Chaves novas em `activityMarks`: `tr:<data>:<n>` (itens de transição). Os
estados possíveis continuam `done | skipped`; desmarcar remove a chave.
