import { PageHeader } from '../components/PageHeader';
import { setHighContrast, usePrefs } from '../storage/prefs';

/**
 * Exibição (feature 009, Q1 = B): o liga/desliga do alto contraste (modo sol), só por endereço
 * direto (#/exibicao), já que a Consulta saiu do Início.
 */
export function Display() {
  const prefs = usePrefs();
  return (
    <main class="page display">
      <PageHeader back="#/" label="Ajustes" title="Exibição" />
      <label class="switch">
        <input type="checkbox" checked={prefs.highContrast} onChange={(e) => setHighContrast((e.target as HTMLInputElement).checked)} />
        <span>Alto contraste (modo sol)</span>
      </label>
    </main>
  );
}
