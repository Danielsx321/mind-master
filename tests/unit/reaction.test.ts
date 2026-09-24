import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../../src/app/rng';
import { delayFor, pointsFor, summary } from '../../src/games/reaction/logic';

describe('reaction', () => {
  it('scores 100 when fast, 0 when slow, in between otherwise', () => {
    expect(pointsFor(100)).toBe(100);
    expect(pointsFor(150)).toBe(100);
    expect(pointsFor(825)).toBe(50);
    expect(pointsFor(1500)).toBe(0);
    expect(pointsFor(8688)).toBe(0);
  });
  it('points never rise as time grows', () => {
    let prev = 101;
    for (let ms = 0; ms <= 3000; ms += 10) {
      const p = pointsFor(ms);
      expect(p).toBeLessThanOrEqual(prev);
      prev = p;
    }
  });
  it('delay stays inside the window', () => {
    const rng = mulberry32(8);
    for (let i = 0; i < 1000; i++) {
      const d = delayFor(rng);
      expect(d).toBeGreaterThanOrEqual(1200);
      expect(d).toBeLessThanOrEqual(4000);
    }
  });
  it('summarises times', () => {
    expect(summary([300, 200, 400])).toEqual({ avgMs: 300, bestMs: 200 });
    expect(summary([])).toEqual({ avgMs: 0, bestMs: 0 });
  });
});
