import { int, pick, shuffle, type Rng } from '../../app/rng';

export type PatternKind = 'arithmetic' | 'geometric' | 'alternating' | 'squares' | 'fibonacci';

export interface Puzzle {
  kind: PatternKind;
  numbers: number[];
  missingIndex: number;
  answer: number;
  /** A believable wrong distance, used to build distractors. */
  step: number;
}

export const TERMS = 5;

export function kindsFor(round: number): PatternKind[] {
  if (round <= 3) return ['arithmetic'];
  if (round <= 6) return ['arithmetic', 'geometric', 'alternating'];
  return ['arithmetic', 'geometric', 'alternating', 'squares', 'fibonacci'];
}

function generate(kind: PatternKind, rng: Rng): number[] {
  const n: number[] = [];
  switch (kind) {
    case 'arithmetic': {
      const start = int(rng, 1, 20);
      const step = int(rng, 2, 9);
      for (let i = 0; i < TERMS; i++) n.push(start + step * i);
      return n;
    }
    case 'geometric': {
      const start = int(rng, 1, 5);
      const ratio = pick(rng, [2, 3]);
      for (let i = 0; i < TERMS; i++) n.push(start * ratio ** i);
      return n;
    }
    case 'alternating': {
      const start = int(rng, 10, 30);
      const up = int(rng, 4, 9);
      let down = int(rng, 1, up - 1);
      // With up = 2 × down the fifth term repeats the second, so nudge it.
      if (down * 2 === up) down += 1;
      let v = start;
      for (let i = 0; i < TERMS; i++) {
        n.push(v);
        v += i % 2 === 0 ? up : -down;
      }
      return n;
    }
    case 'squares': {
      const from = int(rng, 1, 6);
      for (let i = 0; i < TERMS; i++) n.push((from + i) ** 2);
      return n;
    }
    case 'fibonacci': {
      let a = int(rng, 1, 9);
      let b = int(rng, a + 1, 13);
      n.push(a, b);
      while (n.length < TERMS) {
        const c = a + b;
        n.push(c);
        a = b;
        b = c;
      }
      return n;
    }
  }
}

export function pickPuzzle(round: number, rng: Rng): Puzzle {
  const kind = pick(rng, kindsFor(round));
  const numbers = generate(kind, rng);
  const missingIndex = int(rng, 0, TERMS - 1);
  const answer = numbers[missingIndex] as number;
  const neighbour = numbers[missingIndex === 0 ? 1 : missingIndex - 1] as number;
  const step = Math.max(1, Math.abs(answer - neighbour));
  return { kind, numbers, missingIndex, answer, step };
}

/** Always four distinct options, answer included, in random order. */
export function makeOptions(answer: number, step: number, rng: Rng): number[] {
  const seen = new Set<number>([answer]);
  const out: number[] = [];
  const candidates = [answer + step, answer - step, answer + 1, answer - 1, answer + 2, answer - 2, answer + step * 2, answer - step * 2];
  for (let k = 3; out.length < 3 && k < 50; k++) candidates.push(answer + k, answer - k);
  for (const c of candidates) {
    if (out.length === 3) break;
    if (seen.has(c) || c < 0) continue;
    seen.add(c);
    out.push(c);
  }
  return shuffle(rng, [answer, ...out]);
}

export function pointsFor(round: number): number {
  return round * 15;
}
