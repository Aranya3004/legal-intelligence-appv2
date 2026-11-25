'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
export const NAV = [['/dashboard', 'Dashboard'], ['/matters', 'My Matters'], ['/documents', 'Documents'], ['/research', 'Legal Research'], ['/citations', 'Citation Review'], ['/reports', 'Research Reports'], ['/settings', 'Settings'], ['/design-system', 'Design System']] as const;
export function SidebarNav() {
  const path = usePathname();
  return (
    <nav className="sb" aria-label="Primary">
      <div className="logo">⚖ Legal Intelligence</div>
      <ul>{NAV.map(([href, label]) => (
        <li key={href}><Link href={href} aria-current={path === href ? 'page' : undefined} className={`nv ${path === href ? 'on' : ''}`}>{label}</Link></li>))}</ul>
      <div className="usr"><b>A. Chowdhury</b>Legal Associate<br />Individual workspace · Alpha</div>
    </nav>
  );
}
