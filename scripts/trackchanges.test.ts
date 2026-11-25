import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!doctype html><div id="e"></div>'); const g = globalThis as any;
g.window = dom.window; g.document = dom.window.document; g.Node = dom.window.Node; g.HTMLElement = dom.window.HTMLElement;
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true });
g.getComputedStyle = dom.window.getComputedStyle; g.MutationObserver = dom.window.MutationObserver; g.DOMParser = dom.window.DOMParser;
(dom.window.document as any).elementFromPoint = () => null; (dom.window.Range.prototype as any).getClientRects = () => []; (dom.window.Range.prototype as any).getBoundingClientRect = () => ({});
const run = async () => {
  const { Editor } = await import('@tiptap/core'); const SK = (await import('@tiptap/starter-kit')).default;
  const { Insertion, Deletion } = await import('../lib/editorExtensions');
  const T = await import('../lib/trackChanges');
  const ed = new Editor({ element: document.getElementById('e')!, extensions: [SK, Insertion, Deletion], content: '<p>Hello world</p>' });
  const ok = (c: boolean, m: string) => { if (!c) { console.error('FAIL:', m); process.exit(1); } console.log('ok  -', m); };
  const text = () => ed.getText();
  // 1. tracked typing
  T.typeTracked(ed.view, 12, 12, '!'); ok(text() === 'Hello world!', 'typed text inserted'); ok(T.collectChanges(ed.state.doc).length === 1 && T.collectChanges(ed.state.doc)[0].type === 'insertion', 'one insertion recorded');
  // 2. tracked deletion keeps text but marks it
  ed.view.dispatch(ed.state.tr.setSelection((await import('@tiptap/pm/state')).TextSelection.create(ed.state.doc, 7, 12)));
  T.deleteTracked(ed.view, 'Backspace'); ok(text().includes('world'), 'deleted text is retained (marked)'); const ch = T.collectChanges(ed.state.doc); ok(ch.some((c) => c.type === 'deletion' && c.text === 'world'), 'deletion recorded');
  // 3. backspace over own insertion truly removes it
  ed.view.dispatch(ed.state.tr.setSelection((await import('@tiptap/pm/state')).TextSelection.create(ed.state.doc, 13)));
  T.deleteTracked(ed.view, 'Backspace'); ok(!text().includes('!'), 'own insertion removed outright');
  // 4. reject deletion restores, accept deletion removes
  const del = T.collectChanges(ed.state.doc).find((c) => c.type === 'deletion')!;
  T.resolveChange(ed, del, false); ok(T.collectChanges(ed.state.doc).length === 0 && text() === 'Hello world', 'reject deletion restores text');
  T.typeTracked(ed.view, 12, 12, '?'); const ins = T.collectChanges(ed.state.doc)[0];
  T.resolveChange(ed, ins, false); ok(text() === 'Hello world', 'reject insertion removes text');
  T.typeTracked(ed.view, 12, 12, '?'); T.resolveAll(ed, T.collectChanges(ed.state.doc), true); ok(text() === 'Hello world?' && T.collectChanges(ed.state.doc).length === 0, 'accept all keeps text, clears marks');
  console.log('track-changes OK'); process.exit(0);
};
run();
