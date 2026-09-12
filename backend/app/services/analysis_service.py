from typing import List, Dict, Optional
from datetime import datetime, timezone
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
    Coordinates sentiment analysis, multi-topic classification, concern & suggestion extraction,
    and structured policy summarization via modular provider interfaces.
    """

    def __init__(
        self,
        sentiment_provider: Optional[SentimentProvider] = None,
        topic_provider: Optional[TopicProvider] = None,
        extraction_provider: Optional[ExtractionProvider] = None,
        summarization_provider: Optional[SummarizationProvider] = None
    ):
        self.sentiment_provider = sentiment_provider or LocalSentimentProvider()
        self.topic_provider = topic_provider or LocalTopicProvider()
        self.extraction_provider = extraction_provider or LocalExtractionProvider()
        self.summarization_provider = summarization_provider or LocalSummarizationProvider()
        
        self._analysis_cache: Dict[str, AnalysisResult] = {}

    def analyze_comment(self, comment: ConsultationComment) -> AnalysisResult:
        """Runs the full 4-stage pipeline on a single consultation comment."""
        # 1. Sentiment Analysis
        sentiment = self.sentiment_provider.analyze(comment.comment)

        # 2. Topic & Clause Classification
        topic = self.topic_provider.classify(comment.comment, section_hint=comment.section)

        # 3. Concern & Suggestion Extraction
        concerns, suggestions = self.extraction_provider.extract(comment.comment, comment_id=comment.id)

        # 4. Structured Policy Summarization
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
        """
        Runs batch analysis with item-level error isolation.
        A failure on an individual malformed record does not crash the entire batch.
        """
        results: List[AnalysisResult] = []
        for comment in comments:
            try:
                result = self.analyze_comment(comment)
                results.append(result)
            except Exception as e:
                logger.error(f"Error analyzing comment {comment.id}: {e}")
                # Fallback graceful result
                fallback_result = AnalysisResult(
                    comment_id=comment.id,
                    sentiment=SentimentResult(label="Neutral", score=0.0, confidence=0.0, polarity_cues=[]),
                    topic=TopicResult(primary_topic="General Regulatory Provisions", secondary_topics=[], confidence=0.0, key_phrases=[]),
                    concerns=[],
                    suggestions=[],
                    summary=SummaryResult(headline="Analysis Error", tl_dr=f"Failed to process: {str(e)}", key_takeaways=[]),
                    processed_at=datetime.now(timezone.utc)
                )
                results.append(fallback_result)
        return results

    def get_analysis(self, comment_id: str) -> Optional[AnalysisResult]:
        return self._analysis_cache.get(comment_id)

    def get_all_analyses(self) -> Dict[str, AnalysisResult]:
        return self._analysis_cache

analysis_service = AnalysisService()
