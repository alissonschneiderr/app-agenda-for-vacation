# Contract: Telas

Referência: celular de 390 × 844. "Dobra" = o que aparece sem rolar. Alvos de toque ≥ 48 px. Barra
de abas fixa em baixo (56 px).

## Agora (`#/`)

Ordem, de cima para baixo:

1. **Cabeçalho**: cidade · "Dia N de M" · tema do dia (1 linha) · progresso do dia.
2. **Faixa de aviso** (só se houver aviso do dia não lido): 1 aviso, 2 linhas no máximo, "Entendi" e
   "Ver todos".
3. **Cartão do próximo passo** (dentro da dobra):
   - foto (16:9, ou ícone);
   - horário (≥ 26 px) e nome (≥ 26 px);
   - região;
   - 🎟️ aviso pontual;
   - "Como chegar": modo + instrução (2 linhas, "mais" a um toque);
   - ações grandes na parte de baixo do cartão: **Feito** · **Pular** · **Motorista** · **Detalhes**.
4. **Depois**: 2–3 linhas (horário + nome), com toque para o detalhe.
5. **Atalho "Por perto"** com a região atual ("Comer em Chinatown").

**Estados:**
- intervalo livre: o cartão mostra "Pausa livre até 13h00" e o botão "Ver onde comer";
- noite com evento: as orientações (Como chegar, Antecedência, Volta) ficam no cartão;
- dia concluído: progresso, pulados e "Amanhã: …";
- antes da viagem: contagem, ingressos pendentes, prévia de 31/10;
- depois da viagem: resumo;
- dia de transição: os três blocos (abaixo).

## Dia (`#/dia/:date`)

1. **Cabeçalho fixo**: ◀ data · cidade ▶ · "Hoje" (quando não é hoje) · progresso.
2. **Avisos do dia** recolhidos: "3 avisos para hoje", que se abrem com um toque.
3. **Linha do tempo**:
   - **divisória de região**: miniatura + nome + "Opções (12)" → Por perto;
   - **linha de passo**: horário (20 px, tabular) · nome (20 px) · ícone 🎟️ quando houver · controle
     Feito/Pendente à direita;
   - **conector de deslocamento**: linha fina, ícone do modo, "15 min · metrô 6" (toque mostra a
     instrução completa);
   - **intervalo livre**: faixa tracejada "Pausa livre · ~12h00";
   - **marca "agora"**: linha colorida com "agora · 13h32";
   - **noite**: bloco com fundo escuro, horário e nome do evento.
4. **Tipos de dia**:
   - `walk`: como acima;
   - `beach`: blocos Manhã / Tarde / Pôr do sol;
   - `park`: áreas do parque como divisórias;
   - `transit`: os três blocos.
5. Deslizar na horizontal troca de dia, com animação curta (desligada com movimento reduzido).

## Por perto (`#/perto/...`)

1. **Seletor de região**: chips horizontais com as regiões do dia, a atual marcada.
2. **Grupos**: Comer · Lojas · Curiosidades (abas segmentadas), com contagem.
3. **Filtro de comida**: ☕ Café · 🏆 Clássicos · 🍰 Doces · Todos.
4. **Cartão curto** (≤ 4 linhas): nível · nome · preço · "Peçam …"/estilo · fila; toque → detalhe.
5. **Avisos da região** ("Nenhuma cafeteria…") acima da lista.

## Detalhe (passo ou opção)

1. Fotos (com crédito).
2. Horário e nome.
3. Aviso pontual.
4. **Como chegar**: instrução, "Abrir no mapa" e "Motorista".
5. Ações (Feito/Pular para passos).
6. Orientações do evento, quando houver.
7. "Ler mais": contexto e história, recolhido.
8. "Ver mais fotos" (link externo).

## Motorista (`#/motorista/...`)

Fundo branco (ou preto no tema escuro) e letra preta (ou branca):
- nome com ≥ 32 px;
- endereço com ≥ 40 px, quebrado em linhas;
- "New York, NY" quando o roteiro só traz rua e número.

O conteúdo aparece em retrato e em paisagem. Um toque em qualquer lugar ou o gesto de voltar fecha a
tela. A tela fica acesa (Wake Lock) quando disponível.

## Viagem (`#/viagem`)

1. **Linha da viagem**: 3 cidades, datas, pontos de dias (cor por tipo e preenchimento por progresso),
   "vocês estão aqui".
2. Progresso total e por cidade.
3. **Para comprar antes** (checklist) e **Ingressos comprados**.
4. **Consulta**: Dicas práticas · Documento completo · Guia de pontos · Créditos.
5. **Exibição**: alto contraste (modo sol).

## Transição (dentro de Agora e Dia)

Três blocos:
1. **Antes de sair**;
2. **A viagem**;
3. **A chegada**.

Cada bloco tem itens marcáveis; o próximo item fica em destaque. Sem conteúdo num bloco, ele mostra
"Sem orientações no roteiro" e o que existir da cidade seguinte.
