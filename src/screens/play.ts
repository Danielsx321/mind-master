import { audio } from '../app/audio';
import { LIVES_PER_RUN } from '../app/config';
import { defaultRng } from '../app/rng';
import type { Router, Screen } from '../app/router';
import { store, type RunRecord } from '../app/store';
import { Timers } from '../app/timer';
import type { Game, GameContext, CorrectOpts, WrongOpts } from '../games/types';
import { summary } from '../games/reaction/logic';
import { h, hearts, statChip } from '../ui/components';
import type { Shell } from '../ui/shell';

const FLASH_MS = 350;
const COUNTDOWN_TICK_MS = 600;

/** One run of one game: countdown once, then rounds until lives run out or the round cap is hit. */
export function playScreen(game: Game, router: Router, shell: Shell): Screen {
  const timers = new Timers();
  const rng = defaultRng();
  let score = 0;
  let round = 1;
  let lives = LIVES_PER_RUN;
  let ended = false;
  let bestToasted = false;
  const metas: Record<string, number>[] = [];

  const scoreChip = statChip('Score', 'score', '0');
  const roundChip = statChip('Round', 'round', game.roundCap ? `1/${game.roundCap}` : '1');
  const livesChip = statChip('Lives', 'lives', '');
  livesChip.set(hearts(lives, LIVES_PER_RUN));

  const arena = h('div', { class: 'arena', id: 'arena' });
  const live = h('p', { class: 'visually-hidden', 'aria-live': 'polite', 'aria-atomic': 'true' });
  const el = h('div', { class: 'play' }, h('div', { class: 'chips' }, scoreChip.el, roundChip.el, livesChip.el), arena, live);

  shell.setHeader({ title: game.name, back: { label: 'End run and see results', onClick: () => end() } });

  function paintRound(): void {
    roundChip.set(game.roundCap ? `${Math.min(round, game.roundCap)}/${game.roundCap}` : String(round));
  }

  function flash(text: string, kind: 'good' | 'bad'): void {
    arena.querySelector('.flash')?.remove();
    const f = h('div', { class: `flash flash-${kind}` }, text);
    arena.prepend(f);
    timers.after(kind === 'good' ? FLASH_MS + 500 : 1600, () => f.remove());
  }

  const ctx: GameContext = {
    stage: arena,
    rng,
    timers,
    get round() {
      return round;
    },
    get lives() {
      return lives;
    },
    correct(points: number, opts: CorrectOpts = {}) {
      if (ended) return;
      score += points;
      if (opts.meta) metas.push(opts.meta);
      scoreChip.set(String(score), 'pop');
      audio.correct();
      flash(opts.label ? `${opts.label} · +${points}` : `+${points}`, 'good');
      live.textContent = `Correct, plus ${points}`;
      if (store.setBestIfHigher(game.id, score) && !bestToasted) {
        bestToasted = true;
        shell.toast('New best', 'good');
      }
      round += 1;
      if (game.roundCap && round > game.roundCap) {
        timers.after(FLASH_MS + 400, () => end());
        return;
      }
      paintRound();
      timers.after(FLASH_MS, () => startRound());
    },
    wrong(message: string, opts: WrongOpts) {
      if (ended) return;
      lives -= 1;
      livesChip.set(hearts(Math.max(0, lives), LIVES_PER_RUN), 'shake');
      audio.wrong();
      flash(message, 'bad');
      live.textContent = `${message}. ${lives} ${lives === 1 ? 'life' : 'lives'} left`;
      const delay = opts.delayMs ?? 900;
      if (lives <= 0) {
        timers.after(Math.max(delay, 700), () => end());
        return;
      }
      if (opts.next === 'restart') timers.after(delay, () => startRound());
    },
    announce(message: string) {
      live.textContent = message;
    },
  };

  function startRound(): void {
    if (ended) return;
    timers.clear();
    arena.replaceChildren();
    game.startRound(ctx);
  }

  function countdown(): void {
    let n = 3;
    const num = h('div', { class: 'big-number' }, String(n));
    arena.replaceChildren(h('div', { class: 'countdown', id: 'countdown' }, h('div', {}, num, h('p', {}, game.description))));
    live.textContent = `Get ready. ${n}`;
    audio.tick();
    const id = timers.every(COUNTDOWN_TICK_MS, () => {
      n -= 1;
      if (n > 0) {
        num.textContent = String(n);
        num.style.animation = 'none';
        void num.offsetWidth;
        num.style.animation = '';
        audio.tick();
        live.textContent = String(n);
      } else {
        timers.cancel(id);
        audio.go();
        startRound();
      }
    });
  }

  function end(): void {
    if (ended) return;
    ended = true;
    timers.clear();
    game.destroy();
    const run: RunRecord = { gameId: game.id, score, rounds: Math.max(0, round - 1), at: Date.now() };
    const times = metas.map((m) => m.ms).filter((x): x is number => typeof x === 'number');
    if (times.length) run.extra = summary(times);
    store.addRun(run);
    if (lives <= 0 && !bestToasted) audio.gameOver();
    else if (bestToasted) audio.best();
    router.go({ name: 'results', run, newBest: bestToasted });
  }

  countdown();

  return {
    el,
    destroy() {
      ended = true;
      timers.clear();
      game.destroy();
    },
  };
}
