# Data Model: Previsão do tempo

## DayWeather (`src/domain/weather.ts`)

| Campo | Tipo | Regra |
|---|---|---|
| `code` | number | código WMO do dia (`weather_code`) |
| `max` | number | máxima em °C, arredondada |
| `min` | number | mínima em °C, arredondada |
| `rain` | number \| null | chance de chuva máxima do dia, em %; `null` se o serviço não trouxer |

## WeatherStore (salvo em `ctha:weather`)

```text
{
  fetchedAt: string,                       // ISO, hora da última busca que deu certo
  cities: { [cityId]: { [date]: DayWeather } }
}
```

- Uma busca nova substitui os dias que vieram e mantém os outros (dias passados não são apagados).
- JSON inválido ou ausente = nada salvo (sem erro).

## Visões de tela

- `weatherFor(store, cityId, date, today)`:
  - `{ kind: 'forecast', day, fetchedAt }` — há previsão salva;
  - `{ kind: 'later', from }` — dia além de hoje + 15 (`from` = data − 15), alcance do serviço;
  - `{ kind: 'none' }` — dentro do alcance mas nada salvo (sem internet desde sempre).
- `dayCities(content, date)`: as cidades do dia — uma; duas no dia de troca (a que sai e a que chega,
  pela `content.trip`).
- `homeStrip(content, today)`: 5 datas, hoje + 4; cada uma com `cities` (vazio = fora da viagem).
- `describe(code)`: `{ icon, label }` pela tabela WMO (research R5).
- `stale(fetchedAt, now)`: mais de 24 h → "atualizada em …" em destaque.

## Regras

- Busca quando online e `now − fetchedAt > 3 h` (ou nada salvo).
- Dia que já passou: o box do dia não aparece.
- Local de cada cidade: `center` da cidade em `content/trip.json` (research R3).
