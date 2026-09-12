from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from app.models.domain import AnalysisResult, SentimentResult, TopicResult, ConcernItem, SuggestionItem, SummaryResult

class AnalyzeCommentRequest(BaseModel):
    id: Optional[str] = "TEMP-001"
    comment: str = Field(..., min_length=2, description="Feedback text to analyze")
    section: Optional[str] = None
    stakeholder_type: Optional[str] = None
    organization_or_individual: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

class AnalyzeBatchRequest(BaseModel):
    comments: List[AnalyzeCommentRequest]

class AnalysisResponse(BaseModel):
    success: bool = True
    comment_id: str
    sentiment: SentimentResult
    topic: TopicResult
    concerns: List[ConcernItem]
    suggestions: List[SuggestionItem]
    summary: SummaryResult
    processed_at: str

class BatchAnalysisResponse(BaseModel):
    success: bool = True
    total_processed: int
    results: List[AnalysisResponse]
