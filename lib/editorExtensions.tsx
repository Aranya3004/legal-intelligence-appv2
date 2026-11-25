'use client';
import { Node, Mark, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { legalApi } from '@/services/legalApi';
import { useUI } from '@/store/ui';
function CitationView({ node }: NodeViewProps) {
  const { data } = useQuery({ queryKey: ['citations'], queryFn: legalApi.getCitations });
  const i = data ? data.findIndex((c) => c.id === node.attrs.id) : -1;
  const c = i >= 0 ? data![i] : undefined; const ok = c?.status === 'Verified';
  return (
    <NodeViewWrapper as="span" contentEditable={false} className={`cite ${ok ? 'ok' : 'wn'}`}>
      <Link href="/citations" onClick={() => useUI.getState().select(node.attrs.id)} title={c ? `${c.name} — ${c.status}` : 'Unknown citation'}>[{i + 1}] {ok ? '✓ Verified' : '! Unverified'}</Link>
    </NodeViewWrapper>
  );
}
/** Inline citation badge: live status comes from the citation query, so it can't drift from the review screen. */
export const CitationNode = Node.create({
  name: 'citation', group: 'inline', inline: true, atom: true,
  addAttributes() { return { id: { default: '' } }; },
  parseHTML() { return [{ tag: 'span[data-citation]', getAttrs: (el) => ({ id: (el as HTMLElement).getAttribute('data-citation') }) }]; },
  renderHTML({ node }) { return ['span', mergeAttributes({ 'data-citation': node.attrs.id })]; },
  addNodeView() { return ReactNodeViewRenderer(CitationView); },
});
export const CommentMark = Mark.create({
  name: 'comment',
  addAttributes() { return { threadId: { default: null, parseHTML: (el) => el.getAttribute('data-thread'), renderHTML: (a) => ({ 'data-thread': a.threadId }) } }; },
  parseHTML() { return [{ tag: 'mark[data-thread]' }]; },
  renderHTML({ HTMLAttributes }) { return ['mark', mergeAttributes(HTMLAttributes, { class: 'cm' }), 0]; },
});

const tcAttrs = () => ({
  changeId: { default: null, parseHTML: (el: HTMLElement) => el.getAttribute('data-change'), renderHTML: (a: Record<string, any>) => ({ 'data-change': a.changeId }) },
  author: { default: 'You', parseHTML: (el: HTMLElement) => el.getAttribute('data-author'), renderHTML: (a: Record<string, any>) => ({ 'data-author': a.author }) },
  date: { default: '', parseHTML: (el: HTMLElement) => el.getAttribute('data-date'), renderHTML: (a: Record<string, any>) => ({ 'data-date': a.date }) },
});
// priority > Strike so <del data-change> is parsed as a tracked deletion, not strikethrough.
export const Insertion = Mark.create({ name: 'insertion', inclusive: false, priority: 1000, addAttributes: tcAttrs, parseHTML() { return [{ tag: 'ins[data-change]' }]; }, renderHTML({ HTMLAttributes }) { return ['ins', mergeAttributes(HTMLAttributes, { class: 'tc-ins' }), 0]; } });
export const Deletion = Mark.create({ name: 'deletion', inclusive: false, priority: 1000, addAttributes: tcAttrs, parseHTML() { return [{ tag: 'del[data-change]' }]; }, renderHTML({ HTMLAttributes }) { return ['del', mergeAttributes(HTMLAttributes, { class: 'tc-del' }), 0]; } });
