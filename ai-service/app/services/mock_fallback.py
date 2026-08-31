from typing import Dict, Any, Optional


class MockFallbackService:
    """
    Scenario-aware mock fallback engine for SIH 2026 hackathon demo reliability.
    Guarantees deterministic and transparent processing results when Gemini API is unavailable or in demo mode.
    """

    def generate_result(
        self,
        document_id: str,
        original_file_name: str,
        metadata: Optional[Dict[str, Any]] = None,
        demo_scenario: Optional[str] = None,
        fallback_reason: str = "Demo Fallback Mode / Gemini API Offline",
    ) -> Dict[str, Any]:
        meta = metadata or {}
        scenario = demo_scenario or meta.get("demoScenario") or "STANDARD"

        survey_num = meta.get("surveyNumber") or meta.get("survey_number") or "145/2"
        sub_div = meta.get("subDivision") or meta.get("sub_division") or "2"
        village = meta.get("village") or "Kovilpalayam"
        taluk = meta.get("taluk") or "Coimbatore North"
        district = meta.get("district") or "Coimbatore"
        owner_name = "Ramasamy Gounder"
        father_name = "Marappa Gounder"
        land_area = 2.12  # Default matches clean record
        area_unit = "Acres"
        classification = "Ryotwari Nanjai (Wet Land)"

        field_confidence = {
            "survey_number": 0.99,
            "sub_division": 0.98,
            "owner_name": 0.95,
            "father_name": 0.94,
            "village": 0.97,
            "taluk": 0.96,
            "district": 0.99,
            "area": 0.93,
            "boundaries": 0.90,
            "surveyNumber": 0.99,
            "subDivision": 0.98,
            "ownerName": 0.95,
            "fatherName": 0.94,
            "landArea": 0.93,
        }
        overall_confidence = 0.95

        boundaries = {
            "north": "East-West Main Cart Track",
            "south": "Survey No 145/3 Senthil Land",
            "east": "Kovilpalayam Water Channel",
            "west": "Survey No 144 Odai Poramboke",
        }

        # Apply specific scenario adaptations
        if scenario == "LOW_CONFIDENCE":
            overall_confidence = 0.48
            field_confidence = {k: 0.45 for k in field_confidence}
            owner_name = "R. Goun???er (Illegible)"
            fallback_reason = "Simulated degraded ink & low contrast document"

        elif scenario == "OWNERSHIP_CONFLICT":
            owner_name = "K. Marimuthu"  # Does not match registry Ramasamy Gounder
            fallback_reason = "Simulated ownership name mismatch with registration registry"

        elif scenario == "GIS_AREA_MISMATCH":
            land_area = 2.45  # Registry parcel has 2.12 Acres -> 15.5% variance
            fallback_reason = "Simulated area discrepancy: Document 2.45 Acres vs Cadastral GIS 2.12 Acres"

        elif scenario == "DUPLICATE_RECORD":
            survey_num = "145/2"
            fallback_reason = "Simulated duplicate registration attempt for Survey 145/2"

        elif scenario == "BOUNDARY_CONFLICT":
            boundaries["west"] = "Disputed Encroachment on Odai Poramboke"
            fallback_reason = "Simulated Cadastral Field Measurement Book (FMB) boundary conflict"

        ocr_sample_text = f"தமிழ்நாடு அரசு வருவாய்த்துறை - பட்டா / சிட்டா நகல்.\nமாவட்டம்: {district} | வட்டம்: {taluk} | கிராமம்: {village}\nபுல எண்: {survey_num} | உட்பிரிவு: {sub_div}\nஉரிமையாளர்: {owner_name}\nவிஸ்தீரணம்: {land_area} {area_unit}"

        return {
            "success": True,
            "processing_id": document_id,
            "filename": original_file_name,
            "document_type": "PATTA",
            "classification_confidence": 0.94,
            "pages_processed": 1,
            "ocr": {
                "success": True,
                "model_used": "gemini-fallback-engine",
                "full_text": ocr_sample_text,
                "pages": [
                    {
                        "page_number": 1,
                        "text": ocr_sample_text,
                    }
                ],
            },
            "extracted_data": {
                "survey_number": survey_num,
                "sub_division": sub_div,
                "owner_name": owner_name,
                "father_name": father_name,
                "village": village,
                "taluk": taluk,
                "district": district,
                "area": land_area,
                "area_unit": area_unit,
                "classification": classification,
                "boundaries": boundaries,
            },
            "confidence": {
                "overall": overall_confidence,
                "fields": {
                    "survey_number": field_confidence.get("survey_number", 0.98),
                    "owner_name": field_confidence.get("owner_name", 0.95),
                    "village": field_confidence.get("village", 0.96),
                    "area": field_confidence.get("area", 0.92),
                    "boundaries": 0.88,
                },
            },
            "processing": {
                "used_fallback": True,
                "processing_time_seconds": 1.2,
            },
            # Compatibility with Node Orchestrator
            "processingMode": "DEMO_FALLBACK",
            "fallbackReason": fallback_reason,
            "documentType": "PATTA",
            "language": ["Tamil", "English"],
            "extractedData": {
                "surveyNumber": survey_num,
                "subDivision": sub_div,
                "ownerName": owner_name,
                "fatherName": father_name,
                "village": village,
                "taluk": taluk,
                "district": district,
                "landArea": land_area,
                "areaUnit": area_unit,
                "classification": classification,
                "boundaries": boundaries,
            },
            "fieldConfidence": field_confidence,
            "overallConfidence": overall_confidence,
            "notes": [
                f"Processing executed via Deterministic Fallback Engine.",
                f"Target Scenario: {scenario}",
                f"Original File: {original_file_name}",
            ],
            "stages": {
                "enhancement": {
                    "status": "COMPLETED",
                    "filtersApplied": ["grayscale_conversion", "adaptive_clahe_contrast", "bilateral_filter_denoising"],
                    "skewAngle": 0.0,
                },
                "classification": {
                    "documentType": "PATTA",
                    "confidence": 0.96,
                },
                "layout": {
                    "headerZoneDetected": True,
                    "tabularDataFound": True,
                    "officialSealDetected": True,
                    "signatureDetected": True,
                },
                "ocr": {
                    "languages": ["Tamil", "English"],
                    "wordCount": 146,
                    "confidence": overall_confidence,
                },
            },
        }


mock_fallback_service = MockFallbackService()
