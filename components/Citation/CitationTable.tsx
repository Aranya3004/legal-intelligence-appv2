import type { Citation } from '@/types/legal';
import { StatusBadge } from './StatusBadge';
export function CitationTable({ citations, selectedId, onSelect }: { citations: Citation[]; selectedId: string | null; onSelect: (id: string) => void }) {
  return (
    <div className="tw"><table>
      <caption className="sr">Citations in the research report</caption>
      <thead><tr><th scope="col">#</th><th scope="col">Source</th><th scope="col">Location</th><th scope="col">Status</th></tr></thead>
      <tbody>{citations.map((c, i) => (
        <tr key={c.id} aria-selected={c.id === selectedId} className={c.id === selectedId ? 'on' : ''}>
          <td>{i + 1}</td>
          <td><button className="linkrow" onClick={() => onSelect(c.id)}>{c.type}: {c.name}</button></td>
          <td>{c.location}</td><td><StatusBadge status={c.status} /></td>
        </tr>))}</tbody>
    </table></div>
  );
}
