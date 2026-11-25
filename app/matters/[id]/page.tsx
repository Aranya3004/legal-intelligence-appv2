'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Workspace } from '@/components/Layout/Workspace';
import { MatterHeader } from '@/components/Matter/MatterHeader';
import { legalApi } from '@/services/legalApi';
const L = (n: 'Overview' | 'Documents' | 'AiAnalysis' | 'Research' | 'Reports') => dynamic(() => import('@/components/Matter/MatterTabs').then((m) => m[n]), { loading: () => <p role="status">Loading…</p> });
const TABS = [['Overview', L('Overview')], ['Documents', L('Documents')], ['AI Analysis', L('AiAnalysis')], ['Legal Research', L('Research')], ['Reports', L('Reports')]] as const;
export default function MatterPage() {
  const { id } = useParams<{ id: string }>(); const [tab, setTab] = useState(0);
  const m = useQuery({ queryKey: ['matter', id], queryFn: () => legalApi.getMatter(id) });
  const Panel = TABS[tab][1];
  return (
    <Workspace title="Matter workspace">
      {m.isLoading && <p role="status">Loading matter…</p>}
      {!m.isLoading && !m.data && <div className="card empty"><b>Matter not found</b></div>}
      {m.data && (<><MatterHeader m={m.data} />
        <div role="tablist" aria-label="Matter sections" className="tabs">{TABS.map(([t], i) => (
          <button key={t} role="tab" id={`tab${i}`} aria-selected={tab === i} aria-controls="panel" tabIndex={tab === i ? 0 : -1} className={tab === i ? 'on' : ''} onClick={() => setTab(i)}
            onKeyDown={(e) => { if (e.key === 'ArrowRight') setTab((tab + 1) % TABS.length); if (e.key === 'ArrowLeft') setTab((tab + TABS.length - 1) % TABS.length); }}>{t}</button>))}</div>
        <div role="tabpanel" id="panel" aria-labelledby={`tab${tab}`}><Panel /></div></>)}
    </Workspace>
  );
}
