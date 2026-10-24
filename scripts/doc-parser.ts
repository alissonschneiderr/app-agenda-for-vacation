// Lê o roteiro do casal (content/full/<cidade>/roteiro.md, exportação Markdown do doc) e o converte
// no formato que as telas usam (specs/005-nyc-itinerary-doc/contracts/document-format.md).
// O texto não é reescrito: só sai da marcação Markdown. O que não for reconhecido vira nota em HTML.
import { marked, type Token, type Tokens } from 'marked';
import type {
  Activity,
  ActivityType,
  ChecklistItem,
  Commitment,
  DateStr,
  DayAlert,
  DayArea,
  DeclaredDepartureItem,
  DepartureItem,
  DocPlace,
  FullDay,
} from '../src/content/types';

export interface ParseOptions {
  year: number;
  /** Nome do lugar no doc → id do ponto do guia (fotos). */
  pointLinks: Record<string, string>;
  commitments: Commitment[];
  /** Texto exato de uma célula do checklist → texto que vale no app (Q1). */
  checklistOverrides?: { find: string; replace: string }[];
  /** Prefixo dos ids das atividades (feature 007); padrão "ny3". */
  idPrefix?: string;
  /** Data cuja seção "Dia N" é a chegada num dia de locomoção (feature 007, R5). */
  arrivalDay?: DateStr;
  /** Partida declarada no meta.json (feature 007, Q1): trechos literais do doc ou dados do casal. */
  departure?: { date: DateStr; before: DeclaredDepartureItem[]; trip: DeclaredDepartureItem[] };
  /** Passos sem ponto próprio usam o ponto do guia da sua região (feature 007, R8). */
  stepsUseAreaPoint?: boolean;
}

export interface ParsedDoc {
  title: string;
  byline: string;
  days: FullDay[];
  docHtml: { id: string; title: string; html: string }[];
  dayNotes: Record<DateStr, string>;
  checklist: ChecklistItem[];
  departures: Record<DateStr, DepartureItem[]>;
  /** Só existe quando o doc tem chegada num dia de locomoção (feature 007). */
  arrivals?: Record<DateStr, { items: DepartureItem[]; html?: string }>;
}

type Link = { label: string; url: string };

const LINK_RE = /\[([^\]]+)\]\((<[^>]+>|[^)\s]+)\)/g;
/** Um horário do doc: "10h00", "19h", "\~22h30", "8h10" (Orlando, feature 007). */
const T = String.raw`\\?~?\d{1,2}h(?:\d{2})?`;
/** Rótulo de horário no início de um negrito: "até ~17h30", "11h15 às 12h30", "13h00–13h45", "12h15 ou 13h15". */
const TIME_LABEL = new RegExp(String.raw`^((?:até\s+)?${T}(?:\s*(?:às|–|ou)\s*${T})?)`);
const FREE_RE = /pausa livre|tempo livre|tarde livre|^almoço/i;
/** Primeiro emoji de um título, com variação e sequências ZWJ (🏴‍☠️, 👨‍🚀). */
const EMOJI = /^\p{Extended_Pictographic}\uFE0F?(?:\u200D\p{Extended_Pictographic}\uFE0F?)*\s*/u;
const TRANSIT_RE = /^(saída|volta|caminho para o metrô|chegada ao|pouso|pod 51|ida\b)/i;
const ICONS = ['🏛️', '🌳', '📸', '🛍️', '🎬'];
const LOGISTICS_START = /^(🏨|🚶|🛥️|🚕|\*\*🛥️|\*\*🚕)/u;

/** Markdown inline → texto: tira links (fica o rótulo), negrito, itálico e escapes. */
export function plain(md: string): string {
  return md
    .replace(LINK_RE, '$1')
    .replace(/\*\*/g, '')
    .replace(/(^|[\s(])\*([^*\s][^*]*?)\*(?=[\s).,;:]|$)/g, '$1$2')
    .replace(/\\(.)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Forma comparável: sem acento, sem caixa, só letras e números, com espaços nas bordas. */
export function norm(s: string): string {
  const folded = s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
  return ` ${folded} `;
}

function slug(s: string): string {
  return norm(s).trim().replace(/ /g, '-') || 'x';
}

function links(md: string): Link[] {
  return [...md.matchAll(LINK_RE)].map((m) => ({ label: plain(m[1]!), url: m[2]!.replace(/^<|>$/g, '') }));
}
const isPhotos = (l: Link) => l.url.includes('tbm=isch') || l.label.includes('📷');
const isMap = (l: Link) => l.url.includes('google.com/maps');

/** "10h00" → "10:00"; "19h" → "19:00"; "8h10" → "08:10". */
function hhmm(t: string): string {
  const m = /(\d{1,2})h(\d{2})?/.exec(t)!;
  return `${m[1]!.padStart(2, '0')}:${m[2] ?? '00'}`;
}

function minutes(t: string): number {
  const [h, m] = t.split(':').map(Number) as [number, number];
  return h * 60 + m;
}

/** "11h15 às 12h30" → início e fim; "\~22h30" → só início. O rótulo fica como no doc. */
export function parseTime(label: string): { label: string; start: string; end?: string } {
  const clean = label.replace(/\\~/g, '~').trim();
  const times = [...clean.matchAll(/\d{1,2}h(?:\d{2})?/g)].map((m) => hhmm(m[0]));
  // "12h15 ou 13h15": duas sessões, não um intervalo.
  return { label: clean, start: times[0]!, end: /\sou\s/.test(clean) ? undefined : times[1] };
}

/** HTML gerado a partir do conteúdo do próprio app: tabelas roláveis e links externos em nova aba. */
function toHtml(tokens: Token[]): string {
  if (!tokens.some((t) => t.type !== 'space')) return '';
  const list = Object.assign([...tokens], { links: {} }) as unknown as Parameters<typeof marked.parser>[0];
  return marked
    .parser(list)
    .replace(/<table>/g, '<div class="table-wrap"><table>')
    .replace(/<\/table>/g, '</table></div>')
    .replace(/<a href="(https?:[^"]+)"/g, '<a href="$1" target="_blank" rel="noopener"');
}

function splitBy(tokens: Token[], depth: number): { heading?: Tokens.Heading; body: Token[] }[] {
  const out: { heading?: Tokens.Heading; body: Token[] }[] = [{ body: [] }];
  for (const t of tokens) {
    if (t.type === 'heading' && (t as Tokens.Heading).depth === depth) out.push({ heading: t as Tokens.Heading, body: [] });
    else out[out.length - 1]!.body.push(t);
  }
  return out;
}

function listOf(items: Tokens.ListItem[]): Tokens.List {
  return { type: 'list', raw: items.map((i) => i.raw).join(''), ordered: false, start: '', loose: false, items };
}

/** "Nome (end.)" no negrito ou logo depois dele → nome e endereço. */
function nameAndAddress(boldName: string, rest: string): { name: string; address?: string; rest: string } {
  const inName = /^(.*?)\s*\(([^()]*(?:\([^()]*\))?[^()]*)\)$/.exec(boldName);
  if (inName) return { name: plain(inName[1]!), address: plain(inName[2]!), rest };
  const after = /^\s*\(([^()]*)\)/.exec(rest);
  if (after) return { name: plain(boldName), address: plain(after[1]!), rest: rest.slice(after[0].length) };
  return { name: plain(boldName), rest };
}

function afterDash(s: string): string {
  return s.replace(/^\s*[—–-]\s*/, '');
}

function withoutLinks(s: string): string {
  return s.replace(/\s*·?\s*\[[^\]]+\]\((?:<[^>]+>|[^)\s]+)\)/g, '').trim();
}

function isWholeBold(md: string): boolean {
  return /^\*\*[^*]+\*\*$/.test(md.trim());
}

function isItalic(md: string): boolean {
  return /^\*[^*][\s\S]*\*$/.test(md.trim());
}

// ---------- lugares das listas ----------

function basePlace(kind: DocPlace['kind'], name: string, used: Set<string>, md: string): DocPlace {
  let id = `${kind}-${slug(name)}`;
  for (let i = 2; used.has(id); i++) id = `${kind}-${slug(name)}-${i}`;
  used.add(id);
  const ls = links(md);
  return { id, kind, name, mapsUrls: ls.filter(isMap), photoUrls: ls.filter(isPhotos), fields: [] };
}

/** "☕ **Nome (end.)** — texto. 💵 · fila. [Mapa](url)" */
function foodPlace(md: string, used: Set<string>): DocPlace | null {
  const m = /^(☕|🏆|🍰)\s*\*\*(.+?)\*\*([\s\S]*)$/u.exec(md.trim());
  if (!m) return null;
  const { name, address, rest } = nameAndAddress(m[2]!, m[3]!);
  const body = withoutLinks(afterDash(rest));
  const priced = /^([\s\S]*?)\s(💵+)\s*·\s*([\s\S]*)$/u.exec(body);
  const place = basePlace('food', name, used, md);
  place.level = m[1];
  if (address) place.address = address;
  if (priced) {
    place.fields = [{ label: '', text: plain(priced[1]!) }];
    place.price = priced[2];
    place.queue = plain(priced[3]!);
  } else place.fields = [{ label: '', text: plain(body) }];
  return place;
}

/** "**Nome (end.)** — tipo · estilo · 💵💵. texto. [Mapa](url)" */
function shopPlace(md: string, used: Set<string>): DocPlace | null {
  const m = /^\*\*(.+?)\*\*([\s\S]*)$/.exec(md.trim());
  if (!m) return null;
  const { name, address, rest } = nameAndAddress(m[1]!, m[2]!);
  const body = withoutLinks(afterDash(rest));
  const place = basePlace('shop', name, used, md);
  if (address) place.address = address;
  const parts = /^(.*?)\s·\s(.*?)\s·\s(💵+)\.?\s*([\s\S]*)$/u.exec(body);
  if (parts) {
    place.fields = [
      { label: 'Tipo', text: plain(parts[1]!) },
      { label: 'Estilo', text: plain(parts[2]!) },
      ...(parts[4] ? [{ label: '', text: plain(parts[4]) }] : []),
    ];
    place.price = parts[3];
  } else place.fields = [{ label: '', text: plain(body) }];
  return place;
}

/** "**Lugar (end.)** — *Obra*: cena. Foto: dica" */
function screenPlace(md: string, used: Set<string>): DocPlace | null {
  const m = /^\*\*(.+?)\*\*([\s\S]*)$/.exec(md.trim());
  if (!m) return null;
  const { name, address, rest } = nameAndAddress(m[1]!, m[2]!);
  const body = withoutLinks(afterDash(rest));
  const [works, tip] = body.split(/\bFoto:\s*/);
  const place = basePlace('screen', name, used, md);
  if (address) place.address = address;
  place.works = plain(works ?? '');
  if (tip) place.photoTip = plain(tip);
  return place;
}

/** Item simples de "Onde comer" ou "Mercados" (Orlando, feature 007): "Nome (área)" ou só "Nome". */
function plainListPlace(kind: 'food' | 'shop', md: string, used: Set<string>): DocPlace | null {
  const text = plain(md);
  if (!text || md.includes('*')) return null;
  const m = /^(.*?)\s*\(([^()]*)\)$/.exec(text);
  const place = basePlace(kind, m ? m[1]! : text, used, md);
  if (m) place.fields = [{ label: '', text: m[2]! }];
  return place;
}

/**
 * Atração na mesma linha (Orlando, feature 007, research R3):
 * "· fila ~5 min (Adventureland). Texto." → fila, forma de entrar, área do parque e texto, sem reescrita.
 */
function inlineAttraction(title: string, rest: string, used: Set<string>): DocPlace {
  const place = basePlace('attraction', title, used, rest);
  let body = plain(withoutLinks(rest));
  if (body.startsWith('·')) {
    const cut = body.search(/\.(\s|$)/);
    let meta = (cut === -1 ? body : body.slice(0, cut)).replace(/^·\s*/, '');
    body = cut === -1 ? '' : body.slice(cut + 1).trim();
    const land = /\s*\(([A-ZÁÉÍÓÚ][^()]*)\)$/u.exec(meta);
    if (land) {
      place.land = land[1];
      meta = meta.slice(0, land.index);
    }
    const [queue, ...access] = meta.split(/\s·\s/);
    if (queue) place.queue = queue.trim();
    if (access.length) place.access = access.join(' · ').trim();
  }
  if (body) place.fields = [{ label: '', text: body }];
  return place;
}

// ---------- linhas com horário ----------

export interface TimedLine {
  label: string;
  icon?: string;
  title: string;
  rest: string;
}

/** "**10h00 — 🏛️ Nome** resto" → rótulo, ícone, título, resto. */
export function timedLine(md: string): TimedLine | null {
  const m = /^\*\*([\s\S]+?)\*\*([\s\S]*)$/.exec(md.trim());
  if (!m) return null;
  const bold = m[1]!.trim();
  const t = TIME_LABEL.exec(bold);
  if (!t) return null;
  let title = bold.slice(t[0].length).replace(/^\s*[—–-]\s*/, '');
  let icon = ICONS.find((i) => title.startsWith(i));
  if (icon) title = title.slice(icon.length);
  else {
    const e = EMOJI.exec(title);
    if (e) {
      icon = e[0].trim();
      title = title.slice(e[0].length);
    }
  }
  return { label: t[1]!, icon, title: plain(title).replace(/[.:]$/, ''), rest: m[2]! };
}

/** Linha de logística com horário: "**09h40 – saída:**", "🏨 **\~16h05 – volta…**", "🚶 **Deslocamento … (13h00–13h45)…**". */
export function logisticsLine(md: string): { label: string; title: string; how: string } | null {
  const text = md.trim();
  const m = /^(?:🏨|🚶|🛥️|🚕)?\s*\*\*([\s\S]+?)\*\*([\s\S]*)$/u.exec(text);
  if (!m) return null;
  const bold = m[1]!.replace(/^(🛥️|🚕|🚶)\s*/u, '').trim();
  const lead = TIME_LABEL.exec(bold);
  if (lead) {
    const title = plain(bold.slice(lead[0].length).replace(/^\s*[—–-]\s*/, '')).replace(/:$/, '');
    if (!/^(saída|volta|chegada ao)/i.test(title)) return null;
    return { label: lead[1]!, title, how: plain(m[2]!) };
  }
  if (!LOGISTICS_START.test(text)) return null;
  const inner = new RegExp(String.raw`\((${T}(?:\s*(?:às|–)\s*${T})?)\)`).exec(bold);
  if (!inner) return null;
  return { label: inner[1]!, title: plain(bold).replace(/:$/, ''), how: plain(m[2]!) };
}

function typeOf(line: TimedLine): ActivityType {
  if (FREE_RE.test(line.title)) return 'free';
  if (TRANSIT_RE.test(line.title)) return 'transit';
  if (line.icon === '🛍️') return 'shopping';
  if (line.icon === '🎬') return 'screen';
  return 'attraction';
}

interface Draft {
  areaId: string | null;
  type: ActivityType;
  title: string;
  label: string;
  how?: string;
  booking?: string;
  placeIds: string[];
  commitmentId?: string;
  optional?: boolean;
}

function commitmentOf(title: string, commitments: Commitment[]): Commitment | undefined {
  return commitments.find((c) => norm(title).includes(norm(c.title)));
}

function areaKind(heading: string): DayArea['kind'] {
  if (heading.startsWith('✈')) return 'chegada';
  if (heading.startsWith('🌙') || heading.startsWith('🌃')) return 'noite';
  if (heading.startsWith('💡')) return 'ideias';
  return 'bairro';
}

const firstLine = (it: Tokens.ListItem) => it.text.split('\n')[0]!;

/** "**🛍️ Compras (tarde, \~14h às 18h):** texto" (Orlando, feature 007): compras com horário. */
const SHOPPING_LINE = new RegExp(String.raw`^\*\*🛍️\s*Compras\s*\(([^)]*\d{1,2}h[^)]*)\):?\*\*:?\s*([\s\S]*)$`, 'u');

/** Horário de uma noite: do título "(19h30)" ou do 1º horário em negrito da seção; sem horário, undefined. */
function nightTime(heading: string, sectionRaw: string): string | undefined {
  const fromHeading = /\((\d{2}h(?:\d{2})?)/.exec(heading);
  const fromText = /\*\*[^*]*?(\d{2}h(?:\d{2})?)[^*]*\*\*/.exec(sectionRaw);
  return fromHeading?.[1] ?? fromText?.[1];
}

// ---------- dias ----------

function parseDay(date: DateStr, region: string, body: Token[], opts: ParseOptions, errors: string[]) {
  const places: DocPlace[] = [];
  const used = new Set<string>();
  const drafts: Draft[] = [];
  const areas: DayArea[] = [];
  const dayNotes: Token[] = [];
  /** Avisos "⚠️" dentro de uma região (Orlando, feature 007): também valem para o dia. */
  const areaAlerts: Token[] = [];
  let summary = '';
  let mapUrl: string | undefined;

  const parts = splitBy(body, 3);
  // Antes do primeiro "###": resumo, mapa do dia, saída do hotel; o resto vira nota do dia.
  for (const t of parts[0]!.body) {
    if (t.type === 'space') continue;
    const raw = t.type === 'paragraph' ? (t as Tokens.Paragraph).text : '';
    if (t.type === 'paragraph' && raw.startsWith('🗺️')) {
      mapUrl = links(raw)[0]?.url;
      continue;
    }
    const lg = t.type === 'paragraph' ? logisticsLine(raw) : null;
    if (lg) {
      drafts.push({ areaId: null, type: 'transit', title: lg.title, label: lg.label, how: lg.how, placeIds: [] });
      continue;
    }
    if (t.type === 'paragraph' && !summary && !raw.startsWith('*')) {
      summary = plain(raw);
      continue;
    }
    dayNotes.push(t);
  }

  for (const part of parts.slice(1)) {
    const heading = plain(part.heading!.text);
    // "### 🚗 Deslocamento …" (Orlando): deslocamento até a próxima região, não é região.
    if (heading.startsWith('🚗')) {
      const prev = areas.at(-1);
      if (prev) {
        prev.transfer = [prev.transfer, heading].filter(Boolean).join(' ');
        prev.transferInTimeline = true;
      }
      else errors.push(`roteiro.md ${date}: "${heading}" antes da primeira região`);
      continue;
    }
    // "### 🏨 ~18h – volta ao hotel" (Orlando): passo de logística da última região, não é região.
    if (heading.startsWith('🏨')) {
      const lg = logisticsLine(`🏨 **${heading.replace(/^🏨\s*/u, '')}**`);
      if (!lg) {
        errors.push(`roteiro.md ${date}: "${heading}" sem horário`);
        continue;
      }
      const how = part.body
        .filter((t) => t.type === 'paragraph')
        .map((t) => plain((t as Tokens.Paragraph).text))
        .join(' ');
      drafts.push({ areaId: areas.at(-1)?.id ?? null, type: 'transit', title: lg.title, label: lg.label, how: how || undefined, placeIds: [] });
      continue;
    }
    const kind = areaKind(heading);
    const name = heading.replace(/^\S+\s+/u, '');
    const area: DayArea = { id: slug(name), kind, name, photoUrls: [], activityIds: [], placeIds: [] };
    for (let i = 2; areas.some((a) => a.id === area.id); i++) area.id = `${slug(name)}-${i}`;
    areas.push(area);
    const notes: Token[] = [];
    const transfers: string[] = [];
    let list: 'activities' | 'shop' | 'food' | 'screen' | null = null;
    let nightPlace: DocPlace | undefined;
    const toks = part.body.filter((t) => t.type !== 'space');
    const hasTimedItems = toks.some((t) => t.type === 'list' && (t as Tokens.List).items.some((it) => timedLine(firstLine(it))));

    // Noite com evento vira atividade; o horário vem do título ou do 1º horário em negrito da seção.
    // Noite sem horário (Orlando: "descanso", "jantar perto do hotel") fica só como região com notas.
    const nightLabel = kind === 'noite' && !hasTimedItems ? nightTime(heading, part.body.map((t) => t.raw).join('')) : undefined;
    if (nightLabel) {
      const title = name.replace(/^Noite:\s*/, '').replace(/\s*\([^)]*\d{2}h[^)]*\)\s*$/, '');
      nightPlace = basePlace('attraction', title, used, '');
      const pid = opts.pointLinks[title];
      if (pid) nightPlace.pointId = pid;
      places.push(nightPlace);
      area.placeIds.push(nightPlace.id);
      const c = commitmentOf(title, opts.commitments);
      drafts.push({ areaId: area.id, type: c ? 'commitment' : 'attraction', title, label: nightLabel, placeIds: [nightPlace.id], commitmentId: c?.id });
    }

    for (const t of toks) {
      if (t.type === 'paragraph') {
        const raw = (t as Tokens.Paragraph).text;
        if (/^\[📷/u.test(raw)) {
          const ls = links(raw);
          if (nightPlace) {
            nightPlace.photoUrls = ls.filter(isPhotos);
            nightPlace.mapsUrls = ls.filter((l) => !isPhotos(l));
          } else area.photoUrls.push(...ls.filter(isPhotos));
          continue;
        }
        if (raw.startsWith('**⚠️')) {
          areaAlerts.push(t);
          continue;
        }
        const shopping = SHOPPING_LINE.exec(raw);
        if (shopping) {
          const label = new RegExp(String.raw`${T}(?:\s*(?:às|–)\s*${T})?`).exec(shopping[1]!)![0];
          const rest = plain(shopping[1]!.replace(label, '')).replace(/^[,\s]+|[,\s]+$/g, '');
          drafts.push({ areaId: area.id, type: 'shopping', title: rest ? `Compras (${rest})` : 'Compras', label, how: plain(shopping[2]!) || undefined, placeIds: [] });
          continue;
        }
        if (isWholeBold(raw)) {
          const label = plain(raw);
          list = /Atrações/.test(label)
            ? 'activities'
            : /Lojas|Mercados/.test(label)
              ? 'shop'
              : /Onde comer|Ícones/.test(label)
                ? 'food'
                : /Locações/.test(label)
                  ? 'screen'
                  : null;
          if (!list) notes.push(t);
          continue;
        }
        const screenLine = /^🎬\s*\*\*Locação no caminho:\*\*\s*([\s\S]*)$/u.exec(raw);
        if (screenLine) {
          const p = screenPlace(screenLine[1]!, used);
          if (p) {
            places.push(p);
            area.placeIds.push(p.id);
          }
          continue;
        }
        const lg = logisticsLine(raw);
        if (lg) {
          drafts.push({ areaId: area.id, type: 'transit', title: lg.title, label: lg.label, how: lg.how, placeIds: [] });
          continue;
        }
        if (LOGISTICS_START.test(raw)) {
          transfers.push(plain(raw));
          continue;
        }
        if (nightPlace && !raw.startsWith('*') && !nightPlace.fields.length) {
          nightPlace.fields.push({ label: '', text: plain(raw) });
          continue;
        }
        if (!nightPlace && !area.intro && !raw.startsWith('*') && !raw.startsWith('🌙') && !/^Nenhum/.test(raw)) {
          area.intro = plain(raw);
          continue;
        }
        notes.push(t);
        continue;
      }
      if (t.type === 'list') {
        const items = (t as Tokens.List).items;
        const timed = items.some((it) => timedLine(firstLine(it)));
        if (list === 'activities' || timed) {
          const extra: Tokens.ListItem[] = [];
          for (const it of items) {
            const [top, ...subLines] = it.text.split('\n');
            const line = timedLine(top!);
            if (!line) {
              extra.push(it);
              continue;
            }
            if (extra.length) notes.push(listOf(extra.splice(0)));
            const draft: Draft = { areaId: area.id, type: typeOf(line), title: line.title, label: line.label, placeIds: [] };
            const sub = subLines.join('\n');
            if (/\(opcional/.test(line.rest)) draft.optional = true;
            // Orlando (feature 007): fila, área e texto na mesma linha, com o link de fotos.
            if (!sub.trim() && links(line.rest).some(isPhotos)) {
              const p = inlineAttraction(line.title, line.rest, used);
              places.push(p);
              area.placeIds.push(p.id);
              draft.placeIds.push(p.id);
              drafts.push(draft);
              continue;
            }
            const ticket = /🎟️\s*\*([^*]+)\*/u.exec(line.rest);
            if (ticket) draft.booking = plain(ticket[1]!);
            else if (plain(line.rest)) draft.how = plain(line.rest);
            if (sub.trim()) {
              const p = basePlace('attraction', line.title, used, sub);
              p.fields = subLines
                .map((l) => l.replace(/^\s*-\s*/, ''))
                .filter((l) => l.trim() && !/^\[📷/u.test(l.trim()))
                .map((d) => ({ label: '', text: plain(d) }));
              if (draft.booking) p.access = draft.booking;
              places.push(p);
              area.placeIds.push(p.id);
              draft.placeIds.push(p.id);
            }
            drafts.push(draft);
          }
          if (extra.length) notes.push(listOf(extra));
          continue;
        }
        if (nightPlace && !list) {
          for (const it of items) {
            const f = /^\*\*(.+?):\*\*\s*([\s\S]*)$/.exec(it.text.trim());
            nightPlace.fields.push(f ? { label: plain(f[1]!), text: plain(f[2]!) } : { label: '', text: plain(it.text) });
          }
          continue;
        }
        if (list === 'shop' || list === 'food' || list === 'screen') {
          const extra: Tokens.ListItem[] = [];
          for (const it of items) {
            const p = isItalic(it.text)
              ? null
              : list === 'shop'
                ? (shopPlace(it.text, used) ?? plainListPlace('shop', it.text, used))
                : list === 'food'
                  ? (foodPlace(it.text, used) ?? plainListPlace('food', it.text, used))
                  : screenPlace(it.text, used);
            if (p) {
              places.push(p);
              area.placeIds.push(p.id);
            } else extra.push(it);
          }
          if (extra.length) notes.push(listOf(extra));
          continue;
        }
      }
      notes.push(t);
    }
    const html = toHtml(notes);
    if (html) area.notesHtml = html;
    if (transfers.length) area.transfer = transfers.join(' ');
  }

  for (const p of places) {
    const pid = opts.pointLinks[p.name];
    if (pid && !p.pointId) p.pointId = pid;
  }

  const activities = drafts.map((d, i): Activity => {
    const time = parseTime(d.label);
    const nextStart = drafts[i + 1] ? parseTime(drafts[i + 1]!.label).start : undefined;
    let durationMin: number;
    let inferred = false;
    if (time.end && minutes(time.end) > minutes(time.start)) durationMin = minutes(time.end) - minutes(time.start);
    else {
      inferred = true;
      const gap = nextStart ? minutes(nextStart) - minutes(time.start) : 0;
      durationMin = gap > 0 ? gap : 15;
    }
    const id = `${opts.idPrefix ?? 'ny3'}-${date}-${String(i + 1).padStart(2, '0')}`;
    const linked = d.placeIds.map((p) => places.find((x) => x.id === p)!);
    const a: Activity = {
      id,
      type: d.type,
      title: d.title,
      start: time.start,
      durationMin,
      description: '',
      priority: d.type === 'commitment' ? 'essential' : 'important',
      booking: d.booking ? { required: true, how: d.booking } : { required: false },
      facts: [],
      timeLabel: time.label,
      areaId: d.areaId,
    };
    if (inferred) a.inferredDuration = true;
    if (d.optional) a.optional = true;
    if (d.how) a.how = d.how;
    if (d.placeIds.length) a.placeIds = d.placeIds;
    const areaName = areas.find((x) => x.id === d.areaId)?.name;
    const areaPoint = opts.stepsUseAreaPoint && d.type !== 'transit' && d.type !== 'free' && areaName ? opts.pointLinks[areaName] : undefined;
    const pointId = linked.map((p) => p.pointId).find(Boolean) ?? areaPoint;
    if (pointId) a.pointId = pointId;
    const withAddress = linked.find((p) => p.address);
    if (withAddress) a.place = { name: withAddress.name, address: withAddress.address! };
    if (d.commitmentId) a.commitmentId = d.commitmentId;
    areas.find((x) => x.id === d.areaId)?.activityIds.push(id);
    return a;
  });

  const day: FullDay = {
    date,
    region,
    goal: summary,
    events: [],
    activities,
    returnToHotel: activities.filter((a) => /^volta/i.test(a.title)).at(-1)?.timeLabel ?? '',
    alternatives: [],
    places,
    areas,
  };
  if (mapUrl) day.mapUrl = mapUrl;
  // Avisos do dia (feature 006): um por bloco antes do primeiro bairro; a legenda de preço fica de fora.
  const alerts: DayAlert[] = [...dayNotes, ...areaAlerts]
    .filter((t) => t.type !== 'space' && !/^\*Legenda de preço/.test(t.raw.trim()))
    .map((t, i) => ({ id: `al:${date}:${i + 1}`, html: toHtml([t]) }));
  if (alerts.length) day.alerts = alerts;
  return { day };
}

function ddmm(d: string, m: string, year: number): DateStr {
  return `${year}-${m}-${d}`;
}

/** "Dia 1 (sábado, 31/10): …" (NY) e "Dia 2 (dom 08/11): …" (Orlando). */
const DAY_RE = /^Dia \d+ \((?:[^)]*?[\s,])?(\d{2})\/(\d{2})\):\s*(.+)$/;

/**
 * Chegada num dia de locomoção (feature 007, R5): os itens da lista de "### ✈️ Chegada" viram itens
 * marcáveis; o resto da seção (resumo, mercados, noite) fica em HTML.
 */
function parseArrival(date: DateStr, body: Token[]): { items: DepartureItem[]; html?: string } {
  const parts = splitBy(body, 3);
  let items: DepartureItem[] = [];
  const rest: Token[] = [...parts[0]!.body];
  for (const part of parts.slice(1)) {
    const heading = part.heading!;
    const list = plain(heading.text).startsWith('✈') && !items.length ? part.body.find((t) => t.type === 'list') : undefined;
    if (list) {
      items = (list as Tokens.List).items.map((it, i) => ({ id: `tr:${date}:c${i + 1}`, label: plain(it.text), text: '', block: 'arrival' as const }));
    }
    rest.push(heading, ...part.body.filter((t) => t !== list));
  }
  const html = toHtml(rest);
  return html ? { items, html } : { items };
}

export function parseNycDoc(markdown: string, opts: ParseOptions): { doc: ParsedDoc; errors: string[] } {
  const errors: string[] = [];
  const tokens = marked.lexer(markdown);
  const [front, ...sections] = splitBy(tokens, 2);
  const h1 = front!.body.find((t) => t.type === 'heading') as Tokens.Heading | undefined;
  const byline = front!.body.find((t) => t.type === 'paragraph') as Tokens.Paragraph | undefined;
  const doc: ParsedDoc = {
    title: h1 ? plain(h1.text) : '',
    byline: byline ? plain(byline.text) : '',
    days: [],
    docHtml: [],
    dayNotes: {},
    checklist: [],
    departures: {},
  };
  const overrides = opts.checklistOverrides ?? [];
  const usedOverrides = new Set<string>();

  for (const s of sections) {
    const title = plain(s.heading!.text);
    doc.docHtml.push({ id: slug(title), title, html: toHtml([s.heading!, ...s.body]) });
    const day = DAY_RE.exec(title);
    if (day) {
      const date = ddmm(day[1]!, day[2]!, opts.year);
      if (date === opts.arrivalDay) {
        doc.arrivals = { ...doc.arrivals, [date]: parseArrival(date, s.body) };
        continue;
      }
      const { day: d } = parseDay(date, day[3]!, s.body, opts, errors);
      doc.days.push(d);
      continue;
    }
    const departure = /Partida \((?:[^)]*?[\s,])?(\d{2})\/(\d{2})\)/.exec(title);
    if (departure) {
      const date = ddmm(departure[1]!, departure[2]!, opts.year);
      // Partida declarada (feature 007, Q1): só os trechos citados e os dados do casal; sem notas do dia.
      if (opts.departure?.date === date) {
        const sectionText = plain(s.body.map((t) => t.raw).join(' '));
        const declared = [
          ...opts.departure.before.map((d) => ({ d, block: 'before' as const })),
          ...opts.departure.trip.map((d) => ({ d, block: 'trip' as const })),
        ];
        doc.departures[date] = declared.map(({ d, block }, i) => {
          if (d.quote && !sectionText.includes(d.quote)) errors.push(`roteiro.md: "${d.quote}" não está na seção Partida do doc (D6)`);
          if (!d.quote && !d.source) errors.push(`meta.json: item de partida "${d.label}" sem quote nem source (D6)`);
          return { id: `tr:${date}:${i + 1}`, label: d.label, text: d.quote ?? '', block };
        });
        continue;
      }
      doc.dayNotes[date] = toHtml([s.heading!, ...s.body]);
      // Itens marcáveis do dia de transição (feature 006).
      const items = s.body.filter((t) => t.type === 'list').flatMap((t) => (t as Tokens.List).items);
      doc.departures[date] = items.flatMap((it, i) => {
        const m = /^\*\*(.+?)\*\*\s*([\s\S]*)$/.exec(it.text.trim());
        if (!m) return [];
        const label = plain(m[1]!).replace(/[:.]$/, '');
        return [{ id: `tr:${date}:${i + 1}`, label, text: plain(m[2]!), block: /check-out|último café/i.test(label) ? 'before' : 'trip' } as DepartureItem];
      });
      continue;
    }
    const table = s.body.find((t) => t.type === 'table' && plain((t as Tokens.Table).header[1]?.text ?? '') === 'Atração') as
      | Tokens.Table
      | undefined;
    // Tabela de reservas de Orlando (feature 007): Item | Quando reservar | Custo | Dia de uso.
    const reserve = s.body.find(
      (t) => t.type === 'table' && plain((t as Tokens.Table).header[0]?.text ?? '') === 'Item' && plain((t as Tokens.Table).header[1]?.text ?? '') === 'Quando reservar',
    ) as Tokens.Table | undefined;
    if (reserve) {
      for (const r of reserve.rows) {
        const when = plain(r[1]!.text);
        const item: ChecklistItem = { what: plain(r[0]!.text), when, note: plain(r[2]?.text ?? '') || undefined };
        const use = /(\d{2})\/(\d{2})/.exec(plain(r[3]?.text ?? ''));
        if (use) item.forDate = ddmm(use[1]!, use[2]!, opts.year);
        const by = /^(\d{2})\/(\d{2})/.exec(when);
        if (by) item.deadline = ddmm(by[1]!, by[2]!, opts.year);
        doc.checklist.push(item);
      }
    }
    if (table) {
      for (const r of table.rows) {
        let what = plain(r[1]!.text);
        const o = overrides.find((x) => x.find === what);
        if (o) {
          what = o.replace;
          usedOverrides.add(o.find);
        }
        const when = plain(r[0]!.text);
        const dm = /(\d{2})\/(\d{2})/.exec(when);
        const item: ChecklistItem = { what, when, note: plain(r[2]?.text ?? '') || undefined };
        if (dm) item.forDate = ddmm(dm[1]!, dm[2]!, opts.year);
        doc.checklist.push(item);
      }
    }
  }
  for (const o of overrides) {
    if (!usedOverrides.has(o.find)) errors.push(`roteiro.md: checklistOverrides "${o.find}" não existe mais no doc; revise a decisão`);
  }

  // Ingresso → atividade do dia: pelo nome; senão, pelo horário entre as que pedem ingresso.
  for (const c of doc.checklist) {
    const d = doc.days.find((x) => x.date === c.forDate);
    if (!d) continue;
    const name = norm(c.what.split(',')[0]!);
    const t = /(\d{2})h(\d{2})?/.exec(c.what);
    const a =
      d.activities.find((x) => norm(x.title).includes(name) || name.includes(norm(x.title))) ??
      (t ? d.activities.find((x) => x.booking.required && x.start === hhmm(t[0])) : undefined);
    if (a) c.activityId = a.id;
  }

  return { doc, errors };
}

/** Regras de fidelidade D1–D5 (contracts/document-format.md), contadas direto no texto do doc. */
export function checkFidelity(markdown: string, doc: ParsedDoc, commitments: Commitment[]): string[] {
  const errors: string[] = [];
  const urlRe = /https:\/\/www\.google\.com\/(?:maps|search)[^)\s>]+/g;
  const hrefs = (html: string | undefined) => [...(html ?? '').matchAll(/href="([^"]+)"/g)].map((x) => x[1]!.replace(/&amp;/g, '&'));
  for (const s of markdown.split(/^## /m).slice(1)) {
    const title = s.split('\n')[0]!.trim();
    if (!doc.docHtml.some((h) => h.title === plain(title))) errors.push(`roteiro.md: seção "${title}" não aparece no app (D4)`);
    const m = DAY_RE.exec(title);
    if (!m) continue;
    const arrival = Object.entries(doc.arrivals ?? {}).find(([d]) => d.endsWith(`-${m[2]}-${m[1]}`));
    if (arrival) {
      // Chegada (feature 007): cada item da lista de "### ✈️ Chegada" é um item marcável.
      const chegada = s.split(/^### /m).find((a) => a.startsWith('✈')) ?? '';
      const bullets = (/\n\n((?:- .*\n?)+)/.exec(chegada)?.[1] ?? '').split('\n').filter((l) => l.startsWith('- ')).length;
      if (arrival[1].items.length !== bullets) errors.push(`roteiro.md ${title}: ${bullets} itens de chegada no doc e ${arrival[1].items.length} no app (D4)`);
      continue;
    }
    const day = doc.days.find((d) => d.date.endsWith(`-${m[2]}-${m[1]}`));
    if (!day) {
      errors.push(`roteiro.md: ${title} sem dia no app (D4)`);
      continue;
    }
    // "### 🏨" (volta ao hotel) e "### 🚗" (deslocamento) não são áreas (feature 007).
    const sections3 = s.split(/^### /m).slice(1);
    const areaTexts = sections3.filter((a) => !/^(🏨|🚗)/u.test(a));
    // D1: itens de lista com horário + linhas de logística com horário + voltas ao hotel em "###"
    // + compras com horário + noites com evento.
    const lines = s.split('\n');
    const timedItems = lines.filter((l) => /^- \*\*(até )?\\?~?\d{1,2}h/.test(l)).length;
    const timedLogistics = lines.filter((l) => !l.startsWith('-') && logisticsLine(l) !== null).length;
    const hotelHeadings = sections3.filter((a) => /^🏨/u.test(a) && /\d{1,2}h/.test(a.split('\n')[0]!)).length;
    const shopping = lines.filter((l) => SHOPPING_LINE.test(l)).length;
    const nights = areaTexts.filter((a) => /^🌙/u.test(a) && !/^- \*\*(até )?\\?~?\d{1,2}h/m.test(a) && nightTime(a.split('\n')[0]!, a)).length;
    const expected = timedItems + timedLogistics + hotelHeadings + shopping + nights;
    if (day.activities.length !== expected) {
      errors.push(`roteiro.md ${title}: o doc tem ${expected} linhas com horário e o app tem ${day.activities.length} (D1)`);
    }
    // D4: cada "###" do dia é uma área.
    if ((day.areas?.length ?? 0) !== areaTexts.length) {
      errors.push(`roteiro.md ${title}: ${areaTexts.length} seções "###" e ${day.areas?.length ?? 0} áreas (D4)`);
    }
    // D2: itens das listas de lojas, comida e locações (itens em itálico são avisos).
    for (const [i, areaText] of areaTexts.entries()) {
      const area = day.areas?.[i];
      let expectedPlaces = (areaText.match(/^🎬 \*\*Locação no caminho:\*\*/gmu) ?? []).length;
      let inList = false;
      for (const l of areaText.split('\n')) {
        const tl = l.trim();
        if (/^\*\*[^*]*(Lojas|Onde comer|Ícones|Locações|Mercados)[^*]*\*\*$/u.test(tl)) inList = true;
        else if (/^\*\*[^*]+\*\*$/.test(tl) || /^(🚶|🏨|🛥️|🚕|\*\*🛥️)/u.test(tl)) inList = false;
        else if (inList && /^- (☕ |🏆 |🍰 )?\*\*/u.test(l)) expectedPlaces++;
        // Orlando (feature 007): itens simples, sem negrito e fora de itálico.
        else if (inList && /^- [^*\s]/u.test(l) && !l.includes('*')) expectedPlaces++;
      }
      const got = (area?.placeIds ?? []).filter((id) => !id.startsWith('attraction-')).length;
      if (got !== expectedPlaces) {
        errors.push(`roteiro.md ${title} / ${area?.name ?? i}: o doc tem ${expectedPlaces} lugares nas listas e o app tem ${got} (D2)`);
      }
    }
    // D3: links de fotos e mapa do dia.
    const have = new Set<string>([
      ...(day.mapUrl ? [day.mapUrl] : []),
      ...(day.places ?? []).flatMap((p) => [...p.mapsUrls, ...(p.photoUrls ?? [])].map((u) => u.url)),
      ...(day.areas ?? []).flatMap((a) => [...a.photoUrls.map((u) => u.url), ...hrefs(a.notesHtml)]),
      ...(day.alerts ?? []).flatMap((a) => hrefs(a.html)),
    ]);
    for (const u of s.match(urlRe) ?? []) if (!have.has(u)) errors.push(`roteiro.md ${title}: link fora do app: ${u} (D3)`);
    // D5: horário de chegada de cada compromisso no texto da sua noite.
    for (const c of commitments.filter((x) => x.date === day.date)) {
      const night = areaTexts.find((a) => /^🌙/u.test(a) && norm(a).includes(norm(c.title)));
      const arrive = c.arriveBy.replace(':', 'h');
      if (!night) errors.push(`roteiro.md ${title}: sem a noite de "${c.title}" (D5)`);
      else if (!night.includes(arrive)) errors.push(`roteiro.md ${title}: a noite de "${c.title}" não cita a chegada às ${arrive} (D5)`);
    }
  }
  const mdLinks = (markdown.match(/\]\((?:https?:[^)\s>]+|<[^>]+>)\)/g) ?? []).length;
  const htmlLinks = doc.docHtml.reduce((n, h) => n + (h.html.match(/<a href=/g) ?? []).length, 0);
  if (mdLinks !== htmlLinks) errors.push(`roteiro.md: ${mdLinks} links no doc e ${htmlLinks} no documento do app (D3)`);
  return errors;
}

/** Nome genérico: o leitor serve aos docs de Nova York e de Orlando (feature 007). */
export const parseDoc = parseNycDoc;
