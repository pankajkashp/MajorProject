# PolicyLens — AI-Based E-Consultation Intelligence Platform
### 40% Research Prototype Milestone

PolicyLens is an AI-powered research prototype designed to convert large volumes of unstructured public consultation feedback received through digital e-consultation modules into structured, **evidence-linked policy insights**.

---

## 1. Research Core: Evidence-Linked Policy Insight Layer

Traditional NLP in public consultation stops at broad sentiment classification or unsupervised topic clusters. In policy drafting, isolated sentiment scores provide insufficient evidence for legislative decisions.

**PolicyLens implements an Evidence-Linked Policy Insight Layer** combining:
$$\text{Priority Score} = \min\left(100.0, \; (\text{Severity} \times 3.5) + (\text{Stakeholder Diversity} \times 4.0) + (\text{Volume} \times 3.0) + (\text{Negative Friction} \times 25.0)\right)$$

Every policy recommendation generated is directly backed by verifiable, verbatim quotation citations from submitted stakeholder comments.

---

## 2. Technology Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Recharts, Lucide Icons.
- **Backend**: Python 3.13, FastAPI, Pydantic v2, pandas, pytest, httpx.
- **Data Layer**: Flexible Dataset Adapter normalizer (`DatasetService`) loading synthetic consultation feedback.
- **AI/NLP Layer**: Modular Provider Architecture (`SentimentProvider`, `TopicProvider`, `ExtractionProvider`, `SummarizationProvider`, `InsightProvider`) using local heuristic and rule-based engines (zero mandatory external API keys).

---

## 3. Quick Start & Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+

### Step 1: Clone and Configure Environment
```bash
cp .env.example .env
```

### Step 2: Start the Backend (FastAPI)
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python3 app/main.py
```
- API Docs: `http://localhost:8000/api/v1/docs`
- Health Check: `http://localhost:8000/api/v1/health`

### Step 3: Start the Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
- Web Application: `http://localhost:3000`

### Step 4: Run Automated Tests
```bash
cd backend
./.venv/bin/pytest tests
```

---

## 4. Primary Pages Implemented

1. **Overview (`/`)**: High-level consultation metrics, sentiment distribution, stakeholder stance matrix, top regulatory topics, and urgent policy alerts.
2. **Comments Explorer (`/comments`)**: Searchable and filterable consultation submissions with inspection drawer for granular extractions.
3. **Evidence-Linked Insights (`/insights`)**: Ranked policy insights with explainable priority scores and verifiable quotation citations.
4. **Topics Breakdown (`/topics`)**: Clause-by-clause feedback density, sentiment polarity, and friction exposure.
5. **Analyze Playground (`/analyze`)**: Interactive tool to submit any consultation comment and test the real-time AI/NLP extraction pipeline.

---

## 5. Baseline Research Evaluation Results

On our labeled benchmark evaluation dataset (`data/samples/labeled_evaluation_dataset.json`):
- **Sentiment Classification Accuracy**: `87.5%`
- **Topic Classification Accuracy**: `87.5%`
- **Concern Detection Accuracy**: `100.0%`
- **Suggestion Detection Accuracy**: `100.0%`

*Note: Baseline performance measured using explainable local heuristic and lexicon-based NLP methods.*

---

## 6. Current Scope Limitations & Future Roadmap

**Milestone 1 Scope Exclusions (Intentionally Deferred):**
- Database persistence with PostgreSQL / SQLAlchemy
- Cloud deployment (Docker, Kubernetes, AWS)
- External LLM API adapters (OpenAI / Gemini / Anthropic)
- Authentication and access control
- Real-time MCA portal live synchronization
