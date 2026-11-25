'use client';
import { useMutation } from '@tanstack/react-query';
import type { ResearchSource } from '@/types/legal';
import { SafeText } from '@/components/ui/SafeText';
import { legalApi } from '@/services/legalApi';
export function SourcePreview({ s }: { s: ResearchSource }) {
  const save = useMutation({ mutationFn: () => legalApi.saveToMatter(s.id) });
  return (
    <aside className="card" aria-label="Source preview">
      <h2>{s.title}</h2>
      <span className="lb">Original source (illustrative sample)</span><p className="src">{s.passage}</p>
      <div className="ai"><span className="lb">AI-generated explanation</span><SafeText html={s.explanation} /></div>
      <div className="row"><button className="btn" disabled={save.isPending || save.isSuccess} onClick={() => save.mutate()}>{save.isSuccess ? '✓ Saved to matter' : 'Save to matter'}</button></div>
      <p role="status" className="m">{save.isSuccess ? 'Saved to the active matter.' : ''}</p>
    </aside>
  );
}
