from fastapi.testclient import TestClient

from backend.app.main import app

client = TestClient(app)


def test_search():
    response = client.get("/search?q=liver")

    assert response.status_code == 200

    data = response.json()

    assert "query" in data
    assert "diseases" in data
    assert "targets" in data
    assert "compounds" in data