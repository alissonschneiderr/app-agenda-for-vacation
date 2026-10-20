# Research: Roteiro FULL de Nova York

Fontes consultadas em 20/10/2026. Os fatos abaixo orientam o desenho; a verificação detalhada de
cada estabelecimento acontece na implementação (FR-021).

## R1. Fonte única para app e documento

- **Decision**: um arquivo `content/full/nova-york.json` com toda a estrutura (dias, atividades,
  refeições, lojas, locais de séries, alternativas, checklist, endereços, orientações, exclusões).
  O build o incorpora ao `content.json`. A agenda e o documento são duas visões do mesmo objeto.
- **Rationale**: cumpre FR-025a (nunca divergirem) sem gerar arquivos derivados; tudo pré-cacheado.
- **Alternatives considered**: documento Markdown separado + JSON para o app (duas fontes, divergem);
  gerar PDF no build (dependência pesada, não atualiza com correções no app).

## R2. Documento imprimível

- **Decision**: rota `#/full/nova-york/documento` que renderiza o roteiro inteiro, com botão
  "Imprimir / salvar PDF" (`window.print()`) e CSS `@media print` (sem barra de navegação, quebras
  de página por dia, links impressos por extenso).
- **Rationale**: zero dependências (Princípio III), funciona offline, imprime ou salva em PDF em
  todos os navegadores-alvo.
- **Alternatives considered**: jsPDF/pdfmake (centenas de KB, layout manual); PDF estático no build
  (precisa de navegador headless no CI).

## R3. Marcações feita/pulada

- **Decision**: `activityMarks: Record<activityId, { state: 'done' | 'skipped', at }>` no estado do
  usuário, `schemaVersion` 1 → 2 com migração (v1 recebe `activityMarks: {}`). IDs de atividade são
  estáveis no conteúdo (`ny-2026-11-02-07`), para a marcação sobreviver a correções.
- **Rationale**: reaproveita o store da 001 (escrita síncrona, quota, corrupção) e o contrato que
  já previa migrações.
- **Alternatives considered**: chave separada no `localStorage` (duas fontes de verdade); marcar por
  índice (quebra quando o conteúdo é corrigido).

## R4. Próxima atividade (FR-027a)

- **Decision**: no dia atual (fuso `America/New_York`), a próxima é a primeira atividade não
  marcada cujo fim ainda não passou; se todas passaram, a primeira não marcada. Fora do dia atual,
  nenhum destaque.
- **Rationale**: simples, previsível e testável com relógio falso.

## R5. Validação automática do roteiro

- **Decision**: regras em `scripts/full-itinerary-schema.ts`, rodadas em `content:strict` e nos
  testes: 7 dias; atividades em ordem sem sobreposição; deslocamento obrigatório quando o endereço
  muda; início ≥ 10h salvo 31/10 ou justificativa; primeira e última atividade no hotel; 4
  refeições por dia nas janelas (almoço inicia 12:00–14:00, lanche 15:30–16:30); compromissos fixos
  presentes com chegada ≥ 30 min antes; nenhum espetáculo extra em 04/11; lista de termos proibidos
  (ostra, oyster, frutos do mar, seafood, lobster, camarão, shrimp, steakhouse, B&H, Tiffany);
  Apple Store só com justificativa; locais de série com obra, tipo e acesso; desvio para refeição
  ou local de série ≤ 20 min; ≥ 2 alternativas por dia (chuva + cansaço/fechamento); todo item com
  reserva no checklist; toda informação de horário/preço com fonte+data ou "não confirmado".
- **Rationale**: transforma SC-001–SC-007 em verificação automática; erros aparecem no build, não
  na viagem.
- **Alternatives considered**: só revisão manual (não escala para ~100 atividades).

## R6. Datas e eventos da semana

| Fato | Situação | Impacto no roteiro |
|---|---|---|
| 31/10/2026 é **sábado** | calendário | Uma fonte diz "sexta"; vale o calendário. |
| Village Halloween Parade, 31/10, 19h, 6th Ave de Canal St até 15th St; tema 2026 "Body & Soul" | confirmado ([Time Out](https://www.timeout.com/newyork/news/the-worlds-biggest-halloween-parade-returns-to-nyc-next-month-and-the-titillating-2026-theme-has-just-been-revealed-091626), [Hoodline](https://hoodline.com/2026/09/village-halloween-parade-reveals-body-soul-theme-for-53rd-march/)) | Noite de 31/10 opcional na parada; evitar ônibus/táxi pela 6th Ave no Village à noite. |
| Maratona de NY, domingo 01/11, 50ª edição; interdições ~7h–17h; chegada no Central Park; mudança de percurso no Bronx | confirmado ([NY1](https://ny1.com/nyc/all-boroughs/news/2026/09/22/nyc-marathon-route-to-change-in-bronx-in-2026), [Radical Storage](https://radicalstorage.com/travel/nyc-marathon/)) | 01/11 longe da 1st Ave, 5th Ave e Central Park até a tarde; preferir Lower Manhattan/Brooklyn. |
| Fim do horário de verão: 01/11/2026, 2h → 1h | calendário | Horários a partir de 01/11 em EST. |
| Luna Park (Coney Island) abriu em 28/03/2026; data de fechamento não encontrada | **não confirmado** ([ABC7](https://abc7ny.com/post/coney-islands-luna-park-cyclone-rollercoaster-opens-2026-season/18797105/)) | Coney Island só como opcional; brinquedos tratados como provavelmente fechados. |
| Nathan's Famous original (Surf Ave) abre o ano todo; o do calçadão é sazonal | fonte secundária ([Amusing the Zillion](https://amusingthezillion.com/tag/year-round/)) | Se Coney entrar, usar a loja da Surf Ave. |
| 03/11/2026 é dia de eleição nos EUA | calendário | Sem impacto turístico relevante; anotar. |

## R7. Transporte

| Item | Valor | Fonte |
|---|---|---|
| Metrô/ônibus local | US$ 3,00 por viagem; teto semanal US$ 35 no mesmo cartão (OMNY), grátis após 12 viagens | [Moovit](https://moovit.com/blog/navigating-nyc-transit-fares-omny-and-saving-money-in-2026/) |
| Teto OMNY | Cartão físico, carteira do celular e relógio contam como meios diferentes; um cartão por pessoa | [Moovit](https://moovit.com/blog/navigating-nyc-transit-fares-omny-and-saving-money-in-2026/) |
| JFK → Manhattan de táxi | Tarifa fixa US$ 70 + sobretaxas (congestionamento, aeroporto; +US$ 5 em dias úteis 16h–20h) + pedágio + gorjeta ≈ US$ 90–120 | [Blade](https://www.blade.com/jfk-manhattan-taxi-alternatives), [Luxyride](https://luxyride.com/blog/how-much-is-the-fare-from-jfk-to-manhattan) |
| JFK → Manhattan AirTrain + metrô | ≈ US$ 11,75 por pessoa (AirTrain US$ 8,75 + metrô US$ 3,00), 60–75 min | [Your Mileage May Vary](https://yourmileagemayvary.com/2026/06/13/jfk-airport-manhattan-airtrain-subway/) |
| Pedágio de congestionamento (abaixo da 60th St) | em vigor em 2026 | [Blade](https://www.blade.com/cheapest-jfk-to-times-square) |

Decisão para 31/10: táxi oficial com tarifa fixa como recomendação (casal com malas, chegada cedo,
sábado), AirTrain + metrô como alternativa econômica. O hotel (E 51st St entre 2nd e 3rd Ave) fica
a ~5 min a pé da estação Lexington Av/53 St (E/M) e 51 St (6).

## R8. O que fica para a implementação

Verificar, para cada estabelecimento usado: horário de funcionamento no dia da semana planejado,
faixa de preço, necessidade de reserva e endereço atual (FR-021). Locais de séries: confirmar
endereço e se é ambientação ou locação de filmagem. Sem fonte → "não confirmado".
