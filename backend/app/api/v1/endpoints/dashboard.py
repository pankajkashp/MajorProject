from fastapi import APIRouter
from app.schemas.dashboard import DashboardSummaryResponse
from app.services.dashboard_service import dashboard_service

router = APIRouter()

@router.get("/summary", response_model=DashboardSummaryResponse, summary="Get high-level dashboard metrics and aggregations")
def get_dashboard_summary():
    return dashboard_service.get_summary()
