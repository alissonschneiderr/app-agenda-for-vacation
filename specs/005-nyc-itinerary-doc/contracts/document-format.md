# Contract: Formato do doc (exportação Markdown do Claude Docs)

Todo conteúdo não reconhecido é preservado como HTML (notas da área ou do dia) e nunca descartado.
A exportação escapa `~` como `\~`.

## Estrutura

| Bloco | Forma | Vira |
|---|---|---|
| Título / autoria | `# …` + `Oct 22, 2026 · @Alisson` | `source` |
| Dia | `## Dia N (dia, dd/mm): bairros` | `FullDay` (`region` = bairros) |
| Resumo | 1º parágrafo do dia | `goal` |
| Mapa do dia | parágrafo `🗺️ **Mapa do dia:** [..](url)` | `mapUrl` |
| Saída | parágrafo `**hhHmm – saída…**` | atividade `transit` (área nula) |
| Área | `### 📍|✈️|🌙|🌃|💡 Nome` | `DayArea` |
| Fotos da área | parágrafo `[📷 ver fotos …](url)` | `area.photoUrls` |
| Texto da área | 1º parágrafo comum | `area.intro` |
| Item com horário | `- **hhHmm — ícone Nome** [🎟️ *nota*]` + subitens `[📷 fotos](u) · [Mapa](u)` e texto | atividade + lugar `attraction` |
| Item de logística em lista | `- **hhHmm – saída a pé** …`, `- **\~12h00 — pausa livre** …` | `transit` / `free` |
| Lista rotulada | parágrafo em negrito `🛍️ Lojas…`, `☕🏆🍰 Onde comer…`, `🏆 Ícones…`, `🎬 Locações…` + lista | lugares `shop` / `food` / `screen` |
| Locação avulsa | parágrafo `🎬 **Locação no caminho:** **Nome** — obra…` | lugar `screen` |
| Logística | parágrafo `🚶|🛥️|🚕|🏨 **…**` (com ou sem horário) | `transit`, na área anterior |
| Noite com evento | `### 🌙 Noite: X` (horário do título ou do 1º horário em negrito) | atividade (`commitment` se casar com o meta) |
| Jantar/noite livre | parágrafo `🌙 **Noite: jantar livre…**` | `free` |
| Partida | `## ✈️ Partida (…, dd/mm)` | `dayNotes[data]` |
| O que comprar antes | tabela `Data \| Atração \| Situação` | `checklist` |
| Demais `##` | Sugestões, Dicas práticas… | `docHtml` |

## Horários

`HHhMM`, `HHh` (= HH:00), `\~HHhMM`, `HHhMM às HHhMM`, `HHhMM–HHhMM`, `até \~HHhMM`. O texto do
horário é preservado em `timeLabel`.

## Classificação dos itens com horário

- Ícone 🛍️ → `shopping`; 🎬 → `screen`; 🏛️ 🌳 📸 → `attraction`.
- Texto com "saída", "volta", "caminho para o metrô", "chegada ao" → `transit`.
- "pausa livre", "tempo livre", "tarde livre" → `free`.

## Regras de fidelidade (o build falha)

- **D1**: toda linha com horário do doc (item de lista ou parágrafo de logística) e toda `### 🌙
  Noite` com evento correspondem a uma atividade, na mesma ordem, com o mesmo `timeLabel`.
- **D2**: todo item das listas de lojas, comida e locações vira um lugar da área certa (contagem igual
  por área).
- **D3**: todo link `google.com/maps` e `google.com/search?tbm=isch` dos dias está num lugar, numa área
  ou no dia; todos os links do doc estão no `docHtml`.
- **D4**: todo `##` e `###` do doc aparece (como dia, área ou seção).
- **D5**: o horário de chegada de cada compromisso do meta aparece no texto da sua noite.
