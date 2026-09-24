import { int, type Rng } from '../../app/rng';

export interface Board {
  size: number;
  hue: number;
  sat: number;
  light: number;
  oddIndex: number;
  /** Lightness difference of the odd tile, in percentage points. */
  delta: number;
}

export function gridSizeFor(round: number): number {
  if (round <= 3) return 3;
  if (round <= 9) return 4;
  if (round <= 15) return 5;
  return 6;
}

export function deltaFor(round: number): number {
  return Math.max(4, 16 - round);
}

export function makeBoard(round: number, rng: Rng): Board {
  const size = gridSizeFor(round);
  return {
    size,
    hue: int(rng, 0, 359),
    sat: int(rng, 60, 80),
    light: int(rng, 45, 60),
    oddIndex: int(rng, 0, size * size - 1),
    delta: deltaFor(round),
  };
}

export function colourOf(board: Board, index: number): string {
  const light = index === board.oddIndex ? board.light + board.delta : board.light;
  return `hsl(${board.hue} ${board.sat}% ${light}%)`;
}

export function pointsFor(round: number): number {
  return round * 12;
}
