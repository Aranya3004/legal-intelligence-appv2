'use client';
interface Props { q: string; domain: string; kind: string; sort: string; error: boolean; onQ: (v: string) => void; onDomain: (v: string) => void; onKind: (v: string) => void; onSort: (v: string) => void; onSearch: () => void }
export function SearchFilterBar(p: Props) {
  return (
    <section className="card" aria-label="Legal research search">
      <label className="field">Research question
        <textarea value={p.q} rows={3} aria-invalid={p.error} onChange={(e) => p.onQ(e.target.value)} placeholder="Describe your legal issue or ask a legal research question..." className={p.error ? 'bad' : ''} /></label>
      {p.error && <p role="alert" className="er">Enter a question to search.</p>}
      <div className="row">
        <label className="field inl">Domain<select value={p.domain} onChange={(e) => p.onDomain(e.target.value)}><option value="all">All Alpha domains</option><option value="Company">Corporate / Company Law</option><option value="Contract">Commercial / Contract Law</option><option value="Partnership">Partnership Law</option></select></label>
        <label className="field inl">Show<select value={p.kind} onChange={(e) => p.onKind(e.target.value)}><option value="all">All sources</option><option value="Statute">Statutes</option><option value="Case">Judgments</option></select></label>
        <label className="field inl">Sort<select value={p.sort} onChange={(e) => p.onSort(e.target.value)}><option value="rel">Relevance</option><option value="title">Title</option></select></label>
        <button className="btn" onClick={p.onSearch}>Search</button>
      </div>
      <p className="m">English queries only in Alpha. Bangla and mixed-language search arrive with the June 2027 deployment.</p>
    </section>
  );
}
