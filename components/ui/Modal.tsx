'use client';
import { useEffect, useId, useRef, type ReactNode } from 'react';
export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null); const id = useId();
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const focusables = () => ref.current!.querySelectorAll<HTMLElement>('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return onClose();
      if (e.key !== 'Tab') return; // focus trap
      const f = focusables(); if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); prev?.focus(); };
  }, [onClose]);
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={id} className="modal">
        <h2 id={id}>{title}</h2>{children}
      </div>
    </div>
  );
}
