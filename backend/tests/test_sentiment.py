from app.providers.local_sentiment import LocalSentimentProvider

def test_positive_sentiment():
    provider = LocalSentimentProvider()
    res = provider.analyze("We wholeheartedly welcome this progressive and beneficial framework to strengthen transparency.")
    assert res.label == "Positive"
    assert res.score > 0.3
    assert res.confidence > 0.6

def test_negative_sentiment():
    provider = LocalSentimentProvider()
    res = provider.analyze("The proposed 30-day window is severely burdensome, impractical, and will bankrupt early-stage startups.")
    assert res.label == "Negative"
    assert res.score < -0.3
    assert "burdensome" in res.polarity_cues or "severely" in res.polarity_cues or "bankrupt" in res.polarity_cues

def test_mixed_or_neutral_sentiment():
    provider = LocalSentimentProvider()
    res = provider.analyze("The draft has been published for general consultation regarding standard clause definitions.")
    assert res.label in ["Neutral", "Mixed"]
