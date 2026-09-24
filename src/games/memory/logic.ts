import { int, type Rng } from '../../app/rng';

export const MAX_LENGTH = 12;

/** Round 1 shows 4 digits, one more each round, capped at 12. */
export function lengthFor(round: number): number {
  return Math.min(3 + Math.max(1, round), MAX_LENGTH);
}

/** Time the number stays on screen. Scales with length so long numbers are fair. */
export function displayMs(length: number): number {
  return 900 + 350 * length;
}

export function makeNumber(round: number, rng: Rng): string {
  const length = lengthFor(round);
  let out = String(int(rng, 1, 9));
  while (out.length < length) out += String(int(rng, 0, 9));
  return out;
}

export function pointsFor(round: number): number {
  return round * 10;
}

export function check(input: string, answer: string): boolean {
  return input.replace(/\s+/g, '') === answer;
}
