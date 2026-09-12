from typing import Optional
from fastapi import APIRouter, Query, HTTPException
from app.schemas.comment import CommentCreate, CommentResponse, CommentListResponse
from app.models.domain import ConsultationComment
from app.services.dataset_service import dataset_service
from app.services.analysis_service import analysis_service

router = APIRouter()

@router.get("", response_model=CommentListResponse, summary="List and filter consultation comments")
def list_comments(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    stakeholder_type: Optional[str] = Query(None, description="Filter by stakeholder group"),
    section: Optional[str] = Query(None, description="Filter by section/clause"),
    sentiment: Optional[str] = Query(None, description="Filter by sentiment (Positive, Negative, Neutral, Mixed)"),
    search: Optional[str] = Query(None, description="Search keyword in text or metadata")
):
    comments = dataset_service.filter_comments(
        stakeholder_type=stakeholder_type,
        section=section,
        search_query=search
    )

    # Attach or run analysis for each comment
    items = []
    for c in comments:
        analysis = analysis_service.get_analysis(c.id)
        if not analysis:
            analysis = analysis_service.analyze_comment(c)

        # Apply sentiment filter if requested
        if sentiment and sentiment.lower() != "all":
            if analysis.sentiment.label.lower() != sentiment.lower():
                continue

        items.append(CommentResponse(
            id=c.id,
            comment=c.comment,
            consultation_id=c.consultation_id,
            section=c.section,
            stakeholder_type=c.stakeholder_type,
            organization_or_individual=c.metadata.get("organization_or_individual"),
            source=c.source,
            language=c.language,
            metadata=c.metadata,
            analysis=analysis
        ))

    total = len(items)
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    paginated_items = items[start_idx:end_idx]

    return CommentListResponse(
        total=total,
        page=page,
        page_size=page_size,
        items=paginated_items
    )

@router.get("/{comment_id}", response_model=CommentResponse, summary="Get a consultation comment by ID with full analysis")
def get_comment(comment_id: str):
    comment = dataset_service.get_by_id(comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail=f"Comment with ID {comment_id} not found")

    analysis = analysis_service.get_analysis(comment_id)
    if not analysis:
        analysis = analysis_service.analyze_comment(comment)

    return CommentResponse(
        id=comment.id,
        comment=comment.comment,
        consultation_id=comment.consultation_id,
        section=comment.section,
        stakeholder_type=comment.stakeholder_type,
        organization_or_individual=comment.metadata.get("organization_or_individual"),
        source=comment.source,
        language=comment.language,
        metadata=comment.metadata,
        analysis=analysis
    )

@router.post("", response_model=CommentResponse, summary="Submit and analyze a new consultation comment")
def create_comment(payload: CommentCreate):
    new_id = payload.id or f"SUB-{len(dataset_service.get_all()) + 1:04d}"
    meta = payload.metadata.copy()
    if payload.organization_or_individual:
        meta["organization_or_individual"] = payload.organization_or_individual

    comment = ConsultationComment(
        id=new_id,
        comment=payload.comment,
        consultation_id=payload.consultation_id,
        section=payload.section,
        stakeholder_type=payload.stakeholder_type,
        source=payload.source or "e-consultation-portal",
        language=payload.language or "en",
        metadata=meta
    )

    dataset_service.add_comment(comment)
    analysis = analysis_service.analyze_comment(comment)

    return CommentResponse(
        id=comment.id,
        comment=comment.comment,
        consultation_id=comment.consultation_id,
        section=comment.section,
        stakeholder_type=comment.stakeholder_type,
        organization_or_individual=payload.organization_or_individual,
        source=comment.source,
        language=comment.language,
        metadata=comment.metadata,
        analysis=analysis
    )
