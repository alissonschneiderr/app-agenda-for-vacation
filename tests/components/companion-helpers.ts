// Conteúdo de teste da feature 006: o dia 01/11 e a partida de 07/11 lidos do formato real do doc.
import { assembleContent } from '../../scripts/build-content';
import { parseNycDoc } from '../../scripts/doc-parser';
import { indexContent } from '../../src/content/load';
import { resetPrefsCache } from '../../src/storage/prefs';
import { fixtureContent } from '../fixtures/content';
import { fixtureFullItinerary } from '../fixtures/full-itinerary';
import { setup } from './helpers';

const MAP = (q: string) => `https://www.google.com/maps/search/?api=1&query=${q}`;

export const COMPANION_DOC = `# Teste

Oct 22, 2026 · @Alisson

## Dia 2 (domingo, 01/11): SoHo · Chinatown

Um dia por bairros.

**⚠️ Maratona:** os relógios voltam 1 hora.

**Pôr do sol:** por volta das 16h50.

**09h40 – saída:** metrô 6 até Bleecker St (\\~15 min).

### 📍 SoHo

O bairro do ferro fundido.

**Atrações (no roteiro):**

- **10h00 — 🏛️ Greene Street** 🎟️ *ingresso com horário — comprem antes*
  - [📷 fotos](https://www.google.com/search?tbm=isch&q=Greene) · [Mapa](${MAP('Greene+Street+New+York')})
  - O maior conjunto de ferro fundido. Reparem nas colunas.
- **11h15 às 12h30 — 🛍️ Compras no SoHo** (lista abaixo).
- **\\~12h30 — pausa livre** (tempo para comer).

**🛍️ Lojas do SoHo**

- **Kith (337 Lafayette St)** — marca autoral · streetwear premium · 💵💵💵. A flagship. [Mapa](${MAP('Kith')})

**☕🏆🍰 Onde comer e tomar café no SoHo**

- ☕ **La Cabra SoHo (284 Lafayette St)** — coado. Peçam um coado. 💵 · Fila no fim de semana. [Mapa](${MAP('LaCabra')})
- 🏆 **Prince Street Pizza (27 Prince St)** — fatia. Peçam a Spicy Spring. 💵 · Fila longa. [Mapa](${MAP('Prince')})
- 🍰 **Dominique Ansel Bakery (189 Spring St)** — doce. Peçam o Cronut. 💵 · Esgota cedo. [Mapa](${MAP('Ansel')})

**🎬 Locações no caminho**

- **102 Prince St** — *Ghost* (1990): o loft. Foto: da esquina oposta.

🚶 **Deslocamento para Chinatown:** 10 minutos a pé, descendo a Mott Street.

### 📍 Chinatown

**Atrações (no roteiro):**

- **13h40 — 🏛️ Mott Street**
  - [Mapa](${MAP('Mott+Street+New+York')})
  - A rua principal.
- **13h55 — 🏛️ Doyers Street**
  - A curva.

**☕🏆🍰 Onde comer e tomar café em Chinatown**

*☕ Nenhuma cafeteria no estilo La Cabra neste bairro.*

- 🏆 **Nom Wah Tea Parlor (13 Doyers St)** — almoço. Dim sum de 1920. 💵💵 · Fila no domingo. [Mapa](${MAP('NomWah')})

🏨 **\\~16h30 – volta ao hotel:** metrô E até Lexington Av/53 St.

### 🌙 Noite: Knicks x Nets no Madison Square Garden (19h30)

[📷 fotos](https://www.google.com/search?tbm=isch&q=MSG) · [Mapa](${MAP('Madison+Square+Garden')})

O clássico de Nova York.

- **Como chegar:** saiam do hotel às 18h.
- **Antecedência:** cheguem por volta das 18h30.

## ✈️ Partida (sábado, 07/11) — nota de logística

Saiam do hotel às **11h00**.

- **Check-out:** até 10h45.
- **Melhor forma de ir: táxi ou Uber.** O LaGuardia fica a 25–40 minutos.
- **Último café:** o Ess-a-Bagel.
`;

/** Relógio fixo (ISO em UTC) + conteúdo com o dia 01/11 do doc e a partida de 07/11. */
export function setupCompanion(isoNow = '2026-11-01T18:30:00Z') {
  const ctx = setup(isoNow);
  localStorage.clear();
  resetPrefsCache();
  const c = fixtureContent();
  const full = fixtureFullItinerary();
  const commitments = [{ ...full.commitments[0]!, date: '2026-11-01', arriveBy: '18:30', title: 'Knicks x Nets' }];
  const { doc } = parseNycDoc(COMPANION_DOC, { year: 2026, pointLinks: { 'Greene Street': 'ny-met' }, commitments });
  full.commitments = commitments;
  full.days = full.days.map((d) => doc.days.find((x) => x.date === d.date) ?? d);
  full.departures = doc.departures;
  full.dayNotes = doc.dayNotes;
  c.fullItineraries = [full];
  return { ...ctx, content: indexContent(c) };
}

let realContent: ReturnType<typeof assembleContent> | undefined;

/**
 * Relógio fixo + o conteúdo real do app (feature 007: roteiro de Orlando lido do doc). O conteúdo é
 * montado uma vez por arquivo de teste e cada teste recebe uma cópia (isolamento sem refazer o build).
 */
export function setupReal(isoNow: string) {
  const ctx = setup(isoNow);
  localStorage.clear();
  resetPrefsCache();
  realContent ??= assembleContent();
  return { ...ctx, content: indexContent(structuredClone(realContent)) };
}
