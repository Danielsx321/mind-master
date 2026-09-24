import { int, type Rng } from '../../app/rng';

export const ROUNDS = 5;
export const FASTEST_MS = 150;
export const SLOWEST_MS = 1500;

export function delayFor(rng: Rng): number {
  return int(rng, 1200, 4000);
}

/** 100 points at 150 ms or better, 0 at 1.5 s or slower, straight line between. */
export function pointsFor(ms: number): number {
  const raw = 100 - ((ms - FASTEST_MS) * 100) / (SLOWEST_MS - FASTEST_MS);
  return Math.max(0, Math.min(100, Math.round(raw)));
}

export function summary(times: readonly number[]): { avgMs: number; bestMs: number } {
  if (times.length === 0) return { avgMs: 0, bestMs: 0 };
  const avgMs = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
  return { avgMs, bestMs: Math.min(...times) };
}
