import { describe, expect, it } from 'vitest';
import { checkFidelity, logisticsLine, parseNycDoc, parseTime, plain, timedLine } from '../../scripts/doc-parser';
import type { Commitment } from '../../src/content/types';

const commitments: Commitment[] = [
  {
    id: 'knicks-nets',
    date: '2026-11-01',
    time: '19:30',
    arriveBy: '18:30',
    title: 'Knicks x Nets',
    place: { name: 'Madison Square Garden', address: '4 Penn Plaza' },
  },
];

const MAP = (q: string) => `https://www.google.com/maps/search/?api=1&query=${q}`;
const PH = (q: string) => `https://www.google.com/search?tbm=isch&q=${q}`;

const DOC = `# Roteiro Teste

Oct 22, 2026 · @Alisson

## 💡 Sugestões

Texto das sugestões.

## Dia 2 (domingo, 01/11): SoHo · Chinatown

Um dia de teste.

🗺️ **Mapa do dia:** [SoHo → Chinatown](https://www.google.com/maps/dir/SoHo/Chinatown)

**⚠️ Maratona:** os relógios voltam 1 hora.

**09h40 – saída:** metrô 6 até **Bleecker St** (\\~15 min).

### 📍 SoHo

[📷 ver fotos do SoHo](${PH('SoHo')})

SoHo quer dizer "South of Houston".

**Atrações (no roteiro):**

- **10h00 — chegada ao SoHo; tempo livre.** Se quiserem café, vejam a lista.
- **10h30 — 🏛️ Greene Street** 🎟️ *ingresso com horário — comprem antes*
  - [📷 fotos](${PH('Greene')}) · [Mapa](${MAP('Greene')})
  - O maior conjunto de prédios de ferro fundido.
- **11h15 às 12h30 — 🛍️ Compras no SoHo** (lista abaixo).
- **\\~12h30 — pausa livre** (tempo para comer).

**🛍️ Lojas do SoHo**

- **Kith (337 Lafayette St)** — marca autoral · streetwear premium · 💵💵💵. A flagship de Ronnie Fieg. [Mapa](${MAP('Kith')})
- *Feira:* só abre no fim de semana.

**☕🏆🍰 Onde comer e tomar café no SoHo**

*☕ Nenhuma cafeteria no estilo La Cabra neste bairro.*

- ☕ **La Cabra SoHo (284 Lafayette St)** — o café coado das 10h. Peçam um coado. 💵 · Fila no fim de semana. [Mapa](${MAP('LaCabra')})
- 🏆 **Chelsea Market (75 9th Ave)** — almoço. Los Tacos No. 1 (💵; fila rápida). [Mapa](${MAP('Chelsea')})
- 🍰 **Dominique Ansel Bakery** (189 Spring St) — doce. Peçam o Cronut. 💵💵 · O Cronut esgota. [Mapa](${MAP('Ansel')})

**🎬 Locações no caminho**

- **102 Prince St (esquina com Greene St)** — *Ghost* (1990): o loft de Sam e Molly. Foto: da esquina oposta.

🚶 **Deslocamento para Chinatown:** 10 minutos a pé.

### 📍 Chinatown

[📷 ver fotos de Chinatown](${PH('Chinatown')})

O bairro mais caótico de Manhattan.

**Atrações (no roteiro):**

- **13h40 — 🏛️ Mott Street**
  - [📷 fotos](${PH('Mott')}) · [Mapa](${MAP('Mott')})
  - A rua principal da velha Chinatown.

🚶 **Deslocamento para Williamsburg (14h40):** **NYC Ferry**, rota East River.

🎬 **Locação no caminho:** **quartel Hook & Ladder 8 (14 N Moore St, Tribeca)** — *Os Caça-Fantasmas* (1984): o quartel. Foto: da calçada oposta.

🏨 **\\~16h30 – volta ao hotel:** metrô E até Lexington Av/53 St.

### 🌙 Noite: Knicks x Nets no Madison Square Garden (19h30)

[📷 fotos](${PH('MSG')}) · [Mapa](${MAP('MSG')})

O clássico de Nova York.

- **Como chegar:** saiam do hotel às 18h.
- **Antecedência:** cheguem por volta das 18h30.

**🏆 Ícones perto do Madison Square Garden (opcional)**

- 🏆 **Keens Steakhouse (72 W 36th St)** — steakhouse sem reserva. 💵💵💵💵 · A 10 minutos a pé. [Mapa](${MAP('Keens')})

### 🌙 Noite: Village Halloween Parade

[📷 fotos](${PH('Parade')}) · [Mapa do trajeto](${MAP('Parade')})

A parada sai às **19h** na 6th Avenue.

## Dia 7 (sexta, 06/11): Dia livre

Manhã livre.

### 📍 Empire State

- **12h00 — 📸 Empire State Building** 🎟️ *ingresso com horário marcado — comprem antes*
  - [📷 fotos](${PH('ESB')}) · [Mapa](${MAP('ESB')})
  - O arranha-céu art déco de 1931.
- **13h30 às 17h30 — tarde livre.** As ideias estão no fim do dia.

🏨 **até \\~17h30 – volta ao hotel:** metrô 6 até a 51 St.

### 💡 Ideias para a tarde livre

- 🗽 **Estátua da Liberdade pelo ferry** — 25 minutos em cada sentido.

## ✈️ Partida (sábado, 07/11) — nota de logística

Saiam do hotel às **11h00** de táxi.

- **Check-out:** até 10h45.
- **Melhor forma de ir: táxi ou Uber.** O LaGuardia fica a 25–40 minutos.
- **Último café:** o Ess-a-Bagel fica a 2 minutos.

## 🧳 Dicas práticas

### 🎟️ O que comprar antes

| Data | Atração | Situação |
| --- | --- | --- |
| 01/11 | Greene Street, tour das 10h00 | Comprar antes |
| 06/11 | Empire State Building, 12h (86º andar) | Comprar antes (horário marcado) |

Já garantidos: Knicks x Nets.
`;

const overrides = [{ find: 'Greene Street, tour das 10h00', replace: 'Greene Street, tour das 10h30' }];
const parse = (md = DOC) =>
  parseNycDoc(md, { year: 2026, pointLinks: { 'Mott Street': 'ny-chinatown' }, commitments, checklistOverrides: overrides });

describe('leitor do doc por bairros (feature 005)', () => {
  it('horários: simples, sem minutos, aproximado, intervalo e "até"', () => {
    expect(parseTime('10h00')).toEqual({ label: '10h00', start: '10:00', end: undefined });
    expect(parseTime('19h')).toEqual({ label: '19h', start: '19:00', end: undefined });
    expect(parseTime('\\~22h30')).toEqual({ label: '~22h30', start: '22:30', end: undefined });
    expect(parseTime('11h15 às 12h30')).toEqual({ label: '11h15 às 12h30', start: '11:15', end: '12:30' });
    expect(parseTime('13h00–13h45')).toMatchObject({ start: '13:00', end: '13:45' });
    expect(parseTime('até \\~17h30')).toMatchObject({ label: 'até ~17h30', start: '17:30' });
  });

  it('linhas com horário e de logística', () => {
    expect(timedLine('**10h30 — 🏛️ Greene Street** resto')).toEqual({ label: '10h30', icon: '🏛️', title: 'Greene Street', rest: ' resto' });
    expect(timedLine('**Kith (337 Lafayette St)** — marca')).toBeNull();
    expect(logisticsLine('**09h40 – saída:** metrô 6')).toEqual({ label: '09h40', title: 'saída', how: 'metrô 6' });
    expect(logisticsLine('🚶 **Deslocamento para Nolita:** 5 minutos a pé.')).toBeNull();
    expect(logisticsLine('**⚠️ Maratona:** os relógios voltam.')).toBeNull();
  });

  it('texto sai da marcação sem ser reescrito', () => {
    expect(plain('**Café:** *Ghost* [Mapa](https://x.y) (\\~10 min)')).toBe('Café: Ghost Mapa (~10 min)');
  });

  it('sem erros e com a fidelidade D1–D5 conferida', () => {
    const { doc, errors } = parse();
    expect(errors).toEqual([]);
    expect(checkFidelity(DOC, doc, commitments)).toEqual([]);
    expect(doc.title).toBe('Roteiro Teste');
    expect(doc.byline).toBe('Oct 22, 2026 · @Alisson');
  });

  it('dia: resumo, mapa do dia, avisos e saída do hotel', () => {
    const { doc } = parse();
    const d = doc.days[0]!;
    expect(d).toMatchObject({ date: '2026-11-01', region: 'SoHo · Chinatown', goal: 'Um dia de teste.', mapUrl: 'https://www.google.com/maps/dir/SoHo/Chinatown' });
    expect(d.alerts).toEqual([{ id: 'al:2026-11-01:1', html: expect.stringContaining('Maratona') }]);
    expect(doc.dayNotes['2026-11-01']).toBeUndefined();
    expect(d.activities[0]).toMatchObject({ id: 'ny3-2026-11-01-01', type: 'transit', title: 'saída', timeLabel: '09h40', areaId: null });
  });

  it('áreas na ordem, com fotos, texto, avisos e deslocamento', () => {
    const areas = parse().doc.days[0]!.areas!;
    expect(areas.map((a) => [a.kind, a.name])).toEqual([
      ['bairro', 'SoHo'],
      ['bairro', 'Chinatown'],
      ['noite', 'Noite: Knicks x Nets no Madison Square Garden (19h30)'],
      ['noite', 'Noite: Village Halloween Parade'],
    ]);
    expect(areas[0]).toMatchObject({ photoUrls: [{ label: '📷 ver fotos do SoHo', url: PH('SoHo') }], intro: 'SoHo quer dizer "South of Houston".', transfer: '🚶 Deslocamento para Chinatown: 10 minutos a pé.' });
    expect(areas[0]!.notesHtml).toContain('Nenhuma cafeteria no estilo La Cabra');
    expect(areas[0]!.notesHtml).toContain('Feira:');
  });

  it('itens com horário: tipo, Feito/Pendente só nas atividades, ingresso e lugar próprio', () => {
    const acts = parse().doc.days[0]!.activities;
    const by = (t: string) => acts.find((a) => a.title.startsWith(t))!;
    expect(by('chegada ao SoHo')).toMatchObject({ type: 'free', how: 'Se quiserem café, vejam a lista.' });
    expect(by('Greene Street')).toMatchObject({ type: 'attraction', booking: { required: true, how: 'ingresso com horário — comprem antes' } });
    expect(by('Compras no SoHo')).toMatchObject({ type: 'shopping', timeLabel: '11h15 às 12h30', durationMin: 75 });
    expect(by('pausa livre')).toMatchObject({ type: 'free', timeLabel: '~12h30', inferredDuration: true });
    expect(by('Mott Street')).toMatchObject({ pointId: 'ny-chinatown', areaId: 'chinatown' });
    expect(by('Deslocamento para Williamsburg')).toMatchObject({ type: 'transit', timeLabel: '14h40', how: 'NYC Ferry, rota East River.' });
    expect(by('volta ao hotel')).toMatchObject({ type: 'transit', timeLabel: '~16h30' });
    const greene = parse().doc.days[0]!.places!.find((p) => p.id === 'attraction-greene-street')!;
    expect(greene).toMatchObject({ photoUrls: [{ label: '📷 fotos', url: PH('Greene') }], mapsUrls: [{ label: 'Mapa', url: MAP('Greene') }], access: 'ingresso com horário — comprem antes' });
    expect(greene.fields).toEqual([{ label: '', text: 'O maior conjunto de prédios de ferro fundido.' }]);
  });

  it('noites: compromisso pelo título; horário do texto em negrito quando o título não tem', () => {
    const acts = parse().doc.days[0]!.activities;
    expect(acts.find((a) => a.commitmentId === 'knicks-nets')).toMatchObject({ type: 'commitment', title: 'Knicks x Nets no Madison Square Garden', timeLabel: '19h30', priority: 'essential' });
    expect(acts.find((a) => a.title === 'Village Halloween Parade')).toMatchObject({ type: 'attraction', timeLabel: '19h' });
    const knicks = parse().doc.days[0]!.places!.find((p) => p.id === 'attraction-knicks-x-nets-no-madison-square-garden')!;
    expect(knicks.fields).toEqual([
      { label: '', text: 'O clássico de Nova York.' },
      { label: 'Como chegar', text: 'saiam do hotel às 18h.' },
      { label: 'Antecedência', text: 'cheguem por volta das 18h30.' },
    ]);
    expect(knicks.mapsUrls).toEqual([{ label: 'Mapa', url: MAP('MSG') }]);
  });

  it('lojas, comida (☕/🏆/🍰, preço e fila, texto sem padrão) e locações', () => {
    const places = parse().doc.days[0]!.places!;
    expect(places.find((p) => p.id === 'shop-kith')).toMatchObject({
      address: '337 Lafayette St',
      price: '💵💵💵',
      fields: [
        { label: 'Tipo', text: 'marca autoral' },
        { label: 'Estilo', text: 'streetwear premium' },
        { label: '', text: 'A flagship de Ronnie Fieg.' },
      ],
    });
    expect(places.find((p) => p.id === 'food-la-cabra-soho')).toMatchObject({ level: '☕', address: '284 Lafayette St', price: '💵', queue: 'Fila no fim de semana.' });
    expect(places.find((p) => p.id === 'food-chelsea-market')).toMatchObject({ level: '🏆', fields: [{ label: '', text: 'almoço. Los Tacos No. 1 (💵; fila rápida).' }] });
    expect(places.find((p) => p.id === 'food-dominique-ansel-bakery')).toMatchObject({ level: '🍰', address: '189 Spring St', price: '💵💵' });
    expect(places.find((p) => p.id === 'screen-102-prince-st')).toMatchObject({ works: 'Ghost (1990): o loft de Sam e Molly.', photoTip: 'da esquina oposta.' });
    expect(places.find((p) => p.id === 'screen-quartel-hook-ladder-8')).toMatchObject({ address: '14 N Moore St, Tribeca' });
    expect(places.find((p) => p.id === 'food-keens-steakhouse')!.level).toBe('🏆');
  });

  it('dia livre, ideias, partida, checklist com override e documento completo', () => {
    const { doc } = parse();
    const d7 = doc.days[1]!;
    expect(d7.activities.map((a) => [a.timeLabel, a.type])).toEqual([
      ['12h00', 'attraction'],
      ['13h30 às 17h30', 'free'],
      ['até ~17h30', 'transit'],
    ]);
    expect(d7.areas![1]).toMatchObject({ kind: 'ideias' });
    expect(d7.areas![1]!.notesHtml).toContain('Estátua da Liberdade');
    expect(doc.dayNotes['2026-11-07']).toContain('Saiam do hotel às <strong>11h00</strong>');
    expect(doc.departures['2026-11-07']).toEqual([
      { id: 'tr:2026-11-07:1', label: 'Check-out', text: 'até 10h45.', block: 'before' },
      { id: 'tr:2026-11-07:2', label: 'Melhor forma de ir: táxi ou Uber', text: 'O LaGuardia fica a 25–40 minutos.', block: 'trip' },
      { id: 'tr:2026-11-07:3', label: 'Último café', text: 'o Ess-a-Bagel fica a 2 minutos.', block: 'before' },
    ]);
    expect(doc.checklist).toEqual([
      { what: 'Greene Street, tour das 10h30', when: '01/11', note: 'Comprar antes', forDate: '2026-11-01', activityId: 'ny3-2026-11-01-03' },
      { what: 'Empire State Building, 12h (86º andar)', when: '06/11', note: 'Comprar antes (horário marcado)', forDate: '2026-11-06', activityId: 'ny3-2026-11-06-01' },
    ]);
    expect(doc.docHtml.map((h) => h.title)).toEqual([
      '💡 Sugestões',
      'Dia 2 (domingo, 01/11): SoHo · Chinatown',
      'Dia 7 (sexta, 06/11): Dia livre',
      '✈️ Partida (sábado, 07/11) — nota de logística',
      '🧳 Dicas práticas',
    ]);
  });

  it('override que não existe mais no doc é acusado', () => {
    const out = parseNycDoc(DOC, { year: 2026, pointLinks: {}, commitments, checklistOverrides: [{ find: 'Não existe', replace: 'x' }] });
    expect(out.errors.join('\n')).toMatch(/checklistOverrides "Não existe" não existe mais no doc/);
  });

  it('D1, D2, D4 e D5 acusam o que falta', () => {
    const { doc } = parse();
    doc.days[0]!.activities.pop();
    doc.days[0]!.areas![0]!.placeIds = doc.days[0]!.areas![0]!.placeIds.filter((id) => id !== 'shop-kith');
    doc.days[0]!.areas!.pop();
    const late = [{ ...commitments[0]!, arriveBy: '18:45' }];
    const out = checkFidelity(DOC, doc, late).join('\n');
    expect(out).toMatch(/o doc tem 10 linhas com horário e o app tem 9 \(D1\)/);
    expect(out).toMatch(/SoHo: o doc tem 5 lugares nas listas e o app tem 4 \(D2\)/);
    expect(out).toMatch(/4 seções "###" e 3 áreas \(D4\)/);
    expect(out).toMatch(/não cita a chegada às 18h45 \(D5\)/);
  });
});

// ---------- feature 007: formato do doc de Orlando ----------

const ORL = `# Roteiro Orlando – Teste

Oct 24, 2026 · @Alisson

## Dia 1 (sáb 07/11): Chegada

Dia de chegar e dormir cedo.

### ✈️ Chegada

- Retirar o carro no aeroporto (MCO) e seguir para o hotel.
- Compras básicas para a semana.

**🛍️ Mercados (lista):**

- Walmart Supercenter
- Publix

### 🌙 Noite: jantar leve

- Ou jantar perto do hotel e dormir cedo

## Dia 2 (dom 08/11): Magic Kingdom

O parque mais clássico da Disney.

🗺️ **Mapa do dia:** [Magic Kingdom](${MAP('MK')})

**06h50 – chegada ao estacionamento:** monotrilho ou barca (\\~20 a 30 min).

**🎟️ Reservar no dia:** Bluey's Wild World só tem fila virtual.

### 📍 Magic Kingdom

[📷 ver fotos](${PH('MK')})

O castelo da Cinderela.

**Atrações (no roteiro):**

- **8h10 — 🛶 Jungle Cruise** · fila \\~5 min (Adventureland). Passeio de barco. [📷 fotos](${PH('Jungle')})
- **10h00 — 🛗 Tower of Terror** · \\~5 min · Multi Pass. Elevador em queda livre. [📷 fotos](${PH('Tower')})
- **11h15 — 🍔 Almoço**
- **12h15 ou 13h15 — 🎄 Grinchmas** (show; também há sessões às 15h30). [📷 fotos](${PH('Grinch')})
- **14h00 — 🎠 Desfile Festival of Fantasy** (opcional, na rota do castelo). [📷 fotos](${PH('Parade')})
- **14h25 — 🏴‍☠️ Pirates of the Caribbean** · fila \\~10 min (Adventureland). Barco. [📷 fotos](${PH('Pirates')})
- **14h30–20h00 — 🎭 Shows e tempo livre:** Frozen e Indiana Jones. [📷 fotos](${PH('Shows')})
- **20h55 — ⚔️ Rise of the Resistance** · fila \\~25 min · fila normal (entre antes das 21h). Fuga. [📷 fotos](${PH('Rise')})

**⚠️ Fechado:** Tiana's Bayou Adventure (reforma).

**Sem Multi Pass:** Toy Story Mania 9h10 (20) → Rock 'n' Roller 9h50 (50).

**☕🏆🍰 Onde comer no Magic Kingdom (lista):**

- Casey's Corner (Main Street, cachorro-quente)
- Butterbeer em Hogsmeade

### 🚗 Deslocamento para Cocoa Beach (\\~20 min de carro)

### 📍 Cocoa Beach

Praia mais próxima de Orlando.

**🛍️ Compras (tarde, \\~14h às 18h):** lojas de marcas americanas.

### 🏨 \\~21h30 – volta ao hotel

Depois do Luminous.

### 🌙 Noite: descanso

- Jantar perto do hotel.

## 🎟️ O que reservar com antecedência

| Item | Quando reservar | Custo | Dia de uso |
| --- | --- | --- | --- |
| Multi Pass Hollywood Studios | 06/11, no app My Disney Experience | \\~US$ 29 por pessoa | 09/11 |
| Ingresso Kennedy Space Center | Antes da viagem, no site oficial | Confira no site | 13/11 |

## ✈️ Partida (qua 18/11) e dicas práticas

**Partida:** faça o check-out com folga e devolva o carro no aeroporto (MCO). Para voo internacional, chegue ao aeroporto 3h antes.

**Dicas práticas:**

- **Clima:** dias amenos.
`;

const orlOpts = {
  year: 2026,
  pointLinks: { 'Magic Kingdom': 'orl-magic-kingdom' },
  commitments: [],
  idPrefix: 'orl1',
  arrivalDay: '2026-11-07',
  stepsUseAreaPoint: true,
  departure: {
    date: '2026-11-18',
    before: [{ label: 'Check-out e carro', quote: 'faça o check-out com folga e devolva o carro no aeroporto (MCO)' }],
    trip: [{ label: 'De trem para Miami', source: 'casal, Q1 da feature 007' }],
  },
};

describe('leitor: formato do doc de Orlando (feature 007)', () => {
  const { doc, errors } = parseNycDoc(ORL, orlOpts);
  const day = doc.days[0]!;
  const act = (title: string) => day.activities.find((a) => a.title === title)!;
  const placeOf = (title: string) => day.places!.find((p) => p.id === act(title).placeIds?.[0]);

  it('sem erros; fidelidade D1–D6 conferida', () => {
    expect(errors).toEqual([]);
    expect(checkFidelity(ORL, doc, [])).toEqual([]);
  });

  it('cabeçalho sem vírgula; o Dia 1 vira chegada, não dia', () => {
    expect(doc.days.map((d) => d.date)).toEqual(['2026-11-08']);
    expect(day.region).toBe('Magic Kingdom');
    const arrival = doc.arrivals!['2026-11-07']!;
    expect(arrival.items).toEqual([
      { id: 'tr:2026-11-07:c1', label: 'Retirar o carro no aeroporto (MCO) e seguir para o hotel.', text: '', block: 'arrival' },
      { id: 'tr:2026-11-07:c2', label: 'Compras básicas para a semana.', text: '', block: 'arrival' },
    ]);
    expect(arrival.html).toContain('Publix');
    expect(arrival.html).toContain('jantar perto do hotel');
    expect(arrival.html).not.toContain('Retirar o carro');
  });

  it('horas de 1 dígito, "ou" e intervalo; ids com o prefixo', () => {
    expect(act('Jungle Cruise')).toMatchObject({ id: 'orl1-2026-11-08-02', start: '08:10', timeLabel: '8h10' });
    const grinch = act('Grinchmas');
    expect(grinch.start).toBe('12:15');
    expect(grinch.timeLabel).toBe('12h15 ou 13h15');
    expect(grinch.inferredDuration).toBe(true);
    expect(act('Shows e tempo livre')).toMatchObject({ type: 'free', start: '14:30', durationMin: 330 });
  });

  it('logística: chegada ao estacionamento, 🚗 vira deslocamento e 🏨 vira volta ao hotel', () => {
    expect(day.activities[0]).toMatchObject({ type: 'transit', title: 'chegada ao estacionamento', start: '06:50', areaId: null });
    expect(day.activities[0]!.how).toBe('monotrilho ou barca (~20 a 30 min).');
    const back = act('volta ao hotel');
    expect(back).toMatchObject({ type: 'transit', timeLabel: '~21h30', how: 'Depois do Luminous.' });
    expect(day.areas!.map((a) => a.name)).toEqual(['Magic Kingdom', 'Cocoa Beach', 'Noite: descanso']);
    expect(day.areas![0]!.transfer).toBe('🚗 Deslocamento para Cocoa Beach (~20 min de carro)');
    expect(day.returnToHotel).toBe('~21h30');
  });

  it('linha de atração: ícone, fila, área do parque, forma de entrar, texto e fotos', () => {
    expect(placeOf('Tower of Terror')).toMatchObject({
      kind: 'attraction',
      queue: '~5 min',
      access: 'Multi Pass',
      fields: [{ label: '', text: 'Elevador em queda livre.' }],
      photoUrls: [{ label: '📷 fotos', url: PH('Tower') }],
    });
    expect(placeOf('Jungle Cruise')).toMatchObject({ queue: 'fila ~5 min', land: 'Adventureland', fields: [{ label: '', text: 'Passeio de barco.' }] });
    expect(placeOf('Pirates of the Caribbean')!.land).toBe('Adventureland');
    // parêntese em minúscula não é área do parque
    expect(placeOf('Rise of the Resistance')).toMatchObject({ queue: 'fila ~25 min', access: 'fila normal (entre antes das 21h)' });
    expect(placeOf('Rise of the Resistance')!.land).toBeUndefined();
    expect(placeOf('Grinchmas')!.fields[0]!.text).toBe('(show; também há sessões às 15h30).');
  });

  it('almoço é intervalo sem lugar; "(opcional" marca opcional; passos herdam o ponto do parque', () => {
    expect(act('Almoço')).toMatchObject({ type: 'free' });
    expect(act('Almoço').placeIds).toBeUndefined();
    expect(act('Desfile Festival of Fantasy').optional).toBe(true);
    expect(act('Jungle Cruise').pointId).toBe('orl-magic-kingdom');
    expect(act('volta ao hotel').pointId).toBeUndefined();
  });

  it('compras com horário viram passo; ⚠️ e 🎟️ viram avisos do dia; rota alternativa é nota', () => {
    expect(act('Compras (tarde)')).toMatchObject({ type: 'shopping', timeLabel: '~14h às 18h', start: '14:00', durationMin: 240, how: 'lojas de marcas americanas.' });
    expect(day.alerts!.map((a) => a.html)).toEqual([expect.stringContaining('Reservar no dia'), expect.stringContaining('Tiana')]);
    expect(day.areas![0]!.notesHtml).toContain('Sem Multi Pass');
  });

  it('noite sem horário é região sem passo; comida e mercados em lista simples', () => {
    const night = day.areas![2]!;
    expect(night).toMatchObject({ kind: 'noite', activityIds: [] });
    expect(night.notesHtml).toContain('Jantar perto do hotel');
    const food = day.places!.filter((p) => p.kind === 'food');
    expect(food.map((p) => [p.name, p.fields])).toEqual([
      ["Casey's Corner", [{ label: '', text: 'Main Street, cachorro-quente' }]],
      ['Butterbeer em Hogsmeade', []],
    ]);
  });

  it('reservas: quando, custo, dia de uso e prazo', () => {
    expect(doc.checklist).toEqual([
      { what: 'Multi Pass Hollywood Studios', when: '06/11, no app My Disney Experience', note: '~US$ 29 por pessoa', forDate: '2026-11-09', deadline: '2026-11-06' },
      { what: 'Ingresso Kennedy Space Center', when: 'Antes da viagem, no site oficial', note: 'Confira no site', forDate: '2026-11-13' },
    ]);
  });

  it('partida declarada (Q1): trecho do doc + dado do casal; sem notas do dia; D6 acusa trecho que não existe', () => {
    expect(doc.departures['2026-11-18']).toEqual([
      { id: 'tr:2026-11-18:1', label: 'Check-out e carro', text: 'faça o check-out com folga e devolva o carro no aeroporto (MCO)', block: 'before' },
      { id: 'tr:2026-11-18:2', label: 'De trem para Miami', text: '', block: 'trip' },
    ]);
    expect(JSON.stringify(doc.departures)).not.toContain('voo internacional');
    expect(doc.dayNotes['2026-11-18']).toBeUndefined();
    const bad = parseNycDoc(ORL, { ...orlOpts, departure: { ...orlOpts.departure, before: [{ label: 'x', quote: 'devolva o carro em Miami' }] } });
    expect(bad.errors.join('\n')).toMatch(/"devolva o carro em Miami" não está na seção Partida do doc \(D6\)/);
  });

  it('D1 acusa item a menos no app', () => {
    const { doc: d } = parseNycDoc(ORL, orlOpts);
    d.days[0]!.activities.pop();
    expect(checkFidelity(ORL, d, []).join('\n')).toMatch(/\(D1\)/);
  });
});
