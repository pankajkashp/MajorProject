from typing import Optional
from fastapi import APIRouter, Query, HTTPException
from app.schemas.insight import PolicyInsightResponse, PolicyInsightListResponse
from app.services.insight_service import insight_service

router = APIRouter()

@router.get("", response_model=PolicyInsightListResponse, summary="Get Evidence-Linked Policy Insights")
def list_insights(
    priority: Optional[str] = Query(None, description="Filter by priority (HIGH, MEDIUM, LOW)"),
    topic: Optional[str] = Query(None, description="Filter by topic keyword"),
    stakeholder: Optional[str] = Query(None, description="Filter by affected stakeholder group"),
    sentiment: Optional[str] = Query(None, description="Filter by dominant sentiment (Positive, Negative, Neutral, Mixed)")
):
    filtered_insights = insight_service.get_all(
        priority=priority,
        topic=topic,
        stakeholder=stakeholder,
        sentiment=sentiment
    )

    all_insights = insight_service.get_all()
    high_cnt = sum(1 for i in all_insights if i.priority_level == "HIGH")
    med_cnt = sum(1 for i in all_insights if i.priority_level == "MEDIUM")
    low_cnt = sum(1 for i in all_insights if i.priority_level == "LOW")

    response_items = [
        PolicyInsightResponse(
            id=i.id,
            title=i.title,
            topic=i.topic,
            section=i.section,
            concern=i.concern,
            suggestion=i.suggestion,
            frequency=i.frequency,
            frequency_percentage=i.frequency_percentage,
            sentiment_distribution=i.sentiment_distribution,
            dominant_sentiment=i.dominant_sentiment,
            average_sentiment_score=i.average_sentiment_score,
            stakeholder_groups=i.stakeholder_groups,
            stakeholder_count=i.stakeholder_count,
            stakeholder_breakdown=i.stakeholder_breakdown,
            stakeholder_consensus=i.stakeholder_consensus,
            priority_score=i.priority_score,
            priority_level=i.priority_level,
            priority_factors=i.priority_factors,
            priority_explanation=i.priority_explanation,
            supporting_comment_ids=i.supporting_comment_ids,
            supporting_evidence=i.supporting_evidence
        )
        for i in filtered_insights
    ]

    return PolicyInsightListResponse(
        total=len(response_items),
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
        concern=insight.concern,
        suggestion=insight.suggestion,
        frequency=insight.frequency,
        frequency_percentage=insight.frequency_percentage,
        sentiment_distribution=insight.sentiment_distribution,
        dominant_sentiment=insight.dominant_sentiment,
        average_sentiment_score=insight.average_sentiment_score,
        stakeholder_groups=insight.stakeholder_groups,
        stakeholder_count=insight.stakeholder_count,
        stakeholder_breakdown=insight.stakeholder_breakdown,
        stakeholder_consensus=insight.stakeholder_consensus,
        priority_score=insight.priority_score,
        priority_level=insight.priority_level,
        priority_factors=insight.priority_factors,
        priority_explanation=insight.priority_explanation,
        supporting_comment_ids=insight.supporting_comment_ids,
        supporting_evidence=insight.supporting_evidence
    )
