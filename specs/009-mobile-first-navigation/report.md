# Relatório da feature 009 — navegação mobile first

Todo o conteúdo (textos, atrações, dias, endereços) foi mantido. Mudaram só a estrutura, a
navegação e o layout. Decisões das perguntas: **Q1 = B** (saem "Agora", "Reservar hoje",
ingressos e Consulta do Início; as telas de consulta continuam por endereço direto), **Q2 = B**
("Dicas" do dia = só os avisos daquele dia) e **Q3 = A** (sem barra inferior).

## O que mudou, por página

### Geral (todas as telas)

- Uma coluna só, até 520 px; no computador a mesma coluna fica centralizada (sem layout próprio).
- Barra inferior removida; cabeçalho fixo e enxuto com "Voltar", respeitando as safe areas.
- **Cartões inteiros clicáveis**: cada cartão tem um único link (o título). Tocar em qualquer
  ponto do cartão abre esse link. Botões dentro do cartão (marcar, mapa) seguem com a própria
  ação. Há foco visível pelo teclado, retorno ao toque (`:active`) e a seta › como indicação.
  Os textos "Ver roteiro", "Abrir dia" e "Ver o bairro" saíram.
- Alvos de toque ≥ 44 px, corpo ≥ 16 px e nenhuma rolagem lateral, conferidos a 360 e a 402 px.

### Início (`#/`)

- Só a lista dos 3 destinos, cada um em um cartão grande e vertical com foto.
- Saíram a capa da viagem, o cartão "Agora", "Reservar hoje", ingressos e reservas, e a Consulta.

### Cidade (`#/cidade/<cidade>`)

- Saíram a linha de tags concatenada ("Knicks x NetsMJ The Musical…") e as abas Dicas,
  Transporte e Bairros.
- Ficaram a capa compacta (país, nome, datas, noites) e a lista de dias em cartões clicáveis.

### Dia (`#/dia/<data>`)

- Menu de seções em chips, preso logo abaixo do cabeçalho. Tocar em um chip rola até a seção
  sem trocar o endereço, e o chip da seção atual fica marcado.
- Seções, na ordem: **Paradas**, **Restaurantes e Cafés**, **Brechós e Lojas**, **Bairros**,
  **Transporte**, **Dicas**. Cada uma **só aparece se houver conteúdo** naquele dia. Com uma
  seção só, o menu não aparece.
  - *Restaurantes e Cafés* e *Brechós e Lojas*: nome, região ou endereço, descrição curta e
    "Abrir no mapa" quando o roteiro traz o link. O cartão abre o detalhe do lugar.
  - *Transporte*: os deslocamentos do dia e, nos dias de troca de cidade, só os blocos que
    existem no roteiro. Nada de "Sem orientações".
  - *Dicas*: os avisos do dia, já abertos.
- O cartão de parada inteiro abre a atração. O círculo marca sem navegar. "Ver onde comer
  perto" rola até "Restaurantes e Cafés".
- Saiu o bloco "Sobre este dia". O resumo ficou logo abaixo da capa.

| Dia | Seções |
|---|---|
| 01/11 | Paradas (16), Restaurantes e Cafés (24), Brechós e Lojas (17), Bairros (6), Transporte (7), Dicas (1) |
| 09/11 | todas, menos Brechós e Lojas |
| 07/11 | só Transporte |
| 18/11 | só Transporte |
| 19/11 e 20/11 | só Paradas (sem menu) |
| 21/11 | nenhuma (o roteiro não tem conteúdo para esse dia) |

### Atração (`#/dia/<data>/<passo>`)

- Nova ordem: foto → **título** → **descritivo completo** → **informações práticas**
  (região e endereço, ingresso, horário e preço, fila, área do parque, como chegar, mapa,
  Motorista) → Feito/Pular → passo anterior e próximo.
- Saiu o "Ler mais" recolhido.

### Bairro (`#/perto/<data>/<região>`)

- Não mudou de estrutura. Os filtros (☕/🏆/🍰) voltaram a atualizar a lista na hora. Antes, quem
  forçava essa atualização era a barra inferior, que saiu.

### Telas removidas e endereços diretos

- Removidas: "Agora", Dicas (`#/dicas`), Transporte (`#/transporte`), "Por perto" sem região
  (`#/perto`) e as abas da cidade.
- Redirecionamentos: `#/viagem`, `#/dicas`, `#/transporte` e `#/perto` → Início;
  `#/cidade/<cidade>/<aba>` → a cidade.
- Continuam por endereço direto: `#/guia`, `#/favoritos`, `#/roteiros`, `#/creditos`,
  `#/full/<cidade>/documento` e a nova `#/exibicao` (alto contraste).

## Testes a 360 px e 402 px

Projetos do Playwright `mobile-360` (360 × 780) e `mobile-402` (402 × 874), com toque e tela de
celular, rodando `tests/e2e/us-mobile.spec.ts`:

| Teste | 360 | 402 |
|---|---|---|
| US1: Início só com 3 cidades; tocar na foto abre a cidade; tocar no cartão abre o dia; voltar refaz | ✔ | ✔ |
| US1: cabeçalho fixo continua no topo depois de rolar; offline | ✔ | ✔ |
| US2: 01/11 com 6 chips; "Brechós e Lojas" rola até a seção, menu preso e marcado; cartão de restaurante abre o detalhe | ✔ | ✔ |
| US2: 09/11 sem "Brechós e Lojas"; offline, 07/11 com Transporte e os três blocos | ✔ | ✔ |
| US3: Grand Central com título, descritivo visível sem rolar e depois "Abrir no mapa"; sem "Ler mais" | ✔ | ✔ |
| Alvos ≥ 44 px, corpo ≥ 16 px e sem rolagem lateral em 11 telas | ✔ | ✔ |

CI completo (`typecheck`, `test`, `content:strict`, `build`, `budget`, `e2e`): tudo verde.

- 295 testes unitários e de componentes (43 arquivos);
- 58 testes e2e nos projetos `chromium`, `mobile-360` e `mobile-402`;
- JS inicial com 35,7 KB gzip (limite de 100 KB);
- snapshot de Nova York intacto.

Capturas a 360 × 780 e 402 × 874 em [`screens/`](screens/): Início, Cidade (NY), Dia 01/11,
Dia 09/11 e Atração (Grand Central).

## Dados para revisar

O que não está claro no conteúdo atual **não foi inventado**. A lista está em
[`data-review.md`](data-review.md): 29 restaurantes e cafés de Orlando sem endereço nem link de
mapa, e 3 mercados (Walmart Supercenter, Target, Publix) citados só como texto na chegada de
07/11.
