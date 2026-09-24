import { h } from '../../ui/components';
import type { Game, GameContext } from '../types';
import { delayFor, pointsFor, ROUNDS } from './logic';

let keyHandler: ((e: KeyboardEvent) => void) | null = null;

function unbindKeys(): void {
  if (keyHandler) document.removeEventListener('keydown', keyHandler);
  keyHandler = null;
}

export const reaction: Game = {
  id: 'reaction',
  name: 'Quick Reaction',
  short: 'Reaction',
  description: 'Wait for green. Tap fast. Five rounds.',
  icon: 'bolt',
  tint: '--g-reaction',
  scoring: '0 to 100 a tap: 100 at 150 ms, 0 at 1.5 s. Five taps a run.',
  roundCap: ROUNDS,

  startRound(ctx: GameContext) {
    unbindKeys();
    let state: 'waiting' | 'ready' | 'done' = 'waiting';
    let startedAt = 0;

    const area = h(
      'button',
      { type: 'button', class: 'reaction', id: 'reactionArea', 'aria-live': 'off' },
      h('span', {}, 'Wait for green'),
      h('small', {}, `Tap ${ctx.round} of ${ROUNDS}`),
    );

    const tap = (): void => {
      if (state === 'done') return;
      if (state === 'waiting') {
        state = 'done';
        unbindKeys();
        area.classList.add('done');
        area.replaceChildren(h('span', {}, 'Too early'), h('small', {}, 'Wait for the green'));
        ctx.wrong('Too early', { next: 'restart', delayMs: 1000 });
        return;
      }
      const ms = Math.round(performance.now() - startedAt);
      state = 'done';
      unbindKeys();
      area.classList.remove('ready');
      area.classList.add('done');
      area.replaceChildren(h('div', { class: 'big-number' }, `${ms}`), h('small', {}, 'milliseconds'));
      ctx.correct(pointsFor(ms), { label: `${ms} ms`, meta: { ms } });
    };

    area.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      tap();
    });
    keyHandler = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        tap();
      }
    };
    document.addEventListener('keydown', keyHandler);

    ctx.stage.replaceChildren(
      h('p', { class: 'round-label' }, `Round ${ctx.round} of ${ROUNDS}`),
      area,
      h('p', { class: 'hint' }, 'Space bar works too'),
    );
    ctx.announce(`Round ${ctx.round}. Wait for green`);

    ctx.timers.after(delayFor(ctx.rng), () => {
      if (state !== 'waiting') return;
      state = 'ready';
      startedAt = performance.now();
      area.classList.add('ready');
      area.replaceChildren(h('span', {}, 'Tap now'));
      ctx.announce('Green. Tap now');
    });
  },

  destroy() {
    unbindKeys();
  },
};
