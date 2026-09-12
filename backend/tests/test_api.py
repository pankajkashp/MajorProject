def test_health_endpoint(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "providers" in data

def test_analyze_comment_endpoint(client):
    payload = {
        "comment": "The proposed 30-day compliance window is severely burdensome for startups. We suggest a 180-day transition period.",
        "section": "Clause 7 - Compliance Timelines",
        "stakeholder_type": "MSME & Startup Sector"
    }
    response = client.post("/api/v1/analyze/comment", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["sentiment"]["label"] == "Negative"
    assert len(data["concerns"]) >= 1
    assert len(data["suggestions"]) >= 1
    assert "headline" in data["summary"]

def test_dashboard_summary_endpoint(client):
    response = client.get("/api/v1/dashboard/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["total_comments"] > 0
    assert "sentiment_distribution" in data
    assert len(data["top_topics"]) > 0

def test_comments_list_endpoint(client):
    response = client.get("/api/v1/comments?page=1&page_size=5")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] > 0
    assert len(data["items"]) <= 5
    assert "analysis" in data["items"][0]

def test_insights_endpoint(client):
    response = client.get("/api/v1/insights")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] > 0
    assert len(data["items"]) > 0
    first_insight = data["items"][0]
    assert "evidence_quotes" in first_insight
