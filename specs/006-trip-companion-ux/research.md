# Research: Guia de bolso da viagem

## R1. Quatro abas na parte de baixo

- **Decision**: barra inferior fixa com Agora · Dia · Por perto · Viagem, rótulo + ícone e alvos de 56
  px de altura. No desktop (≥ 1024 px), a mesma barra vira coluna lateral.
- **Rationale**: uso com uma mão (FR-001, FR-022). Quatro destinos cabem sem "Mais". O guia, o
  documento e as dicas ficam em "Viagem" (Q3).
- **Alternatives considered**:
  - menu lateral: fora do alcance do polegar;
  - cinco abas com "Guia": compete com o roteiro, que é o foco.

## R2. "Próximo passo" e marca "agora"

- **Decision**: em `now.ts`, sobre os passos do dia na ordem do roteiro:
  - **próximo passo**: o primeiro passo marcável (não deslocamento, não intervalo livre), sem marca de
    feito ou pulado, cujo fim (fim explícito; senão, o início do passo seguinte; senão, o início + 15
    min) ainda não passou;
  - sem nenhum assim, o primeiro pendente; sem pendentes, "dia concluído";
  - **marca "agora"**: fica antes do primeiro passo cujo início é posterior ao horário atual. Só no
    dia de hoje, no fuso da cidade do dia (`America/New_York` em toda a viagem).
- **Rationale**: FR-007, edge cases. Sem recálculo nem alerta de atraso (Q1).
- **Alternatives considered**: por horário de início puro (perde passos longos em andamento).

## R3. "Como chegar" ao próximo passo

- **Decision**: a instrução vem do roteiro, nesta ordem:
  1. o deslocamento com horário imediatamente antes do passo (título + "como ir");
  2. se o passo é o primeiro da sua região, o "🚶 Deslocamento…" da região anterior;
  3. se o passo é o primeiro do dia, a "saída do hotel".

  Junto com a instrução, aparecem "Abrir no mapa" (com rede) e "Mostrar ao motorista".
- **Rationale**: sem internet não há rota calculada. O roteiro já traz as instruções (spec,
  Assumptions).

## R4. Avisos do dia e avisos pontuais

- **Decision**:
  - o leitor separa o que fica antes do primeiro `###` do dia em **avisos** (um por parágrafo ou
    lista), com id estável `al:<data>:<n>`, além da legenda de preço;
  - "Agora" mostra um aviso não lido por vez numa faixa;
  - "Entendi" grava como lido em `ctha:prefs`;
  - em "Dia", todos ficam no topo, recolhidos.
  - **avisos pontuais**:
    - ingresso 🎟️: ícone na linha e texto no cartão e no detalhe;
    - frases "confiram/confirmem": só no detalhe.
- **Rationale**: FR-008, "sem ser bombardeado".

## R5. Tipo de dia

- **Decision**: `content/trip.json` ganha `dayKinds: Record<data, 'walk' | 'beach' | 'park' | 'transit'>`.

  | Datas | Tipo |
  |---|---|
  | Nova York, 31/10–06/11 | `walk` |
  | 07/11, 18/11, 21/11 | `transit` |
  | Orlando, parques (Magic Kingdom, EPCOT, Hollywood Studios, Animal Kingdom, Universal, Islands of Adventure, Epic Universe) | `park` |
  | Orlando, Disney Springs, Kennedy, Winter Park | `walk` |
  | Miami, South Beach | `beach` |
  | Miami, Vizcaya/Little Havana/Wynwood | `walk` |

  Tudo vem dos títulos dos roteiros existentes. O build falha se uma data da viagem ficar sem tipo.
- **Rationale**: o tipo é declarado, não deduzido (spec, Assumptions). FR-013 adapta a linha do tempo.

## R6. Dia de transição

- **Decision**:
  - **Antes de sair** e **A viagem**: os itens da seção "Partida" do doc (check-out, chegada ao
    aeroporto, melhor forma de ir, último café), cada um marcável (`tr:<data>:<n>`), distribuídos
    pelo rótulo: check-out e café → "Antes de sair"; aeroporto e táxi → "A viagem".
  - **A chegada**: o primeiro dia da cidade seguinte (hotel quando existir, primeiros pontos).
    Orlando ainda não tem orientações de chegada no conteúdo: o bloco diz isso e mostra o que existe.
  - 18/11 e 21/11 ainda não têm conteúdo de partida: os blocos aparecem só com o que houver.
- **Rationale**: FR-019 sem inventar conteúdo.

## R7. Fotos offline do roteiro (Q2)

- **Decision**: `content/full/nova-york/doc-photos.json` liga cada nome de região e de passo ao
  arquivo da Commons (`File:…`) ou ao artigo (`wiki:…`), no mesmo esquema do script atual.
  - `npm run photos -- --doc` baixa, gera WebP de **900 px** (~90 KB) em `public/photos/doc/` e grava
    os créditos.
  - Lugares que já têm foto no guia (via `point-links.json`) reaproveitam essa foto.
  - Cada foto escolhida é conferida visualmente antes de entrar (a feature 001 teve fotos erradas).
  - O que não tiver foto fiel vai para `specs/006-trip-companion-ux/photos-missing.md`.
- **Rationale**: FR-026/SC-009. Cabe no limite de 40 MB (≈ 14,8 + 9 MB).
- **Alternatives considered**:
  - fotos de 1200 px como as do guia: ~20 MB a mais;
  - sem fotos: Q2 escolheu fotos.

## R8. Leitura, contraste e modo sol

- **Decision**:
  - escala de tipo: base 17 px, horários e nomes 20–22 px, cartão Agora 26–28 px;
  - `--muted` escurecido para 7:1 no essencial, 4,5:1 no secundário;
  - **modo sol** (`data-contrast="high"`): preto sobre branco, sem cinzas, bordas de 2 px; ligado em
    "Viagem" → Exibição;
  - tema escuro como hoje (sistema).
  - um teste E2E mede o contraste calculado de horário, nome e endereço.
- **Rationale**: FR-022/FR-023, SC-006.

## R9. Desfazer

- **Decision**: depois de "Feito" ou "Pular", aparece por 6 s um aviso inferior "Feito · Desfazer". O
  item também pode ser desmarcado a qualquer momento no próprio controle.
- **Rationale**: FR-020/SC-005.

## R10. Rotas antigas

- **Decision**:
  - `#/destino/:city/:date[/:key]` → `#/dia/:date[/:key]`;
  - `#/destino/:city` → `#/dia/<primeiro dia da cidade>`;
  - `#/full/nova-york[/:date]` → idem;
  - `#/favoritos`, `#/roteiros…` continuam funcionando, mas sem link na navegação;
  - `#/guia` e `#/ponto/:id` continuam.
- **Rationale**: links salvos não quebram; dados não se perdem (Q3).
