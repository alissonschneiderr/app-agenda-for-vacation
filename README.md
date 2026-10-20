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

## Editar o conteúdo

- Pontos: `content/points/<cidade>.json`. Cada foto tem um `ref` (`wiki:<artigo da Wikipédia em
  inglês>` ou `File:<arquivo da Wikimedia Commons>`) e um `alt` em português.
- Roteiros sugeridos: `content/itineraries.json` (um por dia de passeio).
- Depois de mudar fotos: `npm run photos` baixa as novas, converte para WebP e atualiza
  `content/photo-credits.json` com autor e licença.
- Sempre rode `npm run content:strict` antes de publicar. Formato completo em
  [`contracts/content-schema.md`](specs/001-tourist-guide-itineraries/contracts/content-schema.md).

Horários e preços têm a data de verificação no app; confirme nos sites oficiais antes da visita.

## Publicar e instalar

O workflow `.github/workflows/ci.yml` roda os testes e publica no GitHub Pages a cada push na
`main` (em *Settings → Pages*, escolha a fonte "GitHub Actions").

No celular: abra a URL publicada, instale (iPhone: Compartilhar → "Adicionar à Tela de Início";
Android: "Instalar app"), **abra pelo ícone** com internet e espere a mensagem "Guia disponível
offline". Depois disso tudo funciona em modo avião.
