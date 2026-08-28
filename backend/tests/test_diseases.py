from fastapi.testclient import TestClient

from backend.app.main import app

client = TestClient(app)


def test_get_disease():
    response = client.get("/diseases/1")

    assert response.status_code == 200

    data = response.json()

    assert "disease" in data
    assert "targets" in data


def test_missing_disease():
    response = client.get("/diseases/999999")

    assert response.status_code == 404