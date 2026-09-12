import re
from typing import List, Tuple, Dict, Any, Optional
from app.providers.base import SentimentProvider
from app.models.domain import SentimentResult
from app.core.lexicons.loader import LexiconLoader

class LocalSentimentProvider(SentimentProvider):
    """
    Lightweight rule and lexicon-based sentiment provider tailored for public consultation
    and regulatory submissions. Loads external sentiment configuration.
    """

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        cfg = config or LexiconLoader.load_sentiment()
        self.positive_words = cfg.get("positive_words", {})
        self.negative_words = cfg.get("negative_words", {})
        self.intensifiers = cfg.get("intensifiers", {})
        self.negators = set(cfg.get("negators", []))

    def analyze(self, text: str) -> SentimentResult:
        clean_text = text.lower()
        words = re.findall(r"\b\w+\b", clean_text)
        
        pos_score = 0.0
        neg_score = 0.0
        cues: List[str] = []
        
        for i, word in enumerate(words):
            multiplier = 1.0
            # Lookback for intensifier
            if i > 0 and words[i-1] in self.intensifiers:
                multiplier *= self.intensifiers[words[i-1]]
            # Lookback for negator
            is_negated = False
            if i > 0 and words[i-1] in self.negators:
                is_negated = True
            elif i > 1 and words[i-2] in self.negators:
                is_negated = True
                
            if word in self.positive_words:
                val = self.positive_words[word] * multiplier
                if is_negated:
                    neg_score += val * 0.9
                    cues.append(f"negated_{word}")
                else:
                    pos_score += val
                    cues.append(word)
            elif word in self.negative_words:
                val = abs(self.negative_words[word]) * multiplier
                if is_negated:
                    pos_score += val * 0.6
                    cues.append(f"not_{word}")
                else:
                    neg_score += val
                    cues.append(word)

        total_signal = pos_score + neg_score
        if total_signal == 0:
            return SentimentResult(
                label="Neutral",
                score=0.0,
                confidence=0.6,
                polarity_cues=[]
            )

        # Net polarity between -1.0 and 1.0
        net = (pos_score - neg_score) / (pos_score + neg_score)
        net_clamped = max(-1.0, min(1.0, round(net, 3)))
        confidence = min(0.95, round(0.55 + (total_signal / 10.0) * 0.4, 2))

        # Determine label (checking for mixed signals)
        if pos_score > 1.2 and neg_score > 1.2:
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
            polarity_cues=list(set(cues))[:6]
        )
