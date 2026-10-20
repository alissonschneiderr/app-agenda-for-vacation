import { indexContent } from '../../src/content/load';
import { fixtureContent } from '../fixtures/content';
import { fixtureFullItinerary } from '../fixtures/full-itinerary';
import { setup } from './helpers';

export function setupFull(isoNow = '2026-11-02T20:00:00Z') {
  const ctx = setup(isoNow);
  const c = fixtureContent();
  c.fullItineraries = [fixtureFullItinerary()];
  return { ...ctx, content: indexContent(c) };
}
