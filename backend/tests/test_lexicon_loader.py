from app.core.lexicons.loader import LexiconLoader

def test_lexicon_loader():
    topics = LexiconLoader.load_topics()
    assert len(topics) >= 5
    assert "Compliance Timelines & MSME Impact" in topics
    assert "keywords" in topics["Compliance Timelines & MSME Impact"]
    assert "section_clues" in topics["Compliance Timelines & MSME Impact"]

    sentiment = LexiconLoader.load_sentiment()
    assert "positive_words" in sentiment
    assert "negative_words" in sentiment
    assert "burdensome" in sentiment["negative_words"]
    assert "welcome" in sentiment["positive_words"]
