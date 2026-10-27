import type { ComponentChildren } from 'preact';
import { Icon, type IconName } from './Icon';

/** Pílulas do design (feature 008): destaque em caixa alta, tipo de parada, ritmo e tag neutra. */
export function Chip({
  variant = 'tag',
  icon,
  href,
  children,
  class: className,
}: {
  variant?: 'accent' | 'type' | 'pace' | 'tag' | 'glass';
  icon?: IconName;
  href?: string;
  children: ComponentChildren;
  class?: string;
}) {
  const body = (
    <>
      {icon && <Icon name={icon} size={14} />}
      <span>{children}</span>
    </>
  );
  const cls = `chip2 chip2-${variant} ${href ? 'chip2-link' : ''} ${className ?? ''}`;
  return href ? (
    <a class={cls} href={href}>
      {body}
    </a>
  ) : (
    <span class={cls}>{body}</span>
  );
}
