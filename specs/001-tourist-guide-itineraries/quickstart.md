# Quickstart: validação da feature 001

Guia para provar, de ponta a ponta, que a feature funciona. Formatos em
[contracts/](./contracts/) e regras em [data-model.md](./data-model.md).

## Pré-requisitos

- Node.js 24 LTS e npm
- Navegadores do Playwright: `npx playwright install chromium webkit`
- Celular com iOS 17+ ou Android atual para a validação final

## Setup e comandos

```bash
npm install
npm run content        # valida content/ e gera public/data/content.json
npm run photos         # (só quando content/photos.json mudar) baixa e processa fotos
npm run dev            # servidor de desenvolvimento
npm test               # unidade + componentes + validação de conteúdo (Vitest)
npm run build && npm run preview   # build de produção com Service Worker
npm run e2e            # Playwright contra o preview (inclui cenários offline)
```

**Esperado**: todos os comandos terminam sem erro; `npm run content` falha com mensagem clara se
alguma regra de [content-schema.md](./contracts/content-schema.md#regras-que-fazem-o-build-falhar)
for violada.

## Cenários automatizados (E2E) por user story

| Story | Cenário | Resultado esperado |
|---|---|---|
| US1 | Relógio em 2026-11-03 → abrir `#/` | Cidade = Nova York; lista e mapa com pontos de NY |
| US1 | Relógio em 2026-11-07 | Cidade = Orlando com aviso de locomoção NY → Orlando |
| US1 | Filtrar "Museu" e buscar "metropolitan" (sem acento/caixa) | Só pontos correspondentes |
| US1 | Abrir detalhe às 16:59 e 17:01 de um dia com fechamento 17:00 | "Aberto" e depois "Fechado" |
| US1 | Carregar com rede → `setOffline(true)` → recarregar e abrir qualquer ponto | Lista, busca, detalhe e foto funcionam; barra offline visível |
| US2 | Favoritar 3 pontos offline → recarregar offline | Os 3 estão em Favoritos, com detalhe completo |
| US3 | Primeira abertura → `#/roteiros` | 19 roteiros sugeridos agrupados por dia; nada em 07/11, 18/11, 21/11 |
| US3 | Offline: editar um sugerido (reordenar, remover, adicionar) → recarregar | Edições mantidas |
| US3 | Publicar versão nova do conteúdo → reabrir | Roteiro editado inalterado |
| US3 | Adicionar ponto de Miami a roteiro de NY | Aviso de outra cidade; incluído só ao confirmar |
| US3 | Adicionar ponto já presente | Aviso, sem duplicar |

Testes unitários obrigatórios: `domain/trip.ts` (todas as datas de 30/10 a 22/11),
`domain/opening-hours.ts` (incluindo 31/10 → 01/11, fim do horário de verão, e horários que
cruzam a meia-noite), `domain/search.ts`, `domain/itineraries.ts`, `storage/user-store.ts`
(quota cheia, JSON corrompido, seed idempotente).

## Validação manual final (30/10/2026, no celular)

1. Abrir a URL publicada no Safari (iOS) ou Chrome (Android) com Wi-Fi.
2. Instalar: iOS → Compartilhar → "Adicionar à Tela de Início"; Android → "Instalar app".
3. **Abrir pelo ícone** e esperar o indicador "Guia disponível offline".
4. Ativar **modo avião**, fechar o app totalmente e reabri-lo pelo ícone.
5. Conferir: guia das 3 cidades, detalhe e fotos de 5 pontos aleatórios, Favoritos, os 19 roteiros.
6. Ainda em modo avião: favoritar um ponto, reordenar um roteiro, fechar e reabrir → mudanças mantidas.
7. Repetir no celular de cada pessoa que vai usar o app (dados não são compartilhados entre aparelhos).

## Revisão de conteúdo (usuário, 28–29/10)

- Conferir os 19 roteiros (ordem dos parques em Orlando, dias em NY e Miami).
- Conferir horários/preços dos pontos dos roteiros pelos links oficiais exibidos no app.
- Pedir correções; cada correção passa por `npm run content` antes de publicar.
