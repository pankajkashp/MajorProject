from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from datetime import datetime, timezone

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class ConsultationComment(BaseModel):
    """
    Standard internal representation of a public consultation submission.
    Normalized from raw source inputs (CSV, database, portal API).
    """
    id: str
    comment: str
    consultation_id: Optional[str] = "DPA-CONS-2026"
    section: Optional[str] = None
    stakeholder_type: Optional[str] = "General Public"
    source: str = "e-consultation-portal"
    language: Optional[str] = "en"
    metadata: Dict[str, Any] = Field(default_factory=dict)

class SentimentResult(BaseModel):
    label: str  # Positive, Negative, Neutral, Mixed
    score: float  # -1.0 to +1.0
    confidence: float  # 0.0 to 1.0
    polarity_cues: List[str] = Field(default_factory=list)

class TopicResult(BaseModel):
    primary_topic: str
    secondary_topics: List[str] = Field(default_factory=list)
    confidence: float
    key_phrases: List[str] = Field(default_factory=list)

class ConcernItem(BaseModel):
    id: str
    text: str
    category: str
    severity: str  # Critical, High, Medium, Low
    text_span: Optional[str] = None

class SuggestionItem(BaseModel):
    id: str
    text: str
    action_type: str  # Amendment, Exemption, Extension, Clarification, New Provision
    text_span: Optional[str] = None

class SummaryResult(BaseModel):
    headline: str
    tl_dr: str
    key_takeaways: List[str] = Field(default_factory=list)

class AnalysisResult(BaseModel):
    comment_id: str
    sentiment: SentimentResult
    topic: TopicResult
    concerns: List[ConcernItem] = Field(default_factory=list)
    suggestions: List[SuggestionItem] = Field(default_factory=list)
    summary: SummaryResult
    processed_at: datetime = Field(default_factory=utc_now)

class EvidenceQuote(BaseModel):
    comment_id: str
    stakeholder_type: str
    organization_or_individual: Optional[str] = None
    section: Optional[str] = None
    verbatim_text: str
    sentiment_label: str
    extracted_concerns: List[str] = Field(default_factory=list)
    extracted_suggestions: List[str] = Field(default_factory=list)

class PriorityFactors(BaseModel):
    frequency_score: float
    sentiment_intensity_score: float
    stakeholder_diversity_score: float
    severity_score: float
    raw_score: float

class PolicyInsight(BaseModel):
    """
    Evidence-Linked Policy Insight Layer.
    Aggregates multi-stakeholder feedback into traceable, actionable policy insights.
    """
    id: str
    title: str
    topic: str
    section: Optional[str] = None
    concern: str
    suggestion: str
    frequency: int
    frequency_percentage: float
    sentiment_distribution: Dict[str, int] = Field(default_factory=dict)
    dominant_sentiment: str
    average_sentiment_score: float
    stakeholder_groups: List[str] = Field(default_factory=list)
    stakeholder_count: int
    stakeholder_breakdown: Dict[str, int] = Field(default_factory=dict)
    stakeholder_consensus: str
    priority_score: float
    priority_level: str  # HIGH, MEDIUM, LOW
    priority_factors: PriorityFactors
    priority_explanation: str
    supporting_comment_ids: List[str] = Field(default_factory=list)
    supporting_evidence: List[EvidenceQuote] = Field(default_factory=list)
