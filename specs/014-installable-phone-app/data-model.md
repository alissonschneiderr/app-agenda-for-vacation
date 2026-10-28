# Data model — feature 014

## Armazenamento do aparelho

| Onde | O quê | Antes | Depois |
|---|---|---|---|
| IndexedDB `ctha` / store `kv` | `ctha:user:v1` (marcas, roteiros, favoritos, reservas marcadas), `ctha:prefs` (alto contraste, dica de instalação dispensada), `ctha:offline-ready` | `localStorage` | IndexedDB (espelho em memória, R4) |
| Cache do Service Worker | arquivos do app, conteúdo, fotos | igual | igual (troca só na atualização) |

- Formato dos valores: o mesmo JSON de hoje (string). O `schemaVersion` do estado não muda.
- Migração: uma vez, IndexedDB vazio e `localStorage` com `ctha:*` → copia, confere, apaga do
  `localStorage`. É idempotente. Se falhar, os dados continuam no `localStorage`.

## Preferências (`ctha:prefs`)

Campo novo `installHintDismissed?: boolean` (dica de instalação do iPhone fechada).

## Versão

`__APP_VERSION__ = "AAAA-MM-DD · <sha7>"`, constante do build.

## Estado de atualização (em memória)

`updateReady: boolean` (há versão nova esperando). `dismissed: boolean` (o aviso foi fechado nesta
abertura).
