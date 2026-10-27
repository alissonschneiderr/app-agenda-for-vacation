# Contrato de telas e rotas (feature 008)

O visual segue `design-reference/`, sem nenhum texto do design (FR-008). Rótulos de interface que
podem ser usados: Início, Dicas, Transporte, Destinos, Destaques, Roteiro, Bairros, Abrir dia, Ver
roteiro, Paradas do dia, Sobre este dia, Agora, Reservar hoje, Consulta, Entre as cidades, Na cidade.

## Barra de baixo

Tem os itens **Início** (`#/`), **Dicas** (`#/dicas`) e **Transporte** (`#/transporte`). O ícone é
em traço e o rótulo fica embaixo. O item ativo fica no acento, com um traço em cima. A barra some em
`#/motorista`.

## Início — `#/`

| Bloco | Conteúdo | Quando |
|---|---|---|
| Cabeçalho | ícone do app, "ROTEIRO PESSOAL · 3 DESTINOS", título da viagem, anel de progresso | sempre |
| Capa da viagem | foto, chips ("FALTAM n DIAS" antes; "DIA n DE 22" durante), "2 PESSOAS", período, "3 cidades", quadro com anel e barra | sempre; compacta durante a viagem |
| Agora | cartão do próximo passo (foto, horário, nome, região, como chegar, Feito/Pular/Desfazer, Motorista, "Abrir o dia ›"); nos dias de locomoção, o 1º item pendente dos blocos | durante a viagem; inteiro na 1ª tela |
| Reservar hoje | itens com `deadline` = hoje | quando houver |
| Destinos | um cartão de cidade por destino | sempre |
| Destaques | ingressos comprados e itens a reservar | sempre |
| Consulta | Documento de cada cidade, Guia de pontos, Créditos das fotos, Alto contraste | sempre |

## Cidade — `#/cidade/:cityId[/:aba]`

- **Cabeçalho**: voltar, rótulo da frase da cidade, nome e anel de progresso.
- **Capa**: foto, país, chip de datas, chip de noites, nome, frase, linhas de chegada e saída (ícone +
  texto dos dias de locomoção) e quadro de progresso.
- **Tags**: em caixa alta, no acento.
- **Abas em pílula**: Roteiro (padrão), Dicas, Transporte e Bairros. A aba fica no endereço.

| Aba | Conteúdo |
|---|---|
| Roteiro | cartões de dia, na ordem, incluindo os de locomoção (com a rota) |
| Dicas | as dicas da cidade (cartões do design); sem dicas: "Sem informações no roteiro desta cidade." |
| Transporte | "Na cidade" (dicas de transporte e chegada) e os dias de locomoção da cidade |
| Bairros | cartões de bairro: as regiões `bairro` do roteiro, na ordem dos dias |

## Dia — `#/dia/:date`

1. **Cabeçalho**: voltar (para a cidade), "CIDADE · AAAA-MM-DD", "Dia n · título" e anel.
2. **Capa**: foto, cidade, chip da data, "DIA n", título, resumo, chips (tipo de dia, n paradas) e
   quadro de progresso.
3. **Sobre este dia**: caixa com o resumo; "Fique atento" (avisos do dia, recolhíveis, com
   "Entendi"); "Como circular hoje" (saída, deslocamentos e mapa do dia); e as regiões em chips, que
   levam ao bairro.
4. **Paradas do dia**: os cartões de parada, com a marca "agora" no dia de hoje. Intervalos e
   deslocamentos ficam como linhas discretas entre os cartões. Um cartão de parada tem:
   - miniatura de 72 px;
   - horário;
   - nome serifado (até 2 linhas);
   - chip de tipo;
   - duração ou intervalo;
   - fila, área e "Multi Pass", quando houver;
   - o círculo de marcar à direita;
   - a seta para expandir. Expandido, mostra o resumo e Detalhes, Motorista e "Ver onde comer perto".
5. **Dia de locomoção**: a capa mostra a rota, e os três blocos da 006 aparecem em caixas, com
   "Reservar hoje" quando houver.
6. **Navegação**: anterior/seguinte e deslizar continuam (006).

## Bairro — `#/perto/:date/:areaId[/:placeId]`

- **Capa**: foto da região, "BAIRRO", nome.
- **Corpo**: frase (`intro`), tags com contagem (Comer, Doces, Lojas, Locações) e filtros.
- **Opções**: cartões com miniatura quando houver foto; o detalhe abre como na 006.
- **Notas**: em caixa de dica recolhível.

## Dicas — `#/dicas` · Transporte — `#/transporte`

- **Capa**: degradê ou foto da 1ª cidade; o rótulo é o nome da aba.
- **Dicas**: seções por categoria (ícone + rótulo em caixa alta). Cada cartão tem o ícone da
  categoria, o chip da cidade, o título e o HTML do doc. Listas do doc aparecem com "✓".
- **Transporte**: seções "Entre as cidades" (um cartão por dia de locomoção, com tabela curta
  rota/data e os itens marcáveis) e "Na cidade" (um cartão por dica de transporte, com o chip da
  cidade).

## Telas mantidas, só restilizadas

Detalhe do passo, motorista (alto contraste da 006), guia (`#/guia`, `#/guia/:cityId`, `#/ponto/:id`),
documento, créditos, favoritos e roteiros do casal.

## Redirecionamentos

| De | Para |
|---|---|
| `#/viagem` | `#/` |
| `#/dia` | `#/dia/<hoje ou 1º dia>` |
| `#/perto` | `#/perto/<hoje>/<região atual>`; fora da viagem, `#/` |
| `#/cidade/:id`, a cidade antiga do guia | página da cidade do design |
| `#/destino/…`, `#/full/nova-york/:date` | como na 006 |

## Acessibilidade (inalterada da 006)

- contraste ≥ 7:1 em horário, nome, títulos e texto sobre foto;
- alvos ≥ 48 px (44 px nos chips);
- sem rolagem lateral a 390 px;
- letra base ≥ 17 px;
- `aria-label` nas seções (`Agora`, `Reservar hoje`, `Paradas do dia`, `Sobre este dia`, `Destinos`,
  `Dicas`, `Entre as cidades`, `Na cidade`).
