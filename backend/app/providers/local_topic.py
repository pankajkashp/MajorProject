import re
from typing import List, Optional, Dict
from app.providers.base import TopicProvider
from app.models.domain import TopicResult
from app.core.lexicons.loader import LexiconLoader

class LocalTopicProvider(TopicProvider):
    """
    Lightweight rule and keyword/semantic cluster provider for regulatory e-consultation.
    Loads topic and clause rule definitions from external configuration.
    """

    def __init__(self, topic_definitions: Optional[Dict[str, Dict[str, any]]] = None):
        self.topic_definitions = topic_definitions or LexiconLoader.load_topics()

    def classify(self, text: str, section_hint: Optional[str] = None) -> TopicResult:
        clean_text = text.lower()
        hint_clean = (section_hint or "").lower()
        
        scores: Dict[str, float] = {}
        matched_phrases: Dict[str, List[str]] = {}

        for topic, config in self.topic_definitions.items():
            score = 0.0
            phrases = []

            # Check section hint match
            for clue in config.get("section_clues", []):
                if clue in hint_clean:
                    score += 5.0
                    phrases.append(clue)
                elif clue in clean_text:
                    score += 2.0
                    phrases.append(clue)

            # Check keyword match
            for kw in config.get("keywords", []):
                if re.search(r"\b" + re.escape(kw) + r"\b", clean_text):
                    score += 1.5
                    phrases.append(kw)

            scores[topic] = score
            matched_phrases[topic] = phrases

        if not scores:
            return TopicResult(
                primary_topic="General Regulatory Provisions",
                secondary_topics=[],
                confidence=0.5,
                key_phrases=["general regulatory consultation"]
            )

        # Sort topics by score
        sorted_topics = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        top_topic, top_score = sorted_topics[0]

        if top_score == 0:
            top_topic = "General Regulatory Provisions"
            secondary = []
            confidence = 0.5
            key_phrases = ["general regulatory consultation"]
        else:
            secondary = [t for t, s in sorted_topics[1:3] if s > 1.5]
            confidence = min(0.96, round(0.55 + (top_score / 12.0) * 0.4, 2))
            key_phrases = list(dict.fromkeys(matched_phrases.get(top_topic, [])))[:5]

        return TopicResult(
            primary_topic=top_topic,
            secondary_topics=secondary,
            confidence=confidence,
            key_phrases=key_phrases
        )
