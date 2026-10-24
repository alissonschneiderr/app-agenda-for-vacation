# Contrato de telas: Orlando (feature 007)

São as mesmas telas da feature 006. Abaixo só o que muda; o resto segue
`specs/006-trip-companion-ux/contracts/`.

## Passo de atração (TimelineRow, NextStepCard, StepDetail)

| Campo | Onde aparece | Formato |
|---|---|---|
| fila (`queue`) | linha do tempo (meta), cartão "Agora", detalhe | texto do doc: "fila ~5 min" |
| forma de entrar (`access`) | cartão "Agora", detalhe; na linha do tempo só "Multi Pass"/"Single Pass" | etiqueta curta, texto do doc |
| área do parque (`land`) | linha do tempo (meta), cartão "Agora", detalhe | texto do doc |
| opcional | linha do tempo e cartão | "opcional", como nos itens opcionais de hoje |
| foto | cartão "Agora" e detalhe | foto offline da atração; senão, a do parque; senão, nenhuma |
| "Abrir no mapa" / "Mostrar ao motorista" | cartão e detalhe | o parque da região (R8); o motorista mostra o endereço do guia |

O cartão "Agora" de 09/11 às 12h30 mostra:
- **13h00 · Mickey & Minnie's Runaway Railway**;
- "~5 min · Multi Pass";
- a região "Hollywood Studios";
- "Almoço" antes, como intervalo, com "Ver onde comer".

## "Agora": reservas do dia

- Durante a viagem, os itens de `checklist` com `deadline` = hoje aparecem numa seção
  `aria-label="Reservar hoje"`, acima do próximo passo.
- Cada item mostra:
  - o item;
  - quando e onde reservar;
  - o custo;
  - um Feito, que marca `ck:…`, pode ser desfeito e fica fora do progresso.
- 06/11 mostra o Multi Pass do Hollywood Studios. 07/11 é dia de locomoção e mostra a seção acima dos
  três blocos, com o Multi Pass do EPCOT e o Single Pass opcional.

## Dia de locomoção (TransitionBlocks)

| Bloco | 07/11 (NY → Orlando) | 18/11 (Orlando → Miami) |
|---|---|---|
| 1. Antes de sair | partida de NY, sem mudança | "Check-out e carro": "faça o check-out com folga e devolva o carro no aeroporto (MCO)" |
| 2. A viagem | partida de NY, sem mudança | "De trem para Miami" |
| 3. A chegada | itens da Chegada do doc de Orlando, marcáveis, + Mercados e Noite (HTML) + prévia do 1º dia | "Sem orientações no roteiro." + prévia de Miami, como hoje |
| Orientações completas | partida de NY, sem mudança | ausente: sem `dayNotes` para 18/11 |

## "Viagem"

- **"Para comprar antes":**
  - itens de todas as cidades, agrupados por cidade;
  - Orlando mostra cada item com quando reservar, custo e dia de uso;
  - o link "Regra dos ingressos e checklist" abre a seção do documento.
- **"Consulta":**
  - "Documento completo" e "Dicas práticas" de cada cidade com roteiro, com a cidade no rótulo
    ("Documento de Orlando");
  - o restante continua como está.
- **Pontos dos dias:** os dias de Orlando seguem os tipos novos; por exemplo, 08/11 passa a ser
  "parque".

## Rotas

| Rota | Tela |
|---|---|
| `#/full/:cityId/documento` | documento completo da cidade (`nova-york`, `orlando`) |
| `#/full/:cityId/documento/:section` | seção do documento |
| `#/full/nova-york/:date` | redireciona para `#/dia/:date` (sem mudança) |

## Acessibilidade e offline

Valem as mesmas regras da 006:
- contraste ≥ 7:1 no essencial;
- alvos ≥ 48 px;
- sem rolagem lateral a 390 px;
- tudo disponível sem internet;
- "Ver fotos" avisa quando offline.
