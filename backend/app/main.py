from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import setup_logging, logger
from app.api.v1.router import api_router
from app.services.dataset_service import dataset_service
from app.services.insight_service import insight_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    setup_logging()
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION} in {settings.ENVIRONMENT} mode...")
    
    # Pre-load dataset and synthesize initial research baseline
    try:
        loaded_count = dataset_service.load_dataset()
        logger.info(f"Loaded dataset: {loaded_count} stakeholder consultation comments.")
        insight_service.refresh_insights()
        logger.info("Synthesized initial evidence-linked policy insights.")
    except Exception as e:
        logger.error(f"Error during baseline initialization: {e}")

    yield

    # Shutdown
    logger.info(f"Shutting down {settings.APP_NAME}...")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Research Prototype: AI-Based Sentiment Analysis & Intelligent Analysis of Public Consultation Feedback",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/", tags=["Root"])
def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "active",
        "description": "AI-Based Sentiment Analysis & Intelligent Analysis of Public Consultation Feedback",
        "docs": f"{settings.API_V1_STR}/docs",
        "health": f"{settings.API_V1_STR}/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.BACKEND_HOST,
        port=settings.BACKEND_PORT,
        reload=settings.DEBUG
    )
