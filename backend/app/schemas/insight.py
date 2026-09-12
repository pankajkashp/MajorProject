from typing import List, Optional, Dict
from pydantic import BaseModel
from app.models.domain import PolicyInsight, EvidenceQuote, PriorityBreakdown

class PolicyInsightResponse(BaseModel):
    id: str
    title: str
    topic: str
    section: Optional[str] = None
    priority_level: str
    priority_score: float
    priority_breakdown: PriorityBreakdown
    priority_explanation: str
    frequency_count: int
    stakeholder_consensus: str
    affected_stakeholders: List[str]
    sentiment_distribution: Dict[str, int]
    concern_summary: str
    suggestion_summary: str
    evidence_quotes: List[EvidenceQuote]
    supporting_comment_ids: List[str]

class PolicyInsightListResponse(BaseModel):
    total: int
    critical_count: int
    high_count: int
    medium_count: int
    low_count: int
    items: List[PolicyInsightResponse]
