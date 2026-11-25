def test_matters_and_create(client):
    assert len(client.get("/api/matters").json()) == 300
    r = client.post("/api/matters", json={"name": "Test Co — Dispute", "domain": "Company"})
    assert r.status_code == 201 and r.json()["id"] == "MTR-2026-301"
    assert client.get("/api/matters").json()[0]["id"] == "MTR-2026-301"          # newest first
    assert client.post("/api/matters", json={"name": "x"}).status_code == 422
    assert client.get("/api/matters/NOPE").status_code == 404

def test_citation_rules(client):
    assert client.patch("/api/citations/c4", json={"status": "Verified"}).status_code == 409
    assert client.patch("/api/citations/c2", json={"status": "Verified"}).json()["status"] == "Verified"
    assert client.get("/api/citations").json()[1]["status"] == "Verified"         # persisted

def test_fact_edit_and_validation(client):
    f = client.patch("/api/facts/f3", json={"text": "Edited issue"}).json()
    assert f["state"] == "confirmed" and f["text"] == "Edited issue"
    assert client.patch("/api/facts/f3", json={}).status_code == 422
    assert client.patch("/api/facts/f3", json={"text": ""}).status_code == 422

def test_search_report_save(client):
    assert client.get("/api/search?q=x&domain=Contract").json()[0]["id"] == "s1"
    assert client.get("/api/search?q=").json() == []
    assert len(client.get("/api/report-sections").json()) == 9
    assert client.get("/api/report-sections").json()[3]["citationIds"] == ["c1", "c2"]
    assert client.post("/api/saved/s1").status_code == 204 and client.post("/api/saved/s1").status_code == 204
    assert client.post("/api/saved/nope").status_code == 404
