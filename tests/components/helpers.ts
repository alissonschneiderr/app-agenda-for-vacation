import { vi } from 'vitest';
import { indexContent } from '../../src/content/load';
import { createUserStore, setUserStore } from '../../src/storage/user-store';
import { fixtureContent, MemoryStorage } from '../fixtures/content';

export function setup(isoNow = '2026-11-03T15:00:00Z') {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(isoNow));
  const storage = new MemoryStorage();
  const store = createUserStore(storage);
  setUserStore(store);
  return { content: indexContent(fixtureContent()), store, storage };
}

export function setOnline(online: boolean) {
  Object.defineProperty(window.navigator, 'onLine', { configurable: true, get: () => online });
  window.dispatchEvent(new Event(online ? 'online' : 'offline'));
}
