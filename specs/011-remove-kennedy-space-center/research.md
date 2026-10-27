# Research — feature 011

## R1 — Onde a mudança é feita

- **Decision**: editar só `content/full/orlando/roteiro.md`. É a fonte do dia, do documento
  completo, das reservas e do checklist. App e documento mudam juntos pelo build
  (`npm run content`).
- **Rationale**: o roteiro é o conteúdo do casal; o app só o lê. Mexer no código para esconder o
  KSC criaria divergência entre o dia e o documento.
- **Alternatives considered**: filtrar o KSC no domínio. Rejeitada: o documento completo
  continuaria com o KSC, e seria código para esconder conteúdo.

## R2 — Como o novo 13/11 fica no texto (formato que o parser já entende)

- **Decision**: seguir o padrão dos dias de folga 11/11 e 16/11:

  ```
  ## Dia 7 (sex 13/11): Folga · Cocoa Beach + Disney Springs
  <frase: manhã livre, tarde em Cocoa Beach, Disney Springs à noite>
  🗺️ **Mapa do dia:** [Cocoa Beach → Disney Springs](…/maps/dir/Cocoa+Beach+Pier/Disney+Springs)
  ### 📍 Manhã livre
  - <texto curto de folga, sem sugestão nova>
  ### 🚗 Deslocamento para Cocoa Beach (~1h de carro, saída ~12h)
  ### 📍 Cocoa Beach
  <texto do roteiro; a frase do horário vira "das ~13h às ~17h">
  ### 🏨 ~17h – volta ao hotel (~1h de carro)
  ### 🌙 Noite: Disney Springs   (sem mudança)
  ```

- **Rationale**:
  - "### 📍 Manhã livre" já é um grupo do dia em 11/11 e 16/11.
  - O "### 🚗 Deslocamento…" vira a transferência do grupo anterior, como hoje entre o KSC e
    Cocoa Beach. Na regra da 010, "carro" mantém "Transporte" com esse trecho.
  - O tempo de ~1h vem do próprio roteiro (a volta de Cocoa Beach ao hotel).
- **Resultado esperado**:
  - grupos de 13/11: `['Manhã livre', 'Cocoa Beach', 'Noite: Disney Springs']`;
  - `dayMoves(13/11)` = 1 (carro até Cocoa Beach);
  - nenhuma parada marcável do KSC.
- **Alternatives considered**: a linha "**12h00 – saída:**" antes de Cocoa Beach. Rejeitada: o
  parser liga as saídas ao começo do dia, antes dos grupos, e a saída ficaria antes da manhã livre.

## R3 — Outras menções (Q2)

- **Decision**: no roteiro, apagar:
  - "**Alternativa ao outlet:** Kennedy Space Center…" (11/11);
  - a linha "Ingresso Kennedy Space Center" da tabela de reservas;
  - "- [ ] Comprar o ingresso do Kennedy Space Center".

  A frase de abertura das reservas diz "Quatro itens se compram antes". Com o KSC fora, sobram
  três. A frase passa a dizer "Três itens…", porque a contagem tem que bater com a tabela.
- **Outlets**: o roteiro já tem o Orlando Vineland Premium Outlets (11/11) e o Orlando
  International Premium Outlets (16/11), os dois grandes outlets de Orlando. Nenhum é acrescentado.

## R4 — Fotos e ligação com o guia

- **Decision**:
  - tirar de `content/full/orlando/doc-photos.json` e `photo-credits.json` as 3 fotos das
    atrações do KSC ("Space Shuttle Atlantis", "KSC Bus Tour e Apollo/Saturn V Center", "Gateway e
    Rocket Garden");
  - apagar os 3 `.webp` em `public/photos/doc/orlando/`;
  - tirar "Kennedy Space Center Visitor Complex" de `point-links.json`.

  O ponto `orl-kennedy-space-center` do guia, com a foto dele, fica.
- **Rationale**: fotos sem uso não devem ir para o precache nem para a página de créditos
  (constituição: código e dados mortos saem).

## R5 — Testes afetados

| Arquivo | Mudança |
|---|---|
| `tests/components/orlando-day.test.tsx` | o teste "13/11: KSC → …" passa a "Manhã livre → Cocoa Beach → Disney Springs", sem "Kennedy" |
| `tests/e2e/us-orlando.spec.ts` | 13/11 offline: grupos `['Manhã livre', 'Cocoa Beach', 'Noite: Disney Springs']` |
| `tests/unit/notebook.test.ts` | `dayMoves(13/11)` = 1; o exemplo "~1h de carro até o Kennedy Space Center." em `isRelevantMove` é texto de teste e pode ficar |
| `tests/content/orlando-doc-real.test.ts` | checklist sem a data `2026-11-13` |
| `tests/unit/doc-parser.test.ts` | **não muda**: usa um trecho de roteiro de exemplo, embutido no teste |

Um teste novo confere que o roteiro real de Orlando não tem "Kennedy" nem "KSC" (SC-001), e que
o guia continua com o ponto (SC-003).
