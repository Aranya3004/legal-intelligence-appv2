const norm = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
const words = (s: string) => s.split(/\s+/).filter(Boolean);
export interface Token { w: string; hit: boolean }
/** Word-overlap comparison, used only as a visual aid — it never verifies a citation. */
export function diffWords(claim: string, passage: string) {
  const sig = (s: string) => new Set(words(s).map(norm).filter((x) => x.length > 3));
  const a = sig(claim), b = sig(passage);
  const mark = (s: string, other: Set<string>): Token[] => words(s).map((w) => ({ w, hit: other.has(norm(w)) }));
  const shared = [...a].filter((x) => b.has(x)).length;
  return { claim: mark(claim, b), passage: mark(passage, a), overlap: a.size ? Math.round((shared / a.size) * 100) : 0 };
}
