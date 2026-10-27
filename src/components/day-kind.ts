import type { DayKind } from '../content/types';
import type { IconName } from './Icon';

/** Rótulo e ícone do tipo de dia (features 006 e 008). */
export const KIND_LABEL: Record<DayKind, string> = { walk: 'a pé', beach: 'praia', park: 'parque', transit: 'viagem' };
export const KIND_ICON: Record<DayKind, IconName> = { walk: 'walk', beach: 'beach', park: 'park', transit: 'route' };
