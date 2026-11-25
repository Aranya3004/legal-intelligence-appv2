from sqlalchemy import func, select
from sqlalchemy.orm import Session
import seed_data as d
from models import Citation, Fact, Matter, Section, Source

def seed(db: Session) -> None:
    if db.scalar(select(func.count()).select_from(Matter)) == 0:
        for i, m in enumerate(d.MATTERS):  # MATTERS is newest-first; seq descends from 300
            db.add(Matter(id=m["id"], seq=300 - i, name=m["name"], status=m["status"], updated=m["updated"], documents=m["documents"], domain=m["domain"]))
        for i, c in enumerate(d.CITATIONS): db.add(Citation(pos=i, **c))
        for i, f in enumerate(d.FACTS): db.add(Fact(seq=i + 1, **f))
        for s in d.SOURCES: db.add(Source(**s))
        for i, s in enumerate(d.SECTIONS): db.add(Section(id=s["id"], pos=i, title=s["title"], html=s["html"], citation_ids=s["citationIds"]))
        db.commit()
