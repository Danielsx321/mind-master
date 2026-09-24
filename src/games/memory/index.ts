import { bigNumber, button, card, drainBar, h } from '../../ui/components';
import type { Game, GameContext } from '../types';
import { check, displayMs, lengthFor, makeNumber, pointsFor } from './logic';

export const memory: Game = {
  id: 'memory',
  name: 'Memory Numbers',
  short: 'Memory',
  description: 'A number flashes up. Type it back.',
  icon: 'numbers',
  tint: '--g-memory',
  scoring: 'Round × 10. One more digit each round.',

  startRound(ctx: GameContext) {
    const answer = makeNumber(ctx.round, ctx.rng);
    const ms = displayMs(answer.length);

    ctx.stage.replaceChildren(
      card(
        '',
        h('p', { class: 'round-label' }, `Round ${ctx.round} · ${lengthFor(ctx.round)} digits`),
        h('h2', {}, 'Remember this number'),
        bigNumber(answer, 'memory-number'),
        drainBar(ms),
      ),
    );
    ctx.announce(`Remember ${answer.split('').join(' ')}`);

    ctx.timers.after(ms, () => {
      let done = false;
      const input = h('input', {
        class: 'field',
        id: 'memoryInput',
        type: 'text',
        inputmode: 'numeric',
        pattern: '[0-9]*',
        autocomplete: 'off',
        autocorrect: 'off',
        spellcheck: 'false',
        placeholder: 'Type the number',
        'aria-label': 'The number you saw',
        maxlength: String(answer.length + 2),
      });
      const submit = (): void => {
        if (done) return;
        const value = input.value;
        if (!value) {
          input.focus();
          return;
        }
        done = true;
        input.disabled = true;
        if (check(value, answer)) ctx.correct(pointsFor(ctx.round));
        else ctx.wrong(`It was ${answer}`, { next: 'restart', delayMs: 1400 });
      };
      input.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter') submit();
      });
      ctx.stage.replaceChildren(
        card(
          '',
          h('p', { class: 'round-label' }, `Round ${ctx.round}`),
          h('h2', {}, 'What was the number?'),
          h('div', { style: 'margin:16px 0' }, input),
          button('Check', submit, { variant: 'primary', icon: 'check', id: 'memorySubmit' }),
        ),
      );
      input.focus();
    });
  },

  destroy() {
    /* nothing held outside the stage */
  },
};
