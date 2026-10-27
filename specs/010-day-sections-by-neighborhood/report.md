# Relatório da feature 010 — seções do dia por bairro, Transporte e Dicas enxutos

Gerado a partir do próprio app (`sectionReview`, `dayMoves` e `dayPlaceGroups` em `src/domain/notebook.ts`). Os números são conferidos pelos testes de `tests/unit/notebook.test.ts`.

**Decisões** (padrão recomendado, adotado porque o planejamento seguiu sem resposta; dá para trocar):
- **Q1 = A**: "Transporte" fica só com trechos de metrô, ferry, táxi, carro ou monotrilho. Trechos a pé saem da seção, mas continuam nas Paradas. Também saem os trechos cujo título diz "a pé" e que só citam outro modo como alternativa ("ou táxi", "se cansarem, o metrô 1").
- **Q2 = A**: o cabeçalho do grupo é o nome do grupo como está no roteiro.

## 1. Seções removidas, por dia

| Dia | Removida | Por quê |
|---|---|---|
| 31/10 | Transporte | nenhum trecho de metrô, ferry, táxi ou carro (chegada, check-in, saída a pé) |
| 09/11 | Transporte | só o horário do parque, que continua na parada "chegada ao estacionamento" |
| 10/11 | Transporte | só o horário do parque, que continua na parada "chegada ao estacionamento" |
| 11/11 | Transporte | só tinha o "Mapa do dia" |
| 12/11 | Transporte | só o horário do parque, que continua na parada "chegada ao estacionamento" |
| 14/11 | Transporte | só o horário do parque, que continua na parada "chegada ao estacionamento" |
| 15/11 | Transporte | só o horário do parque, que continua na parada "chegada ao estacionamento" |
| 16/11 | Transporte | só tinha o "Mapa do dia" |
| 17/11 | Transporte | só o horário do parque, que continua na parada "chegada ao estacionamento" |

**Dicas:** nenhum dia perdeu a seção. As 10 dicas atuais são específicas: Maratona e horário de inverno (01/11), funcionamento do Museu de História Natural e do MET (03/11), atrações fechadas (08/11, 12/11, 17/11), reservas de Multi Pass e fila virtual (09/11, 10/11, 12/11, 14/11) e Park-to-Park (15/11, 17/11).

## 2. Dicas cortadas

**Nenhuma.** Nenhuma dica do roteiro é genérica. A regra fica valendo para conteúdo futuro: uma dica sem data, hora ou tema específico que só diga "a pé", "sapatos confortáveis", "aproveitem" ou "levem água" é cortada inteira e aparece nesta lista.

## 3. Transporte: o que ficou e o que saiu

| Dia | Fica em "Transporte" | Saiu da seção (continua nas Paradas) |
|---|---|---|
| 31/10 | — | pouso<br>Pod 51<br>saída a pé |
| 01/11 | metrô 6 na estação 51 St até Bleecker St | Deslocamento para Nolita<br>Deslocamento para Chinatown<br>Deslocamento para Little Italy<br>Deslocamento para o Lower East Side<br>Deslocamento para o East Village |
| 02/11 | metrô E em Lexington Av/53 St até World Trade Center | Deslocamento para Greenwich Village (13h00–13h45), a pé por Tribeca e SoHo (~40 min)<br>caminho para o metrô pela Bleecker Street<br>Deslocamento para o West Village |
| 03/11 | metrô E em Lexington Av/53 St até 7 Av, troca para o metrô B até 81 St–Museum of Natural History | Deslocamento para o Upper West Side<br>Deslocamento para o Central Park |
| 04/11 | metrô 6 na estação 51 St até Brooklyn Bridge–City Hall; NYC Ferry, rota East River, do píer Dumbo/Fulton Ferry até North Williamsburg | Deslocamento para Brooklyn Heights<br>Deslocamento para DUMBO<br>Deslocamento para o Brooklyn Bridge Park |
| 05/11 | táxi (~15 min) ou 10 minutos a pé até Times Square e metrô 7 até 34 St–Hudson Yards | saída a pé<br>Deslocamento para a High Line<br>Deslocamento para as galerias de Chelsea<br>Deslocamento para o Meatpacking |
| 06/11 | metrô 6 na estação 51 St até a 33 St | — |
| 08/11 | do estacionamento até a entrada é preciso pegar monotrilho ou barca | — |
| 09/11 | — | chegada ao estacionamento |
| 10/11 | — | chegada ao estacionamento |
| 12/11 | — | chegada ao estacionamento |
| 13/11 | ~1h de carro até o Kennedy Space Center; Deslocamento para Cocoa Beach | — |
| 14/11 | — | chegada ao estacionamento |
| 15/11 | — | chegada ao estacionamento |
| 17/11 | — | chegada ao estacionamento |

Os dias de troca de cidade (07/11, 18/11) continuam com os blocos de partida, viagem e chegada. Em 21/11 o roteiro não tem conteúdo.

## 4. Agrupamento por bairro — todos os dias

Em **todos** os dias com restaurantes, lojas ou curiosidades, as três seções estão agrupadas pelos grupos do roteiro, na ordem do dia, sem grupo repetido. Os totais são os mesmos de antes (01/11: 24 restaurantes e cafés, 17 lojas). Nenhum lugar ficou sem grupo, então "Outros" não aparece hoje.

| Dia | Restaurantes e Cafés | Brechós e Lojas | Curiosidades |
|---|---|---|---|
| 31/10 | Midtown (7) | — | Midtown (3) |
| 01/11 | SoHo (2), Nolita (4), Chinatown (6), Little Italy (3), Lower East Side (4), East Village (5) | SoHo (5), Nolita (4), Lower East Side (3), East Village (5) | SoHo (1), Nolita (1), Lower East Side (1), East Village (2) |
| 02/11 | Financial District (3), Greenwich Village (3), West Village (6), Noite: Knicks x Nets no Madison Square Garden (19h30) (3) | — | Financial District (1), Greenwich Village (2), West Village (3) |
| 03/11 | Upper West Side (2), Central Park (1), Upper East Side (2) | — | Museu de História Natural (1), Upper West Side (1), Central Park (1), MET – Metropolitan Museum of Art (1), Upper East Side (1) |
| 04/11 | DUMBO (4), Williamsburg (3) | Williamsburg (5) | Ponte do Brooklyn (1), Brooklyn Heights (1), DUMBO (1) |
| 05/11 | Hudson Yards (1), Chelsea (2), Noite: MJ The Musical (19h00, Neil Simon Theatre) (5) | — | — |
| 06/11 | Empire State e arredores (Midtown South) (4), Noite: jantar no Harlem (4) | — | Empire State e arredores (Midtown South) (1) |
| 08/11 | Magic Kingdom (5) | — | — |
| 09/11 | Hollywood Studios (4) | — | — |
| 10/11 | EPCOT (5) | — | — |
| 12/11 | Animal Kingdom (3) | — | — |
| 14/11 | Epic Universe (4) | — | — |
| 15/11 | Universal Studios Florida (4) | — | — |
| 17/11 | Islands of Adventure (4) | — | — |

## 5. Para você revisar

**Cabeçalhos que não são bairros** (Q2 = A, nome do roteiro como está):
- 02/11, comer: "Noite: Knicks x Nets no Madison Square Garden (19h30)"
- 05/11, comer: "Noite: MJ The Musical (19h00, Neil Simon Theatre)"
- 06/11, comer: "Noite: jantar no Harlem"
- 06/11: "Empire State e arredores (Midtown South)" está marcado como bairro no roteiro, mas é uma região nomeada por um ponto.
- Parques de Orlando (Magic Kingdom, Hollywood Studios, EPCOT, Animal Kingdom, Epic Universe, Universal Studios Florida, Islands of Adventure) viram cabeçalho com o nome do parque.

**Itens de bairro incerto:** nenhum. Todo lugar está em exatamente um grupo do roteiro e nada foi deduzido.

**Trechos de transporte que podem valer a sua revisão:**
- 01/11, "Deslocamento para o East Village: 15 minutos a pé… (ou táxi de 5 minutos)" — saiu (a pé, táxi só como alternativa).
- 02/11, "Deslocamento para Greenwich Village… a pé por Tribeca e SoHo (~40 min)" — saiu. O metrô 1 aparece só como plano B ("se cansarem no meio").

## 6. Atrações de compras

| Atração | Grupo | Lojas mostradas |
|---|---|---|
| Compras no SoHo (01/11) | SoHo | 5 |
| Compras na Elizabeth e na Mott Street (01/11) | Nolita | 4 |
| Compras no Lower East Side (01/11) | Lower East Side | 3 |
| Compras no East Village (01/11) | East Village | 5 |
| Compras na Bedford Avenue (04/11) | Williamsburg | 5 |
| Compras (tarde), 11/11 e 16/11 | outlets de Orlando | sem bloco: o roteiro não lista lojas |
| Lincoln Road (19/11) | sem grupo | sem bloco |

As lojas da atração são os mesmos itens de "Brechós e Lojas", com o mesmo texto (há um teste que compara). O atalho "Ver todas as lojas do dia" abre o dia já na seção.

## 7. Testes a 360 px e 402 px

Projetos `mobile-360` (360 × 780) e `mobile-402` (402 × 874), em `tests/e2e/us-mobile.spec.ts`:

| Teste | 360 | 402 |
|---|---|---|
| US1 (010): 01/11, rolando Chinatown, o nome fica preso abaixo do menu e não cobre o 1º card | ✔ | ✔ |
| US1 (010): offline, 04/11, "Brechós e Lojas" com Williamsburg preso | ✔ | ✔ |
| US3 (010): "Compras no SoHo" com 5 lojas; o atalho abre o dia em "Brechós e Lojas" | ✔ | ✔ |
| 009 (atualizados): menu do dia com 7 chips, US1, US3 e cabeçalho fixo | ✔ | ✔ |
| Leitura no celular: alvos ≥ 44 px (cabeçalhos de bairro incluídos), corpo ≥ 16 px, sem rolagem lateral em 14 telas | ✔ | ✔ |

CI completo (`typecheck`, `test`, `content:strict`, `build`, `budget`, `e2e`) verde: 314 testes unitários e de componentes, 64 e2e (`chromium`, `mobile-360`, `mobile-402`), JS inicial com 36,5 KB gzip e o snapshot de NY intacto.

Correção feita no fim: em lojas sem nível, a linha de preço começava com um "·" solto. Depois dela, o e2e rodou de novo (64 passaram) e as capturas foram refeitas.

Capturas em [`screens/`](screens/): 01/11 rolado em "Restaurantes e Cafés", 06/11 (cabeçalhos do roteiro), 09/11 (sem Transporte) e "Compras no SoHo", nas duas larguras.

## Pendência

- T001 e T030 (branch `010-day-sections-by-neighborhood` e commits) aguardam autorização. O trabalho está na branch `009-mobile-first-navigation`, sem commit.
