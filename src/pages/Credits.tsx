import type { LoadedContent } from '../content/load';
import { href } from '../lib/router';

export function Credits({ content }: { content: LoadedContent }) {
  const withPhotos = content.points.filter((p) => p.photos.length > 0);
  return (
    <main class="page">
      <h1>Créditos</h1>
      <p>
        Mapa: ©{' '}
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">
          colaboradores do OpenStreetMap
        </a>
        .
      </p>
      <p>Fotos da Wikimedia Commons, usadas conforme as licenças indicadas.</p>
      <ul class="facts">
        {withPhotos.map((p) => (
          <li key={p.id}>
            <a href={href(`/ponto/${p.id}`)}>
              <strong>{p.name}</strong>
            </a>
            {p.photos.map((ph) => (
              <div key={ph.src} class="small">
                {ph.author} ·{' '}
                {ph.licenseUrl ? (
                  <a href={ph.licenseUrl} target="_blank" rel="noopener">
                    {ph.license}
                  </a>
                ) : (
                  ph.license
                )}{' '}
                ·{' '}
                <a href={ph.sourceUrl} target="_blank" rel="noopener">
                  origem
                </a>
              </div>
            ))}
          </li>
        ))}
      </ul>
    </main>
  );
}
