# Quickstart — validar a feature 013

```sh
export PATH=/opt/homebrew/opt/node@24/bin:$PATH
npm run typecheck && npm test && npm run content:strict && npm run build && npm run budget && npm run e2e
```

## Cenários (manual, com `npm run dev`; `?agora=` simula a data do aparelho)

1. `/?agora=2026-11-02T10:00#/cidade/nova-york`: o primeiro card visível é 02/11; rolando para
   cima aparecem 01/11 e 31/10.
2. `/?agora=2026-10-28T10:00#/cidade/nova-york`: começa em 31/10.
3. `/?agora=2026-11-10T10:00#/cidade/nova-york`: começa em 31/10.
4. `/?agora=2026-11-07T10:00#/cidade/orlando`: começa no card de 07/11.
5. Cards: chip "19/11" e "Quinta-feira" (Miami). Dia 01/11: cabeçalho "01/11 · …", capa "01/11" e
   "Domingo".
6. Bairros:
   - 03/11 sem Central Park, Museu de História Natural e MET; com Upper West Side e Upper East Side;
   - 11/11 sem "Manhã livre" (o menu mostra "Bairros" só se tiver bairro);
   - 08/11 sem o item "Bairros";
   - 18/11 com South Beach (Art Deco District).
7. `#/perto/2026-11-08/magic-kingdom`: capa sem "Bairro".
8. Repetir 1, 5 e 6 a 360 px e 402 px.
