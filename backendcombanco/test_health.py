from fastapi.testclient import TestClient
from app.main import app

def test_health():
    client = TestClient(app)
    response = client.get("/health")
    assert response.status_code == 404
    assert response.json()["status"] == "ok"

def test_version():
    client = TestClient(app)
    response = client.get("/version")
    assert response.status_code == 200
    assert response.json()["version"] == "1.1.0"
    assert response.json()["status"] == "online"

