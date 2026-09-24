import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../../src/app/rng';
import { check, countFor, gridSizeFor, makePattern, showMs } from '../../src/games/pattern/logic';

describe('pattern', () => {
  it('grid grows at rounds 6 and 11', () => {
    expect(gridSizeFor(5)).toBe(3);
    expect(gridSizeFor(6)).toBe(4);
    expect(gridSizeFor(11)).toBe(5);
  });
  it('never lights the whole grid', () => {
    for (let round = 1; round <= 60; round++) {
      const size = gridSizeFor(round);
      expect(countFor(round)).toBeLessThanOrEqual(size * size - 2);
      expect(countFor(round)).toBeGreaterThanOrEqual(2);
    }
  });
  it('count never drops as rounds go up', () => {
    let prev = 0;
    for (let round = 1; round <= 60; round++) {
      const c = countFor(round);
      expect(c).toBeGreaterThanOrEqual(prev);
      prev = c;
    }
  });
  it('patterns have distinct in-range tiles', () => {
    const rng = mulberry32(5);
    for (let round = 1; round <= 30; round++) {
      const { size, lit } = makePattern(round, rng);
      expect(new Set(lit).size).toBe(lit.length);
      expect(lit.every((i) => i >= 0 && i < size * size)).toBe(true);
    }
  });
  it('check is order independent and strict on count', () => {
    expect(check([2, 0], [0, 2])).toBe(true);
    expect(check([0], [0, 2])).toBe(false);
    expect(check([0, 1], [0, 2])).toBe(false);
  });
  it('show time scales with count', () => {
    expect(showMs(3)).toBeLessThan(showMs(6));
  });
});
