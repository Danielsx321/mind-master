import type { Rng } from '../app/rng';
import type { Timers } from '../app/timer';
import type { GameId } from '../app/store';
import type { IconName } from '../ui/icons';

export interface WrongOpts {
  /** `restart`: the controller calls startRound again after `delayMs`. `stay`: the round stays up and the game handles it. */
  next: 'restart' | 'stay';
  delayMs?: number;
}

export interface CorrectOpts {
  /** Shown in the flash instead of "+N". */
  label?: string;
  /** Per-round numbers the results screen can summarise (reaction times, for example). */
  meta?: Record<string, number>;
}

/** What a game gets from the run controller. Games never touch score, lives or the store directly. */
export interface GameContext {
  stage: HTMLElement;
  rng: Rng;
  timers: Timers;
  readonly round: number;
  readonly lives: number;
  correct(points: number, opts?: CorrectOpts): void;
  wrong(message: string, opts: WrongOpts): void;
  announce(message: string): void;
}

export interface Game {
  id: GameId;
  name: string;
  short: string;
  description: string;
  icon: IconName;
  /** CSS variable name for the game's tint, e.g. `--g-memory`. */
  tint: string;
  /** How points are earned, one line, for the results and README. */
  scoring: string;
  /** Runs with a fixed number of rounds end here instead of at zero lives. */
  roundCap?: number;
  startRound(ctx: GameContext): void;
  destroy(): void;
}
