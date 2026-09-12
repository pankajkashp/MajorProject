from typing import List, Optional, Dict
from app.models.domain import PolicyInsight
from app.providers.base import InsightProvider
from app.providers.local_insight import EvidenceLinkedInsightEngine
from app.services.dataset_service import dataset_service
from app.services.analysis_service import analysis_service

class InsightService:
    """
    Evidence-Linked Policy Insight Service Boundary.
    Orchestrates the InsightProvider across the consultation dataset and exposes
    structured, filterable PolicyInsight objects.
    """

    def __init__(self, insight_provider: Optional[InsightProvider] = None):
        self.insight_provider = insight_provider or EvidenceLinkedInsightEngine()
        self._cached_insights: List[PolicyInsight] = []
        self._initialized = False

    def refresh_insights(self) -> List[PolicyInsight]:
        comments = dataset_service.get_all()
        analyses = analysis_service.get_all_analyses()
        
        # Ensure all comments have analysis records
        if len(analyses) < len(comments):
            for c in comments:
                if c.id not in analyses:
                    analysis_service.analyze_comment(c)
            analyses = analysis_service.get_all_analyses()

        self._cached_insights = self.insight_provider.synthesize_insights(comments, analyses)
        self._initialized = True
        return self._cached_insights

    def get_all(
        self,
        priority: Optional[str] = None,
        topic: Optional[str] = None,
        stakeholder: Optional[str] = None,
        sentiment: Optional[str] = None
    ) -> List[PolicyInsight]:
        if not self._initialized or not self._cached_insights:
            self.refresh_insights()

        results = self._cached_insights

        # Filter by Priority
        if priority and priority.lower() != "all":
            results = [i for i in results if i.priority_level.lower() == priority.lower()]

        # Filter by Topic
        if topic and topic.lower() != "all":
            results = [i for i in results if topic.lower() in i.topic.lower()]

        # Filter by Stakeholder Group
        if stakeholder and stakeholder.lower() != "all":
            results = [
                i for i in results
                if any(stakeholder.lower() in s.lower() for s in i.stakeholder_groups)
            ]

        # Filter by Sentiment
        if sentiment and sentiment.lower() != "all":
            results = [
                i for i in results
                if i.dominant_sentiment.lower() == sentiment.lower()
                or sentiment.capitalize() in i.sentiment_distribution
            ]

        return results

    def get_by_id(self, insight_id: str) -> Optional[PolicyInsight]:
        insights = self.get_all()
        for ins in insights:
            if ins.id == insight_id:
                return ins
        return None

insight_service = InsightService()
