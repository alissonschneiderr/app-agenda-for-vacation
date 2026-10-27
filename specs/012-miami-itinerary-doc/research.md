# Research — feature 012

Fonte: o documento "Roteiro Miami — 18 a 20 de novembro" (Claude Docs, rev. 15), lido por inteiro.
Uma cópia do texto está em `source/roteiro-miami-2026-10-27-rev15.md`.

## R1 — Onde o roteiro de Miami entra

- **Decision**: criar `content/full/miami/` com:
  - `roteiro.md`, a conversão fiel do documento para o formato dos roteiros de NY e Orlando;
  - `meta.json`;
  - `doc-photos.json`, `photo-credits.json` e `point-links.json`.

  O build (`npm run content`) já lê todo diretório de `content/full/`.
- **Rationale**: é a mesma estrutura de NY (feature 005) e Orlando (007), com o mesmo leitor, as
  mesmas regras de fidelidade e as mesmas telas. Nenhuma tela nova.
- **Alternatives considered**: ler o Claude Docs em tempo real. Rejeitada: o app é offline-first
  (constituição I), e o roteiro precisa estar no precache.

## R2 — Conversão do documento para o formato do leitor

O documento usa a mesma gramática do roteiro de NY:
- `## Dia N (dia, dd/mm): título`;
- `### 📍 região` e `### 🌙 Noite`;
- `**Atrações (no roteiro):**`, com bullets `**HHhMM — emoji Nome**` e sub-bullets de 📷, mapa e
  descrição;
- `**☕🏆🍰 Onde comer…**`;
- `**🎬 Locações…**`;
- linhas de logística `**08h00 – …:**` e `🏨 **~… – volta ao hotel:**`.

- **Decision**: gerar o `roteiro.md` a partir do XML do documento, com um script único de
  conversão (não fica no repositório), que preserva:
  - listas e sub-listas;
  - negrito, itálico e links com as URLs originais;
  - tabelas, em pipe.

  Ajustes de formato, sem mexer no conteúdo:
  - "Atrações (no roteiro)" de 18/11 começa com uma linha combinada ("**15h30 – almoço tardio** …
    e **16h30 – check-in** …"). Ela vira duas linhas de logística antes da lista, porque não são
    atrações;
  - os "~12h30 — pausa livre" viram itens livres, fora do progresso, como os almoços de Orlando.
- **Validação**: as regras de fidelidade D1–D5 do leitor contam os itens no próprio texto. Um teste
  novo, `tests/content/miami-doc-real.test.ts`, confere o app contra a cópia do documento em
  `source/` (SC-001 a SC-004), como `orlando-doc-real.test.ts`.

## R3 — 18/11: dia de viagem e tarde em South Beach (Q1 = A)

- **Situação atual**:
  - `cityForDate('2026-11-18')` devolve `miami` (o destino);
  - `fullDayFor` acha o primeiro roteiro com aquela data, e Orlando não tem dia 18/11;
  - a página do dia já monta todas as seções da 009/010 em qualquer dia, inclusive nos de viagem,
    com os blocos da troca de cidade dentro de Transporte.
- **O que falta**: hoje o leitor só sabe pôr o dia **inteiro** no bloco "A chegada"
  (`meta.arrivalDay`, usado no 07/11 de Orlando).
- **Decision**: uma regra nova no leitor (`scripts/doc-parser.ts`). Num dia comum (não
  `arrivalDay`), uma seção `### 🚆 Chegada…` ou `### ✈️ Chegada…` vira:
  - `arrivals[date]`: os itens em negrito com horário viram itens marcáveis ("14h21 – chegada na
    MiamiCentral", "~15h15 – Kasa La Flora"); as opções de traslado entram no HTML do bloco;
  - o resto do dia (📍 South Beach…) segue como um dia normal, com paradas, lugares e locações.

  O 07/11 de Orlando continua pelo `arrivalDay`, sem mudança.
- **Resultado**: em 18/11, o menu tem Paradas (4), Restaurantes e Cafés (4), Curiosidades (2),
  Bairros (1) e Transporte, com "Antes de sair", "A viagem" e "A chegada" de Miami.

## R4 — Tipos de dia (FR-014)

- **Decision**: em `content/trip.json`, `dayKinds`:
  - `2026-11-19`: `walk` (dia de shopping, sem praia);
  - `2026-11-20`: `beach`.
- Não existe tipo "compras". O tipo só escolhe o ícone e o rótulo do card, e "a pé" é o mais
  próximo para um dia de shopping. Transporte mostra o Uber (regra da 010), então o rótulo não
  engana sobre o deslocamento. Fica registrado para revisão.

## R5 — Apagar os roteiros sugeridos de Miami (Q2 = B)

- **Situação**: `content/itineraries.json` tem só 2 sugeridos, os dois de Miami
  (`sug-2026-11-19` "South Beach e Art Deco" e `sug-2026-11-20` "Vizcaya, Little Havana e
  Wynwood"). `seedSuggested` copia cada sugerido para o estado do aparelho uma única vez
  (`seededIds`).
- **Decision**:
  1. esvaziar a lista em `content/itineraries.json` (ou remover o arquivo, se o build aceitar);
  2. ao carregar o estado, remover os roteiros com `origin: 'suggested'` cujo `sourceId` não existe
     mais no conteúdo. Os roteiros do próprio casal (`origin` ≠ `suggested`) nunca são tocados.

  As marcas de passos desses roteiros ficam sem efeito.
- **Testes afetados**: os que semeiam os sugeridos para ver 19/11. Eles passam a usar o roteiro do
  documento. Os da 001 que dependem de sugeridos são revistos um a um. Os que testam a lógica de
  semear com fixture ficam.

## R6 — Reservas e checklist de praia

- **Decision**: o leitor ganha o formato da tabela de Miami (`Data | Item | Situação`), ao lado
  do de Orlando (`Item | Quando reservar | Custo | Dia de uso`):
  - `forDate` = a coluna Data (dd/mm → data; "Antes de embarcar" → sem data);
  - `what` = Item;
  - `note` = Situação.

  O "O que levar para a praia" (lista `- [ ]`) vira dica de Miami com os itens marcáveis, como os
  checklists dos outros roteiros.

## R7 — Lojas da Sawgrass (FR-004, FR-012)

- O documento lista as lojas por **categoria** ("Esporte: Nike Factory, Adidas…"), sem endereço
  por loja.
- **Decision**: cada categoria vira um item de "Brechós e Lojas" de 19/11, com o nome da
  categoria, a lista de marcas como descrição e o mapa da Sawgrass do documento. Nenhum
  endereço é inventado. As 5 categorias entram em `data-review.md` ("lojas por categoria, sem
  endereço").

## R8 — Fotos (FR-011)

- **Decision**: o mesmo fluxo da 007, `npm run photos -- --doc --city miami`, com os nomes das
  regiões e atrações em `doc-photos.json` (arquivos do Wikimedia Commons com licença livre e
  crédito). O que ficar sem foto vai para `specs/012-miami-itinerary-doc/photos-missing.md`.
- O `point-links.json` liga as regiões aos pontos do guia que já existem, quando o nome bate. Isso
  dá mapa e motorista:
  - South Beach (Art Deco District) → `mia-art-deco` ou `mia-south-beach`;
  - South Pointe Park → `mia-south-pointe`;
  - Lincoln Road → `mia-lincoln-road`.

## R9 — Dicas, documento completo e o que fica de fora

- "🧳 Dicas práticas" vira dicas de Miami, pelas mesmas regras de categoria de NY e Orlando:
  - Transporte;
  - Clima;
  - Gorjetas;
  - Impostos e compras;
  - Segurança;
  - O que levar;
  - Outros.

  Estratégia, Thanksgiving, Hospedagem, a legenda de preço, "📊 Resumo" e "📚 Fontes" ficam no
  documento completo (`#/full/miami/documento`).
- As "Dicas" do dia (regra da 010, só avisos específicos) usam o que o documento põe no dia:
  - 18/11: o shuttle da Brightline, que precisa ser conferido;
  - 20/11: a reserva do Joe's e o movimento da sexta.

  O que o leitor marcar como aviso do dia segue `isGenericTip`.
- "Sobre as fotos" (aviso do próprio documento) não entra no app, pela spec.
