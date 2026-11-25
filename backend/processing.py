"""Document text extraction (digital + OCR) and rule-based entity extraction.
Entity extraction is deliberately rule-based: the LLM provider is still TBD (SRS TBD-003). Output is always a DRAFT for lawyer review."""
import io, os, re, uuid
from dataclasses import dataclass
from pathlib import Path
from sqlalchemy import func, select
from db import SessionLocal
from models import Document, Fact

class ProcessingError(Exception):
    """Message is shown to the user, so keep it plain-language."""

@dataclass
class Page: no: int | None; text: str; conf: float  # conf: 0-100 (digital text = 100)

OCR_LANG = os.getenv("OCR_LANG", "eng")  # Deployment: "eng+ben" once the Bangla traineddata is installed
OCR_MIN_CHARS = 25

def _ocr(img) -> tuple[str, float]:
    try:
        import pytesseract
        d = pytesseract.image_to_data(img, lang=OCR_LANG, output_type=pytesseract.Output.DICT)
    except Exception as e:  # missing binary/language data
        raise ProcessingError("This scanned document needs OCR, but the OCR engine is unavailable on the server.") from e
    words = [(w, float(c)) for w, c in zip(d["text"], d["conf"]) if w.strip() and float(c) >= 0]
    return " ".join(w for w, _ in words), (sum(c for _, c in words) / len(words) if words else 0.0)

def extract_pages(path: str, fmt: str) -> list[Page]:
    try:
        if fmt == "PDF":
            from pypdf import PdfReader
            r = PdfReader(path)
            if r.is_encrypted: raise ProcessingError("This PDF is password-protected. Remove the password and upload it again.")
            out = []
            for i, pg in enumerate(r.pages, 1):
                t = (pg.extract_text() or "").strip()
                if len(t) >= OCR_MIN_CHARS: out.append(Page(i, t, 100.0)); continue
                from pdf2image import convert_from_path
                img = convert_from_path(path, dpi=200, first_page=i, last_page=i)[0]
                t, c = _ocr(img); out.append(Page(i, t, c))
            return out
        if fmt == "DOCX":
            from docx import Document as Docx
            d = Docx(path)
            t = "\n".join([p.text for p in d.paragraphs] + [c.text for tb in d.tables for row in tb.rows for c in row.cells])
            return [Page(None, t, 100.0)]
        return [Page(None, Path(path).read_bytes().decode("utf-8-sig"), 100.0)]
    except ProcessingError: raise
    except UnicodeDecodeError as e: raise ProcessingError("The text file isn’t valid UTF-8.") from e
    except Exception as e: raise ProcessingError("The file could not be read. It may be damaged; try re-saving or re-scanning it.") from e

MONTH = r"(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)"
RULES = [
    ("Important dates", re.compile(rf"\b(?:\d{{1,2}}(?:st|nd|rd|th)?\s+{MONTH}\.?,?\s+\d{{4}}|{MONTH}\s+\d{{1,2}},?\s+\d{{4}}|\d{{4}}-\d{{2}}-\d{{2}}|\d{{1,2}}/\d{{1,2}}/\d{{4}})", re.I), 90),
    ("Key facts", re.compile(r"(?:BDT|Tk\.?|৳|USD|\$)\s?\d[\d,]*(?:\.\d+)?", re.I), 88),
    ("Contract clauses", re.compile(r"\b(?:Clause|Section|Article)\s+\d+(?:\.\d+)*", re.I), 82),
    ("Parties", re.compile(r"\bbetween\s+(.{3,80}?)\s+and\s+(.{3,80}?)(?=[\s,(.;])", re.I | re.S), 80),
]

def _snippet(text: str, s: int, e: int) -> str:
    a = max(text.rfind(". ", 0, s) + 1, text.rfind("\n", 0, s) + 1, 0)
    ends = [x for x in (text.find(". ", e), text.find("\n", e)) if x != -1]
    b = min(ends) + 1 if ends else len(text)
    return re.sub(r"\s+", " ", text[a:b]).strip()[:220]

def extract_facts(name: str, pages: list[Page]) -> list[dict]:
    out, seen = [], set()
    for pg in pages:
        for group, rx, base in RULES:
            for m in rx.finditer(pg.text):
                t = _snippet(pg.text, m.start(), m.end())
                if (group, t) in seen or len(t) < 8: continue
                seen.add((group, t))
                conf = max(5, min(99, round(base * pg.conf / 100)))  # OCR quality lowers confidence → low-confidence warning in the UI
                out.append(dict(group=group, text=t, confidence=conf, source=f"{name} · p.{pg.no}" if pg.no else name))
    return out[:15]

def process_document(doc_id: str) -> None:
    """Runs in a background task with its own session; every step is persisted so the UI can poll it."""
    with SessionLocal() as db:
        doc = db.get(Document, doc_id)
        def step(s, err=None):
            doc.step, doc.error = s, err; db.commit()
        try:
            step("Parsing OCR"); pages = extract_pages(doc.path, doc.format)
            if not any(p.text.strip() for p in pages): raise ProcessingError("No readable text was found in this document.")
            step("Extracting Entities"); facts = extract_facts(doc.name, pages)
            seq = (db.scalar(select(func.max(Fact.seq))) or 0) + 1
            for i, f in enumerate(facts): db.add(Fact(id="x" + uuid.uuid4().hex[:12], seq=seq + i, state="draft", document_id=doc.id, **f))
            step("Complete")
        except ProcessingError as e: db.rollback(); step("Failed", str(e))
        except Exception: db.rollback(); step("Failed", "Processing failed unexpectedly. Your upload was kept; try again.")
