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

## Navegação (feature 003)

- **Viagem** (`#/`): hoje e a próxima atividade, os três destinos e o progresso geral.
- **Nova York / Orlando / Miami** (`#/destino/<cidade>[/<data>]`): foto de destaque, período, progresso
  da cidade, seletor de dias e o roteiro do dia (com horários em NY; em ordem, sem horários, em
  Orlando e Miami). Cada atividade tem o controle **Feito/Pendente** direto na lista.
- **Atividade** (`#/destino/<cidade>/<data>/<chave>`): fotos, por que está no roteiro, informações
  importantes, logística, tempo previsto.
- **Guia** (`#/guia`), **Favoritos**, **Meus roteiros** e o **documento de NY** continuam
  disponíveis; os links antigos `#/full/nova-york/...` redirecionam para os destinos.

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

O app é um guia de bolso para usar na rua, com uma mão e sem internet (feature 006). São quatro abas
na parte de baixo:

| Aba | Para quê |
|---|---|
| **Agora** | Abre no dia de hoje, com o próximo passo em destaque: horário, foto, como chegar, Feito/Pular (com Desfazer), "Mostrar ao motorista" |
| **Dia** | A linha do tempo do dia por regiões; deslize para trocar de dia |
| **Por perto** | Onde comer (☕/🏆/🍰), lojas e curiosidades da região atual |
| **Viagem** | Cidades e progresso, ingressos, dicas práticas, documento completo, guia de pontos, alto contraste (modo sol) |

Os dias de troca de cidade (07/11, 18/11, 21/11) aparecem em três blocos: antes de sair, a viagem e
a chegada.

**Simular um momento** (para revisar antes da viagem): abra o app com `?agora=AAAA-MM-DDTHH:MM`, na
hora de Nova York. Exemplo: `http://localhost:5173/?agora=2026-11-01T13:30#/`.

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
- almoços e "tempo livre" ficam fora do progresso; "Onde comer" fica em "Por perto";
- o Dia 1 do doc (07/11) aparece no bloco "A chegada" do dia de viagem Nova York → Orlando;
- em 06/11 e 07/11, "Agora" mostra "Reservar hoje" com os Multi Pass;
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
