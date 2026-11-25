'use client';
import { useState } from 'react';
import Link from 'next/link';
import { NewMatterDialog } from '@/components/Matter/NewMatterDialog';
import { useQuery } from '@tanstack/react-query';
import { Workspace } from '@/components/Layout/Workspace';
import { legalApi } from '@/services/legalApi';
export default function Dashboard() {
  const [creating, setCreating] = useState(false);
  const metrics = useQuery({ queryKey: ['metrics'], queryFn: legalApi.getMetrics });
  const matters = useQuery({ queryKey: ['matters'], queryFn: legalApi.getMatters });
  const activity = useQuery({ queryKey: ['activity'], queryFn: legalApi.getActivity });
  return (
    <Workspace title="Dashboard">
      <h2 style={{ fontSize: 22 }}>Good morning, Counsel</h2><p className="m">AI output stays draft until you confirm it.</p>
      <div className="row"><button className="btn" onClick={() => setCreating(true)}>+ Create New Matter</button><Link className="btn s" href="/research">Start Legal Research</Link></div>
      <div className="g4">{(metrics.data ?? []).map(([l, n]) => <div key={l} className="card"><span className="m">{l}</span><div className="big">{n}</div></div>)}</div>
      <section className="card"><h2>Recent matters</h2><div className="tw"><table><thead><tr><th scope="col">Matter</th><th scope="col">ID</th><th scope="col">Updated</th><th scope="col">Docs</th><th scope="col">Status</th></tr></thead>
        <tbody>{(matters.data ?? []).slice(0, 5).map((m) => <tr key={m.id}><td><Link href={`/matters/${m.id}`}>{m.name}</Link></td><td>{m.id}</td><td>{m.updated}</td><td>{m.documents}</td><td><span className="badge pri">{m.status}</span></td></tr>)}</tbody></table></div></section>
      <section className="card"><h2>Recent activity</h2><ul className="plain">{(activity.data ?? []).map((a) => <li key={a}>{a}</li>)}</ul></section>
      {creating && <NewMatterDialog onClose={() => setCreating(false)} />}
    </Workspace>
  );
}
