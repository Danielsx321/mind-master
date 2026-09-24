import type { GameId } from '../app/store';
import { different } from './different';
import { memory } from './memory';
import { pattern } from './pattern';
import { reaction } from './reaction';
import { sequence } from './sequence';
import type { Game } from './types';

/** Order here is the order on the home screen and the "Next game" cycle. */
export const games: readonly Game[] = [memory, sequence, pattern, reaction, different];

export function gameById(id: GameId): Game {
  const g = games.find((x) => x.id === id);
  if (!g) throw new Error(`Unknown game ${id}`);
  return g;
}

export function nextGame(id: GameId): Game {
  const i = games.findIndex((x) => x.id === id);
  return games[(i + 1) % games.length] as Game;
}
