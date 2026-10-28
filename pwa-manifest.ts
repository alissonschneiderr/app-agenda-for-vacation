// Manifest do app instalado (features 001 e 014). Cores do visual de caderno de viagem (feature 008):
// papel (#faf8f5) na tela de abertura do Android e tijolo (#8a3214) na barra do sistema.
export function pwaManifest(base: string) {
  return {
    name: 'Guia da Viagem — NY, Orlando e Miami',
    short_name: 'Guia Viagem',
    description: 'Pontos turísticos e roteiros da viagem, funcionando offline.',
    lang: 'pt-BR',
    display: 'standalone' as const,
    start_url: base,
    scope: base,
    theme_color: '#8a3214',
    background_color: '#faf8f5',
    icons: [
      { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
