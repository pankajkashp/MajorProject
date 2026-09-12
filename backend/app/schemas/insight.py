from typing import List, Optional, Dict
from pydantic import BaseModel
from app.models.domain import EvidenceQuote, PriorityFactors

class PolicyInsightResponse(BaseModel):
    id: str
    title: str
    topic: str
    section: Optional[str] = None
    concern: str
    suggestion: str
    frequency: int
    frequency_percentage: float
    sentiment_distribution: Dict[str, int]
    dominant_sentiment: str
    average_sentiment_score: float
    stakeholder_groups: List[str]
    stakeholder_count: int
    stakeholder_breakdown: Dict[str, int]
    stakeholder_consensus: str
    priority_score: float
    priority_level: str  # HIGH, MEDIUM, LOW
    priority_factors: PriorityFactors
    priority_explanation: str
    supporting_comment_ids: List[str]
    supporting_evidence: List[EvidenceQuote]

class PolicyInsightListResponse(BaseModel):
    total: int
    high_count: int
    medium_count: int
    low_count: int
    items: List[PolicyInsightResponse]
