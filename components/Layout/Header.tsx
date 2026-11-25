'use client';
import { useTheme, type Theme } from '@/lib/useTheme';
const NEXT: Record<Theme, Theme> = { system: 'light', light: 'dark', dark: 'system' };
export function Header({ title }: { title: string }) {
  const { theme, setTheme } = useTheme();
  return (
    <header className="top">
      <h1 className="t">{title}</h1>
      <input type="search" placeholder="Search matters, documents…" aria-label="Search matters and documents" />
      <button className="btn s sm" onClick={() => setTheme(NEXT[theme])} aria-label={`Theme: ${theme}. Switch to ${NEXT[theme]}`}>Theme: {theme}</button>
    </header>
  );
}
