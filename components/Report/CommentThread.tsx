import type { ReportComment } from '@/types/legal';
export function CommentThread({ comments, onResolve }: { comments: ReportComment[]; onResolve: (id: string) => void }) {
  return (
    <section className="card" aria-labelledby="cmts">
      <h2 id="cmts">Review comments ({comments.filter((c) => !c.resolved).length} open)</h2>
      {comments.length === 0 && <p className="m">No comments yet. Select text in the report and choose “Comment on selection”.</p>}
      <ul className="clist">{comments.map((c) => (
        <li key={c.id} className={c.resolved ? 'x' : ''}>
          <p className="src">“{c.quote}”</p><p><b>{c.author}</b>: {c.text}</p>
          <button className="btn t sm" onClick={() => onResolve(c.id)}>{c.resolved ? 'Reopen' : 'Resolve'}</button>
        </li>))}</ul>
    </section>
  );
}
