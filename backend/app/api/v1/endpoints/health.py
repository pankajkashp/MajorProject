from fastapi import APIRouter
from app.core.config import settings
from app.services.dataset_service import dataset_service

router = APIRouter()

@router.get("/health", summary="Service Health & Provider Status")
def get_health():
    comments_count = len(dataset_service.get_all())
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "dataset_loaded": comments_count > 0,
        "total_records": comments_count,
        "providers": {
            "sentiment": settings.SENTIMENT_PROVIDER,
            "topic": settings.TOPIC_PROVIDER,
            "extraction": settings.EXTRACTION_PROVIDER,
            "summarization": settings.SUMMARIZATION_PROVIDER,
            "insight": settings.INSIGHT_PROVIDER
        }
    }
