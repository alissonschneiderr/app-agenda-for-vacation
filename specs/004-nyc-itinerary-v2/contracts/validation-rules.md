# Contract: Regras de validação do roteiro de NY v2

Base: regras F1–F19 da feature 002 ([contrato](../../002-nyc-full-itinerary/contracts/full-itinerary-content.md)).

| Regra | v2 | Motivo |
|---|---|---|
| F1 schema | **Mantida** (com os campos novos) | estrutural |
| F2 7 dias em ordem | **Mantida** | estrutural |
| F3 dia com conteúdo | **Mantida** | estrutural |
| F4 sem sobreposição | **Mantida** | spec FR-021; se o documento tiver sobreposição, o build aponta a linha para o casal corrigir |
| F5 deslocamento quando muda o endereço | Removida | o documento usa a coluna "Como ir", não linhas de deslocamento |
| F6 passeios ≥ 10h | Removida | o documento já define os horários |
| F7 começa/termina no hotel | Removida | idem |
| F8 compromissos com chegada ≥ 30 min | **Ajustada**: o documento tem uma linha de chegada ("18h50 Chegada ao Madison Square Garden", "18h30 Chegada ao Neil Simon Theatre") e outra do evento (19h30, 19h00); exige-se a linha de chegada com início ≤ `arriveBy` e ≥ 30 min antes do evento, e a linha do evento como `commitment` | spec FR-005/FR-006 |
| F9 nenhum outro espetáculo na noite do MJ | **Mantida**, agora em 05/11 | FR-006 |
| F10 31/10 começa no JFK | **Mantida** | documento |
| F11 refeições | Ajustada: 1 de cada tipo por dia; **sem janela de horário** | FR-021 |
| F12 termos proibidos | Removida | Q2 |
| F13 desvio ≤ 20 min | Removida | FR-021 |
| F14 Apple Store | Removida | Q2 |
| F15 locação com dados | Ajustada: obra(s) obrigatória(s), dica de foto quando houver | documento |
| F16 fonte por informação | Removida | o documento traz as fontes no fim |
| F17 alternativas por dia | Removida (plano B só onde o documento tem) | documento |
| F18 reserva no checklist | Ajustada: checklist = tabela de ingressos do documento | FR-018 |
| F19 pointId existe | **Mantida** (via `point-links.json`) | fotos |
| **D1–D4** fidelidade | **Novas** | [document-format.md](./document-format.md) |
