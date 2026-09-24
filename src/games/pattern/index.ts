import { card, h, tileGrid } from '../../ui/components';
import type { Game, GameContext } from '../types';
import { check, makePattern, pointsFor, showMs } from './logic';

export const pattern: Game = {
  id: 'pattern',
  name: 'Pattern Memory',
  short: 'Pattern',
  description: 'Tiles light up. Tap them back.',
  icon: 'pattern',
  tint: '--g-pattern',
  scoring: 'Round × 20. Bigger grids from round 6 and round 11.',

  startRound(ctx: GameContext) {
    const { size, lit } = makePattern(ctx.round, ctx.rng);
    const want = new Set(lit);
    const ms = showMs(lit.length);

    const showGrid = tileGrid({
      size,
      label: 'Pattern to remember',
      tile: (i) => h('button', { type: 'button', class: `tile${want.has(i) ? ' lit' : ''}`, disabled: true, 'aria-label': `tile ${i + 1}${want.has(i) ? ', lit' : ''}` }),
    });

    ctx.stage.replaceChildren(
      card(
        '',
        h('p', { class: 'round-label' }, `Round ${ctx.round} · ${lit.length} tiles`),
        h('h2', {}, 'Remember the glowing tiles'),
        showGrid,
      ),
    );
    ctx.announce(`Remember ${lit.length} tiles`);

    ctx.timers.after(ms, () => {
      const picked: number[] = [];
      let settled = false;
      const counter = h('h2', {}, `Tap the tiles · 0 of ${lit.length}`);
      const tiles: HTMLButtonElement[] = [];

      const grid = tileGrid({
        size,
        label: 'Tap the tiles you remember',
        tile: (i) => {
          const t = h('button', { type: 'button', class: 'tile' });
          t.addEventListener('click', () => {
            if (settled || picked.includes(i)) return;
            picked.push(i);
            t.classList.add('picked');
            counter.textContent = `Tap the tiles · ${picked.length} of ${lit.length}`;
            if (picked.length === lit.length) {
              settled = true;
              ctx.timers.after(220, () => {
                if (check(picked, lit)) {
                  ctx.correct(pointsFor(ctx.round));
                } else {
                  tiles.forEach((tile, idx) => {
                    if (want.has(idx) && !picked.includes(idx)) tile.classList.add('missed');
                    if (!want.has(idx) && picked.includes(idx)) tile.classList.replace('picked', 'bad');
                  });
                  ctx.wrong('Not quite', { next: 'restart', delayMs: 1100 });
                }
              });
            }
          });
          tiles.push(t);
          return t;
        },
      });

      ctx.stage.replaceChildren(card('', h('p', { class: 'round-label' }, `Round ${ctx.round}`), counter, grid));
      ctx.announce('Tap the tiles you remember');
    });
  },

  destroy() {
    /* nothing held outside the stage */
  },
};
