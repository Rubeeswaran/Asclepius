from fastapi.testclient import TestClient

from backend.app.main import app

client = TestClient(app)


def test_disease_evidence():
    response = client.get("/evidence/disease/1")

    assert response.status_code == 200

    data = response.json()

    assert "disease_id" in data
    assert "evidence" in data


def test_target_evidence():
    response = client.get("/evidence/target/1")

    assert response.status_code == 200

    data = response.json()

    assert "target_id" in data
    assert "evidence" in data