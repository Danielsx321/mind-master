/** Inline SVG icons on a 24px grid, stroked with currentColor so they take the text colour. */
const wrap = (body: string, extra = ''): string =>
  `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" ${extra}>${body}</svg>`;

export const icons = {
  numbers: wrap('<path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/>'),
  sequence: wrap('<path d="M4 12h3m3 0h3m3 0h4"/><circle cx="5.5" cy="12" r="1.8" fill="currentColor" stroke="none"/><circle cx="11.5" cy="12" r="1.8" fill="currentColor" stroke="none"/><path d="M17.5 9.5 20 12l-2.5 2.5"/>'),
  pattern: wrap('<rect x="3" y="3" width="5" height="5" rx="1.2"/><rect x="9.5" y="3" width="5" height="5" rx="1.2" fill="currentColor"/><rect x="16" y="3" width="5" height="5" rx="1.2"/><rect x="3" y="9.5" width="5" height="5" rx="1.2" fill="currentColor"/><rect x="9.5" y="9.5" width="5" height="5" rx="1.2"/><rect x="16" y="9.5" width="5" height="5" rx="1.2" fill="currentColor"/><rect x="3" y="16" width="5" height="5" rx="1.2"/><rect x="9.5" y="16" width="5" height="5" rx="1.2"/><rect x="16" y="16" width="5" height="5" rx="1.2"/>'),
  bolt: wrap('<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" fill="currentColor" stroke="none"/>'),
  target: wrap('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>'),
  trophy: wrap('<path d="M8 4h8v5a4 4 0 0 1-8 0V4z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 21h8M9 17h6v4"/>'),
  soundOn: wrap('<path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" stroke="none"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>'),
  soundOff: wrap('<path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" stroke="none"/><path d="m16 9 5 6M21 9l-5 6"/>'),
  back: wrap('<path d="M15 5l-7 7 7 7"/>'),
  home: wrap('<path d="M4 11 12 4l8 7v9h-5v-6H9v6H4z"/>'),
  play: wrap('<path d="M7 4v16l13-8z" fill="currentColor" stroke="none"/>'),
  refresh: wrap('<path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5"/>'),
  next: wrap('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  install: wrap('<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>'),
  heart: wrap('<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" fill="currentColor" stroke="none"/>'),
  heartEmpty: wrap('<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>'),
  check: wrap('<path d="m5 12 5 5 9-10"/>'),
  x: wrap('<path d="M6 6l12 12M18 6 6 18"/>'),
  share: wrap('<path d="M12 3v12M8 7l4-4 4 4M5 13v7h14v-7"/>'),
} as const;

export type IconName = keyof typeof icons;
