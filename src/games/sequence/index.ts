import { card, h } from '../../ui/components';
import type { Game, GameContext } from '../types';
import { makeOptions, pickPuzzle, pointsFor } from './logic';

let keyHandler: ((e: KeyboardEvent) => void) | null = null;

function unbindKeys(): void {
  if (keyHandler) document.removeEventListener('keydown', keyHandler);
  keyHandler = null;
}

export const sequence: Game = {
  id: 'sequence',
  name: 'Number Sequence',
  short: 'Sequence',
  description: 'Spot the rule. Fill the gap.',
  icon: 'sequence',
  tint: '--g-sequence',
  scoring: 'Round × 15. New pattern types from round 4 and round 7.',

  startRound(ctx: GameContext) {
    unbindKeys();
    const puzzle = pickPuzzle(ctx.round, ctx.rng);
    const options = makeOptions(puzzle.answer, puzzle.step, ctx.rng);
    let settled = false;

    const row = h('div', { class: 'seq-row', 'aria-label': 'The sequence' });
    puzzle.numbers.forEach((n, i) => {
      const missing = i === puzzle.missingIndex;
      row.append(h('span', { class: `seq-item${missing ? ' missing' : ''}`, 'aria-label': missing ? 'missing number' : String(n) }, missing ? '?' : String(n)));
    });

    const buttons: HTMLButtonElement[] = [];
    const choose = (value: number, btn: HTMLButtonElement): void => {
      if (settled || btn.disabled) return;
      if (value === puzzle.answer) {
        settled = true;
        unbindKeys();
        buttons.forEach((b) => (b.disabled = true));
        ctx.correct(pointsFor(ctx.round));
      } else {
        btn.disabled = true;
        btn.classList.add('wrong');
        ctx.wrong('Not that one', { next: 'stay' });
        if (ctx.lives <= 0) settled = true;
      }
    };

    const grid = h('div', { class: 'options', role: 'group', 'aria-label': 'Answers' });
    options.forEach((value, i) => {
      const btn = h('button', { type: 'button', class: 'option', 'aria-label': `${value}, key ${i + 1}` }, String(value));
      btn.addEventListener('click', () => choose(value, btn));
      buttons.push(btn);
      grid.append(btn);
    });

    keyHandler = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (n >= 1 && n <= options.length) {
        const btn = buttons[n - 1];
        const val = options[n - 1];
        if (btn && val !== undefined) choose(val, btn);
      }
    };
    document.addEventListener('keydown', keyHandler);

    ctx.stage.replaceChildren(
      card(
        '',
        h('p', { class: 'round-label' }, `Round ${ctx.round}`),
        h('h2', {}, 'Which number is missing?'),
        row,
        grid,
        h('p', { class: 'hint' }, 'Keys 1 to 4 also work'),
      ),
    );
    ctx.announce(`Sequence ${puzzle.numbers.map((n, i) => (i === puzzle.missingIndex ? 'blank' : n)).join(', ')}. Options ${options.join(', ')}`);
  },

  destroy() {
    unbindKeys();
  },
};
