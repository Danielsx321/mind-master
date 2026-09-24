export type Rng = () => number;

/** Small, fast, seedable PRNG. Good enough for games, not for anything security related. */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function int(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

export function pick<T>(rng: Rng, items: readonly T[]): T {
  const item = items[Math.floor(rng() * items.length)];
  if (item === undefined) throw new Error('pick() from an empty list');
  return item;
}

export function shuffle<T>(rng: Rng, items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const a = out[i] as T;
    out[i] = out[j] as T;
    out[j] = a;
  }
  return out;
}

/** `?seed=123` gives a deterministic run. Only honoured in dev and in the e2e build, never in production. */
export function defaultRng(): Rng {
  const allowSeed = import.meta.env.DEV || import.meta.env.VITE_E2E === '1';
  if (allowSeed) {
    const raw = new URLSearchParams(location.search).get('seed');
    if (raw !== null && raw !== '' && Number.isFinite(Number(raw))) return mulberry32(Number(raw));
  }
  return Math.random;
}
