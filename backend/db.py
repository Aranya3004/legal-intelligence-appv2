import os
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

def _url() -> str:
    u = os.getenv("DATABASE_URL", "sqlite:///./legal.db")  # PostgreSQL in production, e.g. postgresql://user:pw@host/db
    return u.replace("postgresql://", "postgresql+psycopg://", 1) if u.startswith("postgresql://") else u

URL = _url()
engine = create_engine(URL, pool_pre_ping=True, connect_args={"check_same_thread": False} if URL.startswith("sqlite") else {})
SessionLocal = sessionmaker(engine, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

def get_db():
    with SessionLocal() as s:
        yield s
