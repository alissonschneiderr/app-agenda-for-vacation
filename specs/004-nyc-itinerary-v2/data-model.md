# Data Model: Roteiro de Nova York v2

Extensão compatível do `FullItinerary` (feature 002). Campos novos são opcionais, então Orlando/Miami e
o código da 003 continuam funcionando.

## FullItinerary (campos novos)

| Campo | Tipo | Origem |
|---|---|---|
| source | `{ title, author, date }` | cabeçalho do documento ("Oct 20, 2026 · @Alisson") |
| docHtml | `{ id, title, html }[]` | todas as seções do documento, em ordem, em HTML (FR-015) |
| dayNotes | `Record<data, { html }>` | notas do dia (dicas do desfile, destaques, segurança, opcionais) e, para 07/11, a seção "Partida" |

Commitments (meta.json): `knicks-nets` 2026-11-02 19:30, `arriveBy 18:50`; `mj-musical` **2026-11-05**
19:00, `arriveBy 18:30`.

## Activity (campos novos)

| Campo | Tipo | Regra |
|---|---|---|
| id | `nyv2-AAAA-MM-DD-NN` | novo prefixo (FR-004) |
| how | string? | coluna "Como ir" da tabela (texto do documento) |
| optional | boolean? | linha "Opcional: …" |
| timeLabel | string? | horário como está no documento (preserva "~") |
| inferredDuration | boolean? | duração deduzida (não exibir) |
| placeIds | `string[]` | lugares do dia ligados à linha (R5) |

## Place

| Campo | Tipo | Notas |
|---|---|---|
| id | slug | único no dia |
| kind | `food` \| `shop` \| `screen` \| `attraction` | seção de origem |
| name | string | título do bloco |
| address | string? | entre parênteses, quando houver |
| mapsUrls | `{ label, url }[]` | todos os links do bloco (FR-012) |
| level | `'🏆' \| '⭐' \| '📍' \| string`? | comida (e "🏆 / ⭐") |
| fields | `{ label, text }[]` | os campos do bloco na ordem do documento ("Nível", "Por que é icônico", "Por que neste dia/horário", "O que pedir", "Preço e fila"; "Bairro", "Estilo", "Faixa de preço", "Por que vale"; …) |
| works | string? | locações: texto após o "—" (obras e cena) |
| photoTip | string? | locações: texto após "Foto:" |
| access | string? | atrações: "grátis", "ingresso com horário"… |
| pointId | string? | via `point-links.json` (fotos do guia) |

`FullDay` ganha `places: Place[]` (todos os lugares do dia, inclusive os não ligados a linhas) e
`summary` (parágrafo de abertura do dia).

## Listas extras

"Não saia de NY sem provar" e "Brechós e marcas autorais extras" ficam só no documento (`docHtml`),
com atalhos na tela Viagem; não viram dados estruturados porque nada no app as filtra ou marca (YAGNI).

## ChecklistItem

`deadline` e `forDate` passam a ser opcionais (o documento não define prazos; não inventar); ganha
`when` e `note` com o texto das colunas da tabela de ingressos.
