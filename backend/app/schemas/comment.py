from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from app.models.domain import ConsultationComment, AnalysisResult

class CommentCreate(BaseModel):
    id: Optional[str] = None
    comment: str = Field(..., min_length=3, description="Public consultation feedback text")
    consultation_id: Optional[str] = "DPA-CONS-2026"
    section: Optional[str] = None
    stakeholder_type: Optional[str] = "General Public"
    organization_or_individual: Optional[str] = None
    source: Optional[str] = "e-consultation-portal"
    language: Optional[str] = "en"
    metadata: Dict[str, Any] = Field(default_factory=dict)

class CommentResponse(BaseModel):
    id: str
    comment: str
    consultation_id: Optional[str] = None
    section: Optional[str] = None
    stakeholder_type: Optional[str] = None
    organization_or_individual: Optional[str] = None
    source: str
    language: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    analysis: Optional[AnalysisResult] = None

class CommentListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: List[CommentResponse]
