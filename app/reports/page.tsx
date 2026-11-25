'use client';
import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import { Workspace } from '@/components/Layout/Workspace';
import { ApprovalWorkflow } from '@/components/Report/ApprovalWorkflow';
import { CommentThread } from '@/components/Report/CommentThread';
import { useReviewState } from '@/lib/useReviewState';
import { legalApi } from '@/services/legalApi';
import type { ReportComment } from '@/types/legal';
const ReportEditor = dynamic(() => import('@/components/Report/ReportEditor'), { ssr: false, loading: () => <p role="status">Loading editor…</p> });
export default function ReportsPage() {
  const sections = useQuery({ queryKey: ['report'], queryFn: legalApi.getReportSections });
  const { citations, factsConfirmed } = useReviewState();
  const initial = useMemo(() => (sections.data ?? []).map((s, i) => `<h2>${i + 1}. ${s.title}</h2><p>${s.html} ${s.citationIds.map((id) => `<span data-citation="${id}"></span>`).join(' ')}</p>`).join(''), [sections.data]);
  const [html, setHtml] = useState(''); const [dirty, setDirty] = useState(false); const [editing, setEditing] = useState(false); const [comments, setComments] = useState<ReportComment[]>([]); const [note, setNote] = useState(''); const [pending, setPending] = useState(0);
  useEffect(() => { if (!dirty) return; const h = (e: BeforeUnloadEvent) => { e.preventDefault(); }; addEventListener('beforeunload', h); return () => removeEventListener('beforeunload', h); }, [dirty]);
  return (
    <Workspace title="Research report">
      <div className="row"><h2 style={{ margin: 0 }}>Supply delay — research memorandum</h2><span className="m">Matter MTR-2026-014</span>
        <button className="btn s" onClick={() => setEditing((e) => !e)} aria-pressed={editing}>{editing ? 'Stop editing' : 'Edit Report'}</button>
        <button className="btn s" disabled={!dirty} onClick={() => { setDirty(false); setNote(`Draft saved (${html.length} characters).`); }}>Save draft</button>
        <button className="btn" onClick={() => window.print()}>Export PDF</button></div>
      <p role="status" className="m">{dirty ? 'Unsaved changes' : note}</p>
      <div className="split"><div className="card">
        {sections.isLoading ? <p role="status">Loading report…</p> : <ReportEditor html={initial} editable={editing} onChange={(h) => { setHtml(h); setDirty(true); }} onAddComment={(c) => { setComments((x) => [...x, c]); setDirty(true); }} onPending={setPending} />}
      </div><div>
        <ApprovalWorkflow citations={citations} factsConfirmed={factsConfirmed} pendingChanges={pending} />
        <CommentThread comments={comments} onResolve={(id) => setComments((x) => x.map((c) => (c.id === id ? { ...c, resolved: !c.resolved } : c)))} />
      </div></div>
    </Workspace>
  );
}
