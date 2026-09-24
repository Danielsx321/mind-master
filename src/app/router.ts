import type { GameId, RunRecord } from './store';

export type Route =
  | { name: 'home' }
  | { name: 'play'; gameId: GameId }
  | { name: 'results'; run: RunRecord; newBest: boolean }
  | { name: 'scores' };

export interface Screen {
  el: HTMLElement;
  destroy(): void;
}

type Renderer = (route: Route) => Screen;

/**
 * Screens render into the stage one at a time. Every non-home route pushes one history entry,
 * so the phone's back button always returns home instead of leaving the app.
 */
export class Router {
  private current: Screen | null = null;
  private route: Route = { name: 'home' };

  constructor(
    private stage: HTMLElement,
    private render: Renderer,
  ) {
    window.addEventListener('popstate', () => this.show({ name: 'home' }));
    history.replaceState({ home: true }, '');
  }

  get currentRoute(): Route {
    return this.route;
  }

  go(route: Route): void {
    if (route.name === 'home') {
      if (!history.state?.home) history.back();
      else this.show(route);
      return;
    }
    if (history.state?.home) history.pushState({ home: false }, '');
    else history.replaceState({ home: false }, '');
    this.show(route);
  }

  private show(route: Route): void {
    this.current?.destroy();
    this.current?.el.remove();
    this.route = route;
    const next = this.render(route);
    next.el.classList.add('screen', 'screen-enter');
    this.stage.replaceChildren(next.el);
    this.current = next;
    window.scrollTo({ top: 0 });
  }
}
