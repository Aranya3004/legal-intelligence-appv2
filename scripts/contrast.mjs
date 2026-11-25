// Automated WCAG 2.1 contrast audit of the design tokens in app/globals.css (both themes).
import fs from 'node:fs';
const css = fs.readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');
const block = (open) => { const i = css.indexOf(open); const j = css.indexOf('}', i); return Object.fromEntries([...css.slice(i, j).matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{3,6})\b/g)].map((m) => [m[1], m[2].length === 4 ? '#' + [...m[2].slice(1)].map((c) => c + c).join('') : m[2]])); };
const light = block(':root{'), dark = { ...light, ...block('[data-theme=dark]{') };
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const ratio = (a, b) => { const [x, y] = [lum(rgb(a)), lum(rgb(b))].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const mix = (fg, bg, a) => '#' + rgb(fg).map((v, i) => Math.round(v * a + rgb(bg)[i] * (1 - a)).toString(16).padStart(2, '0')).join('');
let fails = 0;
for (const [name, t] of [['light', light], ['dark', dark]]) {
  const onPri = name === 'light' ? '#ffffff' : '#0B1220'; // button text
  const pairs = [
    ['body text on page', t.tx, t.bg, 4.5], ['body text on card', t.tx, t.card, 4.5], ['muted text on card', t.mut, t.card, 4.5], ['muted text on page', t.mut, t.bg, 4.5],
    ['link/primary on card', t.pri, t.card, 4.5], ['primary on tinted surface', t.pri, t.sf, 4.5], ['button text on primary', onPri, t.pri, 4.5],
    ['sidebar text', '#CBD5E1', t.nav, 4.5], ['sidebar active text', '#ffffff', mix('#818CF8', t.nav, 0.18), 4.5],
    ...['ok', 'wn', 'er', 'pri', 'mut'].map((k) => [`badge text (${k}) on tinted card`, t[k], mix(t[k], t.card, 0.1), 4.5]),
    ...['ok', 'wn', 'er'].map((k) => [`banner text on ${k} tint`, t.tx, mix(t[k], t.card, 0.12), 4.5]),
    ...['ok', 'wn', 'er'].map((k) => [`status text (${k}) on card`, t[k], t.card, 4.5]),
    ...[['high bar', '#059669'], ['mid bar', '#D97706'], ['low bar', '#DC2626']].map(([n, c]) => [`${n} fill vs card (non-text 3:1)`, c, t.card, 3]),
    ['focus ring vs page (3:1)', t.pri, t.bg, 3],
  ];
  for (const [label, fg, bg, min] of pairs) { const r = ratio(fg, bg); const ok = r >= min; if (!ok) fails++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name.padEnd(5)} ${label.padEnd(40)} ${r.toFixed(2)} (min ${min})`); }
}
console.log(fails ? `\n${fails} failing pair(s)` : '\nAll token pairs pass.'); process.exit(fails ? 1 : 0);
