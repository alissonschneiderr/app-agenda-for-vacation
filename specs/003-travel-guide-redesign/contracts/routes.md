# Contract: Rotas e navegação

> **Substituído pela feature 006:** as telas de destino deram lugar às abas Agora, Dia, Por perto e
> Viagem; as rotas `#/destino/...` redirecionam. Ver
> [`specs/006-trip-companion-ux/contracts/routes.md`](../../006-trip-companion-ux/contracts/routes.md).

## Rotas

| Rota | Tela | Conteúdo | Requisitos |
|---|---|---|---|
| `#/` | **Viagem** | Capa (período total), atalho "Hoje" + próxima atividade (durante a viagem), três cartões de destino (foto, período, progresso), progresso geral, compromissos com ingresso | FR-001, FR-004, FR-016 |
| `#/destino/:cityId` | **Destino** | Hero com foto, nome, período, resumo (dias, atividades, compromissos), progresso da cidade, navegação de dias; abre no dia de hoje se estiver no período, senão no primeiro dia | FR-002, FR-003 |
| `#/destino/:cityId/:date` | **Destino, dia selecionado** | Mesma página, com o dia `:date` aberto: cabeçalho do dia (data, dia da semana, "Dia N de M", cidade/locomoção, progresso), grupos de atividades em timeline/lista, dia anterior/seguinte | FR-005–FR-009, FR-013–FR-016 |
| `#/destino/:cityId/:date/:key` | **Atividade** | Detalhes em blocos (ver ui-components.md), toggle Feito/Pendente, "Pular" (FULL), anterior/próxima atividade do dia | FR-010–FR-012 |
| `#/guia`, `#/cidade/:cityId` | Guia (tela existente, restilizada) | Lista/mapa, filtro, busca + links para Favoritos e Meus roteiros | FR-023 |
| `#/ponto/:id`, `#/favoritos`, `#/roteiros`, `#/roteiros/:id`, `#/creditos`, `#/full/nova-york/documento` | Telas existentes, restilizadas | Sem mudança de função | FR-023 |

## Redirecionamentos (FR-025)

| Rota antiga | Vai para |
|---|---|
| `#/full/nova-york` | `#/destino/nova-york` |
| `#/full/nova-york/:date` | `#/destino/nova-york/:date` |

O redirecionamento usa `location.replace` (não cria entrada extra no histórico).

## Navegação principal

- **Celular (< 1024 px)**: barra inferior fixa com 5 itens, toque ≥ 44 px: **Viagem · Nova York ·
  Orlando · Miami · Guia**. O item ativo tem ícone preenchido + rótulo em negrito + `aria-current`.
- **Desktop (≥ 1024 px)**: barra superior com os mesmos itens + Favoritos e Meus roteiros.
- Favoritos e Meus roteiros no celular: links no topo da tela Guia e da tela Viagem.
- Dias (no destino): chips roláveis com data e marcador de progresso (celular) ou coluna lateral
  (desktop); setas "dia anterior / seguinte" que atravessam para o destino vizinho.
