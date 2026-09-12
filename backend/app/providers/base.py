from abc import ABC, abstractmethod
from typing import List, Tuple, Dict, Optional
from app.models.domain import (
    SentimentResult,
    TopicResult,
    ConcernItem,
    SuggestionItem,
    SummaryResult,
    PolicyInsight,
    ConsultationComment,
    AnalysisResult
)

class SentimentProvider(ABC):
    """Abstract interface for Sentiment Analysis provider."""
    @abstractmethod
    def analyze(self, text: str) -> SentimentResult:
        pass

class TopicProvider(ABC):
    """Abstract interface for Topic Identification provider."""
    @abstractmethod
    def classify(self, text: str, section_hint: Optional[str] = None) -> TopicResult:
        pass

class ExtractionProvider(ABC):
    """Abstract interface for Policy Concern & Suggestion extraction."""
    @abstractmethod
    def extract(self, text: str, comment_id: str = "item") -> Tuple[List[ConcernItem], List[SuggestionItem]]:
        pass

class SummarizationProvider(ABC):
    """Abstract interface for structured Policy Summarization."""
    @abstractmethod
    def summarize(
        self,
        text: str,
        concerns: List[ConcernItem],
        suggestions: List[SuggestionItem]
    ) -> SummaryResult:
        pass

class InsightProvider(ABC):
    """Abstract interface for Evidence-Linked Policy Insight Synthesis."""
    @abstractmethod
    def synthesize_insights(
        self,
        comments: List[ConsultationComment],
        analyses: Dict[str, AnalysisResult]
    ) -> List[PolicyInsight]:
        pass
