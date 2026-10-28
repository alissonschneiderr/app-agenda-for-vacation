# Quickstart: validar a rota entre dois lugares

## Pré-requisitos

```sh
export PATH=/opt/homebrew/opt/node@24/bin:$PATH
npm ci
```

## Suíte do CI

```sh
npm run typecheck && npm test && npm run content:strict && npm run build && npm run budget && npm run e2e
```

Esperado: tudo verde em `chromium`, `mobile-360` e `mobile-402`; snapshot de NY sem mudança.

## Conferência manual (celular ou 402 × 874)

1. **01/11 → Mott Street**: "Rota até…" ao lado de "Abrir no mapa". Tocar: lista do dia com
   Paradas (com horário), Restaurantes e Cafés, Brechós e Lojas, Curiosidades; sem Mott Street.
2. Tocar numa parada: o Google Maps abre com origem Mott Street e destino a escolhida.
3. **Inverter** e tocar de novo: origem e destino trocados.
4. **Ver outros dias**: aparecem 31/10, 02/11 … 07/11 de Nova York, com DD/MM.
5. **Voltar** (cabeçalho ou botão do celular): volta à atração.
6. **Card de restaurante** do dia (seção Restaurantes e Cafés): "Rota até…" ao lado de "Abrir no mapa";
   tocar não abre o card, abre a lista.
7. **Orlando 08/11** e **Miami 19/11**: a lista mostra só lugares da cidade.
8. **Sem internet** (modo avião): a lista abre; tocar numa opção mostra o aviso com os dois endereços.
9. **"Compras no SoHo"** (01/11): sem "Rota até…" (não tem local no roteiro).

Detalhes em [contracts/screens.md](contracts/screens.md) e [data-model.md](data-model.md).
