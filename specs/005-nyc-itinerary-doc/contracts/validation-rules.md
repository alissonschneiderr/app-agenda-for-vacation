# Contract: Regras de validação (feature 005)

Base: [regras da 004](../../004-nyc-itinerary-v2/contracts/validation-rules.md).

| Regra | 005 | Motivo |
|---|---|---|
| F1 schema | Mantida, com áreas, tipo `free` e `photoUrls` | estrutural |
| F2 7 dias em ordem | Mantida | estrutural |
| F3 dia com conteúdo | Mantida | estrutural |
| F4 sem sobreposição | **Ajustada**: só entre atividades com horário final; itens sem fim não geram duração inferida que acuse sobreposição | o doc tem itens sem fim (ex.: "09h45 – saída a pé") |
| F8 compromisso | **Ajustada**: atividade do compromisso presente; `arriveBy ≤ time − 30`; o horário de chegada aparece no texto da noite (D5) | o doc não tem linha "Chegada ao…" |
| F9 nenhum outro espetáculo na noite do MJ | Mantida (05/11) | FR-014 |
| F10 31/10 começa no JFK | **Ajustada**: a primeira área do dia cita o JFK, e há uma linha com horário até o Pod 51 | formato por áreas |
| F11 refeições | **Removida** | o doc não tem refeições com horário (Q2) |
| F15 locação com obra | Mantida | FR-010 |
| F18 ingresso no checklist | Mantida: todo item com 🎟️ está ligado a um item do checklist | FR-017 |
| F19 pointId existe | Mantida | fotos do guia |
| D1–D5 | Novas | [document-format.md](./document-format.md) |
| Overrides | Novo: cada `checklistOverrides.find` existe no doc | Q1 |
