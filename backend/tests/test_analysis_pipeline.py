from app.models.domain import ConsultationComment, AnalysisResult
from app.services.analysis_service import AnalysisService

def test_single_comment_pipeline_contract():
    service = AnalysisService()
    comment = ConsultationComment(
        id="PL-TEST-001",
        comment="The proposed 30-day compliance timeline in Clause 7 is severely burdensome for startups. We strongly suggest extending the transition period to at least 180 days.",
        section="Clause 7 - Compliance Timelines for MSMEs",
        stakeholder_type="MSME & Startup Sector"
    )

    result = service.analyze_comment(comment)

    assert isinstance(result, AnalysisResult)
    assert result.comment_id == "PL-TEST-001"
    assert result.sentiment.label in ["Negative", "Mixed"]
    assert result.topic.primary_topic == "Compliance Timelines & MSME Impact"
    assert len(result.concerns) >= 1
    assert len(result.suggestions) >= 1
    assert len(result.summary.tl_dr) > 0
    assert result.processed_at is not None

def test_batch_analysis_pipeline():
    service = AnalysisService()
    comments = [
        ConsultationComment(
            id="B-001",
            comment="Local storage in domestic cloud data centers is vital for sovereignty.",
            section="Clause 3 - Data Localization",
            stakeholder_type="Consumer Advocacy"
        ),
        ConsultationComment(
            id="B-002",
            comment="Mandatory algorithmic audits risk leaking intellectual property. We recommend certified audit frameworks.",
            section="Clause 12 - AI Audits",
            stakeholder_type="Legal & Policy Think Tank"
        ),
        ConsultationComment(
            id="B-003",
            comment="General submission with standard remarks.",
            section="Clause 1",
            stakeholder_type="Citizen"
        )
    ]

    results = service.analyze_batch(comments)
    assert len(results) == 3
    assert results[0].comment_id == "B-001"
    assert results[0].sentiment.label == "Positive"
    assert results[1].comment_id == "B-002"
    assert results[1].sentiment.label in ["Mixed", "Negative"]
    assert results[2].comment_id == "B-003"
    assert results[2].sentiment.label == "Neutral"
