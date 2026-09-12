# PolicyLens API Specification (v1)

Base URL: `http://localhost:8000/api/v1`

---

## 1. Service Health

### `GET /health`
Returns the status of the backend, dataset load state, and active NLP providers.

**Response `200 OK`:**
```json
{
  "status": "healthy",
  "app": "PolicyLens",
  "version": "0.1.0",
  "environment": "development",
  "dataset_loaded": true,
  "total_records": 35,
  "providers": {
    "sentiment": "local",
    "topic": "local",
    "extraction": "local",
    "summarization": "local",
    "insight": "local"
  }
}
```

---

## 2. On-Demand Analysis

### `POST /analyze/comment`
Analyzes a single public consultation comment on-demand.

**Request Body:**
```json
{
  "comment": "The proposed 30-day compliance timeline in Clause 7 is severely burdensome for startups. We suggest a 180-day transition period.",
  "section": "Clause 7 - Compliance Timelines",
  "stakeholder_type": "MSME & Startup Sector",
  "organization_or_individual": "Small Business Alliance"
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "comment_id": "TEMP-001",
  "sentiment": {
    "label": "Negative",
    "score": -0.85,
    "confidence": 0.92,
    "polarity_cues": ["burdensome", "severely"]
  },
  "topic": {
    "primary_topic": "Compliance Timelines & MSME Impact",
    "secondary_topics": [],
    "confidence": 0.9,
    "key_phrases": ["clause 7", "compliance timelines", "msme"]
  },
  "concerns": [
    {
      "id": "TEMP-001-CON-1",
      "text": "The proposed 30-day compliance timeline in Clause 7 is severely burdensome for startups.",
      "category": "Compliance Burden",
      "severity": "High",
      "text_span": "severely burdensome"
    }
  ],
  "suggestions": [
    {
      "id": "TEMP-001-SUG-1",
      "text": "We suggest a 180-day transition period.",
      "action_type": "Timeline Extension",
      "text_span": "suggest a 180-day transition"
    }
  ],
  "summary": {
    "headline": "Concerns on compliance burden with proposal for timeline extension",
    "tl_dr": "Key friction: The proposed 30-day compliance timeline in Clause 7 is severely burdensome for startups. | Proposed remedy: We suggest a 180-day transition period.",
    "key_takeaways": [
      "Concern: The proposed 30-day compliance timeline in Clause 7 is severely burdensome for startups.",
      "Recommendation: We suggest a 180-day transition period."
    ]
  },
  "processed_at": "2026-09-12T08:00:00.000Z"
}
```

### `POST /analyze/batch`
Analyzes a list of consultation comments in a single batch.

---

## 3. Dashboard Summary

### `GET /dashboard/summary`
Returns high-level aggregate consultation metrics, sentiment distribution, stakeholder representation, top topics, and top priority policy alerts.

---

## 4. Consultation Comments

### `GET /comments`
Returns paginated, searchable, and filtered consultation comments with attached extraction results.

**Query Parameters:**
- `page` (int, default: 1)
- `page_size` (int, default: 20)
- `stakeholder_type` (string, optional)
- `section` (string, optional)
- `sentiment` (string: Positive, Negative, Neutral, Mixed, optional)
- `search` (string, optional)

### `GET /comments/{id}`
Returns a specific consultation comment by ID with full analysis.

---

## 5. Evidence-Linked Policy Insights

### `GET /insights`
Returns synthesized policy insights ranked by explainable priority score ($0-100$).

**Query Parameters:**
- `priority_level` (string: Critical, High, Medium, Low, optional)
- `topic` (string, optional)

### `GET /insights/{id}`
Returns a specific policy insight with full verbatim quotation evidence links.
