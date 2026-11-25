'use client';
import { useEffect, useState } from 'react';
export type Theme = 'light' | 'dark' | 'system';
export function useTheme() {
  const [theme, setTheme] = useState<Theme>('system');
  const [ready, setReady] = useState(false);
  useEffect(() => { try { setTheme((localStorage.getItem('theme') as Theme) || 'system'); } catch {} setReady(true); }, []);
  useEffect(() => {
    if (!ready) return; // don't overwrite the stored choice before it has been read
    const apply = () => { document.documentElement.dataset.theme = theme === 'dark' || (theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light'; };
    apply(); try { localStorage.setItem('theme', theme); } catch {}
    if (theme !== 'system') return;
    const mq = matchMedia('(prefers-color-scheme: dark)'); mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [theme, ready]);
  return { theme, setTheme };
}
