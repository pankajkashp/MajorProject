from app.services.dataset_service import dataset_service
from app.services.analysis_service import analysis_service
from app.services.insight_service import insight_service

def test_evidence_linked_insights():
    dataset_service.load_dataset()
    insights = insight_service.refresh_insights()
    
    assert len(insights) > 0
    top_insight = insights[0]
    
    assert top_insight.priority_score > 0
    assert top_insight.priority_level in ["Critical", "High", "Medium", "Low"]
    assert len(top_insight.affected_stakeholders) > 0
    assert len(top_insight.evidence_quotes) > 0
    assert len(top_insight.supporting_comment_ids) > 0
    # Verifiable evidence link check
    for quote in top_insight.evidence_quotes:
        assert quote.comment_id in top_insight.supporting_comment_ids
        assert len(quote.verbatim_text) > 0
