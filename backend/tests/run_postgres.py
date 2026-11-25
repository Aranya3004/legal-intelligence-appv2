"""Runs the same test-suite against a real PostgreSQL (embedded via pgserver) — no Docker needed."""
import os, sys, tempfile, pgserver, pytest
srv = pgserver.get_server(tempfile.mkdtemp())
os.environ["DATABASE_URL"] = srv.get_uri()
code = pytest.main([os.path.dirname(__file__), "-q", "-p", "no:cacheprovider"])
srv.cleanup(); sys.exit(code)
