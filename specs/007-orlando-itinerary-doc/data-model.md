# Data Model: Roteiro de Orlando (feature 007)

Parte dos tipos de `src/content/types.ts` das features 005 e 006. Abaixo só o que é **novo** ou
**muda**; o resto continua igual.

## Arquivos de conteúdo

```text
content/full/orlando/
├── roteiro.md        # exportação Markdown do doc, sem edição (cópia de 24/10/2026, rev. 26)
├── meta.json         # ver FullItineraryMeta
├── point-links.json  # nome no doc → id do ponto do guia (parques, Disney Springs, CityWalk, KSC, ICON Park, outlets, Mall at Millenia)
├── doc-photos.json   # nome no doc → "File:…" ou "wiki:…" (Q2)
└── photo-credits.json  # gerado por npm run photos -- --doc
content/trip.json     # dayKinds de Orlando corrigidos (FR-018)
public/photos/doc/orlando/*.webp
```

## FullItineraryMeta (`meta.json`)

| Campo | Tipo | Regra |
|---|---|---|
| `id`, `cityId` | `'orlando'` | |
| `title`, `travelers`, `updatedAt` | texto / data | como em NY |
| `idPrefix` | `string` **novo** | `^[a-z]+[0-9]*$`; NY = `ny3` (padrão quando ausente), Orlando = `orl1` |
| `base` | `Place` **agora opcional** | ausente em Orlando: o doc não diz o hotel |
| `arrival` | `{ airport, date, time? }` | `time` **agora opcional**; Orlando = `{ airport: "MCO", date: "2026-11-07" }` |
| `arrivalDay` | `DateStr` **novo, opcional** | seção `Dia N` dessa data vira `arrivals[date]`, não `FullDay` |
| `departure` | **novo, opcional** | `{ date, before: DepItem[], trip: DepItem[] }`; `DepItem = { label, quote? , source? }`; `quote` é trecho literal da seção Partida do doc; sem `quote`, `source` é obrigatório |
| `commitments` | `[]` em Orlando | |
| `checklistOverrides` | opcional, como em NY | não usado em Orlando |
| `practicalTips`, `excluded` | `[]` | |

## FullItinerary (saída do build): campos novos

| Campo | Tipo | Origem |
|---|---|---|
| `arrivals` | `Record<DateStr, { items: DepartureItem[]; html?: string }>` | `arrivalDay` (R5) |
| `departures[date]` | igual hoje | de `meta.departure` quando declarado; senão, da lista da seção Partida (NY) |
| `dayNotes[date]` | igual hoje | **não** gravado para a data de `meta.departure` |
| `checklist[].id` | `ck:<cidade>:<n>` **novo** | ordem da tabela |
| `checklist[].deadline` | já existia | data de "Quando reservar" (06/11, 07/11) |

## DepartureItem

`block` ganha `'arrival'`. Ids: `tr:<data>:<n>` (partida, NY e Orlando) e `tr:<data>:c<n>`
(chegada). Os itens são marcáveis, ficam fora do progresso e podem ser desfeitos (feature 006).

## Activity: mudanças

| Campo | Regra |
|---|---|
| `id` | `<idPrefix>-AAAA-MM-DD-NN`, em ordem no dia; Orlando `orl1-2026-11-08-01`… |
| `type` | `'free'` também para títulos que começam com "Almoço"; `'shopping'` para o parágrafo "🛍️ Compras (… ~14h às 18h)" |
| `optional` | `true` quando o item traz "(opcional" |
| `pointId` | o do lugar; senão, o da região ligada ao guia (R8) |
| `timeLabel` | como no doc, com "~", "–" e "ou" |

## DocPlace: mudanças

`kind: 'attraction'` passa a existir também para atrações sem sublista (Orlando). Campos novos,
todos opcionais e copiados do doc sem reescrita:

| Campo | Exemplo |
|---|---|
| `queue` (já existia, usado em comida em NY) | "fila ~5 min", "~10 min com Single Pass (ou ~65 min na fila normal)" |
| `access` (já existia) | "Multi Pass", "fila normal" (vários segmentos juntados com " · ") |
| `land` **novo** | "Adventureland", "Super Nintendo World; entre na fila antes das 19h" |

Para comida e mercados de Orlando: `fields[0].text` = conteúdo do parêntese final; sem `level`,
`price` ou `queue`.

## DayArea: mudanças

- `### 🏨 …` e `### 🚗 …` **não** são áreas. 🏨 vira atividade `transit`, e 🚗 vira `transfer` da
  área anterior.
- `### 🌙 Noite: …` sem horário vira área `kind: 'noite'` só com `notesHtml` e `photoUrls`, sem
  atividade.

## DayView (`src/domain/trip-view.ts`)

- `dayView`: com `FullDay` na data, os roteiros com `origin: 'suggested'` dessa data saem de
  `groups`. Ficam no estado do casal, mas não aparecem nem contam no progresso.
- `DayActivityView` ganha `queue?`, `land?` e `access?`, lidos do primeiro lugar do passo.

## Tipo de dia (`content/trip.json`)

| Data | Antes | Depois |
|---|---|---|
| 08/11 | walk | park |
| 09, 10, 12/11 | park | park |
| 11/11 | walk | walk |
| 13/11 | park | walk |
| 14/11 | walk | park |
| 15, 17/11 | park | park |
| 16/11 | park | walk |
| 07, 18/11 | transit | transit |

## Estado do usuário

Sem mudança de formato. As marcas novas são:
- `orl1-…` para os passos;
- `tr:2026-11-07:c<n>` para a chegada;
- `tr:2026-11-18:<n>` para a partida;
- `ck:orlando:<n>` para as reservas feitas.

As marcas antigas (`it:…` dos sugeridos de Orlando) ficam guardadas e sem efeito.
