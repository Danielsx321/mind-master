import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

// A tiny in-memory localStorage so the store can be tested in plain Node.
const mem = new Map<string, string>();
const fakeStorage = {
  getItem: (k: string) => (mem.has(k) ? (mem.get(k) as string) : null),
  setItem: (k: string, v: string) => void mem.set(k, String(v)),
  removeItem: (k: string) => void mem.delete(k),
  clear: () => mem.clear(),
};

beforeAll(() => {
  Object.defineProperty(globalThis, 'localStorage', { value: fakeStorage, configurable: true });
});

describe('store', () => {
  beforeEach(() => mem.clear());

  it('migrates the original game keys once', async () => {
    mem.set('mindMaster_memory', '120');
    mem.set('mindMaster_reaction', 'abc');
    mem.set('mindMasterSound', 'false');
    const { store } = await import('../../src/app/store');
    store._reload();
    expect(store.getBest('memory')).toBe(120);
    expect(store.getBest('reaction')).toBe(0);
    expect(store.getSettings().feedback).toBe(false);
  });

  it('writes bests only when higher and keeps twenty runs', async () => {
    const { store } = await import('../../src/app/store');
    store._reload();
    expect(store.setBestIfHigher('pattern', 40)).toBe(true);
    expect(store.setBestIfHigher('pattern', 30)).toBe(false);
    expect(store.getBest('pattern')).toBe(40);
    for (let i = 0; i < 25; i++) store.addRun({ gameId: 'memory', score: i, rounds: 1, at: i });
    expect(store.getRuns()).toHaveLength(20);
    expect(store.getRuns()[0]?.score).toBe(24);
  });

  it('survives corrupt storage', async () => {
    mem.set('mm:v1', '{not json');
    const { store } = await import('../../src/app/store');
    store._reload();
    expect(store.getBest('memory')).toBe(0);
  });
});
