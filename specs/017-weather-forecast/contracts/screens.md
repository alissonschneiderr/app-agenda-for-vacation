# Contrato de telas: Previsão do tempo

## Serviço (Open-Meteo)

```text
GET https://api.open-meteo.com/v1/forecast
  ?latitude=<ny>,<orl>,<mia>&longitude=<ny>,<orl>,<mia>
  &daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max
  &timezone=America%2FNew_York&forecast_days=7
→ 200 [ { daily: { time[], weather_code[], temperature_2m_max[], temperature_2m_min[],
                   precipitation_probability_max[] } } × 3, na ordem pedida ]
```

Qualquer outro resultado (rede, status, JSON) = mantém o salvo.

## Box "Tempo" no dia (depois do resumo, antes do menu de seções)

```text
┌ Tempo ───────────────────────────────┐
│ ⛅ Parcialmente nublado               │
│ 15° / 9°   ·   💧 20%                 │
│ atualizada em 29/10 às 14h05          │
└──────────────────────────────────────┘
```

- Dia de troca: uma linha por cidade, com o nome ("Nova York", "Orlando").
- Além do alcance: "Previsão a partir de DD/MM".
- Nada salvo: "Previsão disponível com internet".
- Dia passado: sem box.
- Nome acessível: região "Tempo"; texto do leitor:
  "Nova York: parcialmente nublado, máxima 15, mínima 9 graus, 20% de chance de chuva".

## Faixa no Início (abaixo do cabeçalho, antes dos cards)

```text
 29/10        30/10        31/10        01/11        02/11
 NY           NY           ☁ 15°/5°     ☁ 16°/9°     ☁ 19°/11°
 ☀ 20°/9°     ⛅ 18°/7°     (link)       (link)       (link)
```

- 5 dias: hoje + 4. Dia da viagem = link `#/dia/<data>`; fora da viagem = previsão da 1ª cidade (antes)
  ou da última (depois), com a sigla (NY/MIA), borda tracejada e sem link.
- Dia de troca: as duas máximas/mínimas, uma por cidade (sigla NY/ORL/MIA).
- Sem rolagem lateral da página a 360 px (a faixa pode rolar sozinha na horizontal).
- "atualizada em …" uma vez, abaixo da faixa; sem nada salvo, "Previsão disponível com internet".
