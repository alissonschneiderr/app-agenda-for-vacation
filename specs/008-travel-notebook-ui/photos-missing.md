# Fotos nos cartões do caderno de viagem (feature 008, SC-003)

A feature 008 mede a cobertura por parada (miniatura do próprio lugar), separada das capas. A meta é
≥ 90% em cada cidade, conferida em `tests/content/notebook-photos.test.ts`.

| Cidade | Paradas com foto | Capas (cidade, dia, bairro) |
|---|---|---|
| Nova York | 63 de 69 (91,3%) | ≥ 90% |
| Orlando | ≥ 90% (ver specs/007-orlando-itinerary-doc/photos-missing.md) | ≥ 90% |

## Fotos novas (27/10/2026)

Busca no Wikimedia Commons, com conferência visual. As duas fotos vieram de busca por endereço, porque
os artigos da Wikipédia testados na feature 006 não tinham foto livre do lugar.

| Parada | Arquivo | Licença |
|---|---|---|
| Casa da Carrie (66 Perry St) | 66 Perry Street Carrie Bradshaw's House From Sex And The City (1149739647).jpg | CC BY 2.0 |
| Ruas de casas de tijolo (Columbia Heights, Willow, Cranberry, Pierrepont) | Danish Seamen Church 102 Willow jeh.jpg (prédio de tijolo na Willow Street) | CC0 |

## Ainda sem foto do próprio lugar (Nova York)

| Dia | Parada | Motivo |
|---|---|---|
| 02/11 | Fearless Girl | Nenhuma foto livre da estátua em NY (a do artigo é da cópia em Londres) |
| 02/11 | Prédio de Friends (90 Bedford St) | Sem foto livre identificável do prédio |
| 03/11 | Columbus Avenue, da rua 81 à 72 | Sem foto livre do trecho exato |
| 03/11 | Ruas residenciais das ruas 70 | Sem foto livre do trecho exato |
| 04/11 | Ruas de paralelepípedo (Water, Front, Plymouth, Jay) | Sem foto livre do trecho exato |
| 05/11 | Galerias de arte (Chelsea) | Sem foto livre das galerias |

Sem foto, o cartão mostra o ícone do tipo de parada, nunca a foto de outro lugar.
