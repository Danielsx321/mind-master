import { store } from './store';

type Wave = OscillatorType;
let ctx: AudioContext | null = null;

function context(): AudioContext | null {
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AC) ctx = new AC();
  }
  if (ctx && ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(frequency: number, duration = 0.18, type: Wave = 'sine', volume = 0.6, delayMs = 0): void {
  if (!store.getSettings().feedback) return;
  const ac = context();
  if (!ac) return;
  const at = ac.currentTime + delayMs / 1000;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, at);
  gain.gain.setValueAtTime(volume, at);
  gain.gain.exponentialRampToValueAtTime(0.001, at + duration);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(at);
  osc.stop(at + duration);
}

// Chrome only allows vibration after a real tap, and logs a warning otherwise. Track one.
let userGestureSeen = false;
window.addEventListener('pointerdown', (e) => {
  if (e.isTrusted) userGestureSeen = true;
}, { once: true, passive: true, capture: true });

function haptic(pattern: number | number[]): void {
  if (!store.getSettings().feedback || !userGestureSeen) return;
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* not supported */
  }
}

export const audio = {
  /** Call on the first user gesture so iOS lets sound play later. */
  unlock(): void {
    context();
  },
  click(): void {
    tone(650, 0.06, 'square', 0.25);
  },
  tick(): void {
    tone(500, 0.12, 'square', 0.5);
  },
  go(): void {
    tone(700, 0.1, 'square', 0.6);
    tone(1000, 0.2, 'square', 0.6, 100);
  },
  correct(): void {
    tone(600, 0.1, 'sine', 0.6);
    tone(850, 0.16, 'sine', 0.6, 90);
    haptic(10);
  },
  wrong(): void {
    tone(220, 0.18, 'sawtooth', 0.5);
    tone(150, 0.24, 'sawtooth', 0.5, 120);
    haptic(30);
  },
  best(): void {
    tone(600, 0.1, 'triangle', 0.6);
    tone(750, 0.1, 'triangle', 0.6, 100);
    tone(950, 0.28, 'triangle', 0.7, 200);
  },
  gameOver(): void {
    tone(400, 0.18, 'sawtooth', 0.55);
    tone(300, 0.18, 'sawtooth', 0.55, 170);
    tone(180, 0.45, 'sawtooth', 0.55, 340);
    haptic(50);
  },
  toggle(on: boolean): void {
    store.setSettings({ feedback: on });
    if (on) {
      context();
      tone(800, 0.14, 'sine', 0.6);
    }
  },
};
