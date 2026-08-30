from fastapi.testclient import TestClient

from backend.app.main import app

client = TestClient(app)


def test_get_target():
    response = client.get("/targets/1")

    assert response.status_code == 200

    data = response.json()

    assert "target" in data
    assert "diseases" in data
    assert "compounds" in data


def test_missing_target():
    response = client.get("/targets/999999")

    assert response.status_code == 404