import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore"
    )

    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    APP_NAME: str = "PolicyLens"
    APP_VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"

    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PORT: int = 8000
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ]

    DEFAULT_DATASET_PATH: str = Field(
        default=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "../data/samples/consultation_demo_dataset.csv")
    )
    DATASET_ENCODING: str = "utf-8"

    SENTIMENT_PROVIDER: str = "local"
    TOPIC_PROVIDER: str = "local"
    EXTRACTION_PROVIDER: str = "local"
    SUMMARIZATION_PROVIDER: str = "local"
    INSIGHT_PROVIDER: str = "local"

settings = Settings()
