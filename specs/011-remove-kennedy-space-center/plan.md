# Implementation Plan: Tirar o Kennedy Space Center do roteiro de Orlando (13/11 com horário livre)

**Branch**: `011-remove-kennedy-space-center` | **Date**: 2026-10-27 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/011-remove-kennedy-space-center/spec.md`

## Summary

Mudança só de conteúdo no roteiro de Orlando. No dia 13/11:
- o bloco do Kennedy Space Center sai;
- a manhã vira "Manhã livre";
- Cocoa Beach ganha a tarde inteira (~13h às ~17h), com ida de carro (~1h) a partir do hotel;
- a Disney Springs continua à noite.

Saem também a alternativa ao outlet de 11/11, a reserva e o item do checklist do KSC, junto com
as 3 fotos das atrações do KSC. O guia de pontos não muda. Nenhum código de app muda; só testes
que citam o 13/11. Detalhes em [research.md](research.md).

## Technical Context

**Language/Version**: TypeScript 5 (strict), Node 24 para o build do conteúdo

**Primary Dependencies**: sem mudança; **nenhuma dependência nova**

**Storage**: conteúdo estático gerado no build (`npm run content`); marcas antigas do KSC ficam
no localStorage sem efeito

**Testing**: Vitest (conteúdo real, componentes) e Playwright (`chromium`, `mobile-360`,
`mobile-402`)

**Target Platform**: PWA offline, 360 × 780 e 402 × 874

**Project Type**: app web de página única (PWA)

**Performance Goals**: precache um pouco menor (−3 fotos); JS inicial sem mudança

**Constraints**:
- não inventar dados (Cocoa Beach só com o texto do roteiro; tempos de carro do próprio roteiro);
- não mexer no snapshot de NY;
- o guia mantém o KSC.

**Scale/Scope**: 1 arquivo de roteiro, 3 arquivos de dados de foto e link, 3 fotos, 4 testes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Situação |
|---|---|
| I. Offline-first | ✅ Conteúdo continua no precache. O e2e de 13/11 roda offline. |
| II. Testes obrigatórios | ✅ Testes de conteúdo real (sem "Kennedy" no roteiro; guia com o ponto), componente do dia 13/11 e e2e offline a 360 e 402 px. |
| III. Simplicidade | ✅ Nenhum código de app; só conteúdo. Fotos e ligações sem uso são removidas. |
| Plataforma mobile-first | ✅ Sem mudança de layout; e2e nas duas larguras. |

Pós-design: sem violações.

## Project Structure

### Documentation (this feature)

```text
specs/011-remove-kennedy-space-center/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/screens.md
├── checklists/requirements.md
└── tasks.md          # /speckit-tasks
```

### Source Code (repository root)

```text
content/full/orlando/
├── roteiro.md           # 13/11 reescrito; 3 menções ao KSC apagadas
├── doc-photos.json      # −3 fotos do KSC
├── photo-credits.json   # −3 créditos
└── point-links.json     # −1 ligação (KSC)
public/photos/doc/orlando/  # −3 .webp

tests/
├── content/orlando-doc-real.test.ts   # sem KSC no roteiro; checklist sem 13/11; guia mantém o ponto
├── components/orlando-day.test.tsx    # 13/11 novo
├── unit/notebook.test.ts              # dayMoves(13/11) = 1
└── e2e/us-orlando.spec.ts             # 13/11 offline
```

**Structure Decision**: só conteúdo e testes; nenhum arquivo de `src/` muda.

## Complexity Tracking

Sem violações a justificar.
