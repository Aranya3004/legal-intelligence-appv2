'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Workspace } from '@/components/Layout/Workspace';
import { SearchFilterBar } from '@/components/Research/SearchFilterBar';
import { SourceCard } from '@/components/Research/SourceCard';
import { SourcePreview } from '@/components/Research/SourcePreview';
import { useReviewState } from '@/lib/useReviewState';
import { legalApi } from '@/services/legalApi';
export default function ResearchPage() {
  const [q, setQ] = useState(''); const [domain, setDomain] = useState('all'); const [kind, setKind] = useState('all'); const [sort, setSort] = useState('rel');
  const [term, setTerm] = useState(''); const [err, setErr] = useState(false); const [selId, setSelId] = useState<string | null>(null);
  const { factsConfirmed } = useReviewState();
  const res = useQuery({ queryKey: ['search', term, domain], queryFn: () => legalApi.searchSources(term, domain), enabled: !!term });
  const go = () => { setErr(!q.trim()); if (q.trim()) setTerm(q.trim()); };
  const list = (res.data ?? []).filter((s) => kind === 'all' || s.kind === kind).sort((a, b) => (sort === 'rel' ? b.relevance - a.relevance : a.title.localeCompare(b.title)));
  const sel = list.find((s) => s.id === selId) ?? list[0];
  return (
    <Workspace title="Legal research">
      {!factsConfirmed && <div className="bn">Case profile not confirmed — research uses only your typed query. Confirm extracted facts on the Documents page.</div>}
      <SearchFilterBar q={q} domain={domain} kind={kind} sort={sort} error={err} onQ={setQ} onDomain={setDomain} onKind={setKind} onSort={setSort} onSearch={go} />
      {res.isFetching && <p role="status"><span className="spin" /> Searching approved sources…</p>}
      {res.isError && <p role="alert" className="er">Search failed. Your question was kept; try again.</p>}
      {!term && <div className="card empty"><b>No search yet</b><p className="m">Enter a question to retrieve statutes and judgments. All results here are sample data.</p></div>}
      {term && !res.isFetching && list.length === 0 && <div className="card empty"><b>No sources found</b><p className="m">The corpus has no support for this query. No conclusion should be drawn from silence.</p></div>}
      {sel && !res.isFetching && (
        <div className="split"><div>
          {(['Statute', 'Case'] as const).map((k) => list.some((s) => s.kind === k) && (
            <section key={k} className="card"><h2>{k === 'Statute' ? 'Statutory sources' : 'Judicial decisions'}</h2>
              <ul className="plain">{list.filter((s) => s.kind === k).map((s) => <SourceCard key={s.id} s={s} selected={s.id === sel.id} onSelect={() => setSelId(s.id)} />)}</ul></section>))}
        </div><SourcePreview key={sel.id} s={sel} /></div>)}
    </Workspace>
  );
}
