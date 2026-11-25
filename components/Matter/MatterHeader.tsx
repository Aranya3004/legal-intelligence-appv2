import type { Matter } from '@/types/legal';
import { DOMAIN_LABEL } from '@/lib/domains';
export function MatterHeader({ m }: { m: Matter }) {
  return (
    <header className="card"><div className="row" style={{ margin: 0 }}><h2 style={{ margin: 0, fontSize: 20 }}>{m.name}</h2><span className="badge pri">{m.status}</span></div>
      <p className="m">{m.id} · Client: fictional sample client · {DOMAIN_LABEL[m.domain ?? 'Contract']} · Assigned: A. Chowdhury · Updated {m.updated}</p></header>
  );
}
