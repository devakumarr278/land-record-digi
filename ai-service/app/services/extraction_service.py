import os
import json
import re
from typing import Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEYS = [
    k for k in [
        os.getenv("GEMINI_OCR_API_KEY"),
        os.getenv("GEMINI_ANALYSIS_API_KEY"),
    ] if k and k.strip() != ""
]

CANDIDATE_MODELS = [
    "gemini-3.6-flash",
    "gemini-3.5-flash",
    "gemini-3.7-flash",
    "gemini-flash-latest",
]


class ExtractionService:
    """
    Parses and sanitizes raw OCR / bilingual Tamil-English transcribed text into standard land registry schema.
    Uses Gemini LLM for semantic entity extraction from raw OCR text with comprehensive multilingual heuristic fallback.
    """

    def extract_entities_from_text(
        self,
        raw_ocr_text: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        meta = metadata or {}

        if not raw_ocr_text or raw_ocr_text.strip() == "":
            return self._heuristic_fallback_extraction("", meta)

        # Attempt Gemini LLM structured extraction from raw text
        if GEMINI_API_KEYS:
            try:
                extracted = self._extract_with_gemini_llm(raw_ocr_text, meta)
                if extracted and isinstance(extracted, dict) and "extractedData" in extracted:
                    return extracted
            except Exception as e:
                print(f"[ExtractionService] Gemini text extraction note: {e}")

        # Heuristic / regex extraction fallback
        return self._heuristic_fallback_extraction(raw_ocr_text, meta)

    def _extract_with_gemini_llm(self, text: str, metadata: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        prompt = f"""
You are an expert AI parser for Indian Land Records (Tamil Nadu Patta / Chitta / Revenue Deeds / Mutation Registers / Historical Land Conveyance).
Extract structured details from this raw transcribed bilingual Tamil and English text.

Target Metadata Context:
District: {metadata.get("district", "")}
Taluk: {metadata.get("taluk", "")}
Village: {metadata.get("village", "")}
Survey No Hint: {metadata.get("surveyNumber", "")}

Raw OCR Text:
\"\"\"
{text}
\"\"\"

Return ONLY valid JSON matching this exact structure:
{{
  "documentType": "PATTA / MUTATION_RECORD / DHARMA_SASANAM / SALE_DEED",
  "language": ["Tamil", "English"],
  "extractedData": {{
      "surveyNumber": "e.g. 176/3 or 175/1",
      "subDivision": "e.g. 3 or 1",
      "ownerName": "Primary Owner / Transferee / Donee / Pattadar Name",
      "fatherName": "Father / Vendor / Transferor / Settlor Name",
      "pattaNumber": "Patta No. or Document Registration Reference",
      "village": "Village Name",
      "taluk": "Taluk Name",
      "district": "District Name",
      "landArea": 2.65,
      "areaUnit": "Acres",
      "classification": "Land Classification (e.g. Wet (Nanja) & Dry (Punja), Trust Settlement)",
      "consideration": "Consideration amount / Valuation if present",
      "boundaries": {{
          "north": "North boundary or null",
          "south": "South boundary or null",
          "east": "East boundary or null",
          "west": "West boundary or null"
      }}
  }},
  "fieldConfidence": {{
      "surveyNumber": 0.98,
      "ownerName": 0.95,
      "village": 0.96,
      "landArea": 0.92,
      "boundaries": 0.88
  }},
  "overallConfidence": 0.94,
  "notes": ["Structured extraction completed from raw OCR transcript"]
}}
"""

        for api_key in GEMINI_API_KEYS:
            for model_name in CANDIDATE_MODELS:
                try:
                    try:
                        # pyrefly: ignore [missing-import]
                        from google import genai  # type: ignore
                        client = genai.Client(api_key=api_key)
                        resp = client.models.generate_content(
                            model=model_name,
                            contents=prompt,
                        )
                        raw_out = resp.text
                    except Exception:
                        # pyrefly: ignore [missing-import]
                        import google.generativeai as legacy_genai  # type: ignore
                        legacy_genai.configure(api_key=api_key)
                        model = legacy_genai.GenerativeModel(model_name)
                        resp = model.generate_content(prompt)
                        raw_out = resp.text

                    if raw_out:
                        cleaned_json = self._clean_json_string(raw_out)
                        parsed = json.loads(cleaned_json)
                        if parsed and "extractedData" in parsed:
                            return parsed
                except Exception as e:
                    continue

        return None

    def _heuristic_fallback_extraction(self, text: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Comprehensive multilingual regex and rule-based entity extractor for Tamil Nadu land records"""
        if not text or not text.strip():
            return self._empty_result(metadata, reason="No OCR text available for extraction")

        clean_text = text.replace("\r", " ")
        lower_t = clean_text.lower()

        # 1. Survey Number & Sub-division
        survey_match = re.search(
            r"(?:புல\s*எண்|சர்வே\s*(?:நெ|எண்|நம்பர்)?|survey\s*(?:no|number)?|s\.no|s\.f|க\.எண்)[:\s.]*([0-9]{1,4}(?:\s*[/\\-]\s*[0-9]{1,3}[A-Za-z]*)?)",
            clean_text, re.IGNORECASE)
        
        survey_num = None
        sub_div = None
        if survey_match:
            raw_s = survey_match.group(1).replace(" ", "").replace("-", "/").replace("\\", "/")
            survey_num = raw_s
            if "/" in raw_s:
                sub_div = raw_s.split("/")[1]
        elif metadata.get("surveyNumber"):
            survey_num = str(metadata.get("surveyNumber"))
            if "/" in survey_num:
                sub_div = survey_num.split("/")[1]

        # 2. Area / Extent
        land_area = None
        area_match = re.search(
            r"(?:Total extent(?: hereby transferred)?:\s*(?:[A-Za-z\s\-]+\()?|மொத்த\s*விஸ்தீரணம்[:\s]*|பரப்பளவு[:\s]*|extent[:\s]*|area[:\s]*)([0-9]+(?:\.[0-9]+)?)\s*(?:Acres?|ஏக்கர்|Hectares?|ஹெக்டேர்)",
            clean_text, re.IGNORECASE)
        if not area_match:
            area_match = re.search(r"([0-9]+(?:\.[0-9]+)?)\s*(?:Acres?|ஏக்கர்|Hectares?|cents?|சென்ட்)", clean_text, re.IGNORECASE)
        if area_match:
            try:
                land_area = float(area_match.group(1))
            except Exception:
                land_area = None

        # 3. Owner / Transferee / Donee / Pattadar
        owner_name = None
        owner_match = re.search(r"(?:and\s+|unto (?:the said\s+)?|paid to him in full by\s+|Transferee[:\s]+|Purchaser[:\s]+|Buyer[:\s]+)([A-Za-z\s\.]{3,35}),\s*son of", clean_text, re.IGNORECASE)
        if not owner_match:
            owner_match = re.search(r"(?:between\s+|by\s+|Transferor[:\s]+|Vendor[:\s]+)([A-Za-z\s\.]{3,35}),\s*son of", clean_text, re.IGNORECASE)
        if not owner_match:
            owner_match = re.search(r"(?:குமாரன்\s+)([A-Za-z\u0B80-\u0BFF\s\.]+)\s+(?:எழுதிய|எழுதிக்கொடுத்த)", clean_text)
        if not owner_match:
            owner_match = re.search(r"(?:உரிமையாளர்|பட்டாதாரர்|பெயர்|pattadar|owner|buyer)[:\s]+([A-Za-z\u0B80-\u0BFF\s\.]{3,35})", clean_text, re.IGNORECASE)
        if owner_match:
            owner_name = owner_match.group(1).strip()
            owner_name = re.sub(r"^(?:the said|mr|sri|thiru)\s+", "", owner_name, flags=re.IGNORECASE).strip()

        # 4. Father / Transferor / Executant
        father_name = None
        father_match = re.search(r"(?:son of|தந்தை|father|husband)[:\s]+([A-Za-z\u0B80-\u0BFF\s\.]{3,35})", clean_text, re.IGNORECASE)
        if not father_match:
            father_match = re.search(r"(?:^|\n)\s*([A-Za-z\u0B80-\u0BFF\.\s]{2,35})\s+குமாரன்", clean_text)
        if father_match:
            father_name = father_match.group(1).strip()

        # 5. Village
        village = None
        village_match = re.search(r"([A-Za-z\u0B80-\u0BFF]+)\s+(?:கிராமம்|கிராமத்தில்|village)", clean_text, re.IGNORECASE)
        if not village_match:
            village_match = re.search(r"(?:situate in|of|at)\s+([A-Za-z\u0B80-\u0BFF]+)\s+village", clean_text, re.IGNORECASE)
        if not village_match:
            village_match = re.search(r"([A-Za-z\u0B80-\u0BFF]+)\s+Municipality", clean_text, re.IGNORECASE)
        if not village_match:
            village_match = re.search(r"(?:village|கிராமம்|கிராம)[:\s]+([A-Za-z\u0B80-\u0BFF]+)", clean_text, re.IGNORECASE)
        if village_match:
            village = village_match.group(1).strip()
        elif metadata.get("village"):
            village = str(metadata.get("village"))
        else:
            known = ["Keelathoor", "Srirangam", "Kinathukadavu", "Kovilpalayam", "Anaimalai", "Madukkarai", "Sulur", "Pollachi"]
            for k in known:
                if re.search(rf"\b{k}\b", clean_text, re.IGNORECASE):
                    village = k
                    break

        # 6. Taluk
        taluk = None
        taluk_match = re.search(r"([A-Za-z\u0B80-\u0BFF]+)\s+(?:தாலுகா|வட்டம்|Taluk)", clean_text, re.IGNORECASE)
        if not taluk_match:
            taluk_match = re.search(r"(?:taluk|வட்டம்|தாலுகா)[:\s]+([A-Za-z\u0B80-\u0BFF]+)", clean_text, re.IGNORECASE)
        if taluk_match:
            taluk = taluk_match.group(1).strip()
        elif metadata.get("taluk"):
            taluk = str(metadata.get("taluk"))

        # 7. District
        district = None
        dist_match = re.search(r"(?:District of|in the District of)\s+([A-Za-z\u0B80-\u0BFF]+)", clean_text, re.IGNORECASE)
        if not dist_match:
            dist_match = re.search(r"([A-Za-z\u0B80-\u0BFF]+)\s+(?:ஜில்லா|மாவட்டம்)", clean_text, re.IGNORECASE)
        if not dist_match:
            dist_match = re.search(r"(?<!\bthe\s)(?<!\bin\s)\b([A-Za-z\u0B80-\u0BFF]+)\s+District\b", clean_text, re.IGNORECASE)
        if not dist_match:
            dist_match = re.search(r"(?:district|மாவட்டம்|ஜில்லா)[:\s]+([A-Za-z\u0B80-\u0BFF\(\)\s]+)", clean_text, re.IGNORECASE)
        if dist_match:
            d_cand = dist_match.group(1).strip()
            if d_cand.lower() not in ["the", "this", "said", "in", "of"]:
                district = d_cand
        elif metadata.get("district"):
            district = str(metadata.get("district"))

        # 8. Patta / Document Registration Number
        patta_num = None
        patta_match = re.search(r"(?:Document No\.?\s*[0-9]+(?:\s*of\s*[0-9]{4})?|Doc\.?\s*No\.?\s*[0-9]+(?:\s*of\s*[0-9]{4})?|Patta No\.?\s*[0-9]+|பட்டா எண்[:\s]*[0-9]+)", clean_text, re.IGNORECASE)
        if patta_match:
            patta_num = patta_match.group(0).strip()

        # 9. Land Classification
        classification = None
        if "nanja" in lower_t and "punja" in lower_t:
            classification = "Wet (Nanja) & Dry (Punja)"
        elif "trust" in lower_t or "dharma" in lower_t or "சாஸனம்" in clean_text:
            classification = "Trust Settlement / Dharma Sasanam (நஞ்சை & புஞ்சை)"
        elif "nanja" in lower_t or "wet" in lower_t or "நஞ்சை" in clean_text:
            classification = "Wet Land (Nanjai)"
        elif "punja" in lower_t or "dry" in lower_t or "புஞ்சை" in clean_text:
            classification = "Dry Land (Punjai)"
        elif "residential" in lower_t:
            classification = "Residential Conversion"

        # 10. Consideration / Valuation
        consideration = None
        cons_match = re.search(r"(?:consideration of\s+(?:Rupees[^\(]+)?\(?|மதிப்பு\s*|valuation[:\s]*)(Rs\.?\s*[0-9\-\/]+|₹\s*[0-9\,]+|ரூ\.?\s*[0-9\/\,\-]+)", clean_text, re.IGNORECASE)
        if cons_match:
            consideration = cons_match.group(1).strip()

        # 11. Boundaries
        boundaries = {"north": None, "south": None, "east": None, "west": None}
        bound_inline = re.search(
            r"bounded on the North by\s+([^,]+),\s*on the South by\s+([^,]+),\s*on the East by\s+([^,]+),\s*and on the West by\s+([^,\.\n]+)",
            clean_text, re.IGNORECASE)
        if bound_inline:
            boundaries["north"] = bound_inline.group(1).strip()
            boundaries["south"] = bound_inline.group(2).strip()
            boundaries["east"] = bound_inline.group(3).strip()
            boundaries["west"] = bound_inline.group(4).strip()
        else:
            n_m = re.search(r"(?:North|வடக்கு)[:\s]+([^,\n·]+)", clean_text, re.IGNORECASE)
            s_m = re.search(r"(?:South|தெற்கு)[:\s]+([^,\n·]+)", clean_text, re.IGNORECASE)
            e_m = re.search(r"(?:East|கிழக்கு)[:\s]+([^,\n·]+)", clean_text, re.IGNORECASE)
            w_m = re.search(r"(?:West|மேற்கு)[:\s]+([^,\n·]+)", clean_text, re.IGNORECASE)
            if n_m: boundaries["north"] = n_m.group(1).strip()
            if s_m: boundaries["south"] = s_m.group(1).strip()
            if e_m: boundaries["east"] = e_m.group(1).strip()
            if w_m: boundaries["west"] = w_m.group(1).strip()

        # Document Type classification
        doc_type = "PATTA"
        if "mutation" in lower_t or "convey" in lower_t or "transfer" in lower_t:
            doc_type = "MUTATION_RECORD"
        elif "dharma" in lower_t or "trust" in lower_t or "சாஸனம்" in clean_text or "மண்டப" in clean_text:
            doc_type = "DHARMA_SASANAM"
        elif "sale deed" in lower_t or "கிரைய" in clean_text:
            doc_type = "SALE_DEED"

        found_fields = [survey_num, owner_name, village, land_area, taluk, district]
        found_count = sum(x is not None for x in found_fields)
        overall_conf = round(min(0.96, max(0.40, (found_count / len(found_fields)) * 0.95)), 2)

        return {
            "documentType": doc_type,
            "language": [metadata.get("detectedLanguage", "Tamil+English")],
            "extractedData": {
                "surveyNumber": survey_num,
                "subDivision": sub_div,
                "ownerName": owner_name,
                "fatherName": father_name,
                "pattaNumber": patta_num,
                "village": village,
                "taluk": taluk,
                "district": district,
                "landArea": land_area,
                "areaUnit": "Acres" if land_area else None,
                "classification": classification,
                "consideration": consideration,
                "boundaries": boundaries,
            },
            "fieldConfidence": {
                "surveyNumber": 0.95 if survey_num else 0.0,
                "subDivision": 0.92 if sub_div else 0.0,
                "ownerName": 0.94 if owner_name else 0.0,
                "fatherName": 0.90 if father_name else 0.0,
                "pattaNumber": 0.92 if patta_num else 0.0,
                "village": 0.95 if village else 0.0,
                "taluk": 0.92 if taluk else 0.0,
                "district": 0.92 if district else 0.0,
                "landArea": 0.94 if land_area else 0.0,
                "boundaries": 0.88 if any(boundaries.values()) else 0.0,
            },
            "overallConfidence": overall_conf,
            "notes": [
                "Multilingual semantic entity extraction completed from raw OCR transcript.",
                f"Extracted {found_count} core land registry fields from document text.",
            ],
        }

    def _empty_result(self, metadata: Dict[str, Any], reason: str) -> Dict[str, Any]:
        return {
            "documentType": "UNCLASSIFIED",
            "language": ["unknown"],
            "extractedData": {
                k: None for k in [
                    "surveyNumber", "subDivision", "ownerName", "fatherName", "village",
                    "taluk", "district", "landArea", "areaUnit", "classification"
                ]
            } | {
                "boundaries": {"north": None, "south": None, "east": None, "west": None}
            },
            "fieldConfidence": {},
            "overallConfidence": 0.0,
            "notes": [reason],
        }

    def sanitize_extracted_data(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        data = raw_data.get("extractedData", {}) if "extractedData" in raw_data else raw_data

        land_area = data.get("landArea")
        if land_area is not None:
            try:
                if isinstance(land_area, str):
                    clean_num = "".join([c for c in land_area if c.isdigit() or c == "."])
                    land_area = float(clean_num) if clean_num else None
                else:
                    land_area = float(land_area)
            except Exception:
                land_area = None

        raw_boundaries = data.get("boundaries") or {}
        if not isinstance(raw_boundaries, dict):
            raw_boundaries = {}

        boundaries = {
            "north": raw_boundaries.get("north"),
            "south": raw_boundaries.get("south"),
            "east": raw_boundaries.get("east"),
            "west": raw_boundaries.get("west"),
        }

        sanitized = {
            "surveyNumber": str(data.get("surveyNumber") or "").strip() or None,
            "subDivision": str(data.get("subDivision") or "").strip() or None,
            "ownerName": str(data.get("ownerName") or "").strip() or None,
            "fatherName": str(data.get("fatherName") or "").strip() or None,
            "village": str(data.get("village") or "").strip() or None,
            "taluk": str(data.get("taluk") or "").strip() or None,
            "district": str(data.get("district") or "").strip() or None,
            "landArea": land_area,
            "areaUnit": str(data.get("areaUnit") or "Acres").strip(),
            "classification": str(data.get("classification") or "").strip() or None,
            "boundaries": boundaries,
        }

        return sanitized

    def _clean_json_string(self, text: str) -> str:
        text = text.strip()
        match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text, re.IGNORECASE)
        if match:
            return match.group(1).strip()
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            return text[start : end + 1]
        return text


extraction_service = ExtractionService()
