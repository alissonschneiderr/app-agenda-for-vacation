# Quickstart — feature 014: instalar, atualizar e testar offline

Endereço do app: **https://alissonschneiderr.github.io/app-agenda-for-vacation/**

## Instalar (uma vez em cada celular, com internet)

**Galaxy S24 Ultra (Chrome)**
1. Abra o endereço no Chrome.
2. Toque em "Instalar app" na faixa que aparece (ou menu ⋮ → "Instalar app").
3. Abra pelo ícone "Guia Viagem" e espere "Guia disponível offline".

**iPhone 17 (Safari)**
1. Abra o endereço no **Safari** (não funciona por outro navegador).
2. Toque em Compartilhar (quadrado com seta) → "Adicionar à Tela de Início" → "Adicionar".
3. Abra pelo ícone "Guia Viagem" e espere "Guia disponível offline".

Confira em ⚙ (Exibição) que aparece "Armazenamento: persistente ✓" e a versão.

## Publicar uma versão nova

```sh
git push            # na main; o CI testa e publica no GitHub Pages (~4 min)
gh run watch        # acompanha; "deploy" verde = publicado
```

## Confirmar que chegou nos dois celulares

1. Abra o app (com internet). Em até 1 minuto aparece "Nova versão disponível — atualizar".
2. Toque em "atualizar".
3. Em ⚙ (Exibição), a versão deve mostrar a data e o código do commit publicado (`git log -1
   --format=%h`), igual nos dois celulares.

## Testar offline

1. Com o app já aberto uma vez com internet ("Guia disponível offline"), ligue o **modo avião**.
2. Feche o app de vez (deslize para cima no seletor de apps) e abra pelo ícone.
3. Navegue por 3 cidades e 5 dias. Tudo abre com fotos.
4. Toque num link "Abrir no mapa": aparece "Sem internet agora…" e o app continua.
5. Desligue o modo avião.

## Validação automática

```sh
export PATH=/opt/homebrew/opt/node@24/bin:$PATH
npm run typecheck && npm test && npm run content:strict && npm run build && npm run budget && npm run e2e
```
