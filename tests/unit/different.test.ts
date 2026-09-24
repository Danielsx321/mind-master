import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../../src/app/rng';
import { colourOf, deltaFor, gridSizeFor, makeBoard } from '../../src/games/different/logic';

describe('different', () => {
  it('grid grows at rounds 4, 10 and 16', () => {
    expect(gridSizeFor(3)).toBe(3);
    expect(gridSizeFor(4)).toBe(4);
    expect(gridSizeFor(10)).toBe(5);
    expect(gridSizeFor(16)).toBe(6);
  });
  it('difference shrinks to a floor of 4', () => {
    expect(deltaFor(1)).toBe(15);
    expect(deltaFor(12)).toBe(4);
    expect(deltaFor(50)).toBe(4);
  });
  it('every board has exactly one odd tile', () => {
    const rng = mulberry32(21);
    for (let round = 1; round <= 40; round++) {
      const b = makeBoard(round, rng);
      const total = b.size * b.size;
      const colours = Array.from({ length: total }, (_, i) => colourOf(b, i));
      const base = colours.filter((c) => c === colourOf(b, (b.oddIndex + 1) % total));
      expect(base).toHaveLength(total - 1);
      expect(b.oddIndex).toBeLessThan(total);
    }
  });
});
