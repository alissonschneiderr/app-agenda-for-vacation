# Relatório da feature 012 — roteiro de Miami do casal

Fonte: documento "Roteiro Miami — 18 a 20 de novembro" (Claude Docs, rev. 15, 27/10/2026), lido por
inteiro. A cópia do texto está em [`source/`](source/). O app guarda a conversão em
`content/full/miami/roteiro.md`, com o mesmo texto: um teste confere palavra por palavra (SC-006).

Decisões:
- **Q1 = A**: o 18/11 continua dia de viagem e ganha a tarde em South Beach. O 07/11 de Orlando não
  mudou.
- **Q2 = B**: os roteiros sugeridos de Miami foram apagados.

## O que entrou, por dia

| Dia | Card | Menu do dia | Conteúdo |
|---|---|---|---|
| **18/11** | "Chegada · South Beach · Ocean Drive" (tipo viagem) | Paradas · Restaurantes e Cafés · Curiosidades · Bairros · Transporte | Transporte: "Antes de sair" e "A viagem" (Orlando, trem) e "A chegada" (14h21 MiamiCentral, ~15h15 Kasa La Flora, marcáveis; Uber/Lyft, táxi, Metrobus 120 e o aviso do shuttle). Paradas: Lummus Park, Pôr do sol, Ocean Drive, Española Way. 4 restaurantes. Curiosidades: The Carlyle (*A Gaiola das Loucas*) e 728 Ocean Drive (*Scarface*). Almoço 15h30 e check-in 16h30 na linha do tempo. |
| **19/11** | "Compras na Sawgrass Mills" (a pé) | Paradas · Restaurantes e Cafés · Brechós e Lojas · Bairros · Transporte | Café 8h; Uber 9h (50–70 min) em Transporte; Simon Guest Services, The Colonnade Outlets e Ala principal; pausa 12h30; 5 restaurantes; 5 categorias de lojas. O comparativo de shoppings, as dicas para economizar e o Plano B ficam como notas do grupo. As atrações de compras mostram as lojas do grupo (feature 010). |
| **20/11** | "Praia · South Pointe · Joe's Stone Crab" (praia) | Paradas · Restaurantes e Cafés · Bairros | Café 8h; Praia 9h, Mais praia 14h, Beachwalk 16h30, South Pointe 17h; 6 restaurantes (Joe's Stone Crab com a reserva pelo OpenTable no detalhe); Noite na Ocean Drive. Sem Transporte: o dia é todo a pé (regra da 010). |
| 21/11 | "Miami → casa" | — | sem mudança |

**Documento completo** (`#/full/miami/documento`):
- a abertura (estratégia, Thanksgiving e Black Friday, hospedagem, legenda de preço);
- os 3 dias;
- as dicas práticas, com o checklist "O que levar para a praia" de 7 itens **marcáveis**;
- o resumo, com custos e fontes.

**Reservas**: 6, com a data de uso:
- Havana 1957 (18/11);
- Simon VIP Club (19/11);
- horários dos shoppings (19/11);
- Joe's Stone Crab (20/11);
- shuttle Brightline (18/11);
- cota da Receita (antes de embarcar).

**Dicas** de Miami por categoria:
- reservas;
- transporte;
- clima;
- dinheiro (gorjetas, impostos);
- outros (segurança, o que levar, outros).

**Dicas do dia**: o documento não traz aviso dentro dos dias. Por isso a seção "Dicas" não aparece em
Miami e nenhum aviso foi criado.

## Sugeridos apagados (Q2 = B)

- `content/itineraries.json` está vazio. "South Beach e Art Deco" (19/11) e "Vizcaya, Little Havana e
  Wynwood" (20/11) saíram.
- Num aparelho que já os tinha guardado, eles somem ao abrir o app (`seedSuggested` remove os
  sugeridos cuja fonte saiu).
- Os roteiros criados pelo casal nunca são tocados. Há um teste para isso.
- Os pontos do guia de Miami continuam (17).

## Mudanças no leitor (todas testadas; NY e Orlando sem mudança)

| Mudança | Por quê |
|---|---|
| `arrivalInDay` no `meta.json`: a seção "### 🚆 Chegada" de um dia comum vira o bloco "A chegada" | Q1 = A. Só Miami usa. Sem a flag, NY 31/10 ("### ✈️ Chegada: JFK") continua sendo região. |
| Abertura do documento (antes do primeiro "##") entra no documento completo | O documento de Miami tem estratégia, Thanksgiving e hospedagem antes do Dia 1. |
| "📷 ver fotos · Mapa" na região guarda o mapa (`mapsUrls`) | Sawgrass Mills; o link aparece na página do grupo. |
| "### 🛍️ …" vira nota da região seguinte | A tabela "Onde comprar: comparativo". |
| A hora da noite não vem da linha "🏨 volta ao hotel" | "Noite: Ocean Drive na sexta" ganhava 22h30 sem estar no documento. |
| "**08h00 – café da manhã**", "**15h30 – almoço tardio**" e "**16h30 – check-in**" entram na linha do tempo, fora do progresso | Antes viravam "Dicas". |
| Tabela de reservas "Data \| Item \| Situação" | Mesma forma da de NY. |
| Categorias "Transporte" e "Impostos…" | Caíam em "outros". |
| Roteiros na ordem da viagem (NY → Orlando → Miami) | Antes era a ordem alfabética das pastas. |

Também mudaram:
- o card de um dia de viagem com dia do roteiro (18/11) mostra o título do documento;
- os "- [ ]" de todos os documentos (NY, Orlando, Miami) ficaram marcáveis no documento completo, com
  a marca guardada no aparelho.

## Conferências (SC-001 a SC-006)

| Critério | Resultado |
|---|---|
| SC-001 itens com horário | as paradas de cada dia batem com o documento, na ordem (a chegada vai para "A chegada") |
| SC-002 restaurantes e cafés | 4, 5 e 6 (15) nos dias certos |
| SC-003 links | todos os links 📷 e de mapa dos dias estão no app |
| SC-004 documento completo | abertura + todas as seções "##", na ordem |
| SC-005 celular | 360 e 402 px, offline, sem rolagem lateral |
| SC-006 nada fora do documento | o texto do app é o da cópia, palavra por palavra |

Fotos: 18 do Wikimedia Commons, com licença livre e crédito. 14 das 15 regiões e paradas marcáveis
têm foto (93%). Duas fotos do lugar errado foram descartadas. Ver
[`photos-missing.md`](photos-missing.md).

Dados para revisar: [`data-review.md`](data-review.md). Ali estão as lojas por categoria sem
endereço, os lugares sem número, os preços estimados e o tipo "a pé" do dia de compras.

## Testes

- CI completo verde:
  - 348 testes unitários e de componentes (45 arquivos);
  - 69 e2e nos projetos `chromium`, `mobile-360` e `mobile-402`;
  - JS inicial com 36,8 KB gzip;
  - snapshot de NY intacto.
- Testes novos:
  - `tests/content/miami-doc-real.test.ts`, conteúdo contra a cópia do documento;
  - `tests/components/miami-day.test.tsx`;
  - `tests/e2e/us-mobile-miami.spec.ts`, com 18, 19 e 20/11 a 360 e 402 px, offline;
  - no leitor, chegada no dia, tabela de reservas e categorias;
  - limpeza dos sugeridos;
  - checklist marcável.
- Testes antigos ajustados (comentário "feature 012"): os que esperavam os sugeridos de Miami ou Miami
  sem roteiro. Os de edição de roteiro (`us3-itineraries`) passaram a usar um roteiro criado pelo
  casal. O teste "nova versão do conteúdo não altera roteiro editado" saiu do e2e, porque não há
  mais sugeridos vindos do conteúdo. A regra continua coberta pelos testes de `seedSuggested`.
- Capturas a 360 × 780 e 402 × 874 em [`screens/`](screens/): cidade, 18/11 (topo e chegada), 19/11
  (topo e lojas), 20/11 e a atração Lummus Park.

## Observações

- Desvio do plano (R7): as categorias de lojas não levam o mapa da Sawgrass no card, porque o
  documento não põe link por categoria. O mapa está na página do grupo.
- Ficaram 4 funções sem uso de antes desta feature: `destinationHref`, `shortDate`,
  `setContentForTests` e `parseDoc`. Ficam para uma limpeza à parte.
- T027: commitado na `main` com autorização do usuário.
