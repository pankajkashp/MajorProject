from typing import Optional
from fastapi import APIRouter, Query, HTTPException
from app.schemas.insight import PolicyInsightResponse, PolicyInsightListResponse
from app.services.insight_service import insight_service

router = APIRouter()

@router.get("", response_model=PolicyInsightListResponse, summary="Get Evidence-Linked Policy Insights")
def list_insights(
    priority_level: Optional[str] = Query(None, description="Filter by priority (Critical, High, Medium, Low)"),
    topic: Optional[str] = Query(None, description="Filter by topic keyword")
):
    insights = insight_service.get_all()

    if priority_level and priority_level.lower() != "all":
        insights = [i for i in insights if i.priority_level.lower() == priority_level.lower()]

    if topic and topic.lower() != "all":
        insights = [i for i in insights if topic.lower() in i.topic.lower()]

    all_insights = insight_service.get_all()
    critical_cnt = sum(1 for i in all_insights if i.priority_level == "Critical")
    high_cnt = sum(1 for i in all_insights if i.priority_level == "High")
    med_cnt = sum(1 for i in all_insights if i.priority_level == "Medium")
    low_cnt = sum(1 for i in all_insights if i.priority_level == "Low")

    response_items = [
        PolicyInsightResponse(
            id=i.id,
            title=i.title,
            topic=i.topic,
            section=i.section,
            priority_level=i.priority_level,
            priority_score=i.priority_score,
            frequency_count=i.frequency_count,
            stakeholder_consensus=i.stakeholder_consensus,
            affected_stakeholders=i.affected_stakeholders,
            concern_summary=i.concern_summary,
            suggestion_summary=i.suggestion_summary,
            evidence_quotes=i.evidence_quotes,
            supporting_comment_ids=i.supporting_comment_ids
        )
        for i in insights
    ]

    return PolicyInsightListResponse(
        total=len(response_items),
        critical_count=critical_cnt,
        high_count=high_cnt,
        medium_count=med_cnt,
        low_count=low_cnt,
        items=response_items
    )

@router.get("/{insight_id}", response_model=PolicyInsightResponse, summary="Get a specific Policy Insight with evidence links")
def get_insight(insight_id: str):
    insight = insight_service.get_by_id(insight_id)
    if not insight:
        raise HTTPException(status_code=404, detail=f"Policy Insight {insight_id} not found")

    return PolicyInsightResponse(
        id=insight.id,
        title=insight.title,
        topic=insight.topic,
        section=insight.section,
        priority_level=insight.priority_level,
        priority_score=insight.priority_score,
        frequency_count=insight.frequency_count,
        stakeholder_consensus=insight.stakeholder_consensus,
        affected_stakeholders=insight.affected_stakeholders,
        concern_summary=insight.concern_summary,
        suggestion_summary=insight.suggestion_summary,
        evidence_quotes=insight.evidence_quotes,
        supporting_comment_ids=insight.supporting_comment_ids
    )
