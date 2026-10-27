# Quickstart — validar a feature 012

```sh
export PATH=/opt/homebrew/opt/node@24/bin:$PATH
npm run content && npm run photos -- --doc --city miami
npm run typecheck && npm test && npm run content:strict && npm run build && npm run budget && npm run e2e
```

## Cenários (manual, com `npm run dev`)

1. `#/cidade/miami`: 4 dias, com os títulos do documento.
2. `/?agora=2026-11-18T16:00#/dia/2026-11-18`:
   - Transporte com "A chegada" (14h21, Uber/táxi/Metrobus/shuttle, Kasa La Flora);
   - Paradas com Lummus Park, Pôr do sol, Ocean Drive e Española Way;
   - Curiosidades com The Carlyle e 728 Ocean Drive.
3. `#/dia/2026-11-19`: Sawgrass com 3 paradas, 5 categorias de lojas, 5 restaurantes e o Uber em
   Transporte.
4. `#/dia/2026-11-20`: praia e South Pointe, Joe's Stone Crab com a reserva, e sem Transporte.
5. Abrir Lummus Park: descritivo completo, mapa e "Grátis".
6. `#/full/miami/documento`: todas as seções; reservas com 6 itens.
7. `#/roteiros`: sem os sugeridos de Miami. Num aparelho que já os tinha semeado, eles somem
   ao abrir.
8. `#/dia/2026-11-07` (Orlando): igual a antes.
9. Repetir 2 a 4 a 360 px e 402 px, offline.
