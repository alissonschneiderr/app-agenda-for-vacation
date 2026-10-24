# Quickstart: validação da feature 004

```bash
export PATH=/opt/homebrew/opt/node@24/bin:$PATH
npm run content:strict   # converte roteiro.md e aplica as regras de validation-rules.md
npm test && npm run build && npm run e2e
```

**Esperado**: `content:strict` imprime "roteiro FULL nova-york: 7 dias, N atividades, 28 refeições,
M links do Maps" e falha apontando dia e linha se alguma regra D1–D4 ou estrutural for violada.

## Cenários automatizados

| Story | Cenário | Esperado |
|---|---|---|
| US1 | Cada dia de 31/10 a 06/11 | Linhas, horários e "como ir" iguais à tabela do documento (teste contra o próprio `roteiro.md`) |
| US1 | `#/destino/nova-york/2026-11-02` | Knicks 19h30, chegada 18h50 |
| US1 | `#/destino/nova-york/2026-11-05` | MJ 19h, chegada 18h30; 04/11 sem MJ |
| US1 | Estado com marcas `ny-2026-…` | Progresso de NY = 0 feitas; nenhuma linha nova marcada |
| US2 | Abrir Keens (02/11), Kith (05/11), prédio de Friends (06/11) | Campos do documento + "Abrir no Google Maps" com o link exato |
| US2 | Ess-a-Bagel | Dois links de Maps |
| US2 | Offline + "Abrir no Google Maps" | Aviso de conexão + endereço |
| US3 | `#/full/nova-york/documento` offline | Todas as seções do documento na ordem; tabelas sem rolagem horizontal da página |
| US3 | `#/destino/orlando/2026-11-07` | Orientações de partida (LaGuardia) |
| US3 | Checklist | 4 ingressos + compromissos comprados |
| Regressão | E2E de Orlando/Miami e da 003 | Passam |

## Revisão do casal

Abrir o documento original ao lado do app e conferir dia por dia (SC-006).
