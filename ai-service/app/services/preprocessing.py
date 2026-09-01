import math
from typing import Dict, Any, Tuple
from PIL import Image, ImageEnhance, ImageOps
import numpy as np
from app.utils.file_utils import pil_to_cv2, cv2_to_pil


class PreprocessingService:
    """
    Image enhancement and preprocessing for Tamil Nadu land records.
    Adaptive per-page metric decisions based on brightness, contrast, sharpness, and noise.
    """

    def enhance_image(self, pil_image: Image.Image) -> Tuple[Image.Image, Dict[str, Any]]:
        operations = []
        metrics = {}

        try:
            import cv2

            cv_img = pil_to_cv2(pil_image)
            height, width = cv_img.shape[:2]
            gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY)

            metrics = {"originalDimensions": {"width": width, "height": height}}
            operations = []
            working = gray

            # --- Decide what THIS page actually needs ---
            mean_brightness = float(np.mean(gray))
            brightness_std = float(np.std(gray))
            laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())  # sharpness proxy

            metrics["meanBrightness"] = round(mean_brightness, 1)
            metrics["contrastStd"] = round(brightness_std, 1)
            metrics["sharpness"] = round(laplacian_var, 1)

            # Brightness correction only if too dark/bright
            if mean_brightness < 95:
                gamma = 1.35
                working = self._gamma_correct(working, gamma)
                operations.append(f"brightness_boost_gamma_{gamma}")
            elif mean_brightness > 195:
                working = cv2.convertScaleAbs(working, alpha=0.85, beta=-15)
                operations.append("brightness_reduction")

            # Contrast only if flat (low std) — handwriting on faded paper needs this,
            # crisp typed pages don't
            if brightness_std < 45:
                clahe = cv2.createCLAHE(clipLimit=2.2, tileGridSize=(8, 8))
                working = clahe.apply(working)
                operations.append("adaptive_clahe_contrast")
            else:
                metrics["contrastSkipped"] = "sufficient_contrast_detected"

            # Denoise only if the page is noisy AND not already sharp (avoid
            # smearing thin handwritten strokes on a clean scan)
            noise_estimate = self._estimate_noise(gray)
            metrics["noiseEstimate"] = round(noise_estimate, 2)
            if noise_estimate > 6.0:
                working = cv2.bilateralFilter(working, d=7, sigmaColor=55, sigmaSpace=55)
                operations.append("bilateral_filter_denoising")
            else:
                metrics["denoiseSkipped"] = "low_noise_detected"

            # Deskew — always check, only rotate if actually skewed
            skew_angle = self._calculate_skew_angle(working)
            if abs(skew_angle) > 0.5 and abs(skew_angle) < 45.0:
                working = self._rotate_image(working, skew_angle)
                operations.append(f"deskew_corrected_{skew_angle:.1f}_deg")
            metrics["skewAngle"] = round(skew_angle, 2) if abs(skew_angle) <= 45.0 else 0.0

            # Legibility heuristic — flags pages likely to defeat OCR (very low
            # sharpness = probably illegible handwriting even after enhancement)
            metrics["legibilityFlag"] = "LOW_CONFIDENCE_EXPECTED" if laplacian_var < 40 else "OK"

            final_rgb = cv2.cvtColor(working, cv2.COLOR_GRAY2RGB)
            result_pil = cv2_to_pil(final_rgb)

            metrics["operationsApplied"] = operations or ["none_needed"]
            metrics["status"] = "SUCCESS"
            return result_pil, metrics

        except ImportError:
            gray = ImageOps.grayscale(pil_image)
            enhancer = ImageEnhance.Contrast(gray)
            enhanced = enhancer.enhance(1.5)
            result_pil = enhanced.convert("RGB")
            return result_pil, {
                "operationsApplied": ["pillow_grayscale", "pillow_contrast_boost"],
                "status": "FALLBACK_PIL",
                "skewAngle": 0.0,
                "legibilityFlag": "OK",
            }
        except Exception as e:
            return pil_image, {
                "operationsApplied": ["original_passthrough"],
                "status": "ERROR",
                "error": str(e),
                "legibilityFlag": "UNKNOWN",
            }

    def _gamma_correct(self, img: np.ndarray, gamma: float) -> np.ndarray:
        inv = 1.0 / gamma
        table = np.array([((i / 255.0) ** inv) * 255 for i in range(256)]).astype("uint8")
        import cv2
        return cv2.LUT(img, table)

    def _estimate_noise(self, gray_img: np.ndarray) -> float:
        try:
            import cv2
            h, w = gray_img.shape
            if h <= 4 or w <= 4:
                return 0.0
            m = np.array([[1, -2, 1], [-2, 4, -2], [1, -2, 1]])
            sigma = float(np.sum(np.abs(cv2.filter2D(gray_img.astype(float), -1, m))))
            return float(sigma * (0.5 * np.pi) ** 0.5 / (6 * (w - 2) * (h - 2)))
        except Exception:
            return 0.0

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
