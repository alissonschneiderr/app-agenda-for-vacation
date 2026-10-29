# Research: Previsão do tempo no dia e no Início

Sem NEEDS CLARIFICATION: Q1 (hoje + 4) e Q2 = A fecharam o escopo.

## R1 — Fonte da previsão: Open-Meteo

- **Decision**: `https://api.open-meteo.com/v1/forecast` com
  `daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max`,
  `timezone=America/New_York`, `forecast_days=7`, e as três cidades numa chamada só (latitudes e
  longitudes separadas por vírgula; a resposta é uma lista na mesma ordem). Testado em 29/10: 200, CORS
  aberto, 7 dias por cidade.
- **Rationale**: gratuito, sem cadastro nem chave (nada a esconder num app estático público), dados em
  °C, códigos WMO padronizados. As três cidades estão no mesmo fuso (Leste dos EUA).
- **Alternatives considered**: OpenWeatherMap e WeatherAPI — exigem chave, que ficaria exposta no
  GitHub Pages; National Weather Service (api.weather.gov) — só EUA, em inglês e sem chance de chuva
  diária simples.

## R2 — Alcance da previsão: 16 dias (ajuste do usuário)

- **Decision**: o app pede 16 dias (`forecast_days=16`, o máximo do Open-Meteo). Dia da viagem além disso
  mostra "Previsão a partir de DD/MM", com DD/MM = data do dia − 15. A faixa do Início continua com 5 dias.
- **Histórico**: a 1ª versão pedia 7 dias — escolha minha ao ler Q2 = A como "só a previsão confiável".
  O usuário pediu: "na tela inicial mantenha os 5 dias, mas se existe a previsão para o dia, quando o
  usuário está dentro do dia, mostre".
- **Observação**: além de ~7 dias a previsão erra mais (sobretudo a chance de chuva); ela se atualiza a
  cada 3 h com internet.

## R3 — Local de cada cidade

- **Decision** (ajustada na implementação): o `center` de cada cidade, que já está em
  `content/trip.json` (Nova York 40.7549,−73.984; Orlando 28.4177,−81.4846; Miami o seu `center`).
  O plano previa o ponto-capa (`heroPointId`); o `center` é literalmente o "centro da cidade" da spec e
  também já está no conteúdo.
- **Rationale**: "nunca inventar dados" — nada de coordenada digitada à mão. A previsão é por cidade,
  não por bairro (spec, Assumptions).
- **Privacidade**: o pedido leva só essas três coordenadas; nada do aparelho nem do casal (FR-009).

## R4 — Quando buscar e onde guardar

- **Decision**:
  - `src/lib/weather.ts`: `refreshWeather()` busca quando há internet e a última busca tem mais de 3 h
    (FR-006); roda ao abrir o app e quando ele volta para a frente (`visibilitychange`), como a busca de
    versão nova da feature 014. Uma busca por vez.
  - Guardado no armazenamento do app (`getAppStorage()`, o mesmo do IndexedDB da feature 014), na chave
    `ctha:weather`: `{ fetchedAt, cities: { [cityId]: { [date]: DayWeather } } }`. Uma busca nova
    substitui os dias que vieram e mantém os passados.
  - `useWeather()` dá o estado às telas e re-renderiza quando a busca termina.
  - Sem internet ou com erro: fica o que está salvo (FR-004, FR-005); nada de página de erro.
- **Rationale**: offline-first (constituição I): a previsão salva continua visível sem rede, com
  "atualizada em …".
- **Alternatives considered**: deixar o Service Worker guardar a resposta (`StaleWhileRevalidate`) — o
  app não saberia a hora da busca nem juntaria as respostas; e o `prefs.ts` — é só de preferências.

## R5 — Ícones e descrições

- **Decision**: tabela WMO → (ícone, descrição em português) em `src/domain/weather.ts`: 0 "Céu
  limpo" (`sun`), 1–2 "Parcialmente nublado" (`cloud-sun`), 3 "Nublado" (`cloud`), 45/48 "Neblina"
  (`fog`), 51–57 "Garoa", 61–67 e 80–82 "Chuva" (`rain`), 71–77 e 85–86 "Neve" (`snow`), 95–99
  "Tempestade" (`storm`). Ícones novos desenhados em SVG no `src/components/Icon.tsx` (como os outros),
  sem biblioteca.
- **Rationale**: nenhuma dependência nova (constituição III).

## R6 — Onde aparece

- **Decision**:
  - **Dia** (`src/pages/Day.tsx`): box "Tempo" logo depois do resumo do dia (`.day-summary`), antes do
    menu de seções; nos dias que já passaram, não aparece. Dia de troca: as duas cidades da
    `content.trip` (a que sai e a que chega).
  - **Início** (`src/pages/Start.tsx`): faixa de 5 dias logo abaixo do cabeçalho, antes dos cards; cada
    dia da viagem é link para `#/dia/<data>`; fora da viagem, "fora da viagem", sem link. "Hoje" vem de
    `deviceToday()` (feature 013).
- **Rationale**: FR-001 a FR-003, FR-008.

## R7 — Testes

- **Decision**: unit da tabela WMO, do "a partir de", da escolha das cidades por dia e da mescla do
  salvo (`tests/unit/weather.test.ts`); `refreshWeather` com `fetch` falso (online, offline, erro,
  menos de 3 h); componentes do box e da faixa (`tests/components/weather.test.tsx`); e2e
  `tests/e2e/us-mobile-weather.spec.ts` nos projetos `mobile-360`/`mobile-402` com a resposta do
  Open-Meteo interceptada (`page.route`) — nunca a rede de verdade nos testes.
