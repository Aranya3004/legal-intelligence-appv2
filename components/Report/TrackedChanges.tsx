import type { Change } from '@/lib/trackChanges';
export function TrackedChanges({ changes, onResolve, onResolveAll }: { changes: Change[]; onResolve: (c: Change, accept: boolean) => void; onResolveAll: (accept: boolean) => void }) {
  return (
    <section className="mt-4 rounded-xl border border-bd bg-card p-4" aria-labelledby="tc-h">
      <div className="flex flex-wrap items-center gap-2">
        <h3 id="tc-h" className="m-0 flex-1 text-[13px] font-bold uppercase tracking-wide text-mut">Tracked changes ({changes.length})</h3>
        <button className="btn s sm" disabled={!changes.length} onClick={() => onResolveAll(true)}>Accept all</button>
        <button className="btn s sm" disabled={!changes.length} onClick={() => onResolveAll(false)}>Reject all</button>
      </div>
      {changes.length === 0 && <p className="m">No pending changes.</p>}
      <ul className="m-0 mt-2 list-none p-0" aria-live="polite">{changes.map((c) => (
        <li key={c.id} className="flex flex-wrap items-center gap-2 border-t border-bd py-2">
          <span className={`badge ${c.type === 'insertion' ? 'ok' : 'er'}`}>{c.type === 'insertion' ? '+ Inserted' : '− Deleted'}</span>
          <span className="min-w-0 flex-1 truncate" title={c.text}>“{c.text}”</span><span className="text-xs text-mut">{c.author}</span>
          <button className="btn s sm" onClick={() => onResolve(c, true)}>Accept</button><button className="btn t sm" onClick={() => onResolve(c, false)}>Reject</button>
        </li>))}</ul>
    </section>
  );
}
