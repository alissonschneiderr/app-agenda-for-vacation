# Contract: Telas do roteiro FULL

Complementa [001 routes](../../001-tourist-guide-itineraries/contracts/routes.md).

| Rota | Tela | Conteúdo / ações | Requisitos |
|---|---|---|---|
| `#/full/nova-york` | Visão geral | Cartão por dia (data, região, objetivo, compromisso do dia, progresso feitas/total); atalho "Hoje"; compromissos fixos; link para o documento | FR-001, FR-002, FR-007 |
| `#/full/nova-york/:date` | Agenda do dia | Eventos da data; linha do tempo de atividades (horário, duração, título, prioridade, endereço, descrição, refeição/loja/série, fontes); deslocamentos entre elas; compromisso destacado com "chegar até" e "sair até"; próxima atividade destacada; botões Feita/Pulada/Desfazer; mapa do dia com numeração; retorno ao hotel; alternativas; navegação dia anterior/seguinte | FR-002–FR-024, FR-027, FR-027a |
| `#/full/nova-york/documento` | Documento completo | Capa (viagem, hotel, compromissos); os 7 dias completos; checklist; endereços por dia; orientações práticas; atrações não incluídas; botão "Imprimir / salvar PDF" | FR-024, FR-025, SC-010 |

Na tela **Roteiros** (001), os dias 31/10–06/11 mostram um cartão "Roteiro FULL" que leva à agenda
do dia, no lugar dos sugeridos simples. A tela inicial de Nova York ganha um atalho "Roteiro de hoje"
durante a viagem.

## Mensagens e rótulos

- Prioridade: "Essencial", "Importante", "Opcional".
- Compromisso: "Ingresso comprado · chegar até {arriveBy} · sair da atividade anterior até {hh:mm}".
- Informação: "Fonte: {domínio} · verificado em {dd/mm}" ou "Não confirmado: {nota}".
- Série: "{obra} · {Ambientação | Locação de filmagem} · {Dá para entrar | Só por fora}".
- Próxima: "Agora / a seguir".
- Impressão: o documento esconde barra de navegação, botões e banner offline; cada dia começa em
  página nova; links aparecem por extenso.
