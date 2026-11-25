'use client';
import { useState } from 'react';
import type { Citation } from '@/types/legal';
import { Modal } from '@/components/ui/Modal';
export function ApprovalWorkflow({ citations, factsConfirmed, pendingChanges = 0 }: { citations: Citation[]; factsConfirmed: boolean; pendingChanges?: number }) {
  const [approved, setApproved] = useState(false); const [open, setOpen] = useState(false);
  const verified = citations.filter((c) => c.status === 'Verified').length;
  const allVerified = citations.length > 0 && verified === citations.length;
  const ready = allVerified && factsConfirmed && pendingChanges === 0;
  // Strict transition: Approve is locked until every citation is verified and the facts are confirmed.
  return (
    <section className="card" aria-labelledby="appr">
      <h2 id="appr">Approval {approved ? <span className="badge ok">✓ Approved</span> : <span className="badge wn">Draft</span>}</h2>
      <div className={`bn ${approved ? 'g' : ''}`}>{approved ? 'Approved by the responsible lawyer.' : 'AI-suggested draft — requiring lawyer verification. Not legal advice until approved.'}</div>
      <ul className="checks" aria-live="polite">
        <li>{factsConfirmed ? '✓' : '✕'} Extracted facts confirmed</li>
        <li>{pendingChanges === 0 ? '✓' : '✕'} Tracked changes resolved ({pendingChanges} pending)</li>
        <li>{allVerified ? '✓' : '✕'} Citations verified ({verified}/{citations.length})</li>
      </ul>
      <button className="btn" disabled={!ready || approved} onClick={() => setOpen(true)}>Approve report</button>
      {!ready && <p className="m">Approval unlocks once facts are confirmed, every citation is verified and all tracked changes are resolved.</p>}
      {open && (
        <Modal title="Approve this report?" onClose={() => setOpen(false)}>
          <p>I have reviewed the analysis and all citations, and accept professional responsibility for this report.</p>
          <div className="row"><button className="btn" onClick={() => { setApproved(true); setOpen(false); }}>Approve as responsible lawyer</button><button className="btn s" onClick={() => setOpen(false)}>Cancel</button></div>
        </Modal>)}
    </section>
  );
}
