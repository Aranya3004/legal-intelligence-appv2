"""Legal Intelligence API (Alpha): FastAPI + SQLAlchemy. SQLite for local dev, PostgreSQL in production (DATABASE_URL)."""
import os, uuid
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Literal, Optional
from fastapi import BackgroundTasks, Depends, FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session
import models as M
from db import Base, SessionLocal, engine, get_db
from processing import process_document
from seed import seed

@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(engine)  # production: manage schema changes with Alembic migrations
    with SessionLocal() as db: seed(db)
    yield

app = FastAPI(title="Legal Intelligence API", version="0.2.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001"
    ).split(","),
    allow_methods=["*"],
    allow_headers=["*"]
)

Domain = Literal["Company", "Contract", "Partnership"]
CitationStatus = Literal["Verified", "Needs Review", "Source Unavailable", "Potential Mismatch"]
FactState = Literal["draft", "confirmed", "dismissed"]
class NewMatter(BaseModel):
    name: str = Field(min_length=3, max_length=120); domain: Domain = "Contract"
class CitationPatch(BaseModel): status: CitationStatus
class FactPatch(BaseModel):
    state: Optional[FactState] = None; text: Optional[str] = Field(default=None, min_length=1, max_length=2000)

def get_or_404(db: Session, model, id_: str, what: str):
    row = db.get(model, id_)
    if not row: raise HTTPException(404, f"{what} not found")
    return row

@app.get("/api/health")
def health(db: Session = Depends(get_db)): db.execute(select(1)); return {"ok": True}
@app.get("/api/matters")
def list_matters(db: Session = Depends(get_db)): return [m.dict() for m in db.scalars(select(M.Matter).order_by(M.Matter.seq.desc()))]
@app.get("/api/matters/{id_}")
def get_matter(id_: str, db: Session = Depends(get_db)): return get_or_404(db, M.Matter, id_, "Matter").dict()
@app.post("/api/matters", status_code=201)
def create_matter(b: NewMatter, db: Session = Depends(get_db)):
    seq = (db.scalar(select(func.max(M.Matter.seq))) or 0) + 1
    m = M.Matter(id=f"MTR-2026-{seq}", seq=seq, name=b.name.strip(), status="Active", updated="05 Nov 2026", documents=0, domain=b.domain)
    db.add(m); db.commit(); return m.dict()
@app.get("/api/metrics")
def metrics(db: Session = Depends(get_db)):
    n = lambda t: db.scalar(select(func.count()).select_from(t))
    return [["Total Matters", n(M.Matter)], ["Documents Uploaded", n(M.Document)], ["Research Queries", 31], ["Reports Generated", 9]]
@app.get("/api/activity")
def activity(db: Session = Depends(get_db)):
    docs = db.scalars(select(M.Document).order_by(M.Document.created.desc()).limit(3)).all()
    return [f"{d.name}: {d.step.lower()}" for d in docs] or ["No recent activity"]
@app.get("/api/citations")
def list_citations(db: Session = Depends(get_db)): return [c.dict() for c in db.scalars(select(M.Citation).order_by(M.Citation.pos))]
@app.patch("/api/citations/{id_}")
def patch_citation(id_: str, b: CitationPatch, db: Session = Depends(get_db)):
    c = get_or_404(db, M.Citation, id_, "Citation")
    if c.status == "Source Unavailable" and b.status == "Verified": raise HTTPException(409, "A citation with no retrievable source cannot be verified.")
    c.status = b.status; db.commit(); return c.dict()
@app.get("/api/facts")
def list_facts(db: Session = Depends(get_db)): return [f.dict() for f in db.scalars(select(M.Fact).order_by(M.Fact.seq))]
@app.patch("/api/facts/{id_}")
def patch_fact(id_: str, b: FactPatch, db: Session = Depends(get_db)):
    f = get_or_404(db, M.Fact, id_, "Fact")
    if b.state is None and b.text is None: raise HTTPException(422, "Provide state or text.")
    if b.text is not None: f.text, f.state = b.text.strip(), "confirmed"  # lawyer-authored edit
    if b.state is not None: f.state = b.state
    db.commit(); return f.dict()
@app.get("/api/report-sections")
def report_sections(db: Session = Depends(get_db)): return [s.dict() for s in db.scalars(select(M.Section).order_by(M.Section.pos))]
@app.get("/api/search")
def search(q: str = Query(default=""), domain: str = "all", db: Session = Depends(get_db)):
    if not q.strip(): return []
    stmt = select(M.Source).order_by(M.Source.id)
    if domain != "all": stmt = stmt.where(M.Source.domain == domain)
    return [s.dict() for s in db.scalars(stmt)]
@app.post("/api/saved/{id_}", status_code=204)
def save_source(id_: str, db: Session = Depends(get_db)):
    get_or_404(db, M.Source, id_, "Source")
    if not db.get(M.SavedSource, id_): db.add(M.SavedSource(source_id=id_)); db.commit()

# ---------------- documents ----------------
MAGIC = {"PDF": b"%PDF-", "DOCX": b"PK\x03\x04"}
def upload_dir() -> Path: p = Path(os.getenv("UPLOAD_DIR", "./uploads")); p.mkdir(parents=True, exist_ok=True); return p
def max_bytes() -> int: return int(float(os.getenv("MAX_UPLOAD_MB", "20")) * 1024 * 1024)

@app.post("/api/documents", status_code=201)
async def upload_document(bg: BackgroundTasks, file: UploadFile = File(...), db: Session = Depends(get_db)):
    name = os.path.basename(file.filename or "").strip()[:255]
    ext = name.rsplit(".", 1)[-1].lower() if "." in name else ""
    if ext not in ("pdf", "docx", "txt"): raise HTTPException(415, "Unsupported file type. Alpha accepts PDF, DOCX and TXT.")
    data, limit = bytearray(), max_bytes()
    while chunk := await file.read(1024 * 1024):
        data += chunk
        if len(data) > limit: raise HTTPException(413, f"File is too large (limit {limit // 1024 // 1024} MB).")
    if not data: raise HTTPException(422, "The file is empty.")
    fmt = ext.upper()
    if fmt in MAGIC and not data.startswith(MAGIC[fmt]): raise HTTPException(422, "The file content doesn’t match its extension.")
    doc_id = str(uuid.uuid4()); path = upload_dir() / f"{doc_id}.{ext}"  # server-generated name: never trust the client's path
    path.write_bytes(bytes(data))
    doc = M.Document(id=doc_id, name=name, format=fmt, step="Uploading", path=str(path), size=len(data))
    db.add(doc); db.commit(); bg.add_task(process_document, doc_id); return doc.dict()
@app.get("/api/documents")
def list_documents(db: Session = Depends(get_db)): return [d.dict() for d in db.scalars(select(M.Document).order_by(M.Document.created.desc()))]
@app.get("/api/documents/{id_}")
def get_document(id_: str, db: Session = Depends(get_db)): return get_or_404(db, M.Document, id_, "Document").dict()
@app.delete("/api/documents/{id_}", status_code=204)
def delete_document(id_: str, db: Session = Depends(get_db)):
    d = get_or_404(db, M.Document, id_, "Document")
    Path(d.path).unlink(missing_ok=True)  # honour deletion: remove the stored file and everything extracted from it
    db.execute(delete(M.Fact).where(M.Fact.document_id == id_)); db.delete(d); db.commit()
