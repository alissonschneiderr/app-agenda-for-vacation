# Data Model: feature 009

O conteúdo não muda. Só os modelos de tela, calculados em `src/domain/notebook.ts`.

## DaySection (novo)

```ts
type DaySectionId = 'paradas' | 'comer' | 'lojas' | 'bairros' | 'transporte' | 'dicas';
interface DaySection { id: DaySectionId; label: string; count: number }
```

- **Rótulos**: Paradas · Restaurantes e Cafés · Brechós e Lojas · Bairros · Transporte · Dicas.
- **`daySections(view, content)`**: devolve só as seções com `count > 0`, nesta ordem. O `count` vem
  da regra de R4.
- **Nos dias de viagem**:
  - `transporte` conta os itens dos três blocos;
  - `paradas` só existe se houver passos.

## DayPlace (novo, item de "Restaurantes e Cafés" / "Brechós e Lojas")

| Campo | Origem |
|---|---|
| `id` | `DocPlace.id` |
| `name` | `DocPlace.name` |
| `where` | `DocPlace.address`, ou o nome da região |
| `summary` | 1º texto sem rótulo de `fields`, ou `works` |
| `level` / `price` | quando houver (☕/🏆/🍰, 💵) |
| `mapUrl` | 1º `mapsUrls` |
| `photo` | `DocPlace.photo`, quando houver |
| `href` | `#/perto/<data>/<região>/<id>` |

Os lugares com o mesmo nome no mesmo dia aparecem uma vez, na primeira região.

## DataReview (novo, relatório da entrega, FR-022)

Gerado por `npm run content` (resumo no console) e escrito em
`specs/009-mobile-first-navigation/data-review.md`. Lista os lugares de comida e de loja sem
endereço e sem link de mapa, e o texto citado sem estrutura (mercados de 07/11).

## Rotas

| Rota | Mudança |
|---|---|
| `#/` | Início só com as cidades |
| `#/cidade/:c` | só a lista de dias; `#/cidade/:c/:aba` → `#/cidade/:c` |
| `#/dia/:d` | menu de seções |
| `#/exibicao` | nova: o liga/desliga do alto contraste |
| `#/dicas`, `#/transporte`, `#/viagem`, `#/perto` | → `#/` |

O resto continua: `#/dia/:d/:k`, `#/perto/:d/:a[/:p]`, `#/motorista/...`, `#/guia...`, `#/ponto/...`,
`#/full/:c/documento...`, `#/creditos`, `#/favoritos` e `#/roteiros...`.

## Estado do usuário

Sem mudança. As marcas `ck:…` (Reservar hoje) ficam guardadas, sem tela.
