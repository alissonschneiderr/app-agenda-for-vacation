# Quickstart — validar a feature 010

```sh
export PATH=/opt/homebrew/opt/node@24/bin:$PATH
npm run typecheck && npm test && npm run content:strict && npm run build && npm run budget && npm run e2e
```

`npm run e2e` inclui os projetos `mobile-360` (360 × 780) e `mobile-402` (402 × 874).

## Cenários (manual, com `npm run dev`)

1. **Agrupamento** — abrir `/?agora=2026-11-01T09:00#/dia/2026-11-01`, tocar em "Restaurantes e
   Cafés". Esperado:
   - 6 cabeçalhos, na ordem SoHo, Nolita, Chinatown, Little Italy, Lower East Side, East Village;
   - 24 cards no total;
   - ao rolar, o nome do bairro fica preso abaixo do menu.
2. **Curiosidades** — no mesmo dia, o item "Curiosidades" aparece entre "Brechós e Lojas" e
   "Bairros", com 5 lugares em 4 grupos. Em `#/dia/2026-11-05` o item não aparece.
3. **Cabeçalho que não é bairro** — `#/dia/2026-11-06`, "Restaurantes e Cafés": grupos "Empire
   State e arredores (Midtown South)" e "Noite: jantar no Harlem" (Q2 = A).
4. **Transporte**:
   - `#/dia/2026-10-31` e `#/dia/2026-11-09`: sem "Transporte";
   - `#/dia/2026-11-01`: só o trecho do metrô 6, sem os trechos a pé;
   - `#/dia/2026-11-04`: metrô 6 e NYC Ferry;
   - `#/dia/2026-11-07`: blocos de troca de cidade.
5. **Dicas** — `#/dia/2026-11-01`: a dica da Maratona inteira. Os dias com "Dicas" continuam os
   mesmos 9 da 009.
6. **Atração de compras** — abrir "Compras no SoHo" a partir das paradas de 01/11. Esperado:
   - "Lojas e brechós em SoHo" com 5 cards, com o mesmo texto do grupo SoHo de "Brechós e Lojas";
   - "Ver todas as lojas do dia" abre o dia rolado até "Brechós e Lojas".

   Em "Compras (tarde)" de 11/11, sem bloco.
7. **Celular** — repetir 1, 4 e 6 a 360 px e 402 px: sem rolagem lateral e alvos ≥ 44 px.

## Relatório

`specs/010-day-sections-by-neighborhood/report.md` é escrito a partir de `sectionReview` e lista,
por dia, as seções removidas, os trechos e dicas cortados e os grupos para revisar.
