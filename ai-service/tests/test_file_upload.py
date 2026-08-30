import io
import pytest
from PIL import Image
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def create_sample_image():
    """Create a minimal PNG test image in memory"""
    img = Image.new("RGB", (200, 200), color=(255, 255, 255))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return buf


def test_image_upload_and_processing():
    """Test uploading an image file via multipart/form-data"""
    img_buf = create_sample_image()
    files = {"file": ("patta_sample.png", img_buf, "image/png")}
    data = {
        "document_type": "PATTA",
        "language": "ta",
        "enable_fallback": "true",
    }

    response = client.post("/api/v1/process-document", files=files, data=data)
    assert response.status_code == 200

    body = response.json()
    assert body["success"] is True
    assert "processing_id" in body
    assert body["filename"] == "patta_sample.png"
    assert body["document_type"] == "PATTA"
    assert "ocr" in body
    assert "extracted_data" in body
    assert "confidence" in body
    assert "processing" in body
    assert "survey_number" in body["extracted_data"]
    assert "owner_name" in body["extracted_data"]
    assert body["confidence"]["overall"] > 0


def test_demo_scenario_trigger_via_upload():
    """Test demo scenario execution via form parameter"""
    img_buf = create_sample_image()
    files = {"file": ("demo_deed.jpg", img_buf, "image/jpeg")}
    data = {
        "document_type": "auto",
        "demo_scenario": "GIS_AREA_MISMATCH",
        "enable_fallback": "true",
    }

    response = client.post("/api/v1/process-document", files=files, data=data)
    assert response.status_code == 200

    body = response.json()
    assert body["success"] is True
    assert body["extracted_data"]["area"] == 2.45  # Matches GIS mismatch scenario
