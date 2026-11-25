# AI Legal Intelligence Platform — Alpha
Frontend: Next.js 14 + TypeScript · Backend: FastAPI + SQLAlchemy (SQLite dev / PostgreSQL prod) · Editor: Tiptap

## Run locally
    # 1) backend (SQLite by default; needs Tesseract + Poppler installed for OCR)
    cd backend && pip install -r requirements.txt && uvicorn main:app --reload --port 8000
    # 2) frontend
    cp .env.example .env.local        # delete NEXT_PUBLIC_API_URL to use the offline mock instead
    npm install && npm run dev        # http://localhost:3000

## PostgreSQL / Docker
    docker compose up --build         # Postgres + API with Tesseract (compose file not run in the authoring sandbox)
Or set DATABASE_URL=postgresql://user:pw@host/db. Tables are created on startup; use Alembic for schema changes in production.
Uploads go to UPLOAD_DIR (use a persistent volume). Limits: MAX_UPLOAD_MB (default 20). OCR language: OCR_LANG (Deployment: eng+ben + tesseract-ocr-ben).

## Tests
    npm test            # typecheck · WCAG token contrast · track-changes · axe accessibility (17) · API (10)
    npm run test:pg     # backend suite against a real embedded PostgreSQL

## Notes
- All legal text is fictional sample data. Extraction is rule-based (dates, amounts, clauses, parties) and always a DRAFT; LLM issue-suggestion awaits provider selection (SRS TBD-003).
- PDF handling uses pypdf + pdf2image/Poppler + Tesseract (PyMuPDF was avoided deliberately: AGPL licence).
- Alpha scope: English, individual workspace. Bangla and firm workspaces are Deployment (June 2027).
- Browser-only checks still to do by hand: real-browser axe/Lighthouse, 200% zoom/reflow, screen-reader pass.
