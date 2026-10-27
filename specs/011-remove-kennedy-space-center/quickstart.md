# Quickstart — validar a feature 011

```sh
export PATH=/opt/homebrew/opt/node@24/bin:$PATH
npm run content && npm run typecheck && npm test && npm run content:strict && npm run build && npm run budget && npm run e2e
grep -n -i "kennedy\|ksc" content/full/orlando/roteiro.md   # esperado: nada
```

## Cenários (manual, com `npm run dev`)

1. `/?agora=2026-11-13T09:00#/dia/2026-11-13`. Esperado:
   - paradas "Manhã livre", "Cocoa Beach" e "Noite: Disney Springs";
   - nenhum "Kennedy" na página;
   - Transporte com 1 trecho de carro.
2. `#/cidade/orlando`: o card de 13/11 não cita o KSC.
3. `#/dia/2026-11-11`: sem "Alternativa ao outlet".
4. `#/full/orlando/documento`: reservas sem o KSC ("Três itens se compram antes") e checklist sem
   o ingresso.
5. `#/ponto/orl-kennedy-space-center`: o ponto do guia continua.
6. Repetir 1 a 360 px e 402 px, offline: sem rolagem lateral.
