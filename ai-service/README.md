# BHOOMI AI — Document Processing Microservice

FastAPI AI microservice responsible for:
- Image Preprocessing & Contrast Enhancement (CLAHE, Deskew, Bilateral Denoising)
- Document Classification (Patta, Chitta, Adangal, Sale Deed)
- Multilingual Gemini OCR (Tamil + English) with transient error retry & fallback across candidate models
- Structured Entity Extraction (Survey No, Owner, Area, Boundaries)
- Confidence Scoring & Quality Estimation
- Deterministic Fallback Engine for reliable hackathon demonstrations

---

## 🛠️ Windows Quickstart Setup

### 1. Navigate to AI Service Directory
```powershell
cd "c:\Users\ABISHEK\Videos\sih backend\ai-service"
```

### 2. Create and Activate Python Virtual Environment
```powershell
python -m venv venv
venv\Scripts\activate
```

### 3. Install Dependencies
```powershell
pip install -r requirements.txt
```

> **Note on PDF Processing:**
> This service uses `PyMuPDF` (`pymupdf`) for native high-resolution PDF rendering with **zero external system dependencies**.
> If you optionally prefer `pdf2image`, install Poppler for Windows from `https://github.com/oschwartz10612/poppler-windows/releases/` and add `poppler/bin` to your system `PATH`.

### 4. Configure Environment Variables
Create or verify `.env`:
```ini
PORT=8000
GEMINI_OCR_API_KEY=your_gemini_ocr_api_key_here
GEMINI_ANALYSIS_API_KEY=your_gemini_analysis_api_key_here
GEMINI_DOCUMENT_API_KEY=your_gemini_document_api_key_here
MAX_UPLOAD_SIZE_MB=20
ALLOWED_ORIGINS=http://localhost:5000,http://localhost:3000,http://localhost:5173
ENVIRONMENT=development
TEMP_UPLOAD_DIR=./temp_uploads
```

### 5. Run FastAPI Server
```powershell
uvicorn app.main:app --reload --port 8000
```

---

## 🌐 Swagger UI Direct Testing

Open **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)** in your browser.

1. Locate **`POST /api/v1/process-document`**.
2. Click **"Try it out"**.
3. Under **`file`**, click the file chooser button and select any real PDF or image (`.pdf`, `.png`, `.jpg`, `.jpeg`).
4. Select `document_type` (`auto` or `PATTA`).
5. Click **"Execute"**.

### Sample Response
```json
{
  "success": true,
  "processing_id": "c6218d6e-ea77-4c8d-8a1a-3e74c8df634f",
  "filename": "sample_patta.pdf",
  "document_type": "PATTA",
  "classification_confidence": 0.94,
  "pages_processed": 1,
  "ocr": {
    "success": true,
    "model_used": "gemini-3.6-flash",
    "full_text": "தமிழ்நாடு அரசு வருவாய்த்துறை பட்டா எண் 1042...",
    "pages": [
      {
        "page_number": 1,
        "text": "தமிழ்நாடு அரசு வருவாய்த்துறை பட்டா எண் 1042..."
      }
    ]
  },
  "extracted_data": {
    "survey_number": "145/2",
    "sub_division": "2",
    "owner_name": "Ramasamy Gounder",
    "father_name": "Marappa Gounder",
    "district": "Coimbatore",
    "taluk": "Coimbatore North",
    "village": "Kovilpalayam",
    "area": 2.12,
    "area_unit": "Acres",
    "classification": "Ryotwari Nanjai (Wet Land)",
    "boundaries": {
      "north": "East-West Main Cart Track",
      "south": "Survey No 145/3 Senthil Land",
      "east": "Kovilpalayam Water Channel",
      "west": "Survey No 144 Odai Poramboke"
    }
  },
  "confidence": {
    "overall": 0.94,
    "fields": {
      "survey_number": 0.99,
      "owner_name": 0.95,
      "village": 0.96,
      "area": 0.92,
      "boundaries": 0.88
    }
  },
  "processing": {
    "used_fallback": false,
    "processing_time_seconds": 3.24
  }
}
```

---

## 🧪 Automated Testing

Run the test suite:
```powershell
pytest -v
```

Test coverage includes:
- `test_health.py`: Health check endpoint verification
- `test_file_upload.py`: Multipart file upload and pipeline validation
- `test_validation.py`: Rejection of unsupported extensions and empty files
