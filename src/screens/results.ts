import type { Router, Screen } from '../app/router';
import { store, type RunRecord } from '../app/store';
import { gameById, nextGame } from '../games/registry';
import { button, h, statChip } from '../ui/components';
import type { Shell } from '../ui/shell';

export function resultsScreen(run: RunRecord, newBest: boolean, router: Router, shell: Shell): Screen {
  const game = gameById(run.gameId);
  const best = store.getBest(run.gameId);
  const next = nextGame(run.gameId);

  shell.setHeader({ title: game.name, back: { label: 'Home', onClick: () => router.go({ name: 'home' }) } });

  const facts = h('div', { class: 'facts' });
  facts.append(statChip('Best', 'bestScore', String(best)).el, statChip(game.roundCap ? 'Taps' : 'Rounds', 'roundsDone', String(run.rounds)).el);
  if (run.extra?.avgMs !== undefined) {
    facts.append(statChip('Average', 'avgMs', `${run.extra.avgMs} ms`).el);
    facts.append(statChip('Fastest', 'bestMs', `${run.extra.bestMs} ms`).el);
  }

  const el = h(
    'div',
    { class: 'results', id: 'results' },
    h('span', { class: `badge${newBest ? ' best' : ''}`, id: 'resultBadge' }, newBest ? 'New best' : run.rounds === 0 ? 'No points this time' : 'Run over'),
    h('div', { class: `score${newBest ? ' best' : ''}`, id: 'finalScore' }, String(run.score)),
    h('p', { class: 'meta' }, newBest ? 'That is your best score in this game.' : best > run.score ? `${best - run.score} short of your best.` : game.scoring),
    facts,
    h(
      'div',
      { class: 'btn-row split' },
      button('Play again', () => router.go({ name: 'play', gameId: run.gameId }), { variant: 'primary', icon: 'refresh', id: 'playAgain', className: 'span' }),
      button(`Next: ${next.short}`, () => router.go({ name: 'play', gameId: next.id }), { icon: 'next', id: 'nextGame' }),
      button('Home', () => router.go({ name: 'home' }), { icon: 'home', id: 'goHome' }),
    ),
  );

  return { el, destroy() {} };
}
