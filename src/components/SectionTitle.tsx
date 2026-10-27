import type { ComponentChildren } from 'preact';
import { Icon, type IconName } from './Icon';

/** Título de seção do design (feature 008): ícone num quadrado, título serifado e linha de apoio. */
export function SectionTitle({ icon, title, sub, id, children }: { icon: IconName; title: string; sub?: string; id?: string; children?: ComponentChildren }) {
  return (
    <div class="section-head">
      <span class="section-icon" aria-hidden="true">
        <Icon name={icon} size={20} />
      </span>
      <div class="section-text">
        <h2 id={id}>{title}</h2>
        {sub && <p class="section-sub">{sub}</p>}
      </div>
      {children}
    </div>
  );
}
