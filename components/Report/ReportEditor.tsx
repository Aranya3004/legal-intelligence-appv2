'use client';
import { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { CitationNode, CommentMark, Insertion, Deletion } from '@/lib/editorExtensions';
import { collectChanges, resolveAll, resolveChange, typeTracked, deleteTracked, type Change } from '@/lib/trackChanges';
import { TrackedChanges } from './TrackedChanges';
import { sanitizeReport } from '@/lib/sanitize';
import { Modal } from '@/components/ui/Modal';
import type { ReportComment } from '@/types/legal';
interface Props { html: string; editable: boolean; onChange: (html: string) => void; onAddComment: (c: ReportComment) => void; onPending?: (n: number) => void }
export default function ReportEditor({ html, editable, onChange, onAddComment, onPending }: Props) {
  const [open, setOpen] = useState(false); const [text, setText] = useState(''); const [track, setTrack] = useState(false); const [changes, setChanges] = useState<Change[]>([]);
  const tracking = useRef(false); tracking.current = track && editable; // read inside editor handlers
  const editor = useEditor({
    extensions: [StarterKit, CitationNode, CommentMark, Insertion, Deletion], content: sanitizeReport(html), editable, immediatelyRender: false,
    onUpdate: ({ editor }) => { onChange(editor.getHTML()); const c = collectChanges(editor.state.doc); setChanges(c); onPending?.(c.length); },
    editorProps: {
      handleTextInput: (v, f, t, txt) => (tracking.current ? typeTracked(v, f, t, txt) : false),
      handleKeyDown: (v, e) => (tracking.current && (e.key === 'Backspace' || e.key === 'Delete') ? deleteTracked(v, e.key) : false),
      handlePaste: (v, e) => { const t = e.clipboardData?.getData('text/plain'); if (!tracking.current || !t) return false; const { from, to } = v.state.selection; return typeTracked(v, from, to, t); },
      attributes: { role: 'textbox', 'aria-multiline': 'true', 'aria-label': 'Research report editor' } },
  });
  useEffect(() => { editor?.setEditable(editable); }, [editor, editable]);
  if (!editor) return <p role="status">Loading editor…</p>;
  const hasSel = !editor.state.selection.empty;
  const comment = () => {
    const { from, to } = editor.state.selection; if (from === to || !text.trim()) return;
    const threadId = crypto.randomUUID();
    onAddComment({ id: crypto.randomUUID(), threadId, quote: editor.state.doc.textBetween(from, to, ' '), author: 'You', text: text.trim(), resolved: false });
    editor.chain().focus().setMark('comment', { threadId }).run(); setText(''); setOpen(false);
  };
  const tb = (label: string, run: () => void, active = false) => <button type="button" className={`btn s sm ${active ? 'act' : ''}`} aria-pressed={active} disabled={!editable} onClick={run}>{label}</button>;
  return (
    <div>
      <div className="toolbar" role="toolbar" aria-label="Formatting">
        {tb('Bold', () => editor.chain().focus().toggleBold().run(), editor.isActive('bold'))}
        {tb('Italic', () => editor.chain().focus().toggleItalic().run(), editor.isActive('italic'))}
        {tb('Heading', () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive('heading'))}
        {tb('Bullets', () => editor.chain().focus().toggleBulletList().run(), editor.isActive('bulletList'))}
        <label className="trk"><input type="checkbox" checked={track} disabled={!editable} onChange={(e) => setTrack(e.target.checked)} /> Track changes</label>
        <button type="button" className="btn s sm" disabled={!hasSel} onClick={() => setOpen(true)}>Comment on selection</button>
      </div>
      <EditorContent editor={editor} className="legal-doc" />
      <TrackedChanges changes={changes} onResolve={(c, a) => resolveChange(editor, c, a)} onResolveAll={(a) => resolveAll(editor, changes, a)} />
      <p className="m">Tracking covers typing, deleting and pasting text. Paragraph breaks and formatting changes are not tracked.</p>
      {open && (
        <Modal title="Add review comment" onClose={() => setOpen(false)}>
          <label className="field">Comment<textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} /></label>
          <div className="row"><button className="btn" disabled={!text.trim()} onClick={comment}>Post comment</button><button className="btn s" onClick={() => setOpen(false)}>Cancel</button></div>
        </Modal>)}
    </div>
  );
}
