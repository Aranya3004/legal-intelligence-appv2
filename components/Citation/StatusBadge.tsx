import type { CitationStatus } from '@/types/legal';
const MAP: Record<CitationStatus, [string, string]> = { Verified: ['ok', '✓'], 'Needs Review': ['wn', '!'], 'Source Unavailable': ['mu', '–'], 'Potential Mismatch': ['er', '⚠'] };
export function StatusBadge({ status }: { status: CitationStatus }) {
  const [cls, icon] = MAP[status];
  return <span className={`badge ${cls}`}><span aria-hidden="true">{icon}</span> {status}</span>; // text label always present: colour is never the only cue
}
