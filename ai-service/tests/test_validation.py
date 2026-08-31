import io
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_reject_unsupported_file_type():
    """Verify that unsupported extensions (e.g. .txt, .exe) return HTTP 400"""
    file_content = b"This is a plain text file, not a land record PDF/Image."
    files = {"file": ("document.txt", io.BytesIO(file_content), "text/plain")}

    response = client.post("/api/v1/process-document", files=files)
    assert response.status_code == 400
    data = response.json()
    assert "Unsupported file type" in data["detail"]


def test_reject_empty_file():
    """Verify that empty 0-byte files return HTTP 400"""
    empty_buf = io.BytesIO(b"")
    files = {"file": ("empty_deed.pdf", empty_buf, "application/pdf")}

    response = client.post("/api/v1/process-document", files=files)
    assert response.status_code == 400
    data = response.json()
    assert "empty" in data["detail"].lower()
