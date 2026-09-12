from app.providers.local_extraction import LocalExtractionProvider

def test_concern_and_suggestion_extraction():
    provider = LocalExtractionProvider()
    text = (
        "Clause 3 will exponentially escalate infrastructure costs for small entities. "
        "We strongly suggest extending the transition period to at least 180 days with a tiered phase-in approach."
    )
    concerns, suggestions = provider.extract(text, "TEST-100")
    
    assert len(concerns) >= 1
    assert any("Cost" in c.category or "Compliance" in c.category or "escalate" in c.text.lower() for c in concerns)
    
    assert len(suggestions) >= 1
    assert any(s.action_type in ["Extension", "Timeline Extension", "Proposal"] for s in suggestions)
