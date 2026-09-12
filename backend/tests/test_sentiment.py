from app.providers.local_sentiment import LocalSentimentProvider

def test_positive_sentiment():
    provider = LocalSentimentProvider()
    res = provider.analyze("We wholeheartedly welcome this progressive and beneficial framework to strengthen transparency.")
    assert res.label == "Positive"
    assert res.score > 0.3
    assert res.confidence > 0.6
    assert any(cue in ["welcome", "progressive", "beneficial", "strengthen"] for cue in res.polarity_cues)

def test_negative_sentiment_with_intensifiers():
    provider = LocalSentimentProvider()
    res = provider.analyze("The proposed 30-day window is severely burdensome, impractical, and will bankrupt early-stage startups.")
    assert res.label == "Negative"
    assert res.score < -0.4
    assert any(cue in ["burdensome", "severely", "bankrupt", "impractical"] for cue in res.polarity_cues)

def test_neutral_sentiment():
    provider = LocalSentimentProvider()
    res = provider.analyze("The draft has been published for general consultation regarding standard clause definitions.")
    assert res.label == "Neutral"
    assert abs(res.score) < 0.2

def test_mixed_sentiment():
    provider = LocalSentimentProvider()
    res = provider.analyze(
        "While we wholeheartedly welcome the progressive intent of algorithmic audits, "
        "the current disclosure mandate is severely burdensome and will create severe IP risks."
    )
    assert res.label == "Mixed"
    assert len(res.polarity_cues) >= 2

def test_negation_handling():
    provider = LocalSentimentProvider()
    res_negated = provider.analyze("This clause is not commendable and lacks clarity.")
    assert res_negated.label == "Negative"
    assert any("negated" in c or "not" in c or "lack" in c for c in res_negated.polarity_cues)

def test_regression_framework_useful_and_clear_protection():
    provider = LocalSentimentProvider()
    res = provider.analyze("The proposed framework is useful and provides a clear mechanism for protecting consumers.")
    assert res.label == "Positive"
    assert res.score > 0.3
    assert any(cue in ["useful", "clear", "protecting", "protection"] for cue in res.polarity_cues)

def test_regression_beneficial_and_improves_protection():
    provider = LocalSentimentProvider()
    res = provider.analyze("The framework is beneficial and improves consumer protection.")
    assert res.label == "Positive"
    assert res.score > 0.3
    assert any(cue in ["beneficial", "improves", "protection"] for cue in res.polarity_cues)

def test_regression_neutral_statement():
    provider = LocalSentimentProvider()
    res = provider.analyze("The draft has been submitted to the legislative committee for scheduled review next quarter.")
    assert res.label == "Neutral"
    assert res.score == 0.0

def test_regression_negative_statement():
    provider = LocalSentimentProvider()
    res = provider.analyze("The heavy penalties and arbitrary deadlines are severely burdensome for small businesses.")
    assert res.label == "Negative"
    assert res.score < -0.3

def test_regression_mixed_statement():
    provider = LocalSentimentProvider()
    res = provider.analyze("We appreciate the clear consumer protection safeguards, but the 30-day compliance timeline is burdensome.")
    assert res.label == "Mixed"

