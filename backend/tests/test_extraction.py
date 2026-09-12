from app.providers.local_extraction import LocalExtractionProvider

def test_concern_extraction_with_text_spans():
    provider = LocalExtractionProvider()
    text = (
        "Clause 3 mandates local storage which will exponentially escalate infrastructure costs for small entities. "
        "There is severe risk of trade friction."
    )
    concerns, suggestions = provider.extract(text, "TEST-CON-1")
    
    assert len(concerns) >= 1
    c1 = concerns[0]
    assert c1.category in ["Cost Inflation", "Market & Trade Friction", "Compliance Burden"]
    assert c1.text_span is not None
    assert len(c1.text_span) > 0
    assert c1.text_span.lower() in text.lower()

def test_suggestion_extraction_with_action_types():
    provider = LocalExtractionProvider()
    text = "We strongly suggest extending the transition period to at least 180 days with a phase-in approach."
    concerns, suggestions = provider.extract(text, "TEST-SUG-1")

    assert len(suggestions) >= 1
    s1 = suggestions[0]
    assert s1.action_type == "Timeline Extension"
    assert s1.text_span is not None
    assert "suggest extending" in s1.text_span.lower() or "extend" in s1.text_span.lower()

def test_no_fabrication_on_neutral_text():
    provider = LocalExtractionProvider()
    neutral_text = "This document is submitted on behalf of the working committee as part of the public review process."
    concerns, suggestions = provider.extract(neutral_text, "TEST-NEU-1")

    # Strictly no fabricated concerns or suggestions
    assert len(concerns) == 0
    assert len(suggestions) == 0

def test_concern_and_suggestion_coexistence():
    provider = LocalExtractionProvider()
    text = (
        "The proposed penalty of up to 4% of global turnover is disproportionately punitive. "
        "We advise introducing a statutory cure notice period of 45 days."
    )
    concerns, suggestions = provider.extract(text, "TEST-BOTH-1")

    assert len(concerns) >= 1
    assert any(c.severity == "Critical" for c in concerns)
    assert len(suggestions) >= 1
    assert any(s.action_type == "Statutory Cure Notice" for s in suggestions)
