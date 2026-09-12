import io

def test_dataset_upload_endpoint_success(client):
    csv_content = (
        "submission_id,comment_text,section_clause,stakeholder_category\n"
        "C-01,Extending the phase-in schedule is critical.,Clause 7,MSME\n"
        "C-02,Clear dispute guidelines are requested.,Clause 15,Consumer\n"
    ).encode("utf-8")

    files = {
        "file": ("consultation_batch.csv", io.BytesIO(csv_content), "text/csv")
    }

    response = client.post("/api/v1/datasets/upload", files=files)
    assert response.status_code == 200
    data = response.json()
    assert data["filename"] == "consultation_batch.csv"
    assert data["rows_received"] == 2
    assert data["rows_accepted"] == 2
    assert data["rows_rejected"] == 0
    assert len(data["validation_errors"]) == 0
    assert len(data["preview"]) == 2

def test_dataset_upload_endpoint_invalid_format(client):
    files = {
        "file": ("data.pdf", io.BytesIO(b"fake-pdf-content"), "application/pdf")
    }
    response = client.post("/api/v1/datasets/upload", files=files)
    assert response.status_code == 400
    assert "Only CSV files" in response.json()["detail"]
