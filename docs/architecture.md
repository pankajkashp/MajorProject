# PolicyLens Architecture & Research Methodology

## 1. Executive Summary

**PolicyLens** is a research prototype for AI-based sentiment analysis and intelligent analysis of public consultation comments received through digital consultation portals (e.g. e-consultation modules).

The system converts unstructured stakeholder submissions into structured, **evidence-linked policy insights**, enabling policymakers to identify regulatory friction points, extract actionable legislative suggestions, gauge consensus across stakeholder groups, and verify every insight against direct comment citations.

---

## 2. Core Research Innovation: Evidence-Linked Policy Insight Layer

Traditional NLP applications in government portals stop at isolated sentiment polarity scores or unsupervised topic models. In legislative drafting, isolated scores provide insufficient justification for statutory amendments.

**PolicyLens implements an Evidence-Linked Policy Insight Layer** combining:
```
Consultation Comments
        ↓
Individual AnalysisResult
  (Sentiment + Topic + Extracted Concerns + Actionable Suggestions)
        ↓
Concern/Suggestion Categorical Aggregation
        ↓
Topic + Sentiment Distribution Synthesis
        ↓
Stakeholder Diversity & Count Matrix
        ↓
Explainable Priority Score (0-100) & Priority Level (HIGH / MEDIUM / LOW)
        ↓
Verifiable Evidence Linkage (Comment IDs + Verbatim Quotes + Author Metadata)
        ↓
Synthesized PolicyInsight
```

### Research Question:
> *"Can an integrated evidence-linked approach provide more actionable policy insights than sentiment-only analysis?"*

---

## 3. Insight Aggregation Methodology

### A. Concern & Suggestion Grouping
Individual extracted concerns and suggestions are grouped by standardized policy categories (e.g., *Compliance Burden*, *Implementation Timeline*, *IP & Confidentiality Risk*, *Proportionality & Penalties*) and action types (e.g., *Timeline Extension*, *Threshold Exemption*, *Statutory Cure Notice*, *Certified Audit Mechanism*).

### B. Frequency & Percentage Calculation
- **Frequency ($f$)**: Count of distinct consultation comments addressing the specific topic/friction area.
- **Frequency Percentage ($f_{\%}$)**: $\frac{f}{N_{\text{total}}} \times 100$, where $N_{\text{total}}$ is the total number of comments in the consultation corpus.

### C. Sentiment Aggregation
- **Distribution**: Count of Positive, Negative, Neutral, and Mixed submissions in the cluster.
- **Dominant Sentiment**: Most frequent polarity classification.
- **Average Sentiment Score**: Mean polarity score ($-1.0$ to $+1.0$).

### D. Stakeholder Diversity Analysis
- **Stakeholder Groups**: Set of unique stakeholder categories raising the issue (e.g., *MSMEs*, *Industry Associations*, *Think Tanks*, *Consumer Groups*).
- **Stakeholder Count ($S_{\text{count}}$)**: Number of distinct categories involved. Multiple submissions from the same group are aggregated to prevent astroturfing bias.
- **Stakeholder Breakdown**: Submissions distribution across categories.

### E. Explainable Priority Formula
Every policy insight receives an empirical priority score ($0-100$):
$$\text{Priority Score} = \min\left(100.0, \; \max\left(10.0, \; S_{\text{sev}} + S_{\text{div}} + S_{\text{freq}} + S_{\text{fric}}\right)\right)$$

Where:
- **Severity Score ($S_{\text{sev}}$)**: $(\text{Critical Count} \times 5.0) + (\text{High Count} \times 3.0)$
- **Stakeholder Diversity Score ($S_{\text{div}}$)**: $S_{\text{count}} \times 5.0$
- **Frequency Score ($S_{\text{freq}}$)**: $f_{\%} \times 0.4$
- **Sentiment Friction Intensity ($S_{\text{fric}}$)**: $\max(0.0, -\text{avg\_sentiment}) \times 30.0$

**Priority Level Mapping**:
- **HIGH**: Priority Score $\ge 60.0$ or $\ge 1$ Critical risk
- **MEDIUM**: Priority Score $\ge 35.0$
- **LOW**: Priority Score $< 35.0$

### F. Evidence Linkage
Every policy insight maintains verifiable citations (`supporting_evidence`) linking back to original `ConsultationComment.id` records, preserving verbatim text, submitter category, entity name, and extracted components.

---

## 4. High-Level Architecture Diagram

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
|   | Routers: /health | /analyze | /dashboard | /comments | /insights | /datasets |
|   +---------------------------------------------------------------------------+   |
|                                          |                                        |
|   +--------------------------------------v------------------------------------+   |
|   |                         Business Service Layer                            |   |
|   |  - AnalysisService: Provider pipeline coordination & error isolation      |   |
|   |  - InsightService: Evidence-linked synthesis & multi-facet filtering     |   |
|   |  - DashboardService: Dynamic aggregate metrics calculation                |   |
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

## 5. Research Limitations & Future Extensions

### Baseline Limitations
1. **Rule-Based Clustering**: Grouping is currently performed by normalized topic and categorical extractions rather than vector embeddings.
2. **Deterministic Priority Weights**: Weights ($5.0, 3.0, 0.4, 30.0$) are calibrated for regulatory consultations; future work will allow policymaker customization.

### Future Extensions
1. **Dense Semantic Clustering**: Replace categorical clustering with dense embeddings (e.g. `all-MiniLM-L6-v2` or `pgvector`).
2. **LLM Provider Plug-ins**: Plug in Gemini / OpenAI / Claude models via `InsightProvider` to generate abstractive policy briefing memos while preserving verbatim evidence citations.
