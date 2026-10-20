# Quickstart: validação da feature 002

Pré-requisitos e comandos básicos: [quickstart da 001](../001-tourist-guide-itineraries/quickstart.md).
Formatos: [contracts/](./contracts/); regras: [data-model.md](./data-model.md).

## Comandos

```bash
export PATH=/opt/homebrew/opt/node@24/bin:$PATH
npm run content:strict   # valida 001 + roteiro FULL (regras F1–F19)
npm test                 # inclui regras do FULL, marcações, migração v1→v2, telas
npm run build && npm run e2e
```

**Esperado**: `content:strict` imprime "roteiro FULL: 7 dias, N atividades" e falha com mensagem
clara (dia e id da atividade) se alguma regra F1–F19 for violada.

## Cenários automatizados

| Story | Cenário | Resultado esperado |
|---|---|---|
| US1 | Relógio em 2026-11-02 15:00 (NY) → `#/full/nova-york/2026-11-02` | Agenda completa; jogo às 19h30 destacado com "chegar até"; próxima atividade destacada |
| US1 | Abrir 31/10 | Começa no JFK, deslocamento até o POD 51, guarda de malas |
| US1 | Offline: marcar uma atividade como feita e outra como pulada → recarregar | Marcas mantidas; "a seguir" avança |
| US1 | Desfazer marcação | Volta ao estado sem marca |
| US2 | Conferir refeições de todos os dias | 4 por dia, sem termos proibidos (regra F12 também no build) |
| US3 | Abrir um local de série | Obra, endereço, ambientação/locação, acesso interno/externo |
| US4 | Abrir checklist no documento | Todos os itens com reserva/ingresso dos 7 dias |
| Doc | Offline → `#/full/nova-york/documento` | 7 dias + checklist + endereços + orientações + exclusões; botão de impressão chama `window.print()` |
| 001 | `#/roteiros` | Dias de NY mostram o roteiro FULL; Orlando e Miami inalterados |
| Migração | `localStorage` com estado v1 (favoritos e roteiros) → abrir app | Tudo preservado, `schemaVersion: 2` |

## Validação manual

1. No celular, abrir o roteiro de hoje em modo avião e marcar atividades.
2. Abrir o documento e usar "Imprimir / salvar PDF" (no iPhone: Compartilhar → Imprimir; no
   Android: Imprimir → Salvar como PDF). Conferir que cada dia começa numa página nova.

## Revisão do casal (28–29/10)

- Ler o documento completo de ponta a ponta.
- Conferir horários de saída para o jogo (02/11) e o musical (04/11).
- Comprar/reservar tudo do checklist dentro das datas-limite.
- Reportar correções; cada correção passa por `npm run content:strict`.
