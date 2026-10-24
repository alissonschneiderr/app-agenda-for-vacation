# Contract: Componentes de interface

Contrato de comportamento e acessibilidade dos componentes novos. Visual: tokens de
[research.md R5](../research.md).

## DoneToggle

- Elemento: `<button role="checkbox" aria-checked="true|false">` com ícone de check + texto
  visível "Feito" / "Pendente" (não depende só de cor, FR-014). Área de toque ≥ 44 × 44 px.
- Rótulo acessível: "Marcar {título} como feito" / "Marcar {título} como pendente".
- Clique: chama `toggleDone` via `useUserState().update`; o estado muda no mesmo frame (SC-002).
  Falha de armazenamento: estado não muda + mensagem padrão "Não foi possível salvar: armazenamento
  cheio." (role="alert").
- Estado `skipped`: mostra "Pulada" (texto) e `aria-checked="false"`; tocar marca como Feito.
- Movimento: escala/opacidade do check em 150 ms; nenhum com `prefers-reduced-motion: reduce`.

## ProgressBar

- `role="progressbar"`, `aria-valuemin=0`, `aria-valuemax={total}`, `aria-valuenow={done}`,
  `aria-label="{escopo}: {done} de {total} feitas"`; texto visível "{done} de {total}".
- Total 0 → não renderiza a barra, só "Sem atividades planejadas".

## ActivityRow (item da timeline/lista)

| Parte | Regra |
|---|---|
| Horário | `HH:MM` + duração ("1h30") quando existirem; senão nada (FR-006) |
| Foto | miniatura 4:3 do ponto, se houver; senão ícone da categoria (FR-007, SC-006) |
| Título + categoria | rótulo e ícone da categoria |
| Local | nome do lugar e endereço curto (uma linha, reticências) |
| Selos | "Ingresso comprado" (compromisso), "Reserva necessária", "Indisponível" |
| Toggle | DoneToggle à direita (não abre os detalhes) |
| Toque no restante | abre `#/destino/:city/:date/:key` |
| Estado feito | ícone de check + título com opacidade reduzida; continua na lista (FR-015) |
| Próxima | borda de destaque + rótulo "A seguir" (dia atual) |
| Deslocamento | linha compacta "🚇 Metrô · 20 min · Linha 6" entre itens, sem toggle (FR-009) |

## DayNav

- Lista de dias do destino com data curta, dia da semana e indicador "x/y"; dia atual com rótulo
  "Hoje"; dia de locomoção com ícone de avião/estrada.
- Botões "Dia anterior" / "Próximo dia" no fim da lista do dia, atravessando destinos.

## ActivityDetail (blocos, na ordem; bloco sem dado é omitido — FR-011)

1. **Fotos** — galeria do ponto (4:3, crédito).
2. **Cabeçalho** — título, categoria, horário/duração, DoneToggle, "Pular" (FULL).
3. **Sobre** — descrição (FULL `description` ou `Point.description`).
4. **Por que está no roteiro** — `meal.why`, `shop.why`/`justification`, associação do local de
   série, `notes` do roteiro sugerido do dia.
5. **O que pedir** — `meal.order`, `priceRange` (restaurantes).
6. **Informações importantes** — compromisso (chegar até / sair até), reserva/ingresso, preço do
   ponto, horário de funcionamento do ponto, `facts` com fonte ou "não confirmado", `earlyReason`.
7. **Logística** — endereço, "Como chegar", mapa pequeno (se houver localização), deslocamento até
   a próxima atividade (meio, tempo, destino).
8. **Tempo previsto** — duração.
9. **Observações** — eventos do dia que afetam a atividade (ex.: maratona) e notas do planejamento.
10. **Navegação** — atividade anterior / próxima do dia.

## Destination hero

- Foto `heroPointId` em 16:9 (máx. 360 px de altura no celular), crédito discreto, título sobre
  um véu escuro sólido de 45% (sem gradiente chamativo) para garantir contraste AA do texto branco.
