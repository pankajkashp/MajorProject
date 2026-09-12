import pytest
import io
from app.services.dataset_service import DatasetAdapter, DatasetService

def test_standard_csv_loading():
    service = DatasetService()
    count = service.load_dataset()
    assert count >= 30
    comments = service.get_all()
    assert len(comments) == count
    assert comments[0].id is not None
    assert len(comments[0].comment) > 0

def test_alternate_column_names_normalization():
    raw_record = {
        "record_id": "ALT-001",
        "feedback": "The compliance period should be longer for non-profits.",
        "policy_ref": "BILL-2026-X",
        "provision": "Section 14(A)",
        "respondent_type": "Civil Society Organization",
        "medium": "email-submission",
        "lang": "en",
        "respondent_name": "Open Society Initiative",
        "custom_metadata_tag": "urgent"
    }

    seen = set()
    comment, errors = DatasetAdapter.normalize_record(raw_record, 1, seen)
    assert errors == []
    assert comment is not None
    assert comment.id == "ALT-001"
    assert comment.comment == "The compliance period should be longer for non-profits."
    assert comment.consultation_id == "BILL-2026-X"
    assert comment.section == "Section 14(A)"
    assert comment.stakeholder_type == "Civil Society Organization"
    assert comment.source == "email-submission"
    assert comment.metadata.get("organization_or_individual") == "Open Society Initiative"
    assert comment.metadata.get("custom_metadata_tag") == "urgent"

def test_missing_required_comment_validation():
    raw_record = {
        "id": "ERR-001",
        "comment": "",  # Empty
        "section": "Clause 1"
    }
    seen = set()
    comment, errors = DatasetAdapter.normalize_record(raw_record, 1, seen)
    assert comment is None
    assert len(errors) == 1
    assert errors[0].field == "comment"
    assert errors[0].error_type == "missing_required_field"

def test_duplicate_id_handling():
    seen = set()
    rec1 = {"id": "DUP-001", "comment": "First valid comment"}
    rec2 = {"id": "DUP-001", "comment": "Second comment with same ID"}

    c1, e1 = DatasetAdapter.normalize_record(rec1, 1, seen)
    c2, e2 = DatasetAdapter.normalize_record(rec2, 2, seen)

    assert c1 is not None
    assert c1.id == "DUP-001"
    assert c2 is not None
    assert c2.id == "DUP-001_dup_2"
    assert len(e2) == 1
    assert e2[0].error_type == "duplicate_id"

def test_csv_bytes_ingestion_and_isolation():
    service = DatasetService()
    baseline_count = len(service.get_all())

    custom_csv = (
        "response_id,text,clause,respondent_type\n"
        "UP-01,Valid feedback on section 4,Clause 4,MSME\n"
        "UP-02,,Clause 5,Industry\n"  # Missing comment
        "UP-03,Another valid submission,Clause 6,Citizen\n"
    ).encode("utf-8")

    result = service.ingest_csv_bytes(custom_csv, "test_upload.csv")

    assert result.rows_received == 3
    assert result.rows_accepted == 2
    assert result.rows_rejected == 1
    assert len(result.validation_errors) == 1
    assert result.validation_errors[0].row_index == 2
    assert len(result.preview) == 2

    # Verify default dataset was NOT modified (Isolation)
    assert len(service.get_all()) == baseline_count

def test_malformed_csv_handling():
    service = DatasetService()
    malformed_csv = b"\x00\x01\x02\x03\xff\xfe"
    result = service.ingest_csv_bytes(malformed_csv, "corrupt.csv")
    assert result.rows_accepted == 0
    assert len(result.validation_errors) >= 1
