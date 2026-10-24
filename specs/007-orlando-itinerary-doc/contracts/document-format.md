# Contrato: leitura do doc de Orlando

Como cada bloco de `content/full/orlando/roteiro.md` vira conteúdo do app. Este contrato complementa
o da feature 005 (`specs/005-nyc-itinerary-doc/contracts/document-format.md`), que continua valendo
para Nova York. O leitor é um só (research R1).

## Seções `##`

| Seção | Vira |
|---|---|
| `💡 Decisões já tomadas e aplicadas` | só documento completo |
| `Resumo da viagem` | só documento completo (tabela rolável) |
| `Dia 1 (sáb 07/11): Chegada` | `arrivals["2026-11-07"]`, porque `meta.arrivalDay` (R5) |
| `Dia 2 … Dia 11` | um `FullDay` por data, de 08 a 17/11 |
| `🎟️ O que reservar com antecedência` | `checklist` (6 itens, R6) + documento completo |
| `✈️ Partida (qua 18/11) e dicas práticas` | `departures["2026-11-18"]` de `meta.departure` + documento completo; sem `dayNotes` |
| `Como as rotas foram calculadas`, `Fontes` | só documento completo |

Toda seção `##` também vira uma entrada de `docHtml`, na ordem.

## Dentro de um dia

| Bloco | Exemplo | Vira |
|---|---|---|
| 1º parágrafo | "O parque mais clássico…" | `goal` |
| `🗺️ **Mapa do dia:** [..](url)` | | `mapUrl` |
| `**HHhMM – chegada ao estacionamento:** texto` / `**08h00 – saída:**` | | atividade `transit`, `how` = texto, `areaId: null` |
| `**🎟️ Reservar…:** texto` | | aviso do dia (`alerts`) |
| `### 📍 Nome` | `### 📍 Magic Kingdom` | área `bairro` |
| `[📷 ver fotos](url)` logo abaixo | | `area.photoUrls` |
| 1º parágrafo da área | | `area.intro` |
| `**Atrações (no roteiro):**` + lista | | atividades (linha de atração, abaixo) |
| `**⚠️ Fechado:** …` / `**⚠️ Fora do roteiro:** …` | | aviso do dia (`alerts`) |
| `**Sem Multi Pass:** …` / `**Sem fura-fila:** …` / `**Para aliviar:** …` | | `area.notesHtml` |
| `**🛍️ Compras (tarde, \~14h às 18h):** texto` | | atividade `shopping`, `timeLabel` "~14h às 18h", `how` = texto |
| `**Alternativa ao outlet:** …` | | `area.notesHtml` |
| `**☕🏆🍰 Onde comer no X (lista):**` + lista | `- Casey's Corner (Main Street, cachorro-quente)` | lugares `food` (`name`, `fields[0]` = parêntese) |
| `**🛍️ Mercados (lista):**` + lista | `- Publix` | lugares `shop` |
| lista sem horário numa área | `- Piscina do hotel…` | `area.notesHtml` |
| `### 🚗 Deslocamento para X (…)` | | `transfer` da área anterior (texto do cabeçalho) |
| `### 🏨 \~18h – volta ao hotel` + parágrafo | | atividade `transit` "volta ao hotel", `timeLabel` "~18h", `how` = parágrafo |
| `### 🌙 Noite: …` sem horário | | área `noite` com `notesHtml` e `photoUrls`; sem atividade |

## Linha de atração

```text
- **8h10 — 🛶 Jungle Cruise** · fila \~5 min (Adventureland). Passeio de barco… [📷 fotos](url)
  └rótulo┘ └ícone┘└─título─┘   └─queue──┘ └──land──┘  └──────── fields ───────┘ └photoUrls┘
- **10h00 — 🛗 Tower of Terror** · \~5 min · Multi Pass. Elevador…
                                   └queue┘   └access─┘
```

- Rótulos de hora aceitos: `8h10`, `12h00`, `~18h`, `14h30–20h00`, `10h00–14h50`, `12h15 ou 13h15`.
- O ícone é o primeiro emoji do título, incluindo sequências ZWJ (🏴‍☠️, 👨‍🚀).
- Tipo:
  - "Almoço…" → `free`;
  - "…tempo livre…" → `free`;
  - ícone 🛍️ → `shopping`;
  - os demais → `attraction`.
- "(opcional" no resto marca `optional: true`.
- Cada atração gera um `DocPlace` `attraction` ligado ao passo. Os almoços não geram.

## Conferência (D1–D5) com as mudanças da 007

| Regra | Mudança |
|---|---|
| D1 (itens com horário) | conta itens `- **H…h`, com hora de 1 ou 2 dígitos, mais as linhas de logística, os `### 🏨` com horário, os parágrafos "🛍️ Compras (…h…)" e as noites com horário |
| D2 (lugares das listas) | inclui itens simples de "Onde comer" e "Mercados" |
| D3 (links) | sem mudança; inclui os links inline das atrações |
| D4 (seções e áreas) | os `###` com 🏨 e 🚗 não contam como área; a seção do `arrivalDay` confere os itens da Chegada em vez de um dia |
| D5 (compromissos) | sem compromissos em Orlando |
| **D6 novo** | cada `quote` de `meta.departure` existe, literal, na seção Partida; cada item sem `quote` tem `source` |

Esperado para a cópia rev. 26:
- 10 dias;
- 75 itens de atração com horário;
- 18 linhas de logística (8 de chegada/saída e 10 voltas ao hotel);
- 2 compras;
- 29 opções de comida;
- 3 mercados;
- 81 links de fotos e 10 mapas do dia.

## Regressão de Nova York

A saída do leitor para `content/full/nova-york/roteiro.md` MUST ser idêntica à de antes da
mudança: ids, títulos, horários, lugares, áreas, avisos, `docHtml` e `departures`. Um teste de
snapshot, gerado antes da primeira alteração do leitor, garante isso.
