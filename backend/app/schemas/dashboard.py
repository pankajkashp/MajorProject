from typing import List, Dict, Any
from pydantic import BaseModel
from app.schemas.insight import PolicyInsightResponse

class SentimentDistribution(BaseModel):
    positive: int
    negative: int
    neutral: int
    mixed: int
    average_polarity: float

class StakeholderMetric(BaseModel):
    stakeholder_type: str
    count: int
    percentage: float
    predominant_sentiment: str

class TopicMetric(BaseModel):
    topic: str
    count: int
    percentage: float
    sentiment_score: float
    critical_concerns_count: int

class PriorityAlert(BaseModel):
    id: str
    headline: str
    topic: str
    priority_level: str
    priority_score: float
    affected_stakeholders: List[str]
    suggested_action: str

class DashboardSummaryResponse(BaseModel):
    total_comments: int
    total_stakeholder_groups: int
    sentiment_distribution: SentimentDistribution
    top_topics: List[TopicMetric]
    stakeholder_breakdown: List[StakeholderMetric]
    priority_alerts: List[PriorityAlert]
    total_insights_generated: int
    actionable_suggestions_count: int
    critical_friction_points: int
