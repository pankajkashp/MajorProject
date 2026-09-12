import re
from typing import List, Optional, Dict
from app.providers.base import TopicProvider
from app.models.domain import TopicResult

class LocalTopicProvider(TopicProvider):
    """
    Lightweight rule and keyword/semantic cluster provider for regulatory e-consultation.
    """

    TOPIC_DEFINITIONS: Dict[str, Dict[str, any]] = {
        "Compliance Timelines & MSME Impact": {
            "keywords": ["timeline", "window", "msme", "startups", "startup", "grace period", "transition", "turnover", "exemption", "small business", "phase-in", "burden"],
            "section_clues": ["clause 7", "compliance timelines", "msme", "transition"]
        },
        "Algorithmic Transparency & AI Audits": {
            "keywords": ["algorithmic", "algorithm", "audit", "bias", "explainability", "neural", "shap", "lime", "code disclosure", "training dataset", "automated", "model"],
            "section_clues": ["clause 12", "algorithmic transparency", "audit", "ai"]
        },
        "Data Localization & Infrastructure": {
            "keywords": ["localization", "storage", "local storage", "cloud", "data center", "sovereignty", "domestic", "mirror cloud", "subsidies", "zero-trust"],
            "section_clues": ["clause 3", "data localization", "storage", "infrastructure"]
        },
        "Grievance Redressal & Consumer Rights": {
            "keywords": ["grievance", "redressal", "complaint", "48-hour", "resolution", "fraud", "regional language", "ombudsman", "consumer", "transparency report"],
            "section_clues": ["clause 15", "grievance redressal", "consumer"]
        },
        "Cross-Border Data Flows & Global Trade": {
            "keywords": ["cross-border", "trade", "bpo", "saas", "adequacy", "reciprocal", "iso/iec", "apec", "oecd", "negative list", "export"],
            "section_clues": ["clause 19", "cross-border", "international"]
        },
        "Penalties, Appeals & Safe Harbor": {
            "keywords": ["penalty", "penalties", "safe harbor", "turnover", "cure notice", "tribunal", "proportional", "deliberate", "procedural lapse", "punitive"],
            "section_clues": ["clause 23", "penalty", "safe harbor", "appeals"]
        }
    }

    def classify(self, text: str, section_hint: Optional[str] = None) -> TopicResult:
        clean_text = text.lower()
        hint_clean = (section_hint or "").lower()
        
        scores: Dict[str, float] = {}
        matched_phrases: Dict[str, List[str]] = {}

        for topic, config in self.TOPIC_DEFINITIONS.items():
            score = 0.0
            phrases = []

            # Check section hint match
            for clue in config["section_clues"]:
                if clue in hint_clean:
                    score += 5.0
                    phrases.append(clue)
                elif clue in clean_text:
                    score += 2.0
                    phrases.append(clue)

            # Check keyword match
            for kw in config["keywords"]:
                if re.search(r"\b" + re.escape(kw) + r"\b", clean_text):
                    score += 1.5
                    phrases.append(kw)

            scores[topic] = score
            matched_phrases[topic] = phrases

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
