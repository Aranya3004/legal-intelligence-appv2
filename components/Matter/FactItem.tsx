'use client';
import { useState } from 'react';
import type { FactItem as Fact, FactState } from '@/types/legal';
import { ConfidenceBar } from '@/components/ui/ConfidenceBar';
export function FactItem({ fact, onState, onEdit }: { fact: Fact; onState: (s: FactState) => void; onEdit: (text: string) => void }) {
  const [editing, setEditing] = useState(false); const [draft, setDraft] = useState(fact.text);
  const empty = !draft.trim();
  return (
    <li className={`it ${fact.state === 'dismissed' ? 'x' : ''}`}>
      <span className="lb">{fact.group} · {fact.state === 'confirmed' ? '✓ Confirmed' : fact.state === 'dismissed' ? 'Dismissed' : 'AI-suggested draft'}</span>
      {editing ? (
        <div>
          <label className="field">Edit extracted item<textarea rows={2} value={draft} aria-invalid={empty} className={empty ? 'bad' : ''} onChange={(e) => setDraft(e.target.value)} /></label>
          {empty && <p role="alert" className="er">Text can’t be empty.</p>}
          <div className="row"><button className="btn sm" disabled={empty} onClick={() => { onEdit(draft); setEditing(false); }}>Save and confirm</button><button className="btn s sm" onClick={() => { setDraft(fact.text); setEditing(false); }}>Cancel</button></div>
        </div>
      ) : (<>
        <p>{fact.text}</p><p className="src">{fact.source}</p><ConfidenceBar value={fact.confidence} />
        <div className="row">
          <button className="btn s sm" onClick={() => onState('confirmed')} disabled={fact.state === 'confirmed'}>Confirm</button>
          <button className="btn s sm" onClick={() => { setDraft(fact.text); setEditing(true); }}>Edit</button>
          <button className="btn t sm" onClick={() => onState(fact.state === 'dismissed' ? 'draft' : 'dismissed')}>{fact.state === 'dismissed' ? 'Restore' : 'Dismiss'}</button>
        </div></>)}
    </li>
  );
}
