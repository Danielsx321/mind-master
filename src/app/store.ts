import { RECENT_RUNS_KEPT } from './config';

export type GameId = 'memory' | 'sequence' | 'pattern' | 'reaction' | 'different';
export const GAME_IDS: readonly GameId[] = ['memory', 'sequence', 'pattern', 'reaction', 'different'];

export interface RunRecord {
  gameId: GameId;
  score: number;
  rounds: number;
  at: number;
  extra?: Record<string, number>;
}

export interface Settings {
  /** Sound and haptics together. One switch is enough for a game this size. */
  feedback: boolean;
}

interface State {
  v: 1;
  bests: Partial<Record<GameId, number>>;
  runs: RunRecord[];
  settings: Settings;
  installDismissedAt?: number;
}

const KEY = 'mm:v1';
const LEGACY_KEYS: Record<GameId, string> = {
  memory: 'mindMaster_memory',
  sequence: 'mindMaster_sequence',
  pattern: 'mindMaster_pattern',
  reaction: 'mindMaster_reaction',
  different: 'mindMaster_different',
};

function fresh(): State {
  return { v: 1, bests: {}, runs: [], settings: { feedback: true } };
}

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* private mode or full storage: the game still plays, it just forgets */
  }
}

/** Bests saved by the original single-file game are picked up once so nobody loses a record. */
function migrateLegacy(state: State): boolean {
  let changed = false;
  for (const id of GAME_IDS) {
    const raw = read(LEGACY_KEYS[id]);
    if (raw === null) continue;
    const n = Number(raw);
    if (Number.isFinite(n) && n > (state.bests[id] ?? 0)) {
      state.bests[id] = n;
      changed = true;
    }
  }
  const sound = read('mindMasterSound');
  if (sound === 'false') {
    state.settings.feedback = false;
    changed = true;
  }
  return changed;
}

function load(): State {
  const raw = read(KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Partial<State>;
      if (parsed && parsed.v === 1) {
        return { ...fresh(), ...parsed, settings: { ...fresh().settings, ...(parsed.settings ?? {}) } };
      }
    } catch {
      /* fall through to a fresh state */
    }
  }
  const state = fresh();
  if (migrateLegacy(state)) write(KEY, JSON.stringify(state));
  return state;
}

let state = load();

function persist(): void {
  write(KEY, JSON.stringify(state));
}

export const store = {
  getBest(id: GameId): number {
    return state.bests[id] ?? 0;
  },
  /** Writes through only when the score beats the best. Returns true on a new record. */
  setBestIfHigher(id: GameId, score: number): boolean {
    if (score <= this.getBest(id)) return false;
    state.bests[id] = score;
    persist();
    return true;
  },
  addRun(run: RunRecord): void {
    state.runs = [run, ...state.runs].slice(0, RECENT_RUNS_KEPT);
    persist();
  },
  getRuns(): readonly RunRecord[] {
    return state.runs;
  },
  lastRun(id: GameId): RunRecord | undefined {
    return state.runs.find((r) => r.gameId === id);
  },
  getSettings(): Settings {
    return { ...state.settings };
  },
  setSettings(patch: Partial<Settings>): void {
    state.settings = { ...state.settings, ...patch };
    persist();
  },
  installDismissedRecently(): boolean {
    const at = state.installDismissedAt;
    return at !== undefined && Date.now() - at < 7 * 24 * 3600 * 1000;
  },
  dismissInstall(): void {
    state.installDismissedAt = Date.now();
    persist();
  },
  resetAll(): void {
    state = fresh();
    persist();
  },
  /** Test hook: reload from storage. */
  _reload(): void {
    state = load();
  },
};
