'use client';
import { useState } from 'react';
import type { Citation, CitationStatus } from '@/types/legal';
import { diffWords, type Token } from '@/lib/diff';
import { Modal } from '@/components/ui/Modal';
import { SafeText } from '@/components/ui/SafeText';
import { StatusBadge } from './StatusBadge';
const Words = ({ tokens }: { tokens: Token[] }) => <>{tokens.map((t, i) => (t.hit ? <mark key={i}>{t.w} </mark> : <span key={i}>{t.w} </span>))}</>;
export function CitationInspector({ citation, busy, onSet }: { citation: Citation; busy: boolean; onSet: (s: CitationStatus) => void }) {
  const [confirm, setConfirm] = useState(false);
  const d = diffWords(citation.claim, citation.passage);
  const unavailable = citation.status === 'Source Unavailable';
  const verify = () => (citation.status === 'Potential Mismatch' ? setConfirm(true) : onSet('Verified'));
  return (
    <section className="card" aria-labelledby="insp">
      <h2 id="insp">Citation inspector <StatusBadge status={citation.status} /></h2>
      <div className="diff">
        <div><span className="lb">Claim in report</span><p><Words tokens={d.claim} /></p></div>
        <div><span className="lb">Original source passage</span><p className="src"><Words tokens={d.passage} /></p></div>
      </div>
      <p className="m" aria-live="polite">Word overlap {d.overlap}% — a visual aid only. Read the passage; this never verifies a citation.{d.overlap < 30 && !unavailable ? ' Low overlap: check carefully.' : ''}</p>
      <div className="ai"><span className="lb">AI-generated explanation</span><SafeText html={citation.explanation} /></div>
      <p className="m">{citation.type} · {citation.location}</p>
      <div className="row">
        <button className="btn" disabled={busy || unavailable || citation.status === 'Verified'} onClick={verify}>Mark as Verified</button>
        <button className="btn s" disabled={busy} onClick={() => onSet('Needs Review')}>Flag for Review</button>
      </div>
      {unavailable && <p className="m">Can’t be verified: the source passage is unavailable.</p>}
      {confirm && (
        <Modal title="Mark as verified?" onClose={() => setConfirm(false)}>
          <p>The passage may not support this claim. Verify only after reading the original source.</p>
          <div className="row"><button className="btn" onClick={() => { setConfirm(false); onSet('Verified'); }}>Verify anyway</button><button className="btn s" onClick={() => setConfirm(false)}>Cancel</button></div>
        </Modal>)}
    </section>
  );
}
