import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../../src/app/rng';
import { check, displayMs, lengthFor, makeNumber, pointsFor } from '../../src/games/memory/logic';

describe('memory', () => {
  it('starts at 4 digits and caps at 12', () => {
    expect(lengthFor(1)).toBe(4);
    expect(lengthFor(5)).toBe(8);
    expect(lengthFor(40)).toBe(12);
  });
  it('display time grows with length', () => {
    expect(displayMs(4)).toBeLessThan(displayMs(8));
  });
  it('numbers have the right length and never start with 0', () => {
    const rng = mulberry32(3);
    for (let round = 1; round <= 20; round++) {
      const n = makeNumber(round, rng);
      expect(n).toHaveLength(lengthFor(round));
      expect(n[0]).not.toBe('0');
      expect(n).toMatch(/^\d+$/);
    }
  });
  it('check ignores spaces only', () => {
    expect(check('12 34', '1234')).toBe(true);
    expect(check('1235', '1234')).toBe(false);
  });
  it('scores round times ten', () => {
    expect(pointsFor(3)).toBe(30);
  });
});
