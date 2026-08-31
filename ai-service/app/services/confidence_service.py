from typing import Dict, Any, Tuple


class ConfidenceService:
    """
    Computes field-level confidence scores and weighted overall confidence for land records.
    """

    WEIGHTS = {
        "surveyNumber": 0.25,
        "ownerName": 0.25,
        "landArea": 0.20,
        "village": 0.15,
        "boundaries": 0.15,
    }

    def compute_confidence(
        self,
        extracted_data: Dict[str, Any],
        raw_field_confidences: Dict[str, float] = None,
    ) -> Tuple[Dict[str, float], float]:
        confidences: Dict[str, float] = {}

        # Default field base confidences
        for field in ["surveyNumber", "subDivision", "ownerName", "fatherName", "village", "taluk", "district", "landArea"]:
            if raw_field_confidences and field in raw_field_confidences:
                confidences[field] = float(raw_field_confidences[field])
            else:
                val = extracted_data.get(field)
                if val is not None and str(val).strip() != "":
                    confidences[field] = 0.94
                else:
                    confidences[field] = 0.50

        # Boundary confidence
        boundaries = extracted_data.get("boundaries", {})
        if isinstance(boundaries, dict):
            present_bounds = sum(1 for v in boundaries.values() if v)
            confidences["boundaries"] = round(present_bounds / 4.0, 2) if present_bounds > 0 else 0.5
        else:
            confidences["boundaries"] = 0.5

        # Calculate weighted overall confidence
        weighted_sum = 0.0
        total_weight = 0.0

        for field, weight in self.WEIGHTS.items():
            field_conf = confidences.get(field, 0.8)
            weighted_sum += field_conf * weight
            total_weight += weight

        overall = weighted_sum / total_weight if total_weight > 0 else 0.85
        return confidences, round(overall, 2)


confidence_service = ConfidenceService()
