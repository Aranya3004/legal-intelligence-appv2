'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { legalApi } from '@/services/legalApi';
import type { FactState } from '@/types/legal';
/** One place for fact reads/writes so Documents and the matter AI Analysis tab stay consistent. */
export function useFacts() {
  const qc = useQueryClient(); const q = useQuery({ queryKey: ['facts'], queryFn: legalApi.getFacts });
  const inv = () => qc.invalidateQueries({ queryKey: ['facts'] });
  const state = useMutation({ mutationFn: ({ id, s }: { id: string; s: FactState }) => legalApi.setFactState(id, s), onSuccess: inv });
  const edit = useMutation({ mutationFn: ({ id, text }: { id: string; text: string }) => legalApi.updateFactText(id, text), onSuccess: inv });
  return { facts: q.data ?? [], isLoading: q.isLoading, state, edit };
}
