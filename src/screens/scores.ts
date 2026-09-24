import type { Router, Screen } from '../app/router';
import { store } from '../app/store';
import { gameById, games } from '../games/registry';
import { button, h, icon } from '../ui/components';
import type { Shell } from '../ui/shell';

function ago(at: number): string {
  const s = Math.max(0, Math.round((Date.now() - at) / 1000));
  if (s < 60) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const hrs = Math.round(m / 60);
  if (hrs < 24) return `${hrs} h ago`;
  const d = Math.round(hrs / 24);
  return d === 1 ? 'yesterday' : `${d} days ago`;
}

export function scoresScreen(router: Router, shell: Shell): Screen {
  shell.setHeader({ title: 'High scores', back: { label: 'Home', onClick: () => router.go({ name: 'home' }) } });

  const bests = h('div', { class: 'score-rows', id: 'bests' });
  for (const g of games) {
    bests.append(
      h(
        'div',
        { class: 'score-row', style: `--tint:var(${g.tint})` },
        icon(g.icon),
        h('div', {}, h('strong', {}, g.name), h('div', { class: 'when' }, g.scoring)),
        h('span', { class: 'val', id: `best-${g.id}` }, String(store.getBest(g.id))),
      ),
    );
  }

  const runs = store.getRuns();
  const recent = h('div', { class: 'score-rows', id: 'recent' });
  if (runs.length === 0) recent.append(h('p', { class: 'empty' }, 'No runs yet. Play a game and it shows up here.'));
  for (const r of runs) {
    const g = gameById(r.gameId);
    recent.append(
      h(
        'div',
        { class: 'score-row', style: `--tint:var(${g.tint})` },
        icon(g.icon),
        h('div', {}, h('strong', {}, g.name), h('div', { class: 'when' }, `${ago(r.at)} · ${r.rounds} ${g.roundCap ? (r.rounds === 1 ? 'tap' : 'taps') : r.rounds === 1 ? 'round' : 'rounds'}${r.extra?.avgMs ? ` · avg ${r.extra.avgMs} ms` : ''}`)),
        h('span', { class: 'val' }, String(r.score)),
      ),
    );
  }

  let armed = false;
  const reset = button('Reset all scores', () => {
    if (!armed) {
      armed = true;
      reset.replaceChildren(icon('x'), h('span', {}, 'Tap again to wipe everything'));
      reset.classList.add('btn-danger');
      setTimeout(() => {
        armed = false;
        reset.replaceChildren(icon('x'), h('span', {}, 'Reset all scores'));
      }, 4000);
      return;
    }
    store.resetAll();
    router.go({ name: 'scores' });
  }, { variant: 'ghost', icon: 'x', id: 'resetBtn' });

  const el = h(
    'div',
    { class: 'scores' },
    h('p', { class: 'section-title' }, 'Best per game'),
    bests,
    h('p', { class: 'section-title' }, 'Recent runs'),
    recent,
    h('div', { class: 'btn-row' }, button('Home', () => router.go({ name: 'home' }), { variant: 'primary', icon: 'home', id: 'homeBtn' }), reset),
  );

  return { el, destroy() {} };
}
