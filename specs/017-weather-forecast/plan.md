# Implementation Plan: Previsão do tempo no dia e no Início

**Branch**: `main` (a pedido do usuário) | **Date**: 2026-10-29 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/017-weather-forecast/spec.md`

## Summary

A previsão vem do Open-Meteo (gratuito, sem chave), numa chamada só para as três cidades, 16 dias à
frente (R1, R2). O local de cada cidade é o ponto-capa que já está no conteúdo (R3). O app busca ao abrir
e ao voltar para a frente, no máximo a cada 3 h, e guarda no armazenamento do app; sem internet, mostra o
salvo com "atualizada em …" (R4). O dia ganha o box "Tempo" depois do resumo (duas cidades nos dias de
troca; "Previsão a partir de DD/MM" além de 16 dias); o Início ganha a faixa hoje + 4, com "fora da
viagem" nos dias sem cidade (R6). Ícones de tempo novos em SVG, sem dependência (R5).

## Technical Context

**Language/Version**: TypeScript 5 (strict), Node 24 (build e scripts)

**Primary Dependencies**: as atuais (Preact, Vite, vite-plugin-pwa); **nenhuma dependência nova**;
serviço externo Open-Meteo (HTTP, sem chave)

**Storage**: armazenamento do app (IndexedDB com espelho, feature 014), chave `ctha:weather`

**Testing**:
- Vitest: tabela WMO, alcance, cidades por dia, faixa do Início, mescla do salvo, `refreshWeather` com
  `fetch` falso (online, offline, erro, menos de 3 h); box e faixa.
- Playwright (`mobile-360`, `mobile-402`): Open-Meteo interceptado com `page.route`; Início, dia,
  offline, sem rolagem lateral.

**Target Platform**: Chrome no Galaxy S24 Ultra e Safari no iPhone 17, app instalado

**Project Type**: app web de página única (PWA)

**Performance Goals**: box e faixa preenchidos em até 3 s com internet (SC-001); uma chamada de rede a
cada 3 h no máximo; JS inicial < 100 KB gzip

**Constraints**:
- offline-first: previsão salva sempre visível; sem página de erro;
- só as coordenadas das cidades vão para o serviço (FR-009);
- nunca inventar dados: sem média histórica, sem coordenada à mão;
- snapshot de NY intacto; dicas de clima dos roteiros continuam.

**Scale/Scope**: 3 cidades × 16 dias; 2 módulos novos (domínio e busca), 2 componentes, 6 ícones,
2 telas alteradas

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Situação |
|---|---|
| I. Offline-first | ✅ A previsão é uma função de internet com falha explícita e amigável: a salva fica visível com a hora; sem nada salvo, "Previsão disponível com internet". Nada mais do app depende dela. |
| II. Testes obrigatórios | ✅ Unit do domínio e da busca (com `fetch` falso), componentes, e2e a 360 e 402 px com a rede interceptada e offline. |
| III. Simplicidade | ✅ Nenhuma dependência; uma chamada HTTP documentada; reaproveita o armazenamento da 014, `deviceToday` da 013 e o padrão de busca da 014. |
| Plataforma mobile-first | ✅ Faixa que cabe a 360 px; alvos ≥ 44 px; temas claro, escuro e alto contraste. |

Pós-design: sem violações.

## Project Structure

### Documentation (this feature)

```text
specs/017-weather-forecast/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/screens.md
├── checklists/requirements.md
└── tasks.md          # /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── domain/weather.ts            # novo: DayWeather, describe (WMO), weatherFor, dayCities, homeStrip, stale
├── lib/weather.ts               # novo: refreshWeather (Open-Meteo), leitura/gravação de ctha:weather, useWeather
├── components/WeatherBox.tsx    # novo: box "Tempo" do dia
├── components/WeatherStrip.tsx  # novo: faixa hoje + 4 do Início
├── components/Icon.tsx          # ícones sun já existe; novos: cloud, cloud-sun, fog, rain, snow, storm
├── pages/Day.tsx                # box depois do resumo
├── pages/Start.tsx              # faixa abaixo do cabeçalho
├── main.tsx                     # refreshWeather ao abrir e em visibilitychange
└── styles/base.css              # estilos do box e da faixa (claro, escuro, alto contraste)
tests/
├── unit/weather.test.ts
├── components/weather.test.tsx
└── e2e/us-mobile-weather.spec.ts
```

**Structure Decision**: o projeto único de sempre; domínio puro separado da busca, como nas outras
features.

## Complexity Tracking

Sem violações a justificar.
