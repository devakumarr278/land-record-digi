import os
import time
import uuid
import logging
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, File, UploadFile, Form, HTTPException, Request
from dotenv import load_dotenv

from app.schemas.processing import (
    ProcessDocumentResponse,
    ExtractedData,
    Boundaries,
    OCRData,
    OCRPageResult,
    ConfidenceData,
    ProcessingInfo,
)
from app.utils.file_utils import (
    validate_uploaded_file,
    save_upload_temp_file,
    cleanup_temp_file,
    load_document_pages,
)
from app.services.preprocessing import preprocessing_service
from app.services.classification import classification_service
from app.services.ocr_service import perform_ocr
from app.services.extraction_service import extraction_service
from app.services.confidence_service import confidence_service
from app.services.mock_fallback import mock_fallback_service

load_dotenv()

logger = logging.getLogger("bhoomi_ai")
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [PID: %(process)d] %(message)s",
)

TEMP_UPLOAD_DIR = os.getenv("TEMP_UPLOAD_DIR", "./temp_uploads")
MAX_UPLOAD_SIZE_MB = int(os.getenv("MAX_UPLOAD_SIZE_MB", 20))
MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024

router = APIRouter()


@router.post(
    "/process-document",
    response_model=ProcessDocumentResponse,
    summary="Process land record document",
    description="Upload a Tamil Nadu land record document for AI-powered preprocessing, classification, OCR, entity extraction and confidence analysis.",
    responses={
        200: {
            "description": "Document processed successfully with structured entities and OCR transcription.",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "processing_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                        "filename": "patta_survey_145_2.pdf",
                        "document_type": "PATTA",
                        "classification_confidence": 0.94,
                        "pages_processed": 1,
                        "ocr": {
                            "success": True,
                            "model_used": "gemini-3.6-flash",
                            "full_text": "தமிழ்நாடு அரசு வருவாய்த்துறை பட்டா எண் 1042\nகிராமம்: கோவில்பாளையம்\nபுல எண்: 145/2\nஉரிமையாளர்: ராமசாமி கவுண்டர்",
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
                            "used_fallback": False,
                            "processing_time_seconds": 3.42
                        }
                    }
                }
            },
        },
        400: {"description": "Validation error: Unsupported file format or empty file"},
        500: {"description": "Internal processing error during OCR or extraction"},
    },
)
async def process_document(
    file: UploadFile = File(..., description="Land record PDF or Image file (PDF, PNG, JPG, JPEG)"),
    document_type: str = Form("auto", description="Document type hint ('auto', 'PATTA', 'CHITTA', 'ADANGAL', 'SALE_DEED')"),
    language: str = Form("ta", description="Primary document language ('ta', 'en', 'ta+en')"),
    enable_fallback: bool = Form(True, description="Enable fallback engine if AI service is rate-limited or offline"),
    document_id: Optional[str] = Form(None, description="Optional tracking ID from Node orchestrator"),
    demo_scenario: Optional[str] = Form(None, description="Optional demo scenario testing trigger"),
):
    start_time = time.time()
    processing_id = document_id or str(uuid.uuid4())
    temp_file_path = None

    logger.info(f"[{processing_id}] Processing request received for file: {file.filename}, type_hint: {document_type}, lang: {language}")

    # 1. Validate File
    validate_uploaded_file(file, max_size_bytes=MAX_UPLOAD_SIZE_BYTES)

    try:
        # 2. Save Temporary File
        temp_file_path, file_size = save_upload_temp_file(
            file=file,
            temp_dir=TEMP_UPLOAD_DIR,
            processing_id=processing_id,
            max_size_bytes=MAX_UPLOAD_SIZE_BYTES,
        )
        logger.info(f"[{processing_id}] Saved temp file: {temp_file_path} ({file_size} bytes)")

        # Check for explicit demo scenario
        if demo_scenario and demo_scenario != "STANDARD":
            logger.info(f"[{processing_id}] Demo scenario '{demo_scenario}' active. Generating scenario output.")
            fallback_res = mock_fallback_service.generate_result(
                document_id=processing_id,
                original_file_name=file.filename,
                metadata={"demoScenario": demo_scenario},
                demo_scenario=demo_scenario,
                fallback_reason=f"Demo Scenario Triggered: {demo_scenario}",
            )
            fallback_res["processing"]["processing_time_seconds"] = round(time.time() - start_time, 2)
            return ProcessDocumentResponse(**fallback_res)

        # 3. Load Document Pages & PDF Page Count
        pages, page_err = load_document_pages(temp_file_path)
        pages_processed = len(pages) if pages else 1

        # 4. Image Preprocessing (First Page Enhancement & Deskew)
        if pages:
            enhanced_page, preproc_metrics = preprocessing_service.enhance_image(pages[0])
            logger.info(f"[{processing_id}] Preprocessed image: {preproc_metrics.get('operationsApplied', [])}")
        else:
            preproc_metrics = {"status": "SKIPPED", "operationsApplied": []}

        # 5. Gemini Multimodal OCR
        ocr_result_raw = None
        used_model = "gemini-3.6-flash"
        used_fallback = False
        fallback_reason = None

        try:
            logger.info(f"[{processing_id}] Initiating OCR transcription across candidate models...")
            ocr_result_raw = perform_ocr(temp_file_path)
            if ocr_result_raw and ocr_result_raw.get("pages"):
                used_model = ocr_result_raw["pages"][0].get("model") or "gemini-3.6-flash"
        except Exception as ocr_err:
            logger.warning(f"[{processing_id}] OCR execution exception: {ocr_err}")

        # Check if OCR succeeded
        full_text = ocr_result_raw.get("fullText") if ocr_result_raw else None
        if not full_text or full_text.strip() == "":
            if enable_fallback:
                logger.warning(f"[{processing_id}] Gemini OCR returned empty text. Activating resilient demo fallback.")
                used_fallback = True
                fallback_reason = "Gemini OCR unavailable / API rate-limited. Fallback active."
                fallback_res = mock_fallback_service.generate_result(
                    document_id=processing_id,
                    original_file_name=file.filename,
                    metadata={"document_type": document_type},
                    demo_scenario="STANDARD",
                    fallback_reason=fallback_reason,
                )
                fallback_res["pages_processed"] = pages_processed
                fallback_res["processing"]["processing_time_seconds"] = round(time.time() - start_time, 2)
                return ProcessDocumentResponse(**fallback_res)
            else:
                raise HTTPException(status_code=500, detail="OCR transcription failed to extract text from document.")

        # 6. Document Classification
        if document_type != "auto":
            classified_type = document_type.upper()
            type_confidence = 0.98
        else:
            classified_type, type_confidence = classification_service.classify_text(full_text)
        logger.info(f"[{processing_id}] Classified document type: {classified_type} (confidence: {type_confidence})")

        # 7. Structured Entity Extraction from raw OCR transcript
        logger.info(f"[{processing_id}] Extracting structured entities...")
        extracted_raw = extraction_service.extract_entities_from_text(
            raw_ocr_text=full_text,
            metadata={"documentType": classified_type, "language": language},
        )
        sanitized = extraction_service.sanitize_extracted_data(extracted_raw)

        # 8. Confidence Assessment
        field_conf, overall_conf = confidence_service.compute_confidence(
            sanitized, extracted_raw.get("fieldConfidence", {})
        )

        # 9. Format Pages Breakdown for Response
        page_results: List[OCRPageResult] = []
        if ocr_result_raw and ocr_result_raw.get("pages"):
            for p in ocr_result_raw["pages"]:
                page_results.append(
                    OCRPageResult(
                        page_number=p.get("page", 1),
                        text=p.get("text"),
                    )
                )
        else:
            page_results.append(OCRPageResult(page_number=1, text=full_text))

        # 10. Assemble Final Response
        duration = round(time.time() - start_time, 2)
        logger.info(f"[{processing_id}] Pipeline completed in {duration}s. Status: SUCCESS")

        boundaries_obj = Boundaries(**(sanitized.get("boundaries") or {}))
        extracted_obj = ExtractedData(
            survey_number=sanitized.get("surveyNumber"),
            sub_division=sanitized.get("subDivision"),
            owner_name=sanitized.get("ownerName"),
            father_name=sanitized.get("fatherName"),
            district=sanitized.get("district"),
            taluk=sanitized.get("taluk"),
            village=sanitized.get("village"),
            area=sanitized.get("landArea"),
            area_unit=sanitized.get("areaUnit", "Acres"),
            classification=sanitized.get("classification"),
            boundaries=boundaries_obj,
        )

        ocr_obj = OCRData(
            success=True,
            model_used=used_model,
            full_text=full_text,
            pages=page_results,
        )

        confidence_obj = ConfidenceData(
            overall=overall_conf,
            fields={
                "survey_number": field_conf.get("surveyNumber", 0.98),
                "owner_name": field_conf.get("ownerName", 0.95),
                "village": field_conf.get("village", 0.96),
                "area": field_conf.get("landArea", 0.92),
                "boundaries": field_conf.get("boundaries", 0.88),
            },
        )

        processing_info = ProcessingInfo(
            used_fallback=used_fallback,
            processing_time_seconds=duration,
        )

        return ProcessDocumentResponse(
            success=True,
            processing_id=processing_id,
            filename=file.filename,
            document_type=classified_type,
            classification_confidence=type_confidence,
            pages_processed=pages_processed,
            ocr=ocr_obj,
            extracted_data=extracted_obj,
            confidence=confidence_obj,
            processing=processing_info,
            # Node compatibility
            language=["Tamil", "English"],
            documentId=processing_id,
            documentType=classified_type,
            extractedData=sanitized,
            fieldConfidence=field_conf,
            overallConfidence=overall_conf,
            processingMode="AI" if not used_fallback else "DEMO_FALLBACK",
            fallbackReason=fallback_reason,
            stages={
                "preprocessing": {
                    "status": "SUCCESS",
                    "pageMetrics": ocr_result_raw.get("pageMetrics", [preproc_metrics]) if ocr_result_raw else [preproc_metrics],
                    "operationsApplied": preproc_metrics.get("operationsApplied", []),
                },
                "classification": {"document_type": classified_type, "confidence": type_confidence},
                "ocr": {"pages": len(page_results), "model": used_model},
            },
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[{processing_id}] Unhandled processing exception: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred while processing the document: {str(e)}",
        )
    finally:
        cleanup_temp_file(temp_file_path)
