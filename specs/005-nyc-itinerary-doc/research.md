# Research: Roteiro de Nova York por bairros

## R1. Como o doc chega ao app

- **Decision**: exportar o doc em Markdown pelo conector do Claude Docs e salvar o resultado, sem
  edição, em `content/full/nova-york/roteiro.md`. O build lê esse arquivo.
- **Rationale**: o app é offline e o build não tem acesso ao Claude Docs. Uma cópia datada torna a
  conferência reproduzível (SC-001–SC-004). Atualizar = exportar de novo + `npm run content:strict`
  (FR-021).
- **Alternatives considered**:
  - sincronizar no app: exige rede e login; viola o princípio I;
  - buscar o doc no build: o CI não tem credenciais do Claude Docs.

## R2. Unidade da tela do dia: bairro

- **Decision**: cada `###` do dia vira uma **área** (`DayArea`), de quatro tipos:
  - `bairro` (📍);
  - `chegada` (✈️);
  - `noite` (🌙/🌃);
  - `ideias` (💡).

  A tela do dia mostra as áreas na ordem do doc e deixa de agrupar por Manhã/Tarde/Noite.
- **Rationale**: FR-004/FR-005; é como o casal escreveu e vai ler na rua.

## R3. O que vira atividade (conta no progresso)

- **Decision**:
  - item de lista com horário em negrito (`**10h00 — 🏛️ Nome**`, `**11h15 às 12h30 — 🛍️ …**`): atividade;
  - parágrafo de logística com horário (`**09h40 – saída:**`, `🏨 **~16h05 – volta ao hotel:**`, `🚶/🛥️/🚕 … (13h00–13h45)`): deslocamento, sem Feito/Pendente;
  - "pausa livre", "tempo livre", "tarde livre", "jantar livre": tipo `free`, sem Feito/Pendente (FR-006);
  - cada `### 🌙 Noite: …` com evento (desfile, jogo, musical, jantar no Harlem): uma atividade. O
    horário vem do título ("(19h30)") ou, sem ele, do primeiro horário em negrito da seção ("sai às
    **19h**", "**Como chegar (19h):**"). É um horário do próprio texto, não inventado.
- **Rationale**: FR-006, FR-007, FR-014; respeita Q2 (restaurantes fora do progresso).

## R4. Lugares

- **Decision**: lugares por lista rotulada, pelo parágrafo em negrito que a abre:
  - `🛍️ Lojas …` → lojas;
  - `☕🏆🍰 Onde comer …` e `🏆 Ícones …` → comida;
  - `🎬 Locações …` e `🎬 Locação no caminho:` → locações.

  Cada item de atividade com links (📷 fotos · Mapa) e descrição vira também um lugar `attraction`,
  ligado à atividade.

  Itens em itálico ou frases como "Nenhuma cafeteria…" e "Nenhum ícone…" viram avisos da área.
- **Rationale**: FR-008–FR-011, edge cases.

## R5. Campos de comida e lojas

- **Decision**:
  - comida `☕|🏆|🍰 **Nome (end.)** — texto. 💵… · fila. [Mapa](url)` → nível, nome, endereço, texto, preço, fila, mapa;
  - loja `**Nome (end.)** — tipo · estilo · 💵…. texto. [Mapa](url)` → tipo, estilo, preço, texto, mapa;
  - quando o padrão do preço não aparece (ex.: Chelsea Market), o texto fica inteiro, sem perda.
- **Rationale**: FR-002 (nada se perde mesmo quando o padrão varia).

## R6. Q1: Tenement Museum às 16h15

- **Decision**: `meta.json` ganha `checklistOverrides`. Cada entrada traz o texto exato da célula do doc
  e o texto que vale no app. O build falha se o texto não estiver mais lá, porque o doc mudou e a
  decisão precisa ser revista.
- **Alternatives considered**: editar a cópia (perde-se a cada exportação).

## R7. Compromissos

- **Decision**: no `meta.json`, Knicks `arriveBy: 18:30` (o doc diz "Cheguem por volta das 18h30"). MJ
  continua 05/11 19:00, chegada 18:30. A regra D5 confere que o horário de chegada do meta aparece no
  texto da noite correspondente.

## R8. Marcações antigas

- **Decision**: ids novos `ny3-AAAA-MM-DD-NN`; marcas `ny-…` e `nyv2-…` ficam órfãs e são ignoradas.
  Sem migração.

## R9. O que sai do código da 004

- **Decision**: o leitor de tabelas da 004 é substituído (não há mais documento nesse formato). A
  regra F11 (uma refeição de cada tipo) sai: o doc não tem refeições com horário (Q2).
  `MapsButton` vira `LinkButtons` (fotos + mapa).
