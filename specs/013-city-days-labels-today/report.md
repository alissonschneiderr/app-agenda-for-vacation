# Relatório da feature 013 — bairros de verdade, data no rótulo do dia e cidade no dia de hoje

Decisões:
- **Q1 = A**: só bairros de verdade.
- **Q2 = A**: os cabeçalhos de grupo de Restaurantes, Lojas e Curiosidades não mudam.

Nada além do descrito mudou: conteúdo, ordem dos dias e outras telas.

## 1. Bairros

"Bairros" do dia (e o item do menu) mostra só bairros de verdade. A lista do que **não** é bairro é
explícita, no `meta.json` de cada cidade (`notNeighborhoods`). O build acusa um nome que não exista
no roteiro. Tempo livre ("Manhã livre"…) sai por uma regra geral.

| Cidade | Saíram de "Bairros" (continuam nas Paradas e nos lugares do dia) |
|---|---|
| Nova York | Museu de História Natural, Central Park, MET – Metropolitan Museum of Art, Ponte do Brooklyn, Brooklyn Bridge Park, MoMA, High Line |
| Orlando | Magic Kingdom, Hollywood Studios, EPCOT, Animal Kingdom, Epic Universe, Universal Studios Florida, Islands of Adventure, Orlando Vineland Premium Outlets, Orlando International Premium Outlets ou Mall at Millenia, Manhã livre (11, 13 e 16/11) |
| Miami | Sawgrass Mills, Lummus Park e a praia de South Beach |

Ficaram como bairro:
- Midtown, SoHo, Nolita, Chinatown, Little Italy, Lower East Side, East Village;
- Financial District, Greenwich Village, West Village;
- Upper West Side, Upper East Side;
- Brooklyn Heights, DUMBO, Williamsburg;
- Hudson Yards, Chelsea, Meatpacking District;
- Empire State e arredores (Midtown South);
- Cocoa Beach;
- South Beach (Art Deco District).

Também mudou:
- O item "Bairros" some do menu nos dias sem bairro: dias de parque em Orlando, 11/11, 16/11, 19/11
  e 20/11.
- Na linha do tempo, "Manhã livre" aparece sem o alfinete de lugar.
- Na página de um grupo que não é bairro (ex.: Magic Kingdom), o selo "Bairro" não aparece.
- Os cabeçalhos de grupo dos restaurantes, lojas e curiosidades continuam iguais. Exemplo: Casey's
  Corner sob "Magic Kingdom".

**Correção:** em 18/11 (Miami), o menu mostrava "Bairros" e a seção vinha vazia, porque a lista
pulava os dias de viagem (bug da 012). Agora a seção mostra South Beach (Art Deco District). Um teste
reproduz o bug.

## 2. Rótulo do dia

"Dia N" virou "DD/MM" nos três lugares:
- card do dia na cidade ("19/11");
- cabeçalho do dia ("01/11 · SoHo · Nolita…");
- capa do dia ("01/11").

O campo `dayNumber` do card saiu do modelo (ficou sem uso).

## 3. Subtítulo do dia

O dia da semana ficou por extenso, sem a data:
- no card ("Quinta-feira" no lugar de "quinta, 19/11");
- no chip da capa ("Domingo" no lugar de "dom, 01/11").

Os botões de dia anterior e próximo e os nomes para leitor de tela continuam com a data por extenso.

## 4. Cidade aberta no dia de hoje

"Hoje" é a data local do aparelho, sem horário. Com `?agora=` vale a data simulada.

| Situação | Ao abrir a cidade |
|---|---|
| hoje dentro do período | a tela já rola até o card de hoje, que fica como o primeiro abaixo do cabeçalho; os dias anteriores aparecem ao rolar para cima |
| hoje antes ou depois do período | começa no primeiro dia, no topo |
| dia de troca (07/11, 18/11) | as duas cidades abrem nesse card |

A rolagem acontece só ao abrir a cidade (rolar não salta de novo). A lista continua em ordem
crescente.

## Testes

- CI completo verde:
  - 366 testes unitários e de componentes (45 arquivos);
  - 73 e2e nos projetos `chromium`, `mobile-360` e `mobile-402`;
  - JS inicial com 37,0 KB gzip;
  - snapshot de NY intacto.
- Novos testes:
  - datas (DD/MM, dia da semana, hoje do aparelho, hoje na cidade);
  - bairros por cidade e contagem igual à lista em todos os dias;
  - `notNeighborhoods` conferido contra o roteiro;
  - "Bairros" de 03/11, 11/11 e 18/11;
  - selo "Bairro";
  - rótulos do card, do cabeçalho e da capa;
  - cidade aberta no dia de hoje (componente e e2e a 360 e 402 px: dentro, antes e no dia de troca).
- Ajustados (comentário "feature 013"):
  - testes que esperavam "Dia 2", "dom, 01/11" ou parques em "Bairros";
  - o e2e "Orlando → 08/11 → … → Casey's Corner", que agora vai pelos Restaurantes e Cafés, porque
    Magic Kingdom não é mais bairro.
- Capturas a 360 × 780 e 402 × 874 em [`screens/`](screens/): Nova York aberta em 02/11, cards de
  Miami, Dia 01/11, "Bairros" de 03/11 e o 11/11.

## Pendência

- T021: commitado na `main` com autorização do usuário.
