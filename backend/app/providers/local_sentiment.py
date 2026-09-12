import re
from typing import List, Tuple
from app.providers.base import SentimentProvider
from app.models.domain import SentimentResult

class LocalSentimentProvider(SentimentProvider):
    """
    Lightweight rule and lexicon-based sentiment provider tailored for public consultation
    and regulatory submissions without requiring external LLM dependencies.
    """

    POSITIVE_WORDS = {
        "welcome": 1.5, "commendable": 1.4, "progressive": 1.3, "support": 1.2,
        "appreciate": 1.1, "vital": 1.0, "endorse": 1.4, "appropriate": 0.9,
        "strengthen": 1.1, "effective": 1.0, "beneficial": 1.2, "foster": 1.0,
        "robust": 1.0, "positive": 1.0, "good": 0.8, "clarity": 0.9,
        "constructive": 1.0, "balanced": 1.1, "innovative": 1.0, "seamless": 1.1
    }

    NEGATIVE_WORDS = {
        "burdensome": -1.6, "punitive": -1.5, "conflict": -1.3, "ambiguity": -1.2,
        "friction": -1.2, "disproportionately": -1.4, "infeasible": -1.5,
        "costly": -1.3, "isolate": -1.2, "crushed": -1.7, "harm": -1.4,
        "lack": -1.1, "lacks": -1.1, "threat": -1.4, "severe": -1.5,
        "severely": -1.6, "bankrupt": -1.8, "vulnerable": -1.3, "impractical": -1.4,
        "oppose": -1.5, "excessive": -1.3, "heavy": -0.8, "arbitrary": -1.4,
        "unclear": -1.0, "flawed": -1.5, "unreasonable": -1.4, "disruption": -1.3
    }

    INTENSIFIERS = {
        "very": 1.3, "strongly": 1.5, "severely": 1.6, "exponentially": 1.5,
        "wholeheartedly": 1.6, "deeply": 1.4, "extremely": 1.5, "totally": 1.3,
        "highly": 1.3, "exceptionally": 1.4
    }

    NEGATORS = {"not", "cannot", "never", "without", "hardly", "barely", "lacks", "lack"}

    def analyze(self, text: str) -> SentimentResult:
        clean_text = text.lower()
        words = re.findall(r"\b\w+\b", clean_text)
        
        pos_score = 0.0
        neg_score = 0.0
        cues: List[str] = []
        
        for i, word in enumerate(words):
            multiplier = 1.0
            # Lookback for intensifier
            if i > 0 and words[i-1] in self.INTENSIFIERS:
                multiplier *= self.INTENSIFIERS[words[i-1]]
            # Lookback for negator
            is_negated = False
            if i > 0 and words[i-1] in self.NEGATORS:
                is_negated = True
            elif i > 1 and words[i-2] in self.NEGATORS:
                is_negated = True
                
            if word in self.POSITIVE_WORDS:
                val = self.POSITIVE_WORDS[word] * multiplier
                if is_negated:
                    neg_score += val * 0.9
                    cues.append(f"negated_{word}")
                else:
                    pos_score += val
                    cues.append(word)
            elif word in self.NEGATIVE_WORDS:
                val = abs(self.NEGATIVE_WORDS[word]) * multiplier
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
