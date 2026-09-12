from fastapi import APIRouter
from app.api.v1.endpoints import health, analysis, dashboard, comments, insights

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(analysis.router, prefix="/analyze", tags=["Analysis"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(comments.router, prefix="/comments", tags=["Comments"])
api_router.include_router(insights.router, prefix="/insights", tags=["Insights"])
