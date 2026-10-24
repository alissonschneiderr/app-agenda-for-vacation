# Contract: Rotas (hash)

| Rota | Tela | Notas |
|---|---|---|
| `#/` | **Agora** | antes da viagem: contagem + ingressos; depois: resumo |
| `#/dia` | **Dia** (hoje) | antes da viagem: primeiro dia |
| `#/dia/:date` | **Dia** | deslizar ↔ troca `:date` |
| `#/dia/:date/:key` | **Detalhe do passo** | `key` = id da atividade, `it:…` ou `tr:…` |
| `#/perto` | **Por perto** | região atual (do próximo passo) |
| `#/perto/:date/:areaId` | **Por perto** | região escolhida; `?g=comer\|lojas\|curiosidades&n=☕\|🏆\|🍰` |
| `#/perto/:date/:areaId/:placeId` | **Detalhe da opção** | |
| `#/motorista/:date/:key` | **Mostrar ao motorista** | também para opções: `:key` = id do lugar |
| `#/viagem` | **Viagem** | cidades, ingressos, compromissos, dicas, exibição |
| `#/guia`, `#/cidade/:id`, `#/ponto/:id` | Guia (consulta) | acessado por Viagem |
| `#/full/nova-york/documento[/:section]` | Documento completo | acessado por Viagem |
| `#/creditos` | Créditos das fotos | acessado por Viagem |

## Redirecionamentos

| Antiga | Nova |
|---|---|
| `#/destino/:city/:date/:key` | `#/dia/:date/:key` |
| `#/destino/:city/:date` | `#/dia/:date` |
| `#/destino/:city` | `#/dia/<primeiro dia da cidade>` |
| `#/full/nova-york`, `#/full/nova-york/:date` | `#/dia/<data>` (primeiro dia de NY quando sem data) |

`#/favoritos` e `#/roteiros…` continuam acessíveis por link direto, sem aparecer na navegação (Q3).
