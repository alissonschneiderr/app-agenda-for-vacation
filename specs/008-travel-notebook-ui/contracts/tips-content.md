# Contrato: dicas e transporte a partir dos docs (feature 008, R6)

## Origem

| Cidade | Seção do doc | Unidade de dica |
|---|---|---|
| Nova York | `## 🧳 Dicas práticas` | cada `###`, exceto "📚 Fontes consultadas". "🎟️ O que comprar antes" vira a dica de reservas, com a tabela |
| Orlando | `## ✈️ Partida (…) e dicas práticas` → lista após `**Dicas práticas:**` | cada item `**Rótulo:** texto` |
| Orlando | `## 🎟️ O que reservar com antecedência` | uma dica de reservas com a seção inteira (tabela, regra dos ingressos e checklist) |
| Miami | — | nenhuma |

A frase da partida de Orlando sobre voo internacional fica fora das dicas, porque não é dica prática
e a Q1 da 007 a deixa só no documento completo.

## Categoria por palavra-chave (no título, sem acento e sem caixa)

| Categoria | Palavras |
|---|---|
| `reservas` | "comprar antes", "reservar" |
| `transporte` | "metro", "onibus", "estacionamento", "carro" |
| `clima` | "clima" |
| `dinheiro` | "gorjeta", "imposto" |
| `apps` | "app" |
| `filas` | "fila" |
| `outros` | qualquer outro |

## Regra D7 (conferência)

Para cada dica, o texto sem marcação MUST estar contido no texto sem marcação da seção de origem. A
falha aparece como `roteiro.md: dica "<título>" sem origem na seção "<seção>" (D7)`.

## Esperado para as cópias atuais

| Cidade | Quantidade | Dicas |
|---|---|---|
| Nova York | 6 | O que comprar antes (reservas), Metrô e ônibus (transporte), Clima (clima), Gorjetas (dinheiro), Imposto sobre vendas (dinheiro), Outros (outros) |
| Orlando | 7 | O que reservar (reservas), Clima, Estacionamento (transporte), Gorjetas, Imposto sobre vendas, Apps no celular (apps), Filas anunciadas (filas) |
