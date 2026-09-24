// Renders the PWA icons and the share image from design/icon.svg. Run with `pnpm icons`.
import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'node:fs';

const svg = readFileSync(new URL('../design/icon.svg', import.meta.url));
mkdirSync('public/icons', { recursive: true });

await sharp(svg).resize(192, 192).png().toFile('public/icons/icon-192.png');
await sharp(svg).resize(512, 512).png().toFile('public/icons/icon-512.png');

// Maskable: the mark shrunk into the safe zone (80%) over the solid brand background.
const inner = await sharp(svg).resize(410, 410).png().toBuffer();
await sharp({ create: { width: 512, height: 512, channels: 4, background: '#0f1b2e' } })
  .composite([{ input: inner, gravity: 'centre' }])
  .png()
  .toFile('public/icons/maskable-512.png');

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs><radialGradient id="g" cx="50%" cy="0%" r="90%"><stop offset="0" stop-color="#173c66"/><stop offset="1" stop-color="#070d18"/></radialGradient></defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <g transform="translate(120 175)">
    ${[0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => `<rect x="${c * 100}" y="${r * 100}" width="80" height="80" rx="18" fill="${(r + c) % 2 === 0 ? '#38bdf8' : 'rgba(255,255,255,0.10)'}"/>`)).join('')}
  </g>
  <text x="480" y="300" font-family="Helvetica, Arial, sans-serif" font-weight="700" font-size="92" fill="#eef3f9">Mind Master</text>
  <text x="484" y="370" font-family="Helvetica, Arial, sans-serif" font-size="40" fill="#a9b7c8">Five quick brain games. Beat your best.</text>
  <text x="484" y="440" font-family="Helvetica, Arial, sans-serif" font-size="30" fill="#6f7f93">Memory · Sequence · Pattern · Reaction · Focus</text>
</svg>`;
await sharp(Buffer.from(og)).png().toFile('public/og.png');
console.log('icons and og.png written');
