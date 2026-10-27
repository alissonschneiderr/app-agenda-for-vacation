// Funções de apoio dos passos do roteiro (antes no cartão "Agora", removido na feature 009).
import type { DocPlace, Photo } from '../content/types';
import { stopThumb } from '../domain/notebook';
import type { HowToGet } from '../domain/now';
import type { DayActivityView } from '../domain/trip-view';
import type { IconName } from './Icon';

export const MODE_ICON: Record<HowToGet['mode'], IconName> = { walk: 'walk', subway: 'subway', taxi: 'taxi', ferry: 'ferry' };
export const MODE_LABEL: Record<HowToGet['mode'], string> = { walk: 'A pé', subway: 'Metrô', taxi: 'Táxi', ferry: 'Barco' };

/**
 * Foto offline do passo: a do próprio lugar (roteiro ou guia); para compras, a foto da região onde
 * acontecem. Nunca a de outro lugar — nem a do parque herdado para mapa/motorista (feature 008, R3).
 */
export function stepPhoto(a: Pick<DayActivityView, 'places' | 'photos' | 'category'>, area?: { photo?: Photo }): Photo | undefined {
  return stopThumb(a as DayActivityView, area);
}

/** Lugar principal do passo (o do item do roteiro). */
export function stepPlace(a: Pick<DayActivityView, 'places'>): DocPlace | undefined {
  return a.places[0];
}

/** Texto da busca de um link do Google Maps do doc ("query=Top+of+the+Rock+New+York"). */
export function mapsQuery(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    return new URL(url).searchParams.get('query')?.replace(/\+/g, ' ') ?? undefined;
  } catch {
    return undefined;
  }
}

/**
 * Endereço para "Mostrar ao motorista": o do lugar no doc; senão, o do ponto do guia; senão, o texto
 * de busca do link de mapa do doc. Nada é inventado.
 */
export function stepAddress(a: Pick<DayActivityView, 'address' | 'places' | 'point'>): string | undefined {
  return a.address ?? a.places.find((p) => p.address)?.address ?? a.point?.address ?? mapsQuery(a.places[0]?.mapsUrls[0]?.url);
}

/** Aviso pontual do passo: ingresso com horário. */
export function stepTicket(a: DayActivityView): string | undefined {
  if (a.category === 'commitment') return 'Ingresso comprado';
  if (a.full?.booking.required) return a.full.booking.how ?? 'Precisa de ingresso';
  return undefined;
}

/** Orientações rotuladas de eventos (Como chegar, Antecedência, Volta…). */
export function eventFields(a: DayActivityView): { label: string; text: string }[] {
  return (stepPlace(a)?.fields ?? []).filter((f) => f.label);
}
