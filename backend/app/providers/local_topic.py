import re
from typing import List, Optional, Dict, Any
from app.providers.base import TopicProvider
from app.models.domain import TopicResult
from app.core.lexicons.loader import LexiconLoader

class LocalTopicProvider(TopicProvider):
    """
    Configurable, explainable multi-topic classifier for policy consultation text.
    Loads topic and clause rule definitions from external configuration.
    """

    def __init__(self, topic_definitions: Optional[Dict[str, Dict[str, Any]]] = None):
        self.topic_definitions = topic_definitions or LexiconLoader.load_topics()

    def classify(self, text: str, section_hint: Optional[str] = None) -> TopicResult:
        if not text or len(text.strip()) == 0:
            return TopicResult(
                primary_topic="General Regulatory Provisions",
                secondary_topics=[],
                confidence=0.5,
                key_phrases=[]
            )

        clean_text = text.lower()
        hint_clean = (section_hint or "").lower()
        
        scores: Dict[str, float] = {}
        matched_phrases: Dict[str, List[str]] = {}

        for topic, config in self.topic_definitions.items():
            score = 0.0
            phrases: List[str] = []

            # 1. Section / Clause Hint Matches (Highest weight)
            for clue in config.get("section_clues", []):
                clue_clean = clue.lower()
                if clue_clean in hint_clean:
                    score += 5.0
                    phrases.append(clue)
                elif re.search(r"\b" + re.escape(clue_clean) + r"\b", clean_text):
                    score += 2.5
                    phrases.append(clue)

            # 2. Domain Keyword Matches
            for kw in config.get("keywords", []):
                kw_clean = kw.lower()
                if re.search(r"\b" + re.escape(kw_clean) + r"\b", clean_text):
                    score += 1.5
                    phrases.append(kw)

            if score > 0:
                scores[topic] = score
                matched_phrases[topic] = phrases

        if not scores:
            return TopicResult(
                primary_topic="General Regulatory Provisions",
                secondary_topics=[],
                confidence=0.5,
                key_phrases=["general consultation"]
            )

        # Sort topics by relevance score descending
        sorted_topics = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        top_topic, top_score = sorted_topics[0]

        # Secondary topics: any other topic with score >= 2.0
        secondary = [t for t, s in sorted_topics[1:4] if s >= 2.0]
        confidence = min(0.96, round(0.55 + (top_score / 10.0) * 0.4, 2))
        key_phrases = list(dict.fromkeys(matched_phrases.get(top_topic, [])))[:6]

        return TopicResult(
            primary_topic=top_topic,
            secondary_topics=secondary,
            confidence=confidence,
            key_phrases=key_phrases
        )
