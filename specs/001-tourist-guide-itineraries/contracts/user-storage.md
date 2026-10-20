# Contract: Dados do usuário no aparelho

Armazenados apenas em `localStorage` (FR-017), na chave `ctha:user:v1`. Somente
`src/storage/user-store.ts` lê e escreve essa chave. Campos e regras: [data-model.md](../data-model.md).

```json
{
  "schemaVersion": 1,
  "seededIds": ["sug-2026-10-31", "sug-2026-11-01"],
  "favorites": [
    { "pointId": "ny-met", "pointName": "The Metropolitan Museum of Art",
      "savedAt": "2026-11-01T14:03:00Z" }
  ],
  "itineraries": [
    {
      "id": "3f1c…",
      "name": "Magic Kingdom",
      "date": "2026-11-08",
      "origin": "suggested",
      "sourceId": "sug-2026-11-08",
      "items": [ { "pointId": "orl-magic-kingdom", "pointName": "Magic Kingdom Park" } ],
      "createdAt": "2026-10-30T10:00:00Z",
      "updatedAt": "2026-10-30T10:00:00Z"
    }
  ]
}
```

## Garantias

- **Escrita imediata**: toda operação grava o estado completo de forma síncrona antes de a UI
  confirmar (FR-014). Não há fila nem sincronização.
- **Leitura tolerante**: se a chave estiver ausente, cria o estado vazio e roda o seed; se o JSON
  estiver corrompido, guarda uma cópia em `ctha:user:corrupt:<timestamp>`, recomeça vazio e avisa
  o usuário.
- **Falha de escrita** (`QuotaExceededError`): a operação é desfeita na memória e a UI mostra
  "Não foi possível salvar: armazenamento cheio"; o estado anterior permanece intacto.
- **Seed** (R10): para cada roteiro sugerido cujo `id` não está em `seededIds`, cria um roteiro
  `origin: "suggested"` e adiciona o `id` a `seededIds`. Nunca altera roteiros existentes (FR-025).
- **Migrações**: mudanças de formato incrementam `schemaVersion` e precisam de função de migração
  testada; chave nova só se a migração for impossível.
- **Persistência**: na primeira execução o app chama `navigator.storage.persist()`.
