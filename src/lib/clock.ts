// Relógio da viagem (feature 006): a hora atual, ou a de `?agora=` para simular um momento.
import { useEffect, useState } from 'preact/hooks';
import { nowFromUrl } from '../domain/now';

function read(): Date {
  return nowFromUrl(typeof location === 'undefined' ? '' : location.search, new Date());
}

/** Atualiza a cada minuto. */
export function useClock(): Date {
  const [now, setNow] = useState(read);
  useEffect(() => {
    const t = setInterval(() => setNow(read()), 60_000);
    return () => clearInterval(t);
  }, []);
  return now;
}
