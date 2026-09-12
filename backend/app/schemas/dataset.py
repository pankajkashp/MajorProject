from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from app.schemas.comment import CommentResponse

class IngestionValidationError(BaseModel):
    row_index: int
    field: str
    error_type: str
    message: str

class DatasetUploadResponse(BaseModel):
    filename: str
    rows_received: int
    rows_accepted: int
    rows_rejected: int
    validation_errors: List[IngestionValidationError]
    preview: List[CommentResponse]
