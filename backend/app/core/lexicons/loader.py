import os
import json
from typing import Dict, Any
from app.core.logging import logger

_BASE_DIR = os.path.dirname(os.path.abspath(__file__))

class LexiconLoader:
    """
    Configuration boundary for loading external NLP lexicons, keywords, and rules.
    Prevents scattered file reads and provides fallback defaults.
    """

    @classmethod
    def load_topics(cls) -> Dict[str, Dict[str, Any]]:
        file_path = os.path.join(_BASE_DIR, "topics.json")
        try:
            if os.path.exists(file_path):
                with open(file_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            logger.warning(f"Topics lexicon file not found at {file_path}, using empty defaults.")
            return {}
        except Exception as e:
            logger.error(f"Error loading topics lexicon: {e}")
            return {}

    @classmethod
    def load_sentiment(cls) -> Dict[str, Any]:
        file_path = os.path.join(_BASE_DIR, "sentiment.json")
        try:
            if os.path.exists(file_path):
                with open(file_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            logger.warning(f"Sentiment lexicon file not found at {file_path}, using empty defaults.")
            return {"positive_words": {}, "negative_words": {}, "intensifiers": {}, "negators": []}
        except Exception as e:
            logger.error(f"Error loading sentiment lexicon: {e}")
            return {"positive_words": {}, "negative_words": {}, "intensifiers": {}, "negators": []}
