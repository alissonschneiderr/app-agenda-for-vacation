import type { LoadedContent } from '../content/load';
import type { DayInfo } from '../domain/trip';
import { formatDayLabel } from '../domain/trip';
import type { DayGroup } from '../domain/itineraries';

/** Ex.: "Locomoção Nova York → Orlando" ou "Orlando". */
export function dayCityLabel(day: DayInfo, content: LoadedContent): string {
  if (day.kind === 'sightseeing') return content.cityName(day.cityId);
  if (day.kind === 'travel') {
    return day.destination
      ? `Locomoção ${content.cityName(day.origin)} → ${content.cityName(day.destination)}`
      : `Locomoção: saída de ${content.cityName(day.origin)}`;
  }
  return 'Fora da viagem';
}

/** Ex.: "Dia de locomoção: Nova York → Orlando"; dia de passeio → nome da cidade. */
export function dayHeadline(day: DayInfo, content: LoadedContent): string {
  if (day.kind !== 'travel') return dayCityLabel(day, content);
  return day.destination
    ? `Dia de locomoção: ${content.cityName(day.origin)} → ${content.cityName(day.destination)}`
    : `Dia de locomoção: saída de ${content.cityName(day.origin)}`;
}

/** Ex.: "sábado, 07/11 · Locomoção Nova York → Orlando"; sem dia → "Sem dia". */
export function dayGroupLabel(group: Pick<DayGroup, 'date' | 'day'>, content: LoadedContent): string {
  if (!group.date || !group.day) return 'Sem dia';
  return `${formatDayLabel(group.date)} · ${dayCityLabel(group.day, content)}`;
}
