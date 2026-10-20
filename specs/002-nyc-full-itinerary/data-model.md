# Data Model: Roteiro FULL de Nova York

Conteúdo (somente leitura no app) em `content/full/nova-york/` (`meta.json` + um arquivo por dia); formato completo em
[contracts/full-itinerary-content.md](./contracts/full-itinerary-content.md). Marcações do usuário
em [contracts/user-storage-v2.md](./contracts/user-storage-v2.md).

## Conteúdo

### FullItinerary

| Campo | Tipo | Regras |
|---|---|---|
| id | `"nova-york"` | um por cidade |
| cityId | City.id | |
| title | string | "Roteiro FULL de Nova York" |
| travelers | string | "Casal" |
| base | Place | hotel POD 51, 230 East 51st Street, New York, NY 10022 |
| arrival | { airport, time } | JFK, 2026-10-31 06:30 |
| commitments | Commitment[] | exatamente os 2 compromissos da spec |
| days | FullDay[] | **7**, datas 2026-10-31 a 2026-11-06, em ordem |
| checklist | ChecklistItem[] | |
| practicalTips | { topic, text }[] | transporte, pagamento, segurança, clima, gorjeta |
| excluded | { name, reason }[] | atrações não incluídas com justificativa |
| updatedAt | data | |

### Place

`{ name, address, location?: {lat,lng} }` — `location` obrigatório quando houver mapa/"Como chegar".

### Commitment

| Campo | Tipo | Regras |
|---|---|---|
| id | `"knicks-nets"` \| `"mj-musical"` | |
| date, time | data, HH:MM | 2026-11-02 19:30; 2026-11-04 19:00 |
| title, place | string, Place | Madison Square Garden (4 Penn Plaza); Neil Simon Theatre (250 W 52nd St) |
| arriveBy | HH:MM | ≤ time − 30 min (SC-003) |

### FullDay

| Campo | Tipo | Regras |
|---|---|---|
| date | data | |
| region | string | ex.: "Lower Manhattan e Brooklyn" |
| goal | string | objetivo do dia |
| events | string[] | impactos da data (Halloween, maratona, horário de verão) |
| activities | Activity[] | ordenadas; ver regras abaixo |
| returnToHotel | string | estratégia de retorno |
| alternatives | Alternative[] | ≥ 1 `rain` e ≥ 1 `tired` ou `closed` |

### Activity

| Campo | Tipo | Regras |
|---|---|---|
| id | string | estável, `ny-<data>-<nn>` |
| type | `attraction` \| `meal` \| `shopping` \| `screen` \| `transit` \| `rest` \| `commitment` \| `hotel` | |
| title | string | |
| start | HH:MM | ≥ 10:00 exceto 31/10 ou com `earlyReason` |
| durationMin | inteiro > 0 | fim = start + duração ≤ início da próxima |
| place | Place? | obrigatório exceto `transit` |
| description | string | |
| priority | `essential` \| `important` \| `optional` | `commitment` sempre `essential` |
| booking | { required: boolean, how?, price? } | se `required`, deve haver ChecklistItem |
| facts | Fact[] | horários/preços/funcionamento citados |
| pointId | Point.id? | liga ao guia da 001 |
| meal | Meal? | obrigatório se `type = meal` |
| shop | Shop? | obrigatório se `type = shopping` |
| screen | ScreenLocation[]? | obrigatório se `type = screen` |
| transit | Transit? | obrigatório se `type = transit` |
| earlyReason | string? | justificativa para começar antes das 10h |
| commitmentId | Commitment.id? | obrigatório se `type = commitment` |

### Fact (FR-021)

`{ text, status: 'confirmed', source: url, checkedAt: data }` ou `{ text, status: 'unconfirmed', note }`.

### Meal

`{ kind: 'breakfast' | 'lunch' | 'snack' | 'dinner', order: string, why: string, priceRange: string }`.
Regras: 1 de cada `kind` por dia; almoço inicia 12:00–14:00; lanche inicia 15:30–16:30; texto sem
termos proibidos (R5); deslocamento até ela ≤ 20 min.

### Shop

`{ kind: 'thrift' | 'vintage' | 'independent' | 'designer' | 'tech', why, justification? }`.
Regras: nome não pode ser B&H nem Tiffany; Apple Store exige `justification`.

### ScreenLocation

| Campo | Tipo | Regras |
|---|---|---|
| work | string | ex.: "Friends" |
| kind | `setting` \| `filming` \| `both` | ambientação, locação de filmagem ou ambos |
| access | `inside` \| `outside` | |
| association | string | o que acontece ali na obra |
| address | string | endereço real verificável |

Regra especial: *Todo Mundo Odeia o Chris* entra como `kind: setting` (ambientação: o Bed-Stuy da
infância de Chris Rock), com nota sobre onde a série foi de fato gravada (a confirmar com fonte na
implementação) — nenhum endereço é apresentado como cenário de filmagem sem fonte.

### Transit

`{ mode: 'walk' | 'subway' | 'bus' | 'taxi' | 'airtrain' | 'ferry', from, to, minutes, lines?, cost? }`.
Obrigatório entre atividades com endereços diferentes.

### Alternative

`{ when: 'rain' | 'tired' | 'closed', text }`.

### ChecklistItem

`{ what, forDate, deadline, link?, activityId? }` — todo `activity.booking.required` aparece aqui.

## Dados do usuário (v2)

`UserState.activityMarks: Record<Activity.id, { state: 'done' | 'skipped', at: ISO datetime }>`.

**Transições**: sem marca → `done` | `skipped`; `done` ↔ `skipped`; qualquer → sem marca (desfazer).
Marcas de IDs que não existem mais no conteúdo são ignoradas na exibição.

**Próxima atividade** (`domain/full-itinerary.ts`): no dia atual (NY), a primeira atividade sem
marca cujo fim ≥ agora; se nenhuma, a primeira sem marca; em outros dias, nenhuma.
