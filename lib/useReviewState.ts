'use client';
import { useQuery } from '@tanstack/react-query';
import { legalApi } from '@/services/legalApi';
export function useReviewState() {
  const citations = useQuery({ queryKey: ['citations'], queryFn: legalApi.getCitations });
  const facts = useQuery({ queryKey: ['facts'], queryFn: legalApi.getFacts });
  return { citations: citations.data ?? [], factsConfirmed: !!facts.data && facts.data.every((f) => f.state !== 'draft'), loading: citations.isLoading || facts.isLoading };
}
