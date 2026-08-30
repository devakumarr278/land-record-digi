import re
from typing import Dict, Any, Tuple


class ClassificationService:
    """
    Document classification for revenue and land registration deeds in Tamil Nadu.
    Recognizes Patta, Chitta, Adangal, Sale Deeds, and 'A' Register forms.
    """

    PATTERNS = {
        "PATTA": [
            r"பட்டா",
            r"patta",
            r"patta\s*pass\s*book",
            r"உரிமைப்\s*பட்டா",
            r"பட்டா\s*எண்",
        ],
        "CHITTA": [
            r"சிட்டா",
            r"chitta",
            r"சிட்டா\s*சான்று",
        ],
        "ADANGAL": [
            r"அடங்கல்",
            r"adangal",
            r"பயிர்\s*அடங்கல்",
        ],
        "SALE_DEED": [
            r"கிரையப்\s*பத்திரம்",
            r"sale\s*deed",
            r"கிரய\s*பத்திரம்",
            r"விற்பனை\s*பத்திரம்",
            r"conveyance\s*deed",
        ],
        "LAND_REGISTER": [
            r"‘a’\s*register",
            r"அ\s*பதிவேடு",
            r"settlement\s*register",
            r"நில\s*அளவை\s*பதிவேடு",
        ],
    }

    def classify_text(self, text: str) -> Tuple[str, float]:
        """
        Classify document from raw OCR text using regex weights
        """
        if not text:
            return "PATTA", 0.85

        lower_text = text.lower()
        scores: Dict[str, int] = {k: 0 for k in self.PATTERNS}

        for doc_type, regex_list in self.PATTERNS.items():
            for pattern in regex_list:
                matches = re.findall(pattern, lower_text, re.IGNORECASE)
                scores[doc_type] += len(matches) * 2

        best_type = max(scores, key=scores.get)
        max_score = scores[best_type]

        if max_score > 0:
            confidence = min(0.98, 0.75 + (max_score * 0.05))
            return best_type, round(confidence, 2)

        return "PATTA", 0.90


classification_service = ClassificationService()
