from app.models.domain import (
    ConsultationComment,
    AnalysisResult,
    SentimentResult,
    TopicResult,
    ConcernItem,
    SuggestionItem,
    SummaryResult
)
from app.providers.local_insight import EvidenceLinkedInsightEngine

def test_explainable_priority_calculation():
    engine = EvidenceLinkedInsightEngine()

    comment_1 = ConsultationComment(
        id="C1",
        comment="This clause is severely burdensome and will bankrupt startups.",
        section="Clause 7 - Timelines",
        stakeholder_type="MSME & Startup Sector"
    )
    analysis_1 = AnalysisResult(
        comment_id="C1",
        sentiment=SentimentResult(label="Negative", score=-0.8, confidence=0.9),
        topic=TopicResult(primary_topic="Compliance Timelines & MSME Impact", secondary_topics=[], confidence=0.9),
        concerns=[ConcernItem(id="CON-1", text="bankrupt startups", category="Compliance Burden", severity="Critical")],
        suggestions=[SuggestionItem(id="SUG-1", text="extend grace period", action_type="Timeline Extension")],
        summary=SummaryResult(headline="MSME burden", tl_dr="Startups cannot comply", key_takeaways=[])
    )

    comment_2 = ConsultationComment(
        id="C2",
        comment="We urge a 180 day extension to prevent disruption.",
        section="Clause 7 - Timelines",
        stakeholder_type="Industry Association"
    )
    analysis_2 = AnalysisResult(
        comment_id="C2",
        sentiment=SentimentResult(label="Negative", score=-0.6, confidence=0.85),
        topic=TopicResult(primary_topic="Compliance Timelines & MSME Impact", secondary_topics=[], confidence=0.9),
        concerns=[ConcernItem(id="CON-2", text="disruption", category="Compliance Burden", severity="High")],
        suggestions=[SuggestionItem(id="SUG-2", text="180 day extension", action_type="Timeline Extension")],
        summary=SummaryResult(headline="Extension request", tl_dr="Industry asks extension", key_takeaways=[])
    )

    insights = engine.synthesize_insights(
        [comment_1, comment_2],
        {"C1": analysis_1, "C2": analysis_2}
    )

    assert len(insights) == 1
    ins = insights[0]

    # Verify priority formulation
    assert ins.priority_score > 0
    assert ins.priority_breakdown.severity_component > 0
    assert ins.priority_breakdown.stakeholder_diversity_component > 0
    assert ins.priority_breakdown.volume_component > 0
    assert ins.priority_breakdown.negative_friction_component > 0
    assert "Priority score" in ins.priority_explanation
    assert len(ins.evidence_quotes) == 2
    assert "C1" in ins.supporting_comment_ids
    assert "C2" in ins.supporting_comment_ids
