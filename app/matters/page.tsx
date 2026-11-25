'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Workspace } from '@/components/Layout/Workspace';
import { NewMatterDialog } from '@/components/Matter/NewMatterDialog';
import { legalApi } from '@/services/legalApi';
export default function MattersPage() {
  const { data = [], isLoading } = useQuery({ queryKey: ['matters'], queryFn: legalApi.getMatters });
  const [f, setF] = useState(''); const [creating, setCreating] = useState(false); const ref = useRef<HTMLDivElement>(null);
  const rows = data.filter((m) => `${m.name} ${m.id}`.toLowerCase().includes(f.toLowerCase()));
  const v = useVirtualizer({ count: rows.length, getScrollElement: () => ref.current, estimateSize: () => 56, overscan: 8 }); // only visible rows are mounted
  return (
    <Workspace title="My matters">
      <div className="row"><button className="btn" onClick={() => setCreating(true)}>+ New matter</button><input type="search" value={f} onChange={(e) => setF(e.target.value)} placeholder="Filter by name or ID" aria-label="Filter matters" /><span className="m" role="status">{rows.length} matters</span></div>
      {isLoading && <p role="status">Loading matters…</p>}
      <div ref={ref} className="vl card" role="list" aria-label="Matters" tabIndex={0}>
        <div style={{ height: v.getTotalSize(), position: 'relative' }}>{v.getVirtualItems().map((vi) => { const m = rows[vi.index]; return (
          <div key={m.id} role="listitem" className="vrow" style={{ transform: `translateY(${vi.start}px)`, height: vi.size }}>
            <Link href={`/matters/${m.id}`}><b>{m.name}</b></Link><span className="m">{m.id} · {m.documents} docs · {m.updated}</span><span className={`badge ${m.status === 'Completed' ? 'ok' : m.status === 'In Review' ? 'wn' : 'pri'}`}>{m.status}</span></div>); })}</div>
      </div>
      {!isLoading && rows.length === 0 && <div className="card empty"><b>No matters match “{f}”</b></div>}
      {creating && <NewMatterDialog onClose={() => setCreating(false)} />}
    </Workspace>
  );
}
