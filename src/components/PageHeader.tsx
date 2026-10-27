import type { Progress } from '../domain/trip-view';
import { Icon } from './Icon';
import { ProgressRing } from './ProgressRing';

/** Cabeçalho de página do design (feature 008): voltar redondo, rótulo, título serifado, anel. */
export function PageHeader({
  back,
  label,
  title,
  progress,
  scope,
  titleAs = 'h1',
}: {
  back?: string;
  label: string;
  title: string;
  progress?: Progress;
  scope?: string;
  /** Feature 009: 'p' quando a página tem o próprio h1 (ex.: atração). */
  titleAs?: 'h1' | 'p';
}) {
  const Title = titleAs;
  return (
    <header class="page-head">
      {back ? (
        <a class="round-btn" href={back} aria-label="Voltar">
          <Icon name="chevron-left" size={22} />
        </a>
      ) : (
        <span class="round-btn round-btn-brand" aria-hidden="true">
          <Icon name="compass" size={22} />
        </span>
      )}
      <div class="page-head-text">
        <p class="eyebrow page-head-label">{label}</p>
        <Title class="page-head-title">{title}</Title>
      </div>
      {progress && <ProgressRing progress={progress} scope={scope ?? title} />}
    </header>
  );
}
