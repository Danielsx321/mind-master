import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../../src/app/rng';
import { kindsFor, makeOptions, pickPuzzle, TERMS } from '../../src/games/sequence/logic';

describe('sequence', () => {
  it('unlocks pattern types by round', () => {
    expect(kindsFor(1)).toEqual(['arithmetic']);
    expect(kindsFor(4)).toHaveLength(3);
    expect(kindsFor(7)).toHaveLength(5);
  });
  it('puzzles have five terms and the answer sits at the gap', () => {
    const rng = mulberry32(11);
    for (let i = 0; i < 2000; i++) {
      const p = pickPuzzle(1 + (i % 12), rng);
      expect(p.numbers).toHaveLength(TERMS);
      expect(p.numbers[p.missingIndex]).toBe(p.answer);
      expect(p.step).toBeGreaterThanOrEqual(1);
      expect(new Set(p.numbers).size).toBe(TERMS);
    }
  });
  it('always offers four distinct options including the answer', () => {
    const rng = mulberry32(99);
    for (let i = 0; i < 10_000; i++) {
      const p = pickPuzzle(1 + (i % 12), rng);
      const options = makeOptions(p.answer, p.step, rng);
      expect(options).toHaveLength(4);
      expect(new Set(options).size).toBe(4);
      expect(options).toContain(p.answer);
      expect(options.every((o) => o >= 0)).toBe(true);
    }
  });
  it('handles a step of 1 without collisions', () => {
    const options = makeOptions(5, 1, mulberry32(2));
    expect(new Set(options).size).toBe(4);
  });
});
