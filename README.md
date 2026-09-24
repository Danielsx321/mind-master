# Mind Master

Five quick brain games in the browser. No sign-up, no ads, works offline once you have opened it.

- **Memory Numbers**: a number flashes up, type it back. One more digit each round.
- **Number Sequence**: five numbers, one missing. New pattern types unlock at rounds 4 and 7.
- **Pattern Memory**: tiles light up, tap them back. The grid grows at rounds 6 and 11.
- **Quick Reaction**: wait for green, tap. Five taps a run, scored by speed.
- **Find Different**: one tile is a shade off. Grids grow and differences shrink as you go.

Three lives a run. Your best in each game is saved on every point, so quitting mid-run never loses a record.

## Run it

```bash
pnpm install
pnpm dev
```

| Command | What it does |
|---|---|
| `pnpm dev` | Dev server with hot reload. `?seed=1` in the URL gives a repeatable run. |
| `pnpm build` | Type-check and production build into `dist/`. |
| `pnpm preview` | Serve the production build on port 4173. |
| `pnpm test` | Unit tests for every game's logic (Vitest). |
| `pnpm test:e2e` | Plays every game in a phone-sized Chromium (Playwright). |
| `pnpm lint` | ESLint over `src` and `tests`. |
| `pnpm icons` | Regenerates the PWA icons and share image from `design/icon.svg`. |

## How it is built

Vite, TypeScript and plain DOM. No framework, no runtime dependencies. The whole app is about 11 KB of JavaScript and 3.5 KB of CSS gzipped, plus one 13 KB display font.

```
src/
  app/        config, router, store (localStorage), timers, seedable rng, audio, install prompt
  ui/         DOM builders, inline SVG icons, the header/stage shell
  styles/     tokens (colours, type, motion), base, components
  games/      one folder per game: logic.ts (pure, tested) + index.ts (DOM)
  screens/    home, play (run controller), results, scores
tests/
  unit/       Vitest, one file per logic module
  e2e/        Playwright: games, flow, quality (offline, overflow, tap targets)
```

Every game implements the same `Game` interface: the run controller in `screens/play.ts` owns score, lives, rounds and the countdown, and the game only renders one round at a time and calls `ctx.correct()` or `ctx.wrong()`. Every timer goes through `app/timer.ts` so leaving a screen cancels everything.

## Scoring

| Game | Points |
|---|---|
| Memory Numbers | round × 10 |
| Number Sequence | round × 15 |
| Pattern Memory | round × 20 |
| Quick Reaction | 0 to 100 a tap: 100 at 150 ms, 0 at 1.5 s |
| Find Different | round × 12 |

## Adding a sixth game

Copy a folder under `src/games/`, keep the `logic.ts` / `index.ts` split, add it to `src/games/registry.ts`, give it a tint in `styles/tokens.css` and a test in `tests/unit/`. Nothing else changes.

## Credits

Game ideas inspired by Mind Master by leonard06-yh. This is a from-scratch rebuild: new code, design and rules.
