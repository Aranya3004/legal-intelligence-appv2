import type { ResearchSource } from '@/types/legal';
export function SourceCard({ s, selected, onSelect }: { s: ResearchSource; selected: boolean; onSelect: () => void }) {
  return (
    <li><button className={`it srcard ${selected ? 'sel' : ''}`} aria-pressed={selected} onClick={onSelect}>
      <b>{s.title}</b><span className="m"> · {s.meta}</span>
      <span className="src">{s.passage}</span>
      <span className="conf"><span className="bar" role="meter" aria-valuenow={s.relevance} aria-valuemin={0} aria-valuemax={100} aria-label="Relevance"><i style={{ width: `${s.relevance}%`, background: 'var(--pri)' }} /></span>{s.relevance}% relevance</span>
    </button></li>
  );
}
