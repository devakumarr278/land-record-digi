import os
import io
import re
import shutil
import logging
from typing import List, Tuple, Optional
from PIL import Image
from fastapi import UploadFile, HTTPException

logger = logging.getLogger("bhoomi_ai")

ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg"}
ALLOWED_MIME_TYPES = {
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "image/tiff",
}


def validate_uploaded_file(file: UploadFile, max_size_bytes: int = 20 * 1024 * 1024) -> None:
    """
    Validate uploaded file extension, MIME type, and size.
    Raises HTTPException(400) if validation fails.
    """
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded or filename is missing.")

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: '{ext}'. Allowed file types are: PDF, PNG, JPG, JPEG.",
        )

    if file.content_type and file.content_type.lower() not in ALLOWED_MIME_TYPES and file.content_type != "application/octet-stream":
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported content type: '{file.content_type}'. Allowed types are: PDF, PNG, JPG, JPEG.",
        )


def save_upload_temp_file(
    file: UploadFile,
    temp_dir: str,
    processing_id: str,
    max_size_bytes: int = 20 * 1024 * 1024,
) -> Tuple[str, int]:
    """
    Save the uploaded file into temp_dir using a unique, sanitized name.
    Returns (temp_file_path, file_size_in_bytes).
    Raises HTTPException(400) for empty files or files exceeding max_size_bytes.
    """
    os.makedirs(temp_dir, exist_ok=True)
    raw_name = os.path.basename(file.filename or "document")
    clean_name = re.sub(r'[^a-zA-Z0-9_.-]', '_', raw_name)
    safe_filename = f"{processing_id}_{clean_name}"
    temp_path = os.path.join(temp_dir, safe_filename)

    total_size = 0
    try:
        if hasattr(file.file, "seek"):
            try:
                file.file.seek(0)
            except Exception:
                pass

        with open(temp_path, "wb") as buffer:
            while chunk := file.file.read(1024 * 1024):  # 1MB chunks
                total_size += len(chunk)
                if total_size > max_size_bytes:
                    raise HTTPException(
                        status_code=400,
                        detail=f"File size exceeds maximum allowed limit of {max_size_bytes // (1024 * 1024)} MB.",
                    )
                buffer.write(chunk)

        if hasattr(file.file, "seek"):
            try:
                file.file.seek(0)
            except Exception:
                pass

        if total_size == 0:
            cleanup_temp_file(temp_path)
            raise HTTPException(status_code=400, detail="Uploaded file is empty (0 bytes).")

        return temp_path, total_size

    except HTTPException:
        cleanup_temp_file(temp_path)
        raise
    except Exception as e:
        cleanup_temp_file(temp_path)
        logger.error(f"[FileUtils] Error saving temp file: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to store uploaded file: {str(e)}")


def cleanup_temp_file(file_path: Optional[str]) -> None:
    """Safely delete temporary file from disk"""
    if file_path and os.path.exists(file_path):
        try:
            os.remove(file_path)
            logger.debug(f"[FileUtils] Cleaned up temporary file: {file_path}")
        except Exception as e:
            logger.warning(f"[FileUtils] Could not delete temp file {file_path}: {e}")


def load_document_pages(file_path: str) -> Tuple[List[Image.Image], Optional[str]]:
    """
    Load document as a list of eager PIL RGB Images (handles multi-page PDFs and single images).
    Returns (pages_list, error_message).
    """
    if not os.path.exists(file_path):
        return [], f"File does not exist on disk: {file_path}"

    ext = os.path.splitext(file_path)[1].lower()
    pages: List[Image.Image] = []

    if ext == ".pdf":
        # 1. Try PyMuPDF (fitz) - Zero external dependencies
        try:
            # pyrefly: ignore [missing-import]
            import fitz  # type: ignore
            doc = fitz.open(file_path)
            if len(doc) == 0:
                return [], "PDF contains 0 pages."
            for page_idx in range(len(doc)):
                page = doc[page_idx]
                pix = page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5))
                img_data = pix.tobytes("png")
                pil_img = Image.open(io.BytesIO(img_data))
                pil_img.load()
                pages.append(pil_img.convert("RGB"))
            doc.close()
            return pages, None
        except ImportError:
            pass
        except Exception as e:
            return [], f"PyMuPDF rendering error: {str(e)}"

        # 2. Try pdf2image fallback
        try:
            # pyrefly: ignore [missing-import]
            from pdf2image import convert_from_path  # type: ignore
            converted = convert_from_path(file_path, dpi=150)
            for p in converted:
                p.load()
                pages.append(p.convert("RGB"))
            return pages, None
        except ImportError:
            return [], "Neither PyMuPDF ('pymupdf') nor 'pdf2image' is installed to process PDF files."
        except Exception as e:
            return [], f"Failed to render PDF pages using pdf2image: {str(e)}"

    elif ext in ALLOWED_EXTENSIONS:
        try:
            pil_img = Image.open(file_path)
            pil_img.load()
            return [pil_img.convert("RGB")], None
        except Exception as e:
            return [], f"Failed to open image file: {str(e)}"

    return [], f"Unsupported file extension: {ext}"


def load_document_image(file_path: str) -> Tuple[Optional[Image.Image], Optional[str]]:
    """Compatibility helper returning the first page as PIL Image"""
    pages, err = load_document_pages(file_path)
    if pages:
        return pages[0], None
    return None, err


def pil_to_cv2(pil_image: Image.Image):
    """Convert PIL image to OpenCV BGR numpy array safely"""
    import numpy as np
    if pil_image.mode != "RGB":
        pil_image = pil_image.convert("RGB")
    rgb = np.array(pil_image)
    try:
        import cv2
        return cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
    except ImportError:
        return rgb


def cv2_to_pil(cv_img):
    """Convert OpenCV BGR array to PIL RGB Image safely"""
    import numpy as np
    try:
        import cv2
        if len(cv_img.shape) == 2:  # Grayscale
            return Image.fromarray(cv_img).convert("RGB")
        rgb = cv2.cvtColor(cv_img, cv2.COLOR_BGR2RGB)
        return Image.fromarray(rgb)
    except ImportError:
        return Image.fromarray(cv_img)


