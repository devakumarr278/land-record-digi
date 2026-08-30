from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class Boundaries(BaseModel):
    north: Optional[str] = None
    south: Optional[str] = None
    east: Optional[str] = None
    west: Optional[str] = None


class ExtractedData(BaseModel):
    survey_number: Optional[str] = Field(default=None, validation_alias="surveyNumber")
    sub_division: Optional[str] = Field(default=None, validation_alias="subDivision")
    owner_name: Optional[str] = Field(default=None, validation_alias="ownerName")
    father_name: Optional[str] = Field(default=None, validation_alias="fatherName")
    district: Optional[str] = None
    taluk: Optional[str] = None
    village: Optional[str] = None
    area: Optional[float] = Field(default=None, validation_alias="landArea")
    area_unit: Optional[str] = Field(default="Acres", validation_alias="areaUnit")
    classification: Optional[str] = None
    boundaries: Boundaries = Field(default_factory=Boundaries)

    model_config = ConfigDict(populate_by_name=True, extra="allow")


class OCRPageResult(BaseModel):
    page_number: int = Field(..., validation_alias="page")
    text: Optional[str] = None

    model_config = ConfigDict(populate_by_name=True, extra="allow")


class OCRData(BaseModel):
    success: bool = True
    model_used: Optional[str] = Field(default=None, validation_alias="model")
    full_text: Optional[str] = Field(default=None, validation_alias="fullText")
    pages: List[OCRPageResult] = Field(default_factory=list)

    model_config = ConfigDict(populate_by_name=True, extra="allow")


class ConfidenceData(BaseModel):
    overall: float = 0.0
    fields: Dict[str, float] = Field(default_factory=dict)


class ProcessingInfo(BaseModel):
    used_fallback: bool = False
    processing_time_seconds: float = 0.0


class ProcessDocumentResponse(BaseModel):
    success: bool = True
    processing_id: str = Field(..., validation_alias="documentId")
    filename: str = Field(default="document")
    document_type: str = Field(default="PATTA", validation_alias="documentType")
    classification_confidence: float = 0.94
    pages_processed: int = 1
    ocr: OCRData
    extracted_data: ExtractedData = Field(..., validation_alias="extractedData")
    confidence: ConfidenceData
    processing: ProcessingInfo

    # Node.js backend orchestrator compatibility attributes
    language: List[str] = Field(default_factory=lambda: ["Tamil", "English"])
    documentId: Optional[str] = None
    documentType: Optional[str] = None
    extractedData: Optional[Dict[str, Any]] = None
    fieldConfidence: Optional[Dict[str, float]] = None
    overallConfidence: Optional[float] = None
    processingMode: Optional[str] = "AI"
    fallbackReason: Optional[str] = None
    notes: List[str] = Field(default_factory=list)
    stages: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(populate_by_name=True, extra="allow")
