# Data model — feature 011

Nenhum tipo, schema ou armazenamento muda. Muda só o conteúdo de Orlando.

## Dia 13/11 (depois)

| Campo | Valor |
|---|---|
| título | "Folga · Cocoa Beach + Disney Springs" |
| grupos (`areas`) | `Manhã livre` (bairro) → `Cocoa Beach` (bairro) → `Noite: Disney Springs` (noite) |
| transferência | em `Manhã livre`: "🚗 Deslocamento para Cocoa Beach (~1h de carro, saída ~12h)" |
| paradas marcáveis do KSC | 0 |
| "Mapa do dia" | Cocoa Beach Pier → Disney Springs |

## Preparação (depois)

- **Reservas**: 5 linhas, sem o KSC. A frase de abertura diz "Três itens se compram antes".
- **Checklist**: sem "Comprar o ingresso do Kennedy Space Center". As datas ficam
  `['2026-11-09','2026-11-10','2026-11-10','2026-11-14','2026-11-12']` (conferir no teste real).

## Arquivos de conteúdo

| Arquivo | Mudança |
|---|---|
| `content/full/orlando/roteiro.md` | 13/11 reescrito (R2); 3 menções apagadas (R3) |
| `content/full/orlando/doc-photos.json`, `photo-credits.json` | −3 fotos do KSC |
| `public/photos/doc/orlando/*.webp` | −3 arquivos |
| `content/full/orlando/point-links.json` | −1 ligação (KSC) |
| `content/points/orlando.json` | sem mudança (o guia mantém o KSC) |
