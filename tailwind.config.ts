import type { Config } from 'tailwindcss';
// Tailwind reads the same CSS-variable tokens as globals.css, so both themes work automatically.
// Preflight is off so it can't alter the existing global styles; utilities are used by new components.
const c = (n: string) => `var(--${n})`;
export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  corePlugins: { preflight: false },
  theme: { extend: { colors: { bg: c('bg'), card: c('card'), tx: c('tx'), mut: c('mut'), bd: c('bd'), pri: c('pri'), sf: c('sf'), ok: c('ok'), wn: c('wn'), er: c('er') } } },
} satisfies Config;
