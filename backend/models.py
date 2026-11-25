from datetime import datetime, timezone
from sqlalchemy import JSON, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from db import Base

_col = mapped_column

class Matter(Base):
    __tablename__ = "matters"
    id: Mapped[str] = _col(String(32), primary_key=True); seq: Mapped[int] = _col(Integer, index=True)
    name: Mapped[str] = _col(String(120)); status: Mapped[str] = _col(String(20)); updated: Mapped[str] = _col(String(20))
    documents: Mapped[int] = _col(Integer, default=0); domain: Mapped[str] = _col(String(20))
    def dict(self): return dict(id=self.id, name=self.name, status=self.status, updated=self.updated, documents=self.documents, domain=self.domain)

class Citation(Base):
    __tablename__ = "citations"
    id: Mapped[str] = _col(String(32), primary_key=True); pos: Mapped[int] = _col(Integer)
    type: Mapped[str] = _col(String(10)); name: Mapped[str] = _col(String(200)); location: Mapped[str] = _col(String(100)); status: Mapped[str] = _col(String(30))
    claim: Mapped[str] = _col(Text); passage: Mapped[str] = _col(Text); explanation: Mapped[str] = _col(Text)
    def dict(self): return dict(id=self.id, type=self.type, name=self.name, location=self.location, status=self.status, claim=self.claim, passage=self.passage, explanation=self.explanation)

class Document(Base):
    __tablename__ = "documents"
    id: Mapped[str] = _col(String(36), primary_key=True); name: Mapped[str] = _col(String(255)); format: Mapped[str] = _col(String(8))
    step: Mapped[str] = _col(String(32)); error: Mapped[str | None] = _col(Text, nullable=True); path: Mapped[str] = _col(String(500)); size: Mapped[int] = _col(Integer)
    created: Mapped[datetime] = _col(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    def dict(self): return dict(id=self.id, name=self.name, format=self.format, step=self.step, error=self.error)

class Fact(Base):
    __tablename__ = "facts"
    id: Mapped[str] = _col(String(32), primary_key=True); seq: Mapped[int] = _col(Integer, index=True)
    group: Mapped[str] = _col(String(50)); text: Mapped[str] = _col(Text); confidence: Mapped[int] = _col(Integer); source: Mapped[str] = _col(String(300)); state: Mapped[str] = _col(String(12))
    document_id: Mapped[str | None] = _col(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=True)
    def dict(self): return dict(id=self.id, group=self.group, text=self.text, confidence=self.confidence, source=self.source, state=self.state)

class Source(Base):
    __tablename__ = "sources"
    id: Mapped[str] = _col(String(32), primary_key=True); kind: Mapped[str] = _col(String(10)); title: Mapped[str] = _col(String(200)); meta: Mapped[str] = _col(String(200))
    passage: Mapped[str] = _col(Text); relevance: Mapped[int] = _col(Integer); explanation: Mapped[str] = _col(Text); domain: Mapped[str] = _col(String(20))
    def dict(self): return dict(id=self.id, kind=self.kind, title=self.title, meta=self.meta, passage=self.passage, relevance=self.relevance, explanation=self.explanation, domain=self.domain)

class Section(Base):
    __tablename__ = "sections"
    id: Mapped[str] = _col(String(32), primary_key=True); pos: Mapped[int] = _col(Integer); title: Mapped[str] = _col(String(200)); html: Mapped[str] = _col(Text); citation_ids: Mapped[list] = _col(JSON)
    def dict(self): return dict(id=self.id, title=self.title, html=self.html, citationIds=self.citation_ids)

class SavedSource(Base):
    __tablename__ = "saved_sources"
    source_id: Mapped[str] = _col(String(32), primary_key=True)
