export function confidenceLevel(v: number) { return v >= 85 ? 'high' : v >= 70 ? 'mid' : 'low'; }
const COLOR = { high: '#059669', mid: '#D97706', low: '#DC2626' } as const; // fills are non-text; text uses AA-safe tokens
export function ConfidenceBar({ value }: { value: number }) {
  const lv = confidenceLevel(value);
  return (
    <div className="conf">
      <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value} aria-label="Extraction confidence" className="bar">
        <i style={{ width: `${value}%`, background: COLOR[lv], transition: 'width .4s, background .3s' }} />
      </div>
      <span className={`t-${lv}`}>{value}% · {lv === 'high' ? 'High' : lv === 'mid' ? 'Moderate' : '⚠ Low — review required'}</span>
    </div>
  );
}
