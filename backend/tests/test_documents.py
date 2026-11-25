import io, os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

TEXT = "This Supply Agreement is made between Meridian Supplies Ltd and Alpha Traders Ltd. It was signed on 12 March 2024. Clause 7.2 requires delivery within 30 days. The price is BDT 500,000."
def up(c, name, data): return c.post("/api/documents", files={"file": (name, data)})
def done(c, id_): return c.get(f"/api/documents/{id_}").json()   # TestClient runs background tasks before returning

def test_txt_end_to_end(client):
    r = up(client, "agreement.txt", TEXT.encode()); assert r.status_code == 201
    d = done(client, r.json()["id"]); assert d["step"] == "Complete" and d["error"] is None
    facts = [f for f in client.get("/api/facts").json() if f["source"].startswith("agreement.txt")]
    groups = {f["group"] for f in facts}
    assert {"Important dates", "Contract clauses", "Key facts", "Parties"} <= groups
    assert all(f["state"] == "draft" for f in facts)                              # AI output is always a draft

def test_docx(client):
    from docx import Document
    buf = io.BytesIO(); doc = Document(); doc.add_paragraph(TEXT); doc.save(buf)
    d = done(client, up(client, "a.docx", buf.getvalue()).json()["id"]); assert d["step"] == "Complete"

def _font(n=34):
    for f in ("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", "/usr/share/fonts/dejavu/DejaVuSans.ttf"):
        if os.path.exists(f): return ImageFont.truetype(f, n)
    return ImageFont.load_default()

def scanned_pdf(lines):
    img = Image.new("RGB", (1600, 400), "white"); dr = ImageDraw.Draw(img)
    for i, l in enumerate(lines): dr.text((40, 40 + i * 60), l, fill="black", font=_font())
    b = io.BytesIO(); img.save(b, "PDF", resolution=200); return b.getvalue()          # image-only PDF = no text layer

def test_scanned_pdf_uses_ocr(client):
    pdf = scanned_pdf(["Agreement signed on 12 March 2024.", "Clause 7.2 requires delivery within 30 days.", "The price is BDT 500,000."])
    d = done(client, up(client, "scan.pdf", pdf).json()["id"]); assert d["step"] == "Complete", d
    facts = [f for f in client.get("/api/facts").json() if f["source"].startswith("scan.pdf")]
    assert any("Clause 7.2" in f["text"] for f in facts), facts
    assert all(f["confidence"] < 90 for f in facts)                                # OCR output is never shown as high-confidence digital text

def test_rejections(client, monkeypatch):
    assert up(client, "x.exe", b"MZ").status_code == 415
    assert up(client, "fake.pdf", b"not a pdf").status_code == 422
    assert up(client, "empty.txt", b"").status_code == 422
    monkeypatch.setenv("MAX_UPLOAD_MB", "1")
    assert up(client, "big.txt", b"a" * (1024 * 1024 + 5)).status_code == 413
    r = up(client, "../../evil.txt", TEXT.encode()); assert r.status_code == 201 and r.json()["name"] == "evil.txt"   # path stripped

def test_corrupt_and_blank_fail_gracefully(client):
    d = done(client, up(client, "bad.pdf", b"%PDF-1.4 garbage").json()["id"])
    assert d["step"] == "Failed" and "could not be read" in d["error"]
    d = done(client, up(client, "blank.txt", b"   \n ").json()["id"]); assert d["step"] == "Failed" and "No readable text" in d["error"]

def test_delete_removes_file_and_facts(client):
    d = up(client, "gone.txt", TEXT.encode()).json(); path = next(Path(os.environ["UPLOAD_DIR"]).glob(f"{d['id']}.*"))
    assert path.exists() and any(f["source"].startswith("gone.txt") for f in client.get("/api/facts").json())
    assert client.delete(f"/api/documents/{d['id']}").status_code == 204
    assert not path.exists() and not any(f["source"].startswith("gone.txt") for f in client.get("/api/facts").json())
    assert client.get(f"/api/documents/{d['id']}").status_code == 404
