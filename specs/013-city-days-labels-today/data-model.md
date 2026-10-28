# Data model — feature 013

## meta.json (cada cidade): campo novo

| Campo | Tipo | Regra |
|---|---|---|
| `notNeighborhoods` | `string[]` (opcional) | nomes **exatos** de grupos do roteiro ("### 📍 …") que não são bairro; cada nome MUST existir em algum dia do roteiro (erro de build senão) |

Os valores estão em `research.md` R1. O campo segue para `FullItinerary.notNeighborhoods` no
conteúdo gerado.

## Regras de domínio (`src/domain/notebook.ts`, `src/domain/trip.ts`)

- `isNeighborhood(area, notNeighborhoods)`: `area.kind === 'bairro'`, nome fora de
  `notNeighborhoods` e não é tempo livre (`/^(manhã|tarde|noite) livre|tempo livre/i`).
- `neighborhoods(content, state, cityId)`: grupos com `isNeighborhood`, em todos os dias da cidade,
  **inclusive** os de viagem com grupos (R3).
- `daySections(...).bairros`: contagem com a mesma regra, então o menu e a lista nunca divergem.
- `formatDayMonth("2026-11-19")` = `"19/11"`.
- `formatWeekday("2026-11-19")` = `"Quinta-feira"`.
- `deviceToday(now)` = data local do aparelho (`AAAA-MM-DD`).
- `todayInCity(dates, today)` = `today` se estiver entre a primeira e a última data da cidade,
  inclusive; senão `undefined`.

## Sem mudança

- `DayArea.kind`.
- Os grupos de "Restaurantes e Cafés", "Brechós e Lojas" e "Curiosidades" (Q2 = A).
- A ordem dos dias.
- O estado do aparelho.
