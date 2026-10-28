import type { DayAlert } from '../content/types';
import { markAlertRead, usePrefs } from '../storage/prefs';
import { Icon } from './Icon';

/** HTML gerado no build a partir do roteiro.md do próprio app. */
function Html({ html }: { html: string }) {
  return <div class="doc-html" dangerouslySetInnerHTML={{ __html: html }} />;
}

/**
 * Avisos do dia inteiro (feature 006, FR-008).
 * - "faixa": um aviso não lido por vez; "Entendi" grava como lido e ele não volta naquele dia.
 * - "lista": todos, recolhidos em "Avisos do dia".
 */
export function DayAlerts({ alerts, mode, allHref, open = false }: { alerts: DayAlert[]; mode: 'banner' | 'list'; allHref?: string; open?: boolean }) {
  const prefs = usePrefs();
  if (!alerts.length) return null;
  if (mode === 'banner') {
    const unread = alerts.find((a) => !prefs.readAlerts.includes(a.id));
    if (!unread) return null;
    return (
      <aside class="alert-banner" aria-label="Aviso do dia">
        <Icon name="info" size={20} />
        <div class="alert-body">
          <details class="alert-text">
            <summary>
              <Html html={unread.html} />
            </summary>
          </details>
          <div class="row">
            <button type="button" class="btn" onClick={() => markAlertRead(unread.id)}>
              Entendi
            </button>
            {allHref && alerts.length > 1 && (
              <a class="btn btn-quiet" href={allHref}>
                Ver todos
              </a>
            )}
          </div>
        </div>
      </aside>
    );
  }
  return (
    <details class="alert-list" id="avisos" open={open}>
      <summary>
        <Icon name="info" size={18} /> Avisos do dia
      </summary>
      {alerts.map((a) => (
        <Html key={a.id} html={a.html} />
      ))}
    </details>
  );
}
