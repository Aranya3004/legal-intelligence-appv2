'use client';
import { useState } from 'react';
import { Workspace } from '@/components/Layout/Workspace';
import { StatusBadge } from '@/components/Citation/StatusBadge';
import { ConfidenceBar } from '@/components/ui/ConfidenceBar';
import { Modal } from '@/components/ui/Modal';
export default function DesignSystem() {
  const [open, setOpen] = useState(false);
  const S = ({ t, children }: { t: string; children: React.ReactNode }) => <section className="card"><h2>{t}</h2>{children}</section>;
  return (
    <Workspace title="Design system">
      <S t="Buttons"><div className="row"><button className="btn">Primary</button><button className="btn s">Secondary</button><button className="btn t">Tertiary</button><button className="btn" disabled>Disabled</button></div></S>
      <S t="Status badges"><div className="row"><span className="badge ok">Ready</span><span className="badge wn">In Review</span><span className="badge pri">Processing</span><span className="badge wn">Needs Attention</span><span className="badge ok">✓ Completed</span><span className="badge er">✕ Failed</span></div>
        <div className="row"><StatusBadge status="Verified" /><StatusBadge status="Needs Review" /><StatusBadge status="Source Unavailable" /><StatusBadge status="Potential Mismatch" /></div></S>
      <S t="Confidence visualizer"><ConfidenceBar value={91} /><ConfidenceBar value={78} /><ConfidenceBar value={62} /></S>
      <S t="Form elements"><div className="g2"><label className="field">Text input<input defaultValue="Sample" /></label><label className="field">Dropdown<select><option>Option</option></select></label><label className="field">Text area<textarea defaultValue="Text" /></label><label className="field">Error state<input className="bad" defaultValue="Invalid" aria-invalid /><span className="er">Required field</span></label><label className="field inl"><input type="checkbox" defaultChecked /> Checkbox</label><label className="field inl"><input type="radio" defaultChecked /> Radio</label></div></S>
      <S t="Cards and feedback"><div className="g2"><div className="card"><span className="m">Metric</span><div className="big">12</div></div><div className="card empty">Empty state: nothing here yet.</div><div className="bn">Error: upload failed. Your record is kept; retry.</div><div className="bn g">Success: facts confirmed.</div></div><p role="status"><span className="spin" /> Loading state</p><button className="btn s" onClick={() => setOpen(true)}>Open confirmation modal</button></S>
      <S t="Upload states"><ol className="steps"><li className="now">Uploading</li><li>Parsing OCR</li><li>Extracting Entities</li><li>Complete</li></ol><ol className="steps"><li className="done">Uploading</li><li className="bad">Parsing OCR</li></ol></S>
      {open && <Modal title="Confirm action" onClose={() => setOpen(false)}><p>Explains the impact before a destructive action.</p><button className="btn" onClick={() => setOpen(false)}>Close</button></Modal>}
    </Workspace>
  );
}
