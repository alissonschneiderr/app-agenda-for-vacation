# Feature Specification: O app instalado no Galaxy S24 Ultra e no iPhone 17, offline e com atualização avisada

**Feature Branch**: `014-installable-phone-app` (trabalho na `main`, a pedido do usuário)

**Created**: 2026-10-28

**Status**: Draft

**Decisões** (usuário: "Q1: A; Q2: C"):
- **Q1 = A**: a internet só é usada para buscar atualizações do app e para abrir links externos (rotas
  e mapas no Google Maps, "Ver fotos"). Não entram previsão do tempo nem sincronização entre os
  celulares.
- **Q2 = C**: o repositório `app-agenda-for-vacation` passa a ser **público** e o app é publicado no
  GitHub Pages do plano grátis, pelo CI que já existe. O código e o roteiro (datas, hotéis) ficam
  visíveis para qualquer pessoa. Decisão consciente do usuário.

**Input**: User description: "Quero que este app de roteiro de viagem rode em dois celulares: um Samsung
Galaxy S24 Ultra (Android) e um iPhone 17 (iOS)". Requisitos:
1. funcionar como app;
2. sem reinstalar a cada mudança (aviso discreto de nova versão, sem perder dados);
3. offline primeiro (internet só para funções listadas, que falham com uma mensagem simples).

Também: cuidados com o iPhone (Safari → "Adicionar à Tela de Início", armazenamento persistente) e os
entregáveis (código, passo a passo de instalação, como publicar e confirmar, como testar offline).

## Contexto

**Abordagem: PWA, não Capacitor.** O pedido sugere PWA e pede justificativa se outra abordagem for
melhor.
- O PWA atende os dois celulares. O app já é um PWA (instalável, com Service Worker e offline).
  Falta o que esta feature pede: aviso de nova versão, armazenamento persistente, tela de abertura e
  publicação em HTTPS.
- O Capacitor geraria apps nativos. No iPhone, sem a conta paga de desenvolvedor da Apple
  (US$ 99/ano), o app instalado pelo Xcode **expira em 7 dias**. A viagem tem 22 dias, então seria
  preciso reinstalar no meio dela, o que contraria "instalo uma vez". Com a conta paga, cada versão
  nova ainda passaria pelo TestFlight ou por reinstalação.
- No Android, o Capacitor exigiria gerar e reinstalar um APK a cada versão, ou montar um mecanismo
  de atualização à parte.
- Conclusão: o PWA é o único caminho que cumpre "instalo uma vez e as atualizações chegam sozinhas"
  nos dois aparelhos, sem custo.

**O que já existe**:
- manifest com nome, ícones e `display: standalone`;
- Service Worker com o app inteiro, as fotos e o conteúdo no aparelho;
- aviso "Guia disponível offline";
- áreas seguras (`viewport-fit=cover` e margens com `safe-area-inset`);
- testes offline a 360 e 402 px.

**O que falta**:
- hoje o app se atualiza e **recarrega sozinho** quando há versão nova;
- os dados do casal (marcas de feito, roteiros próprios, preferências) ficam num armazenamento que o
  sistema pode apagar sob pressão de espaço, e o app não pede armazenamento persistente;
- não há tela de abertura no iPhone;
- a cor do tema ainda é a antiga, de antes do visual de caderno de viagem;
- o app não está publicado em HTTPS: o repositório é privado e o GitHub Pages do plano grátis não
  publica repositório privado.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Instalar uma vez em cada celular e usar como app (Priority: P1)

O casal abre o endereço do app no Chrome (Galaxy S24 Ultra) e no Safari (iPhone 17) e o instala na
tela inicial. O app abre pelo ícone, em tela cheia, com nome, ícone e tela de abertura próprios,
sem barra do navegador. Nada fica sob a Dynamic Island nem sob a barra de navegação do Android.

**Why this priority**: Sem isso não há app nos celulares.

**Independent Test**: Instalar nos dois aparelhos seguindo o passo a passo entregue. Abrir pelo
ícone e conferir:
- tela cheia;
- tela de abertura;
- cabeçalho abaixo da Dynamic Island;
- rodapé acima da barra do Android.

**Acceptance Scenarios**:

1. **Given** o Galaxy S24 Ultra com Chrome, **When** o casal abre o endereço e toca em "Instalar
   app", **Then** o ícone "Guia Viagem" aparece na tela inicial. Ao abrir pelo ícone, o app ocupa a
   tela toda, sem a barra do navegador, com a tela de abertura nas cores do app.
2. **Given** o iPhone 17 com Safari, **When** o casal toca em Compartilhar → "Adicionar à Tela de
   Início", **Then** o ícone "Guia Viagem" aparece. Ao abrir, o app ocupa a tela toda, com a tela
   de abertura do app e o conteúdo abaixo da Dynamic Island.
3. **Given** o app aberto no navegador do iPhone (não instalado), **When** o casal o usa, **Then**
   aparece uma dica discreta de como instalar ("Compartilhar → Adicionar à Tela de Início"), que
   pode ser fechada e não volta depois de fechada.
4. **Given** qualquer tela, **When** o casal rola até o fim, **Then** nenhum botão fica sob a barra
   de navegação do Android nem sob o indicador de início do iPhone.

---

### User Story 2 - Atualizações chegam sozinhas, com aviso e sem perder dados (Priority: P1)

Quando sai uma versão nova, os celulares a baixam em segundo plano na próxima abertura com internet.
O app mostra um aviso discreto ("Nova versão disponível — atualizar") e só troca de versão quando o
casal toca em "atualizar". As marcas de feito, os roteiros próprios e as preferências continuam lá.

**Why this priority**: É o motivo de não reinstalar. Recarregar no meio do uso ou perder marcas
seria pior do que não atualizar.

**Independent Test**: Publicar uma versão nova e abrir o app instalado com internet. Conferir:
- o aviso aparece e o app não recarrega sozinho;
- tocar em "atualizar" troca a versão;
- as marcas continuam;
- a versão nova aparece em "Exibição".

**Acceptance Scenarios**:

1. **Given** o app instalado e uma versão nova publicada, **When** o casal abre o app com internet,
   **Then** em até 1 minuto aparece o aviso "Nova versão disponível — atualizar", sem recarregar a
   tela.
2. **Given** o aviso, **When** o casal toca em "atualizar", **Then** o app passa para a versão nova
   e volta para a mesma tela. **When** fecha o aviso, **Then** ele some e a versão nova entra na
   próxima abertura.
3. **Given** marcas de feito, roteiros próprios e preferências salvos, **When** a versão nova
   entra, **Then** tudo continua igual.
4. **Given** a tela "Exibição", **When** o casal a abre, **Then** vê a versão instalada (ex.:
   "Versão 2026-11-02 · 3fe96f6"), para conferir que os dois celulares estão iguais.

---

### User Story 3 - Offline primeiro, com dados guardados de forma persistente (Priority: P1)

Em modo avião, o app abre e mostra tudo: cidades, dias, bairros, atividades, fotos, documentos e as
marcas do casal. Os dados ficam em armazenamento persistente, pedido ao sistema, para o iPhone não
apagá-los. As funções que precisam de internet falham com uma mensagem simples.

**Why this priority**: A viagem acontece com internet instável. É o princípio número 1 do projeto.

**Independent Test**: Com o app instalado e aberto uma vez com internet, ligar o modo avião, fechar
e reabrir o app, navegar por 3 cidades e 5 dias e tentar uma função de internet.

**Acceptance Scenarios**:

1. **Given** o app instalado, aberto uma vez com internet e com o aviso "Guia disponível offline",
   **When** o casal liga o modo avião e reabre o app, **Then** todas as telas do roteiro abrem, com
   fotos.
2. **Given** a instalação, **When** o app abre pela primeira vez, **Then** pede armazenamento
   persistente ao sistema, onde houver suporte, sem caixa de diálogo própria. A tela "Exibição"
   mostra se o armazenamento está persistente.
3. **Given** a versão anterior com dados no armazenamento antigo, **When** a versão nova abre pela
   primeira vez, **Then** os dados são copiados para o armazenamento persistente sem perda.
4. **Given** o modo avião, **When** o casal toca numa função de internet (ver FR-012), **Then** vê
   uma mensagem simples ("Sem internet agora — tente de novo quando tiver conexão") e o resto do app
   continua funcionando.

### Edge Cases

- **iPhone sem instalar** (só no Safari): o iOS pode apagar os dados de sites não visitados por 7
  dias. Por isso a dica de instalação (US1, cenário 3) e o pedido de armazenamento persistente.
- **Versão nova enquanto offline**: nada acontece até haver internet. O app atual continua
  funcionando.
- **Dois celulares**: cada um guarda as próprias marcas, sem sincronizar (Q1 = A).
- **Armazenamento cheio**: a gravação falha com a mensagem de erro que o app já tem e nada se perde.
- **Snapshot de Nova York** e conteúdo do roteiro não mudam.

## Requirements *(mandatory)*

### Functional Requirements

**Como app (US1)**

- **FR-001**: O app MUST ser instalável no Chrome do Android e no Safari do iOS. Instalado, MUST
  abrir em tela cheia, sem a barra do navegador, com nome curto "Guia Viagem", ícone próprio e cor
  de tema do visual atual.
- **FR-002**: O app MUST ter tela de abertura própria nos dois sistemas, nas cores e com o ícone do
  app.
- **FR-003**: Nenhum conteúdo nem botão MUST ficar sob a Dynamic Island, o notch, a barra de status,
  a barra de navegação do Android ou o indicador de início do iPhone, em retrato.
- **FR-004**: No Safari do iPhone, fora do app instalado, MUST aparecer uma dica discreta e fechável
  de como instalar. Depois de fechada ou com o app instalado, ela não aparece.

**Atualização (US2)**

- **FR-005**: Uma versão nova MUST ser baixada em segundo plano e MUST NOT recarregar o app sozinha.
- **FR-006**: Com a versão nova pronta, o app MUST mostrar o aviso "Nova versão disponível —
  atualizar". Tocar em "atualizar" troca a versão e mantém a tela atual. Fechar o aviso adia a troca
  para a próxima abertura.
- **FR-007**: O app MUST procurar versão nova ao abrir e, com o app aberto, pelo menos a cada 60
  minutos com internet.
- **FR-008**: A tela "Exibição" MUST mostrar a versão instalada (data e identificador da
  publicação).
- **FR-009**: Marcas de feito, roteiros próprios, preferências e reservas marcadas MUST sobreviver a
  qualquer atualização.

**Offline e dados (US3)**

- **FR-010**: Todo o roteiro (cidades, dias, bairros, atividades, lugares, fotos, documentos) e os
  arquivos do app MUST ficar no aparelho e funcionar sem internet, depois da primeira abertura com
  internet.
- **FR-011**: Os dados do casal MUST ficar em armazenamento persistente do navegador (IndexedDB). O
  app MUST pedir armazenamento persistente onde houver suporte. Dados do armazenamento antigo MUST
  ser migrados uma vez, sem perda, e o antigo só é limpo depois de confirmada a cópia.
- **FR-012** (Q1 = A): A internet MUST ser usada só para:
  - buscar atualizações do app;
  - abrir links externos: rotas e mapas no Google Maps, "Ver fotos", site oficial;
  - carregar mapas interativos não guardados, que já têm cache dos que foram vistos.

  Nada mais vai à rede. Sem previsão do tempo e sem sincronização: cada celular guarda as próprias
  marcas.
- **FR-013**: Sem conexão, cada função de internet MUST mostrar uma mensagem simples ("Sem internet
  agora — tente de novo quando tiver conexão") ao ser tocada, em vez de abrir uma página de erro do
  navegador. O resto do app MUST continuar funcionando. A busca de atualização sem internet falha em
  silêncio e tenta de novo depois.

**Publicação**

- **FR-014**: O app MUST ficar publicado num endereço HTTPS estável, atualizado a cada nova versão
  na `main`, para os dois celulares instalarem e receberem atualizações. Onde publicar (Q2 = C): o
  repositório passa a ser público e o app vai para o GitHub Pages
  (`https://alissonschneiderr.github.io/app-agenda-for-vacation/`), publicado pelo CI a cada push na
  `main` depois que os testes passam.

**Entregáveis**

- **FR-015**: A entrega MUST incluir um guia curto (`README` e `specs/014-…/quickstart.md`) com:
  - instalar no Android (Chrome) e no iPhone (Safari);
  - publicar uma versão nova e confirmar que chegou nos dois celulares (aviso e versão em
    "Exibição");
  - testar o modo offline (modo avião).

### Key Entities

- **Versão do app**: data e identificador da publicação, mostrados em "Exibição" e usados no aviso.
- **Dados do casal**: marcas de feito, roteiros próprios, preferências e reservas marcadas, em
  armazenamento persistente.
- **Função de internet**: cada uso de rede permitido (FR-012), com a mensagem de falha offline.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Instalar o app em cada celular leva menos de 2 minutos seguindo o guia, e ele abre em
  tela cheia pelo ícone.
- **SC-002**: Depois de publicada uma versão nova, os dois celulares mostram o aviso na primeira
  abertura com internet, em até 1 minuto, sem reinstalar e sem recarregar sozinhos.
- **SC-003**: 100% das marcas e dos roteiros próprios continuam depois de 3 atualizações seguidas.
- **SC-004**: Em modo avião, 100% das telas do roteiro abrem com conteúdo e fotos, nos dois
  celulares.
- **SC-005**: Em modo avião, 100% das funções de internet mostram a mensagem simples e nenhuma tela
  quebra.
- **SC-006**: Nenhum botão fica sob as áreas do sistema a 360 × 780 e 402 × 874 (testes atuais) e
  nas medidas do iPhone 17 e do Galaxy S24 Ultra.

## Assumptions

- **Nomes**: o nome curto do app continua "Guia Viagem" e o nome completo continua "Guia da Viagem
  — NY, Orlando e Miami".
- **Tela de abertura**: usa o ícone atual e as cores do visual de caderno de viagem. Não é feito um
  desenho novo.
- **Retrato**: a orientação de referência é retrato. Paisagem continua funcionando, sem ajuste
  dedicado.
- **Aviso de atualização**: aparece na tela atual, discreto, sem bloquear o uso.
- **Testes reais**: a confirmação final nos dois aparelhos é do casal, seguindo o guia. Os testes
  automáticos simulam os dois tamanhos de tela e o modo offline.
