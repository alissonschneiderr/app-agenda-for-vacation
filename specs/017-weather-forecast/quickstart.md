# Quickstart: validar a previsão do tempo

## Pré-requisitos

```sh
export PATH=/opt/homebrew/opt/node@24/bin:$PATH
npm ci
```

## Suíte do CI

```sh
npm run typecheck && npm test && npm run content:strict && npm run build && npm run budget && npm run e2e
```

Esperado: tudo verde; os testes nunca usam a rede de verdade (o Open-Meteo é interceptado).

## Conferência manual (celular ou 402 × 874, com internet)

1. **Início**: faixa com hoje e mais 4 dias; antes de 31/10, os dias antes da viagem dizem "fora da
   viagem"; os da viagem têm ícone e máxima/mínima e abrem o dia ao tocar.
2. **Dia 31/10 ou 01/11**: box "Tempo" depois do resumo, com descrição, máxima, mínima, chance de chuva
   e "atualizada em …".
3. **Dia 18/11 ou 20/11** (longe): "Previsão a partir de DD/MM".
4. **Dia 07/11** (quando entrar no alcance): Nova York e Orlando no mesmo box.
5. **Modo avião** e reabrir: a mesma previsão, com "atualizada em …".
6. **Instalação nova sem internet**: "Previsão disponível com internet"; o resto do app funciona.

Detalhes em [contracts/screens.md](contracts/screens.md) e [data-model.md](data-model.md).
