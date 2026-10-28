// Ícones SVG inline (traço 1.75, 24 px), sem biblioteca e sem rede (feature 003).
const PATHS: Record<string, string> = {
  check: 'M5 12.5l4.5 4.5L19 7.5',
  clock: 'M12 3.5a8.5 8.5 0 1 0 0 17a8.5 8.5 0 1 0 0-17z M12 7.5V12l3 2',
  pin: 'M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z M12 7.5a2.5 2.5 0 1 0 0 5a2.5 2.5 0 1 0 0-5z',
  walk: 'M13 4.5a1.5 1.5 0 1 0 0 .01 M9.5 21l2.5-6.5 3 3V21 M8 11.5l3-3.5 3 2.5 2.5 2 M11 8l-1 5.5',
  subway: 'M7 3.5h10a2 2 0 0 1 2 2V15a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V5.5a2 2 0 0 1 2-2z M5 11h14 M8.5 14.5h.01 M15.5 14.5h.01 M8 18l-2 3 M16 18l2 3',
  taxi: 'M5 16.5V12l2-5h10l2 5v4.5 M3.5 16.5h17 M7.5 19.5v-3 M16.5 19.5v-3 M10 7V4.5h4V7 M7 13h.01 M17 13h.01',
  ferry: 'M3.5 18.5c1.5 1 3 1 4.5 0s3-1 4.5 0 3 1 4.5 0 3-1 3.5-.5 M5 15l1-5h12l1 5 M8 10V6.5h8V10 M12 6.5V4',
  food: 'M7 3.5v8 M4.5 3.5v5a2.5 2.5 0 0 0 5 0v-5 M7 11.5v9 M16.5 20.5V3.5c-2 1-3 3.5-3 6.5h3',
  bag: 'M5.5 8h13l-1 12.5h-11z M9 8V6.5a3 3 0 0 1 6 0V8',
  film: 'M4 5.5h16v13H4z M8 5.5v13 M16 5.5v13 M4 9.5h4 M16 9.5h4 M4 14.5h4 M16 14.5h4',
  ticket: 'M4 7.5h16v3a2 2 0 0 0 0 3v3H4v-3a2 2 0 0 0 0-3z M14 7.5v9',
  bed: 'M3.5 18.5v-11 M3.5 14h17v4.5 M20.5 14v-2.5a3 3 0 0 0-3-3H11V14 M7 11.5a1.5 1.5 0 1 0 0 .01',
  star: 'M12 3.8l2.5 5.1 5.6.8-4 4 .9 5.6-5-2.7-5 2.7.9-5.6-4-4 5.6-.8z',
  map: 'M9 4.5l-5 2v13l5-2 6 2 5-2v-13l-5 2z M9 4.5v13 M15 6.5v13',
  calendar: 'M5 5.5h14v14H5z M5 9.5h14 M9 3.5v4 M15 3.5v4',
  plane: 'M10.5 20.5l1.5-6-6 1.5-1-2 6.5-3.5V5a1.5 1.5 0 0 1 3 0v5.5l6.5 3.5-1 2-6-1.5 1.5 6z',
  home: 'M4 11l8-6.5 8 6.5 M6 9.5v10h12v-10',
  compass: 'M12 3.5a8.5 8.5 0 1 0 0 17a8.5 8.5 0 1 0 0-17z M15.5 8.5l-2 5-5 2 2-5z',
  'chevron-left': 'M14.5 6l-6 6 6 6',
  'chevron-right': 'M9.5 6l6 6-6 6',
  camera: 'M4 7.5h3.5l1.5-2h6l1.5 2H20v11H4z M12 10a3 3 0 1 0 0 6a3 3 0 1 0 0-6z',
  info: 'M12 3.5a8.5 8.5 0 1 0 0 17a8.5 8.5 0 1 0 0-17z M12 11v5 M12 8h.01',
  // Feature 014: fechar avisos e o atalho para "Exibição" (engrenagem).
  close: 'M6 6l12 12 M18 6L6 18',
  settings: 'M12 9a3 3 0 1 0 0 6a3 3 0 1 0 0-6z M19.4 13.5l1.6 1.2-2 3.4-1.9-.8a7 7 0 0 1-2 1.2l-.3 2h-3.8l-.3-2a7 7 0 0 1-2-1.2l-1.9.8-2-3.4 1.6-1.2a7 7 0 0 1 0-3l-1.6-1.2 2-3.4 1.9.8a7 7 0 0 1 2-1.2l.3-2h3.8l.3 2a7 7 0 0 1 2 1.2l1.9-.8 2 3.4-1.6 1.2a7 7 0 0 1 0 3z',
  external: 'M13.5 4.5h6v6 M19.5 4.5l-8 8 M17.5 14v5.5h-13v-13H10',
  skip: 'M6 6.5l7 5.5-7 5.5z M17 6.5v11',
  // Feature 008 — ícones em traço do design (caderno de viagem).
  lightbulb: 'M9 18h6 M10 21h4 M12 3.5a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V17h5v-.6c0-.8.4-1.5 1-2A6 6 0 0 0 12 3.5z',
  train: 'M7.5 3.5h9a2.5 2.5 0 0 1 2.5 2.5v8.5a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V6a2.5 2.5 0 0 1 2.5-2.5z M5 10.5h14 M9 14.5h.01 M15 14.5h.01 M8.5 17.5l-2 3 M15.5 17.5l2 3',
  route: 'M6 19.5a2 2 0 1 0 0-.01 M18 6.5a2 2 0 1 0 0-.01 M8 19.5h7.5a3.5 3.5 0 0 0 0-7h-7a3.5 3.5 0 0 1 0-7H16',
  wallet: 'M4 7.5h14.5a1.5 1.5 0 0 1 1.5 1.5v9.5a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 18.5v-13A1.5 1.5 0 0 1 5.5 4H17 M15.5 13.5h.01',
  sun: 'M12 8a4 4 0 1 0 0 8a4 4 0 1 0 0-8z M12 2.5v2 M12 19.5v2 M2.5 12h2 M19.5 12h2 M5.3 5.3l1.4 1.4 M17.3 17.3l1.4 1.4 M5.3 18.7l1.4-1.4 M17.3 6.7l1.4-1.4',
  phone: 'M8 2.5h8a1.5 1.5 0 0 1 1.5 1.5v16a1.5 1.5 0 0 1-1.5 1.5H8A1.5 1.5 0 0 1 6.5 20V4A1.5 1.5 0 0 1 8 2.5z M11 18.5h2',
  queue: 'M7 6.5a2 2 0 1 0 0-.01 M12 6.5a2 2 0 1 0 0-.01 M17 6.5a2 2 0 1 0 0-.01 M4.5 20v-6a2.5 2.5 0 0 1 5 0v6 M9.5 20v-6a2.5 2.5 0 0 1 5 0v6 M14.5 20v-6a2.5 2.5 0 0 1 5 0v6',
  sparkle: 'M12 3.5l1.8 5.2 5.2 1.8-5.2 1.8L12 17.5l-1.8-5.2L5 10.5l5.2-1.8z M18.5 16.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z',
  'check-small': 'M6.5 12.5l3.5 3.5 7.5-8',
  users: 'M9 11a3.5 3.5 0 1 0 0-7a3.5 3.5 0 1 0 0 7z M2.5 20a6.5 6.5 0 0 1 13 0 M16 4.3a3.5 3.5 0 0 1 0 6.4 M18 14.2a6.5 6.5 0 0 1 3.5 5.8',
  park: 'M12 3.5l6 9h-3.5l4 6h-13l4-6H6z M12 18.5v3',
  beach: 'M3.5 19.5c2 1 4 1 6 0s4-1 6 0 3 1 5 .5 M12 4.5a8 8 0 0 1 8 8H4a8 8 0 0 1 8-8z M12 12.5v6',
};

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 20, label, class: className }: { name: IconName; size?: number; label?: string; class?: string }) {
  return (
    <svg
      class={`icon-svg ${className ?? ''}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.75"
      stroke-linecap="round"
      stroke-linejoin="round"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : 'true'}
      focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
