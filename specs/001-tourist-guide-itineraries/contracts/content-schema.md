# Contract: Conteúdo do guia

Fonte editável em `content/`; o build (`scripts/build-content.ts`) valida e gera
`public/data/content.json`, o único arquivo que o app lê. Campos e regras: [data-model.md](../data-model.md).

## `public/data/content.json` (gerado)

```json
{
  "version": "2026-10-28T12:00:00Z",
  "cities": [
    { "id": "nova-york", "name": "Nova York", "timeZone": "America/New_York",
      "center": { "lat": 40.758, "lng": -73.9855 } }
  ],
  "trip": [
    { "cityId": "nova-york", "arrive": "2026-10-31", "depart": "2026-11-07" },
    { "cityId": "orlando",   "arrive": "2026-11-07", "depart": "2026-11-18" },
    { "cityId": "miami",     "arrive": "2026-11-18", "depart": "2026-11-21" }
  ],
  "categories": [ { "id": "museu", "name": "Museu" } ],
  "points": [
    {
      "id": "ny-met",
      "cityId": "nova-york",
      "categoryId": "museu",
      "name": "The Metropolitan Museum of Art",
      "summary": "Um dos maiores museus de arte do mundo.",
      "description": "…",
      "address": "1000 5th Ave, New York, NY 10028",
      "location": { "lat": 40.7794, "lng": -73.9632 },
      "openingHours": {
        "mon": [{ "open": "10:00", "close": "17:00" }], "tue": [], "wed": [],
        "thu": [], "fri": [{ "open": "10:00", "close": "21:00" }], "sat": [], "sun": [],
        "exceptions": { "2026-11-26": "closed" }
      },
      "price": "US$ 30 adulto",
      "officialUrl": "https://www.metmuseum.org",
      "photos": [
        { "src": "photos/ny-met-1.webp", "alt": "Fachada do museu na Quinta Avenida",
          "author": "…", "license": "CC BY-SA 4.0",
          "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
          "sourceUrl": "https://commons.wikimedia.org/wiki/File:…" }
      ],
      "status": "active",
      "verifiedAt": "2026-10-22"
    }
  ],
  "suggestedItineraries": [
    { "id": "sug-2026-11-08", "date": "2026-11-08", "title": "Magic Kingdom",
      "notes": "Chegar antes da abertura.", "pointIds": ["orl-magic-kingdom"] }
  ]
}
```

(Os valores acima são ilustrativos; o conteúdo real é produzido na implementação.)

## Arquivos-fonte em `content/`

| Arquivo | Conteúdo |
|---|---|
| `trip.json` | `{ cities, trip }` |
| `categories.json` | `[{ id, name }]` |
| `points/<cidade>.json` | pontos no formato de `Point`, mas com `photos: [{ "ref": "wiki:Central Park", "alt": "…" }]` |
| `photo-credits.json` | gerado por `npm run photos`: `{ "<pointId>-<n>": { ref, src, author, license, licenseUrl, sourceUrl } }` |
| `itineraries.json` | `SuggestedItinerary[]` |

`ref` aceita `File:<nome na Commons>` ou `wiki:<artigo da Wikipédia em inglês>`. O build junta o
crédito ao `alt` de cada foto; foto sem crédito correspondente fica de fora (e o `--strict` acusa).

## Regras que fazem o build falhar

Regras 1, 4 e as de integridade da 5 valem sempre (`npm run content`). Regras 2, 3, a contagem de
19 roteiros da 5, a 6 e a 7 valem só no modo `--strict` (`npm run content:strict`, usado no CI).

1. JSON não corresponde ao schema Zod.
2. Ponto sem foto, endereço, horário, preço ou `verifiedAt` (SC-008).
3. Foto sem arquivo em `public/photos/` ou sem autor/licença (FR-003a).
4. Licença fora da lista permitida (CC0, Public Domain, CC BY, CC BY-SA).
5. Dia de passeio sem roteiro sugerido **nem** dia de roteiro FULL (feature 002), ou com os dois;
   roteiro sugerido em dia de locomoção, duplicado por data, com `pointIds` inexistentes, repetidos ou
   de outra cidade (FR-023, FR-026; ajustada pela feature 002, FR-028).
6. Algum dos 7 parques de FR-024 sem dia próprio em Orlando.
7. Tamanho total de `public/data` + `public/photos` > 40 MB.
