from fastapi import APIRouter, UploadFile, File, HTTPException
from app.schemas.dataset import DatasetUploadResponse
from app.services.dataset_service import dataset_service

router = APIRouter()

@router.post("/upload", response_model=DatasetUploadResponse, summary="Upload, validate, and normalize a CSV consultation dataset")
async def upload_dataset(file: UploadFile = File(...)):
    if not file.filename.lower().endswith((".csv", ".txt")):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file format '{file.filename}'. Only CSV files (.csv) are supported."
        )

    try:
        content = await file.read()
        if len(content) == 0:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        response = dataset_service.ingest_csv_bytes(content=content, filename=file.filename)
        return response
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process CSV upload: {str(e)}")
