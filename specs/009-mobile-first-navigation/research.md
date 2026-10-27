# Research: Navegação mobile first (feature 009)

Base: a spec (Q1 = B, Q2 = B, Q3 = A), as telas da feature 008 e o conteúdo atual
(`public/data/content.json`).

## R1. Larguras e áreas seguras

- **Decision**:
  - **viewport**: o `index.html` usa `viewport-fit=cover`;
  - **áreas seguras**: o cabeçalho fixo usa `padding-top: env(safe-area-inset-top)` e o fim da
    página usa `padding-bottom: env(safe-area-inset-bottom)` (sem a barra de baixo, Q3 = A); as
    laterais usam `env(safe-area-inset-left/right)`;
  - **coluna**: largura máxima de 520 px, centralizada no desktop (FR-005);
  - **E2E**: os testes rodam a 360 × 780 (Galaxy S24) e a 402 × 874 (iPhone 17). A suíte de
    acessibilidade da 008, feita a 390 px, passa a rodar nessas duas larguras;
  - **corpo**: o texto do corpo continua em 17 px (≥ 16 px, FR-002).
- **Rationale**: atende o pedido sem criar layout separado.

## R2. Card inteiro clicável ("stretched link")

- **Decision**:
  - **estrutura**: cada card tem um único `<a>`, o do título, com `::after { position: absolute;
    inset: 0 }`, e o card tem `position: relative`;
  - **controles internos**: o círculo de marcar, o botão de expandir e os itens marcáveis ficam com
    `position: relative; z-index: 1` acima do link esticado e continuam funcionando (FR-007);
  - **foco e toque**: o foco aparece no card inteiro, com `:focus-within` e o `outline` do link
    esticado. O toque dá feedback com `:active`, escurecendo um pouco e reduzindo para 0,99;
  - **indicador**: "Ver roteiro", "Abrir dia" e "Ver o bairro" viram uma seta › com `aria-hidden`.
- **Rationale**: um único link por card dá uma leitura limpa para leitor de tela e área de toque
  máxima. O card não vira `<a>` inteiro porque tem botões dentro, e `<a>` não pode conter `<button>`.
- **Alternatives considered**: o card inteiro como `<a>` funciona nos cards sem controles (cidade,
  dia, bairro, lugar), mas mistura técnicas. Fica uma técnica só em todos os cards.

## R3. Menu de seções do dia

- **Decision**:
  - **forma**: um `nav` de chips com âncoras (`#paradas`, `#comer`, `#lojas`, `#bairros`,
    `#transporte`, `#dicas`), preso no topo logo abaixo do cabeçalho fixo (`position: sticky`),
    rolável na horizontal só dentro do próprio menu;
  - **seção atual**: marcada com `aria-current`, usando IntersectionObserver;
  - **âncoras no hash router**: o hash já é usado pela rota, então o toque no chip chama
    `scrollIntoView` na seção, com `scroll-margin-top` igual à altura do cabeçalho + menu, e não
    muda o endereço;
  - **quais itens aparecem**: só seções com conteúdo (FR-017), calculadas por uma função pura
    `daySections(view)`.
- **Rationale**: âncoras mantêm a página inteira rolável de cima para baixo, como pedido ("rolagem
  vertical, menu que rola junto").
- **Alternatives considered**: abas que trocam o conteúdo, que esconderiam o resto e pediriam toques
  extras.

## R4. Conteúdo das seções (nada inventado)

| Seção | Origem | Aparece quando |
|---|---|---|
| Paradas | `allSteps(day)`, como na 008 | há passos |
| Restaurantes e Cafés | lugares `food` das regiões do dia, na ordem do roteiro, sem repetir nome | há ≥ 1 |
| Brechós e Lojas | lugares `shop` das regiões do dia, na ordem do roteiro, sem repetir nome | há ≥ 1 |
| Bairros | regiões `bairro` do dia (cards que abrem `#/perto/<data>/<região>`) | há ≥ 1 |
| Transporte | passos de logística com instrução, `transfer` das regiões, "Mapa do dia"; nos dias de viagem, os três blocos | há ≥ 1 item |
| Dicas | avisos do dia (`alerts`), Q2 = B | há ≥ 1 |

- **Card de lugar**: nome, região/endereço (o endereço do roteiro; senão, o nome da região), descrição
  curta (1º texto do roteiro), link de mapa quando houver. O card inteiro abre o detalhe que já existe
  (`#/perto/<data>/<região>/<lugar>`).
- **Contagem real** (cópia atual):
  - Nova York tem comida em todos os 7 dias e lojas em 01/11 (17) e 04/11 (5);
  - Orlando tem comida nos dias de parque e nenhuma loja;
  - Miami não tem comida nem lojas.
- **Dados a revisar** (FR-022), levantados no build e listados no relatório:
  - **Orlando, "Onde comer"**: os 29 lugares têm nome e a área do parque, mas não têm endereço nem
    link de mapa no doc;
  - **Orlando, mercados de 07/11** (Walmart Supercenter, Target, Publix): são citados só como texto
    da chegada, sem endereço, e não viram itens de "Brechós e Lojas". Aparecem dentro de Transporte →
    A chegada, como hoje.

## R5. O que sai (Q1 = B, Q3 = A)

- **Decision**:
  - **remover**:
    - o cartão "Agora" (`NowSection`, `TransitNow`) e `ReserveToday`;
    - as seções Destaques e Consulta do Início;
    - a barra de baixo (`TabBar`);
    - as páginas Dicas e Transporte da viagem (`Tips.tsx`, `Transport.tsx`);
    - na cidade, as tags e as abas (`PillTabs`, `CityTransport`, `TipCard` na cidade);
  - **manter**:
    - o `NextStepCard` sai junto com "Agora", mas os helpers (`stepAddress`, `MODE_*`) continuam,
      porque o motorista e o dia os usam;
    - o domínio (`nextStep`, `howToGet`), usado pela marca "agora" e pelo detalhe do passo;
  - **endereço direto**: guia, documento, créditos e favoritos continuam. O alto contraste ganha a
    rota `#/exibicao` (a página "Exibição", só com o interruptor), já que a Consulta sai; até aqui só
    existia na Consulta;
  - **redirecionamentos**:

    | De | Para |
    |---|---|
    | `#/dicas`, `#/transporte`, `#/viagem` | `#/` |
    | `#/cidade/<c>/<aba>` | `#/cidade/<c>` |
    | `#/perto` (sem parâmetros) | `#/` |
- **Rationale**: Q1 = B diz que alto contraste e créditos ficam "só pelo endereço direto". Por isso
  cada um precisa de um endereço que funcione. As dicas da cidade (Q2 = B) continuam no documento.
- **Testes**: os testes de "Agora", "Reservar hoje", Tips, Transport e das abas da cidade são
  removidos ou trocados pelos equivalentes da estrutura nova. O snapshot de NY não muda, porque o
  conteúdo não muda.

## R6. Atração

- **Decision**: em `StepDetail` a ordem passa a ser:
  1. foto (quando houver);
  2. título;
  3. descritivo completo (os textos do lugar, que hoje ficam em "Ler mais") e as orientações do evento;
  4. informações práticas (horário, fila e acesso, endereço, ingresso, como chegar, "Abrir no mapa",
     motorista);
  5. ações (Feito/Pular).

  O `<details class="read-more">` sai.
- **Rationale**: FR-018 / SC-006.
