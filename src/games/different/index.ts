import { card, h, tileGrid } from '../../ui/components';
import type { Game, GameContext } from '../types';
import { colourOf, makeBoard, pointsFor } from './logic';

export const different: Game = {
  id: 'different',
  name: 'Find Different',
  short: 'Different',
  description: 'One tile is a shade off. Find it.',
  icon: 'target',
  tint: '--g-different',
  scoring: 'Round × 12. Bigger grids and smaller differences as you go.',

  startRound(ctx: GameContext) {
    const board = makeBoard(ctx.round, ctx.rng);
    let settled = false;

    const grid = tileGrid({
      size: board.size,
      className: 'different-grid',
      label: 'Find the tile that is a different shade',
      tile: (i) => {
        const t = h('button', { type: 'button', class: 'tile colour', style: `--c:${colourOf(board, i)}` });
        t.addEventListener('click', () => {
          if (settled) return;
          settled = true;
          if (i === board.oddIndex) {
            ctx.correct(pointsFor(ctx.round));
          } else {
            t.classList.add('bad');
            ctx.wrong('Not that one', { next: 'restart', delayMs: 650 });
          }
        });
        return t;
      },
    });

    ctx.stage.replaceChildren(
      card(
        '',
        h('p', { class: 'round-label' }, `Round ${ctx.round} · ${board.size} × ${board.size}`),
        h('h2', {}, 'Which tile is different?'),
        grid,
      ),
    );
    ctx.announce(`Round ${ctx.round}. Find the odd tile in a ${board.size} by ${board.size} grid`);
  },

  destroy() {
    /* nothing held outside the stage */
  },
};
