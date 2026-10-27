# Relatório da feature 011 — Kennedy Space Center fora do roteiro de Orlando

Decisões: **Q1**, Cocoa Beach com mais tempo. **Q2**, só remover, porque o roteiro já tem os dois
grandes outlets de Orlando.

## 13/11, antes e depois

| Antes | Depois |
|---|---|
| Folga · Kennedy Space Center + Disney Springs | **Folga · Cocoa Beach + Disney Springs** |
| 08h00 saída, ~1h de carro até o KSC | **Manhã livre** (piscina e descanso) |
| 9h00–15h30: Atlantis, Bus Tour e Apollo/Saturn V, almoço no complexo, Gateway e Rocket Garden | — |
| Deslocamento para Cocoa Beach (~20 min de carro) | **Deslocamento para Cocoa Beach (~1h de carro, saída ~12h)** |
| Cocoa Beach ~16h, fim de tarde | **Cocoa Beach das ~13h às ~17h** (mesmo texto do roteiro) |
| ~18h volta ao hotel | **~17h** volta ao hotel (~1h de carro) |
| Noite: Disney Springs | Noite: Disney Springs (sem mudança) |
| Mapa: KSC → Cocoa Beach → Disney Springs | Mapa: Cocoa Beach → Disney Springs |

O tempo de carro (~1h) é o que o roteiro já dava para a volta de Cocoa Beach. Nenhuma atividade
nova foi inventada.

## Outras menções removidas

- 11/11: "Alternativa ao outlet: Kennedy Space Center…".
- Reservas: a linha "Ingresso Kennedy Space Center". A frase de abertura passou de "Quatro itens
  se compram antes (três deles só 3 dias antes)" para "Três itens se compram antes (todos só 3
  dias antes)". Os três que sobraram (os dois Multi Pass e o Single Pass) são mesmo reservados 3
  dias antes.
- Checklist: "Comprar o ingresso do Kennedy Space Center".

**Nenhum outlet acrescentado.** O roteiro já tem o Orlando Vineland Premium Outlets (11/11) e o
Orlando International Premium Outlets, com o Mall at Millenia como opção (16/11).

## Fotos e guia

- Removidas as 3 fotos das atrações do KSC (Space Shuttle Atlantis, KSC Bus Tour e Apollo/Saturn V
  Center, Gateway e Rocket Garden) e os créditos delas.
- Removida a ligação do grupo "Kennedy Space Center Visitor Complex" com o ponto do guia.
- O guia de pontos (`#/ponto/orl-kennedy-space-center`) **continua** com o KSC e a foto dele.

## Correção encontrada no caminho

Sem o KSC, 13/11 ficou sem nenhuma parada marcável, e a seção **Paradas** sumia do dia. A linha do
tempo inteira (manhã livre, praia, Disney Springs) ficava invisível. Agora, num dia sem nada a
marcar, Paradas aparece com os grupos do roteiro. Há um teste novo para isso.

## Números do roteiro de Orlando que mudaram

| | Antes | Depois |
|---|---|---|
| Itens com horário | 75 | 71 |
| Passos | 95 | 90 |
| Passos com Feito/Pendente | 69 | 66 |
| Links de fotos | 81 | 77 |
| Reservas | 6 | 5 |

**Atenção:** as reservas são numeradas pela posição. Se alguém já tivesse marcado a fila virtual do
Super Nintendo (era o 5º item, agora é o 4º) ou a do Bluey, a marca passaria para o item anterior.
Antes da viagem, isso não deve ter acontecido.

## Testes

- CI completo verde: 318 testes unitários e de componentes, 64 e2e nos projetos `chromium`,
  `mobile-360` e `mobile-402`.
- JS inicial com 36,5 KB gzip.
- Snapshot de NY intacto.
- `grep -i "kennedy\|ksc"` no roteiro de Orlando: 0 resultados.
- E2e de 13/11, offline: grupos Manhã livre, Cocoa Beach e Noite: Disney Springs, sem "Kennedy" na
  página.
- Capturas de 13/11 a 360 × 780 e 402 × 874 em [`screens/`](screens/).

## Pendência

Nenhuma: 010 commitada na branch `010-day-sections-by-neighborhood` e 011 na branch
`011-remove-kennedy-space-center`, criada a partir dela, com autorização do usuário.
