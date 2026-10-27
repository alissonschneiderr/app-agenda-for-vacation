# Data model — feature 012

Os tipos de conteúdo não mudam (`FullItinerary`, `FullDay`, `DayArea`, `DocPlace`, `ChecklistItem`,
`Tip`). Há duas regras novas no leitor e uma limpeza no estado.

## content/full/miami/meta.json

| Campo | Valor |
|---|---|
| `id` / `cityId` | `miami` |
| `title` | "Roteiro Miami — 18 a 20 de novembro" |
| `travelers` | "Casal" |
| `idPrefix` | `mia1` |
| `stepsUseAreaPoint` | `true` (passos dentro de uma região apontam para o ponto ligado) |
| `arrivalDay` | *(ausente: o 18/11 é um dia comum com a seção de chegada, R3)* |
| `departure` | *(ausente: a partida de 21/11 continua como está)* |
| `checklist`, `practicalTips`, `excluded` | `[]` (vêm do documento) |
| `updatedAt` | `2026-10-27` |

## Dias (esperado depois do build)

| Dia | Grupos (`areas`) | Paradas marcáveis | Lugares |
|---|---|---|---|
| 18/11 | South Beach (Art Deco District) | Lummus Park, Pôr do sol, Ocean Drive, Española Way | 4 food, 2 screen |
| 19/11 | Sawgrass Mills | Simon Guest Services, The Colonnade Outlets, Ala principal | 5 food, 5 shop (categorias) |
| 20/11 | Lummus Park e a praia de South Beach; Noite: Ocean Drive na sexta | Praia, Mais praia, Beachwalk, South Pointe Park | 6 food |

As contagens finais são conferidas pelo teste contra a cópia em `source/` (SC-001, SC-002).

## Chegada no dia (regra nova do leitor, R3)

`arrivals["2026-11-18"]`:
- `items`: os itens com horário da seção `### 🚆 Chegada e traslado`;
- `html`: o resto da seção (as 4 opções de traslado e o aviso do shuttle).

Regra: vale só num dia **sem** `arrivalDay`. Orlando não muda.

## Reservas (regra nova do leitor, R6)

Tabela `Data | Item | Situação` → `ChecklistItem { what: Item, note: Situação, forDate: Data | undefined }`.
São 6 itens, com estas datas de uso:

| Data de uso | Item |
|---|---|
| 18/11 | Havana 1957 |
| 19/11 | Simon VIP Club e apps das marcas |
| 19/11 | Horários dos shoppings |
| 20/11 | Joe's Stone Crab |
| 18/11 | Shuttle Brightline |
| — | Cota da Receita Federal e IOF |

## Estado do aparelho (R5)

Ao carregar: `itineraries = itineraries.filter(it => it.origin !== 'suggested' || contentIds.has(it.sourceId))`.
Os `seededIds` ficam, para não semear de novo se um sugerido voltar com o mesmo id.

## content/trip.json

`dayKinds["2026-11-19"] = "walk"`, `dayKinds["2026-11-20"] = "beach"` (R4).

## content/itineraries.json

Lista vazia (Q2 = B).
