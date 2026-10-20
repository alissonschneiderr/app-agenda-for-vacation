# City Tourist Help App Constitution

## Core Principles

### I. Offline-First

O app é usado por turistas que frequentemente estão sem dados móveis, em roaming ou com sinal
fraco. Por isso:

- Toda feature MUST declarar na spec quais fluxos funcionam offline e como se comportam sem rede.
- Fluxos essenciais (consultar conteúdo já visitado ou salvo, roteiros salvos, informações de
  emergência) MUST funcionar sem conexão após o primeiro carregamento.
- Dados do usuário criados offline MUST ser persistidos localmente e sincronizados quando a
  conexão voltar, sem perda silenciosa.
- A interface MUST indicar claramente quando está offline e quando um dado pode estar
  desatualizado.
- Recursos que exigem rede (ex.: busca ao vivo) MUST falhar de forma explícita e amigável, nunca
  com tela em branco ou erro técnico.

Racional: um app de ajuda ao turista que falha sem internet falha justamente quando é mais
necessário.

### II. Testes Obrigatórios

- Toda user story MUST ter testes automatizados que cubram seus critérios de aceitação antes do
  merge.
- Lógica de domínio e de sincronização/cache offline MUST ter testes unitários.
- Cada fluxo offline declarado (Princípio I) MUST ter ao menos um teste que simule ausência de
  rede.
- Correções de bug MUST incluir um teste que reproduz o bug.
- A suíte de testes MUST passar no CI para que um merge seja permitido.
- TDD estrito não é exigido; a ordem entre teste e implementação fica a critério de quem
  desenvolve.

Racional: comportamento offline e de sincronização é difícil de verificar manualmente e regride
com facilidade.

### III. Simplicidade (YAGNI)

- Cada feature MUST ser implementada com a menor solução que atende à spec atual; não se
  constrói para requisitos hipotéticos.
- Toda nova dependência de runtime MUST ser justificada no `plan.md` (problema resolvido, por que
  a plataforma web nativa não basta, custo de tamanho de bundle).
- Novas camadas de abstração, serviços ou padrões arquiteturais MUST ser justificados na seção
  "Complexity Tracking" do plano; sem justificativa, a alternativa mais simples prevalece.
- Código morto e flags de feature sem uso MUST ser removidos.

Racional: menos código e menos dependências significam bundle menor (crítico para PWA offline),
menos superfície para bugs e manutenção mais barata.

## Restrições de Plataforma

- O produto é uma aplicação web entregue como PWA: instalável, com Web App Manifest e Service
  Worker.
- O app MUST funcionar nas versões atuais dos navegadores móveis principais (Safari iOS e Chrome
  Android) e de desktop.
- O layout MUST ser mobile-first e responsivo.
- Não há apps nativos nem publicação em lojas no escopo atual; qualquer mudança nisso exige
  emenda a esta constituição.

## Fluxo de Desenvolvimento

- Todo trabalho segue o fluxo Spec Kit: `specify` → (`clarify`) → `plan` → `tasks` →
  `implement`.
- Specs descrevem o quê e o porquê, sem decisões de stack; decisões técnicas pertencem ao
  `plan.md`.
- O "Constitution Check" do `plan.md` MUST ser preenchido e aprovado antes de gerar tasks;
  violações MUST ser justificadas em "Complexity Tracking" ou o plano MUST ser revisto.
- Cada feature é desenvolvida em sua própria branch e integrada via pull request com CI verde.

## Governance

- Esta constituição prevalece sobre quaisquer outras práticas ou convenções do projeto.
- Emendas são feitas via `/speckit-constitution`, registradas em commit próprio com o motivo da
  mudança.
- Versionamento semântico:
  - MAJOR: remoção ou redefinição incompatível de um princípio ou regra de governança.
  - MINOR: novo princípio ou seção, ou expansão material de orientação existente.
  - PATCH: esclarecimentos, redação e correções sem mudança semântica.
- Revisão de conformidade: todo pull request e todo `plan.md` MUST ser verificado contra os
  princípios; `/speckit-analyze` deve ser usado para checar consistência entre artefatos antes de
  `/speckit-implement`.

**Version**: 1.0.0 | **Ratified**: 2026-10-19 | **Last Amended**: 2026-10-19
