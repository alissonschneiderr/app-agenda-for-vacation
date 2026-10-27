# Quickstart: validar a feature 009

```sh
export PATH=/opt/homebrew/opt/node@24/bin:$PATH
npm run typecheck && npm test && npm run content:strict
npm run build && npm run budget && npm run e2e
```

O e2e roda as telas a **360 × 780** e **402 × 874**. Ele confere:
- **layout**: nada de rolagem lateral e alvos ≥ 44 px;
- **cards**: clicáveis em qualquer ponto, com um link por card;
- **menus**: sem seções vazias;
- **atração**: o descritivo visível sem toque.

## Revisão manual (DevTools: "Galaxy S24" 360 × 780 e "iPhone 17" 402 × 874)

| URL | Esperado |
|---|---|
| `#/` | Só os 3 cards de cidade; tocar na foto de Orlando abre Orlando |
| `#/cidade/nova-york` | Capa curta + 8 cards de dia; sem tags e sem abas |
| `/?agora=2026-11-01T13:30#/dia/2026-11-01` | Menu: Paradas · Restaurantes e Cafés · Brechós e Lojas · Bairros · Transporte · Dicas |
| `#/dia/2026-11-09` | Menu sem "Brechós e Lojas" |
| `#/dia/2026-11-19` | Menu só com o que existe (Paradas) |
| `#/dia/2026-11-07` | Transporte com os três blocos |
| `#/dia/2026-10-31/ny3-2026-10-31-04` | Título → descritivo completo → horário/endereço/mapa |
| `#/exibicao` | Interruptor do alto contraste |
| `#/dicas`, `#/transporte`, `#/cidade/orlando/bairros` | Redirecionam (Início / cidade) |

## Relatório da entrega

O relatório fica em `specs/009-mobile-first-navigation/report.md` e traz as mudanças por página e a
confirmação dos testes a 360 e 402 px. Os dados a revisar ficam em
`specs/009-mobile-first-navigation/data-review.md`, gerado no build.
