from typing import List, Dict, Optional
from datetime import datetime, timezone

from app.core.config import settings
from app.core.logging import logger
from app.models.domain import (
    ConsultationComment,
    AnalysisResult,
    SentimentResult,
    TopicResult,
    ConcernItem,
    SuggestionItem,
    SummaryResult
)
from app.providers.base import (
    SentimentProvider,
    TopicProvider,
    ExtractionProvider,
    SummarizationProvider
)
from app.providers.local_sentiment import LocalSentimentProvider
from app.providers.local_topic import LocalTopicProvider
from app.providers.local_extraction import LocalExtractionProvider
from app.providers.local_summarizer import LocalSummarizationProvider

class AnalysisService:
    """
    Core AI/NLP Analysis Service.
    Coordinates sentiment analysis, topic classification, concern & suggestion extraction,
    and structured summarization via modular provider interfaces.
    """

    def __init__(
        self,
        sentiment_provider: Optional[SentimentProvider] = None,
        topic_provider: Optional[TopicProvider] = None,
        extraction_provider: Optional[ExtractionProvider] = None,
        summarization_provider: Optional[SummarizationProvider] = None
    ):
        # Factory initialization based on config
        self.sentiment_provider = sentiment_provider or self._resolve_sentiment_provider()
        self.topic_provider = topic_provider or self._resolve_topic_provider()
        self.extraction_provider = extraction_provider or self._resolve_extraction_provider()
        self.summarization_provider = summarization_provider or self._resolve_summarization_provider()
        
        self._analysis_cache: Dict[str, AnalysisResult] = {}

    def _resolve_sentiment_provider(self) -> SentimentProvider:
        return LocalSentimentProvider()

    def _resolve_topic_provider(self) -> TopicProvider:
        return LocalTopicProvider()

    def _resolve_extraction_provider(self) -> ExtractionProvider:
        return LocalExtractionProvider()

    def _resolve_summarization_provider(self) -> SummarizationProvider:
        return LocalSummarizationProvider()

    def analyze_comment(self, comment: ConsultationComment) -> AnalysisResult:
        """Run complete analysis pipeline on a single comment."""
        # 1. Sentiment Analysis
        sentiment = self.sentiment_provider.analyze(comment.comment)

        # 2. Topic Classification
        topic = self.topic_provider.classify(comment.comment, section_hint=comment.section)

        # 3. Concern & Suggestion Extraction
        concerns, suggestions = self.extraction_provider.extract(comment.comment, comment_id=comment.id)

        # 4. Policy Summarization
        summary = self.summarization_provider.summarize(comment.comment, concerns, suggestions)

        result = AnalysisResult(
            comment_id=comment.id,
            sentiment=sentiment,
            topic=topic,
            concerns=concerns,
            suggestions=suggestions,
            summary=summary,
            processed_at=datetime.now(timezone.utc)
        )

        self._analysis_cache[comment.id] = result
        return result

    def analyze_batch(self, comments: List[ConsultationComment]) -> List[AnalysisResult]:
        """Run batch analysis pipeline across multiple comments."""
        results: List[AnalysisResult] = []
        for comment in comments:
            results.append(self.analyze_comment(comment))
        return results

    def get_analysis(self, comment_id: str) -> Optional[AnalysisResult]:
        return self._analysis_cache.get(comment_id)

    def get_all_analyses(self) -> Dict[str, AnalysisResult]:
        return self._analysis_cache

analysis_service = AnalysisService()
