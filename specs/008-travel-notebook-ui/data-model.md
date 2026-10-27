# Data Model: feature 008

Só o que é novo ou muda. Os dados dos roteiros (features 004–007) não mudam de formato, exceto pelas
dicas (R6).

## Conteúdo (`content.json`)

### City (`content/trip.json`, `cities[]`)

| Campo | Novo? | Regra |
|---|---|---|
| `country` | novo | texto factual ("Estados Unidos"); obrigatório |

### Tip (novo, em `FullItinerary.tips`)

| Campo | Tipo | Regra |
|---|---|---|
| `id` | `tip:<cidade>:<n>` | único, em ordem do doc |
| `cityId` | CityId | cidade do doc |
| `category` | `'clima' \| 'dinheiro' \| 'reservas' \| 'transporte' \| 'apps' \| 'filas' \| 'outros'` | deduzida pelo mapa de palavras-chave (contracts/tips-content.md) |
| `title` | texto | título da subseção (NY) ou rótulo em negrito (Orlando), sem emoji inicial |
| `html` | HTML | trecho do doc convertido, sem reescrita |
| `source` | texto | título da seção `##` de origem |

**Validação**:
- **D7**: o texto de cada dica, sem marcação, existe na seção de origem.
- Toda dica tem categoria.
- Nenhuma dica é criada fora das seções listadas no contrato.

## Modelos de tela (calculados, não guardados)

Funções puras em `src/domain/notebook.ts`, sobre `dayView`/`destinationView` da feature 003.

### TripCover

`{ photo?, daysLeft?, people, start, end, cities, progress }`

- `daysLeft`: só antes da viagem.
- `people`: 2, de `travelers` = "Casal".

### CityCard / CityCover

`{ cityId, name, country, photo?, nights, start, end, roadmapDays, phrase, tags[], progress, arrival?, departure? }`

- `nights` = depart − arrive.
- `roadmapDays` = dias com tipo diferente de `transit`.
- `phrase`: `summary` do ponto de destaque.
- `tags`: compromissos com ingresso + até 6 regiões mais citadas.
- `arrival`/`departure`: rótulos dos dias de locomoção da cidade, com a rota.

### DayCard / DayCover

`{ date, label, dayNumber, title, kind, stops, summary, photo?, progress, alerts[], moves[], regions[] }`

- `title`: `region` do roteiro, ou o nome do roteiro sugerido (Miami).
- `stops`: passos marcáveis.
- `photo`: 1ª região com foto, depois 1º passo com foto, depois a cidade.
- `moves`: saída, deslocamentos com horário e `transfer` das regiões, mais o mapa do dia.

### StopCard

É o `DayActivityView` da 006/007 mais `thumb?: Photo`:
- foto do lugar;
- senão, a do ponto;
- senão, nenhuma (quadro com ícone).

### NeighborhoodCard

`{ date, areaId, name, intro?, photo?, counts: { food, sweets, shops, screen }, notesHtml? }`

### TransportView

- `between`: um item por dia de locomoção, com a rota `from → to` e os itens de `departures`/
  `arrivals`.
- `inCity`: as dicas `transporte` de cada cidade e a área `chegada` do 1º dia, quando existir.

## Estado do usuário

Sem mudança. As marcas continuam com as mesmas chaves (`ny3-…`, `orl1-…`, `tr:…`, `ck:…`, `al:…`) e
as preferências em `ctha:prefs`.
