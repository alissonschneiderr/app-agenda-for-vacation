import { Icon } from './Icon';

/** Cabeçalho de página do design (feature 008): voltar redondo, rótulo e título serifado. */
export function PageHeader({
  back,
  label,
  title,
  titleAs = 'h1',
}: {
  back?: string;
  label: string;
  title: string;
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
    </header>
  );
}
