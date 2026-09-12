# PolicyLens Architecture Documentation

## 1. Executive Summary

**PolicyLens** is a research prototype for AI-based sentiment analysis and intelligent analysis of public consultation comments received through digital consultation portals (e.g., e-consultation modules).

The system transforms large volumes of unstructured stakeholder feedback into structured, **evidence-linked policy insights**, enabling policymakers to quickly identify regulatory friction points, extract actionable legislative suggestions, gauge consensus across stakeholder groups, and verify every insight against direct comment citations.

---

## 2. Core Research Hypothesis: Evidence-Linked Policy Insight Layer

Traditional NLP applications stop at sentiment polarity scores or topic modeling. In regulatory contexts, isolated sentiment scores provide insufficient evidence for legislative decisions.

**PolicyLens implements an Evidence-Linked Policy Insight Layer** combining:
- **Linguistic Sentiment**: Polarity, intensity, negation handling, and confidence.
- **Topic & Clause Classification**: Multi-label alignment to specific draft sections/clauses.
- **Granular Concern Extraction**: Detection of operational friction, compliance burden, legal ambiguity, and technical infeasibility.
- **Actionable Proposal Extraction**: Identification of concrete stakeholder remedies (phase-in windows, threshold carve-outs, standardized audit frameworks, statutory cure periods).
- **Frequency & Consensus Modeling**: Cross-stakeholder distribution and divergence analysis.
- **Priority Scoring (0-100)**: Empirical formulation weighting severity, stakeholder diversity, comment frequency, and negative friction.
- **Verbatim Evidence Linking**: Direct trace back to verifiable submission quotes with author metadata.

### Research Question:
> *"Can an integrated evidence-linked approach provide more actionable policy insights than sentiment-only analysis?"*

---

## 3. High-Level Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                Next.js Frontend                                   |
|   +-------------------+  +--------------------+  +----------------------------+   |
|   | Overview Dashboard|  | Comments Explorer  |  | Evidence-Linked Insights   |   |
|   +-------------------+  +--------------------+  +----------------------------+   |
|   +-------------------+  +--------------------+  +----------------------------+   |
|   | Topics Breakdown  |  | Analyze Playground |  | Typed API Client (api.ts)  |   |
|   +-------------------+  +--------------------+  +----------------------------+   |
+------------------------------------------+----------------------------------------+
                                           | HTTP REST / JSON Contracts
+------------------------------------------v----------------------------------------+
|                               FastAPI Application                                 |
|   +---------------------------------------------------------------------------+   |
|   | Routers: /health | /analyze | /dashboard | /comments | /insights          |   |
|   +---------------------------------------------------------------------------+   |
|                                          |                                        |
|   +--------------------------------------v------------------------------------+   |
|   |                         Business Service Layer                            |   |
|   |  - AnalysisService: Pipeline coordination                                 |   |
|   |  - InsightService: Evidence-linked synthesis & priority ranking          |   |
|   |  - DashboardService: Aggregate metric & distribution calculation          |   |
|   |  - DatasetService: Column adapter, schema normalizer, repository          |   |
|   +--------------------------------------+------------------------------------+   |
|                                          |                                        |
|   +--------------------------------------v------------------------------------+   |
|   |                      Modular AI/NLP Providers (ABC)                       |   |
|   |  +-----------------------+ +---------------------+ +--------------------+ |   |
|   |  | SentimentProvider     | | TopicProvider       | | ExtractionProvider | |   |
|   |  +-----------------------+ +---------------------+ +--------------------+ |   |
|   |  +-----------------------+ +---------------------+                        |   |
|   |  | SummarizationProvider | | InsightProvider     |                        |   |
|   |  +-----------------------+ +---------------------+                        |   |
|   +--------------------------------------+------------------------------------+   |
+------------------------------------------+----------------------------------------+
                                           |
+------------------------------------------v----------------------------------------+
|                         Data Normalization & Storage Layer                        |
|  - CSV Data Adapter (Normalizes raw columns into ConsultationComment model)       |
|  - In-memory cache & repository (Ready for PostgreSQL / pgvector plug-in)         |
+-----------------------------------------------------------------------------------+
```

---

## 4. Provider Extensibility & Future Roadmap

All AI/NLP tasks inherit from abstract base classes in `backend/app/providers/base.py`:
- `SentimentProvider` -> `LocalSentimentProvider` (or future BERT / RoBERTa / LLM)
- `TopicProvider` -> `LocalTopicProvider` (or future KeyBERT / BERTopic)
- `ExtractionProvider` -> `LocalExtractionProvider` (or future SpaCy / NER / LLM extractor)
- `SummarizationProvider` -> `LocalSummarizationProvider`
- `InsightProvider` -> `EvidenceLinkedInsightEngine`

This allows zero-downtime swaps of models or cloud LLMs simply by adjusting configuration without rewriting business services or API endpoints.
