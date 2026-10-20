# Contract: Conteúdo do roteiro FULL

Fonte: `content/full/<cidade>/` — `meta.json` (tudo exceto `days`) e um `AAAA-MM-DD.json` por dia (um `FullDay`). O build valida e inclui o
objeto em `public/data/content.json` como `fullItineraries: FullItinerary[]`. Campos e regras:
[data-model.md](../data-model.md).

## Exemplo (ilustrativo)

```json
{
  "id": "nova-york",
  "cityId": "nova-york",
  "title": "Roteiro FULL de Nova York",
  "travelers": "Casal",
  "base": { "name": "POD 51", "address": "230 East 51st Street, New York, NY 10022",
            "location": { "lat": 40.7553, "lng": -73.9686 } },
  "arrival": { "airport": "JFK", "date": "2026-10-31", "time": "06:30" },
  "commitments": [
    { "id": "knicks-nets", "date": "2026-11-02", "time": "19:30", "arriveBy": "18:45",
      "title": "New York Knicks x Brooklyn Nets",
      "place": { "name": "Madison Square Garden", "address": "4 Penn Plaza, New York, NY 10001" } }
  ],
  "days": [
    {
      "date": "2026-11-02",
      "region": "…",
      "goal": "…",
      "events": [],
      "activities": [
        { "id": "ny-2026-11-02-01", "type": "meal", "title": "Café da manhã", "start": "09:30",
          "durationMin": 45, "priority": "important", "earlyReason": "…",
          "place": { "name": "…", "address": "…" },
          "description": "…", "booking": { "required": false },
          "meal": { "kind": "breakfast", "order": "…", "why": "…", "priceRange": "US$ 15–25 por pessoa" },
          "facts": [ { "text": "Abre às 8h", "status": "confirmed",
                       "source": "https://…", "checkedAt": "2026-10-21" } ] },
        { "id": "ny-2026-11-02-12", "type": "commitment", "commitmentId": "knicks-nets",
          "title": "Knicks x Nets", "start": "18:45", "durationMin": 180, "priority": "essential",
          "place": { "name": "Madison Square Garden", "address": "4 Penn Plaza, New York, NY 10001" },
          "description": "…", "booking": { "required": false }, "facts": [] }
      ],
      "returnToHotel": "…",
      "alternatives": [ { "when": "rain", "text": "…" }, { "when": "tired", "text": "…" } ]
    }
  ],
  "checklist": [ { "what": "…", "forDate": "2026-11-01", "deadline": "2026-10-28", "link": "https://…" } ],
  "practicalTips": [ { "topic": "Transporte", "text": "…" } ],
  "excluded": [ { "name": "Coney Island (brinquedos)", "reason": "…" } ],
  "updatedAt": "2026-10-24"
}
```

## Regras que fazem `npm run content:strict` falhar

| # | Regra | Requisito |
|---|---|---|
| F1 | Schema Zod do objeto | — |
| F2 | 7 dias, 2026-10-31 a 2026-11-06, em ordem | FR-001 |
| F3 | Cada dia com region, goal, ≥ 1 atividade, returnToHotel | FR-002 |
| F4 | Atividades em ordem; fim ≤ início da próxima | FR-004, SC-002 |
| F5 | Entre atividades com endereços diferentes há uma `transit` | FR-004, SC-002 |
| F6 | Início ≥ 10:00 salvo 31/10 ou `earlyReason` | FR-005 |
| F7 | Dia começa e termina no hotel (primeira e última atividade com o endereço da base ou `transit` de/para ela) | FR-006 |
| F8 | Compromissos de 02/11 e 04/11 presentes, com `start` ≤ horário − 30 min | FR-007, SC-003 |
| F9 | Nenhuma atividade `attraction` com tema de espetáculo em 04/11 além do *MJ* | FR-008 |
| F10 | 31/10 começa no JFK e inclui `transit` JFK → hotel e chegada ao hotel | FR-009 |
| F11 | Uma refeição de cada tipo por dia; almoço 12:00–14:00; lanche 15:30–16:30 | FR-012 |
| F12 | Nenhum texto contém termos proibidos (ostra, oyster, frutos do mar, seafood, lobster, camarão, shrimp, steakhouse, B&H, Tiffany) | FR-013, FR-017, SC-004 |
| F13 | `transit` até refeição ou local de série ≤ 20 min | FR-014, SC-007 |
| F14 | Apple Store só com `shop.justification` | FR-017 |
| F15 | `screen`: work, kind, access, association e address preenchidos | FR-019, SC-006 |
| F16 | Toda `fact` com `source` + `checkedAt`, ou `status: unconfirmed` com `note` | FR-021, SC-005 |
| F17 | ≥ 1 alternativa `rain` e ≥ 1 `tired`/`closed` por dia | FR-023, SC-001 |
| F18 | Todo `booking.required` tem `ChecklistItem` correspondente | FR-024 |
| F19 | `pointId`, quando presente, existe no guia | — |

A regra 5 do contrato de conteúdo da feature 001 passa a ser: **cada dia de passeio é coberto por um
roteiro sugerido ou por um dia de `fullItineraries`**, e um mesmo dia não pode ter os dois.
