'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Workspace } from '@/components/Layout/Workspace';
import { CitationTable } from '@/components/Citation/CitationTable';
import { CitationInspector } from '@/components/Citation/CitationInspector';
import { ApprovalWorkflow } from '@/components/Report/ApprovalWorkflow';
import { legalApi } from '@/services/legalApi';
import { useUI } from '@/store/ui';
import type { CitationStatus } from '@/types/legal';
export default function CitationsPage() {
  const qc = useQueryClient(); const { selectedCitationId, select } = useUI();
  const cites = useQuery({ queryKey: ['citations'], queryFn: legalApi.getCitations });
  const facts = useQuery({ queryKey: ['facts'], queryFn: legalApi.getFacts });
  const set = useMutation({ mutationFn: ({ id, s }: { id: string; s: CitationStatus }) => legalApi.setCitationStatus(id, s), onSuccess: () => qc.invalidateQueries({ queryKey: ['citations'] }) });
  const list = cites.data ?? []; const current = list.find((c) => c.id === selectedCitationId) ?? list[0];
  const factsConfirmed = !!facts.data && facts.data.every((f) => f.state !== 'draft');
  return (
    <Workspace title="Citation review">
      {cites.isLoading && <p role="status">Loading citations…</p>}
      {cites.isError && <p role="alert" className="er">Couldn’t load citations. Your work is saved; retry.</p>}
      {set.isError && <p role="alert" className="er">{(set.error as Error).message}</p>}
      {current && (
        <div className="split">
          <div className="card"><CitationTable citations={list} selectedId={current.id} onSelect={select} /></div>
          <div>
            <CitationInspector key={current.id} citation={current} busy={set.isPending} onSet={(s) => set.mutate({ id: current.id, s })} />
            <ApprovalWorkflow citations={list} factsConfirmed={factsConfirmed} />
          </div>
        </div>)}
    </Workspace>
  );
}
