# Implementation Plan: O app instalado no Galaxy S24 Ultra e no iPhone 17, offline e com atualização avisada

**Branch**: `main` (a pedido do usuário) | **Date**: 2026-10-28 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/014-installable-phone-app/spec.md`

## Summary

O app continua PWA (R1) e passa a cumprir o pedido:
- **atualização**: aviso "Nova versão disponível — atualizar" no lugar do recarregamento automático
  (R2), e a versão aparece em "Exibição" (R3), que ganha um botão no Início porque o app instalado
  não tem barra de endereço;
- **dados do casal**: migram do `localStorage` para o IndexedDB, por um espelho em memória que não
  muda a lógica do app (R4), com armazenamento persistente pedido e mostrado (R5);
- **aparência de app**: tela de abertura no iPhone (gerada no build) e cores de tema do visual atual
  (R6), áreas seguras conferidas (R7) e dica de instalação no Safari do iPhone (R8);
- **sem internet**: links externos avisam em vez de abrir uma página de erro (R9).

Por fim, o repositório vira público e o app vai para o GitHub Pages pelo CI que já existe (R10,
Q2 = C).

## Technical Context

**Language/Version**: TypeScript 5 (strict), Node 24 (build e scripts)

**Primary Dependencies**: as atuais (Preact, Vite, vite-plugin-pwa, `sharp` em desenvolvimento);
**nenhuma dependência nova**

**Storage**: IndexedDB (banco `ctha`, store `kv`) para os dados do casal, com espelho em memória e
migração do `localStorage`. O cache do Service Worker guarda os arquivos e o conteúdo.

**Testing**:
- Vitest:
  - espelho e migração com um adaptador em memória;
  - aviso de atualização;
  - dica de instalação;
  - aviso sem internet;
  - "Exibição".
- Playwright (`chromium`, `mobile-360`, `mobile-402`):
  - IndexedDB real;
  - migração a partir do `localStorage`;
  - aviso de nova versão com dois builds;
  - offline;
  - áreas seguras.

**Target Platform**: Chrome no Galaxy S24 Ultra (Android 16) e Safari no iPhone 17 (iOS 26), app
instalado na tela inicial

**Project Type**: app web de página única (PWA)

**Performance Goals**:
- aviso de nova versão em até 1 min ao abrir com internet;
- primeira tela sem atraso perceptível (carregar o IndexedDB leva menos de 50 ms com o estado
  atual);
- JS inicial < 100 KB gzip.

**Constraints**:
- offline-first;
- nunca perder dados do casal;
- não recarregar sozinho;
- nada além do pedido;
- snapshot de NY intacto.

**Scale/Scope**: 2 aparelhos, 1 endereço público, cerca de 7 arquivos de código novos ou alterados,
2 imagens de abertura

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Situação |
|---|---|
| I. Offline-first | ✅ É o centro da feature. Dados em armazenamento persistente. Funções de internet com falha explícita e amigável (R9). A interface indica o estado offline ("Guia disponível offline", que já existe) e a persistência ("Exibição"). |
| II. Testes obrigatórios | ✅ Unit para espelho, migração (inclusive falha no meio), aviso de atualização, dica e aviso sem internet. E2e com IndexedDB real, migração do `localStorage`, versão nova com dois builds, modo offline e áreas seguras a 360 e 402 px. |
| III. Simplicidade | ✅ Nenhuma dependência nova. O espelho em memória reaproveita a interface `Storage`, então `user-store` e `prefs` não mudam de lógica. O splash é gerado com o `sharp` que já existe. Nada de Capacitor (R1). |
| Plataforma mobile-first | ✅ Safari do iOS e Chrome do Android, os dois alvos da constituição. |

Pós-design: sem violações.

## Project Structure

### Documentation (this feature)

```text
specs/014-installable-phone-app/
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
vite.config.ts                  # registerType 'prompt'; cores; __APP_VERSION__
index.html                      # metas do iOS, splash, theme-color
scripts/splash.ts               # gera public/splash/*.png (sharp)
public/splash/                  # telas de abertura do iPhone
src/
├── main.tsx                    # await openPersistentStorage(); registerSW com prompt; busca a cada 60 min
├── storage/persistent.ts       # novo: PersistentStorage (Map + IndexedDB) e migração
├── storage/user-store.ts       # recebe o PersistentStorage
├── storage/prefs.ts            # idem; installHintDismissed
├── lib/pwa.ts                  # updateReady, applyUpdate, persisted
├── lib/offline-links.ts        # novo: delegação de clique em link externo sem internet
├── components/UpdateBanner.tsx # novo
├── components/InstallHint.tsx  # novo
├── components/OfflineToast.tsx # novo (ou reaproveita o UndoToast)
├── pages/Start.tsx             # botão ⚙ para a Exibição
├── pages/Display.tsx           # versão, armazenamento, offline
├── app.tsx                     # monta UpdateBanner, InstallHint, offline-links
└── styles/base.css             # estilos dos avisos; padding-bottom com a área segura
tests/
├── unit/persistent-storage.test.ts
├── components/{update-banner,install-hint,display,start}.test.tsx
└── e2e/us-mobile-install.spec.ts     # projetos mobile-360 e mobile-402
.github/workflows/ci.yml        # sem mudança de lógica (BASE_PATH já existe)
README.md                       # instalar, publicar, confirmar, testar offline
```

**Structure Decision**: o projeto único de sempre. O armazenamento muda por trás da mesma interface.
Os avisos são componentes pequenos.

## Complexity Tracking

Sem violações a justificar.
