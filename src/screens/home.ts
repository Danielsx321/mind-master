import { APP_NAME, TAGLINE } from '../app/config';
import { audio } from '../app/audio';
import type { Router, Screen } from '../app/router';
import { store } from '../app/store';
import { games } from '../games/registry';
import { button, h, icon } from '../ui/components';
import type { Shell } from '../ui/shell';
import { installState, promptInstall } from '../app/install';

const MARK = [1, 0, 1, 0, 1, 0, 1, 0, 1];

export function homeScreen(router: Router, shell: Shell): Screen {
  shell.setHeader({ title: '' });

  const mark = h('div', { class: 'hero-mark', 'aria-hidden': 'true' });
  MARK.forEach((on) => mark.append(h('i', { class: on ? 'on' : '' })));

  const list = h('div', { class: 'game-list' });
  for (const game of games) {
    const best = store.getBest(game.id);
    const cardBtn = h(
      'button',
      { type: 'button', class: 'game-card', id: `play-${game.id}`, style: `--tint:var(${game.tint})` },
      h('span', { class: 'game-icon' }, icon(game.icon)),
      h('span', {}, h('h3', {}, game.name), h('p', {}, game.description)),
      h('span', { class: 'game-best' }, h('small', {}, 'Best'), String(best)),
    );
    cardBtn.addEventListener('click', () => {
      audio.unlock();
      audio.click();
      router.go({ name: 'play', gameId: game.id });
    });
    list.append(cardBtn);
  }

  const foot = h('div', { class: 'home-foot' }, button('High scores', () => router.go({ name: 'scores' }), { icon: 'trophy', id: 'scoresBtn' }));

  const install = installState();
  if (install === 'prompt') {
    foot.prepend(
      button('Install the app', async () => {
        const accepted = await promptInstall();
        if (!accepted) store.dismissInstall();
        installBtn.remove();
      }, { variant: 'ghost', icon: 'install', id: 'installBtn' }),
    );
  } else if (install === 'ios-hint') {
    foot.append(h('p', { class: 'install-hint' }, 'On iPhone: tap Share, then "Add to Home Screen" to keep it offline.'));
  }
  const installBtn = foot.querySelector('#installBtn') as HTMLElement | null ?? h('span');

  const el = h(
    'div',
    { class: 'home' },
    h('div', { class: 'hero' }, mark, h('h2', {}, APP_NAME), h('p', {}, TAGLINE)),
    list,
    foot,
  );

  return { el, destroy() {} };
}
