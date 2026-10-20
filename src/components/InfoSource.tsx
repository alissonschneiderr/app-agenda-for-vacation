import type { Fact } from '../content/types';

function domain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/** "Fonte: … · verificado em dd/mm" ou "Não confirmado: …" (FR-021). */
export function InfoSource({ fact }: { fact: Fact }) {
  if (fact.status === 'confirmed') {
    const [, m, d] = fact.checkedAt.split('-');
    return (
      <li class="fact">
        {fact.text}{' '}
        <span class="small muted">
          · Fonte:{' '}
          <a href={fact.source} target="_blank" rel="noopener">
            {domain(fact.source)}
          </a>{' '}
          · verificado em {d}/{m}
        </span>
      </li>
    );
  }
  return (
    <li class="fact fact-unconfirmed">
      {fact.text} <span class="badge badge-warn">Não confirmado</span>{' '}
      <span class="small muted">{fact.note}</span>
    </li>
  );
}
