import type { Progress } from '../domain/trip-view';

/** Anel de progresso do design (feature 008): compacto no cabeçalho, grande na capa. */
export function ProgressRing({ progress, scope, size = 'small' }: { progress: Progress; scope: string; size?: 'small' | 'large' }) {
  const pct = progress.total ? Math.round((progress.done / progress.total) * 100) : 0;
  const r = size === 'large' ? 26 : 17;
  const stroke = size === 'large' ? 5 : 3.5;
  const box = (r + stroke) * 2;
  const c = 2 * Math.PI * r;
  return (
    <span
      class={`ring ring-${size}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={progress.total}
      aria-valuenow={progress.done}
      aria-label={`${scope}: ${progress.done} de ${progress.total} feitas`}
    >
      <svg width={box} height={box} viewBox={`0 0 ${box} ${box}`} aria-hidden="true">
        <circle class="ring-track" cx={box / 2} cy={box / 2} r={r} stroke-width={stroke} fill="none" />
        <circle
          class="ring-fill"
          cx={box / 2}
          cy={box / 2}
          r={r}
          stroke-width={stroke}
          fill="none"
          stroke-dasharray={`${(c * pct) / 100} ${c}`}
          transform={`rotate(-90 ${box / 2} ${box / 2})`}
          stroke-linecap="round"
        />
      </svg>
      <span class="ring-text">{pct}%</span>
    </span>
  );
}
