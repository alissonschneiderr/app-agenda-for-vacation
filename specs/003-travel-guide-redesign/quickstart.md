# Quickstart: validação da feature 003

Comandos base: [quickstart da 001](../001-tourist-guide-itineraries/quickstart.md). Telas e rotas:
[contracts/routes.md](./contracts/routes.md); componentes: [contracts/ui-components.md](./contracts/ui-components.md).

```bash
export PATH=/opt/homebrew/opt/node@24/bin:$PATH
npm run typecheck && npm test && npm run content:strict && npm run build && npm run budget && npm run e2e
```

## Cenários automatizados

| Story | Cenário | Esperado |
|---|---|---|
| US1 | `#/` → tocar "Orlando" | Página de Orlando: foto da Magic Kingdom, "07/11 a 18/11", resumo, progresso, lista de dias |
| US1 | `#/destino/nova-york/2026-11-02` | Timeline com horários; jogo às 19h30 destacado |
| US1 | `#/destino/orlando/2026-11-09` | Lista sem horários (Magic Kingdom) |
| US1 | No último dia de NY, "Próximo dia" | Vai para 07/11 (locomoção NY → Orlando) |
| US1 | Rotas antigas `#/full/nova-york/2026-11-02` | Abre `#/destino/nova-york/2026-11-02` |
| US2 | Marcar 2 itens em Orlando na lista | "Feito" + check; progresso do dia, de Orlando e da viagem +2 |
| US2 | Desmarcar 1 | Contadores −1 |
| US2 | Offline, recarregar e trocar de destino | Marcas mantidas |
| US2 | Estado v2 salvo pela 002 com marcas FULL | Continuam feitas/puladas |
| US2 | Remover um item marcado de um roteiro | Marca some; progresso recalculado |
| US3 | Abrir atividade de refeição em NY | Blocos "Por que está no roteiro" e "O que pedir"; sem bloco de fotos se não houver ponto |
| US3 | Abrir Magic Kingdom (Orlando) | Fotos com crédito, descrição, preço e horário do ponto, "Como chegar" |
| US4 | Viewport 390 px | Sem rolagem horizontal (`scrollWidth ≤ clientWidth`); todos os controles ≥ 44 px |
| US4 | Viewport 1280 px | Destino em duas colunas (dias + dia) |
| US4 | `prefers-reduced-motion` e modo escuro | Sem transições; contraste AA |
| Regressão | E2E das features 001 e 002 | Passam (ajustes só de seletor/texto) |

## Revisão visual

Screenshots em 390 px e 1280 px de: Viagem, Destino (NY, Orlando, Miami), um dia com horários, um dia
sem horários, um dia de locomoção, detalhes de uma atração e de um restaurante, em modo claro e
escuro.
