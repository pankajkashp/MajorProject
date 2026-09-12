import pandas as pd
from app.services.dataset_service import DatasetService

def test_dataset_normalization():
    service = DatasetService()
    sample_row = pd.Series({
        "submission_id": "SUB-999",
        "comment_text": "This clause needs clearer language for developers.",
        "consultation_ref": "CONS-2026-TEST",
        "section_clause": "Clause 4 - Definitions",
        "stakeholder_category": "Individual Citizen",
        "channel": "web-portal",
        "organization_or_individual": "Jane Doe"
    })

    comment = service.normalize_row_to_comment(sample_row)
    assert comment.id == "SUB-999"
    assert comment.comment == "This clause needs clearer language for developers."
    assert comment.section == "Clause 4 - Definitions"
    assert comment.stakeholder_type == "Individual Citizen"
    assert comment.metadata.get("organization_or_individual") == "Jane Doe"
