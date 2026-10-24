# Data Model: Roteiro de Nova York por bairros

Evolução do modelo da 004 (`src/content/types.ts`). Os campos novos são opcionais, então Orlando e
Miami não mudam.

## FullItinerary

Mantém `source`, `docHtml` (todas as seções `##` em HTML) e `dayNotes` (HTML por data; em 07/11, a
partida). `checklist` vem da tabela "O que comprar antes", com os `checklistOverrides` do meta
aplicados (Q1).

## FullDay (novos campos)

| Campo | Tipo | Origem |
|---|---|---|
| mapUrl | string? | link "🗺️ Mapa do dia" |
| areas | `DayArea[]` | um por `###` do dia, na ordem |

`goal` = resumo do dia. `dayNotes[data]` = o que fica antes do primeiro `###` (legenda de preços,
avisos de maratona e museus), exceto o resumo, o mapa do dia e a linha de saída.

## DayArea (novo)

| Campo | Tipo | Regra |
|---|---|---|
| id | slug | único no dia |
| kind | `'bairro' \| 'chegada' \| 'noite' \| 'ideias'` | pelo ícone do `###` |
| name | string | título sem o ícone |
| photoUrls | `{label,url}[]` | "📷 ver fotos…" do bairro |
| intro | string? | parágrafo do bairro |
| activityIds | string[] | atividades da área, na ordem |
| placeIds | string[] | lugares da área (lojas, comida, locações e atrações) |
| notesHtml | string? | avisos e itens sem estrutura ("Nenhuma cafeteria…", "Plano B", "Como chegar"…) |

## Activity (mudanças)

- `id`: `ny3-AAAA-MM-DD-NN`.
- `type`: ganha `'free'` (pausa, tempo, tarde ou jantar livre), sem Feito/Pendente e fora do
  progresso.
- `areaId`: a área onde está. As linhas de saída do hotel ficam na área `null` (início do dia), e as
  de volta ao hotel e deslocamento ficam na área anterior.
- `timeLabel`: horário como no doc ("11h15 às 12h30", "~22h30", "até ~17h30").
- `how`: texto que segue o rótulo, nas linhas de logística.
- `booking.required` = item com 🎟️, com `how` = o texto em itálico do item.

## DocPlace (mudanças)

| Campo | Tipo | Nota |
|---|---|---|
| kind | `food \| shop \| screen \| attraction` | inalterado |
| level | `'☕' \| '🏆' \| '🍰'`? | comida |
| photoUrls | `{label,url}[]` | links 📷 |
| mapsUrls | `{label,url}[]` | links "Mapa" |
| price | string? | 💵… |
| queue | string? | texto depois do preço |
| fields | `{label,text}[]` | texto principal (label vazio) e campos rotulados ("Como chegar", "Antecedência"…) |
| works / photoTip | string? | locações |
| access | string? | 🎟️ das atrações |

## ChecklistItem

`{ what, forDate, when, note, activityId? }`, tirado das colunas Data · Atração · Situação. `when` é
o horário escrito na célula da atração ("tour das 16h15" após Q1).

## Meta (novo campo)

`checklistOverrides: { find: string; replace: string }[]`. O texto exato da célula do doc e o texto
que vale no app.
