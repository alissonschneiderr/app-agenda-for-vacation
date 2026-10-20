# Contract: Dados do usuário v2

Evolui [001 user-storage](../../001-tourist-guide-itineraries/contracts/user-storage.md). Mesma chave
`ctha:user:v1` e mesmas garantias (escrita síncrona, quota, corrupção); só o formato muda.

```json
{
  "schemaVersion": 2,
  "seededIds": [],
  "favorites": [],
  "itineraries": [],
  "activityMarks": {
    "ny-2026-11-02-04": { "state": "done", "at": "2026-11-02T16:10:00Z" },
    "ny-2026-11-02-06": { "state": "skipped", "at": "2026-11-02T18:02:00Z" }
  }
}
```

## Migração v1 → v2

- Estado com `schemaVersion: 1` válido → mesmo estado + `activityMarks: {}` + `schemaVersion: 2`,
  gravado na primeira escrita. Nenhum favorito ou roteiro se perde.
- `schemaVersion` desconhecido continua sendo tratado como corrompido (cópia de segurança + reinício).

## Operações

- `markActivity(state, id, 'done' | 'skipped', now)`, `unmarkActivity(state, id)`: puras, gravadas
  pelo `update()` do store. Falha de quota mantém o estado anterior e mostra o aviso padrão.
