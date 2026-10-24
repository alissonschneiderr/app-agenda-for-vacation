# Contract: Telas e rotas da PWA

Rotas por hash (`#/…`), para funcionar em hospedagem estática e offline sem configuração de servidor.
Navegação principal em barra inferior: **Guia · Favoritos · Roteiros**. A barra de status offline
(FR-015) aparece em todas as telas quando `navigator.onLine === false`.

| Rota | Tela | Conteúdo / ações | Requisitos |
|---|---|---|---|
| `#/` | Guia | Seletor de cidade (padrão = cidade do dia, com indicação "Hoje: dia de locomoção NY → Orlando" quando aplicável); alternância Lista/Mapa; filtro de categoria; busca | FR-001, FR-002, FR-006, FR-019 |
| `#/cidade/:cityId` | Guia de uma cidade | Igual a `#/`, cidade fixada pelo usuário | FR-001 |
| `#/ponto/:pointId` | Detalhe do ponto | Fotos com crédito; status aberto/fechado; endereço; horário; preço; site oficial; data de verificação + aviso para confirmar; Favoritar; Adicionar ao roteiro; Como chegar | FR-003–FR-005, FR-008, FR-010, FR-022 |
| `#/favoritos` | Favoritos | Lista de favoritos (indisponíveis com selo), remover | FR-008, FR-013 |
| `#/roteiros` | Roteiros | Agrupados por dia (dias com cidade ou "locomoção X → Y"), "Sem dia" por último; criar roteiro | FR-009, FR-020, FR-021, FR-023 |
| `#/roteiros/:id` | Roteiro | Lista ordenada numerada + mapa com a sequência; subir/descer/topo; remover ponto; renomear; mudar dia; excluir (com confirmação) | FR-009–FR-011, FR-020 |
| `#/creditos` | Créditos | Todas as fotos com autor, licença e link; atribuição OpenStreetMap | FR-003a |

## Mensagens obrigatórias (texto em português)

- Primeira abertura sem internet e sem cache: "Conecte-se à internet uma vez para baixar o guia."
- Busca/filtro sem resultado: "Nenhum ponto encontrado." + botão "Limpar filtros".
- Ponto já no roteiro: "Este ponto já está neste roteiro."
- Ponto de outra cidade: "Este ponto fica em {cidade}, e este roteiro é de {cidade do dia}. Adicionar mesmo assim?"
- Como chegar offline: "A navegação precisa de internet. Endereço: {endereço}."
- Conteúdo possivelmente desatualizado (offline): "Você está offline. Informações verificadas em {data}."

> **Atualização (feature 003)**: `#/` passou a ser a tela **Viagem**; o guia está em `#/guia` (e `#/cidade/:cityId`). Ver `specs/003-travel-guide-redesign/contracts/routes.md`.
