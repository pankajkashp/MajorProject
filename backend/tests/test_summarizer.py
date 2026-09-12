from app.providers.local_summarizer import LocalSummarizationProvider
from app.models.domain import ConcernItem, SuggestionItem

def test_short_comment_summarization():
    provider = LocalSummarizationProvider()
    short_text = "We support the clause."
    summary = provider.summarize(short_text, [], [])
    assert summary.headline == short_text
    assert summary.tl_dr == short_text

def test_structured_policy_summarization():
    provider = LocalSummarizationProvider()
    full_text = (
        "The proposed 30-day compliance timeline in Clause 7 is severely burdensome for seed-stage startups and MSMEs with limited legal and compliance teams. "
        "We strongly suggest extending the transition period to at least 180 days with a tiered phase-in approach based on turnover, which will prevent disproportionate operational disruption."
    )
    concerns = [
        ConcernItem(id="C1", text="severely burdensome for seed-stage startups", category="Compliance Burden", severity="High")
    ]
    suggestions = [
        SuggestionItem(id="S1", text="extending the transition period to at least 180 days", action_type="Timeline Extension")
    ]

    summary = provider.summarize(full_text, concerns, suggestions)
    assert "compliance burden" in summary.headline.lower() or "timeline extension" in summary.headline.lower()
    assert "Issue:" in summary.tl_dr
    assert "Proposed Remedy:" in summary.tl_dr
    assert len(summary.key_takeaways) >= 2
