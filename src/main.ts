import './styles/index.css';
import { registerSW } from 'virtual:pwa-register';
import { Router, type Route, type Screen } from './app/router';
import { audio } from './app/audio';
import { gameById } from './games/registry';
import { homeScreen } from './screens/home';
import { playScreen } from './screens/play';
import { resultsScreen } from './screens/results';
import { scoresScreen } from './screens/scores';
import { buildShell } from './ui/shell';
import { onInstallChange } from './app/install';

const root = document.getElementById('app');
if (!root) throw new Error('#app missing');

const shell = buildShell(root);

const router = new Router(shell.stage, (route: Route): Screen => {
  switch (route.name) {
    case 'home':
      return homeScreen(router, shell);
    case 'play':
      return playScreen(gameById(route.gameId), router, shell);
    case 'results':
      return resultsScreen(route.run, route.newBest, router, shell);
    case 'scores':
      return scoresScreen(router, shell);
  }
});

router.go({ name: 'home' });

// Re-render home when the install prompt becomes available so the button appears without a reload.
onInstallChange(() => {
  if (router.currentRoute.name === 'home') router.go({ name: 'home' });
});

// Unlock audio on the first gesture anywhere, and give every button a click.
document.addEventListener(
  'pointerdown',
  (e) => {
    audio.unlock();
    const target = e.target as HTMLElement | null;
    if (target?.closest('button:not(#soundBtn):not(.tile):not(.reaction):not(.option)')) audio.click();
  },
  { passive: true },
);

// Escape goes back to wherever the header's back button goes.
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') (document.getElementById('backBtn') as HTMLButtonElement | null)?.click();
});

// Updates never interrupt a run: a new build is applied on the home screen, otherwise it waits for the next visit home.
let pendingUpdate: ((reload?: boolean) => Promise<void>) | null = null;
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    if (router.currentRoute.name === 'home') void updateSW(true);
    else pendingUpdate = updateSW;
  },
});
window.addEventListener('popstate', () => {
  if (pendingUpdate) setTimeout(() => void pendingUpdate?.(true), 300);
});
