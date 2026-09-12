from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.analysis import (
    AnalyzeCommentRequest,
    AnalyzeBatchRequest,
    AnalysisResponse,
    BatchAnalysisResponse
)
from app.models.domain import ConsultationComment
from app.services.analysis_service import analysis_service

router = APIRouter()

@router.post("/comment", response_model=AnalysisResponse, summary="Analyze an individual consultation comment")
def analyze_single_comment(payload: AnalyzeCommentRequest):
    try:
        comment_domain = ConsultationComment(
            id=payload.id or "AD-HOC-001",
            comment=payload.comment,
            section=payload.section,
            stakeholder_type=payload.stakeholder_type or "General Stakeholder",
            metadata=payload.metadata
        )
        result = analysis_service.analyze_comment(comment_domain)

        return AnalysisResponse(
            success=True,
            comment_id=result.comment_id,
            sentiment=result.sentiment,
            topic=result.topic,
            concerns=result.concerns,
            suggestions=result.suggestions,
            summary=result.summary,
            processed_at=result.processed_at.isoformat()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.post("/batch", response_model=BatchAnalysisResponse, summary="Analyze a batch of consultation comments")
def analyze_batch_comments(payload: AnalyzeBatchRequest):
    try:
        comment_domains = [
            ConsultationComment(
                id=c.id or f"BATCH-{i+1:03d}",
                comment=c.comment,
                section=c.section,
                stakeholder_type=c.stakeholder_type or "General Stakeholder",
                metadata=c.metadata
            )
            for i, c in enumerate(payload.comments)
        ]

        results = analysis_service.analyze_batch(comment_domains)
        response_items = [
            AnalysisResponse(
                success=True,
                comment_id=r.comment_id,
                sentiment=r.sentiment,
                topic=r.topic,
                concerns=r.concerns,
                suggestions=r.suggestions,
                summary=r.summary,
                processed_at=r.processed_at.isoformat()
            )
            for r in results
        ]

        return BatchAnalysisResponse(
            success=True,
            total_processed=len(response_items),
            results=response_items
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch analysis failed: {str(e)}")
