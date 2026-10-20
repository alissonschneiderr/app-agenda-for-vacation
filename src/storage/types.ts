// Dados do usuário guardados só no aparelho (contracts/user-storage.md).
import type { DateStr } from '../content/types';

export interface Favorite {
  pointId: string;
  pointName: string;
  savedAt: string; // ISO datetime
}

export interface ItineraryItem {
  pointId: string;
  pointName: string;
}

export interface Itinerary {
  id: string;
  /** 1–60 caracteres, não vazio após trim */
  name: string;
  /** se definida, deve estar entre 2026-10-31 e 2026-11-21 */
  date: DateStr | null;
  origin: 'suggested' | 'user';
  /** só se origin = suggested */
  sourceId: string | null;
  items: ItineraryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ActivityMark {
  state: 'done' | 'skipped';
  at: string; // ISO datetime
}

export interface UserStateV1 {
  schemaVersion: 1;
  seededIds: string[];
  favorites: Favorite[];
  itineraries: Itinerary[];
}

export interface UserState {
  schemaVersion: 2;
  seededIds: string[];
  favorites: Favorite[];
  itineraries: Itinerary[];
  /** Marcações feita/pulada do roteiro FULL, por id de atividade (feature 002). */
  activityMarks: Record<string, ActivityMark>;
}
