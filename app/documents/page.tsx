'use client';
import { useEffect, useRef, useState, type DragEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Workspace } from '@/components/Layout/Workspace';
import { FactItem } from '@/components/Matter/FactItem';
import { legalApi } from '@/services/legalApi';
import { useFacts } from '@/lib/useFacts';
import { PIPELINE, type FactState, type LegalDocument } from '@/types/legal';
const OK = /\.(pdf|docx|txt)$/i;
export default function DocumentsPage() {
  const qc = useQueryClient(); const input = useRef<HTMLInputElement>(null);
  const [docs, setDocs] = useState<LegalDocument[]>([]); const [drag, setDrag] = useState(false); const [msg, setMsg] = useState('');
  const { facts: list, state: setFact, edit } = useFacts();
  const patch = (id: string, p: Partial<LegalDocument>) => setDocs((d) => d.map((x) => (x.id === id ? { ...x, ...p } : x)));
  const existing = useQuery({ queryKey: ['documents'], queryFn: legalApi.listDocuments });
  useEffect(() => { if (existing.data?.length) setDocs((d) => (d.length ? d : existing.data)); }, [existing.data]); // documents already stored on the server
  const run = (id: string, file: File) => legalApi.processDocument(file, (step, error) => { patch(id, { step, error }); if (step === 'Complete') qc.invalidateQueries({ queryKey: ['facts'] }); });
  const add = (files: FileList | File[]) => {
    const bad: string[] = [];
    Array.from(files).forEach((f) => {
      if (!OK.test(f.name)) return bad.push(f.name);
      const id = crypto.randomUUID(); const format = f.name.split('.').pop()!.toUpperCase() as LegalDocument['format'];
      setDocs((d) => [{ id, name: f.name, format, step: 'Uploading' }, ...d]); files2.set(id, f); run(id, f);
    });
    setMsg(bad.length ? `Unsupported file type: ${bad.join(', ')}. Alpha accepts PDF, DOCX and TXT.` : '');
  };
  const onDrop = (e: DragEvent) => { e.preventDefault(); setDrag(false); add(e.dataTransfer.files); };
  const lowOpen = list.some((f) => f.confidence < 70 && f.state === 'draft');
  return (
    <Workspace title="Documents & AI analysis">
      <div className={`dz ${drag ? 'drag' : ''}`} role="button" tabIndex={0} aria-label="Upload documents: drag and drop or press Enter to browse"
        onClick={() => input.current?.click()} onKeyDown={(e) => e.key === 'Enter' && input.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={onDrop}>
        <b>Drag and drop files, or click to browse</b><p className="m">PDF, DOCX, TXT · size limit to be confirmed</p>
        <input ref={input} type="file" hidden multiple accept=".pdf,.docx,.txt" onChange={(e) => e.target.files && add(e.target.files)} />
      </div>
      <p role="status" aria-live="polite" className="er">{msg}</p>
      <ul className="card docs">{docs.length === 0 && <li className="m">No documents yet. Upload one to start analysis. </li>}
        {docs.map((d) => (
          <li key={d.id}><b>{d.name}</b> <span className="m">{d.format}</span>
            <ol className="steps" aria-label={`Processing steps for ${d.name}`}>{PIPELINE.map((s, i) => {
              const at = PIPELINE.indexOf(d.step === 'Failed' ? 'Parsing OCR' : d.step);
              return <li key={s} aria-current={s === d.step ? 'step' : undefined} className={d.step === 'Failed' && i === at ? 'bad' : i < at || d.step === 'Complete' ? 'done' : i === at ? 'now' : ''}>{s}</li>;
            })}</ol>
            {d.error && <p role="alert" className="er">{d.error} {files2.has(d.id) ? <button className="btn s sm" onClick={() => { patch(d.id, { step: 'Uploading', error: undefined }); run(d.id, files2.get(d.id)!); }}>Retry</button> : <span className="m">Upload the file again to retry.</span>}</p>}
          </li>))}
      </ul>
      <div className="bn">AI-suggested draft — requiring lawyer verification. Research will not use unconfirmed items.</div>
      <ul className="facts">{list.map((f) => <FactItem key={f.id} fact={f} onState={(s) => setFact.mutate({ id: f.id, s })} onEdit={(text) => edit.mutate({ id: f.id, text })} />)}</ul>
      {lowOpen && <p className="m er" role="status">Resolve the low-confidence item (confirm, edit or dismiss) before continuing.</p>}
    </Workspace>
  );
}
const files2 = new Map<string, File>(); // kept so a failed upload can be retried without re-selecting the file
