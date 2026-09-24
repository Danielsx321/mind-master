import { int, type Rng } from '../../app/rng';

export function gridSizeFor(round: number): number {
  if (round <= 5) return 3;
  if (round <= 10) return 4;
  return 5;
}

/** Tiles lit this round. Never fills the grid: at least two stay dark so there is something to remember. */
export function countFor(round: number, size = gridSizeFor(round)): number {
  return Math.min(2 + Math.ceil(round / 2), size * size - 2);
}

export function showMs(count: number): number {
  return 600 + 350 * count;
}

export function makePattern(round: number, rng: Rng): { size: number; lit: number[] } {
  const size = gridSizeFor(round);
  const count = countFor(round, size);
  const lit = new Set<number>();
  while (lit.size < count) lit.add(int(rng, 0, size * size - 1));
  return { size, lit: [...lit] };
}

export function check(selected: readonly number[], answer: readonly number[]): boolean {
  if (selected.length !== answer.length) return false;
  const want = new Set(answer);
  return selected.every((i) => want.has(i));
}

export function pointsFor(round: number): number {
  return round * 20;
}
