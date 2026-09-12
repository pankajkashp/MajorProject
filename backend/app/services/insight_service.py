from typing import List, Optional, Dict
from app.models.domain import PolicyInsight
from app.providers.base import InsightProvider
from app.providers.local_insight import EvidenceLinkedInsightEngine
from app.services.dataset_service import dataset_service
from app.services.analysis_service import analysis_service

class InsightService:
    """
    Evidence-Linked Policy Insight Service.
    Aggregates comment extractions into actionable, high-priority policy recommendations
    with linked verifiable supporting quotes.
    """

    def __init__(self, insight_provider: Optional[InsightProvider] = None):
        self.insight_provider = insight_provider or EvidenceLinkedInsightEngine()
        self._cached_insights: List[PolicyInsight] = []
        self._initialized = False

    def refresh_insights(self) -> List[PolicyInsight]:
        comments = dataset_service.get_all()
        # Ensure all comments have analyses
        analyses = analysis_service.get_all_analyses()
        if len(analyses) < len(comments):
            for c in comments:
                if c.id not in analyses:
                    analysis_service.analyze_comment(c)
            analyses = analysis_service.get_all_analyses()

        self._cached_insights = self.insight_provider.synthesize_insights(comments, analyses)
        self._initialized = True
        return self._cached_insights

    def get_all(self) -> List[PolicyInsight]:
        if not self._initialized or not self._cached_insights:
            self.refresh_insights()
        return self._cached_insights

    def get_by_id(self, insight_id: str) -> Optional[PolicyInsight]:
        insights = self.get_all()
        for ins in insights:
            if ins.id == insight_id:
                return ins
        return None

insight_service = InsightService()
