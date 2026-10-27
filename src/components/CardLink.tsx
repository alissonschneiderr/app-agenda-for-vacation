import type { ComponentChildren } from 'preact';
import { Icon } from './Icon';

/**
 * Link do card clicável (feature 009, research R2): o único link do card, com a área esticada sobre o
 * card inteiro (`.click-card`). Controles dentro do card ficam acima com `.above-link`.
 */
export function CardLink({ href, children, class: className, label }: { href: string; children: ComponentChildren; class?: string; label?: string }) {
  return (
    <a class={`card-link ${className ?? ''}`} href={href} aria-label={label}>
      {children}
    </a>
  );
}

/** Seta › decorativa no canto do card (no lugar de "Ver mais"). */
export function CardChevron() {
  return (
    <span class="card-chevron" aria-hidden="true">
      <Icon name="chevron-right" size={20} />
    </span>
  );
}

const INTERACTIVE = 'a, button, input, select, textarea, summary, label, [role="checkbox"]';

/**
 * Toque em qualquer ponto de um `.click-card` aciona o seu único link (feature 009, FR-006). Controles
 * dentro do card (botões, outros links) continuam com o próprio comportamento. Instalado uma vez no app.
 */
export function installCardClicks(root: Document = document): () => void {
  const onClick = (e: MouseEvent) => {
    const target = e.target as Element | null;
    if (!target || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
    const card = target.closest('.click-card');
    if (!card || target.closest(INTERACTIVE)) return;
    if (root.getSelection?.()?.toString()) return; // seleção de texto não navega
    (card.querySelector('a.card-link') as HTMLAnchorElement | null)?.click();
  };
  root.addEventListener('click', onClick);
  return () => root.removeEventListener('click', onClick);
}
