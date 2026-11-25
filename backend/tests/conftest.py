import os, sys, tempfile
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
os.environ.setdefault("DATABASE_URL", f"sqlite:///{tempfile.mkdtemp()}/t.db")
os.environ["UPLOAD_DIR"] = tempfile.mkdtemp()
import pytest
from fastapi.testclient import TestClient
from db import Base, engine
from main import app

@pytest.fixture()
def client():
    Base.metadata.drop_all(engine)
    with TestClient(app) as c:  # lifespan recreates tables and seeds
        yield c
