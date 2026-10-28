# Quickstart: validar "sem contagens nem percentuais"

## Pré-requisitos

```sh
export PATH=/opt/homebrew/opt/node@24/bin:$PATH
npm ci
```

## Suíte do CI

```sh
npm run typecheck && npm test && npm run content:strict && npm run build && npm run budget && npm run e2e
```

Esperado: tudo verde nos projetos `chromium`, `mobile-360` e `mobile-402`.

## Conferência manual (`npm run dev`, celular ou 402 × 874)

1. **Início**: os cards das cidades mostram "N noites" e "N dias de roteiro", sem "feitas" nem
   barra. "3 destinos" continua.
2. **Nova York**: cabeçalho sem anel. Cards dos dias sem "paradas", "feitas" nem barra. Cards de
   bairro sem a linha "Comer (N) …".
3. **Dia 01/11**: cabeçalho sem anel; capa sem "N paradas"; "Opções" sem número; faixa de aviso
   com "Ver todos" (sem número); seção Dicas com "Avisos do dia".
4. **Opções de um grupo (SoHo)**: abas "Comer", "Lojas", "Curiosidades", sem números.
5. **Check**: marcar uma parada, fechar e reabrir o app — continua marcada. Desmarcar — volta.
6. **Atração**: "Feito" e "Pular" continuam.
7. **Leitor de tela** (VoiceOver/TalkBack): nenhum anúncio "X de Y feitas".

Telas antes/depois em [contracts/screens.md](contracts/screens.md); campos que saem em
[data-model.md](data-model.md).
