# Contrato de telas (feature 009)

Vale para todas as telas:
- uma coluna, de até 520 px, centralizada;
- sem barra de baixo;
- áreas seguras respeitadas;
- alvos ≥ 44 × 44 px;
- corpo ≥ 16 px;
- sem rolagem lateral a 360 px e 402 px.

## Cabeçalho fixo (todas as telas, menos o Início)

Ocupa uma linha só: voltar (48 × 48), rótulo pequeno + título (1 linha, com reticências) e, quando
houver, o anel de progresso. O cabeçalho fica preso no topo, acima das áreas seguras.

## Card clicável (padrão único)

- **Link**: um `<a>` (o título) com área esticada sobre o card inteiro.
- **Indicador**: uma seta › no canto, decorativa (sem texto "Ver mais").
- **Foco**: contorno no card inteiro.
- **Toque**: estado `:active` visível.
- **Controles internos**: ficam acima do link e não abrem o card. É o caso do círculo de marcar, da
  seta de expandir e dos itens marcáveis.

## Início — `#/`

- **Topo**: título do app numa linha e a contagem "3 destinos". Não tem cabeçalho de voltar.
- **Destinos**: 3 cards grandes e verticais, cada um com foto, país, noites, nome, datas, dias de
  roteiro e progresso. Tocar em qualquer ponto abre `#/cidade/<c>`.
- **Nada mais**: sem capa da viagem, Agora, Reservar hoje, Destaques, Consulta ou rodapé.

## Cidade — `#/cidade/:c`

- **Cabeçalho**: voltar para `#/` e o nome da cidade, com o anel.
- **Capa curta**: foto, país, nome, datas e noites. Não tem frase, linhas de chegada/saída, tags nem
  abas.
- **Dias**: um card clicável por dia, na ordem, incluindo os dias de viagem. Cada card abre
  `#/dia/<d>`.

## Dia — `#/dia/:d`

1. **Cabeçalho**: voltar para a cidade, "Dia n · título" e o anel. "Voltar para hoje" aparece fora de
   hoje, durante a viagem.
2. **Capa** como na 008, com as setas de dia anterior e seguinte e o resumo do dia.
3. **Menu de seções**: preso abaixo do cabeçalho. Chips com âncoras, só das seções com conteúdo, na
   ordem Paradas · Restaurantes e Cafés · Brechós e Lojas · Bairros · Transporte · Dicas. A seção
   visível fica com `aria-current`.
4. **Seções**, cada uma com `id` e um título:
   - `#paradas`: os cartões de parada da 008, com o círculo de marcar, Desfazer e a marca "agora";
     o card inteiro abre o detalhe;
   - `#comer`: um card de lugar por restaurante ou café;
   - `#lojas`: um card de lugar por brechó ou loja;
   - `#bairros`: um card por região, com foto, nome e contagens; abre `#/perto/<d>/<região>`;
   - `#transporte`: saída e deslocamentos com instrução, "Mapa do dia"; nos dias de viagem, os três
     blocos marcáveis;
   - `#dicas`: os avisos do dia ("Entendi" continua).
5. **Seções sem conteúdo** não existem, nem no menu nem na página.

## Atração — `#/dia/:d/:k`

A tela mostra, em ordem:
1. a foto, com o crédito;
2. o título;
3. o **descritivo completo**: os textos do lugar no roteiro e as orientações do evento, sempre
   visíveis, sem "Ler mais";
4. as **informações práticas**: horário, fila e acesso, endereço, ingresso, como chegar, "Abrir no
   mapa"/"Ver fotos" e motorista;
5. as **ações**: Feito, Pular e Desfazer;
6. a navegação para o passo anterior e o seguinte.

## Bairro e detalhe do lugar — `#/perto/:d/:a[/:p]`

Seguem como na 008. Os cards de opção passam ao padrão de card clicável.

## Exibição — `#/exibicao` (novo, só por endereço)

Cabeçalho e o interruptor "Alto contraste (modo sol)", que fica salvo.

## Redirecionamentos

| De | Para |
|---|---|
| `#/dicas`, `#/transporte`, `#/viagem`, `#/perto` | `#/` |
| `#/cidade/:c/:aba` | `#/cidade/:c` |
| `#/destino/…`, `#/full/nova-york/:d`, `#/dia` | como hoje |
