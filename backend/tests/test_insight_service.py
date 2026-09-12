import pytest
from app.services.dataset_service import dataset_service
from app.services.analysis_service import analysis_service
from app.services.insight_service import insight_service

def test_evidence_linked_insights_synthesis_and_fields():
    dataset_service.load_dataset()
    insights = insight_service.refresh_insights()
    
    assert len(insights) > 0
    top_insight = insights[0]
    
    # Field existence & validity
    assert top_insight.id.startswith("INS-2026-")
    assert len(top_insight.title) > 0
    assert len(top_insight.topic) > 0
    assert len(top_insight.concern) > 0
    assert len(top_insight.suggestion) > 0
    assert top_insight.frequency > 0
    assert 0 < top_insight.frequency_percentage <= 100
    
    # Sentiment aggregation
    assert top_insight.dominant_sentiment in ["Positive", "Negative", "Neutral", "Mixed"]
    assert -1.0 <= top_insight.average_sentiment_score <= 1.0
    assert len(top_insight.sentiment_distribution) > 0

    # Stakeholder analysis
    assert top_insight.stakeholder_count == len(top_insight.stakeholder_groups)
    assert top_insight.stakeholder_count > 0
    assert len(top_insight.stakeholder_breakdown) == top_insight.stakeholder_count
    
    # Priority formulation
    assert 0 <= top_insight.priority_score <= 100
    assert top_insight.priority_level in ["HIGH", "MEDIUM", "LOW"]
    assert top_insight.priority_factors.severity_score >= 0
    assert top_insight.priority_factors.stakeholder_diversity_score >= 0
    assert top_insight.priority_factors.frequency_score >= 0
    assert top_insight.priority_factors.sentiment_intensity_score >= 0
    assert len(top_insight.priority_explanation) > 0

    # Evidence linkage verification
    assert len(top_insight.supporting_comment_ids) == top_insight.frequency
    assert len(top_insight.supporting_evidence) > 0
    for quote in top_insight.supporting_evidence:
        assert quote.comment_id in top_insight.supporting_comment_ids
        assert len(quote.verbatim_text) > 0
        assert quote.stakeholder_type is not None

def test_insight_filtering_by_priority():
    insights = insight_service.get_all(priority="HIGH")
    for ins in insights:
        assert ins.priority_level == "HIGH"

def test_insight_filtering_by_topic():
    insights = insight_service.get_all(topic="Compliance Timelines")
    for ins in insights:
        assert "Compliance Timelines" in ins.topic

def test_insight_filtering_by_stakeholder():
    insights = insight_service.get_all(stakeholder="MSME")
    for ins in insights:
        assert any("MSME" in s for s in ins.stakeholder_groups)

def test_insight_filtering_by_sentiment():
    insights = insight_service.get_all(sentiment="Negative")
    for ins in insights:
        assert ins.dominant_sentiment == "Negative" or "Negative" in ins.sentiment_distribution
