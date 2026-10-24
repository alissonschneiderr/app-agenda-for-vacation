# Quickstart: validar o roteiro de Orlando (feature 007)

## Pré-requisitos

```sh
export PATH=/opt/homebrew/opt/node@24/bin:$PATH
npm install
```

## 1. Conteúdo

```sh
npm run content:strict
```

O resumo esperado no fim é:
- `roteiro FULL nova-york`: os mesmos números de antes da feature;
- `roteiro FULL orlando`: 10 dias, 75 + 18 + 2 = 95 atividades, 69 com Feito/Pendente, 29 lugares de
  comida (mais 3 mercados na chegada de 07/11), 81 links de fotos.

Uma divergência D1–D6 aparece como erro e interrompe o build (`contracts/document-format.md`).

## 2. Testes

```sh
npm run typecheck && npm test
npm run build && npm run budget   # conteúdo ≤ 40 MB
npm run e2e
```

## 3. Cenários manuais (`?agora=` simula o momento, hora de Orlando)

| URL | Esperado |
|---|---|
| `/?agora=2026-11-08T08:00#/` | "Agora": Jungle Cruise 8h10, fila ~5 min, Adventureland, foto offline |
| `/?agora=2026-11-09T12:30#/` | Runaway Railway 13h00 · Multi Pass; Almoço como intervalo com "Ver onde comer" |
| `/?agora=2026-11-08T12:00#/perto` | Magic Kingdom com as 5 opções de "Onde comer" |
| `/?agora=2026-11-13T10:00#/dia/2026-11-13` | KSC (4 itens), deslocamento para Cocoa Beach, Cocoa Beach, volta ~18h, Disney Springs |
| `/?agora=2026-11-06T09:00#/` | seção "Reservar hoje": Multi Pass Hollywood Studios |
| `/?agora=2026-11-07T09:00#/` | "Reservar hoje" (Multi Pass EPCOT, Single Pass); "A chegada" com carro no MCO e compras, mais Mercados e Noite |
| `/?agora=2026-11-18T09:00#/` | "Antes de sair": check-out e carro no MCO; "A viagem": "De trem para Miami"; nada sobre voo internacional |
| `/?agora=2026-11-10T10:00#/viagem` | Orlando com 6 itens a reservar; "Documento de Orlando" na Consulta |
| `#/full/orlando/documento` | todas as seções do doc, na ordem |

Para conferir offline, repita os cenários com a rede desligada no DevTools depois de abrir o app uma
vez.

## 4. Fotos (Q2)

```sh
npm run photos -- --doc      # baixa o que faltar em content/full/*/doc-photos.json
npm test -- doc-photos       # cobertura ≥ 90% por cidade, licença, autor e fonte
```

O que ficar sem foto vai para `specs/007-orlando-itinerary-doc/photos-missing.md`.

## 5. Atualizar o roteiro depois

1. Exportar o doc em Markdown e substituir `content/full/orlando/roteiro.md` sem editar.
2. Rodar `npm run content:strict` e corrigir o que a conferência apontar.
