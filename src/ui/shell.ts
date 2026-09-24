import { APP_NAME } from '../app/config';
import { audio } from '../app/audio';
import { store } from '../app/store';
import { h, icon, iconButton } from './components';

export interface HeaderState {
  title: string;
  back?: { label: string; onClick(): void };
}

/** Header, stage and toast region. Built once; screens only swap what is inside the stage. */
export function buildShell(root: HTMLElement) {
  const backSlot = h('div', { class: 'bar-slot bar-left' });
  const title = h('h1', { class: 'bar-title' }, APP_NAME);
  const soundBtn = iconButton('soundOn', 'Sound on', () => toggleSound(), 'soundBtn');
  const header = h('header', { class: 'bar' }, backSlot, title, h('div', { class: 'bar-slot bar-right' }, soundBtn));
  const stage = h('main', { class: 'stage', id: 'stage' });
  const toasts = h('div', { class: 'toasts', 'aria-live': 'polite', 'aria-atomic': 'true' });
  root.replaceChildren(header, stage, toasts);

  function paintSound(): void {
    const on = store.getSettings().feedback;
    soundBtn.replaceChildren(icon(on ? 'soundOn' : 'soundOff'));
    soundBtn.setAttribute('aria-label', on ? 'Sound on. Tap to mute' : 'Sound off. Tap to unmute');
    soundBtn.setAttribute('aria-pressed', String(on));
  }

  function toggleSound(): void {
    audio.toggle(!store.getSettings().feedback);
    paintSound();
  }

  paintSound();

  let toastTimer = 0;
  return {
    stage,
    setHeader(state: HeaderState): void {
      title.textContent = state.title;
      document.title = state.title ? `${state.title} · ${APP_NAME}` : APP_NAME;
      backSlot.replaceChildren();
      if (state.back) backSlot.append(iconButton('back', state.back.label, state.back.onClick, 'backBtn'));
    },
    toast(message: string, kind: 'info' | 'good' = 'info'): void {
      clearTimeout(toastTimer);
      const t = h('div', { class: `toast toast-${kind}` }, message);
      toasts.replaceChildren(t);
      toastTimer = window.setTimeout(() => t.remove(), 2200);
    },
  };
}

export type Shell = ReturnType<typeof buildShell>;
