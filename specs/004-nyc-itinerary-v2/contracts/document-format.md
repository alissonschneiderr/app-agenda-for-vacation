# Contract: Formato do `roteiro.md`

> **Substituído pela feature 005:** o doc do casal passou a ser organizado por bairros; ver
> [`specs/005-nyc-itinerary-doc/contracts/document-format.md`](../../005-nyc-itinerary-doc/contracts/document-format.md).

O arquivo é o documento do casal. O parser reconhece os blocos abaixo; qualquer outro conteúdo é
preservado como HTML (seções gerais ou notas do dia), nunca descartado.

| Bloco | Forma no documento | Vira |
|---|---|---|
| Título | `# Roteiro Nova York — 31/10 a 06/11` | `title` |
| Autoria | linha `Oct 20, 2026 · @Alisson` | `source` |
| Dia | `## dd/mm (dia da semana) — título` | `FullDay` (`region` = título) |
| Partida | `## Partida — 07/11 …` | `dayNotes['2026-11-07']` + seção geral |
| Resumo do dia | 1º parágrafo após o `##` do dia | `FullDay.summary` / `goal` |
| Agenda | 1ª tabela do dia com cabeçalho `Horário \| Programa \| Como ir` | `Activity[]` |
| Onde comer | `### Onde comer` + blocos `**Nome** emoji · [links]` + lista `- **Campo:** texto` | `Place(kind: food)` |
| Locações | `### Locações…` + itens `- **Nome** (end.) · [Maps] — obras. Foto: dica` | `Place(kind: screen)` |
| Compras | `### Compras do dia` + blocos como em "Onde comer" | `Place(kind: shop)` |
| Atrações | `### Atrações do dia` + itens `- **Nome** — acesso. [Maps]` | `Place(kind: attraction)` |
| Outros parágrafos/listas do dia | dicas, destaques, segurança, opcionais | `dayNotes[data]` |
| Seções não-dia | `## Antes de tudo…`, `## Lugares de comida…`, `## Não saia de NY…`, `## Brechós…`, `## Dicas práticas…`, `## Conferência final` | `docHtml[]` (na ordem) |
| Tabelas extras | "Não saia de NY sem provar", "Brechós e marcas autorais extras" | `extras.mustTry`, `extras.shops` |
| Plano B por dia | itens `- dd/mm — texto` em "Trocas por dia" | `alternatives` (`rain`) do dia |
| Ingressos | tabela "Ingressos para comprar antes" | `checklist` |

## Horário

`HHhMM`, `HHhMM–HHhMM`, `\~HHhMM`, `HHhMM–\~HHhMM`. Horas sem minutos não ocorrem no documento.

## Regras de fidelidade (o build falha)

1. Número de linhas de agenda por dia = número de linhas das tabelas do documento.
2. 28 refeições, cada uma ligada a um bloco de "Onde comer" com os 5 campos.
3. Todo link `https://www.google.com/maps/...` do documento aparece em algum `mapsUrls`, `extras` ou
   `docHtml` (contagem igual).
4. Todo `##` do documento aparece como dia, partida ou seção geral.
