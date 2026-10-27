# Research: Visual e estrutura de "caderno de viagem" (feature 008)

Base: a spec (Q1 = B), as capturas em `design-reference/` e o código das features 006 e 007.

## R1. Fontes do design offline

- **Decision**: Fraunces (títulos, peso 600) e Inter (texto, pesos 400 e 600), em WOFF2, recorte
  latino. Os arquivos ficam em `public/fonts/`, com a licença OFL ao lado, entram no precache do
  Service Worker e são declarados por `@font-face` com `font-display: swap`. Os arquivos são baixados
  uma vez do Google Fonts e versionados no repositório.
- **Rationale**: o design usa Fraunces + Inter (verificado no preview: `h1–h3` em Fraunces 600, corpo
  em Inter 16 px). Sem rede, fontes remotas não carregam (constituição, Princípio I). WOFF2 com
  recorte latino fica em ~25–45 KB por arquivo, ~120 KB no total, bem abaixo do orçamento de 40 MB.
  `swap` mostra a fonte do sistema até a fonte carregar, cobrindo o caso de borda "primeira abertura
  sem internet".
- **Alternatives considered**:
  - pacotes `@fontsource/*`: é dependência nova só para copiar arquivos;
  - fonte variável completa do Fraunces (~300 KB): mais pesada sem ganho;
  - fontes do sistema: perderia o tom editorial do design.

## R2. Paleta e tokens

- **Decision**: tokens de cor em `:root`, tirados do preview e ajustados para os mínimos da 006:

  | Token | Claro | Uso |
  |---|---|---|
  | `--paper` | `#faf8f5` | fundo |
  | `--card` | `#fffdfa` | cartões |
  | `--ink` | `#241d19` | texto |
  | `--muted` | `#5b4f47` | texto secundário (≥ 7:1 no `--paper`) |
  | `--accent` | `#a3401f` | terracota: links, ativo, chips de destaque (≥ 4,5:1; o essencial usa `--ink`) |
  | `--tip-bg` | `#f4ece3` | caixas de dica |
  | `--ok` | `#2f6b3a` | "✓" e chip de ritmo leve |

  Também há:
  - degradês por cidade, usados só quando falta foto (NY: ardósia; Orlando: violeta; Miami: areia);
  - versão escura em `@media (prefers-color-scheme: dark)`;
  - `[data-contrast='high']` com branco e preto puros e véu mais forte.
- **Rationale**: o design tem fundo `rgb(250,248,245)` e texto `rgb(36,29,25)`. O terracota do
  design (~`#b4532a`) fica abaixo de 7:1, por isso o essencial (horário, nome, título) usa `--ink`, e
  o acento fica para links e destaques.
- **Alternatives considered**: copiar o terracota exato; reprovaria o teste de contraste 7:1 da 006.

## R3. Fotos nos cabeçalhos ("foto onde o design tem degradê")

- **Decision**: um componente `Cover` é usado na capa da viagem, da cidade e do dia, e nos cartões de
  cidade, dia e bairro. Ele faz:
  - a foto em `object-fit: cover`;
  - um véu linear escuro (de 15% no topo a 75% na base);
  - os textos brancos por cima.

  Sem foto, mostra o degradê da cidade com o ícone em traço, como no design. As fotos fora da primeira
  tela usam `loading="lazy"` e `decoding="async"`.
- **Escolha da foto**:

  | Onde | Foto, por ordem de preferência |
  |---|---|
  | Viagem | Ponto de destaque da 1ª cidade |
  | Cidade | Ponto de destaque da cidade (`heroPointId`) |
  | Dia | Foto da 1ª região do dia; senão, a do 1º passo com foto; senão, a da cidade |
  | Bairro | Foto da região (feature 006/007) |
  | Parada | Foto do lugar; senão, a do ponto do guia; senão, nenhuma (quadro com ícone do tipo) |

  A cidade nunca empresta foto a uma parada.
- **Rationale**: só usa fotos que já existem e já têm crédito (features 001, 006 e 007), sem foto de
  outro lugar.
- **Contraste**: o teste de contraste mede o texto contra o véu no ponto mais claro, o pior caso. O
  véu é calibrado para ≥ 7:1 com o branco.

## R4. Estrutura de telas e rotas (Q1 = B)

- **Decision**: telas e rotas novas, com as antigas redirecionadas:

  | Rota | Tela |
  |---|---|
  | `#/` | **Início** |
  | `#/cidade/:cityId` e `#/cidade/:cityId/:aba` (`roteiro`, `dicas`, `transporte`, `bairros`) | **Cidade** |
  | `#/dia/:date` | **Dia** (redesenhado) |
  | `#/dia/:date/:key` | Detalhe do passo (mantido, restilizado) |
  | `#/perto/:date/:areaId[/:placeId]` | **Bairro**: o "Por perto" da 006 vira a página de um bairro |
  | `#/dicas` | **Dicas** da viagem |
  | `#/transporte` | **Transporte** da viagem |
  | `#/motorista/:date/:key` | Motorista (mantido) |
  | `#/guia`, `#/guia/:cityId`, `#/ponto/:id` | Guia de pontos (feature 001), restilizado. A cidade do guia passa de `#/cidade/:id` para `#/guia/:id`, porque `#/cidade/:id` agora é a página da cidade do design |
  | `#/full/:cityId/documento[/:section]`, `#/creditos`, `#/favoritos`, `#/roteiros…` | Mantidos, restilizados |

  Redirecionamentos:
  - `#/viagem` → `#/`;
  - `#/dia` (sem data) → dia de hoje, ou o 1º dia antes da viagem;
  - `#/perto` (sem parâmetros) → bairro atual de hoje; fora da viagem, `#/`;
  - os de `redirectFor` da 006 continuam.
- **Barra de baixo**: Início, Dicas e Transporte. Início fica ativo em `/`, `/cidade`, `/dia`,
  `/perto`, `/guia`, `/ponto`, `/full`, `/creditos`, `/favoritos` e `/roteiros`. Some no motorista.
- **Rationale**: segue o design (início → cidade → dia), com as funções da 006 realocadas como na
  tabela do FR-005.

## R5. "Agora" no Início

- **Decision**: o Início reaproveita a lógica da 006 (`nextStep`, `howToGet`, `useMarkWithUndo`) num
  cartão "Agora" no estilo do design. O cartão fica logo abaixo de uma capa compacta: durante a
  viagem, a capa da viagem fica mais baixa para o cartão inteiro caber na primeira tela (FR-016). Nos
  dias de locomoção, o cartão mostra o primeiro item pendente dos três blocos e "Abrir o dia".
  "Reservar hoje" vem logo depois.
- **Rationale**: SC-004 exige o próximo passo sem toque. O design não tem "Agora", e o Início é a
  primeira tela.

## R6. Dicas e Transporte a partir dos docs (sem inventar)

- **Decision**: o build extrai uma lista de **dicas** de cada doc. Cada uma tem:
  - `id`, `cityId`, `category`, `title`;
  - `html`: o trecho do doc, convertido sem reescrita;
  - `source`: o título da seção do doc.

  Regras por formato:
  - **NY**: cada `###` da seção `## 🧳 Dicas práticas`, exceto "Fontes consultadas", vira uma dica;
  - **Orlando**: cada item `**Rótulo:** texto` da lista "Dicas práticas" vira uma dica;
  - **reservas**: "O que comprar antes" (NY, um `###` das dicas) e a seção "O que reservar com
    antecedência" (Orlando) viram a dica de reservas da cidade, com o HTML do doc: a tabela, a regra
    dos ingressos e o checklist.

  As categorias são deduzidas do título, por palavra-chave, e o mapa fica num contrato:

  | Categoria | Palavras-chave |
  |---|---|
  | `clima` | clima |
  | `dinheiro` | gorjeta, imposto |
  | `reservas` | comprar antes, reservar |
  | `transporte` | metrô, ônibus, estacionamento, carro |
  | `apps` | app |
  | `filas` | fila |
  | `outros` | o resto |

- **Transporte**:
  - **"Entre as cidades"**: os dias de locomoção da viagem, com os itens que já existem em
    `departures` e `arrivals` (features 006 e 007) e a rota tirada de `trip`;
  - **"Na cidade"**: as dicas de categoria `transporte` de cada cidade, mais a chegada da 1ª região
    `chegada` do roteiro (NY: "✈️ Chegada: JFK → Pod 51", com link para o dia).
- **Conferência (SC-008)**: cada dica precisa ter o texto, sem marcação, presente na seção de origem
  do doc. A regra **D7** do build acusa a dica sem origem.
- **Alternatives considered**: escrever dicas e transporte à mão, o que viola "não inventar dados" e
  "textos do design ignorados".

## R7. Dados de cidade para as capas

- **Decision**:
  - `content/trip.json` ganha `country` por cidade ("Estados Unidos"), um dado factual e não um texto
    do design;
  - noites, datas, "dias de roteiro" (sem os de locomoção), progresso e chegada/partida vêm dos dados
    que já existem;
  - a frase da cidade é o `summary` do ponto de destaque do guia;
  - as tags são os compromissos com ingresso e as regiões mais citadas no roteiro (até 6).
- **Rationale**: FR-007/FR-008, nenhum texto novo inventado.

## R8. Testes

- **Decision**:
  - os testes de domínio continuam;
  - os de página e E2E das features 006 e 007 são adaptados à nova estrutura, cobrindo as mesmas
    funções;
  - testes novos:
    - **SC-002**: um teste varre o `content.json` e o HTML renderizado das telas principais atrás dos
      termos do design;
    - **SC-003**: cobertura de fotos nos cartões;
    - **D7**: a origem das dicas;
    - **SC-005**: contraste, alvos e rolagem lateral nas telas novas, nos três temas;
    - **SC-006**: o modo offline com as fontes.
- **Rationale**: Princípio II; garante que nenhuma função da 006/007 se perde na troca de estrutura.

## R9. Densidade e desempenho

- **Decision**:
  - a primeira tela do dia mostra a capa (≈ 240 px) e ≥ 3 paradas, cada cartão com miniatura de
    72 px;
  - as fotos das capas usam os WebP de 900 px que já existem, e as miniaturas usam os mesmos arquivos
    com `width/height` fixos, sem gerar arquivos novos;
  - fotos fora da tela usam `loading="lazy"`.
- **Rationale**: SC-007, sem aumentar o conteúdo além das fontes.
