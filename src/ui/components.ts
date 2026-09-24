import { icons, type IconName } from './icons';

type Child = Node | string | null | undefined | false;
type Props = Record<string, string | number | boolean | EventListener | undefined>;

/** Tiny DOM builder. `h('div', { class: 'x', onclick: fn }, 'text', otherNode)`. */
export function h<K extends keyof HTMLElementTagNameMap>(tag: K, props: Props = {}, ...children: Child[]): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === false) continue;
    if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2), value);
    } else if (key === 'html') {
      el.innerHTML = String(value);
    } else if (value === true) {
      el.setAttribute(key, '');
    } else {
      el.setAttribute(key, String(value));
    }
  }
  for (const child of children) {
    if (child === null || child === undefined || child === false) continue;
    el.append(typeof child === 'string' ? document.createTextNode(child) : child);
  }
  return el;
}

export function icon(name: IconName, className = 'icon'): HTMLElement {
  const span = h('span', { class: className, html: icons[name] });
  return span;
}

interface ButtonOpts {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  icon?: IconName;
  id?: string;
  ariaLabel?: string;
  className?: string;
  disabled?: boolean;
}

export function button(label: string, onClick: () => void, opts: ButtonOpts = {}): HTMLButtonElement {
  const btn = h(
    'button',
    {
      type: 'button',
      class: `btn btn-${opts.variant ?? 'secondary'}${opts.className ? ` ${opts.className}` : ''}`,
      id: opts.id,
      'aria-label': opts.ariaLabel,
      disabled: opts.disabled,
      onclick: () => onClick(),
    },
    opts.icon ? icon(opts.icon) : null,
    label ? h('span', {}, label) : null,
  );
  return btn;
}

export function iconButton(name: IconName, ariaLabel: string, onClick: () => void, id?: string): HTMLButtonElement {
  return h('button', { type: 'button', class: 'btn-icon', 'aria-label': ariaLabel, id, onclick: () => onClick() }, icon(name));
}

export function card(className = '', ...children: Child[]): HTMLElement {
  return h('section', { class: `card ${className}`.trim() }, ...children);
}

export function statChip(label: string, id: string, initial: string): { el: HTMLElement; set(value: string | Node, pulse?: 'pop' | 'shake'): void } {
  const value = h('span', { class: 'chip-value', id }, initial);
  const el = h('div', { class: 'chip' }, value, h('span', { class: 'chip-label' }, label));
  return {
    el,
    set(next, pulse) {
      value.replaceChildren(typeof next === 'string' ? document.createTextNode(next) : next);
      if (pulse) {
        el.classList.remove('pop', 'shake');
        void el.offsetWidth; // restart the animation
        el.classList.add(pulse);
      }
    },
  };
}

/** Hearts for lives. Filled ones first, then empties, so the count reads at a glance. */
export function hearts(lives: number, max: number): HTMLElement {
  const wrap = h('span', { class: 'hearts', role: 'img', 'aria-label': `${lives} of ${max} lives` });
  for (let i = 0; i < max; i++) wrap.append(icon(i < lives ? 'heart' : 'heartEmpty', i < lives ? 'icon heart-on' : 'icon heart-off'));
  return wrap;
}

interface TileGridOpts {
  size: number;
  className?: string;
  label: string;
  tile(index: number): HTMLButtonElement;
}

export function tileGrid(opts: TileGridOpts): HTMLElement {
  const grid = h('div', { class: `tiles ${opts.className ?? ''}`.trim(), role: 'grid', 'aria-label': opts.label, style: `--n:${opts.size}` });
  const total = opts.size * opts.size;
  for (let i = 0; i < total; i++) {
    const t = opts.tile(i);
    t.setAttribute('role', 'gridcell');
    if (!t.getAttribute('aria-label')) t.setAttribute('aria-label', `tile ${i + 1} of ${total}`);
    grid.append(t);
  }
  return grid;
}

/** A bar that empties over `ms`. Driven by a CSS transition, so it costs nothing per frame. */
export function drainBar(ms: number): HTMLElement {
  const fill = h('div', { class: 'drain-fill' });
  const bar = h('div', { class: 'drain', role: 'progressbar', 'aria-hidden': 'true' }, fill);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      fill.style.transitionDuration = `${ms}ms`;
      fill.style.transform = 'scaleX(0)';
    });
  });
  return bar;
}

export function bigNumber(text: string, className = ''): HTMLElement {
  return h('div', { class: `big-number ${className}`.trim() }, text);
}
