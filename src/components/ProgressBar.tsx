import type { Progress } from '../domain/trip-view';

/** "x de y" + barra; calculado dos estados reais (FR-016). */
export function ProgressBar({ progress, scope, inline = false }: { progress: Progress; scope: string; inline?: boolean }) {
  if (progress.total === 0) return <p class="small muted">Sem atividades planejadas</p>;
  const pct = Math.round((progress.done / progress.total) * 100);
  return (
    <div class={`progress ${inline ? 'progress-inline' : ''}`}>
      <div
        class="progress-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={progress.total}
        aria-valuenow={progress.done}
        aria-label={`${scope}: ${progress.done} de ${progress.total} feitas`}
      >
        <div class="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <span class="progress-text">
        {progress.done} de {progress.total}
        {!inline && ' feitas'}
      </span>
    </div>
  );
}
