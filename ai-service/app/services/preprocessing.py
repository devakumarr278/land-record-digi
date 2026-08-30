import math
from typing import Dict, Any, Tuple
from PIL import Image, ImageEnhance, ImageOps
import numpy as np
from app.utils.file_utils import pil_to_cv2, cv2_to_pil


class PreprocessingService:
    """
    Image enhancement and preprocessing for Tamil Nadu land records.
    Applies grayscale conversion, adaptive contrast enhancement, bilateral denoising, and deskew.
    """

    def enhance_image(self, pil_image: Image.Image) -> Tuple[Image.Image, Dict[str, Any]]:
        operations = []
        metrics = {}

        try:
            import cv2

            cv_img = pil_to_cv2(pil_image)
            height, width = cv_img.shape[:2]
            metrics["originalDimensions"] = {"width": width, "height": height}

            # 1. Convert to Grayscale
            gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY)
            operations.append("grayscale_conversion")

            # 2. Adaptive Contrast Enhancement (CLAHE)
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            contrast_enhanced = clahe.apply(gray)
            operations.append("adaptive_clahe_contrast")

            # 3. Bilateral Filter Denoising (preserves edges of Tamil script glyphs)
            denoised = cv2.bilateralFilter(contrast_enhanced, d=9, sigmaColor=75, sigmaSpace=75)
            operations.append("bilateral_filter_denoising")

            # 4. Deskew calculation using Hough lines / thresholding
            skew_angle = self._calculate_skew_angle(denoised)
            if abs(skew_angle) > 0.5 and abs(skew_angle) < 45.0:
                denoised = self._rotate_image(denoised, skew_angle)
                operations.append(f"deskew_corrected_{skew_angle:.1f}_deg")
                metrics["skewAngle"] = round(skew_angle, 2)
            else:
                metrics["skewAngle"] = 0.0

            # Convert back to 3-channel RGB for multimodal LLM ingestion
            final_rgb = cv2.cvtColor(denoised, cv2.COLOR_GRAY2RGB)
            result_pil = cv2_to_pil(final_rgb)

            metrics["operationsApplied"] = operations
            metrics["status"] = "SUCCESS"

            return result_pil, metrics

        except ImportError:
            # Fallback to pure Pillow preprocessing if cv2 is not available
            gray = ImageOps.grayscale(pil_image)
            enhancer = ImageEnhance.Contrast(gray)
            enhanced = enhancer.enhance(1.5)
            result_pil = enhanced.convert("RGB")
            return result_pil, {
                "operationsApplied": ["pillow_grayscale", "pillow_contrast_boost"],
                "status": "FALLBACK_PIL",
                "skewAngle": 0.0,
            }
        except Exception as e:
            # Safe return of original image if an issue occurs
            return pil_image, {
                "operationsApplied": ["original_passthrough"],
                "status": "ERROR",
                "error": str(e),
            }

    def _calculate_skew_angle(self, gray_cv_img: np.ndarray) -> float:
        """Estimate document skew angle using minAreaRect on foreground contours"""
        try:
            import cv2
            blur = cv2.GaussianBlur(gray_cv_img, (5, 5), 0)
            _, thresh = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
            coords = np.column_stack(np.where(thresh > 0))
            if len(coords) < 100:
                return 0.0
            angle = cv2.minAreaRect(coords)[-1]
            if angle < -45:
                angle = -(90 + angle)
            elif angle > 45:
                angle = 90 - angle
            return float(angle)
        except Exception:
            return 0.0

    def _rotate_image(self, image: np.ndarray, angle: float) -> np.ndarray:
        try:
            import cv2
            (h, w) = image.shape[:2]
            center = (w // 2, h // 2)
            M = cv2.getRotationMatrix2D(center, angle, 1.0)
            rotated = cv2.warpAffine(
                image, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE
            )
            return rotated
        except Exception:
            return image


preprocessing_service = PreprocessingService()
