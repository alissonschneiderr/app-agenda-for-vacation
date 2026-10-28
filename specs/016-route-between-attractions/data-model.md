# Data Model: Rota entre dois lugares do roteiro

Nada é salvo no aparelho (FR-007). Modelos de tela, calculados do conteúdo.

## RouteSpot (`src/domain/route.ts`)

| Campo | Tipo | Regra |
|---|---|---|
| `key` | string | chave do passo (`activity.key`) ou id do lugar (`DocPlace.id`) — a mesma da rota `#/rota/<data>/<key>` |
| `date` | DateStr | dia do roteiro |
| `name` | string | nome do lugar do passo (`places[0].name`) ou título do passo; nome do lugar |
| `time` | string? | só para passos: `timeLabel` ou `start` |
| `group` | `'paradas' \| 'comer' \| 'lojas' \| 'curiosidades'` | passo com check → `paradas`; lugar `food` → `comer`, `shop` → `lojas`, `screen` → `curiosidades` |
| `target` | string | local para o Google Maps: `mapsQuery(mapsUrls[0].url)`; senão `lat,lng` do ponto. Obrigatório — sem ele não há `RouteSpot` |
| `address` | string | para o aviso offline: endereço do roteiro; senão `target` |

## Funções

- `routeSpot(content, state, date, key): RouteSpot | null` — a origem da tela.
- `routeSpots(content, state, cityId): { date, spots: RouteSpot[] }[]` — por dia da cidade, na ordem
  do roteiro; sem repetidos dentro do dia (mesmo `target`).
- `routeChoices(content, state, origin, withOtherDays)` — os dias (o da origem primeiro), sem a origem.
- `routeUrl(from: RouteSpot, to: RouteSpot): string` —
  `https://www.google.com/maps/dir/?api=1&origin=<enc(from.target)>&destination=<enc(to.target)>`.
- `hasRoute(content, state, date, key): boolean` — origem com `target` e pelo menos outro lugar na
  cidade (FR-001).

## Regras

- Passos `free` e de deslocamento não entram (não têm check nem local próprio).
- Lugar de `kind: 'attraction'` não entra como lugar solto: já está no passo.
- Cidade da origem: `cityForDate`, e o dia de troca pertence à cidade dona do roteiro do dia (feature
  013).
