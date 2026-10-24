# Quickstart: validação da feature 005

```bash
export PATH=/opt/homebrew/opt/node@24/bin:$PATH
npm run content:strict   # lê o roteiro.md (exportação do doc) e aplica as regras do contrato
npm test && npm run build && npm run budget && npm run e2e
```

**Esperado**: `content:strict` imprime o resumo do roteiro de Nova York (dias, áreas, atividades,
lugares, links de fotos e de mapa). Se uma regra D1–D5 falhar, ele aponta o dia e o bairro.

## Atualizar o roteiro quando o doc mudar (FR-021)

1. Pedir ao Claude: "atualize o roteiro de Nova York com a versão atual do doc". Ele exporta o doc em
   Markdown e salva em `content/full/nova-york/roteiro.md`, sem edição.
2. `npm run content:strict`. Se falhar, a mensagem diz o que o doc tem que o app não reconheceu, ou
   que um `checklistOverrides` não vale mais.
3. `npm test && npm run build`.

## Cenários automatizados

| Story | Cenário | Esperado |
|---|---|---|
| US1 | Cada dia | Áreas e itens com horário na ordem do doc (contagem independente no `roteiro.md`) |
| US1 | 01/11 | 6 bairros na ordem: SoHo, Nolita, Chinatown, Little Italy, Lower East Side, East Village |
| US1 | 02/11 | Knicks x Nets 19h30, chegar até 18h30 |
| US1 | 05/11 | MJ 19h, chegar até 18h30 |
| US1 | "pausa livre" | Sem Feito/Pendente; fora do total |
| US1 | Marcas `ny-…`/`nyv2-…` | Progresso de NY = 0 feitas |
| US2 | Chinatown | 6 opções de comida + aviso "Nenhuma cafeteria…" |
| US2 | Lugar com 📷 e Mapa | Botões com os links exatos; offline, aviso + endereço |
| US3 | Documento completo offline | Todas as seções na ordem |
| US3 | Viagem | 8 itens de "O que comprar antes"; Tenement às 16h15 |
| US3 | 07/11 | Partida: saída às 11h, LaGuardia |
| Regressão | Orlando/Miami, 003 | Passam |

## Revisão do casal

Abrir o doc e o app lado a lado, dia por dia (SC-007).
