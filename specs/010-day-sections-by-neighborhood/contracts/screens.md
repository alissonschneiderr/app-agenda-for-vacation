# Contrato de telas — feature 010

Só o que muda em relação a `specs/009-mobile-first-navigation/contracts/screens.md`.

## Dia (`#/dia/<data>[?secao=<id>]`)

Menu de seções, nesta ordem e só com as seções que têm conteúdo:

1. Paradas;
2. Restaurantes e Cafés;
3. Brechós e Lojas;
4. **Curiosidades** (nova);
5. Bairros;
6. Transporte;
7. Dicas.

As seções **Restaurantes e Cafés** (`#comer`), **Brechós e Lojas** (`#lojas`) e
**Curiosidades** (`#curiosidades`) têm a mesma estrutura:

```
section#<id>.day-section
  h2  (título da seção)
  section.hood-group  aria-labelledby → h3   (um por grupo, na ordem do roteiro)
    h3.hood-group-head   "SoHo"   ← sticky, só o nome, sem foto/frase/contagem
    div.card-stack
      article.click-card (DayPlaceCard)  × n
  section.hood-group  … "Outros" (só se existir, sempre por último)
```

- O `h3` fica preso abaixo do menu do dia (`top: head + menu + safe-top`), tem fundo opaco, altura
  ≥ 44 px e não cobre o primeiro card do grupo.
- Cards iguais aos da 009: um único link e o card inteiro clicável.

**Transporte** (`#transporte`):
- só os trechos relevantes (R3), com o ícone do modo;
- "Mapa do dia" depois dos trechos, só se a seção existir;
- nos dias de troca de cidade, os blocos da 009.

**Dicas** (`#dicas`): só as dicas que ficam (R4), abertas.

Com `?secao=<id>` válido, o dia rola até a seção ao abrir.

## Atração de compras (`#/dia/<data>/<passo>`)

Depois de "Informações práticas" e antes das ações:

```
section.step-shops  aria-label="Lojas e brechós em <grupo>"
  h2  "Lojas e brechós em SoHo"
  div.card-stack  → DayPlaceCard × n   (mesmos dados de #lojas)
  a.btn  "Ver todas as lojas do dia"  → #/dia/<data>?secao=lojas
```

A seção não aparece quando o grupo não tem lojas.
