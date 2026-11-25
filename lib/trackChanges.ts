import type { Editor } from '@tiptap/core';
import type { Node as PMNode } from '@tiptap/pm/model';
import { TextSelection, type Transaction } from '@tiptap/pm/state';
import type { EditorView } from '@tiptap/pm/view';
export interface Change { id: string; type: 'insertion' | 'deletion'; text: string; author: string; date: string; ranges: [number, number][] }
const AUTHOR = 'You';
export function collectChanges(doc: PMNode): Change[] {
  const map = new Map<string, Change>();
  doc.descendants((node, pos) => {
    if (!node.isText) return;
    node.marks.forEach((m) => {
      if (m.type.name !== 'insertion' && m.type.name !== 'deletion') return;
      const id = m.attrs.changeId as string;
      const c: Change = map.get(id) ?? { id, type: m.type.name as Change['type'], text: '', author: m.attrs.author, date: m.attrs.date, ranges: [] };
      c.text += node.text ?? ''; c.ranges.push([pos, pos + node.nodeSize]); map.set(id, c);
    });
  });
  return [...map.values()];
}
const apply = (editor: Editor, items: { c: Change; r: [number, number] }[], accept: boolean) => {
  const tr = editor.state.tr; const { schema } = editor.state;
  // Highest position first so earlier ranges stay valid while deleting.
  [...items].sort((a, b) => b.r[0] - a.r[0]).forEach(({ c, r }) => {
    const remove = (c.type === 'insertion') !== accept; // reject an insertion, or accept a deletion → text goes away
    if (remove) tr.delete(r[0], r[1]); else tr.removeMark(r[0], r[1], schema.marks[c.type]);
  });
  editor.view.dispatch(tr);
};
export const resolveChange = (e: Editor, c: Change, accept: boolean) => apply(e, c.ranges.map((r) => ({ c, r })), accept);
export const resolveAll = (e: Editor, cs: Change[], accept: boolean) => apply(e, cs.flatMap((c) => c.ranges.map((r) => ({ c, r }))), accept);

const mark = (view: EditorView, type: 'insertion' | 'deletion', pos: number) => {
  const $p = view.state.doc.resolve(pos); // adjacent typing by the same author joins one change
  const near = [$p.nodeBefore, $p.nodeAfter].flatMap((n) => (n ? [...n.marks] : [])).find((m) => m.type.name === type && m.attrs.author === AUTHOR);
  return view.state.schema.marks[type].create({ changeId: near?.attrs.changeId ?? crypto.randomUUID(), author: AUTHOR, date: new Date().toISOString() });
};
/** Mark [from,to) as deleted; text the same author inserted is genuinely removed instead. */
function markDeletion(view: EditorView, tr: Transaction, from: number, to: number) {
  const own: [number, number][] = []; const del = mark(view, 'deletion', from);
  view.state.doc.nodesBetween(from, to, (node, pos) => {
    if (!node.isText) return;
    const s = Math.max(pos, from), e = Math.min(pos + node.nodeSize, to);
    if (node.marks.some((m) => m.type.name === 'insertion' && m.attrs.author === AUTHOR)) own.push([s, e]);
    else if (!node.marks.some((m) => m.type.name === 'deletion')) tr.addMark(s, e, del);
  });
  own.sort((a, b) => b[0] - a[0]).forEach(([s, e]) => tr.delete(s, e));
}
export function typeTracked(view: EditorView, from: number, to: number, text: string): boolean {
  const tr = view.state.tr;
  if (from !== to) markDeletion(view, tr, from, to);
  const at = tr.mapping.map(to);
  tr.insert(at, view.state.schema.text(text, [mark(view, 'insertion', at)]));
  tr.setSelection(TextSelection.near(tr.doc.resolve(at + text.length)));
  view.dispatch(tr); return true;
}
export function deleteTracked(view: EditorView, key: 'Backspace' | 'Delete'): boolean {
  const { from, to, empty } = view.state.selection; let f = from, t = to;
  if (empty) { if (key === 'Backspace') f = from - 1; else t = from + 1; }
  if (f < 0 || !view.state.doc.textBetween(f, t)) return false; // block joins etc. use the default behaviour (not tracked)
  const tr = view.state.tr; markDeletion(view, tr, f, t);
  tr.setSelection(TextSelection.near(tr.doc.resolve(tr.mapping.map(key === 'Backspace' ? f : t))));
  view.dispatch(tr); return true;
}
