# Guia da Viagem — Nova York, Orlando e Miami

PWA em português para a viagem de 31/10 a 21/11/2026: guia de pontos turísticos (lista e mapa),
favoritos e roteiros por dia, com 19 roteiros sugeridos. Funciona **offline** depois de instalado;
favoritos e roteiros ficam só no aparelho.

Especificação e plano: [`specs/001-tourist-guide-itineraries/`](specs/001-tourist-guide-itineraries/).

## Comandos

Requer Node.js 24.

```bash
npm install
npm run dev             # desenvolvimento (gera o conteúdo e abre o Vite)
npm test                # testes unitários, de componente e de conteúdo
npm run content:strict  # valida o conteúdo completo (como no CI)
npm run build           # build de produção com Service Worker
npm run preview         # serve o build em http://localhost:4173
npm run budget          # orçamento: JS inicial < 100 KB gzip, conteúdo ≤ 40 MB
npx playwright install chromium && npm run e2e   # testes ponta a ponta, incluindo offline
```

## Endereços

As telas atuais estão em "Como o app se usa na viagem" (features 008 e 009). Outras telas: guia de pontos
(`#/guia`, `#/guia/<cidade>`, `#/ponto/<id>`), favoritos, roteiros do casal (`#/roteiros`),
documento de cada cidade (`#/full/<cidade>/documento`), créditos (`#/creditos`) e o modo motorista
(`#/motorista/<data>/<passo>`). Endereços antigos levam à tela equivalente: `#/viagem`, `#/dicas`,
`#/transporte` e `#/perto` → Início, `#/cidade/<cidade>/<aba>` → a cidade, `#/dia` → dia de hoje, `#/destino/...` e `#/full/nova-york/<data>` → o dia.

## Editar o conteúdo

- Pontos: `content/points/<cidade>.json`. Cada foto tem um `ref` (`wiki:<artigo da Wikipédia em
  inglês>` ou `File:<arquivo da Wikimedia Commons>`) e um `alt` em português.
- Roteiros sugeridos: `content/itineraries.json` (hoje só os de Miami; Nova York e Orlando usam o
  roteiro do casal).
- Depois de mudar fotos: `npm run photos` baixa as novas, converte para WebP e atualiza
  `content/photo-credits.json` com autor e licença.
- Sempre rode `npm run content:strict` antes de publicar. Formato completo em
  [`contracts/content-schema.md`](specs/001-tourist-guide-itineraries/contracts/content-schema.md).

Horários e preços têm a data de verificação no app; confirme nos sites oficiais antes da visita.

## Como o app se usa na viagem

O app segue o visual e a estrutura de um "caderno de viagem" (feature 008): fundo claro e quente,
títulos serifados (Fraunces), texto em Inter, cartões com capa e muitas fotos — cada capa mostra a
foto real do lugar, com um véu escuro para a leitura.

Desde a feature 009 o app é **mobile first** (testado a 360 × 780 e 402 × 874): uma coluna só (no
computador, centralizada com até 520 px), sem barra inferior, cabeçalho fixo com "Voltar" e
**cartões inteiros clicáveis** (um único link por cartão, foco visível e retorno ao toque).

| Tela | Para quê |
|---|---|
| **Início** (`#/`) | Só os 3 destinos, cada um um cartão grande com foto |
| **Cidade** (`#/cidade/<cidade>`) | Capa da cidade e a lista de dias em cartões |
| **Dia** (`#/dia/<data>`) | Capa do dia e um menu de seções preso no topo — **Paradas**, **Restaurantes e Cafés**, **Brechós e Lojas**, **Bairros**, **Transporte** e **Dicas** (avisos do dia); cada seção só aparece se o roteiro tiver conteúdo para aquele dia. Deslize para trocar de dia |
| **Atração** (`#/dia/<data>/<passo>`) | Título, o descritivo completo (sem "Ler mais"), as informações práticas (endereço, ingresso, horário, como chegar, mapa, Motorista) e as ações Feito/Pular |
| **Bairro** (`#/perto/<data>/<região>`) | A região com foto, onde comer (☕/🏆/🍰), lojas e locações |
| **Exibição** (`#/exibicao`) | Alto contraste (modo sol) |

Endereços que continuam funcionando, sem link no app: `#/guia`, `#/favoritos`, `#/roteiros`,
`#/creditos` e os documentos completos (`#/full/<cidade>/documento`). `#/viagem`, `#/dicas`,
`#/transporte` e `#/perto` levam ao Início; `#/cidade/<cidade>/<aba>` leva à cidade. O que o
roteiro não deixa claro (ex.: restaurantes sem endereço) está listado em
`specs/009-mobile-first-navigation/data-review.md`.

Nenhum texto do design de referência é usado (teste `design-terms`).

**Fontes offline:** `public/fonts/` (Fraunces 600, Inter 400/600, recorte latino, licença SIL OFL 1.1;
origem em `public/fonts/README.md`), no precache do Service Worker.

Os dias de troca de cidade (07/11, 18/11, 21/11) mostram, na seção Transporte, os blocos que o
roteiro tiver: antes de sair, a viagem e a chegada.

**Simular um momento** (para revisar antes da viagem): abra o app com `?agora=AAAA-MM-DDTHH:MM`, na
hora de Nova York. Exemplo: `http://localhost:5173/?agora=2026-11-01T13:30#/dia/2026-11-01`.

**Fotos do roteiro:** `npm run photos -- --doc` baixa as fotos listadas em
`content/full/<cidade>/doc-photos.json` (Wikimedia Commons, licença livre, com crédito); use
`--city orlando` para uma cidade só. O que ficou sem foto está em
`specs/006-trip-companion-ux/photos-missing.md` (Nova York) e
`specs/007-orlando-itinerary-doc/photos-missing.md` (Orlando).

## Roteiro de Nova York

O roteiro de 31/10 a 06/11 é o doc do casal no Claude Docs ("Roteiro Nova York · 31/10 a 06/11"),
organizado por bairros (feature 005). A exportação Markdown do doc fica, sem edição, em
`content/full/nova-york/roteiro.md` (hoje, a cópia de 22/10/2026). O build a converte:

- cada dia mostra os bairros na ordem do doc, com os itens com horário (Feito/Pendente), as listas de
  lojas, onde comer (☕/🏆/🍰) e locações, com "Ver fotos" e "Abrir no mapa";
- pausas e tardes livres, deslocamentos e restaurantes ficam fora do progresso;
- o documento completo fica em `#/full/nova-york/documento`, com "Imprimir / salvar PDF".

**Atualizar quando o doc mudar:** peça ao Claude "atualize o roteiro de Nova York com a versão atual
do doc" (ele exporta o doc em Markdown para `roteiro.md`) e rode `npm run content:strict`. A
conferência (regras D1–D5) aponta qualquer coisa do doc que o app não reconheceu.

Os outros arquivos da pasta: `meta.json` (hotel, chegada, compromissos com ingresso comprado —
Knicks x Nets 02/11 e MJ The Musical 05/11 — e `checklistOverrides`, as decisões que valem no app sem
editar a cópia do doc, como o Tenement Museum às 16h15) e `point-links.json` (nome do lugar no doc →
ponto do guia, para mostrar as fotos). Formato e regras:
[`specs/005-nyc-itinerary-doc/contracts/`](specs/005-nyc-itinerary-doc/contracts/).

## Roteiro de Orlando

O roteiro de 08 a 17/11 é o doc "Roteiro Orlando – Novembro 2026" do casal (feature 007), lido pelo
mesmo leitor do de Nova York. A exportação Markdown fica, sem edição, em
`content/full/orlando/roteiro.md` (hoje, a cópia de 24/10/2026, revisão 26):

- cada dia de parque mostra a chegada ao estacionamento, as atrações na ordem do doc, com fila, área
  do parque e forma de entrar (Multi Pass, Single Pass, fila normal), e a volta ao hotel;
- almoços e "tempo livre" ficam fora do progresso; onde comer fica em "Restaurantes e Cafés" do dia;
- o Dia 1 do doc (07/11) aparece no bloco "A chegada" do dia de viagem Nova York → Orlando;
- o documento completo fica em `#/full/orlando/documento`.

Decisões da feature 007:

- **Q1:** em 18/11 o casal vai de **trem** para Miami. O `meta.json` declara a partida: o trecho do doc
  sobre check-out e devolução do carro no MCO e "De trem para Miami", que vem do casal. A frase do doc
  sobre voo internacional fica só no documento completo. Estação e horário do trem não estão em
  nenhuma fonte e não aparecem.
- **Q2:** foto offline de cada atração e região, com crédito, com meta de pelo menos 90%.
- O doc não diz qual é o hotel em Orlando: a volta ao hotel aparece sem endereço.

**Atualizar quando o doc mudar:** exporte o doc em Markdown para `content/full/orlando/roteiro.md`,
sem editar, e rode `npm run content:strict`. A conferência (D1–D6) aponta o que o app não reconheceu
e acusa se o trecho citado na partida sumiu do doc.

## Publicar e instalar

O workflow `.github/workflows/ci.yml` roda os testes e publica no GitHub Pages a cada push na
`main` (em *Settings → Pages*, escolha a fonte "GitHub Actions").

No celular: abra a URL publicada, instale (iPhone: Compartilhar → "Adicionar à Tela de Início";
Android: "Instalar app"), **abra pelo ícone** com internet e espere a mensagem "Guia disponível
offline". Depois disso tudo funciona em modo avião.
