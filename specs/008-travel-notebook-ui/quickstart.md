# Quickstart: validar a feature 008

## Pré-requisitos

```sh
export PATH=/opt/homebrew/opt/node@24/bin:$PATH
npm install
```

## 1. Automático

```sh
npm run typecheck && npm test        # inclui D7 (origem das dicas), SC-002 (termos do design), SC-003 (fotos)
npm run content:strict               # dicas por cidade no resumo do build
npm run build && npm run budget      # fontes no precache; conteúdo ≤ 40 MB; JS inicial < 100 KB
npm run e2e                          # telas novas, redirecionamentos, offline, acessibilidade nos 3 temas
```

## 2. Revisão visual lado a lado (SC-001)

Abra `npm run dev` num celular (ou DevTools a 390 × 844) e compare cada tela com
`design-reference/`.

| URL | Comparar com |
|---|---|
| `/?agora=2026-10-27T10:00#/` | `01-inicio.jpg`: capa da viagem, Destinos, Destaques |
| `/?agora=2026-11-01T13:30#/` | Início com o cartão "Agora" (Mott Street 13h40) inteiro na 1ª tela |
| `#/cidade/nova-york` | `02-cidade-roteiro.jpg`: capa da cidade, tags, abas, cartões de dia |
| `#/cidade/orlando/bairros` | `03-cidade-bairros.jpg`: cartões de bairro com foto |
| `/?agora=2026-11-09T12:30#/dia/2026-11-09` | `04-dia.jpg`: capa do dia, Sobre este dia, Paradas do dia com miniaturas |
| `#/dicas` | `05-dicas.jpg`: cartões por categoria, com a cidade de origem |
| `#/transporte` | `06-transporte.jpg`: Entre as cidades (07, 18 e 21/11) e Na cidade |

Em cada tela, confira também:
- **textos**: nenhum texto do design (Lisboa, Coimbra, fado…);
- **fotos**: foto em todas as capas e cartões de NY e Orlando, menos os listados como sem foto;
- **alto contraste**: modo sol, ligado em Início → Consulta;
- **tema escuro**: tema do sistema.

## 3. Offline

Abra o app uma vez com internet e desligue a rede no DevTools. Ao recarregar, as fontes Fraunces e
Inter, os ícones e as fotos continuam.

## 4. Endereços antigos

Estes endereços levam à tela equivalente: `#/viagem`, `#/dia`, `#/perto`,
`#/destino/nova-york/2026-11-02` e `#/full/nova-york/2026-11-03`.
