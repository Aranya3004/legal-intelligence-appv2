import type { ReactNode } from 'react';
import { SidebarNav } from './SidebarNav';
import { Header } from './Header';
export function Workspace({ title, children }: { title: string; children: ReactNode }) {
  return (<div className="app"><SidebarNav /><div className="main"><Header title={title} /><main className="pg">{children}</main></div></div>);
}
