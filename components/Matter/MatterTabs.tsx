'use client';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { legalApi } from '@/services/legalApi';
import { SummaryCard } from './SummaryCard';
import { FactItem } from './FactItem';
import { useFacts } from '@/lib/useFacts';
const facts = () => useQuery({ queryKey: ['facts'], queryFn: legalApi.getFacts });
export function Overview() {
  const { data = [] } = facts();
  return (<div className="split"><SummaryCard title="Matter summary"><p>Buyer claims damages for repeated late deliveries. Research waits on lawyer confirmation of extracted issues.</p><span className="lb">Legal issues identified</span>
    {data.filter((f) => f.group.startsWith('Potential')).map((f) => <p key={f.id}>{f.text} <span className={`badge ${f.state === 'confirmed' ? 'ok' : 'wn'}`}>{f.state === 'confirmed' ? '✓ Confirmed' : 'Draft — unconfirmed'}</span></p>)}</SummaryCard>
    <SummaryCard title="Quick actions"><div className="row"><Link className="btn" href="/documents">Upload documents</Link><Link className="btn s" href="/research">Start research</Link></div></SummaryCard></div>);
}
export function Documents() { return <SummaryCard title="Documents"><p>Upload and track case documents.</p><Link className="btn" href="/documents">Open documents</Link></SummaryCard>; }
export function AiAnalysis() { const { facts: list, state, edit } = useFacts(); return <ul className="plain">{list.map((f) => <FactItem key={f.id} fact={f} onState={(s) => state.mutate({ id: f.id, s })} onEdit={(text) => edit.mutate({ id: f.id, text })} />)}</ul>; }
export function Research() { return <SummaryCard title="Legal research"><Link className="btn" href="/research">Open research workspace</Link></SummaryCard>; }
export function Reports() { return <SummaryCard title="Reports"><Link className="btn" href="/reports">Open research report</Link></SummaryCard>; }
