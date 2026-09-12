import re
from typing import List, Tuple, Dict, Any, Optional
from app.providers.base import SentimentProvider
from app.models.domain import SentimentResult
from app.core.lexicons.loader import LexiconLoader

class LocalSentimentProvider(SentimentProvider):
    """
    Explainable, deterministic rule-and-lexicon based sentiment analyzer for policy feedback.
    Features:
    - Domain policy lexicon scoring
    - Multi-word negation detection (e.g., 'not viable', 'lacks clarity', 'cannot comply')
    - Intensifier multipliers (e.g., 'severely burdensome', 'wholeheartedly welcome')
    - Mixed sentiment detection for nuanced regulatory submissions
    """

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        cfg = config or LexiconLoader.load_sentiment()
        self.positive_words = cfg.get("positive_words", {})
        self.negative_words = cfg.get("negative_words", {})
        self.intensifiers = cfg.get("intensifiers", {})
        self.negators = set(cfg.get("negators", ["not", "cannot", "never", "without", "hardly", "barely", "lacks", "lack"]))

    def analyze(self, text: str) -> SentimentResult:
        if not text or len(text.strip()) == 0:
            return SentimentResult(
                label="Neutral",
                score=0.0,
                confidence=0.5,
                polarity_cues=[]
            )

        clean_text = text.lower()
        words = re.findall(r"\b\w+\b", clean_text)
        
        pos_score = 0.0
        neg_score = 0.0
        cues: List[str] = []
        
        for i, word in enumerate(words):
            multiplier = 1.0
            
            # Check for preceding intensifier
            if i > 0 and words[i-1] in self.intensifiers:
                multiplier *= self.intensifiers[words[i-1]]
                
            # Check for preceding negator (lookback 1 and 2 words)
            is_negated = False
            if i > 0 and words[i-1] in self.negators:
                is_negated = True
            elif i > 1 and words[i-2] in self.negators:
                is_negated = True

            if word in self.positive_words:
                base_val = self.positive_words[word] * multiplier
                if is_negated:
                    # e.g., 'not commendable' -> negative signal
                    neg_score += base_val * 0.9
                    cues.append(f"negated_{word}")
                else:
                    pos_score += base_val
                    cues.append(word)

            elif word in self.negative_words:
                base_val = abs(self.negative_words[word]) * multiplier
                if is_negated:
                    # e.g., 'without ambiguity' -> positive signal
                    pos_score += base_val * 0.7
                    cues.append(f"not_{word}")
                else:
                    neg_score += base_val
                    cues.append(word)

        total_signal = pos_score + neg_score

        # Case 1: Neutral (no significant signals)
        if total_signal < 0.3:
            return SentimentResult(
                label="Neutral",
                score=0.0,
                confidence=0.7,
                polarity_cues=cues
            )

        # Calculate raw net polarity ratio
        net = (pos_score - neg_score) / (pos_score + neg_score)
        net_clamped = max(-1.0, min(1.0, round(net, 3)))
        confidence = min(0.96, round(0.55 + (total_signal / 8.0) * 0.4, 2))

        # Case 2: Mixed Sentiment (significant positive AND significant negative signals)
        # e.g., 'We welcome X, but Y is severely burdensome'
        if pos_score >= 1.0 and neg_score >= 1.0:
            label = "Mixed"
        elif net_clamped > 0.15:
            label = "Positive"
        elif net_clamped < -0.15:
            label = "Negative"
        else:
            label = "Neutral"

        return SentimentResult(
            label=label,
            score=net_clamped,
            confidence=confidence,
            polarity_cues=list(dict.fromkeys(cues))[:8]
        )
