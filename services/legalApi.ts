import type { ReportSection, ResearchSource, Citation, CitationStatus, FactItem, FactState, LegalDocument, Matter, PipelineStep } from '@/types/legal';
// Mock layer: swap these functions for real HTTP calls without touching components.
// All legal text is fictional sample data — never real authority.
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
let citations: Citation[] = [
  { id: 'c1', type: 'Statute', name: 'Contract Act 1872 (sample passage)', location: 'Illustrative section A', status: 'Verified', claim: 'Damages are available for direct loss caused by breach.', passage: 'Sample text: a party who suffers loss from a breach may claim compensation for loss that naturally arose from the breach.', explanation: 'The passage supports the claim.' },
  { id: 'c2', type: 'Statute', name: 'Companies Act 1994 (sample passage)', location: 'Illustrative section B', status: 'Needs Review', claim: 'Directors owe duties to the company.', passage: 'Sample text: directors must act in good faith in the interests of the company.', explanation: 'Plausible, but the version date is unconfirmed.' },
  { id: 'c3', type: 'Case', name: 'Alpha Traders Ltd v. Meridian Supplies (fictional)', location: 'Para. 14', status: 'Potential Mismatch', claim: 'Late delivery is a material breach of the agreement.', passage: 'Sample text: delay in payment was held not to defeat the contract absent an express time stipulation.', explanation: 'The passage concerns payment delay, so it may not support this claim.' },
  { id: 'c4', type: 'Case', name: 'Delta Mills v. Orion Foods (fictional)', location: 'Para. 9', status: 'Source Unavailable', claim: 'Repeated late delivery can justify termination.', passage: 'Source passage could not be retrieved.', explanation: 'No explanation: the source is unavailable.' },
];
let facts: FactItem[] = [
  { id: 'f1', group: 'Parties', text: 'Meridian Supplies Ltd (buyer); Alpha Traders Ltd (seller)', confidence: 96, source: 'Supply_Agreement_2024.pdf · p.1', state: 'draft' },
  { id: 'f2', group: 'Key facts', text: 'Three consignments arrived 18–25 days after the agreed date.', confidence: 78, source: 'Email_Thread.txt · msg 4', state: 'draft' },
  { id: 'f3', group: 'Potential legal issues', text: 'Whether the liquidated damages clause is enforceable.', confidence: 62, source: 'Supply_Agreement_2024.pdf · p.9', state: 'draft' },
];
const CLIENTS = ['Meridian Supplies', 'Harbour Foods', 'Rahman & Sen', 'Kestrel Logistics', 'Nila Textiles', 'Orion Traders', 'Delta Mills', 'Sundarban Exports'];
const KINDS = ['Supply Agreement Dispute', 'Director Liability Review', 'Partnership Dissolution', 'Shareholder Agreement', 'Breach of Contract Claim'];
const STAT: Matter['status'][] = ['Active', 'In Review', 'Completed'];
const matters: Matter[] = Array.from({ length: 300 }, (_, i) => ({ id: `MTR-2026-${String(300 - i).padStart(3, '0')}`, name: `${CLIENTS[i % 8]} — ${KINDS[i % 5]}`, status: STAT[i % 3], updated: `${String(1 + (i % 28)).padStart(2, '0')} Oct 2026`, documents: 3 + (i % 9) }));
const sources: ResearchSource[] = [
  { id: 's1', kind: 'Statute', title: 'Contract Act 1872', meta: 'Illustrative section A (sample)', passage: 'Sample text: a party who suffers loss from a breach may claim compensation for loss that naturally arose from it.', relevance: 92, explanation: 'Suggests direct loss from late delivery may be compensable; the lawyer must check the real section.', domain: 'Contract' },
  { id: 's2', kind: 'Statute', title: 'Companies Act 1994', meta: 'Illustrative section B (sample)', passage: 'Sample text: directors must act in good faith in the interests of the company.', relevance: 61, explanation: 'Marginal relevance unless director conduct is in issue.', domain: 'Company' },
  { id: 's3', kind: 'Statute', title: 'Partnership Act 1932', meta: 'Illustrative section C (sample)', passage: 'Sample text: partners are jointly liable for acts of the firm.', relevance: 44, explanation: 'Low relevance to a buyer–seller dispute.', domain: 'Partnership' },
  { id: 's4', kind: 'Case', title: 'Alpha Traders Ltd v. Meridian Supplies (fictional)', meta: 'Sample High Court Division · 2025 (fictional)', passage: 'Sample text: delay in payment was held not to defeat the contract absent an express time stipulation.', relevance: 88, explanation: 'Possibly distinguishable: it concerns payment, not delivery.', domain: 'Contract' },
  { id: 's5', kind: 'Case', title: 'Delta Mills v. Orion Foods (fictional)', meta: 'Sample High Court Division · 2024 (fictional)', passage: 'Sample text: repeated late delivery may justify termination where timing was essential.', relevance: 81, explanation: 'Supports a materiality argument if the delivery clause is time-critical.', domain: 'Contract' },
];
const saved = new Set<string>();
const sections: ReportSection[] = [
  { id: 'r1', title: 'Executive Summary', html: 'The buyer may have a claim for damages for repeated late deliveries. Strength depends on whether time was essential.', citationIds: [] },
  { id: 'r2', title: 'Background and Facts', html: 'Three consignments arrived 18–25 days after the agreed date under a supply agreement.', citationIds: [] },
  { id: 'r3', title: 'Legal Issues', html: '(1) Materiality of late delivery. (2) Enforceability of the liquidated damages clause.', citationIds: [] },
  { id: 'r4', title: 'Applicable Laws and Statutes', html: 'Compensation for loss caused by breach is addressed in sample section A.', citationIds: ['c1', 'c2'] },
  { id: 'r5', title: 'Relevant Judicial Decisions', html: 'Sample decisions point both ways on delay; one may be distinguishable.', citationIds: ['c3', 'c4'] },
  { id: 'r6', title: 'Legal Analysis', html: '<em>AI-generated:</em> materiality likely turns on the contract’s timing wording and the history of delay.', citationIds: ['c1'] },
  { id: 'r7', title: 'Potential Arguments', html: 'For the buyer: repeated delay shows a pattern. For the seller: timing was not stipulated as essential.', citationIds: ['c3'] },
  { id: 'r8', title: 'Limitations and Unresolved Issues', html: 'One source is unavailable and clause 11 has not been tested against authority.', citationIds: ['c4'] },
  { id: 'r9', title: 'References and Citations', html: 'See the citation list; every reference must be verified before approval.', citationIds: [] },
];
export interface LegalApi {
  getMatters(): Promise<Matter[]>; getMatter(id: string): Promise<Matter | undefined>; createMatter(name: string, domain: string): Promise<Matter>;
  getMetrics(): Promise<[string, number][]>; getActivity(): Promise<string[]>; searchSources(q: string, domain: string): Promise<ResearchSource[]>; saveToMatter(id: string): Promise<void>;
  getReportSections(): Promise<ReportSection[]>; getCitations(): Promise<Citation[]>; setCitationStatus(id: string, status: CitationStatus): Promise<Citation>;
  getFacts(): Promise<FactItem[]>; setFactState(id: string, state: FactState): Promise<void>; updateFactText(id: string, text: string): Promise<void>;
  listDocuments(): Promise<LegalDocument[]>;
  processDocument(file: File, onStep: (s: PipelineStep, error?: string) => void): Promise<void>;
}
const mockApi: LegalApi = {
  async getMatters(): Promise<Matter[]> { await wait(150); return matters; },
  async createMatter(name: string, domain: string): Promise<Matter> {
    await wait(300); if (name.trim().length < 3) throw new Error('Matter name must be at least 3 characters.');
    const m: Matter = { id: `MTR-2026-${301 + matters.length - 300}`, name: name.trim(), status: 'Active', updated: '05 Nov 2026', documents: 0, domain: domain as Matter['domain'] };
    matters.unshift(m); return m;
  },
  async getMatter(id: string): Promise<Matter | undefined> { await wait(100); return matters.find((m) => m.id === id); },
  async getMetrics() { await wait(100); return [['Total Matters', matters.length], ['Documents Uploaded', 48], ['Research Queries', 31], ['Reports Generated', 9]] as [string, number][]; },
  async getActivity() { await wait(100); return ['Email_Thread.txt is processing', 'Delivery_Scan_07.pdf failed extraction', 'Research run on 3 domains']; },
  async searchSources(q: string, domain: string): Promise<ResearchSource[]> { await wait(700); return q.trim() ? sources.filter((s) => domain === 'all' || s.domain === domain) : []; },
  async saveToMatter(id: string): Promise<void> { await wait(200); saved.add(id); },
  async updateFactText(id: string, text: string): Promise<void> { await wait(150); if (!text.trim()) throw new Error('Text is required.'); facts = facts.map((f) => (f.id === id ? { ...f, text: text.trim(), state: 'confirmed' } : f)); },
  async listDocuments(): Promise<LegalDocument[]> { return []; },
  async getReportSections(): Promise<ReportSection[]> { await wait(150); return sections; },
  async getCitations(): Promise<Citation[]> { await wait(200); return citations.map((c) => ({ ...c })); },
  async setCitationStatus(id: string, status: CitationStatus): Promise<Citation> {
    await wait(250);
    const c = citations.find((x) => x.id === id);
    if (!c) throw new Error('Citation not found');
    if (c.status === 'Source Unavailable' && status === 'Verified') throw new Error('A citation with no retrievable source cannot be verified.');
    c.status = status; return { ...c };
  },
  async getFacts(): Promise<FactItem[]> { await wait(150); return facts.map((f) => ({ ...f })); },
  async setFactState(id: string, state: FactState): Promise<void> { await wait(150); facts = facts.map((f) => (f.id === id ? { ...f, state } : f)); },
  /** Simulated pipeline. A filename containing "fail" fails at OCR so error recovery can be exercised. */
  async processDocument(file: File, onStep: (s: PipelineStep, error?: string) => void): Promise<void> {
    onStep('Uploading'); await wait(700);
    onStep('Parsing OCR'); await wait(900);
    if (/fail/i.test(file.name)) { onStep('Failed', 'The scanned pages could not be read. Your upload was kept; retry or replace the file.'); return; }
    onStep('Extracting Entities'); await wait(900);
    onStep('Complete');
  },
};

// ---- HTTP implementation (FastAPI). Used when NEXT_PUBLIC_API_URL is set; otherwise the mock above runs offline.
const BASE = process.env.NEXT_PUBLIC_API_URL;
async function http<T>(path: string, init?: RequestInit, allow404 = false): Promise<T> {
  const r = await fetch(`${BASE}${path}`, { headers: { 'Content-Type': 'application/json' }, ...init });
  if (allow404 && r.status === 404) return undefined as T;
  if (!r.ok) { let m = r.statusText; try { const d = (await r.json()).detail; m = typeof d === 'string' ? d : 'Request failed'; } catch {} throw new Error(m); }
  return r.status === 204 ? (undefined as T) : r.json();
}
const patch = (path: string, body: unknown) => http<never>(path, { method: 'PATCH', body: JSON.stringify(body) });
const httpApi: LegalApi = {
  getMatters: () => http('/api/matters'), getMatter: (id) => http(`/api/matters/${encodeURIComponent(id)}`, undefined, true),
  createMatter: (name, domain) => http('/api/matters', { method: 'POST', body: JSON.stringify({ name, domain }) }),
  getMetrics: () => http('/api/metrics'), getActivity: () => http('/api/activity'),
  searchSources: (q, domain) => http(`/api/search?q=${encodeURIComponent(q)}&domain=${encodeURIComponent(domain)}`),
  saveToMatter: (id) => http(`/api/saved/${encodeURIComponent(id)}`, { method: 'POST' }),
  getReportSections: () => http('/api/report-sections'), getCitations: () => http('/api/citations'),
  setCitationStatus: (id, status) => patch(`/api/citations/${id}`, { status }),
  getFacts: () => http('/api/facts'), setFactState: async (id, state) => { await patch(`/api/facts/${id}`, { state }); },
  updateFactText: async (id, text) => { await patch(`/api/facts/${id}`, { text }); },
  listDocuments: () => http('/api/documents'),
  /** Real upload: the server validates, stores, runs extraction/OCR in the background; we poll the persisted step. */
  async processDocument(file, onStep) {
    onStep('Uploading');
    const fd = new FormData(); fd.append('file', file);
    let r: Response;
    try { r = await fetch(`${BASE}/api/documents`, { method: 'POST', body: fd }); } catch { return onStep('Failed', 'Couldn’t reach the server. Check your connection and retry.'); }
    if (!r.ok) { let m = 'Upload failed.'; try { const d = (await r.json()).detail; if (typeof d === 'string') m = d; } catch {} return onStep('Failed', m); }
    let d: LegalDocument = await r.json();
    for (let i = 0; i < 150; i++) {
      onStep(d.step, d.error ?? undefined);
      if (d.step === 'Complete' || d.step === 'Failed') return;
      await wait(800); d = await http<LegalDocument>(`/api/documents/${d.id}`);
    }
    onStep('Failed', 'Processing is taking too long. Your file was kept; try again.');
  },
};
export const legalApi: LegalApi = BASE ? httpApi : mockApi;
