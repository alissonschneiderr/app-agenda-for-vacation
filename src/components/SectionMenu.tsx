import { useEffect, useState } from 'preact/hooks';
import type { DaySection } from '../domain/notebook';

/**
 * Menu de seções do dia (feature 009, research R3): chips com âncoras presos abaixo do cabeçalho; só as
 * seções com conteúdo. O toque rola até a seção sem mexer no endereço (o hash é a rota); a seção
 * atual (a última cujo topo passou do menu) fica marcada com aria-current.
 */
export function SectionMenu({ sections }: { sections: DaySection[] }) {
  const [current, setCurrent] = useState(sections[0]?.id);
  useEffect(() => {
    // A seção atual é a última cujo topo já passou da linha logo abaixo do cabeçalho + menu.
    let raf = 0;
    const update = () => {
      raf = 0;
      const menu = document.querySelector('.section-menu');
      const line = (menu?.getBoundingClientRect().bottom ?? 0) + 8;
      let cur = sections[0]?.id;
      for (const sec of sections) {
        const el = document.getElementById(sec.id);
        if (el && el.getBoundingClientRect().top <= line) cur = sec.id;
      }
      setCurrent(cur);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [sections.map((s) => s.id).join()]);
  if (sections.length < 2) return null;
  return (
    <nav class="section-menu" aria-label="Seções do dia">
      <ul>
        {sections.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              aria-current={current === s.id ? 'true' : undefined}
              onClick={(e) => {
                e.preventDefault();
                setCurrent(s.id);
                document.getElementById(s.id)?.scrollIntoView({ block: 'start' });
              }}
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
