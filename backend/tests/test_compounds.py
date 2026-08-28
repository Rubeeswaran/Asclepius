from fastapi.testclient import TestClient

from backend.app.main import app

client = TestClient(app)


def test_get_compound():
    response = client.get("/compounds/1")

    assert response.status_code == 200

    data = response.json()

    assert "compound" in data
    assert "targets" in data


def test_missing_compound():
    response = client.get("/compounds/999999")

    assert response.status_code == 404