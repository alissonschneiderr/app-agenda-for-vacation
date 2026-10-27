# Data model — feature 010

Só modelos de leitura, calculados a partir do conteúdo que já existe. Nada muda em `content/`, no
schema nem no armazenamento local.

## PlaceGroup (grupo de bairro)

| Campo | Tipo | Regra |
|---|---|---|
| `areaId` | `string \| null` | id do grupo do roteiro; `null` = "Outros" |
| `name` | `string` | `area.name` como no roteiro (Q2 = A); "Outros" quando `areaId` é `null` |
| `isNeighborhood` | `boolean` | `area.kind === 'bairro'`; `false` entra na revisão |
| `items` | `DayPlace[]` | não vazio; ordem do roteiro |

Função: `dayPlaceGroups(view, kind: 'food' | 'shop' | 'screen'): PlaceGroup[]`.

- Ordem dos grupos = `view.areas`; "Outros" sempre por último e só se tiver itens.
- Cada lugar aparece uma vez por seção. O que já aparece num grupo não se repete (mesma regra de
  nome da 009). Um lugar em dois grupos fica no primeiro.
- `dayPlaces(view, kind)` passa a ser `dayPlaceGroups(...).flatMap(g => g.items)`. Os totais
  continuam iguais (01/11: 24 e 17).

## DaySectionId (atualizado)

`'paradas' | 'comer' | 'lojas' | 'curiosidades' | 'bairros' | 'transporte' | 'dicas'`

| id | rótulo | contagem |
|---|---|---|
| `curiosidades` | Curiosidades | `dayPlaces(view, 'screen').length` |
| `transporte` | Transporte | trechos relevantes (`isRelevantMove`) + transferências relevantes + blocos de troca de cidade. O mapa não conta. |
| `dicas` | Dicas | dicas do dia com `!isGenericTip(html)` |

## Funções de regra

- `isRelevantMove(text: string): boolean` — R3.
- `isGenericTip(html: string): boolean` — R4.
- `dayMoves(view)`: lista os trechos e transferências relevantes do dia, usada pela seção e pela
  contagem. Assim a seção e o menu nunca divergem.
- `dayTips(view)`: lista as dicas que ficam.

## SectionReview (relatório)

```
{ date, removed: ('transporte' | 'dicas')[], droppedMoves: string[], cutTips: string[],
  nonNeighborhoodGroups: { section, name }[], uncertain: { section, name, reason }[] }
```

Função: `sectionReview(content, state): SectionReview[]` (R6). Só dias com algo a relatar.

## ShoppingSlice (atração de compras)

`shoppingSlice(view, activity): PlaceGroup | undefined` devolve o grupo de `activity.areaId` em
`dayPlaceGroups(view, 'shop')`, só quando `activity.category === 'shopping'` e o grupo tem itens.
