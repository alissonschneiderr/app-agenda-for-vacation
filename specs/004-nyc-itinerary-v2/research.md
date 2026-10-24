# Research: Roteiro de Nova York v2

## R1. Documento como fonte única

- **Decision**: salvar o documento sem alterações em `content/full/nova-york/roteiro.md` e convertê-lo
  no build.
- **Rationale**: FR-003 (sem reescrita), FR-015/SC-004 (todas as seções), correções futuras num lugar só.
- **Alternatives considered**: transcrição manual para os JSON da 002 (erro e divergência); manter o
  documento só como página estática sem agenda (perderia Feito/Pendente e a timeline da 003).

## R2. Leitura do Markdown

- **Decision**: `marked` (dev) para tokenizar; o parser percorre os tokens por cabeçalho:
  - `## dd/mm (dia) — título` abre um dia; o parágrafo seguinte é o resumo do dia;
  - a primeira tabela `Horário | Programa | Como ir` vira as linhas do dia;
  - `### Onde comer`: cada parágrafo `**Nome** emoji · [links]` + lista `- **Campo:** texto` vira um lugar
    de comida;
  - `### Locações…`: cada item `**Nome** (endereço) · [Maps] — obra(s). Foto: dica`;
  - `### Compras do dia`: parágrafo `**Nome** (endereço) · [links]` + lista de campos;
  - `### Atrações do dia`: itens `**Nome** — ingresso/grátis. [Maps]`;
  - demais parágrafos/listas do dia (dicas do desfile, destaques, segurança, opcionais) viram notas do dia;
  - seções `##` que não são dias viram seções gerais (HTML gerado pelo próprio `marked`).
- **Rationale**: o documento é regular; o lexer resolve tabelas, negrito, links e escapes.
- **Alternatives considered**: expressões regulares sobre o texto bruto (frágeis com tabelas e links).

## R3. Horários das linhas

- **Decision**: `HHhMM–HHhMM` → início e fim; `HHhMM` sozinho → só início, com duração inferida até a
  próxima linha marcada como `inferredDuration` (não exibida); `\~HHhMM` → `approx: true`.
- **Rationale**: a timeline e o "próxima atividade" precisam de duração; a interface não inventa
  duração (spec, edge cases).

## R4. Classificação das linhas

- **Decision**: `**Café:**/**Almoço:**/**Café da tarde:**/**Jantar:**` → refeição (café da tarde = lanche);
  linhas que começam com `Volta`, `Ida`, `Saída`, `Táxi` ou "Pouso" → deslocamento/logística (sem
  Feito/Pendente); `**Descanso no hotel**` → descanso; Knicks e MJ → compromissos; `Opcional:` →
  `optional: true`; resto → atração.
- **Rationale**: segue as convenções do próprio documento.

## R5. Ligação linha ↔ lugares

- **Decision**: para refeições, casar o nome após o rótulo com o título do bloco em "Onde comer"
  (comparação normalizada por prefixo); para atrações, locações e lojas, casar quando o nome do lugar
  aparece no texto do "Programa". Lugares do dia que não casam com nenhuma linha continuam visíveis nas
  seções do dia. O build falha se uma refeição não achar seu lugar (SC-002).
- **Alternatives considered**: mapa manual linha→lugar (mais trabalho e frágil a edições).

## R6. Fotos

- **Decision**: `point-links.json` liga nomes do documento a pontos do guia (ex.: "Grand Central
  Terminal" → `ny-grand-central`, "Top of the Rock" → `ny-top-of-the-rock`); validado no build. Sem
  ligação, o detalhe usa o ícone da categoria e o botão do Maps (o documento diz "o link do Maps abre as
  fotos reais").

## R7. Regras de validação

- **Decision**: ver [contracts/validation-rules.md](./contracts/validation-rules.md). Mantidas as
  estruturais; removidas as que o documento contradiz (Q2 e FR-021); novas regras de fidelidade
  (contagens contra o próprio Markdown).

## R8. Marcações antigas

- **Decision**: prefixo de ID `nyv2-AAAA-MM-DD-NN`; marcas `ny-…` ficam órfãs no armazenamento e são
  ignoradas pela visão (já é o comportamento de `trip-view`). Sem migração.
- **Rationale**: FR-004/SC-005 sem tocar no armazenamento.
