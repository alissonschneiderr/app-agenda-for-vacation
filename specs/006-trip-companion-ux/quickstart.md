# Quickstart: validação da feature 006

```bash
export PATH=/opt/homebrew/opt/node@24/bin:$PATH
npm run photos -- --doc        # uma vez: baixa as fotos do roteiro (precisa de internet)
npm run content:strict         # confere dayKinds, fotos e o roteiro
npm test && npm run build && npm run budget && npm run e2e
```

**Esperado**:
- `content:strict` lista quantas regiões e passos de NY têm foto (meta ≥ 90%, SC-009);
- `specs/006-trip-companion-ux/photos-missing.md` lista os que ficaram sem foto.

## Cenários automatizados (relógio fixo no fuso de Nova York)

| Story | Cenário | Esperado |
|---|---|---|
| US1 | 01/11 13h30, abrir `#/` | Cartão "13h40 · Mott Street · Chinatown", com como chegar e foto, sem tocar em nada |
| US1 | Tocar "Feito" | Cartão avança; "Desfazer" volta ao anterior |
| US1 | "Motorista" | Tela cheia com nome e endereço; ≥ 40 px no endereço |
| US1 | Aviso do dia 01/11 | Faixa "Maratona…"; "Entendi" some e não volta no mesmo dia |
| US1 | 01/11 22h (tudo passado) | "Dia concluído" + prévia de 02/11 |
| US1 | 30/10 | Contagem regressiva + ingressos pendentes |
| US2 | `#/dia/2026-11-01` em 390 px | ≥ 8 passos na dobra, divisórias dos 6 bairros, sem cartões de restaurante na linha |
| US2 | Deslizar para a esquerda | 02/11; "Hoje" visível |
| US3 | `#/perto` às 13h40 de 01/11 | Chinatown, 6 opções em Comer; filtro 🍰 mostra 2 |
| US4 | Detalhe Grand Central | Foto, horário, botões na dobra; "Ler mais" recolhido |
| US5 | `#/viagem` em 03/11 | NY marcada, "dia 4 de 8"; 3 cidades |
| US5 | 07/11 | Três blocos; itens marcáveis e desfazíveis |
| Todos | Offline | Todas as telas abrem; mapas e fotos externas avisam |
| Leitura | Contraste e alvos | Essencial ≥ 7:1; alvos ≥ 48 px |

## Revisão do casal (SC-008)

Simular um dia, com o relógio do celular ou a URL de teste `?agora=2026-11-01T13:30`:
- manhã;
- deslocamento;
- almoço em "Por perto";
- tarde;
- volta ao hotel;
- noite.

Depois, simular 07/11.
