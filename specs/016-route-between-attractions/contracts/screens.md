# Contrato de telas: Rota entre dois lugares do roteiro

## Botão "Rota até…"

| Onde | Ao lado de | Leva a |
|---|---|---|
| Página da atração (`#/dia/<data>/<passo>`) | "Abrir no mapa" / "Como chegar", antes de "Motorista" | `#/rota/<data>/<passo>` |
| Detalhe do lugar (`#/perto/<data>/<área>/<id>`) | "Abrir no mapa" | `#/rota/<data>/<id>` |
| Card de restaurante, loja ou curiosidade do dia | link "Abrir no mapa" | `#/rota/<data>/<id>` |

Ícone de rota + "Rota até…". Alvo de toque ≥ 44 px. Ausente sem local ou sem outro lugar na cidade.

## Tela `#/rota/<data>/<chave>[?outros=1][&inv=1]`

```text
[<]  ROTA · NOVA YORK
     A partir de Mott Street            ← com ?inv=1: "Até Mott Street"
[⇅ Inverter] [📅 Ver outros dias]        ← no topo: a lista do dia pode ser longa
DOMINGO, 01/11
  PARADAS
    10h30  Distrito Histórico de Ferro Fundido      →
    12h00  Nom Wah Tea Parlor                         →
  RESTAURANTES E CAFÉS
    La Cabra SoHo                                     →
  BRECHÓS E LOJAS
    …
  CURIOSIDADES
    …
                                          ← com ?outros=1, "Ver outros dias" some e aparecem:
SÁBADO, 31/10
  PARADAS …
SEGUNDA-FEIRA, 02/11
  …
```

- Cada opção é um link externo (`target="_blank"`) para `routeUrl(origem, opção)`; com `?inv=1`,
  `routeUrl(opção, origem)`.
- Nome acessível da tela: região "Rota a partir de <origem>" (ou "Rota até <origem>").
- Nome de cada opção: "<nome>, <horário>" (passos) ou "<nome>" (lugares).
- Dia sem outros lugares: "Nenhum outro lugar neste dia" e os outros dias já abertos.
- Origem desconhecida (chave inválida): "Lugar não encontrado" e link "Voltar ao dia".

## Sem internet

Cada opção é um botão; ao tocar: `role="alert"` com
"A rota precisa de internet. De: <endereço da origem>. Até: <endereço do destino>."
