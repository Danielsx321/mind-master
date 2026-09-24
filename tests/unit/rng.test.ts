import { describe, expect, it } from 'vitest';
import { int, mulberry32, shuffle } from '../../src/app/rng';

describe('rng', () => {
  it('is deterministic for a seed', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    expect(Array.from({ length: 5 }, a)).toEqual(Array.from({ length: 5 }, b));
  });
  it('int stays inside bounds', () => {
    const rng = mulberry32(7);
    for (let i = 0; i < 10_000; i++) {
      const v = int(rng, 3, 9);
      expect(v).toBeGreaterThanOrEqual(3);
      expect(v).toBeLessThanOrEqual(9);
    }
  });
  it('shuffle keeps every item', () => {
    const rng = mulberry32(1);
    expect([...shuffle(rng, [1, 2, 3, 4])].sort()).toEqual([1, 2, 3, 4]);
  });
});
