# Contrato de telas — feature 014

## Em qualquer tela

- **Aviso de atualização** (só com versão nova pronta):
  - barra discreta no rodapé, acima da área segura de baixo;
  - texto "Nova versão disponível", botão "atualizar" e botão "×" (nome "Fechar aviso");
  - `role="status"`;
  - não cobre o conteúdo de forma permanente (fica sobre o rodapé e pode ser fechado).
- **Sem internet ao tocar num link externo**: aviso curto "Sem internet agora — tente de novo quando
  tiver conexão" (`role="status"`, some em 4 s). O link não abre.
- **Dica de instalação** (só no Safari do iPhone, fora do app instalado, não dispensada): faixa
  "Instale: toque em Compartilhar e depois em Adicionar à Tela de Início", com "×".

## Início

- Cabeçalho com um botão de ícone (engrenagem), nome "Exibição e versão", que abre `#/exibicao`. O
  resto não muda: só as 3 cidades.

## Exibição (`#/exibicao`)

- Alto contraste (já existe).
- "Versão 2026-11-02 · 3fe96f6".
- "Armazenamento: persistente ✓" ou "Armazenamento: comum — instale o app na tela inicial para o
  sistema não apagar os dados".
- "Disponível offline ✓" (o estado que já existe).

## App instalado

- Android: tela de abertura com o ícone sobre o fundo papel (`#faf8f5`) e a barra de status na cor
  do tema.
- iPhone: tela de abertura gerada (ícone sobre papel), conteúdo a partir do fim da Dynamic Island e
  barra de status translúcida.
