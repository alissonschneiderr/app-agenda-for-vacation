# Data Model: Sem contagens nem percentuais de progresso

Nenhum dado salvo muda. Só modelos de tela perdem campos.

## Salvo no aparelho (sem mudança)

| Entidade | Campos | Observação |
|---|---|---|
| Marca de feito (`activityMarks[key]`) | `state: 'done' \| 'skipped'`, `at` | Mesmo formato; o check e o "Feito / Pular" continuam lendo e gravando aqui. |

## Modelos de tela (campos que saem)

| Modelo | Arquivo | Sai | Fica |
|---|---|---|---|
| `Progress` | `src/domain/trip-view.ts` | o tipo inteiro | — |
| `TripDayView` | `src/domain/trip-view.ts` | `progress` | atividades com `trackable` e `mark` |
| `DestinationView` | `src/domain/trip-view.ts` | `progress`, `activityCount` | o resto |
| `TripCover` | `src/domain/notebook.ts` | `progress` | fase, número do dia |
| `CityCard` | `src/domain/notebook.ts` | `progress` | `nights`, `roadmapDays`, datas, foto, frase |
| `DayCard` | `src/domain/notebook.ts` | `progress`, `stops` | tipo, título, resumo, foto |
| `NeighborhoodCard` | `src/domain/notebook.ts` | `counts` | data, área, nome, frase, foto, `hasNotes` |
| `DaySection` | `src/domain/notebook.ts` | — | `count` fica (não é mostrado; decide se a seção existe) |

## Funções que saem

`progressOf`, `sumProgress`, `tripProgress` (`trip-view.ts`) e `dayProgress` (`full-itinerary.ts`).

## Regras

- Marcar e desmarcar continuam iguais (`toggleDone`, `markActivity`, `unmarkActivity`).
- Atividade `free` e deslocamento continuam sem check (`trackable = false`).
